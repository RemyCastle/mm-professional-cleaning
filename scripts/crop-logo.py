#!/usr/bin/env python3
"""Crop M & M chrome from the printed logo slide.

Prefers public/source/logo.jpeg (the attached last slide).
Do not redraw that artwork. This script only crops and resizes.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "source"
SOURCE.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(exist_ok=True)

MINT = (77, 182, 166, 255)

CANDIDATES = [
    SOURCE / "logo.jpeg",
    SOURCE / "logo.jpg",
    SOURCE / "logo.png",
    PUBLIC / "logo.jpeg",
]


def load_logo() -> Image.Image:
    for path in CANDIDATES:
        if path.exists():
            img = Image.open(path).convert("RGBA")
            return img
    import subprocess
    import sys

    subprocess.check_call([sys.executable, str(ROOT / "scripts" / "make-lockup.py")])
    for path in CANDIDATES:
        if path.exists():
            return Image.open(path).convert("RGBA")
    raise FileNotFoundError(
        "Missing public/source/logo.jpeg. Put the attached logo slide there and run again."
    )


def sample_ground(img: Image.Image) -> tuple[int, int, int, 255]:
    w, h = img.size
    pixels = [
        img.getpixel((4, 4)),
        img.getpixel((w - 5, 4)),
        img.getpixel((4, h - 5)),
        img.getpixel((w - 5, h - 5)),
        img.getpixel((w // 2, 8)),
    ]
    r = sum(p[0] for p in pixels) // len(pixels)
    g = sum(p[1] for p in pixels) // len(pixels)
    b = sum(p[2] for p in pixels) // len(pixels)
    return (r, g, b, 255)


def fit_square(src: Image.Image, size: int, background: tuple[int, int, int, int]) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background)
    fitted = src.copy()
    fitted.thumbnail((size, size), Image.Resampling.LANCZOS)
    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2
    canvas.alpha_composite(fitted, (x, y))
    return canvas


def crop_mark(img: Image.Image) -> Image.Image:
    """Use the full printed lockup. Square crop from the mint ground."""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def main() -> None:
    src = load_logo()
    ground = sample_ground(src)
    square = crop_mark(src)

    hero = square.copy()
    if hero.mode != "RGB":
        plate = Image.new("RGB", hero.size, ground[:3])
        plate.paste(hero, mask=hero.split()[-1] if hero.mode == "RGBA" else None)
        hero = plate.convert("RGB")
    hero.save(PUBLIC / "logo.jpeg", "JPEG", quality=92)

    mark = fit_square(square, 1024, ground)
    mark.save(PUBLIC / "logo-mark.png", "PNG")

    icon_512 = fit_square(square, 512, ground)
    icon_512.save(PUBLIC / "icon-512.png", "PNG")

    apple = fit_square(square, 180, ground)
    apple.save(PUBLIC / "apple-touch-icon.png", "PNG")

    fav32 = fit_square(square, 32, ground)
    fav32.save(PUBLIC / "favicon-32.png", "PNG")

    ico = Image.new("RGBA", (32, 32), ground)
    ico.alpha_composite(fav32)
    ico.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32)])

    og = Image.new("RGBA", (1200, 630), ground)
    badge = fit_square(square, 560, (0, 0, 0, 0))
    og.alpha_composite(badge, ((1200 - badge.width) // 2, (630 - badge.height) // 2))
    og.convert("RGB").save(PUBLIC / "og.png", "PNG")


if __name__ == "__main__":
    main()
