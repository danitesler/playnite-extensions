"""Generate 24 deterministic 48x48 (4x supersampled) macOS Tahoe Liquid Glass squircle PNG menu icons."""
from pathlib import Path
import math
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "src" / "Images" / "MacGlass"
OUT.mkdir(parents=True, exist_ok=True)

S = 192  # 4x supersampling -> 48x48 crisp output


def lerp(a: int, b: int, t: float) -> int:
    return int(round(a + (b - a) * t))


def make_squircle_tile(top_rgb, bot_rgb, rim_rgb=None) -> Image.Image:
    """Create a 192x192 macOS Tahoe Liquid Glass squircle tile with specular top rim."""
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    pad = 12
    rad = 44

    # Soft drop/ambient rim shadow underneath
    shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([pad, pad + 5, S - pad, S - pad + 5], radius=rad, fill=(18, 36, 62, 42))
    img.alpha_composite(shadow)

    # Vertical gradient fill clipped to rounded squircle
    grad = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for y in range(pad, S - pad):
        t = (y - pad) / max(1, (S - 2 * pad - 1))
        r = lerp(top_rgb[0], bot_rgb[0], t)
        g = lerp(top_rgb[1], bot_rgb[1], t)
        b = lerp(top_rgb[2], bot_rgb[2], t)
        gd.line([(pad, y), (S - pad, y)], fill=(r, g, b, 245))

    mask = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([pad, pad, S - pad, S - pad], radius=rad, fill=255)
    tile = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    tile.paste(grad, (0, 0), mask)

    # Liquid Glass upper lens sheen (curved translucent white highlight in upper 46%)
    sheen = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    shd = ImageDraw.Draw(sheen)
    for y in range(pad + 2, int(S * 0.48)):
        t = (y - pad) / (S * 0.42)
        a = int(max(0, (1.0 - t) ** 1.7 * 105))
        shd.line([(pad + 6, y), (S - pad - 6, y)], fill=(255, 255, 255, a))
    sheen_clipped = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sheen_clipped.paste(sheen, (0, 0), mask)
    tile.alpha_composite(sheen_clipped)

    # Crisp 1px (4px at 4x) inner white specular rim + subtle outer edge
    rim = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    rd = ImageDraw.Draw(rim)
    rd.rounded_rectangle(
        [pad + 2, pad + 2, S - pad - 2, S - pad - 2],
        radius=rad - 2,
        outline=(255, 255, 255, 165),
        width=4,
    )
    edge_col = rim_rgb if rim_rgb else (
        max(0, bot_rgb[0] - 28),
        max(0, bot_rgb[1] - 28),
        max(0, bot_rgb[2] - 28),
        160,
    )
    rd.rounded_rectangle(
        [pad, pad, S - pad, S - pad],
        radius=rad,
        outline=edge_col,
        width=3,
    )
    tile.alpha_composite(rim)
    img.alpha_composite(tile)
    return img


def save_icon(name: str, img: Image.Image) -> None:
    out = img.resize((48, 48), Image.Resampling.LANCZOS)
    out.save(OUT / f"{name}.png", optimize=True)


def draw_star(d: ImageDraw.Draw, cx, cy, r_out, r_in, fill, outline=None, width=0):
    pts = []
    for i in range(10):
        ang = math.radians(-90 + i * 36)
        r = r_out if i % 2 == 0 else r_in
        pts.append((cx + math.cos(ang) * r, cy + math.sin(ang) * r))
    d.polygon(pts, fill=fill, outline=outline)
    if outline and width > 1:
        d.line(pts + [pts[0]], fill=outline, width=width, joint="curve")


W = (255, 255, 255, 255)
W_SOFT = (255, 255, 255, 200)
INK = (34, 46, 66, 240)

# macOS Tahoe vibrant Liquid Glass palettes
BLUE = ((66, 168, 255), (0, 112, 243))
CYAN = ((72, 205, 255), (10, 132, 224))
GREEN = ((72, 222, 108), (24, 168, 56))
RED = ((255, 98, 90), (215, 0, 21))
AMBER = ((255, 204, 56), (235, 138, 0))
PURPLE = ((188, 122, 255), (124, 58, 220))
INDIGO = ((122, 134, 255), (68, 76, 214))
SILVER = ((246, 250, 255), (206, 218, 234))
TEAL = ((64, 214, 198), (12, 148, 140))


def build_all() -> None:
    # 1. play (Apple System Green glass tile + rounded white play triangle)
    img = make_squircle_tile(*GREEN)
    d = ImageDraw.Draw(img)
    d.polygon([(74, 54), (74, 138), (138, 96)], fill=W)
    save_icon("play", img)

    # 2. download / install (Sky Blue glass tile + downward arrow & tray)
    img = make_squircle_tile(*BLUE)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([88, 48, 104, 108], radius=8, fill=W)
    d.polygon([(62, 92), (130, 92), (96, 128)], fill=W)
    d.rounded_rectangle([54, 132, 138, 146], radius=7, fill=W)
    save_icon("download", img)

    # 3. add (System Blue + crisp rounded plus)
    img = make_squircle_tile(*BLUE)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([87, 48, 105, 144], radius=9, fill=W)
    d.rounded_rectangle([48, 87, 144, 105], radius=9, fill=W)
    save_icon("add", img)

    # 4. fullscreen (Indigo glass tile + expand corners)
    img = make_squircle_tile(*INDIGO)
    d = ImageDraw.Draw(img)
    for (x1, y1, x2, y2) in [(52, 52, 86, 66), (52, 52, 66, 86),
                             (106, 52, 140, 66), (126, 52, 140, 86),
                             (52, 126, 86, 140), (52, 106, 66, 140),
                             (106, 126, 140, 140), (126, 106, 140, 140)]:
        d.rounded_rectangle([x1, y1, x2, y2], radius=5, fill=W)
    save_icon("fullscreen", img)

    # 5. sync (Cyan glass tile + circular refresh arrows)
    img = make_squircle_tile(*CYAN)
    d = ImageDraw.Draw(img)
    d.arc([50, 50, 142, 142], start=210, end=340, fill=W, width=14)
    d.arc([50, 50, 142, 142], start=30, end=160, fill=W, width=14)
    d.polygon([(126, 52), (148, 76), (118, 82)], fill=W)
    d.polygon([(66, 140), (44, 116), (74, 110)], fill=W)
    save_icon("sync", img)

    # 6. info (System Blue glass tile + SF lowercase 'i')
    img = make_squircle_tile(*BLUE)
    d = ImageDraw.Draw(img)
    d.ellipse([85, 50, 107, 72], fill=W)
    d.rounded_rectangle([86, 84, 106, 142], radius=10, fill=W)
    save_icon("info", img)

    # 7. exit (System Red glass tile + power/sign-out symbol)
    img = make_squircle_tile(*RED)
    d = ImageDraw.Draw(img)
    d.arc([54, 56, 138, 140], start=310, end=230, fill=W, width=14)
    d.rounded_rectangle([89, 44, 103, 96], radius=7, fill=W)
    save_icon("exit", img)

    # 8. settings (Frosted Silver glass tile + brushed dark gear)
    img = make_squircle_tile(*SILVER, rim_rgb=(156, 174, 198, 190))
    d = ImageDraw.Draw(img)
    for i in range(8):
        ang = math.radians(i * 45)
        cx = 96 + math.cos(ang) * 40
        cy = 96 + math.sin(ang) * 40
        d.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], fill=INK)
    d.ellipse([58, 58, 134, 134], fill=INK)
    d.ellipse([76, 76, 116, 116], fill=(236, 243, 252, 255))
    save_icon("settings", img)

    # 9. addons (Purple glass tile + puzzle piece)
    img = make_squircle_tile(*PURPLE)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([58, 66, 128, 136], radius=14, fill=W)
    d.ellipse([80, 46, 110, 76], fill=W)
    d.ellipse([116, 86, 146, 116], fill=W)
    save_icon("addons", img)

    # 10. link (Teal glass tile + interlocking chain capsules)
    img = make_squircle_tile(*TEAL)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([46, 74, 106, 118], radius=22, outline=W, width=12)
    d.rounded_rectangle([86, 74, 146, 118], radius=22, outline=W, width=12)
    save_icon("link", img)

    # 11. folder (Finder Blue glass tile + macOS folder silhouette)
    img = make_squircle_tile(*CYAN)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([48, 60, 96, 84], radius=10, fill=W_SOFT)
    d.rounded_rectangle([48, 72, 144, 136], radius=14, fill=W)
    save_icon("folder", img)

    # 12. storage (Silver glass tile + sleek SSD drive bar)
    img = make_squircle_tile(*SILVER, rim_rgb=(156, 174, 198, 190))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([48, 62, 144, 130], radius=18, fill=INK)
    d.rounded_rectangle([62, 104, 112, 114], radius=5, fill=(100, 185, 255, 255))
    d.ellipse([120, 101, 134, 115], fill=(52, 211, 100, 255))
    save_icon("storage", img)

    # 13. desktop (Blue glass tile + macOS display + stand)
    img = make_squircle_tile(*BLUE)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([48, 54, 144, 118], radius=12, outline=W, width=11)
    d.rounded_rectangle([84, 118, 108, 134], radius=4, fill=W)
    d.rounded_rectangle([68, 130, 124, 142], radius=6, fill=W)
    save_icon("desktop", img)

    # 14. star (Amber gold glass tile + filled white star)
    img = make_squircle_tile(*AMBER)
    d = ImageDraw.Draw(img)
    draw_star(d, 96, 98, 46, 20, fill=W)
    save_icon("star", img)

    # 15. star-off (Silver glass tile + amber star outline)
    img = make_squircle_tile(*SILVER, rim_rgb=(156, 174, 198, 190))
    d = ImageDraw.Draw(img)
    draw_star(d, 96, 98, 44, 19, fill=(255, 175, 20, 235))
    save_icon("star-off", img)

    # 16. hide (Silver glass tile + slashed eye)
    img = make_squircle_tile(*SILVER, rim_rgb=(156, 174, 198, 190))
    d = ImageDraw.Draw(img)
    d.ellipse([48, 68, 144, 124], outline=INK, width=11)
    d.ellipse([82, 82, 110, 110], fill=INK)
    d.line([(54, 138), (138, 54)], fill=(215, 0, 21, 240), width=12)
    save_icon("hide", img)

    # 17. unhide (Cyan glass tile + clear eye)
    img = make_squircle_tile(*CYAN)
    d = ImageDraw.Draw(img)
    d.ellipse([48, 68, 144, 124], outline=W, width=11)
    d.ellipse([80, 80, 112, 112], fill=W)
    save_icon("unhide", img)

    # 18. hdr (Amber glass tile + radiant sun)
    img = make_squircle_tile(*AMBER)
    d = ImageDraw.Draw(img)
    d.ellipse([72, 72, 120, 120], fill=W)
    for i in range(8):
        ang = math.radians(i * 45)
        x1 = 96 + math.cos(ang) * 32
        y1 = 96 + math.sin(ang) * 32
        x2 = 96 + math.cos(ang) * 46
        y2 = 96 + math.sin(ang) * 46
        d.line([(x1, y1), (x2, y2)], fill=W, width=10)
    save_icon("hdr", img)

    # 19. edit (Blue glass tile + angled pencil)
    img = make_squircle_tile(*BLUE)
    d = ImageDraw.Draw(img)
    d.polygon([(54, 138), (64, 108), (118, 54), (138, 74), (84, 128)], fill=W)
    save_icon("edit", img)

    # 20. delete (System Red glass tile + clean trash bin)
    img = make_squircle_tile(*RED)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([54, 58, 138, 70], radius=6, fill=W)
    d.rounded_rectangle([78, 46, 114, 58], radius=6, fill=W)
    d.rounded_rectangle([62, 76, 130, 142], radius=12, fill=W)
    save_icon("delete", img)

    # 21. dice (Purple glass tile + rounded die with pips)
    img = make_squircle_tile(*PURPLE)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([54, 54, 138, 138], radius=18, fill=W)
    for (px, py) in [(76, 76), (116, 76), (96, 96), (76, 116), (116, 116)]:
        d.ellipse([px - 8, py - 8, px + 8, py + 8], fill=(124, 58, 220, 255))
    save_icon("dice", img)

    # 22. manual (Indigo glass tile + open book)
    img = make_squircle_tile(*INDIGO)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([50, 56, 92, 136], radius=10, fill=W)
    d.rounded_rectangle([100, 56, 142, 136], radius=10, fill=W_SOFT)
    save_icon("manual", img)

    # 23. backup (Teal glass tile + archive box + arrow)
    img = make_squircle_tile(*TEAL)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([50, 56, 142, 80], radius=10, fill=W)
    d.rounded_rectangle([56, 86, 136, 138], radius=12, fill=W_SOFT)
    d.rounded_rectangle([80, 102, 112, 114], radius=6, fill=(12, 148, 140, 255))
    save_icon("backup", img)

    # 24. restore (Green glass tile + Time Machine clock-arrow)
    img = make_squircle_tile(*GREEN)
    d = ImageDraw.Draw(img)
    d.arc([50, 50, 142, 142], start=300, end=220, fill=W, width=13)
    d.polygon([(52, 62), (80, 62), (62, 86)], fill=W)
    d.rounded_rectangle([90, 68, 102, 102], radius=6, fill=W)
    d.rounded_rectangle([90, 92, 122, 104], radius=6, fill=W)
    save_icon("restore", img)

    print(f"Generated 24 macOS Liquid Glass icons in {OUT}")


if __name__ == "__main__":
    build_all()
