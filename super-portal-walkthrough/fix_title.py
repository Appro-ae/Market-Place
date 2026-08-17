"""Repair the title card (f001):
- revert the damaged sidebar regions of the three stacked screenshots to the
  original pixels (this also removes the wrongly-added 4th logo that covered
  the 'Credit Decision' menu header)
- swap only the branded lockup content inside each card's own container for
  the white appro wordmark, keeping the container, collapse button, divider
  and menu rows pixel-original
- add the 'Walkthrough' subtitle under the Super Portal pill
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, math

F='/mnt/skills/examples/canvas-design/canvas-fonts/'
def font(sz,bold=False): return ImageFont.truetype(F+('WorkSans-Bold.ttf' if bold else 'WorkSans-Regular.ttf'),sz)
MARK=Image.open('fixed/appro-mark.png').convert('RGBA')

def coons(im,x0,y0,x1,y1,m=16):
    a=np.array(im).astype(float)
    T=a[y0-m:y0-2,x0:x1].mean(axis=0); B=a[y1+2:y1+m,x0:x1].mean(axis=0)
    L=a[y0:y1,x0-m:x0-2].mean(axis=1); R=a[y0:y1,x1+2:x1+m].mean(axis=1)
    h,ww=y1-y0,x1-x0
    u=np.linspace(0,1,h)[:,None,None]; v=np.linspace(0,1,ww)[None,:,None]
    c=(a[y0-m,x0-m]*(1-u)*(1-v)+a[y0-m,x1+m]*(1-u)*v+a[y1+m,x0-m]*u*(1-v)+a[y1+m,x1+m]*u*v)
    a[y0:y1,x0:x1]=(T[None,:,:]*(1-u)+B[None,:,:]*u)+(L[:,None,:]*(1-v)+R[:,None,:]*v)-c
    out=Image.fromarray(a.clip(0,255).astype('uint8'))
    r=out.crop((x0-8,y0-8,x1+8,y1+8)).filter(ImageFilter.GaussianBlur(5)); out.paste(r,(x0-8,y0-8))
    im.paste(out,(0,0))

ov=Image.open('ov/f001.png').convert('RGB')
im=Image.open('final/f001.png').convert('RGB')

# 1. revert sidebar regions of the three cards + subtitle area
for (x0,y0,x1,y1) in [(1000,135,1200,232),(1025,242,1205,372),
                      (1045,374,1215,466),(965,550,1155,650),
                      (128,583,482,668)]:
    im.paste(ov.crop((x0,y0,x1,y1)),(x0,y0))

A=np.array(im).astype(int)
LUM=(A*[0.299,0.587,0.114]).sum(axis=2)

def divline(slope,x_ref,y_ref):
    return (slope, y_ref - slope*x_ref)  # slope, intercept

def swap_lockup(im,xa,xb,div,g_top,g_bot,mark_h):
    """Erase branded content by following each column's actual dark-container
    run (lum<45), so rounded corners stay intact; then paste the wordmark."""
    a=np.array(im)
    lum=(a.astype(int)*[0.299,0.587,0.114]).sum(axis=2)
    slope,icpt=div
    cols=list(range(xa,xb))
    runs=[]; tops=[]; bots=[]
    last=None
    for x in cols:
        yd=np.polyval((slope,icpt),x)
        s0=int(round(yd-g_top))-5; s1=int(round(yd-g_bot))+6
        cl=lum[s0:s1,x]
        idx=np.where(cl<45)[0]
        if len(idx)>=4:
            y0=s0+idx[0]+1; y1=s0+idx[-1]
            dark=a[s0:s1,x][cl<45]
            half=len(dark)//2
            top=np.median(dark[:half],axis=0); bot=np.median(dark[half:],axis=0)
            last=(y0,y1,top,bot)
        elif last is not None:
            y0,y1,top,bot=last
        else:
            y0=int(round(yd-g_top)); y1=int(round(yd-g_bot))
            top=bot=np.array([24,31,60])
        runs.append((y0,y1)); tops.append(top); bots.append(bot)
    # median-filter run bounds across columns to reject stray dark specks
    y0s=np.array([r[0] for r in runs]); y1s=np.array([r[1] for r in runs])
    def medf(v,k=13):
        p=np.concatenate([np.repeat(v[:1],k//2),v,np.repeat(v[-1:],k//2)])
        return np.array([int(np.median(p[i:i+k])) for i in range(len(v))])
    runs=list(zip(medf(y0s),medf(y1s)))
    tops=np.array(tops,float); bots=np.array(bots,float)
    k=11; ker=np.ones(k)/k
    pad=lambda v: np.concatenate([np.repeat(v[:1],k//2,0),v,np.repeat(v[-1:],k//2,0)])
    tops=np.stack([np.convolve(pad(tops)[:,c],ker,'valid') for c in range(3)],1)
    bots=np.stack([np.convolve(pad(bots)[:,c],ker,'valid') for c in range(3)],1)
    mids=[]
    for i,x in enumerate(cols):
        y0,y1=runs[i]
        n=y1-y0
        if n<=0: continue
        t=np.linspace(0,1,n)[:,None]
        a[y0:y1,x]=(tops[i][None,:]*(1-t)+bots[i][None,:]*t).round()
        mids.append((x,(y0+y1)/2))
    im.paste(Image.fromarray(a),(0,0))
    # wordmark
    mw=int(round(mark_h*MARK.width/MARK.height))
    mk=MARK.resize((mw,mark_h),Image.LANCZOS)
    ang=math.degrees(math.atan(-slope))
    mkr=mk.rotate(ang,expand=True,resample=Image.BICUBIC)
    px=xa+10
    span=[m for m in mids if px<=m[0]<=px+mkr.width]
    yc=sum(m[1] for m in span)/len(span)
    im.paste(mkr,(int(px),int(round(yc-mkr.height/2))),mkr)

# measured card tilts: -3.5 / -2.5 / -2.0 degrees
d1=divline(-0.0612,1056,196.7)
swap_lockup(im,1056,1128,d1,36,7,18)
d2=divline(-0.0437,1063,435.0)
swap_lockup(im,1064,1139,d2,29,8,15)
d3=divline(-0.0349,992,620.0)
swap_lockup(im,993,1073,d3,37,7,19)
print('slopes',[round(c[0],4) for c in (d1,d2,d3)])

# 2. subtitle: sample original ink, erase 'Emirates NBD', draw 'Walkthrough'
oa=np.array(ov).astype(int)
olum=(oa*[0.299,0.587,0.114]).sum(axis=2)
reg=oa[598:640,145:445]; rl=olum[598:640,145:445]
ink=tuple(int(v) for v in np.median(reg[rl>110].reshape(-1,3),axis=0))
print('subtitle ink',ink)
coons(im,140,592,462,654)
f=font(50,True)
d=ImageDraw.Draw(im)
d.text((145,592),'Walkthrough',font=f,fill=ink)

im.save('final/f001.png')
print('saved')
