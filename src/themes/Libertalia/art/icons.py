"""Fetch the Material Symbols Sharp icons this theme uses (outlined, weight 300) and print WPF Geometry resources.

Run: python3 src/themes/Libertalia/art/icons.py > icons.generated.xaml, then paste the entries into src/Media.xaml.
The SVGs draw on a 0,-960 960x960 view box; the path data is kept as published (WPF reads the same mini-language)
and IconTemplate moves it down by 960. Apache-2.0 (info/LICENSE-material-symbols.txt).
"""
import re
import urllib.request

URL = ("https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/"
       "{0}/materialsymbolssharp/{0}_wght300_24px.svg")

ICONS = [
    ("search", "Search"), ("close", "Clear"), ("tune", "ViewSettings"), ("bookmarks", "FilterPresets"),
    ("stacks", "Group"), ("sort", "Sort"), ("vertical_split", "DetailsView"), ("grid_view", "GridView"),
    ("view_list", "ListView"), ("download", "Update"), ("account_tree", "Explorer"), ("casino", "Random"),
    ("shuffle", "ViewRandom"), ("filter_alt", "Filter"), ("notifications", "Notifications"),
    ("explore", "Library"), ("bar_chart", "Statistics"), ("remove", "WindowMinimize"),
    ("crop_square", "WindowMaximize"), ("filter_none", "WindowRestore"), ("close", "WindowClose"),
    ("expand_more", "DropDown"), ("chevron_right", "Submenu"), ("check", "Check"), ("add", "Add"),
    ("edit", "Edit"), ("delete", "Remove"), ("settings", "Options"), ("play_arrow", "Play"), ("info", "Info"),
    ("download", "Download"),
]

for name, role in ICONS:
    svg = urllib.request.urlopen(URL.format(name)).read().decode()
    d = " ".join(re.findall(r'\sd="([^"]+)"', svg))
    print('    <Geometry x:Key="Icon%s">F1 %s</Geometry> <!-- %s -->' % (role, d, name))
