#!/usr/bin/env bash
# Saves frame 0 of a video rendition as an AVIF poster, for crops Cloudinary can't reproduce as a
# still (g_auto follows the subject per frame in video, but picks a different box for images).
# Usage: tools/video-poster.sh <video-url> <out.avif>   (needs ffmpeg with libaom-av1)
set -euo pipefail
url="$1"; out="$2"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
curl -sfL -o "$tmp/v.mp4" "$url"
ffmpeg -v error -y -i "$tmp/v.mp4" -frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 28 -pix_fmt yuv420p "$out"
echo "$out"
