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

# ---------- f025 : Application ID value line ----------
# The original renders the ID as a normal field value (same size as the EID
# number below it), sitting under the "Application ID" label. Erase only the
# value line and redraw at the original size and position.
ov,im=load(25)
revert(im,ov,(350,170,1000,255))
a=np.array(im).astype(float)
top=a[196:201,364:640].mean(axis=0)
bot=a[216:221,364:640].mean(axis=0)
t=np.linspace(0,1,15)[:,None,None]
a[201:216,364:640]=top[None,:,:]*(1-t)+bot[None,:,:]*t
im=Image.fromarray(a.clip(0,255).astype('uint8'))
o=np.asarray(ov).astype(int); ol=lum_of(o)
mask=ol[200:216,368:530]<150
px=o[200:216,368:530][mask]
order=np.argsort(px.sum(axis=1))
ink=tuple(int(v) for v in np.median(px[order[:max(1,len(order)//4)]],axis=0))
ys,xs=np.where(mask)
d=ImageDraw.Draw(im)
sz=13
tight(d,(368,(200+ys.min())-int(round(sz*0.26))),'APP_202600000211',font(sz),ink,track=-0.6)
save(im,25); print('f025 done')

# ---------- f023 : restore the search-options dropdown ----------
# The column rewrite had clobbered the "Email ID" and "Phone Number" options
# in the open search dropdown (the narration names all four options). The
# dropdown contains no branding, so restore it wholesale.
ov,im=load(23)
revert(im,ov,(370,298,758,442))
save(im,23); print('f023 dropdown restored')

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
# ---------- f023/f024 : channel column cells ----------
# The v10 tail fill overflowed the table edge, painting white bars across the
# highlight ring and page background, and the replacement text was bold and
# offset. Rebuild each channel cell in place: revert the whole right side,
# find each text band, fill it by lerping the clean background rows above and
# below, and draw 'Bank' at the original size, position, weight and ink.
def fix_channel(k, rev, ytop, ybot):
    ov,im=load(k)
    revert(im,ov,rev)
    a=np.array(im).astype(float)
    TX0=1645
    o=np.asarray(ov).astype(int); olu=lum_of(o)
    sub=olu[ytop:ybot,TX0:1745]
    bgref=np.percentile(sub,90,axis=1)
    inkcnt=(sub<(bgref[:,None]-25)).sum(axis=1)
    rws=np.where(inkcnt>6)[0]
    bands=[]; cur=[rws[0]]
    for r in rws[1:]:
        if r-cur[-1]<=3: cur.append(r)
        else: bands.append(cur); cur=[r]
    bands.append(cur)
    todo=[]
    for b in bands:
        if len(b)<4 or len(b)>16: continue
        y0,y1=ytop+b[0]-2,ytop+b[-1]+3
        band=olu[y0:y1,TX0:1745]
        bp=np.percentile(band,90)
        ink_m=band<bp-25
        ys,xs=np.where(ink_m)
        px=o[y0:y1,TX0:1745][ink_m]
        order=np.argsort(px.sum(axis=1))
        ink=tuple(int(v) for v in np.median(px[order[:max(1,len(order)//4)]],axis=0))
        xstart=TX0+xs.min(); xend=TX0+xs.max()+22
        top=a[y0-4:y0-1,TX0:xend].mean(axis=0)
        bot=a[y1+1:y1+4,TX0:xend].mean(axis=0)
        n=y1-y0
        t=np.linspace(0,1,n)[:,None,None]
        a[y0:y1,TX0:xend]=top[None,:,:]*(1-t)+bot[None,:,:]*t
        todo.append((xstart,y0+2,len(b)+1,ink))
    im=Image.fromarray(a.clip(0,255).astype('uint8'))
    d=ImageDraw.Draw(im)
    for xstart,y0,h,ink in todo:
        sz=int(round(h/0.72))
        tight(d,(xstart,y0-int(round(sz*0.26))),'Bank',font(sz),ink,track=-0.6)
    save(im,k); print(f'f{k:03d} channel bands:',len(todo))

fix_channel(24,(1600,280,1920,545),345,470)
fix_channel(23,(1600,340,1920,830),355,810)
# ---------- f023/f024 : application-ID cells at original weight ----------
# The v10 rewrite drew the IDs thinner and paler than the original semibold
# dark-navy values. Rebuild each cell like the channel cells: revert, fill
# each text band from the clean rows above/below, redraw bold at the
# original size and ink. On f023 only rows below the restored dropdown are
# rebuilt (450+); the top two rows are occluded by the dropdown.
def fix_ids(k, ytop, ybot, ids):
    ov,im=load(k)
    revert(im,ov,(372,ytop,640,ybot))
    a=np.array(im).astype(float)
    TX0,TX1=380,600
    o=np.asarray(ov).astype(int); olu=lum_of(o)
    sub=olu[ytop:ybot,TX0:TX1]
    bgref=np.percentile(sub,90,axis=1)
    inkcnt=(sub<(bgref[:,None]-25)).sum(axis=1)
    rws=np.where(inkcnt>8)[0]
    bands=[]; cur=[rws[0]]
    for r in rws[1:]:
        if r-cur[-1]<=3: cur.append(r)
        else: bands.append(cur); cur=[r]
    bands.append(cur)
    todo=[]
    for b in bands:
        if len(b)<5 or len(b)>18: continue
        y0,y1=ytop+b[0]-2,ytop+b[-1]+3
        band=olu[y0:y1,TX0:TX1]
        bp=np.percentile(band,90)
        ink_m=band<bp-25
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
        todo.append((xstart,y0+2,len(b)+1,ink))
    im=Image.fromarray(a.clip(0,255).astype('uint8'))
    d=ImageDraw.Draw(im)
    for i,(xstart,y0,h,ink) in enumerate(todo):
        sz=int(round(h/0.72))
        tight(d,(xstart,y0-int(round(sz*0.26))),ids[i],font(sz,True),ink,track=-0.6)
    save(im,k); print(f'f{k:03d} id bands:',len(todo))

fix_ids(23,450,810,[f'APP_2026000002{n:02d}' for n in range(9,-1,-1)])
fix_ids(24,345,470,['APP_202600000211','APP_202600000210'])
print('all done')


