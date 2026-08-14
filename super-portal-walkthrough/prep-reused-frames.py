from PIL import Image, ImageDraw, ImageFont
import numpy as np
F='/mnt/skills/examples/canvas-design/canvas-fonts/'
mark=Image.open('fixed/appro-mark.png').convert('RGBA')
f14=ImageFont.truetype(F+'WorkSans-Regular.ttf',14)
f16=ImageFont.truetype(F+'WorkSans-Regular.ttf',16)
f17=ImageFont.truetype(F+'WorkSans-Regular.ttf',17)
fb13=ImageFont.truetype(F+'WorkSans-Bold.ttf',13)
fr13=ImageFont.truetype(F+'WorkSans-Regular.ttf',13)

def logo(im,dy):
    d=ImageDraw.Draw(im); x0,x1,y0,y1=18,208,60+dy,121+dy
    for y in range(y0,y1):
        t=(y-y0)/(y1-y0); d.line([(x0,y),(x1,y)],fill=(int(19-2*t),int(35-2*t),int(63-3*t)))
    w=132; m=mark.resize((w,int(w*mark.size[1]/mark.size[0])),Image.LANCZOS); px=m.load()
    for yy in range(m.size[1]):
        for xx in range(m.size[0]): px[xx,yy]=(120,128,144,px[xx,yy][3])
    im.paste(m,(x0+26,(y0+y1)//2-m.size[1]//2),m)

def omnibox(im):
    a=np.array(im); d=ImageDraw.Draw(im)
    d.rectangle([600,12,1150,34],fill=tuple(int(v) for v in a[22,560]))
    t='demo.superportal.local'; d.text((852-d.textlength(t,font=f17)/2,13),t,font=f17,fill=(178,184,196))

def tabstrip(im):
    a=np.array(im); d=ImageDraw.Draw(im)
    strip=tuple(int(v) for v in a[62,575]); pill=tuple(int(v) for v in a[60,1400])
    d.rectangle([575,48,1698,75],fill=strip)
    d.rounded_rectangle([580,50,1158,72],11,fill=strip)
    d.rounded_rectangle([1164,50,1694,72],11,fill=pill)
    for x0,x1 in [(580,1158),(1164,1694)]:
        t='demo.superportal.local'
        d.text(((x0+x1)/2-d.textlength(t,font=f14)/2,54),t,font=f14,fill=(150,157,170))

def bands(a, X0, X1, y_lo, y_hi):
    col=a[:,X0:X1].mean(axis=2); bg=np.median(col,axis=1)
    hit=(col < bg[:,None]-26).sum(axis=1); base=np.median(hit[y_lo:y_hi])
    out=[]
    for y in range(y_lo,y_hi):
        if hit[y] > base+10:
            if out and y-out[-1][1]<=4: out[-1][1]=y
            else: out.append([y,y])
    return [b for b in out if 4<=b[1]-b[0]<=26]

def rewrite_col(im, X0, X1, y_lo, y_hi, fx, bold=False):
    """Replace a table column's text, sampling each row's true background."""
    a=np.array(im).astype(int); d=ImageDraw.Draw(im); n=0
    for i,(y0,y1) in enumerate(bands(a,X0,X1,y_lo,y_hi)):
        strip=a[max(0,y0-8), X0-8:X1+28]                 # clean background row above the glyphs
        bgc=tuple(int(v) for v in np.median(strip,axis=0))
        d.rectangle([X0-8,y0-8,X1+28,y1+8], fill=bgc)
        d.text((X0, y0-3), fx(i), font=(fb13 if bold else fr13),
               fill=(40,48,70) if sum(bgc)>360 else (150,158,172))
        n+=1
    return n

for n,dy in [('14',0),('16',0),('24',0),('21',33),('22',33)]:
    p=f'orig/o{n}.png'; im=Image.open(p).convert('RGB')
    logo(im,dy); omnibox(im)
    if n in ('21','22'): tabstrip(im)
    im.save(p)

for n,(lo,hi) in [('21',(330,800)),('22',(330,470))]:
    p=f'orig/o{n}.png'; im=Image.open(p).convert('RGB')
    a=rewrite_col(im,1533,1697,lo,hi, lambda i:'Appro', bold=True)
    b=rewrite_col(im,278,470,lo,hi, lambda i:f'APP_2026000002{11-i:02d}')
    im.save(p); print(f'o{n}: channel {a} rows, ids {b} rows')

p='orig/o28.png'; im=Image.open(p).convert('RGB'); a=np.array(im)
omnibox(im); tabstrip(im)
d=ImageDraw.Draw(im)
d.rectangle([1118,124,1266,232], fill=tuple(int(v) for v in a[150,1320]))
w=124; m=mark.resize((w,int(w*mark.size[1]/mark.size[0])),Image.LANCZOS); px=m.load()
for yy in range(m.size[1]):
    for xx in range(m.size[0]): px[xx,yy]=(52,60,86,px[xx,yy][3])
im.paste(m,(1128,168-m.size[1]//2),m)
a2=np.array(im).astype(int)
bgc=tuple(int(v) for v in np.median(a2[488, 760:1010],axis=0))
d.rectangle([760,492,1012,518], fill=bgc)
d.text((764,494),'APP_202600000211',font=f16,fill=(58,66,92))
im.save(p); print('o28 done')
