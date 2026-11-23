#!/usr/bin/env python3
"""
Bliss XP — Deterministic 32-bit Windows XP-style glossy icon generator.
Generates 48x48 (4x supersampled from 192x192 with soft alpha drop shadows,
specular highlights, and rich Luna gradients) PNG menu icons in src/Images/WinXP/*.png.
"""
import math
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src" / "Images" / "WinXP"
OUT_DIR.mkdir(parents=True, exist_ok=True)

S = 192  # 4x supersample canvas -> 48x48


def new_canvas():
    return Image.new("RGBA", (S, S), (0, 0, 0, 0))


def add_shadow(img, offset=(4, 7), blur=7, alpha=95):
    sh = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    a = img.split()[3]
    black = Image.new("RGBA", (S, S), (0, 18, 60, alpha))
    sh.paste(black, offset, a)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    out = Image.alpha_composite(sh, img)
    return out


def vgrad_rect(size, top_rgb, bot_rgb, mid_rgb=None):
    w, h = size
    im = Image.new("RGBA", (w, h))
    px = im.load()
    for y in range(h):
        t = y / max(1, h - 1)
        if mid_rgb is not None:
            if t < 0.45:
                u = t / 0.45
                c = tuple(int(top_rgb[i] + (mid_rgb[i] - top_rgb[i]) * u) for i in range(3))
            else:
                u = (t - 0.45) / 0.55
                c = tuple(int(mid_rgb[i] + (bot_rgb[i] - mid_rgb[i]) * u) for i in range(3))
        else:
            c = tuple(int(top_rgb[i] + (bot_rgb[i] - top_rgb[i]) * t) for i in range(3))
        for x in range(w):
            px[x, y] = (*c, 255)
    return im


def fill_masked(base, mask, top_rgb, bot_rgb, mid_rgb=None):
    grad = vgrad_rect((S, S), top_rgb, bot_rgb, mid_rgb)
    layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    layer.paste(grad, (0, 0), mask)
    return Image.alpha_composite(base, layer)


def draw_orb(base, cx, cy, r, top_rgb, mid_rgb, bot_rgb, border_rgb):
    mask = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    base = fill_masked(base, mask, top_rgb, bot_rgb, mid_rgb)
    # Upper glass gloss
    gloss = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(gloss)
    gd.ellipse((cx - r * 0.68, cy - r * 0.84, cx + r * 0.68, cy - r * 0.05), fill=(255, 255, 255, 135))
    gloss = gloss.filter(ImageFilter.GaussianBlur(3))
    base = Image.alpha_composite(base, gloss)
    # Crisp outer rim
    d = ImageDraw.Draw(base)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(*border_rgb, 255), width=6)
    return base


def draw_rounded_box(base, box, rad, top_rgb, mid_rgb, bot_rgb, border_rgb, gloss_alpha=115):
    mask = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle(box, radius=rad, fill=255)
    base = fill_masked(base, mask, top_rgb, bot_rgb, mid_rgb)
    x0, y0, x1, y1 = box
    gloss = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(gloss)
    gd.rounded_rectangle((x0 + 8, y0 + 6, x1 - 8, y0 + (y1 - y0) * 0.44), radius=max(4, rad - 4), fill=(255, 255, 255, gloss_alpha))
    base = Image.alpha_composite(base, gloss)
    d = ImageDraw.Draw(base)
    d.rounded_rectangle(box, radius=rad, outline=(*border_rgb, 255), width=6)
    return base


def save_icon(img, name):
    final = add_shadow(img)
    out = final.resize((48, 48), Image.Resampling.LANCZOS)
    out.save(OUT_DIR / f"{name}.png", "PNG")


# 1. Play (XP Glossy Green Go Orb)
def make_play():
    im = draw_orb(new_canvas(), 96, 96, 74, (132, 224, 114), (60, 156, 62), (24, 102, 28), (22, 86, 26))
    d = ImageDraw.Draw(im)
    d.polygon([(76, 56), (140, 96), (76, 136)], fill=(255, 255, 255, 248))
    save_icon(im, "play")


# 2. Add (XP Glossy Green Plus Orb)
def make_add():
    im = draw_orb(new_canvas(), 96, 96, 72, (132, 224, 114), (60, 156, 62), (24, 102, 28), (22, 86, 26))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((84, 52, 108, 140), radius=6, fill=(255, 255, 255, 250))
    d.rounded_rectangle((52, 84, 140, 108), radius=6, fill=(255, 255, 255, 250))
    save_icon(im, "add")


# 3. Folder (XP Golden Manila Folder with paper peeking out)
def make_folder():
    im = new_canvas()
    # Back tab
    mask_b = Image.new("L", (S, S), 0)
    mb = ImageDraw.Draw(mask_b)
    mb.rounded_rectangle((22, 36, 92, 72), radius=10, fill=255)
    mb.rounded_rectangle((22, 54, 166, 154), radius=12, fill=255)
    im = fill_masked(im, mask_b, (255, 232, 134), (218, 162, 34), (245, 204, 84))
    # White sheet peeking out
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((38, 62, 150, 128), radius=4, fill=(255, 255, 255, 245), outline=(170, 185, 210, 255), width=4)
    # Front flap (slightly angled XP look)
    mask_f = Image.new("L", (S, S), 0)
    mf = ImageDraw.Draw(mask_f)
    mf.polygon([(26, 82), (174, 82), (164, 158), (22, 158)], fill=255)
    im = fill_masked(im, mask_f, (255, 240, 162), (226, 166, 30), (248, 212, 92))
    d = ImageDraw.Draw(im)
    d.line([(26, 82), (174, 82)], fill=(255, 250, 215, 230), width=5)
    d.polygon([(26, 82), (174, 82), (164, 158), (22, 158)], outline=(168, 114, 16, 255), width=5)
    save_icon(im, "folder")


# 4. Exit (XP Turn Off Computer Glossy Red Square Button)
def make_exit():
    im = draw_rounded_box(new_canvas(), (24, 24, 168, 168), 26, (244, 130, 102), (213, 73, 43), (156, 32, 14), (126, 24, 10))
    d = ImageDraw.Draw(im)
    d.arc((54, 58, 138, 142), start=-52, end=232, fill=(255, 255, 255, 250), width=14)
    d.line([(96, 44), (96, 94)], fill=(255, 255, 255, 250), width=14)
    save_icon(im, "exit")


# 5. Info (XP Glossy Royal Blue Sphere with white 'i')
def make_info():
    im = draw_orb(new_canvas(), 96, 96, 74, (112, 178, 255), (42, 108, 224), (18, 56, 156), (12, 42, 124))
    d = ImageDraw.Draw(im)
    d.ellipse((84, 48, 108, 72), fill=(255, 255, 255, 252))
    d.rounded_rectangle((84, 82, 108, 142), radius=6, fill=(255, 255, 255, 252))
    d.rounded_rectangle((74, 132, 118, 146), radius=5, fill=(255, 255, 255, 252))
    save_icon(im, "info")


# 6. Settings (XP Control Panel Blue/Silver Gear + Gold Center)
def make_settings():
    im = new_canvas()
    mask = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask)
    cx, cy = 96, 96
    for i in range(8):
        ang = i * math.pi / 4
        x = cx + math.cos(ang) * 62
        y = cy + math.sin(ang) * 62
        md.ellipse((x - 16, y - 16, x + 16, y + 16), fill=255)
    md.ellipse((cx - 56, cy - 56, cx + 56, cy + 56), fill=255)
    md.ellipse((cx - 24, cy - 24, cx + 24, cy + 24), fill=0)
    im = fill_masked(im, mask, (236, 244, 255), (96, 134, 198), (168, 196, 236))
    d = ImageDraw.Draw(im)
    d.ellipse((cx - 56, cy - 56, cx + 56, cy + 56), outline=(36, 76, 146, 255), width=5)
    d.ellipse((cx - 26, cy - 26, cx + 26, cy + 26), outline=(36, 76, 146, 255), width=6)
    save_icon(im, "settings")


# 7. Sync / Update (XP Glossy Green & Blue Refresh Arrows)
def make_sync():
    im = new_canvas()
    d = ImageDraw.Draw(im)
    d.arc((30, 30, 162, 162), start=205, end=345, fill=(46, 158, 52, 255), width=22)
    d.polygon([(156, 44), (168, 90), (122, 74)], fill=(46, 158, 52, 255))
    d.arc((30, 30, 162, 162), start=25, end=165, fill=(36, 104, 224, 255), width=22)
    d.polygon([(36, 148), (24, 102), (70, 118)], fill=(36, 104, 224, 255))
    save_icon(im, "sync")


# 8. Download / Install (XP Green Down Arrow onto Metallic Tray)
def make_download():
    im = new_canvas()
    # Metallic drive tray
    im = draw_rounded_box(im, (24, 124, 168, 164), 10, (232, 240, 252), (176, 194, 222), (118, 138, 174), (62, 82, 122), 90)
    d = ImageDraw.Draw(im)
    d.ellipse((138, 138, 152, 152), fill=(52, 212, 66, 255))
    # Glossy green arrow
    mask = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask)
    md.rectangle((74, 24, 118, 86), fill=255)
    md.polygon([(44, 82), (148, 82), (96, 132)], fill=255)
    im = fill_masked(im, mask, (132, 224, 114), (24, 116, 30), (60, 168, 62))
    d = ImageDraw.Draw(im)
    d.polygon([(74, 24), (118, 24), (118, 82), (148, 82), (96, 132), (44, 82), (74, 82)], outline=(20, 86, 24, 255), width=5)
    save_icon(im, "download")


# 9. Desktop Shortcut (XP Bliss Monitor)
def make_desktop():
    im = new_canvas()
    # Stand
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((74, 136, 118, 158), radius=4, fill=(140, 156, 184, 255), outline=(66, 82, 114, 255), width=4)
    d.rounded_rectangle((48, 152, 144, 168), radius=6, fill=(184, 198, 220, 255), outline=(66, 82, 114, 255), width=4)
    # Monitor bezel
    im = draw_rounded_box(im, (20, 24, 172, 140), 14, (238, 244, 252), (190, 206, 232), (132, 152, 186), (52, 76, 122), 80)
    # Bliss sky + rolling green hill screen
    d = ImageDraw.Draw(im)
    d.rectangle((34, 38, 158, 124), fill=(72, 148, 244, 255))
    d.pieslice((16, 78, 168, 176), start=180, end=360, fill=(76, 176, 52, 255))
    d.rectangle((34, 112, 158, 124), fill=(52, 146, 38, 255))
    d.rectangle((34, 38, 158, 124), outline=(28, 66, 142, 255), width=4)
    save_icon(im, "desktop")


# 10. Star / Favorites (XP Golden Beveled 5-point Star)
def make_star(filled=True):
    im = new_canvas()
    pts = []
    cx, cy = 96, 100
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        r = 74 if i % 2 == 0 else 32
        pts.append((cx + math.cos(ang) * r, cy + math.sin(ang) * r))
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    if filled:
        im = fill_masked(im, mask, (255, 244, 148), (224, 148, 12), (252, 206, 52))
        ImageDraw.Draw(im).polygon(pts, outline=(172, 106, 8, 255), width=6)
    else:
        im = fill_masked(im, mask, (242, 242, 242), (186, 186, 186), (218, 218, 218))
        ImageDraw.Draw(im).polygon(pts, outline=(116, 116, 116, 255), width=6)
    save_icon(im, "star" if filled else "star-off")


# 11. Edit (XP Isometric Yellow Wooden Pencil)
def make_edit():
    im = new_canvas()
    d = ImageDraw.Draw(im)
    # Body
    d.polygon([(36, 134), (124, 46), (150, 72), (62, 160)], fill=(248, 198, 48, 255), outline=(156, 102, 12, 255), width=5)
    d.polygon([(46, 144), (134, 56), (144, 66), (56, 154)], fill=(255, 232, 128, 200))
    # Pink eraser + silver ferrule
    d.polygon([(124, 46), (142, 28), (168, 54), (150, 72)], fill=(238, 124, 128, 255), outline=(152, 48, 56, 255), width=5)
    d.polygon([(114, 56), (128, 42), (154, 68), (140, 82)], fill=(208, 218, 232, 255), outline=(92, 108, 134, 255), width=5)
    # Wood tip & graphite
    d.polygon([(36, 134), (62, 160), (24, 172)], fill=(242, 214, 176, 255), outline=(146, 108, 68, 255), width=5)
    d.polygon([(30, 152), (44, 166), (24, 172)], fill=(48, 52, 62, 255))
    save_icon(im, "edit")


# 12. Delete (XP Blue/Silver Recycle Bin)
def make_delete():
    im = new_canvas()
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).polygon([(36, 52), (156, 52), (142, 166), (50, 166)], fill=255)
    im = fill_masked(im, mask, (224, 240, 255), (124, 166, 224), (176, 212, 248))
    d = ImageDraw.Draw(im)
    d.polygon([(36, 52), (156, 52), (142, 166), (50, 166)], outline=(42, 86, 156, 255), width=6)
    d.ellipse((34, 34, 158, 68), fill=(214, 232, 252, 255), outline=(42, 86, 156, 255), width=6)
    # Red cross/danger cue on XP delete
    d.line([(72, 88), (120, 136)], fill=(204, 46, 24, 255), width=14)
    d.line([(120, 88), (72, 136)], fill=(204, 46, 24, 255), width=14)
    save_icon(im, "delete")


# 13. Fullscreen (XP Glossy Blue Window with Expand Arrows)
def make_fullscreen():
    im = draw_rounded_box(new_canvas(), (22, 28, 170, 164), 16, (255, 255, 255), (236, 233, 216), (218, 212, 194), (0, 60, 116), 40)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((22, 28, 170, 62), radius=12, fill=(36, 94, 220, 255), outline=(0, 32, 136, 255), width=5)
    d.polygon([(46, 82), (82, 82), (46, 118)], fill=(36, 94, 220, 255))
    d.polygon([(146, 144), (110, 144), (146, 108)], fill=(36, 94, 220, 255))
    d.line([(56, 92), (136, 134)], fill=(36, 94, 220, 255), width=10)
    save_icon(im, "fullscreen")


# 14. Addons (XP Blue/Gold Software Puzzle Tile)
def make_addons():
    im = draw_rounded_box(new_canvas(), (32, 46, 146, 160), 14, (112, 178, 255), (42, 108, 224), (20, 64, 166), (12, 46, 128))
    d = ImageDraw.Draw(im)
    d.ellipse((72, 22, 114, 64), fill=(76, 142, 242, 255), outline=(12, 46, 128, 255), width=5)
    d.ellipse((128, 84, 170, 126), fill=(248, 188, 48, 255), outline=(156, 102, 12, 255), width=5)
    save_icon(im, "addons")


# 15. Links (XP Blue Globe + Silver Chain)
def make_link():
    im = draw_orb(new_canvas(), 96, 96, 70, (116, 198, 255), (42, 122, 224), (20, 68, 166), (14, 48, 128))
    d = ImageDraw.Draw(im)
    d.ellipse((62, 28, 130, 164), outline=(255, 255, 255, 190), width=5)
    d.line([(28, 96), (164, 96)], fill=(255, 255, 255, 190), width=5)
    d.rounded_rectangle((62, 76, 130, 116), radius=20, outline=(255, 232, 124, 255), width=10)
    save_icon(im, "link")


# 16. Storage / Install Size (XP Isometric Silver Hard Drive)
def make_storage():
    im = draw_rounded_box(new_canvas(), (22, 56, 170, 144), 14, (242, 246, 252), (188, 202, 224), (128, 144, 172), (56, 74, 108))
    d = ImageDraw.Draw(im)
    d.rectangle((28, 110, 164, 138), fill=(156, 172, 198, 255))
    d.ellipse((134, 116, 152, 134), fill=(48, 214, 62, 255), outline=(22, 108, 28, 255), width=3)
    d.line([(42, 124), (108, 124)], fill=(72, 88, 118, 255), width=7)
    save_icon(im, "storage")


# 17. Hide & Unhide (XP Blue Eye)
def make_eye(hidden=False):
    im = new_canvas()
    d = ImageDraw.Draw(im)
    d.ellipse((20, 52, 172, 140), fill=(255, 255, 255, 252), outline=(36, 86, 168, 255), width=7)
    im = draw_orb(im, 96, 96, 30, (116, 184, 255), (38, 108, 224), (16, 56, 148), (12, 42, 118))
    d = ImageDraw.Draw(im)
    d.ellipse((84, 84, 108, 108), fill=(16, 24, 44, 255))
    d.ellipse((86, 84, 96, 94), fill=(255, 255, 255, 240))
    if hidden:
        d.line([(32, 154), (160, 38)], fill=(208, 44, 24, 255), width=14)
    save_icon(im, "hide" if hidden else "unhide")


# 18. HDR (XP Golden Sun)
def make_hdr():
    im = new_canvas()
    d = ImageDraw.Draw(im)
    cx, cy = 96, 96
    for i in range(8):
        ang = i * math.pi / 4
        x1, y1 = cx + math.cos(ang) * 52, cy + math.sin(ang) * 52
        x2, y2 = cx + math.cos(ang) * 78, cy + math.sin(ang) * 78
        d.line([(x1, y1), (x2, y2)], fill=(238, 152, 12, 255), width=12)
    im = draw_orb(im, cx, cy, 42, (255, 246, 152), (248, 188, 36), (222, 124, 12), (176, 94, 8))
    save_icon(im, "hdr")


# 19. Dice (XP Glossy White/Blue Die)
def make_dice():
    im = draw_rounded_box(new_canvas(), (26, 26, 166, 166), 24, (255, 255, 255), (240, 245, 255), (206, 220, 244), (36, 86, 168), 70)
    d = ImageDraw.Draw(im)
    for px, py in [(62, 62), (130, 62), (96, 96), (62, 130), (130, 130)]:
        d.ellipse((px - 12, py - 12, px + 12, py + 12), fill=(28, 78, 186, 255))
    save_icon(im, "dice")


# 20. Manual (XP Help & Support Green/Gold Book)
def make_manual():
    im = draw_rounded_box(new_canvas(), (32, 24, 162, 168), 14, (112, 206, 98), (54, 152, 56), (28, 102, 30), (22, 76, 24))
    d = ImageDraw.Draw(im)
    d.rectangle((32, 24, 56, 168), fill=(24, 94, 28, 255))
    d.rounded_rectangle((68, 48, 144, 78), radius=6, fill=(255, 244, 186, 245))
    d.line([(72, 102), (140, 102)], fill=(255, 255, 255, 220), width=8)
    d.line([(72, 124), (126, 124)], fill=(255, 255, 255, 220), width=8)
    save_icon(im, "manual")


# 21. Backup (XP Blue/Silver Floppy Archive)
def make_backup():
    im = draw_rounded_box(new_canvas(), (24, 24, 168, 168), 14, (112, 174, 252), (42, 106, 220), (20, 64, 164), (14, 46, 126))
    d = ImageDraw.Draw(im)
    d.rectangle((50, 26, 142, 82), fill=(236, 242, 252, 255), outline=(42, 76, 136, 255), width=4)
    d.rectangle((108, 36, 128, 72), fill=(42, 106, 220, 255))
    d.rounded_rectangle((46, 102, 146, 164), radius=6, fill=(255, 252, 232, 255), outline=(42, 76, 136, 255), width=4)
    save_icon(im, "backup")


# 22. Restore (XP System Restore Calendar + Green Rewind Arrow)
def make_restore():
    im = draw_rounded_box(new_canvas(), (26, 34, 166, 166), 14, (255, 255, 255), (242, 246, 255), (212, 224, 246), (36, 86, 168), 50)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((26, 34, 166, 68), radius=12, fill=(36, 104, 224, 255), outline=(14, 48, 136, 255), width=5)
    d.arc((54, 78, 138, 152), start=-40, end=215, fill=(46, 158, 52, 255), width=14)
    d.polygon([(52, 84), (82, 86), (62, 114)], fill=(46, 158, 52, 255))
    save_icon(im, "restore")


if __name__ == "__main__":
    make_play()
    make_add()
    make_folder()
    make_exit()
    make_info()
    make_settings()
    make_sync()
    make_download()
    make_desktop()
    make_star(True)
    make_star(False)
    make_edit()
    make_delete()
    make_fullscreen()
    make_addons()
    make_link()
    make_storage()
    make_eye(True)
    make_eye(False)
    make_hdr()
    make_dice()
    make_manual()
    make_backup()
    make_restore()
    print(f"Generated {len(list(OUT_DIR.glob('*.png')))} XP-style PNG icons in {OUT_DIR}")
