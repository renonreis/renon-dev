#!/usr/bin/env bash
# Tile images into one labelled-order contact sheet (left to right, top to bottom) over grey,
# so transparent layers stay visible. Requires ffmpeg.
# Usage: bash tools/contact-sheet.sh <out.jpg> <cols> <tile-width> <tile-height> <image>...
set -euo pipefail

out=$1 cols=$2 tw=$3 th=$4
shift 4
n=$#
inputs=() filters="" layout=""
i=0
for f in "$@"; do
  inputs+=(-i "$f")
  filters+="[$i]scale=${tw}:${th}:force_original_aspect_ratio=decrease,pad=$((tw + 4)):$((th + 4)):(ow-iw)/2:(oh-ih)/2:color=0x404040[v$i];"
  layout+="$((i % cols * (tw + 4)))_$((i / cols * (th + 4)))|"
  i=$((i + 1))
done
labels=""
for ((j = 0; j < n; j++)); do labels+="[v$j]"; done

mkdir -p "$(dirname "$out")"
if [ "$n" -eq 1 ]; then
  ffmpeg -v error -y "${inputs[@]}" -filter_complex "${filters%;}" -map "[v0]" -frames:v 1 "$out"
else
  ffmpeg -v error -y "${inputs[@]}" \
    -filter_complex "${filters}${labels}xstack=inputs=$n:layout=${layout%|}:fill=0x404040" -frames:v 1 "$out"
fi
echo "$out"
