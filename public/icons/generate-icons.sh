#!/usr/bin/env bash
# Generate PNG icons from the SVG source using Inkscape, ImageMagick, or rsvg-convert.
#
# Prerequisites (install ONE of these):
#   brew install librsvg        # rsvg-convert (recommended, lightweight)
#   brew install imagemagick    # convert
#   brew install inkscape       # inkscape CLI
#
# Usage:
#   cd public/icons && bash generate-icons.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SVG_SOURCE="${SCRIPT_DIR}/icon.svg"
SVG_MASKABLE="${SCRIPT_DIR}/icon-maskable.svg"

SIZES=(48 72 96 128 144 152 192 384 512)

render_svg() {
  local src="$1" out="$2" size="$3"

  if command -v rsvg-convert &>/dev/null; then
    rsvg-convert -w "$size" -h "$size" "$src" -o "$out"
  elif command -v magick &>/dev/null; then
    magick -background none -density 300 "$src" -resize "${size}x${size}" "$out"
  elif command -v convert &>/dev/null; then
    convert -background none -density 300 "$src" -resize "${size}x${size}" "$out"
  elif command -v inkscape &>/dev/null; then
    inkscape --export-type=png --export-filename="$out" -w "$size" -h "$size" "$src" 2>/dev/null
  else
    echo "ERROR: No SVG renderer found. Install librsvg, imagemagick, or inkscape."
    exit 1
  fi
}

echo "Generating PNG icons from ${SVG_SOURCE}..."

for size in "${SIZES[@]}"; do
  out="${SCRIPT_DIR}/icon-${size}.png"
  echo "  ${size}x${size} -> $(basename "$out")"
  render_svg "$SVG_SOURCE" "$out" "$size"
done

# Maskable variant at 512
out="${SCRIPT_DIR}/icon-512-maskable.png"
echo "  512x512 (maskable) -> $(basename "$out")"
render_svg "$SVG_MASKABLE" "$out" 512

echo "Done. Update vite.config.ts manifest icons to reference the PNG files if needed."
