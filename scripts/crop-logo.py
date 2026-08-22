#!/usr/bin/env python3
"""Crop M & M chrome from the attached logo-mark.

Prefers public/source/logo-mark.jpg (woman + broom + script).
Do not redraw that artwork. This script only crops, remaps old mint
to the Look ground, and resizes.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "source"
SOURCE.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(exist_ok=True)

# Look bible
GROUND = (0x66, 0xC1, 0x78, 255)
INK = (0xFA, 0xFC, 0xFA, 255)
HOT = (0xF2, 0xC3, 0x44, 255)

# Previous reconstruction / wrong mint — remap, do not keep
OLD_GROUND = (77, 182, 167)
OLD_HOT = (245, 210, 58)
OLD_INK = (255, 255, 255)

CANDIDATES = [
    SOURCE / "logo-mark.jpg",
    SOURCE / "logo-mark.jpeg",
    SOURCE / "logo-mark.png",
    PUBLIC / "logo-mark.jpg",
    SOURCE / "logo.jpeg",
    SOURCE / "logo.jpg",
    SOURCE / "logo.png",
    PUBLIC / "logo.jpeg",
]


def load_logo() -> Image.Image:
    for path in CANDIDATES:
        if path.exists():
            return Image.open(path).convert("RGBA")
    import subprocess
    import sys

    subprocess.check_call([sys.executable, str(ROOT / "scripts" / "make-lockup.py")])
    for path in CANDIDATES:
        if path.exists():
            return Image.open(path).convert("RGBA")
    raise FileNotFoundError(
        "Missing public/source/logo-mark.jpg. Put the attached mark there and run again."
    )


def sample_ground(img: Image.Image) -> tuple[int, int, int, int]:
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


def dist(a: tuple[int, ...], b: tuple[int, ...]) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def looks_like_old_mint(color: tuple[int, ...]) -> bool:
    return dist(color, OLD_GROUND) < 36 or (
        55 <= color[0] <= 115 and 155 <= color[1] <= 205 and 140 <= color[2] <= 195
    )


def remap_look(img: Image.Image) -> Image.Image:
    """If the source still sits on the old teal, lift it onto Look ground.

    Figure, hair, broom, and script stay. Only the old plate and the old
    yellow / white inks move.
    """
    ground = sample_ground(img)
    if not looks_like_old_mint(ground):
        return img

    src = img.convert("RGBA")
    px = src.load()
    w, h = src.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if looks_like_old_mint((r, g, b)):
                px[x, y] = GROUND
            elif dist((r, g, b), OLD_HOT) < 42 or (r > 220 and g > 175 and b < 100):
                px[x, y] = HOT
            elif min(r, g, b) > 232:
                px[x, y] = INK
    return src


def fit_square(src: Image.Image, size: int, background: tuple[int, int, int, int]) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background)
    fitted = src.copy()
    fitted.thumbnail((size, size), Image.Resampling.LANCZOS)
    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2
    canvas.alpha_composite(fitted, (x, y))
    return canvas


def crop_mark(img: Image.Image) -> Image.Image:
    """Square crop from the mint ground. Woman + broom + script stay."""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def flatten(img: Image.Image, ground: tuple[int, int, int, int]) -> Image.Image:
    plate = Image.new("RGB", img.size, ground[:3])
    if img.mode == "RGBA":
        plate.paste(img, mask=img.split()[-1])
    else:
        plate.paste(img.convert("RGB"))
    return plate


def main() -> None:
    src = remap_look(load_logo())
    ground = sample_ground(src)
    if looks_like_old_mint(ground):
        ground = GROUND
    square = crop_mark(src)

    flatten(square, ground).save(PUBLIC / "logo.jpeg", "JPEG", quality=92)

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
