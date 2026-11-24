"""Encode genuine recorded chapters with their measured narration; intermediates stay outside Git."""
import argparse
import json
from pathlib import Path
import subprocess
import wave

parser = argparse.ArgumentParser()
parser.add_argument('work', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
timeline = json.loads((args.work / 'timeline.json').read_text())
parts = []
for chapter in timeline:
    record = json.loads((args.work / ('recording-' + chapter['id'] + '.json')).read_text())
    target = args.work / (chapter['id'] + '.mp4')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y', '-ss', str(record['leadIn']),
                    '-i', record['raw'], '-i', str(args.work / (chapter['id'] + '-narration.wav')),
                    '-t', str(chapter['duration']), '-map', '0:v:0', '-map', '1:a:0',
                    '-vf', 'fps=24,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1',
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '64k', '-ac', '1', '-af', 'loudnorm=I=-18:TP=-1.5:LRA=9',
                    '-movflags', '+faststart', str(target)], check=True)
    parts.append(target)
    print('Encoded', chapter['id'], flush=True)
concat = args.work / 'concat.txt'
concat.write_text(''.join(f"file '{part.as_posix()}'\n" for part in parts))
target = root / 'public/media/website-tour/walkthrough.mp4'
# Encode audio once from continuous PCM, avoiding AAC encoder-delay seams at chapter cuts.
audio_path = args.work / 'full-narration.wav'
with wave.open(str(audio_path), 'wb') as output:
    for index, chapter in enumerate(timeline):
        with wave.open(str(args.work / (chapter['id'] + '-narration.wav'))) as source:
            if index == 0:
                output.setparams(source.getparams())
            output.writeframes(source.readframes(source.getnframes()))
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y', '-f', 'concat', '-safe', '0', '-i', str(concat),
                '-i', str(audio_path), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                '-c:a', 'aac', '-b:a', '64k', '-ac', '1', '-af', 'loudnorm=I=-18:TP=-1.5:LRA=9',
                '-t', str(timeline[-1]['end']), '-movflags', '+faststart', str(target)], check=True)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y', '-ss', '1', '-i', str(target),
                '-frames:v', '1', '-quality', '85', str(root / 'public/media/website-tour/poster.webp')], check=True)
print('Playable MP4:', target, target.stat().st_size, 'bytes')
