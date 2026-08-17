"""Repair every remaining cut/paste-looking edit found in the full-frame audit:

f025 (slide 23): big Application ID sat on a flat-white box that broke the
    panel's subtle gradient -> revert, per-column ink inpaint + per-row tail
    fill that keeps the gradient, redraw the ID.
f004 (slide 2): rewritten caption ink was sampled after the erase, so the
    text was nearly invisible -> refill band per-row, redraw with the native
    caption ink measured from an untouched slide.
f005 (slide 3): "Channel: Bank" was drawn as an undimmed white pill offset
    from the original -> revert, swap the text inside the original dimmed
    pill only.
f017 (slide 15): dialog text overflowed the dialog border -> revert, erase
    the original lines inside the dialog interior, redraw re-wrapped lines
    that fit.
f034 (slide 32): "Bank x" chip lost its pill outline -> revert, redraw a
    correctly sized outlined pill in the dimmed style.
f031/f032 (slides 29/30): collapsed-sidebar logo swap wiped the divider and
    left a bright band; the native collapsed state is four dots -> revert,
    erase only the icon inside the container, draw the four dots.
"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np

F='/mnt/skills/examples/canvas-design/canvas-fonts/'
def font(sz,bold=False): return ImageFont.truetype(F+('WorkSans-Bold.ttf' if bold else 'WorkSans-Regular.ttf'),sz)

def tight(d,xy,txt,f,fill,track=-1.5):
    x,y=xy
    for ch in txt:
        d.text((x,y),ch,font=f,fill=fill)
        x+=d.textlength(ch,font=f)+track

def lum_of(a): return (a.astype(int)*[0.299,0.587,0.114]).sum(axis=2)

def load(k):
    ov=Image.open(f'ov/f{k:03d}.png').convert('RGB')
    im=Image.open(f'final/f{k:03d}.png').convert('RGB')
    return ov,im

def revert(im,ov,box):
    im.paste(ov.crop(box),(box[0],box[1]))

def save(im,k): im.save(f'final/f{k:03d}.png')

# ---------- f025 : big Application ID ----------
ov,im=load(25)
revert(im,ov,(350,170,1000,255))
a=np.array(im)
for y in range(194,230):
    bgc=np.median(a[y,640:690],axis=0)
    a[y,364:635]=bgc.round()
im.paste(Image.fromarray(a),(0,0))
ol=lum_of(np.asarray(ov)); ink_mask=ol[194:230,364:635]<120
rows=ink_mask.sum(axis=1)
capr=np.where(rows>rows.max()*0.3)[0]
cap=capr.max()-capr.min()+1; base_y=194+capr.min()
oink=np.asarray(ov)[194:230,364:635][ink_mask]
ink=tuple(int(v) for v in np.median(oink,axis=0))
sz=int(round(cap/0.72))
d=ImageDraw.Draw(im)
tight(d,(368,base_y-int(sz*0.26)),'APP_202600000211',font(sz,True),ink,track=-0.8)
save(im,25); print('f025 done cap',cap,'sz',sz)

# ---------- f004 : caption ink ----------
ov,im=load(4)
a=np.array(im)
for y in range(1000,1078):
    bgc=tuple(int(v) for v in np.median(a[y,1520:1560],axis=0))
    a[y,528:1515]=bgc
im.paste(Image.fromarray(a),(0,0))
d=ImageDraw.Draw(im)
INK=(195,210,239)
f21=font(21)
d.text((540,1006),'The channel is active in Dubai, with Mortgage Loan assigned and enabled. Every product',font=f21,fill=INK)
d.text((540,1036),'toggle moves only after checker approval.',font=f21,fill=INK)
save(im,4); print('f004 done')

# ---------- f005 : dimmed channel pill ----------
ov,im=load(5)
revert(im,ov,(580,185,780,245))
a=np.array(im); l=lum_of(a)
px0,px1=626,747
k=9; ker=np.ones(k)/k
pad=lambda v: np.concatenate([np.repeat(v[:1],k//2,0),v,np.repeat(v[-1:],k//2,0)])
fills=[]
for x in range(px0+3,px1-2):
    col=a[199:221,x]; cl=l[199:221,x]
    bg=col[(cl>=95)&(cl<103)]
    fills.append(np.median(bg,axis=0) if len(bg)>2 else fills[-1] if fills else np.array([60,66,84]))
fills=np.array(fills,float)
fills=np.stack([np.convolve(pad(fills)[:,c],ker,'valid') for c in range(3)],1)
for i,x in enumerate(range(px0+3,px1-2)):
    a[200:220,x]=fills[i].round()
im.paste(Image.fromarray(a),(0,0))
d=ImageDraw.Draw(im)
f13=font(13,True); txt='Channel: Bank'
w=sum(d.textlength(c,font=f13)-0.6 for c in txt)
tight(d,(int((px0+px1)/2-w/2),201),txt,f13,(36,47,67),track=-0.6)
save(im,5); print('f005 done')

# ---------- f017 : publish dialog ----------
ov,im=load(17)
revert(im,ov,(780,435,1140,540))
a=np.array(im); l=lum_of(a)
IX0,IX1,IY0,IY1=802,1108,468,528
for y in range(IY0,IY1):
    row=a[y,IX0:IX1]; rl=l[y,IX0:IX1]
    bg=row[rl>200]
    if len(bg)>3:
        row[:]=np.median(bg,axis=0).round()
        a[y,IX0:IX1]=row
im.paste(Image.fromarray(a),(0,0))
d=ImageDraw.Draw(im)
lines=['All the updates on the Segmentation and','Filtration for MORTGAGE_LOAN — Bank will','be pushed to Rule Engine']
oy,oxs=np.where(lum_of(np.asarray(ov))[IY0:IY1,IX0:IX1]<120)
dink=tuple(int(v) for v in np.median(np.asarray(ov)[IY0+oy,IX0+oxs],axis=0))
fz=13
while True:
    fl=font(fz,True)
    if max(sum(d.textlength(c,font=fl)-0.6 for c in t) for t in lines)<=IX1-IX0-14: break
    fz-=1
cx=(IX0+IX1)/2
y=474
for t in lines:
    w=sum(d.textlength(c,font=fl)-0.6 for c in t)
    tight(d,(int(cx-w/2),y),t,fl,dink,track=-0.6)
    y+=18
save(im,17); print('f017 done fz',fz,'ink',dink)

# ---------- f034 : outlined chip ----------
ov,im=load(34)
revert(im,ov,(820,310,990,370))
a=np.array(im); l=lum_of(a)
ys,xs=np.where(l[326:360,858:960]<101)
py0,py1=326+ys.min(),326+ys.max(); qx0=858+xs.min()
ys2,xs2=np.where(l[326:360,858:960]<85)
tink=tuple(int(v) for v in np.median(a[326+ys2,858+xs2],axis=0))
sel=l[326:360,858:960]
border=tuple(int(v) for v in np.median(a[326:360,858:960][(sel>88)&(sel<99)],axis=0))
field=tuple(int(v) for v in np.median(a[py0-8:py0-3,870:950].reshape(-1,3),axis=0))
a[py0-2:py1+3,qx0-3:965]=field
im.paste(Image.fromarray(a),(0,0))
d=ImageDraw.Draw(im)
f12=font(12,True); label='Bank'
wl=sum(d.textlength(c,font=f12)-0.6 for c in label)
ph=py1-py0; pw=int(wl+36)
d.rounded_rectangle([qx0,py0,qx0+pw,py1],radius=ph//2,outline=border,width=1)
tight(d,(qx0+11,py0+(ph-13)//2),label,f12,tink,track=-0.6)
xx=qx0+pw-11; yy=(py0+py1)//2
d.line([(xx-3,yy-3),(xx+3,yy+3)],fill=border,width=1)
d.line([(xx-3,yy+3),(xx+3,yy-3)],fill=border,width=1)
save(im,34); print('f034 done')

# ---------- f031/f032 : collapsed sidebar dots ----------
for k in (31,32):
    ov,im=load(k)
    revert(im,ov,(112,112,240,235))
    a=np.array(im); l=lum_of(a)
    CX0,CX1,CY0,CY1=127,181,119,172
    bright=a[CY0:CY1,CX0:CX1][l[CY0:CY1,CX0:CX1]>45]
    dot=tuple(int(v) for v in np.percentile(bright,85,axis=0)) if len(bright) else (60,66,84)
    fills=[]
    for x in range(CX0,CX1):
        col=a[CY0:CY1,x]; cl=l[CY0:CY1,x]
        dk=col[cl<13]
        fills.append(np.median(dk,axis=0) if len(dk)>2 else fills[-1] if fills else np.array([10,14,32]))
    fills=np.array(fills,float)
    fills=np.stack([np.convolve(pad(fills)[:,c],ker,'valid') for c in range(3)],1)
    for i,x in enumerate(range(CX0,CX1)):
        a[CY0:CY1,x]=fills[i].round()
    im.paste(Image.fromarray(a),(0,0))
    d=ImageDraw.Draw(im)
    cy=(CY0+CY1)//2; cx=(CX0+CX1)//2
    for i in range(4):
        x=cx-13.5+i*9
        d.ellipse([x-2.4,cy-2.4,x+2.4,cy+2.4],fill=dot)
    save(im,k); print(f'f{k:03d} done')
print('all done')
