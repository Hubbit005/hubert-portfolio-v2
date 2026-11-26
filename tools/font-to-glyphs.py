# Glify do assets/font/glyphs.json z pliku OTF (napisy ekspozycyjne, js/glyphs.js).
# Użycie: pip install fonttools && python3 tools/font-to-glyphs.py assets/font/dirtyline-36daysoftype-2022.otf
# Układ jak w starym pliku: oś y w dół, wysokość wielkiej litery CAP jednostek, góra litery na TOP.
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

CAP, TOP, HEIGHT = 131, 2, 155            # jak w glifach Candle Shlop
CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÓ'     # polskie znaki poza Ó: zastępstwo w js/glyphs.js


font = TTFont(sys.argv[1])
cmap, gs = font.getBestCmap(), font.getGlyphSet()
s = CAP / font['OS/2'].sCapHeight
top = font['OS/2'].sCapHeight
r = lambda v: round(v * s, 1)
fmt = lambda v: f'{v:.1f}'.rstrip('0').rstrip('.')

out = {'height': HEIGHT, 'tracking': 0, 'space': r(font['hmtx']['space'][0]),
       'source': 'Dirtyline 36daysoftype 2022 (Dirtyline Studio), licencja: assets/font/LICENSE-dirtyline.txt',
       'glyphs': {}, 'kern': {}}
names = {cmap[ord(c)]: c for c in CHARS}
for name, ch in names.items():
    pen = SVGPathPen(gs, fmt)
    gs[name].draw(TransformPen(pen, (s, 0, 0, -s, 0, top * s + TOP)))
    out['glyphs'][ch] = {'w': r(font['hmtx'][name][0]), 'd': pen.getCommands()}

for lk in font['GPOS'].table.LookupList.Lookup:   # kerning (pary glifów, format 1)
    for st in lk.SubTable:
        st = getattr(st, 'ExtSubTable', st)
        if lk.LookupType != 2 or st.Format != 1: continue
        for first, ps in zip(st.Coverage.glyphs, st.PairSet):
            for pv in ps.PairValueRecord:
                v = getattr(pv.Value1, 'XAdvance', 0)
                if v and first in names and pv.SecondGlyph in names:
                    out['kern'][names[first] + names[pv.SecondGlyph]] = r(v)

json.dump(out, open('assets/font/glyphs.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(out['glyphs']), 'glifów,', len(out['kern']), 'par kerningu')
