"""Re-sort the Themes table in the root README by overall visual similarity.

Light themes first, then dark; inside each group a nearest-neighbour chain (plus 2-opt) over features taken
from art/screenshot-details.png and art/screenshot-settings.png: 16x9 color layout, hue histogram, brightness,
saturation and edge density. Rows are only moved, never edited.

Usage (repo root): python3 scripts/sort-readme-themes.py   (needs Pillow and numpy)
Then run: node scripts/generate-readmes.mjs --check
"""
import re,colorsys
import numpy as np
from PIL import Image, ImageFilter
rows=open('README.md').read().split('\n')
start=next(i for i,l in enumerate(rows) if l.startswith('### Themes'))
hdr=start+4
end=next(i for i in range(hdr,len(rows)) if not rows[i].startswith('|'))
def feat(k):
    f=[]
    for n in ('details','settings'):
        im=Image.open(f'src/themes/{k}/art/screenshot-{n}.png').convert('RGB').resize((640,360))
        a=np.asarray(im)/255.0
        lay=np.asarray(im.resize((16,9),Image.BOX))/255.0          # layout of colors
        hsv=np.array([colorsys.rgb_to_hsv(*p) for p in lay.reshape(-1,3)])
        h=hsv[:,0];s=hsv[:,1];v=hsv[:,2]
        # color histogram: 12 hue bins weighted by sat on full image (coarse)
        sm=np.asarray(im.resize((80,45),Image.BOX))/255.0
        hs=np.array([colorsys.rgb_to_hsv(*p) for p in sm.reshape(-1,3)])
        hist=np.zeros(12)
        for hh,ss,vv in hs:
            if ss>0.25 and vv>0.2: hist[int(hh*12)%12]+=ss*vv
        hist/=hist.sum()+1e-6
        g=np.asarray(im.convert('L'),dtype=float)/255
        edge=(np.abs(np.diff(g,axis=0)).mean()+np.abs(np.diff(g,axis=1)).mean())
        f.append(np.concatenate([lay.ravel()*0.6, hist*2.0, [edge*8, hs[:,1].mean()*2, hs[:,2].mean()*2, hs[:,2].std()*2]]))
    return np.mean(f,axis=0)
keys=[];F=[];R=[]
for i in range(hdr,end):
    k=re.search(r'src/themes/(\w+)/art/',rows[i]).group(1)
    keys.append(k);F.append(feat(k));R.append(rows[i])
F=np.array(F)
lum=[F[i][:16*9*3].reshape(-1,3).mean() for i in range(len(keys))]
light=[i for i in range(len(keys)) if lum[i]/0.6>0.5]
dark=[i for i in range(len(keys)) if i not in light]
def order(idx,startfn):
    D=lambda a,b:np.linalg.norm(F[a]-F[b])
    s=min(idx,key=startfn); path=[s]; rest=set(idx)-{s}
    while rest:
        n=min(rest,key=lambda j:D(path[-1],j)); path.append(n); rest.remove(n)
    imp=True
    while imp:
        imp=False
        for i in range(1,len(path)-1):
            for j in range(i+1,len(path)):
                a,b=path[i-1],path[i]; c=path[j]; d=path[j+1] if j+1<len(path) else None
                old=D(a,b)+(D(c,d) if d is not None else 0); new=D(a,c)+(D(b,d) if d is not None else 0)
                if new<old-1e-9: path[i:j+1]=path[i:j+1][::-1]; imp=True
    return path
lp=order(light,lambda i:-lum[i])
dp=order(dark,lambda i:lum[i])
final=lp+dp
print('light',[keys[i] for i in lp]);print('dark',[keys[i] for i in dp])
rows[hdr:end]=[R[i] for i in final]
open('README.md','w').write('\n'.join(rows))
