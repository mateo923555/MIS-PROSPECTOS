"""Genera la voz + diseño de sonido de un guion animado y la línea de tiempo para el render.

Uso:
  python3 voz.py v01.json --modelo /ruta/es_AR-daniela-high.onnx
Salida (en build/<id>/):
  voz.wav        audio final (voz + sonido)
  timeline.json  segmentos con inicio/fin, tiempos por palabra y apertura de boca (30 fps)

Voz: Piper "es_AR daniela high" (CC BY-SA 4.0, dataset OpenSLR 61), procesada para
sonar más grave, firme y cercana. Cada segmento puede tener su propia "rapidez"
(el gancho y el remate van más pausados; el resto, a 1,5×). Los "..." del texto
se convierten en pausas dramáticas.

Sonido (sintetizado acá, sin samples externos): golpe grave al arrancar, base de
tensión debajo de la voz, ráfaga en cada cambio de plano, subida antes del remate
y "ding" cuando aparece el dato.
"""
import argparse
import json
import os
import re
import subprocess
import tempfile
import wave

import numpy as np

FPS = 30
SR = 44100
BASE = 1.08            # length_scale de la primera versión (referencia de "1×")
TONO = 0.92            # tono un 8 % más grave: más autoridad
PAUSA = 0.12           # entre frases (s, audio final)
PAUSA_DRAMA = 0.34     # en cada "..."


def palabras_con_tiempo(sub, ini, fin):
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


def leer(p):
    with wave.open(p) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


def escribir(p, a, sr=SR):
    with wave.open(p, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())


def ff(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


# ---------------------------------------------------------------- sonido
rng = np.random.default_rng(7)


def banda(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def golpe():
    n = int(.9 * SR); t = np.arange(n) / SR
    f = 95 * np.exp(-t * 3.2) + 38
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.2)
    click = banda(rng.standard_normal(n), 800, 5000) * np.exp(-t * 60) * .5
    return (sub + click) * .85


def rafaga(d=.32):
    n = int(d * SR); t = np.linspace(0, 1, n)
    x = banda(rng.standard_normal(n), 400, 6000)
    return x / (np.abs(x).max() + 1e-9) * np.sin(np.pi * t) ** 2 * .16


def subida(d=1.0):
    n = int(d * SR); t = np.linspace(0, 1, n)
    x = banda(rng.standard_normal(n), 1500, 9000)
    x = x / (np.abs(x).max() + 1e-9)
    tono = np.sin(2 * np.pi * np.cumsum(180 + 620 * t ** 2) / SR)
    return (x * .6 + tono * .4) * t ** 2.2 * .17


def ding():
    n = int(.9 * SR); t = np.arange(n) / SR
    a = np.sin(2 * np.pi * 1318.5 * t) + .5 * np.sin(2 * np.pi * 1975.5 * t)
    b = np.zeros(n); k = int(.07 * SR)
    b[k:] = (np.sin(2 * np.pi * 1760 * t[:n - k]) + .4 * np.sin(2 * np.pi * 2637 * t[:n - k])) * np.exp(-t[:n - k] * 7)
    return (a * np.exp(-t * 8) + b) * .16


def base_tension(n, voz_env):
    t = np.arange(n) / SR
    trem = .6 + .4 * np.sin(2 * np.pi * .23 * t)
    x = (np.sin(2 * np.pi * 55 * t) + .7 * np.sin(2 * np.pi * 82.4 * t) + .5 * np.sin(2 * np.pi * 58.3 * t)) * trem
    x += banda(rng.standard_normal(n), 60, 400) * .6
    x = x / (np.abs(x).max() + 1e-9) * .075
    return x * (1 - .55 * voz_env)                  # baja cuando habla


def poner(dst, src, at):
    i = int(at * SR)
    if i < 0:
        src, i = src[-i:], 0
    j = min(len(dst), i + len(src))
    if j > i:
        dst[i:j] += src[: j - i]


# ---------------------------------------------------------------- voz
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
    voice = PiperVoice.load(args.modelo)
    tmp = tempfile.mkdtemp()

    def sintetizar(texto, rapidez):
        objetivo = BASE / rapidez
        ls = max(objetivo, .86)
        cfg = SynthesisConfig(length_scale=ls, noise_scale=.55, noise_w_scale=.7)
        raw, proc = os.path.join(tmp, "r.wav"), os.path.join(tmp, "p.wav")
        with wave.open(raw, "wb") as w:
            voice.synthesize_wav(texto, w, syn_config=cfg)
        sr = voice.config.sample_rate
        ff("-i", raw, "-af", f"asetrate={sr}*{TONO},aresample={SR},atempo={(ls / objetivo) / TONO:.5f}", "-ar", str(SR), proc)
        return leer(proc)

    voz, segs, t = [np.zeros(int(.06 * SR))], [], .06
    for s in g["segmentos"]:
        rap = s.get("rapidez", args.rapidez)
        partes = [p.strip() for p in re.split(r"\.\.\.|…", s["say"]) if p.strip()]
        ini = t
        for k, p in enumerate(partes):
            a = sintetizar(p, rap)
            voz.append(a); t += len(a) / SR
            if k < len(partes) - 1:
                voz.append(np.zeros(int(PAUSA_DRAMA * SR))); t += PAUSA_DRAMA
        segs.append(dict(s, ini=round(ini, 3), fin=round(t, 3)))
        voz.append(np.zeros(int(PAUSA * SR))); t += PAUSA
    voz.append(np.zeros(int(1.4 * SR)))
    v = np.concatenate(voz)

    # voz más firme y presente: sin graves sucios, con presencia, comprimida
    vraw, vproc = os.path.join(tmp, "v.wav"), os.path.join(tmp, "vp.wav")
    escribir(vraw, v)
    ff("-i", vraw, "-af", "highpass=f=85,equalizer=f=220:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.2:g=3,"
       "acompressor=threshold=-20dB:ratio=3.5:attack=5:release=120:makeup=3,loudnorm=I=-15:TP=-2:LRA=7", "-ar", str(SR), vproc)
    v = leer(vproc)

    for s in segs:
        s["palabras"] = palabras_con_tiempo(s.get("sub", ""), s["ini"], s["fin"])
    for i, s in enumerate(segs):
        s["next"] = segs[i + 1]["ini"] if i + 1 < len(segs) else len(v) / SR

    # boca (solo voz)
    hop = SR // FPS
    n = len(v) // hop
    rms = np.sqrt(np.mean(v[: n * hop].reshape(n, hop) ** 2, axis=1))
    ref = np.percentile(rms[rms > .01], 90) if (rms > .01).any() else 1
    boca = np.convolve(np.clip((rms - .02) / (ref - .02), 0, 1), [.25, .5, .25], mode="same")

    # sonido
    env = np.repeat(np.clip(rms / ref, 0, 1), hop)
    env = np.pad(env, (0, len(v) - len(env)))
    mix = v.copy()
    fin_base = segs[-1]["ini"]
    bed = base_tension(len(v), env)
    bed[int(fin_base * SR):] *= np.linspace(1, 0, len(bed) - int(fin_base * SR))
    mix += bed
    poner(mix, golpe(), 0)
    for i, s in enumerate(segs):
        if i and s.get("plano") != segs[i - 1].get("plano"):
            poner(mix, rafaga(), s["ini"] - .16)
        acts = s.get("accion") if isinstance(s.get("accion"), list) else [s.get("accion")] if s.get("accion") else []
        if any(a.get("tipo") == "big" for a in acts):
            poner(mix, subida(), s["ini"] - 1.0)
            poner(mix, ding(), s["ini"] + min(1.2, (s["next"] - s["ini"]) * .3))
    mraw = os.path.join(tmp, "m.wav")
    escribir(mraw, mix)
    ff("-i", mraw, "-af", "alimiter=limit=0.89:attack=3:release=60", "-ar", str(SR), os.path.join(out, "voz.wav"))

    for s in segs:
        s.pop("next", None)
    json.dump(dict(id=g["id"], fps=FPS, duracion=round(len(v) / SR, 3), segmentos=segs,
                   boca=[round(float(x), 3) for x in boca]),
              open(os.path.join(out, "timeline.json"), "w"), ensure_ascii=False)
    print(f"   {g['id']} · {len(v)/SR:.1f} s")


if __name__ == "__main__":
    main()
