#!/bin/bash
# Comprime los videos a 720p con tope de ~2,9 MB (para subirlos a Google Drive desde Claude)
cd "$(dirname "$0")/../export"
mkdir -p videos-720
for f in videos/*.mp4; do
  o=videos-720/$(basename "$f" .mp4)-720p.mp4
  [ -f "$o" ] && [ "$o" -nt "$f" ] && continue
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  vb=$(python3 -c "print(int((2.85*8*1024*1024/$d - 96000)*0.97))")
  ffmpeg -y -v error -i "$f" -vf scale=720:1280 -c:v libx264 -preset slow -b:v $vb -maxrate $((vb*3/2)) -bufsize $((vb*2)) \
    -profile:v high -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart "$o"
  echo "$o $(stat -c%s "$o")"
done
