"""Encode genuine recorded chapters with their measured narration; intermediates stay outside Git."""
import argparse
import json
from pathlib import Path
import subprocess
import wave
import hashlib

parser = argparse.ArgumentParser()
parser.add_argument('work', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
timeline = json.loads((args.work / 'timeline.json').read_text())
editing = json.loads((root / 'scripts/website-tour/editing.json').read_text())

def focus_filter(chapter):
    ranges = editing['chapters'].get(chapter['id'], [])
    zoom, x, y = '1', '0', '0'
    previous_end = 0
    for focus in reversed(ranges):
        start, end = round(focus['start'] * 24), round(focus['end'] * 24)
        cx, cy = focus['center']
        assert 0 <= focus['start'] < focus['end'] <= chapter['duration']
        assert 1 <= focus['zoom'] <= 2.5 and 0 <= cx <= 1280 and 0 <= cy <= 720
        envelope = f'min(1,min(max(0,(on-{start})/12),max(0,({end}-on)/12)))'
        zoom = f"if(between(on,{start},{end}),1+{focus['zoom'] - 1}*{envelope},{zoom})"
        x = f'if(between(on,{start},{end}),max(0,min(iw-iw/zoom,{cx}-iw/(2*zoom))),{x})'
        y = f'if(between(on,{start},{end}),max(0,min(ih-ih/zoom,{cy}-ih/(2*zoom))),{y})'
    for focus in ranges:
        assert focus['start'] >= previous_end, 'Camera ranges must not overlap'
        previous_end = focus['end']
    return f"zoompan=z='{zoom}':x='{x}':y='{y}':d=1:s=1280x720:fps=24" if ranges else ''

parts = []
for chapter in timeline:
    record = json.loads((args.work / ('recording-' + chapter['id'] + '.json')).read_text())
    target = args.work / (chapter['id'] + '.mp4')
    filters = ['setpts=PTS-STARTPTS', 'fps=24', 'scale=1280:720:force_original_aspect_ratio=decrease:flags=lanczos', 'pad=1280:720:(ow-iw)/2:(oh-ih)/2', 'setsar=1']
    if camera := focus_filter(chapter):
        filters.append(camera)
    # Screencast encoders may finish a few frames before the wall-clock stop.
    # Hold the final genuine frame to fill the exact slot, avoiding cumulative
    # visual drift against the continuous, unchanged narration and captions.
    filters.append('tpad=stop_mode=clone:stop_duration=2')
    filters.append('setpts=N/(24*TB)')
    frame_count = round(chapter['duration'] * 24)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y', '-ss', str(record['leadIn']),
                    '-i', record['raw'], '-map', '0:v:0', '-an',
                    '-vf', ','.join(filters), '-frames:v', str(frame_count), '-r', '24', '-fps_mode', 'cfr',
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '26', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', str(target)], check=True)
    part_probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration,nb_frames', '-of', 'json', str(target)]))['streams'][0]
    assert int(part_probe['nb_frames']) == frame_count, 'Recording is too short to fill its approved chapter slot'
    assert abs(float(part_probe['duration']) - chapter['duration']) < .001
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
                '-c:a', 'aac', '-profile:a', 'aac_low', '-b:a', '64k', '-ac', '1',
                '-af', 'loudnorm=I=-18:TP=-1.5:LRA=9', '-ar', '48000',
                '-t', str(timeline[-1]['end']), '-movflags', '+faststart', str(target)], check=True)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y', '-ss', '1', '-i', str(target),
                '-frames:v', '1', '-quality', '85', str(root / 'public/media/website-tour/poster.webp')], check=True)
print('Playable MP4:', target, target.stat().st_size, 'bytes')
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(target)]))
video = next(stream for stream in probe['streams'] if stream['codec_type'] == 'video')
audio = next(stream for stream in probe['streams'] if stream['codec_type'] == 'audio')
assert audio['codec_name'] == 'aac' and audio['profile'] == 'LC' and int(audio['sample_rate']) == 48000
assert abs(float(probe['format']['duration']) - timeline[-1]['end']) < .05
assert abs(float(video['duration']) - timeline[-1]['end']) < .001
assert int(video['nb_frames']) == round(timeline[-1]['end'] * 24)
encoding = {'videoCodec': video['codec_name'], 'videoProfile': video['profile'], 'width': video['width'], 'height': video['height'],
            'frameRate': video['r_frame_rate'], 'videoDurationSeconds': float(video['duration']), 'videoFrames': int(video['nb_frames']),
            'audioCodec': audio['codec_name'], 'audioProfile': audio['profile'],
            'audioSampleRateHz': int(audio['sample_rate']), 'audioChannels': audio['channels'],
            'durationSeconds': float(probe['format']['duration']), 'bytes': target.stat().st_size,
            'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
manifest_path = root / 'app/website-tour/media.json'
manifest = json.loads(manifest_path.read_text())
manifest['encoding'] = encoding
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
metadata = {'sourceCommit': manifest['sourceCommit'], 'encoding': encoding, 'chapters': manifest['chapters'], 'cameraEmphasis': editing['chapters'],
            'captionsSha256': hashlib.sha256((root / 'public' / manifest['captions'].lstrip('/')).read_bytes()).hexdigest(),
            'transcriptSha256': hashlib.sha256((root / 'public/media/website-tour/transcript.txt').read_bytes()).hexdigest()}
(root / 'docs/website-tour-review/media-metadata.json').write_text(json.dumps(metadata, indent=2) + '\n')
