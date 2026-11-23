# Reads narration/<name>.txt and writes one WAV per non-empty line to narration/out/<name>-NN.wav (Kokoro TTS).
import sys, pathlib, numpy as np, soundfile as sf
from kokoro import KPipeline
name, voice, speed = sys.argv[1], sys.argv[2], float(sys.argv[3])
lines = [l.strip() for l in pathlib.Path(f"narration/{name}.txt").read_text().splitlines() if l.strip()]
out = pathlib.Path("narration/out"); out.mkdir(parents=True, exist_ok=True)
pipe = KPipeline(lang_code="a")
for i, line in enumerate(lines, 1):
    audio = np.concatenate([np.asarray(a) for _, _, a in pipe(line, voice=voice, speed=speed)])
    sf.write(out / f"{name}-{i:02d}.wav", audio, 24000)
    print(i, round(len(audio) / 24000, 2), line)
