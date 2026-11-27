#!/usr/bin/env python3
"""Música de cuna (cajita de música + colchón suave) para 'La Luna'. Pensada para bucle:
el colchón suena parejo de principio a fin y las notas dejan de sonar 2,5 s antes del final.
Uso: synth-luna.py <segundos> <salida.wav>"""
import sys, numpy as np, wave
L = float(sys.argv[1]); out = sys.argv[2]; sr = 44100
t = np.arange(int(L * sr)) / sr
rng = np.random.default_rng(7)
mix = np.zeros_like(t)
# colchón: C3 + G3 + E4, con una respiración lenta que vuelve al mismo nivel al final
def pad(f, a): return a * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.2 * t))
breath = 0.85 + 0.15 * np.cos(2 * np.pi * t / L)        # igual al inicio y al final → sin salto al repetir
mix += (pad(130.81, 0.060) + pad(196.0, 0.045) + pad(329.63, 0.030)) * breath
# cajita de música: escala pentatónica de Do, melodía lenta
N = dict(C5=523.25, D5=587.33, E5=659.25, G5=783.99, A5=880.0, C6=1046.5, G4=392.0, A4=440.0)
mel = ["E5","G5","A5","G5","E5","D5","C5","D5","E5","G5","E5","D5","C5","A4","C5","D5","E5","G5","A5","C6","A5","G5","E5","D5","C5","G4","A4","C5"]
step = 0.95; k = 0; tt = 0.5
while tt < L - 2.5 and k < len(mel):
    f = N[mel[k]]; env = np.exp(-(t - tt) * 2.6) * (t >= tt) * np.minimum(1, (t - tt) * 400)
    note = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3.01 * f * t)) * env * 0.10
    mix += note; tt += step * (1.0 if k % 4 != 3 else 1.5); k += 1
mix /= max(1e-6, np.abs(mix).max()) / 0.8
w = wave.open(out, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close(); print("ok", out, round(L, 1), "s")
