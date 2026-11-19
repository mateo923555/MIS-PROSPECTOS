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
TONO = 0.87            # tono 13 % más grave (formantes preservados): más autoridad
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


def tic():
    n = int(.05 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 140) * .07


def blip(f=880):
    n = int(.09 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t * (1 + 2 * t)) * np.exp(-t * 45) * .09


def swish():
    return rafaga(.2) * .8


def caja():
    n = int(.5 * SR); t = np.arange(n) / SR
    clack = banda(rng.standard_normal(n), 2000, 8000) * np.exp(-t * 90) * .5
    bell = (np.sin(2 * np.pi * 2093 * t) + .6 * np.sin(2 * np.pi * 3136 * t)) * np.exp(-t * 9)
    return (clack + bell) * .11


def thump():
    n = int(.18 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 22) * .22


def monedas():
    n = int(1.1 * SR); out = np.zeros(n)
    for k in range(9):
        i = int(rng.uniform(0, .6) * SR); f = rng.uniform(2600, 4200); m = int(.3 * SR)
        tt = np.arange(m) / SR
        out[i:i + m] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 18) * .05
    return out


def ritmo(n, voz_env, bpm=100):
    """Bombo + platillo suaves para que el ritmo nunca frene (baja cuando habla)."""
    x = np.zeros(n); b = 60 / bpm
    k = thump() * 1.6
    hh_n = int(.04 * SR); hh = banda(rng.standard_normal(hh_n), 7000, 14000) * np.exp(-np.arange(hh_n) / SR * 120) * .05
    t = 0.0; i = 0
    while t < n / SR:
        poner(x, k, t)
        poner(x, hh, t + b / 2)
        if i % 2:
            poner(x, banda(rng.standard_normal(int(.08 * SR)), 900, 4000) * np.exp(-np.arange(int(.08 * SR)) / SR * 40) * .06, t)
        t += b; i += 1
    return x * (1 - .45 * voz_env)


def grupos(palabras):
    gs, g = [], []
    for w in palabras:
        g.append(w)
        if len(g) >= 3 or re.search(r"[.,:;?!…]$", w[0]):
            gs.append(g); g = []
    if g:
        gs.append(g)
    return gs


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
        cfg = SynthesisConfig(length_scale=ls, noise_scale=.42, noise_w_scale=.6)
        raw, proc = os.path.join(tmp, "r.wav"), os.path.join(tmp, "p.wav")
        with wave.open(raw, "wb") as w:
            voice.synthesize_wav(texto, w, syn_config=cfg)
        sr = voice.config.sample_rate
        ff("-i", raw, "-af", f"aresample={SR},rubberband=tempo={ls / objetivo:.5f}:pitch={TONO}:formant=preserved:pitchq=quality", "-ar", str(SR), proc)
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
    ff("-i", vraw, "-af", "highpass=f=90,equalizer=f=170:t=q:w=1:g=3.5,equalizer=f=450:t=q:w=1.4:g=-2,"
       "equalizer=f=2600:t=q:w=1.2:g=4.5,deesser=i=0.4,"
       "acompressor=threshold=-24dB:ratio=5:attack=3:release=90:makeup=5,asoftclip=type=tanh:output=0.95,"
       "aexciter=amount=1.2:drive=6:freq=3500,loudnorm=I=-14:TP=-1.5:LRA=5", "-ar", str(SR), vproc)
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
    beat = ritmo(len(v), env)
    beat[int(fin_base * SR):] *= np.linspace(1, .3, len(beat) - int(fin_base * SR))
    mix += beat
    poner(mix, golpe(), 0)
    poner(mix, rafaga(.18) * 1.4, .02)
    for i, s in enumerate(segs):
        dur = s["next"] - s["ini"]
        if i and s.get("plano") != segs[i - 1].get("plano"):
            poner(mix, rafaga(), s["ini"] - .16)
        # micro-cortes cada 1,7 s dentro del segmento (mismo cálculo que el render)
        k = 1
        while k * 1.7 < dur - .6:
            poner(mix, thump(), s["ini"] + k * 1.7); k += 1
        for gr in grupos(s["palabras"]):
            poner(mix, tic(), gr[0][1])
        acts = s.get("accion") if isinstance(s.get("accion"), list) else [s.get("accion")] if s.get("accion") else []
        for a in acts:
            if a.get("tipo") == "rows":
                n_r = len(a["rows"]); step = min(.9, max(.8, dur) * .7 / n_r)
                for j in range(n_r):
                    poner(mix, swish(), s["ini"] + j * step - .05)
                    poner(mix, caja(), s["ini"] + j * step + .55)
            if a.get("tipo") == "calc":
                toks = [x for x in re.split(r"\s*(=|÷|×|−|\+|\(|\))\s*", a["linea"]) if x and x.strip()]
                step = min(.35, max(.8, dur) * .7 / len(toks))
                for j, x in enumerate(toks):
                    poner(mix, blip(1320 if x == "=" else 880 + 60 * j), s["ini"] + .1 + j * step)
                poner(mix, caja(), s["ini"] + .1 + len(toks) * step)
            if a.get("tipo") == "big":
                t0 = s["ini"] + min(1.2, dur * .3)
                poner(mix, subida(), s["ini"] - 1.0)
                poner(mix, golpe() * .6, t0)
                poner(mix, ding(), t0)
                poner(mix, monedas(), t0 + .05)
            if a.get("tipo") in ("hook", "promesa"):
                poner(mix, blip(660), s["ini"] + .05)
            if a.get("tipo") == "cta":
                poner(mix, golpe() * .5, s["ini"]); poner(mix, ding(), s["ini"] + .3)
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
