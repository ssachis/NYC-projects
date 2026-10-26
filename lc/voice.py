import json, os, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
os.makedirs('lc/out', exist_ok=True)
for i, t in enumerate(json.load(open('lc/lines.json')), 1):
    a, sr = k.create(t, voice='af_heart', speed=1.05, lang='en-us')
    sf.write(f'lc/out/v{i:02d}.wav', a, sr); print(i, round(len(a) / sr, 2))
