#!/usr/bin/env python3
"""
Overpass — Deterministic Procedural Monochrome Liberty Cartography & Surface Mask Generator.

Generates realistic, GTA IV-inspired organic archipelago cartography (smooth spline coastlines,
industrial piers, neighborhood street grids with T-junctions and varied density, curved parkways,
cloverleaf interchanges, suspension bridges, and an aligned amber-tintable GPS route) as pure-white
(255, 255, 255) RGBA alpha masks under src/Images/fx/.

Seed: 4082008 (deterministic; zero copied game assets).
Run: python src/themes/Overpass/art/sprites.py [--sheet <path-in-scratch>]
"""
import argparse
import math
import os
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SEED = 4082008
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(os.path.join(HERE, "..", "src", "Images", "fx"))


def save_white_mask(alpha_arr: np.ndarray, path: str) -> None:
    a = np.clip(alpha_arr, 0, 255).astype(np.uint8)
    h, w = a.shape
    rgba = np.empty((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255
    rgba[..., 1] = 255
    rgba[..., 2] = 255
    rgba[..., 3] = a
    Image.fromarray(rgba, mode="RGBA").save(path, optimize=True)


def cubic_bezier(p0, p1, p2, p3, steps=48):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        mt = 1.0 - t
        x = (mt**3) * p0[0] + 3 * (mt**2) * t * p1[0] + 3 * mt * (t**2) * p2[0] + (t**3) * p3[0]
        y = (mt**3) * p0[1] + 3 * (mt**2) * t * p1[1] + 3 * mt * (t**2) * p2[1] + (t**3) * p3[1]
        pts.append((x, y))
    return pts


def catmull_rom_closed(pts, steps_per_seg=10):
    """Smooth closed spline through control points for natural coastal silhouettes."""
    out = []
    n = len(pts)
    for i in range(n):
        p0 = pts[(i - 1) % n]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n]
        for s in range(steps_per_seg):
            t = s / steps_per_seg
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    return out


def catmull_rom_open(pts, steps_per_seg=12):
    """Smooth open spline through waypoints for curving expressways and ramps."""
    if len(pts) < 2:
        return pts
    ext = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        for s in range(steps_per_seg):
            t = s / steps_per_seg
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    out.append(pts[-1])
    return out


def draw_polyline(draw: ImageDraw.ImageDraw, pts, width: float, fill: int):
    if len(pts) < 2:
        return
    w = max(1, int(round(width)))
    draw.line(pts, fill=fill, width=w, joint="curve")
    r = w * 0.46
    if r >= 1.5:
        for x, y in (pts[0], pts[-1]):
            draw.ellipse((x - r, y - r, x + r, y + r), fill=fill)


def build_archipelago_cartography(W=960, H=640):
    """
    Build pixel-aligned Liberty-inspired monochrome archipelago layers at 2x supersampling:
      - land: smooth spline coastlines, shipping piers, park cutouts, urban parcel grain
      - roads: broken realistic neighborhood grids, angled avenues, highway casings, cloverleafs, bridges
      - route: single continuous amber-tintable GPS highway/bridge path aligned with roads
    """
    S = 2
    sw, sh = W * S, H * S
    rng = random.Random(SEED)

    land_img = Image.new("L", (sw, sh), 0)
    ld = ImageDraw.Draw(land_img)

    # --- 1. SMOOTH ORGANIC ARCHIPELAGO COASTLINES ---
    # Western industrial peninsula (Alderney)
    west_ctrl = [
        (-50, -50), (190, -50), (195, 35), (168, 95), (186, 165), (156, 225),
        (165, 290), (138, 355), (158, 430), (132, 495), (152, 565), (118, 660), (-50, 660)
    ]
    ld.polygon([(x * S, y * S) for x, y in catmull_rom_closed(west_ctrl, 8)], fill=200)

    # Central urban peninsula (Algonquin) — crisp vertical profile tapering south into harbor
    center_ctrl = [
        (268, -50), (458, -50), (468, 55), (455, 145), (466, 240), (452, 330),
        (462, 425), (435, 505), (392, 558), (344, 568), (305, 535), (282, 465),
        (268, 360), (260, 235), (264, 115)
    ]
    ld.polygon([(x * S, y * S) for x, y in catmull_rom_closed(center_ctrl, 8)], fill=216)

    # Harbor island (Happiness Island) + East River island (Colony Island)
    hap_ctrl = [(222, 540), (254, 536), (272, 562), (266, 600), (236, 610), (214, 582)]
    ld.polygon([(x * S, y * S) for x, y in catmull_rom_closed(hap_ctrl, 8)], fill=170)
    col_ctrl = [(476, 235), (496, 242), (498, 332), (478, 336), (472, 285)]
    ld.polygon([(x * S, y * S) for x, y in catmull_rom_closed(col_ctrl, 6)], fill=178)

    # Eastern boroughs (Broker / Dukes / Bohan) — rich curving coves & southern headland
    east_ctrl = [
        (536, -50), (1010, -50), (1010, 690), (775, 690), (748, 620),
        (765, 552), (722, 496), (668, 488), (618, 522), (566, 505),
        (538, 442), (558, 382), (534, 315), (556, 242), (532, 165),
        (555, 88), (536, 20)
    ]
    ld.polygon([(x * S, y * S) for x, y in catmull_rom_closed(east_ctrl, 8)], fill=208)

    # Authentic stepped rectangular harbor piers & drydocks along channels
    piers = [
        (170, 108, 204, 116), (168, 126, 208, 134), (164, 144, 198, 152),
        (140, 310, 178, 319), (138, 329, 174, 337), (144, 466, 176, 474),
        (232, 128, 266, 136), (235, 147, 266, 154), (236, 250, 268, 258),
        (238, 270, 268, 278), (242, 392, 274, 400),
        (456, 184, 488, 192), (456, 203, 486, 211), (454, 408, 488, 417),
        (514, 362, 548, 371), (512, 383, 546, 391), (528, 444, 562, 453),
        (602, 514, 616, 546), (626, 516, 638, 542),
    ]
    for x0, y0, x1, y1 in piers:
        ld.rectangle((x0 * S, y0 * S, x1 * S, y1 * S), fill=188)

    # Parks (slightly darker recessed land value + organic ponds, never black holes!)
    # Middle Park (Central peninsula)
    ld.rectangle((330 * S, 112 * S, 396 * S, 246 * S), fill=148)
    # Organic lake inside Middle Park
    lake_pts = catmull_rom_closed([(352, 152), (376, 146), (384, 170), (370, 188), (348, 180)], 6)
    ld.polygon([(x * S, y * S) for x, y in lake_pts], fill=55)

    # Meadows Park (Eastern borough — rounded organic lawn with curved pond, like Flushing Meadows in ref1_map)
    park_e_ctrl = [(752, 118), (812, 114), (842, 156), (832, 215), (784, 228), (742, 192)]
    ld.polygon([(x * S, y * S) for x, y in catmull_rom_closed(park_e_ctrl, 8)], fill=152)
    ld.ellipse((774 * S, 152 * S, 810 * S, 194 * S), fill=105)

    # Architectural building-block parcels (crisp varied footprints inside city blocks, ref1_map style)
    block_img = Image.new("L", (sw, sh), 0)
    bd = ImageDraw.Draw(block_img)
    # Central island crisp dense urban blocks
    for bx in [278, 298, 318, 338, 358, 378, 398, 418, 438]:
        for by in range(12, 535, 16):
            if 328 <= bx <= 398 and 110 <= by <= 248:
                continue
            if rng.random() < 0.84:
                pad = rng.randint(1, 2)
                bd.rectangle(((bx + pad) * S, (by + pad) * S, (bx + 15 - pad) * S, (by + 11 - pad) * S), fill=46)
    # Eastern neighborhoods — irregular parcel clusters
    for bx in range(558, 920, 22):
        for by in range(18, 560, 20):
            if 738 <= bx <= 846 and 110 <= by <= 232:
                continue
            if rng.random() < 0.72:
                w_p = rng.randint(10, 17)
                h_p = rng.randint(9, 14)
                bd.rectangle((bx * S, by * S, (bx + w_p) * S, (by + h_p) * S), fill=40)
    # West industrial warehouses (larger rectangular sheds)
    for bx in range(16, 162, 24):
        for by in range(20, 580, 24):
            if rng.random() < 0.68:
                w_p = rng.randint(12, 20)
                h_p = rng.randint(10, 18)
                bd.rectangle((bx * S, by * S, (bx + w_p) * S, (by + h_p) * S), fill=42)

    land_np = np.array(land_img, dtype=np.float32)
    block_np = np.array(block_img, dtype=np.float32)
    land_combined = np.clip(land_np + block_np * (land_np > 165).astype(np.float32), 0, 255)

    # --- 2. REALISTIC NEIGHBORHOOD STREET NETWORKS (broken blocks, T-junctions, varied density) ---
    streets_img = Image.new("L", (sw, sh), 0)
    sd = ImageDraw.Draw(streets_img)

    # A. Central Peninsula (Algonquin): dense crisp Manhattan avenues + selective cross streets
    al_aves = [276, 296, 316, 336, 356, 376, 396, 416, 436, 452]
    for i, ax in enumerate(al_aves):
        is_maj = i in (1, 3, 6, 8)
        w = (3.4 if is_maj else 2.0) * S
        col = 188 if is_maj else 132
        if 332 <= ax <= 394:
            # Stopped cleanly by Middle Park
            draw_polyline(sd, [(ax * S, 0), (ax * S, 112 * S)], w, col)
            draw_polyline(sd, [(ax * S, 246 * S), (ax * S, 558 * S)], w, col)
        else:
            draw_polyline(sd, [(ax * S, 0), (ax * S, 556 * S)], w, col)

    # Cross streets with realistic breaks (plazas, mega-blocks, T-junctions)
    for idx, sy in enumerate(range(12, 542, 16)):
        is_maj = (idx % 5 == 0)
        w = (3.2 if is_maj else 1.7) * S
        col = 182 if is_maj else 124
        if 112 < sy < 246:
            draw_polyline(sd, [(262 * S, sy * S), (330 * S, sy * S)], w, col)
            draw_polyline(sd, [(396 * S, sy * S), (464 * S, sy * S)], w, col)
        else:
            # Break minor cross-streets occasionally for mega-blocks & T-junctions
            if not is_maj and rng.random() < 0.35:
                seg_start = rng.choice([264, 296, 316, 356])
                seg_end = min(464, seg_start + rng.choice([80, 120, 150]))
                draw_polyline(sd, [(seg_start * S, sy * S), (seg_end * S, sy * S)], w, col)
            else:
                draw_polyline(sd, [(262 * S, sy * S), (464 * S, sy * S)], w, col)

    # Middle Park curving perimeter drives + interior winding paths
    draw_polyline(sd, [(330*S, 112*S), (396*S, 112*S), (396*S, 246*S), (330*S, 246*S), (330*S, 112*S)], 2.6*S, 175)
    draw_polyline(sd, catmull_rom_open([(334, 130), (355, 142), (376, 136), (392, 152)], 10), 1.6*S, 122)
    draw_polyline(sd, catmull_rom_open([(336, 224), (356, 206), (376, 214), (392, 198)], 10), 1.6*S, 122)
    draw_polyline(sd, catmull_rom_open([(344, 116), (342, 176), (366, 210), (358, 244)], 10), 1.6*S, 122)

    # Lower Algonquin angled Broadway avenue + financial district tight alleys
    broadway = catmull_rom_open([(316, 246), (344, 326), (368, 412), (358, 548)], 12)
    draw_polyline(sd, [(x*S, y*S) for x, y in broadway], 3.8 * S, 202)
    for ay in range(448, 544, 14):
        draw_polyline(sd, [(302*S, ay*S), (424*S, (ay + 12)*S)], 1.6*S, 130)

    # B. Western Shore (Alderney) — organic neighborhood clusters instead of uniform curves
    # North Alderney (angled suburban blocks)
    for k in range(6):
        x0 = 18 + k * 28
        y_end = rng.randint(210, 290)
        draw_polyline(sd, [(x0*S, 0), ((x0 + 14)*S, y_end*S)], (2.8 if k % 2 == 0 else 1.7)*S, 172 if k % 2 == 0 else 120)
    for k in range(12):
        y0 = 22 + k * 22
        x_start = rng.choice([0, 18, 44]) if k % 2 else 0
        draw_polyline(sd, [(x_start*S, y0*S), (188*S, (y0 - 8)*S)], (2.8 if k % 3 == 0 else 1.7)*S, 168 if k % 3 == 0 else 118)
    # South Alderney industrial district (bold winding dock arteries + stub spurs)
    alderney_art1 = catmull_rom_open([(22, 260), (62, 315), (96, 388), (82, 472), (112, 560), (92, 640)], 12)
    alderney_art2 = catmull_rom_open([(112, 248), (124, 340), (116, 430), (134, 535)], 12)
    draw_polyline(sd, [(x*S, y*S) for x, y in alderney_art1], 3.4*S, 185)
    draw_polyline(sd, [(x*S, y*S) for x, y in alderney_art2], 3.0*S, 175)
    for sy in [286, 314, 342, 376, 408, 446, 482, 520, 558]:
        x0 = rng.choice([12, 36, 62])
        x1 = rng.choice([126, 152, 168])
        draw_polyline(sd, [(x0*S, sy*S), (x1*S, sy*S)], (2.6 if sy % 4 == 0 else 1.7)*S, 162 if sy % 4 == 0 else 120)
        if rng.random() < 0.65:
            # T-junction vertical spur
            sx = rng.randint(x0 + 18, x1 - 18)
            draw_polyline(sd, [(sx*S, sy*S), (sx*S, (sy + rng.choice([28, 36]))*S)], 1.6*S, 118)

    # C. Eastern Boroughs (Broker / Dukes) — 3 distinct street districts meeting at natural angles!
    # District 1: Broker South (west of x=710, y=280..540) — tight Brooklyn rectilinear grid
    for i, bx in enumerate(range(548, 712, 22)):
        is_maj = (i % 3 == 0)
        y_top = 250 if is_maj else rng.choice([265, 290, 315])
        y_bot = 520 if is_maj else rng.choice([460, 490, 515])
        draw_polyline(sd, [(bx*S, y_top*S), (bx*S, y_bot*S)], (3.2 if is_maj else 1.8)*S, 182 if is_maj else 126)
    for i, by in enumerate(range(272, 515, 20)):
        is_maj = (i % 3 == 0)
        x_l = 532 if is_maj else rng.choice([548, 570, 592])
        x_r = 735 if is_maj else rng.choice([660, 695, 725])
        draw_polyline(sd, [(x_l*S, by*S), (x_r*S, by*S)], (3.0 if is_maj else 1.7)*S, 178 if is_maj else 124)

    # District 2: North Dukes / Bohan (x=545..760, y=0..275) — slightly diagonal Queens-style grid
    for i in range(9):
        bx = 552 + i * 24
        is_maj = (i % 3 == 1)
        draw_polyline(sd, [(bx*S, 0), ((bx - 28)*S, 276*S)], (3.0 if is_maj else 1.7)*S, 176 if is_maj else 122)
    for i in range(11):
        by = 18 + i * 23
        is_maj = (i % 3 == 0)
        x_r = 752 if (by < 115 or by > 230) else 744
        if not is_maj and rng.random() < 0.28:
            draw_polyline(sd, [(546*S, by*S), (672*S, (by + 16)*S)], 1.7*S, 120)
        else:
            draw_polyline(sd, [(542*S, by*S), (x_r*S, (by + 20)*S)], (3.0 if is_maj else 1.7)*S, 174 if is_maj else 122)

    # District 3: Far East & Airport Perimeter (x=725..960) — sweeping expressway loops, stadium oval, airport runways
    # Stadium / race oval (like Liberty City stadium in top-right of ref1_map!)
    sd.ellipse((834*S, 28*S, 892*S, 108*S), outline=178, width=int(2.4*S))
    sd.ellipse((844*S, 38*S, 882*S, 98*S), outline=128, width=int(1.6*S))
    # East curving avenues
    east_ave1 = catmull_rom_open([(735, 255), (788, 265), (842, 232), (898, 172), (945, 92)], 12)
    east_ave2 = catmull_rom_open([(712, 342), (776, 355), (836, 326), (886, 268), (948, 185)], 12)
    east_ave3 = catmull_rom_open([(690, 442), (758, 456), (824, 434), (882, 380), (952, 295)], 12)
    for av in (east_ave1, east_ave2, east_ave3):
        draw_polyline(sd, [(x*S, y*S) for x, y in av], 2.8*S, 172)
    # Cross connectors & T-blocks in far east
    for cx, cy0, cy1 in [(768, 228, 472), (804, 215, 452), (838, 195, 428), (874, 145, 392), (912, 118, 345)]:
        draw_polyline(sd, [(cx*S, cy0*S), ((cx + 14)*S, cy1*S)], 1.8*S, 128)
    # Diagonal runways / taxiways far lower-right (ref1_map far-right airport geometry)
    draw_polyline(sd, [(855*S, 498*S), (968*S, 355*S)], 4.2*S, 188)
    draw_polyline(sd, [(874*S, 518*S), (976*S, 386*S)], 2.8*S, 152)
    draw_polyline(sd, [(842*S, 422*S), (955*S, 475*S)], 2.4*S, 146)

    # Park paths inside Meadows Park
    draw_polyline(sd, catmull_rom_open([(755, 132), (790, 148), (828, 165)], 8), 1.6*S, 122)
    draw_polyline(sd, catmull_rom_open([(758, 204), (792, 184), (824, 198)], 8), 1.6*S, 122)

    # Clip local streets strictly inside landmass
    streets_np = np.array(streets_img, dtype=np.float32) * (land_np > 130).astype(np.float32)

    # --- 3. BOLD ELEVATED EXPRESSWAYS, CLOVERLEAF INTERCHANGES & SUSPENSION BRIDGES ---
    hw_casing = Image.new("L", (sw, sh), 0)
    hw_deck = Image.new("L", (sw, sh), 0)
    cd = ImageDraw.Draw(hw_casing)
    hd = ImageDraw.Draw(hw_deck)

    def add_highway(pts, width=6.0, bright=242):
        draw_polyline(cd, pts, (width + 3.4) * S, 255)
        draw_polyline(hd, pts, width * S, bright)
        # Dual-carriageway subtle center seam
        if width >= 5.2:
            draw_polyline(hd, pts, 1.1 * S, int(bright * 0.56))

    # Central Peninsula coastal highway ring (Union Drive / FDR style)
    al_w = [(x*S, y*S) for x, y in catmull_rom_open([(268, -10), (264, 130), (262, 265), (272, 415), (308, 535), (364, 566), (424, 530), (456, 425), (456, 280), (458, 130), (460, -10)], 14)]
    add_highway(al_w, 5.4, 232)

    # West Shore expressway (Plumb / Plumbers Skyway)
    west_hw = [(x*S, y*S) for x, y in catmull_rom_open([(178, -10), (168, 120), (154, 255), (144, 395), (138, 520), (124, 650)], 12)]
    add_highway(west_hw, 5.2, 224)

    # Eastern sweeping Broker-Dukes Expressway (iconic sweeping S-curve + ramps from ref1_map!)
    east_hw = [(x*S, y*S) for x, y in catmull_rom_open([
        (572, -10), (602, 78), (668, 108), (748, 86), (822, 62), (878, 128),
        (855, 224), (788, 305), (710, 368), (654, 424), (662, 502), (728, 566), (762, 650)
    ], 14)]
    add_highway(east_hw, 6.2, 244)

    # Secondary East Cross-Borough Parkway linking Bohan -> Broker Bay
    east_parkway = [(x*S, y*S) for x, y in catmull_rom_open([
        (612, 104), (622, 210), (618, 318), (648, 412)
    ], 10)]
    add_highway(east_parkway, 4.4, 212)

    # Curved expressway on-ramps / cloverleaf loops (tightly integrated into highway junctions!)
    for cx, cy, rad in [(624, 106, 17), (668, 118, 15), (702, 362, 20), (668, 394, 17), (848, 228, 19), (876, 146, 16)]:
        bbox = ((cx - rad) * S, (cy - rad) * S, (cx + rad) * S, (cy + rad) * S)
        cd.ellipse(bbox, outline=255, width=int(4.6 * S))
        hd.ellipse(bbox, outline=222, width=int(2.8 * S))

    # --- ICONIC SUSPENSION BRIDGES CROSSING BLACK WATER ---
    # North East-West Expressway Bridge (Hickey -> Algonquin -> East Borough Bridge!)
    br_nw = cubic_bezier((152*S, 168*S), (210*S, 168*S), (242*S, 168*S), (316*S, 168*S), 32)
    br_ne = cubic_bezier((396*S, 158*S), (485*S, 158*S), (542*S, 154*S), (622*S, 112*S), 42)
    # South Broker Bridge (iconic sweeping southern suspension span from ref1_map!)
    br_se = cubic_bezier((376*S, 408*S), (475*S, 408*S), (558*S, 404*S), (654*S, 382*S), 48)
    # Curved southern on-ramp sweeping gracefully off Broker Bridge into Broker!
    br_se_ramp = cubic_bezier((565*S, 402*S), (602*S, 434*S), (642*S, 456*S), (682*S, 418*S), 32)
    # West-South Booth Tunnel / Causeway
    br_sw = cubic_bezier((126*S, 414*S), (198*S, 414*S), (248*S, 414*S), (316*S, 414*S), 32)

    add_highway(br_se_ramp, 4.0, 218)
    for br in (br_nw, br_ne, br_se, br_sw):
        add_highway(br, 6.4, 250)

    # Merge local streets + dark highway casing + elevated decks
    casing_np = np.array(hw_casing, dtype=np.float32) / 255.0
    deck_np = np.array(hw_deck, dtype=np.float32)
    roads_combined = streets_np * (1.0 - casing_np * 0.90)
    roads_combined = np.maximum(roads_combined, deck_np)

    # --- 4. ALIGNED AMBER GPS ROUTE TRACE (follows actual bridge + expressway!) ---
    route_img = Image.new("L", (sw, sh), 0)
    rd = ImageDraw.Draw(route_img)
    gps_pts = (
        [(336*S, 488*S), (336*S, 408*S), (376*S, 408*S)]
        + br_se
        + [(x*S, y*S) for x, y in catmull_rom_open([(654, 382), (710, 368), (788, 305), (855, 224), (878, 128), (822, 62)], 14)]
    )
    draw_polyline(rd, gps_pts, 4.2 * S, 245)
    # Destination waypoint ring at end of route
    dx, dy = 822 * S, 62 * S
    rd.ellipse((dx - 11*S, dy - 11*S, dx + 11*S, dy + 11*S), outline=255, width=int(2.4*S))
    rd.ellipse((dx - 4*S, dy - 4*S, dx + 4*S, dy + 4*S), fill=255)
    # Subtle GTA IV map crosshair lines intersecting cleanly over the East River channel
    cx_ch, cy_ch = 508 * S, 294 * S
    rd.line([(335*S, cy_ch), (690*S, cy_ch)], fill=95, width=int(1.2*S))
    rd.line([(cx_ch, 150*S), (cx_ch, 442*S)], fill=95, width=int(1.2*S))

    # Downsample 2x -> 1x with LANCZOS for razor-crisp Swiss anti-aliasing
    land_1x = Image.fromarray(np.clip(land_combined, 0, 255).astype(np.uint8), "L").resize((W, H), Image.LANCZOS)
    roads_1x = Image.fromarray(np.clip(roads_combined, 0, 255).astype(np.uint8), "L").resize((W, H), Image.LANCZOS)
    route_1x = route_img.resize((W, H), Image.LANCZOS)

    land_arr = np.array(land_1x, dtype=np.float32)
    roads_arr = np.array(roads_1x, dtype=np.float32)
    route_arr = np.array(route_1x, dtype=np.float32)

    # Organic soft vignette so full-page maps dissolve smoothly into pitch-black water
    yy, xx = np.mgrid[0:H, 0:W]
    nx = (xx / (W - 1)) * 2.0 - 1.0
    ny = (yy / (H - 1)) * 2.0 - 1.0
    dist_edge = np.sqrt((nx * 0.90)**2 + (ny * 0.94)**2)
    vignette = np.clip(1.30 - dist_edge * 0.72, 0.0, 1.0) ** 1.35

    return land_arr, roads_arr, route_arr, land_arr * vignette, roads_arr * vignette, route_arr * np.clip(vignette * 1.15, 0.0, 1.0)


def build_rail_map(land_raw, roads_raw):
    """Vertical 88x720 slice of dense Algonquin shoreline, bridges & cross-streets for the 44px rail."""
    # Crop over rich Algonquin east avenues + bridge approaches (x: 382..470)
    crop_l = land_raw[:, 382:470]
    crop_r = roads_raw[:, 382:470]
    comb = np.clip(crop_l * 0.30 + crop_r * 0.98, 0, 255).astype(np.uint8)
    img = Image.fromarray(comb, "L").resize((88, 720), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    # Smooth vertical fade: calm pure black behind top radar & rail icons, rich cartography below
    y = np.linspace(0.0, 1.0, 720)[:, None]
    fade = np.clip((y - 0.24) / 0.42, 0.0, 1.0) ** 1.35
    foot = np.clip((1.0 - y) / 0.06, 0.0, 1.0)
    return arr * fade * foot


def build_band_map(land_raw, roads_raw):
    """Horizontal 800x96 expressway, Broker Bridge & interchange strip fading left-to-right."""
    crop_l = land_raw[346:442, 160:960]
    crop_r = roads_raw[346:442, 160:960]
    comb = np.clip(crop_l * 0.28 + crop_r * 0.96, 0, 255).astype(np.uint8)
    arr = comb.astype(np.float32)
    x = np.linspace(0.0, 1.0, 800)[None, :]
    fade_x = np.clip((x - 0.12) / 0.40, 0.0, 1.0) ** 1.25
    fade_r = np.clip((1.0 - x) / 0.08, 0.38, 1.0)
    return arr * fade_x * fade_r


def build_plate_map(roads_raw):
    """Crisp 320x80 zoomed interchange & diagonal expressway etching for PlayButton & active plates."""
    # Crop over sweeping Broker Bridge ramp + cloverleaf interchange (y: 342..422, x: 540..860)
    crop = roads_raw[342:422, 540:860]
    arr = crop.astype(np.float32)
    x = np.linspace(0.0, 1.0, 320)[None, :]
    fade = 0.28 + 0.72 * np.clip((x - 0.06) / 0.50, 0.0, 1.0)
    return arr * fade


def build_edge_strip():
    """480x32 organic elevated-highway cartographic border detail (dual rail + crossing avenue ticks + ramp)."""
    S = 2
    W, H = 480, 32
    img = Image.new("L", (W * S, H * S), 0)
    d = ImageDraw.Draw(img)
    d.line([(0, 16 * S), (W * S, 16 * S)], fill=235, width=int(1.6 * S))
    d.line([(52 * S, 20 * S), (428 * S, 20 * S)], fill=125, width=int(1.0 * S))
    rng = random.Random(SEED + 77)
    x = 34
    while x < W - 34:
        step = rng.choice([14, 18, 22, 28, 34])
        is_ave = (step >= 28)
        top_y = (10 if is_ave else 13) * S
        bot_y = (23 if is_ave else 20) * S
        d.line([(x * S, top_y), (x * S, bot_y)], fill=200 if is_ave else 135, width=int((1.6 if is_ave else 1.0) * S))
        x += step
    ramp = cubic_bezier((322*S, 16*S), (336*S, 8*S), (356*S, 8*S), (370*S, 16*S), 24)
    draw_polyline(d, ramp, 1.3 * S, 185)
    img1 = img.resize((W, H), Image.LANCZOS)
    arr = np.array(img1, dtype=np.float32)
    xs = np.linspace(0.0, 1.0, W)[None, :]
    taper = np.clip(np.minimum(xs / 0.14, (1.0 - xs) / 0.14), 0.0, 1.0)
    return arr * taper


def build_asphalt_grain(size=256):
    rng = np.random.default_rng(SEED + 99)
    fine = rng.normal(128.0, 48.0, (size, size))
    coarse = Image.fromarray(np.clip(rng.normal(128, 55, (size // 4, size // 4)), 0, 255).astype(np.uint8), "L")
    coarse = np.array(coarse.resize((size, size), Image.BICUBIC), dtype=np.float32)
    return np.clip(fine * 0.65 + coarse * 0.35, 0, 255)


def write_contact_sheet(masks, out_path):
    bg = Image.new("RGB", (1320, 960), (10, 11, 12))
    draw = ImageDraw.Draw(bg)

    def tint_paste(alpha_arr, color_rgb, pos, size, mult=1.0):
        a = Image.fromarray(np.clip(alpha_arr * mult, 0, 255).astype(np.uint8), "L").resize(size, Image.LANCZOS)
        layer = Image.new("RGB", size, color_rgb)
        bg.paste(layer, pos, a)

    draw.rectangle((18, 18, 662, 450), fill=(0, 0, 0), outline=(61, 63, 67))
    tint_paste(masks["map-land"], (35, 37, 40), (20, 20), (640, 426), 1.0)
    tint_paste(masks["map-roads"], (148, 150, 154), (20, 20), (640, 426), 0.94)
    tint_paste(masks["map-route"], (232, 157, 16), (20, 20), (640, 426), 0.92)
    draw.text((28, 456), "Composite: map-land + map-roads + map-route (amber GPS)", fill=(235, 236, 239))

    draw.rectangle((682, 18, 1300, 450), fill=(10, 11, 12), outline=(61, 63, 67))
    tint_paste(masks["map-land"], (35, 37, 40), (684, 20), (614, 426), 0.68)
    tint_paste(masks["map-roads"], (148, 150, 154), (684, 20), (614, 426), 0.25)
    tint_paste(masks["map-route"], (232, 157, 16), (684, 20), (614, 426), 0.28)
    draw.text((692, 456), "Real Page Strength (land 68%, roads 25%, route 28%)", fill=(235, 236, 239))

    draw.rectangle((20, 490, 112, 920), fill=(0, 0, 0), outline=(61, 63, 67))
    tint_paste(masks["map-rail"], (148, 150, 154), (22, 492), (88, 426), 0.50)
    draw.text((20, 928), "map-rail", fill=(200, 202, 205))

    draw.rectangle((140, 490, 944, 590), fill=(0, 0, 0), outline=(61, 63, 67))
    tint_paste(masks["map-band"], (148, 150, 154), (142, 492), (800, 96), 0.45)
    draw.text((140, 596), "map-band (top panel / settings header strip)", fill=(200, 202, 205))

    draw.rectangle((140, 632, 464, 716), fill=(232, 157, 16), outline=(61, 63, 67))
    tint_paste(masks["map-plate"], (10, 11, 12), (142, 634), (320, 80), 0.20)
    draw.text((140, 722), "map-plate on Amber hover", fill=(200, 202, 205))

    draw.rectangle((484, 632, 808, 716), fill=(235, 236, 239), outline=(61, 63, 67))
    tint_paste(masks["map-plate"], (10, 11, 12), (486, 634), (320, 80), 0.14)
    draw.text((484, 722), "map-plate on Swiss white rest", fill=(200, 202, 205))

    draw.rectangle((140, 760, 624, 800), fill=(10, 11, 12), outline=(61, 63, 67))
    tint_paste(masks["map-edge"], (148, 150, 154), (142, 764), (480, 32), 0.85)
    draw.text((140, 808), "map-edge (cartographic highway border detail)", fill=(200, 202, 205))

    draw.rectangle((980, 490, 1240, 750), fill=(16, 17, 19), outline=(61, 63, 67))
    tint_paste(masks["asphalt-grain"], (235, 236, 239), (982, 492), (256, 256), 0.08)
    draw.text((980, 758), "asphalt-grain (8%)", fill=(200, 202, 205))

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    bg.save(out_path)
    print(f"Contact sheet written to {out_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sheet", default=None, help="Optional scratch PNG contact sheet path")
    args = parser.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    land_raw, roads_raw, route_raw, land_vig, roads_vig, route_vig = build_archipelago_cartography()

    masks = {
        "map-land": land_vig,
        "map-roads": roads_vig,
        "map-route": route_vig,
        "map-rail": build_rail_map(land_raw, roads_raw),
        "map-band": build_band_map(land_raw, roads_raw),
        "map-plate": build_plate_map(roads_raw),
        "map-edge": build_edge_strip(),
        "asphalt-grain": build_asphalt_grain(),
    }

    for name, arr in masks.items():
        p = os.path.join(OUT_DIR, f"{name}.png")
        save_white_mask(arr, p)
        print(f"Wrote {p} ({arr.shape[1]}x{arr.shape[0]})")

    if args.sheet:
        write_contact_sheet(masks, args.sheet)


if __name__ == "__main__":
    main()
