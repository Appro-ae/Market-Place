"""Final polish pass (runs after fix_screens.py):

f030 (slide 28, AIP letter):
  - replace the customer name in the salutation and the Customer table row
    with the demo identity from the evidence file's Emirates ID (AAMIR
    RASHID LONE ABDUL RASHID LONE), so the case file is coherent and no
    real customer name remains on the letter
  - re-set the appro letterhead: erase the previous paste minimally, then
    composite a crisp, verified-level wordmark centred on the original
    lockup position (x-height centring)
  - rebuild the Reference Number cell per-row from the cell's own
    background (the earlier flat fill showed as a faint band) and redraw
    the ID in the letter's Arial-metric font (Liberation Sans)

f025 (slide 23):
  - minimal-touch fill: replace only the original ID's ink pixels (plus a
    1px dilation) by per-column vertical interpolation, leaving every
    other pixel of the panel untouched, then redraw the ID at the
    original value metrics
"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np

LS='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
F='/mnt/skills/examples/canvas-design/canvas-fonts/'
def lfont(sz): return ImageFont.truetype(LS,sz)
def wfont(sz,bold=False): return ImageFont.truetype(F+('WorkSans-Bold.ttf' if bold else 'WorkSans-Regular.ttf'),sz)
def lum_of(a): return (a.astype(int)*[0.299,0.587,0.114]).sum(axis=2)
def tight(d,xy,txt,f,fill,track=-0.6):
    x,y=xy
    for ch in txt:
        d.text((x,y),ch,font=f,fill=fill); x+=d.textlength(ch,font=f)+track
MARK=Image.open('fixed/appro-mark.png').convert('RGBA')

# ---------------- f030 ----------------
im=Image.open('final/f030.png').convert('RGB')
a=np.array(im); l=lum_of(a)
# letterhead: minimal erase of the old glyphs, then crisp level repaste
for x in range(1225,1372):
    col=a[160:222,x]; cl=l[160:222,x]
    m=cl<95
    if m.any():
        bg=col[cl>=95]
        col[m]=np.median(bg,axis=0).round() if len(bg)>3 else np.array([103,108,118])
        a[160:222,x]=col
im.paste(Image.fromarray(a),(0,0))
mw=132; mh=int(round(mw*MARK.height/MARK.width))
mk=MARK.resize((mw,mh),Image.LANCZOS)
tint=np.zeros((mh,mw,4),np.uint8)
tint[:,:,0],tint[:,:,1],tint[:,:,2]=50,58,84
tint[:,:,3]=np.asarray(mk)[:,:,3]
mk=Image.fromarray(tint)
im.paste(mk,(1299-mw//2, int(round(199-mh/2-mh*0.15))),mk)
# salutation (dimmed zone)
a=np.array(im)
for y in range(330,352):
    a[y,548:1010]=np.median(a[y,1020:1080],axis=0).round()
im.paste(Image.fromarray(a),(0,0))
d=ImageDraw.Draw(im)
d.text((554,332),'Dear Mr. AAMIR RASHID LONE ABDUL RASHID LONE,',font=lfont(14),fill=(54,60,70))
# reference-number cell
a=np.array(im)
for y in range(512,545):
    a[y,868:1200]=np.median(a[y,1210:1270],axis=0).round()
im.paste(Image.fromarray(a),(0,0))
d=ImageDraw.Draw(im)
d.text((877,518),'APP_202600000211',font=lfont(15),fill=(58,66,92))
# customer cell (bright zone)
a=np.array(im)
for y in range(563,583):
    a[y,873:1290]=np.median(a[y,1300:1345],axis=0).round()
im.paste(Image.fromarray(a),(0,0))
d=ImageDraw.Draw(im)
d.text((877,565),'Mr. AAMIR RASHID LONE ABDUL RASHID LONE',font=lfont(15),fill=(20,20,20))
im.save('final/f030.png'); print('f030 done')

# ---------------- f025 ----------------
ov=Image.open('ov/f025.png').convert('RGB')
im=Image.open('final/f025.png').convert('RGB')
im.paste(ov.crop((350,170,1000,255)),(350,170))
a=np.array(im).astype(float)
o=np.asarray(ov).astype(int); ol=lum_of(o)
m=(ol[199:218,364:640]<235)
md=m.copy()
md[1:,:]|=m[:-1,:]; md[:-1,:]|=m[1:,:]; md[:,1:]|=m[:,:-1]; md[:,:-1]|=m[:,1:]
top=a[195:199,364:640].mean(axis=0)
bot=a[218:222,364:640].mean(axis=0)
n=19
for j in range(md.shape[1]):
    for r in np.where(md[:,j])[0]:
        w=(r+0.5)/n
        a[199+r,364+j]=top[j]*(1-w)+bot[j]*w
im=Image.fromarray(a.clip(0,255).astype('uint8'))
mask=ol[200:216,368:530]<150
px=o[200:216,368:530][mask]
order=np.argsort(px.sum(axis=1))
ink=tuple(int(v) for v in np.median(px[order[:len(order)//4]],axis=0))
ys,xs=np.where(mask)
d=ImageDraw.Draw(im)
tight(d,(368,(200+ys.min())-int(round(13*0.26))),'APP_202600000211',wfont(13),ink)
im.save('final/f025.png'); print('f025 done')
