"""Genera la voz de un guion animado y la línea de tiempo para el render.

Uso:
  python3 voz.py v01.json --modelo /ruta/es_AR-daniela-high.onnx [--rapidez 1.5]
Salida (en build/<id>/):
  voz.wav        audio final
  timeline.json  segmentos con inicio/fin, tiempos por palabra y apertura de boca (30 fps)

Voz: Piper "es_AR daniela high" (CC BY-SA 4.0, dataset OpenSLR 61).
--rapidez 1.5 = 1,5 veces más rápido que la versión original (dinámica para TikTok).
"""
import argparse
import json
import os
import re
import subprocess
import wave

import numpy as np

FPS = 30
PAUSA = 0.10          # silencio entre frases (s, antes de acelerar)
PAUSA_INICIO = 0.10
BASE = 1.08           # length_scale de la primera versión (referencia de "1×")
TONO = 0.95           # tono un 5 % más grave = más cálida


def palabras_con_tiempo(sub, ini, fin):
    """Reparte el tiempo de la frase entre las palabras del subtítulo según su largo."""
    ws = sub.split()
    if not ws:
        return []
    peso = [len(re.sub(r"[^\wáéíóúñü$%]", "", w)) + 2 + (3 if re.search(r"[.,:;?!…]$", w) else 0) for w in ws]
    tot, t, out = sum(peso), ini, []
    for w, p in zip(ws, peso):
        d = (fin - ini) * p / tot
        out.append([w, round(t, 3), round(t + d, 3)])
        t += d
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("guion")
    ap.add_argument("--modelo", required=True)
    ap.add_argument("--rapidez", type=float, default=1.5)
    args = ap.parse_args()

    from piper import PiperVoice
    from piper.config import SynthesisConfig

    g = json.load(open(args.guion))
    out = os.path.join(os.path.dirname(os.path.abspath(args.guion)), "build", g["id"].lower())
    os.makedirs(out, exist_ok=True)

    # Parte de la aceleración la hace Piper (suena natural) y el resto ffmpeg (sin cambiar el tono).
    objetivo = BASE / args.rapidez
    piper_ls = max(objetivo, 0.86)
    tempo = piper_ls / objetivo                      # factor extra en ffmpeg

    voice = PiperVoice.load(args.modelo)
    cfg = SynthesisConfig(length_scale=piper_ls, noise_scale=0.62, noise_w_scale=0.8)
    sr = voice.config.sample_rate

    chunks, segs, t = [np.zeros(int(PAUSA_INICIO * sr), np.int16)], [], PAUSA_INICIO
    for i, s in enumerate(g["segmentos"]):
        p = os.path.join(out, f"seg{i:02d}.wav")
        with wave.open(p, "wb") as w:
            voice.synthesize_wav(s["say"], w, syn_config=cfg)
        with wave.open(p) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), np.int16)
        d = len(a) / sr
        segs.append(dict(s, ini=t, fin=t + d))
        chunks += [a, np.zeros(int(PAUSA * sr), np.int16)]
        t += d + PAUSA
    chunks.append(np.zeros(int(1.6 * sr * tempo), np.int16))   # cola para el cierre
    audio = np.concatenate(chunks)

    raw = os.path.join(out, "voz_raw.wav")
    with wave.open(raw, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(audio.tobytes())

    final = os.path.join(out, "voz.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af",
                    f"asetrate={sr}*{TONO},aresample=44100,atempo={tempo / TONO:.5f},"
                    "bass=g=3:f=180,treble=g=-1:f=6000,loudnorm=I=-14:TP=-1.5:LRA=9",
                    "-ar", "44100", "-ac", "1", final], check=True)

    # tiempos en el audio final
    for s in segs:
        s["ini"], s["fin"] = round(s["ini"] / tempo, 3), round(s["fin"] / tempo, 3)
        s["palabras"] = palabras_con_tiempo(s.get("sub", ""), s["ini"], s["fin"])

    with wave.open(final) as w:
        fr = w.getframerate()
        b = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    hop = fr // FPS
    n = len(b) // hop
    rms = np.sqrt(np.mean(b[: n * hop].reshape(n, hop) ** 2, axis=1))
    ref = np.percentile(rms[rms > 0.01], 90) if (rms > 0.01).any() else 1
    boca = np.clip((rms - 0.02) / (ref - 0.02), 0, 1)
    boca = np.convolve(boca, [0.25, 0.5, 0.25], mode="same")

    json.dump(dict(id=g["id"], fps=FPS, duracion=round(len(b) / fr, 3), segmentos=segs,
                   boca=[round(float(x), 3) for x in boca]),
              open(os.path.join(out, "timeline.json"), "w"), ensure_ascii=False)
    print(f"   {g['id']} · {len(b)/fr:.1f} s · {len(segs)} segmentos")


if __name__ == "__main__":
    main()
