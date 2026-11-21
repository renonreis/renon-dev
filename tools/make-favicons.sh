#!/usr/bin/env bash
# Build the favicons in public/ from our own logo (src/assets/brand/logo-poster.png).
# The live site serves a single 48x48 favicon.ico; we add a PNG and an Apple touch icon.
# Requires ffmpeg. Run from the repo root: bash tools/make-favicons.sh
set -euo pipefail

SRC=src/assets/brand/logo-poster.png
OUT=public
mkdir -p "$OUT"

# Pad the logo to a transparent square, then scale. $1 = size, $2 = output file.
square() {
  ffmpeg -v error -y -i "$SRC" -vf \
    "pad=w='max(iw,ih)':h='max(iw,ih)':x='(ow-iw)/2':y='(oh-ih)/2':color=black@0,scale=$1:$1:flags=lanczos,format=rgba" \
    "$2"
}

square 48 "$OUT/favicon.ico"
square 32 "$OUT/favicon-32.png"
# iOS fills transparency with black, so give the touch icon the page background (#0c0d1b).
ffmpeg -v error -y -f lavfi -i "color=c=0x0c0d1b:s=180x180" -i "$SRC" -filter_complex \
  "[1]scale=164:-1:flags=lanczos[l];[0][l]overlay=(W-w)/2:(H-h)/2,format=rgb24" -frames:v 1 \
  "$OUT/apple-touch-icon.png"

echo "favicons written to $OUT/"
