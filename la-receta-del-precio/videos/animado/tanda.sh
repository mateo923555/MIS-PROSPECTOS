#!/bin/bash
# Genera voz + video para los guiones indicados. Uso: ./tanda.sh /ruta/modelo.onnx 02 03 ...
M=$1; shift
mkdir -p ../../export/videos
for n in "$@"; do
  python3 voz.py v$n.json --modelo "$M" && NODE_PATH=$(npm root -g) node render.cjs v$n >/dev/null \
    && cp build/v$n/v$n-dona-marga.mp4 ../../export/videos/ && echo "OK v$n" || echo "FALLÓ v$n"
done
