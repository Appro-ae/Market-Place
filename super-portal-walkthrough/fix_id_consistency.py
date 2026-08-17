"""Application-ID consistency pass (runs after fix_letter.py).

The same ID had drifted into three different styles: oversized bold in the
enquiry tables, tall-and-thin in the details panel, and small blue in the
letter. Each is now measured from its own original text and redrawn to
match exactly:

  - slides 21/22 tables: cap ~8px, semibold (regular double-drawn at a
    0.6px offset), ink = darkest quartile of the original row text
  - slide 23 details: cap 7px, same semibold treatment, near-black ink
  - slide 28 letter reference: Liberation Sans 15 at the original cell
    baseline (cap top y=527), dark gray like the letter body, not blue
"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np

F='/mnt/skills/examples/canvas-design/canvas-fonts/'
def wfont(sz): return ImageFont.truetype(F+'WorkSans-Regular.ttf',sz)
def lum_of(a): return (a.astype(int)*[0.299,0.587,0.114]).sum(axis=2)
def semibold(d,xy,txt,f,fill,track=-0.4):
    x,y=xy
    for ch in txt:
        d.text((x,y),ch,font=f,fill=fill)
        d.text((x+0.6,y),ch,font=f,fill=fill)
        x+=d.textlength(ch,font=f)+track

def ink_of(fp,box,thr=45):
    o=np.asarray(Image.open(fp).convert('RGB')).astype(int)
    ol=lum_of(o); x0,y0,x1,y1=box
    sub=ol[y0:y1,x0:x1]; bp=np.percentile(sub,90)
    m=sub<bp-thr
    px=o[y0:y1,x0:x1][m]
    order=np.argsort(px.sum(axis=1))
    return tuple(int(v) for v in np.median(px[order[:max(1,len(order)//4)]],axis=0))

def fix_ids2(k, ytop, ybot, ids):
    ov=Image.open(f'ov/f{k:03d}.png').convert('RGB')
    im=Image.open(f'final/f{k:03d}.png').convert('RGB')
    im.paste(ov.crop((372,ytop,640,ybot)),(372,ytop))
    a=np.array(im).astype(float)
    TX0,TX1=380,600
    o=np.asarray(ov).astype(int); olu=lum_of(o)
    sub=olu[ytop:ybot,TX0:TX1]
    bgref=np.percentile(sub,90,axis=1)
    inkcnt=(sub<(bgref[:,None]-35)).sum(axis=1)
    rows=np.where(inkcnt>8)[0]
    bands=[]; cur=[rows[0]]
    for r in rows[1:]:
        if r-cur[-1]<=3: cur.append(r)
        else: bands.append(cur); cur=[r]
    bands.append(cur)
    todo=[]
    for b in bands:
        if len(b)<5 or len(b)>14: continue
        y0,y1=ytop+b[0]-2,ytop+b[-1]+3
        band=olu[y0:y1,TX0:TX1]
        bp=np.percentile(band,90)
        ink_m=band<bp-35
        ys,xs=np.where(ink_m)
        px=o[y0:y1,TX0:TX1][ink_m]
        order=np.argsort(px.sum(axis=1))
        ink=tuple(int(v) for v in np.median(px[order[:max(1,len(order)//4)]],axis=0))
        xstart=TX0+xs.min(); xend=TX0+xs.max()+24
        top=a[y0-4:y0-1,TX0:xend].mean(axis=0)
        bot=a[y1+1:y1+4,TX0:xend].mean(axis=0)
        n=y1-y0
        t=np.linspace(0,1,n)[:,None,None]
        a[y0:y1,TX0:xend]=top[None,:,:]*(1-t)+bot[None,:,:]*t
        todo.append((xstart,ytop+b[0],len(b),ink))
    im=Image.fromarray(a.clip(0,255).astype('uint8'))
    d=ImageDraw.Draw(im)
    for i,(xstart,captop,cap,ink) in enumerate(todo):
        sz=int(round(cap/0.72))
        semibold(d,(xstart,captop-int(round(sz*0.26))),ids[i],wfont(sz),ink)
    im.save(f'final/f{k:03d}.png')
    print(f'f{k:03d}:',len(todo),'bands')

fix_ids2(23,450,810,[f'APP_2026000002{n:02d}' for n in range(9,-1,-1)])
fix_ids2(24,345,470,['APP_202600000211','APP_202600000210'])

# slide 23 value line
ov=Image.open('ov/f025.png').convert('RGB'); im=Image.open('final/f025.png').convert('RGB')
im.paste(ov.crop((350,170,1000,255)),(350,170))
a=np.array(im).astype(float)
o=np.asarray(ov).astype(int); ol=lum_of(o)
m=(ol[199:218,364:640]<235)
md=m.copy()
md[1:,:]|=m[:-1,:]; md[:-1,:]|=m[1:,:]; md[:,1:]|=m[:,:-1]; md[:,:-1]|=m[:,1:]
top=a[195:199,364:640].mean(axis=0)
bot=a[218:222,364:640].mean(axis=0)
for j in range(md.shape[1]):
    for r in np.where(md[:,j])[0]:
        w=(r+0.5)/19
        a[199+r,364+j]=top[j]*(1-w)+bot[j]*w
im=Image.fromarray(a.clip(0,255).astype('uint8'))
ink=ink_of('ov/f025.png',(368,202,530,214),60)
d=ImageDraw.Draw(im)
semibold(d,(368,204-3),'APP_202600000211',wfont(10),ink)
im.save('final/f025.png'); print('f025 done')

# slide 28 reference cell
im=Image.open('final/f030.png').convert('RGB')
a=np.array(im)
for y in range(516,544):
    a[y,868:1200]=np.median(a[y,1210:1270],axis=0).round()
im.paste(Image.fromarray(a),(0,0))
rink=ink_of('ov/f030.png',(868,524,1250,542),60)
d=ImageDraw.Draw(im)
lf=ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',15)
d.text((877,524),'APP_202600000211',font=lf,fill=rink)
im.save('final/f030.png'); print('f030 ref done')
