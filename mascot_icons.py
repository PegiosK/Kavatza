#!/usr/bin/env python3
"""Generate all launcher/PWA icons from the cat mascot, on the new vault-teal bg."""
from PIL import Image, ImageDraw

VAULT = (12, 63, 58, 255)   # #0C3F3A — the new deep teal
mascot = Image.open("public/mascot/mascot-circle.png").convert("RGBA")

def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=255)
    return m

def circle_mask(size):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).ellipse([0, 0, size-1, size-1], fill=255)
    return m

def compose(target, mode, mascot_frac):
    """mode: 'square' | 'round' | 'fg' (transparent, for adaptive foreground)"""
    bg = Image.new("RGBA", (target, target), VAULT if mode != "fg" else (0,0,0,0))
    m = int(target * mascot_frac)
    ms = mascot.resize((m, m), Image.LANCZOS)
    off = (target - m) // 2
    bg.alpha_composite(ms, (off, off))
    if mode == "square":
        out = Image.new("RGBA", (target, target), (0,0,0,0))
        out.paste(bg, (0,0), rounded_mask(target, int(target*0.22)))
        return out
    if mode == "round":
        out = Image.new("RGBA", (target, target), (0,0,0,0))
        out.paste(bg, (0,0), circle_mask(target))
        return out
    return bg  # fg: mascot on transparent, safe-zone sized

# ---- Android launcher icons ----
DENS = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
for dens, k in DENS.items():
    folder = f"android/app/src/main/res/mipmap-{dens}"
    sq = int(round(48 * k))
    fgsize = int(round(108 * k))
    compose(sq, "square", 0.86).save(f"{folder}/ic_launcher.png")
    compose(sq, "round", 0.86).save(f"{folder}/ic_launcher_round.png")
    compose(fgsize, "fg", 0.62).save(f"{folder}/ic_launcher_foreground.png")

# ---- PWA icons: FULL-BLEED square, no rounding (the OS/launcher does its own
# masking; rounding here would bake black corners into an opaque PNG). ----
def flat(target, mascot_frac):
    bg = Image.new("RGBA", (target, target), VAULT)
    m = int(target * mascot_frac)
    ms = mascot.resize((m, m), Image.LANCZOS)
    off = (target - m) // 2
    bg.alpha_composite(ms, (off, off))
    return bg.convert("RGB")

flat(192, 0.86).save("public/icon-192.png")
flat(512, 0.86).save("public/icon-512.png")

# ---- master art for reference ----
compose(1024, "square", 0.86).save("resources/icon.png")
compose(1024, "fg", 0.62).save("resources/icon-foreground.png")
Image.new("RGBA", (1024,1024), VAULT).save("resources/icon-background.png")

print("mascot icons generated")
