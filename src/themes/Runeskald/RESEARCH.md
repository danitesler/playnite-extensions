# Runeskald reference notes

The source is Santa Monica Studio’s *God of War Ragnarök*. The [supplied gallery](https://www.gameuidatabase.com/gameData.php?id=2038) identifies the game and groups 1920×1080 captures by screen in its [April 2025 snapshot](https://web.archive.org/web/20250401092652/https://www.gameuidatabase.com/gameData.php?id=2038). For closer inspection, the [UI designer's gallery](https://zachgamedev.com/god-of-war-ragnarok/) supplies the front end, accessibility, armor, weapon attachment and HUD stills. [PlayStation's accessibility guide](https://www.playstation.com/en-us/games/god-of-war-ragnarok/accessibility/) documents HUD customization and adjustable UI text.

## Measurements

These are median RGB values across rectangular patches of the designer's 1024×576 JPEG reproductions. Coordinates are left, top, right, bottom from the top-left. Compression, scene lighting and translucency influence the result.

| Screen | Region | Sample | Application |
| --- | --- | --- | --- |
| Accessibility presets (image 120) | 30,240–300,260 | #080708 | Window well |
| Accessibility presets | 40,100–160,112 | #F5F5F6 | Bright center of focused silver |
| Chest armor (122) | 96,420–270,472 | #020204 | Recessed equipment rail |
| Chest armor | 82,276–158,294 | #CECECE | Brushed metal focus band |
| Axe attachment (124) | 365,165–538,195 | #384B5C | Distant blue steel |
| Axe attachment | 315,484–432,513 | #090D15 | Deep blue-black page |

The accessibility menu uses rule-separated rows, narrow framed fields and a focused strip with dark lettering. In the front end (129) the strip tapers into the scenery at its ends. Armor uses a narrow column of square equipment sockets, a line of text tabs across the foot and a pair of nested diamond portraits. The HUD (130) pairs a long green health bar with circular and diamond sockets. Yellow calls out a tutorial action on the attachment screen. Runeskald reserves a muted amber for notifications and green for live game states.

The source pairs wide uppercase labels with smaller readable body text. Runeskald uses bundled Jost for labels, body text and headings. Its silver grain and interlaced clasp are original. The timings in the brief are design choices inferred from focus changes and HUD behavior. The stills supply no frame timings.

The fictional library uses crops of Johan Christian Dahl’s 1842 painting *View from Stalheim* (National Museum of Norway) as example game artwork in the HTML only. The painting and faithful reproduction carry the [Public Domain Mark](https://commons.wikimedia.org/wiki/File:Johan_Christian_Claussen_Dahl_%E2%80%93_View_from_Stalheim_%E2%80%93_Google_Art_Project.jpg).

## Supplied captures

The nine supplied 1920×1080 images add close reference for Load, Options, the loading tip, Gameplay, Graphics & Camera, the shield reward, Transmog, realm travel and Winter’s Bite. The Options strip reads as cloudy silver with a broad white left half and a dimmer right edge. Gameplay and Graphics use a geometric sans, parchment headings, hairline tracks and hollow diamond thumbs. The reward card uses a warm flash, the tutorial uses a short yellow alert ribbon, and the realm gate supplies the idea of a small interlaced fitting. The loading tip keeps its emblem quiet above a bank of blue fog.

| Capture / crop in pixels | Measurement | Theme use |
| --- | --- | --- |
| Options, (300,235)–(390,280) | Mean #CACACA, most frequent #CCCCCC | Frost ribbon midtone |
| Gameplay, (1197,69)–(1400,98) | Most frequent light warm text pixel #DDDEBE | Section headings |
| Winter’s Bite, (641,72)–(741,104) | Mean #183D54 | Equipment header glaze |
| Loading tip, (580,695)–(760,770) | Mean #11171D | Low fog grounding |

Bundled Jost supplies the geometric sans proportions. The frost ribbon and fog are generated from seeded smooth noise. No pixels from the supplied captures ship in the package.
