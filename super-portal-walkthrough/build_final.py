from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, os, json
F='/mnt/skills/examples/canvas-design/canvas-fonts/'
def font(sz,bold=False): return ImageFont.truetype(F+('WorkSans-Bold.ttf' if bold else 'WorkSans-Regular.ttf'),sz)
HOST='appro.uat.smbp-v2.aladdinweb.dev'
WX,WY=108,22   # window origin in the full frame

SRC=np.array(Image.open('set1/shots/shot-03.png').convert('RGB')).astype(float)
BLK=SRC[210:356, 28:574]; SRC_BG=np.median(BLK[:6,:].reshape(-1,3),axis=0)
CSRC=np.array(Image.open('set1/shots/shot-02.png').convert('RGB')).astype(float)
CBLK=CSRC[214:372, 30:284]; CSRC_BG=np.median(CBLK[:6,:].reshape(-1,3),axis=0)
MARK=Image.open('fixed/appro-mark.png').convert('RGBA')

def win(im): return im.crop((WX,WY,WX+1704,WY+958))
def putwin(im,w): im.paste(w,(WX,WY)); return im

def sample(a,x,y): return tuple(int(v) for v in a[y,x])

def tight(d,xy,txt,f,fill,track=-1.5):
    x,y=xy
    for ch in txt:
        d.text((x,y),ch,font=f,fill=fill)
        x+=d.textlength(ch,font=f)+track

def omnibox(w):
    a=np.array(w); d=ImageDraw.Draw(w)
    d.rectangle([600,12,1150,34],fill=sample(a,560,22))
    f=font(17); d.text((852-d.textlength(HOST,font=f)/2,13),HOST,font=f,fill=(178,184,196))

def has_strip(w):
    a=np.array(w.convert('L')).astype(int)
    row=a[60,580:1690]
    med=float(np.median(row))
    return 15<row.std()<30 and 80<med<96

def tabstrip(w):
    a=np.array(w).astype(int); d=ImageDraw.Draw(w)
    strip=tuple(int(v) for v in np.median(a[48:75,1695:1698].reshape(-1,3),axis=0))
    c1=tuple(int(v) for v in np.median(a[54:68,700:1100].reshape(-1,3),axis=0))
    c2=tuple(int(v) for v in np.median(a[54:68,1250:1600].reshape(-1,3),axis=0))
    d.rectangle([575,48,1698,75],fill=strip)
    d.rounded_rectangle([580,50,1158,72],11,fill=c1)
    d.rounded_rectangle([1164,50,1694,72],11,fill=c2)
    f=font(13)
    for x0,x1,cc,path in [(580,1158,c1,'3d887950-ee4f-4bb4-86e9-34f62decc8ce'),(1164,1694,c2,'d5047d52-28d9-43e0-90a6-ff286ed2d53b')]:
        t=f'https://{HOST}/{path}'
        d.text(((x0+x1)/2-d.textlength(t,font=f)/2,54),t,font=f,fill=tuple(int(v*0.55) for v in cc))

def sidebar_dy(w):
    a=np.array(w.convert('L')).astype(int); col=a[:,100]
    for y in range(30,200):
        if col[y]<70 and all(col[y:y+40]<85): return y-86
    return 0

def gainmap(tgt_bg,src_bg):
    s=float(np.mean(tgt_bg))/max(float(np.mean(src_bg)),1.0)
    ac=(255.0*s-np.array(tgt_bg))/np.maximum(255.0-src_bg,1.0)
    bc=np.array(tgt_bg)-ac*src_bg
    return ac,bc

def logo_expanded(w,dy):
    a=np.array(w).astype(float); d=ImageDraw.Draw(w)
    for y in range(44+dy,124+dy):
        bg=np.median(np.array(w)[y,3:12],axis=0)
        d.line([(2,y),(227,y)],fill=tuple(int(v) for v in bg))
    tgt=np.median(np.array(w)[84+dy,3:12],axis=0)
    ac,bc=gainmap(tgt,SRC_BG)
    blk=np.clip(BLK*ac[None,None,:]+bc[None,None,:],0,255)
    ww=206; hh=int(BLK.shape[0]*ww/BLK.shape[1])
    bi=Image.fromarray(blk.astype('uint8')).resize((ww,hh),Image.LANCZOS)
    m=Image.new('L',(ww,hh),0); ImageDraw.Draw(m).rectangle([3,3,ww-4,hh-4],fill=255)
    w.paste(bi,(116-ww//2,90+dy-hh//2),m.filter(ImageFilter.GaussianBlur(2)))

def logo_zoomed(w):
    a=np.array(w).astype(float); d=ImageDraw.Draw(w)
    aw=np.array(w)
    for y in range(83,196):
        bg=np.median(aw[200:214,60:160].reshape(-1,3),axis=0) if y==83 else bg
        d.line([(4,y),(244,y)],fill=tuple(int(v) for v in bg))
    tgt=np.median(np.array(w)[200:220,60:160].reshape(-1,3),axis=0)
    ac,bc=gainmap(tgt,SRC_BG)
    blk=np.clip(BLK*ac[None,None,:]+bc[None,None,:],0,255)
    ww=224; hh=int(BLK.shape[0]*ww/BLK.shape[1])
    bi=Image.fromarray(blk.astype('uint8')).resize((ww,hh),Image.LANCZOS)
    m=Image.new('L',(ww,hh),0); ImageDraw.Draw(m).rectangle([3,3,ww-4,hh-4],fill=255)
    w.paste(bi,(124-ww//2,138-hh//2),m.filter(ImageFilter.GaussianBlur(2)))

def logo_collapsed(w):
    a=np.array(w).astype(float); d=ImageDraw.Draw(w)
    # locate the icon box: dark square in the narrow sidebar top
    g=np.array(w.convert('L')).astype(int)
    top=None; col=g[:,40]
    for y in range(30,220):
        if col[y]<70 and all(col[y:y+30]<85): top=y; break
    if top is None: return
    reg=(6,top+18,110,top+90)
    bg=np.median(a[top+100:top+120,6:80].reshape(-1,3),axis=0)
    d.rectangle(list(reg),fill=tuple(int(v) for v in bg))
    ac,bc=gainmap(bg,CSRC_BG)
    blk=np.clip(CBLK*ac[None,None,:]+bc[None,None,:],0,255)
    ww=92; hh=int(CBLK.shape[0]*ww/CBLK.shape[1])
    bi=Image.fromarray(blk.astype('uint8')).resize((ww,hh),Image.LANCZOS)
    m=Image.new('L',(ww,hh),0); ImageDraw.Draw(m).rectangle([2,2,ww-3,hh-3],fill=255)
    w.paste(bi,((reg[0]+reg[2])//2-ww//2,(reg[1]+reg[3])//2-hh//2),m.filter(ImageFilter.GaussianBlur(2)))

def selector(w,strip):
    a=np.array(w).astype(int)
    if strip: x0,y0,x1,y1,bx0,bx1=1540,110,1688,133,1691,1704
    else:     x0,y0,x1,y1,bx0,bx1=1537,83,1650,106,1654,1684
    reg=a[y0:y1,x0:x1]
    if reg.mean()>250 or reg.std()<4: return False       # nothing there
    ink=reg.reshape(-1,3).min(axis=0)
    bg=np.median(a[y0:y1,bx0:bx1].reshape(-1,3),axis=0)
    d=ImageDraw.Draw(w)
    d.rectangle([x0-4,y0-3,x1+2,y1+3],fill=tuple(int(v) for v in bg))
    tight(d,(x0,y0+1),'Bank',font(16),tuple(int(v) for v in ink))
    return True

def bands(a,X0,X1,y_lo,y_hi):
    col=a[:,X0:X1].mean(axis=2); bg=np.median(col,axis=1)
    hit=(col<bg[:,None]-26).sum(axis=1); base=np.median(hit[y_lo:y_hi]); out=[]
    for y in range(y_lo,y_hi):
        if hit[y]>base+10:
            if out and y-out[-1][1]<=4: out[-1][1]=y
            else: out.append([y,y])
    return [b for b in out if 4<=b[1]-b[0]<=26]

def inpaint_ink(w,x0,y0,x1,y1,thresh=22):
    a=np.array(w).astype(float)
    x0=max(0,x0); y0=max(0,y0); x1=min(a.shape[1],x1); y1=min(a.shape[0],y1)
    for x in range(x0,x1):
        col=a[y0:y1,x,:]; lum=col.mean(axis=1)
        bg=np.percentile(col,85,axis=0)
        col[lum<bg.mean()-thresh]=bg
        a[y0:y1,x,:]=col
    w.paste(Image.fromarray(a.clip(0,255).astype('uint8')).crop((x0,y0,x1,y1)),(x0,y0))

def rewrite_col(w,X0,X1,y_lo,y_hi,fx,bold=False,keep=124,sx=None):
    a=np.array(w).astype(int); found=bands(a,X0,X1,y_lo,y_hi); n=0
    W=np.array(w).shape[1]
    if sx is None: sx=min(W-2,X1+45)
    for i,(y0,y1) in enumerate(found):
        ink=tuple(int(v) for v in a[y0:y1,X0:X1].reshape(-1,3).min(axis=0))
        inpaint_ink(w,X0-6,y0-5,X1+30,y1+6,thresh=11)
        aa=np.array(w); d=ImageDraw.Draw(w)
        for y in range(max(0,y0-5),min(aa.shape[0],y1+6)):
            bgc=tuple(int(v) for v in aa[y,sx])
            d.line([(X0+keep,y),(min(W-1,X1+30),y)],fill=bgc)
        tight(d,(X0,y0-3),fx(i),font(13,bold),ink,track=-0.6)
        n+=1
    return n

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

PROC={}
def run():
    os.makedirs('final',exist_ok=True)
    SIDEBAR={1:'none',28:'none',29:'collapsed',30:'collapsed'}
    for k in range(1,35):
        fp=f'ov/f{k+2:03d}.png'
        im=Image.open(fp).convert('RGB'); w=win(im)
        strip=has_strip(w)
        omnibox(w)
        if strip: tabstrip(w)
        mode=SIDEBAR.get(k,'expanded')
        dy=33 if strip else 0
        if k==34: logo_zoomed(w)
        elif mode=='expanded': logo_expanded(w,dy)
        elif mode=='collapsed': logo_collapsed(w)
        sdy=33 if strip else 0
        if k in (7,10,13,15,17,18,19,20):
            hit=selector(w,strip)
            PROC[k]=f'selector:{hit}'
        if k==21:
            rewrite_col(w,1533,1697,330,800,lambda i:'Bank',bold=True,keep=40,sx=1517)
            rewrite_col(w,278,470,330,800,lambda i:f'APP_2026000002{11-i:02d}')
        if k==22:
            rewrite_col(w,1533,1697,330,470,lambda i:'Bank',bold=True,keep=40,sx=1517)
            rewrite_col(w,278,470,330,470,lambda i:f'APP_2026000002{11-i:02d}')
        if k==28:
            a=np.array(w).astype(int); d=ImageDraw.Draw(w)
            d.rectangle([1118,124,1266,232],fill=sample(a,1320,150))
            mw=124; m=MARK.resize((mw,int(mw*MARK.size[1]/MARK.size[0])),Image.LANCZOS); px=m.load()
            for yy in range(m.size[1]):
                for xx in range(m.size[0]): px[xx,yy]=(52,60,86,px[xx,yy][3])
            w.paste(m,(1128,168-m.size[1]//2),m)
            a2=np.array(w).astype(int)
            bgc=tuple(int(v) for v in np.median(a2[488,760:1010],axis=0))
            d.rectangle([760,492,1012,518],fill=bgc)
            d.text((764,494),'APP_202600000211',font=font(16),fill=(58,66,92))
        if k==3:
            a=np.array(w).astype(int); d=ImageDraw.Draw(w)
            page=sample(a,633-108,204-22)
            d.rectangle([631-108,206-22,754-108,233-22],fill=page)
            chip=(232,237,248)
            d.rounded_rectangle([633-108,208-22,735-108,231-22],6,fill=chip)
            d.text((641-108,212-22),'Channel: Bank',font=font(12,True),fill=(40,50,90))
        im=putwin(im,w)
        if k==1:
            coons(im,152,112,318,190)
        a=np.array(im).astype(int); d=ImageDraw.Draw(im)
        if k==2:
            ink=tuple(int(v) for v in np.array(a[236:254,361:449]).reshape(-1,3).min(axis=0))
            for y in range(228,260):
                hb=tuple(int(v) for v in np.median(a[y,470:540],axis=0))
                d.line([(353,y),(465,y)],fill=hb)
            for y in range(232,281):
                hb=tuple(int(v) for v in np.median(a[y,470:540],axis=0))
                d.line([(314,y),(352,y)],fill=hb)
            d.text((361,236),'Bank',font=font(15,True),fill=ink)
            d.rounded_rectangle([319,237,348,275],8,fill=(30,38,72))
            fB=font(15,True); d.text((334-d.textlength('B',font=fB)/2,247),'B',font=fB,fill=(210,214,224))
        if k==23:
            ink=tuple(int(v) for v in np.array(a[196:224,372:600]).reshape(-1,3).min(axis=0))
            bg=tuple(int(v) for v in np.median(a[210,630:700],axis=0))
            d.rectangle([368,196,615,226],fill=bg)
            tight(d,(372,199),'APP_202600000211',font(18,True),ink,track=-0.8)
        if k==15:
            bg=tuple(int(v) for v in np.median(a[530,930:1000],axis=0))
            d.rectangle([788,440,1114,524],fill=bg)
            fx=font(13,True); cx=951
            for i,t in enumerate(['All the updates on the Segmentation and Filtration for','MORTGAGE_LOAN — Bank will be pushed to','Rule Engine']):
                d.text((cx-d.textlength(t,font=fx)/2,449+i*23),t,font=fx,fill=(33,42,74))
        if k==32:
            chip=np.array(im).astype(int)[326:356,838:1000]
            chipbg=tuple(int(v) for v in np.median(chip.reshape(-1,3),axis=0))
            ink=tuple(int(v) for v in chip.reshape(-1,3).min(axis=0))
            page=tuple(int(v) for v in np.median(a[340,1020:1080],axis=0))
            d.rectangle([830,320,1010,362],fill=page)
            d.rounded_rectangle([838,326,922,356],7,fill=chipbg)
            d.text((848,333),'Bank',font=font(13,True),fill=ink)
            d.text((903,331),'×',font=font(14),fill=tuple(min(255,v+60) for v in ink))
        if k==2:   # caption body rewrite (full-frame)
            a=np.array(im).astype(int)
            ink=tuple(int(v) for v in np.percentile(a[1008:1030,560:1400].reshape(-1,3),92,axis=0))
            bg=tuple(int(v) for v in np.median(a[1040,1550:1700],axis=0))
            d.rectangle([534,1002,1512,1075],fill=bg)
            fb=font(21)
            d.text((540,1006),'The channel is active in Dubai, with Mortgage Loan assigned and enabled. Every product',font=fb,fill=ink)
            d.text((540,1036),'toggle moves only after checker approval.',font=fb,fill=ink)
        im.save(f'final/f{k+2:03d}.png')
    # title card
    im=Image.open('ov/f001.png').convert('RGB')
    coons(im,135,595,455,675)
    a=np.array(im).astype(float)
    # tiny tilted URLs: per-column ink inpaint
    for (x0,y0,x1,y1) in [(1425,152,1675,178),(1395,230,1565,262),(1380,548,1570,580),(1392,352,1552,384)]:
        for x in range(x0,x1):
            col=a[y0:y1,x,:]
            lum=col.mean(axis=1); bg=np.percentile(col,80,axis=0)
            m=lum<bg.mean()-22
            col[m]=bg; a[y0:y1,x,:]=col
    im=Image.fromarray(a.clip(0,255).astype('uint8'))
    for (cx,cy,angT) in [(1837,230,-2.5),(1815,600,-2.0)]:
        W2,H2=118,40
        t=Image.new('RGBA',(W2,H2),(0,0,0,0)); td=ImageDraw.Draw(t)
        td.rounded_rectangle([1,1,W2-2,H2-2],10,fill=(246,247,250,255),outline=(219,222,230,255),width=1)
        td.text((10,12),'Channel',font=font(11),fill=(128,136,152,255))
        td.text((64,12),'Bank',font=font(11),fill=(96,104,122,255))
        td.line([(101,17),(105,22)],fill=(120,128,144,255),width=1)
        td.line([(105,22),(109,17)],fill=(120,128,144,255),width=1)
        t=t.rotate(angT,expand=True,resample=Image.BICUBIC)
        im.paste(t,(cx-t.size[0]//2,cy-t.size[1]//2),t)
    # tilted mini lockups: per-column dark-run erase + rotated native block
    for (x0,y0,x1,y1,ang) in [(1038,148,1176,220,-3.0),(1052,274,1178,344,-2.5),(992,570,1121,632,-2.0),(1062,392,1186,449,-2.5)]:
        a=np.array(im).astype(float)
        for x in range(x0,x1):
            col=a[y0:y1,x,:]; lum=col.mean(axis=1)
            ref=(lum[:3].mean()+lum[-3:].mean())/2.0
            dark=lum<ref-14
            if dark.any():
                i0=max(1,int(np.argmax(dark))-2)
                i1=min(len(dark)-1,len(dark)-int(np.argmax(dark[::-1]))+2)
                nn=i1-i0
                if nn>0:
                    t0=col[i0-1]; b0=col[i1]
                    col[i0:i1]=t0[None,:]+(b0-t0)[None,:]*np.linspace(0,1,nn)[:,None]
                    a[y0:y1,x,:]=col
        im=Image.fromarray(a.clip(0,255).astype('uint8'))
        tgt=np.median(a[y0+10:y1-10,x0+10:x1-10].reshape(-1,3),axis=0)
        ac,bc=gainmap(tgt,SRC_BG)
        blk=np.clip(BLK*ac[None,None,:]+bc[None,None,:],0,255)
        ww=x1-x0-16; hh=int(BLK.shape[0]*ww/BLK.shape[1])
        bi=Image.fromarray(blk.astype('uint8')).resize((ww,hh),Image.LANCZOS).convert('RGBA')
        bir=bi.rotate(ang,expand=True,resample=Image.BICUBIC)
        cx,cy=(x0+x1)//2,(y0+y1)//2
        im.paste(bir,(cx-bir.size[0]//2,cy-bir.size[1]//2),bir)
    im.save('final/f001.png')
    # closing card untouched
    Image.open('ov/f037.png').save('final/f037.png')
    print('done', PROC)
run()
