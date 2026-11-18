"""Genera la voz de un guion animado y la línea de tiempo para el render.

Uso:
  python3 voz.py v01.json --modelo /ruta/es_AR-daniela-high.onnx
Salida (en build/<id>/):
  voz.wav        audio final (voz cálida: tono apenas más grave)
  timeline.json  segmentos con inicio/fin + apertura de boca por frame (30 fps)

Voz: Piper "es_AR daniela high" (CC BY-SA 4.0, dataset OpenSLR 61).
Descarga: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_AR/daniela/high
Si grabás tu propia voz, pasá --audio tu.wav y --tiempos (ver README).
"""
import argparse
import json
import os
import subprocess
import wave

import numpy as np

FPS = 30
PAUSA = 0.28        # silencio entre segmentos (s)
PAUSA_INICIO = 0.35


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("guion")
    ap.add_argument("--modelo", required=True)
    ap.add_argument("--velocidad", type=float, default=1.08, help=">1 = más lento")
    args = ap.parse_args()

    from piper import PiperVoice
    from piper.config import SynthesisConfig

    g = json.load(open(args.guion))
    out = os.path.join(os.path.dirname(os.path.abspath(args.guion)), "build", g["id"].lower())
    os.makedirs(out, exist_ok=True)

    voice = PiperVoice.load(args.modelo)
    cfg = SynthesisConfig(length_scale=args.velocidad, noise_scale=0.62, noise_w_scale=0.8)
    sr = voice.config.sample_rate

    chunks, segs, t = [np.zeros(int(PAUSA_INICIO * sr), np.int16)], [], PAUSA_INICIO
    for i, s in enumerate(g["segmentos"]):
        p = os.path.join(out, f"seg{i:02d}.wav")
        with wave.open(p, "wb") as w:
            voice.synthesize_wav(s["say"], w, syn_config=cfg)
        with wave.open(p) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), np.int16)
        d = len(a) / sr
        segs.append(dict(s, ini=round(t, 3), fin=round(t + d, 3)))
        chunks += [a, np.zeros(int(PAUSA * sr), np.int16)]
        t += d + PAUSA
    chunks.append(np.zeros(int(1.2 * sr), np.int16))   # cola para el cierre
    audio = np.concatenate(chunks)

    raw = os.path.join(out, "voz_raw.wav")
    with wave.open(raw, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(audio.tobytes())

    # Voz más cálida: tono -5 % (sin cambiar la velocidad), un poco de cuerpo en graves,
    # menos brillo arriba y normalización de volumen para TikTok.
    k = 0.95
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af",
                    f"asetrate={sr}*{k},aresample=44100,atempo={1/k:.5f},"
                    "bass=g=3:f=180,treble=g=-2:f=6000,loudnorm=I=-15:TP=-1.5:LRA=9",
                    "-ar", "44100", os.path.join(out, "voz.wav")], check=True)

    # Apertura de boca por frame (RMS suavizado) sobre el audio original
    a = audio.astype(np.float32) / 32768
    hop = sr // FPS
    n = len(a) // hop
    rms = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    ref = np.percentile(rms[rms > 0.005], 90) if (rms > 0.005).any() else 1
    boca = np.clip((rms - 0.01) / (ref - 0.01), 0, 1)
    boca = np.convolve(boca, [0.25, 0.5, 0.25], mode="same")

    json.dump(dict(id=g["id"], fps=FPS, duracion=round(len(audio) / sr, 3), segmentos=segs,
                   boca=[round(float(x), 3) for x in boca]),
              open(os.path.join(out, "timeline.json"), "w"), ensure_ascii=False)
    print(f"   {out}/voz.wav · {len(audio)/sr:.1f} s · {len(segs)} segmentos")


if __name__ == "__main__":
    main()
