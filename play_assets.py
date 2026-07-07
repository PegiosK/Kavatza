#!/usr/bin/env python3
"""Play Store graphic assets: 512 icon + 1024x500 feature graphic."""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = "play/assets"
os.makedirs(OUT, exist_ok=True)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

TEAL   = (20, 110, 104, 255)
TEAL_D = (15, 86, 81, 255)
COIN_T = (243, 240, 230, 255)
COIN_S = (216, 209, 188, 255)
RIM    = (208, 200, 176, 255)
EURO   = (18, 104, 98, 255)
CREAM  = (243, 240, 230, 255)
CREAM2 = (205, 222, 219, 255)
SS = 4

def draw_coins(d, cx, cy, s):
    def X(v): return cx + (v - 512) * s
    def Y(v): return cy + (v - 505) * s
    def L(v): return v * s
    base = 512; rx, ry, side = 230, 56, 42
    for ty in [606, 524, 442, 360]:
        l, r = base - rx, base + rx
        d.rectangle([X(l), Y(ty), X(r), Y(ty + side)], fill=COIN_S)
        d.ellipse([X(l), Y(ty + side - ry), X(r), Y(ty + side + ry)], fill=COIN_S)
        d.ellipse([X(l), Y(ty - ry), X(r), Y(ty + ry)], fill=COIN_T)
        d.ellipse([X(l), Y(ty - ry), X(r), Y(ty + ry)], outline=RIM, width=max(1, int(L(5))))
        tcy = 360
    ew = L(118); cxp, cyp = X(base), Y(360); lw = max(2, int(L(28)))
    d.arc([cxp-ew*0.5, cyp-ew*0.6, cxp+ew*0.5, cyp+ew*0.6], start=33, end=327, fill=EURO, width=lw)
    d.line([cxp-ew*0.6, cyp-L(20), cxp+ew*0.12, cyp-L(20)], fill=EURO, width=lw)
    d.line([cxp-ew*0.6, cyp+L(20), cxp+ew*0.12, cyp+L(20)], fill=EURO, width=lw)

def fit_font(draw, text, max_w, start, min_size=20*SS):
    size = start
    while size > min_size:
        f = ImageFont.truetype(FONT, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 2*SS
    return ImageFont.truetype(FONT, min_size)

icon = Image.new("RGBA", (512*SS, 512*SS), TEAL)
draw_coins(ImageDraw.Draw(icon), 256*SS, 256*SS, 0.80*SS)
icon.resize((512, 512), Image.LANCZOS).convert("RGB").save(f"{OUT}/icon-512.png")

W, H = 1024*SS, 500*SS
fg = Image.new("RGBA", (W, H), TEAL)
grad = Image.new("L", (1, H))
for y in range(H):
    grad.putpixel((0, y), int(20 * (y / H)))
fg = Image.composite(Image.new("RGBA", (W, H), TEAL_D), fg, grad.resize((W, H)))
d = ImageDraw.Draw(fg)
draw_coins(d, int(0.205*W), H//2, 0.62*SS)

word = "καβάτζα"; tag = "κάθε ευρώ, μια δουλειά"
text_left = int(0.40 * W); max_w = int(0.96 * W) - text_left
word_f = fit_font(d, word, max_w, 150*SS)
tag_f  = fit_font(d, tag,  max_w, 50*SS)
wb = d.textbbox((0, 0), word, font=word_f); tb = d.textbbox((0, 0), tag, font=tag_f)
gap = 26*SS; block_h = (wb[3]-wb[1]) + gap + (tb[3]-tb[1]); top = H//2 - block_h//2
d.text((text_left, top - wb[1]), word, font=word_f, fill=CREAM)
d.text((text_left, top + (wb[3]-wb[1]) + gap - tb[1]), tag, font=tag_f, fill=CREAM2)
fg.resize((1024, 500), Image.LANCZOS).convert("RGB").save(f"{OUT}/feature-graphic.png")
print("written: icon-512.png + feature-graphic.png")
