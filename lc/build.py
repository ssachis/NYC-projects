import json, subprocess
t = json.load(open('lc/timeline.json')); fr = t['frames']; end = t['now'] - .2
with open('lc/list.txt', 'w') as f:
    for i, x in enumerate(fr):
        nx = fr[i+1]['ts'] if i + 1 < len(fr) else end
        f.write(f"file 'frames/{x['file']}'\nduration {max(.001, nx - x['ts']):.4f}\n")
    f.write(f"file 'frames/{fr[-1]['file']}'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'lc/list.txt', '-vf', 'fps=30,format=yuv420p',
                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', 'lc/out/raw.mp4'], check=True)
json.dump({'t0': fr[0]['ts'], 'marks': t['marks']}, open('lc/out/marks.json', 'w'), indent=1)
