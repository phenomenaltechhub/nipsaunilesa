"""Offline production only. See docs/WEBSITE_TOUR.md for pinned tools and licences."""
import argparse
import json
import math
from pathlib import Path
import textwrap
import wave

import numpy as np
import sherpa_onnx

parser = argparse.ArgumentParser()
parser.add_argument("model", type=Path)
parser.add_argument("work", type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
script = json.loads((root / "scripts/website-tour/narration.json").read_text())
args.work.mkdir(parents=True, exist_ok=True)
public = root / "public/media/website-tour"
public.mkdir(parents=True, exist_ok=True)
model = sherpa_onnx.OfflineTtsVitsModelConfig(
    model=str(next(args.model.glob("*.onnx"))),
    tokens=str(args.model / "tokens.txt"), data_dir=str(args.model / "espeak-ng-data"))
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(
    model=sherpa_onnx.OfflineTtsModelConfig(vits=model, num_threads=2, provider="cpu"),
    max_num_sentences=1))

def stamp(seconds):
    ms = round(seconds * 1000)
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02}.{ms % 1000:03}"

def write_wave(path, samples, rate):
    with wave.open(str(path), "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(rate)
        out.writeframes((np.clip(samples, -1, 1) * 32767).astype("<i2").tobytes())

timeline, subtitles, transcript = [], ["WEBVTT", ""], ["NIPSA UNILESA — Website Tour", "Recorded from corrected website source " + script["recordedSourceCommit"], "Verified 24 November 2026", ""]
clock = 0
for chapter in script["chapters"]:
    start, chapter_samples, cues = clock, [], []
    transcript.extend([chapter["title"], ""])
    for cue in chapter["cues"]:
        cache = args.work / (cue["action"] + ".wav")
        if cache.exists() and cache.stat().st_size > 44:
            with wave.open(str(cache)) as stored:
                rate = stored.getframerate()
                samples = np.frombuffer(stored.readframes(stored.getnframes()), dtype="<i2").astype(np.float32) / 32768
        else:
            audio = tts.generate(cue["text"], sid=0, speed=1.02)
            rate, samples = audio.sample_rate, np.asarray(audio.samples)
            if rate <= 0 or not len(samples):
                raise RuntimeError("Narration produced no audio: " + cue["action"])
            write_wave(cache, samples, rate)
        duration = len(samples) / rate
        slot = max(cue["minSeconds"], math.ceil((duration + 1.1) * 2) / 2)
        lead = .3
        padded = np.concatenate((np.zeros(round(lead * rate)), samples, np.zeros(max(0, round((slot - duration - lead) * rate)))))
        chapter_samples.append(padded)
        # Cue boundaries come from measured speech samples, not estimated reading speed.
        subtitles.extend([f"{stamp(clock + lead)} --> {stamp(clock + lead + duration)}",
                          textwrap.fill(cue["text"], 52), ""])
        cues.append({**cue, "start": round(clock - start, 3), "duration": slot, "speechSeconds": round(duration, 3)})
        transcript.extend([cue["text"], ""])
        clock += slot
    write_wave(args.work / (chapter["id"] + "-narration.wav"), np.concatenate(chapter_samples), rate)
    timeline.append({**chapter, "start": start, "end": clock, "duration": clock - start, "cues": cues})
    print(chapter["id"], round(clock - start, 2), "seconds", flush=True)

(args.work / "timeline.json").write_text(json.dumps(timeline, indent=2) + "\n")
(public / "captions.vtt").write_text("\n".join(subtitles))
(public / "transcript.txt").write_text("\n".join(transcript))
media = {"verifiedOn": script["verifiedOn"], "sourceCommit": script["recordedSourceCommit"], "durationSeconds": clock,
         "src": "/media/website-tour/walkthrough.mp4", "poster": "/media/website-tour/poster.webp", "captions": "/media/website-tour/captions.vtt",
         "chapters": [{"id": c["id"], "title": c["title"], "path": c["path"], "start": c["start"], "end": c["end"], "paragraphs": [cue["text"] for cue in c["cues"]]} for c in timeline]}
(root / "app/website-tour/media.json").write_text(json.dumps(media, indent=2) + "\n")
print("Total", clock, "seconds")
