from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
F='/mnt/skills/examples/canvas-design/canvas-fonts/'
f14=ImageFont.truetype(F+'WorkSans-Regular.ttf',14)
f16=ImageFont.truetype(F+'WorkSans-Regular.ttf',16)
f17=ImageFont.truetype(F+'WorkSans-Regular.ttf',17)
fb13=ImageFont.truetype(F+'WorkSans-Bold.ttf',13)
fr13=ImageFont.truetype(F+'WorkSans-Regular.ttf',13)

# ---- the portal's own logo block, lifted whole from a Set 1 frame ----
SRC=np.array(Image.open('set1/shots/shot-03.png').convert('RGB')).astype(float)
BLK=SRC[210:356, 28:574]                       # container + soft margin, native render
SRC_BG=np.median(BLK[:6,:].reshape(-1,3),axis=0)

def native_logo(im, dy):
    a=np.array(im).astype(float); H,W=a.shape[:2]
    y_top=44+dy                                # lockup y 64..117, divider y 128..131
    # clear the lockup area only — stop well before the frame's own divider
    for y in range(y_top, 124+dy):
        bg=np.median(a[y, 3:12], axis=0)
        a[y, 2:227]=bg
    # gain-match the native block to this frame's dimmed sidebar
    tgt_bg=np.median(a[y_top+40, 3:12], axis=0)
    s=float(tgt_bg.mean())/max(float(SRC_BG.mean()),1.0)   # overall dim level
    ac=(255.0*s - tgt_bg)/np.maximum(255.0 - SRC_BG, 1.0)  # per-channel affine:
    bc=tgt_bg - ac*SRC_BG                                  # bg->tgt_bg, white->neutral grey
    blk=np.clip(BLK*ac[None,None,:]+bc[None,None,:],0,255)
    w=206; h=int(BLK.shape[0]*w/BLK.shape[1])
    blki=Image.fromarray(blk.astype('uint8')).resize((w,h), Image.LANCZOS)
    out=Image.fromarray(a.clip(0,255).astype('uint8'))
    # feathered paste, centred where the old lockup sat
    cx, cy = 116, 90+dy                        # centre of the native lockup span
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rectangle([3,3,w-4,h-4],fill=255)
    m=m.filter(ImageFilter.GaussianBlur(2))
    out.paste(blki,(cx-w//2, cy-h//2), m)
    return out

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
    a=np.array(im).astype(int); d=ImageDraw.Draw(im); n=0
    for i,(y0,y1) in enumerate(bands(a,X0,X1,y_lo,y_hi)):
        strip=a[max(0,y0-8), X0-8:X1+28]
        bgc=tuple(int(v) for v in np.median(strip,axis=0))
        d.rectangle([X0-8,y0-8,X1+28,y1+8], fill=bgc)
        d.text((X0, y0-3), fx(i), font=(fb13 if bold else fr13),
               fill=(40,48,70) if sum(bgc)>360 else (150,158,172))
        n+=1
    return n

for n,dy in [('14',0),('16',0),('24',0),('21',33),('22',33)]:
    p=f'orig/o{n}.png'; im=Image.open(p).convert('RGB')
    im=native_logo(im,dy); omnibox(im)
    if n in ('21','22'): tabstrip(im)
    im.save(p)
for n,(lo,hi) in [('21',(330,800)),('22',(330,470))]:
    p=f'orig/o{n}.png'; im=Image.open(p).convert('RGB')
    a=rewrite_col(im,1533,1697,lo,hi, lambda i:'Appro', bold=True)
    b=rewrite_col(im,278,470,lo,hi, lambda i:f'APP_2026000002{11-i:02d}')
    im.save(p); print(f'o{n}: channel {a}, ids {b}')

mark=Image.open('fixed/appro-mark.png').convert('RGBA')
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
