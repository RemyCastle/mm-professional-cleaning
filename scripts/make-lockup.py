#!/usr/bin/env python3
"""Last-resort lockup if the attached logo slide is missing.

Prefer public/source/logo.jpeg. Do not run this over a real crop.
"""

from __future__ import annotations

import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "source"
SOURCE.mkdir(parents=True, exist_ok=True)

MINT = (77, 182, 166, 255)
YELLOW = (245, 210, 58, 255)
WHITE = (255, 255, 255, 255)
HAIR = (28, 24, 30, 255)
SKIN = (230, 184, 152, 255)
TAN = (196, 164, 112, 255)
INK = (22, 51, 46, 255)

FONT_DIR = Path("/tmp/mm-fonts")
FONT_DIR.mkdir(exist_ok=True)
SCRIPT = FONT_DIR / "GreatVibes-Regular.ttf"
SANS = "/usr/share/fonts/truetype/macos/PublicSans-Bold.ttf"


def ensure_script() -> str:
    if SCRIPT.exists():
        return str(SCRIPT)
    url = "https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf"
    urllib.request.urlretrieve(url, SCRIPT)
    return str(SCRIPT)


def draw_woman(draw: ImageDraw.ImageDraw, s: float) -> None:
    def xy(x: float, y: float) -> tuple[float, float]:
        return (x * s, y * s)

    def box(a: float, b: float, c: float, d: float) -> list[float]:
        return [a * s, b * s, c * s, d * s]

    # Broom (behind the step)
    draw.line([xy(430, 210), xy(690, 620)], fill=TAN, width=max(8, int(16 * s)))
    head = [xy(640, 590), xy(780, 560), xy(800, 640), xy(650, 670)]
    draw.polygon(head, fill=YELLOW)

    # Boots
    draw.ellipse(box(318, 560, 400, 628), fill=YELLOW)
    draw.ellipse(box(430, 548, 520, 628), fill=YELLOW)

    # Legs / overalls
    draw.polygon([xy(340, 390), xy(410, 390), xy(398, 565), xy(330, 565)], fill=WHITE)
    draw.polygon([xy(410, 390), xy(490, 390), xy(510, 555), xy(430, 555)], fill=WHITE)

    # Torso / yellow shirt
    draw.polygon([xy(330, 268), xy(500, 268), xy(510, 400), xy(320, 400)], fill=YELLOW)
    # White overall bib
    draw.polygon([xy(355, 300), xy(475, 300), xy(470, 400), xy(360, 400)], fill=WHITE)
    draw.line([xy(380, 268), xy(370, 310)], fill=WHITE, width=max(6, int(12 * s)))
    draw.line([xy(450, 268), xy(460, 310)], fill=WHITE, width=max(6, int(12 * s)))

    # Arms / gloves
    draw.polygon([xy(500, 290), xy(560, 360), xy(530, 390), xy(480, 320)], fill=YELLOW)
    draw.ellipse(box(530, 350, 590, 410), fill=YELLOW)
    draw.polygon([xy(250, 300), xy(330, 300), xy(320, 360), xy(240, 350)], fill=YELLOW)
    draw.ellipse(box(220, 330, 280, 390), fill=YELLOW)

    # Neck / head
    draw.ellipse(box(370, 230, 430, 280), fill=SKIN)
    draw.ellipse(box(350, 150, 460, 250), fill=SKIN)

    # Hair
    draw.polygon(
        [xy(350, 200), xy(340, 280), xy(330, 420), xy(360, 430), xy(370, 250)],
        fill=HAIR,
    )
    draw.polygon(
        [xy(450, 200), xy(470, 320), xy(490, 450), xy(455, 450), xy(440, 240)],
        fill=HAIR,
    )
    draw.pieslice(box(345, 145, 465, 230), 180, 360, fill=HAIR)

    # Cap
    draw.ellipse(box(348, 138, 468, 190), fill=WHITE)
    draw.polygon([xy(348, 168), xy(300, 178), xy(348, 188)], fill=WHITE)


def main() -> None:
    if (SOURCE / "logo.jpeg").exists():
        return
    size = 1200
    s = size / 1000
    img = Image.new("RGBA", (size, size), MINT)
    draw = ImageDraw.Draw(img)
    draw_woman(draw, s)

    script = ImageFont.truetype(ensure_script(), 150)
    sans = ImageFont.truetype(SANS, 42)
    text = "M & M"
    bbox = draw.textbbox((0, 0), text, font=script)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2 - bbox[0], 700), text, font=script, fill=WHITE)

    sub = "PROFESSIONAL CLEANING"
    bbox = draw.textbbox((0, 0), sub, font=sans)
    sw = bbox[2] - bbox[0]
    draw.text(((size - sw) / 2 - bbox[0], 860), sub, font=sans, fill=WHITE)

    rgb = Image.new("RGB", img.size, MINT[:3])
    rgb.paste(img, mask=img.split()[-1])
    rgb.save(SOURCE / "logo.jpeg", "JPEG", quality=92)


if __name__ == "__main__":
    main()
