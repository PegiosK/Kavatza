#!/usr/bin/env python3
"""Generate the καβάτζα launcher icon (a stash of stacked coins) at every
Android density, plus master art. No external fonts: the € is drawn as vectors."""
import os, math
from PIL import Image, ImageDraw

RES = "android/app/src/main/res"
MASTER = "resources"
os.makedirs(MASTER, exist_ok=True)

TEAL   = (20, 110, 104, 255)   # #146E68  background
COIN_T = (243, 240, 230, 255)  # warm cream  (coin top)
COIN_S = (216, 209, 188, 255)  # shadow cream (coin side)
RIM    = (208, 200, 176, 255)
EURO   = (18, 104, 98, 255)    # teal € on the top coin

SS = 4  # supersample factor

def lerp(a, b, t): return tuple(round(a[i] + (b[i]-a[i])*t) for i in range(4))

def draw_art(d, size, frac):
    """Draw the coin stack into a centred square region of `size*frac`."""
    region = size * frac
    off = (size - region) / 2.0
    s = region / 1024.0
    def X(v): return off + v * s
    def Y(v): return off + v * s
    def L(v): return v * s

    # four stacked coins (bottom-most drawn first)
    cx = 512
    rx, ry = 230, 56          # coin radii in design space
    side = 42                 # cylinder thickness
    tops = [606, 524, 442, 360]   # top-ellipse centre y, bottom->top

    for i, ty in enumerate(tops):
        l, r = cx - rx, cx + rx
        # cylinder side
        d.rectangle([X(l), Y(ty), X(r), Y(ty + side)], fill=COIN_S)
        # bottom curve of the side
        d.ellipse([X(l), Y(ty + side - ry), X(r), Y(ty + side + ry)], fill=COIN_S)
        # top face
        d.ellipse([X(l), Y(ty - ry), X(r), Y(ty + ry)], fill=COIN_T)
        d.ellipse([X(l), Y(ty - ry), X(r), Y(ty + ry)], outline=RIM, width=max(1, int(L(5))))

    # € on the top coin face
    tcy = tops[-1]
    ew = L(118)            # € overall size
    cxp, cyp = X(cx), Y(tcy)
    bbox = [cxp - ew*0.5, cyp - ew*0.6, cxp + ew*0.5, cyp + ew*0.6]
    lw = max(2, int(L(28)))
    # the "C" arc, opening to the right
    d.arc(bbox, start=33, end=327, fill=EURO, width=lw)
    # two horizontal bars
    bar_l = cxp - ew*0.6
    bar_r = cxp + ew*0.12
    d.line([bar_l, cyp - L(20), bar_r, cyp - L(20)], fill=EURO, width=lw)
    d.line([bar_l, cyp + L(20), bar_r, cyp + L(20)], fill=EURO, width=lw)


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=255)
    return m

def circle_mask(size):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).ellipse([0, 0, size-1, size-1], fill=255)
    return m

def render(target, mode):
    """mode: 'square' | 'round' | 'fg'  -> returns RGBA image at `target` px."""
    size = target * SS
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if mode == "square":
        bg = Image.new("RGBA", (size, size), TEAL)
        img = Image.composite(bg, img, rounded_mask(size, int(size*0.22)))
        d = ImageDraw.Draw(img); draw_art(d, size, 0.74)
    elif mode == "round":
        bg = Image.new("RGBA", (size, size), TEAL)
        img = Image.composite(bg, img, circle_mask(size))
        d = ImageDraw.Draw(img); draw_art(d, size, 0.74)
    else:  # adaptive foreground: transparent, art kept inside the safe zone
        draw_art(d, size, 0.60)
    return img.resize((target, target), Image.LANCZOS)

DENS = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}

for dens, k in DENS.items():
    folder = os.path.join(RES, f"mipmap-{dens}")
    os.makedirs(folder, exist_ok=True)
    sq = int(round(48 * k))     # legacy launcher size
    fg = int(round(108 * k))    # adaptive foreground canvas
    render(sq, "square").save(os.path.join(folder, "ic_launcher.png"))
    render(sq, "round").save(os.path.join(folder, "ic_launcher_round.png"))
    render(fg, "fg").save(os.path.join(folder, "ic_launcher_foreground.png"))

# master art for reference / future regeneration with @capacitor/assets
render(1024, "square").save(os.path.join(MASTER, "icon.png"))
render(1024, "fg").save(os.path.join(MASTER, "icon-foreground.png"))
fgbg = Image.new("RGBA", (1024, 1024), TEAL)
fgbg.save(os.path.join(MASTER, "icon-background.png"))
print("icons generated")
