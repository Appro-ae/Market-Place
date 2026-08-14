from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json, os, textwrap

F='/mnt/skills/examples/canvas-design/canvas-fonts/'
BOLD=F+'WorkSans-Bold.ttf'; REG=F+'WorkSans-Regular.ttf'
W,H=1920,1080
BG=(5,17,31); BAND=(11,23,40); ACCENT=(59,126,246); KICK=(127,165,232)
BODY_C=(224,231,242); NUM_C=(92,106,130); AMBER=(240,180,41); NAVY=(26,33,77)
WIN=(108,22,1704,958); BX0,BX1,BY0,BY1 = 108,1812,978,1072

f_title=ImageFont.truetype(BOLD,31); f_kick=ImageFont.truetype(REG,15)
f_body=ImageFont.truetype(REG,19);   f_num=ImageFont.truetype(REG,16)

def rounded(im,r=14):
    m=Image.new('L',im.size,0); ImageDraw.Draw(m).rounded_rectangle([0,0,im.size[0]-1,im.size[1]-1],r,fill=255)
    o=Image.new('RGBA',im.size); o.paste(im,(0,0),m); return o

def emphasise(sc, rect):
    """Dim the page and lift one region, matching the source cut (0.37x dim, near-white stroke)."""
    if rect is None: return sc
    w,h=sc.size
    x0,y0,x1,y1 = [int(v*(w if i%2==0 else h)) for i,v in enumerate(rect)]
    dim=Image.eval(sc, lambda v:int(v*0.37))
    dim=Image.blend(dim, Image.new('RGB',sc.size,(6,18,34)), 0.18)
    m=Image.new('L',sc.size,0); ImageDraw.Draw(m).rounded_rectangle([x0,y0,x1,y1],18,fill=255)
    out=Image.composite(sc, dim, m)
    glow=Image.new('RGBA',sc.size,(0,0,0,0))
    ImageDraw.Draw(glow).rounded_rectangle([x0,y0,x1,y1],18,outline=(59,126,246,190),width=10)
    out=Image.alpha_composite(out.convert('RGBA'), glow.filter(ImageFilter.GaussianBlur(9)))
    d=ImageDraw.Draw(out)
    d.rounded_rectangle([x0,y0,x1,y1],18,outline=(226,234,245,255),width=4)
    return out.convert('RGB')

def slide(path, rect, title, kicker, body, n, total, preburned=False):
    c=Image.new('RGB',(W,H),BG)
    g=Image.new('RGB',(W,H),BG); gd=ImageDraw.Draw(g)
    gd.ellipse([-300,-400,500,400],fill=(9,24,44)); gd.ellipse([1500,700,2400,1400],fill=(9,24,44))
    c=Image.blend(c,g.filter(ImageFilter.GaussianBlur(120)),0.55); d=ImageDraw.Draw(c)
    sc=Image.open(path).convert('RGB')
    if not preburned:
        sc=emphasise(sc, rect)
    sc=sc.resize((WIN[2],WIN[3]), Image.LANCZOS)
    sh=Image.new('RGBA',(WIN[2]+60,WIN[3]+60),(0,0,0,0))
    ImageDraw.Draw(sh).rounded_rectangle([30,34,WIN[2]+30,WIN[3]+36],16,fill=(0,0,0,150))
    c.paste(sh.filter(ImageFilter.GaussianBlur(18)),(WIN[0]-30,WIN[1]-30),sh.filter(ImageFilter.GaussianBlur(18)))
    r=rounded(sc,14); c.paste(r,(WIN[0],WIN[1]),r)
    d.rounded_rectangle([BX0,BY0,BX1,BY1],10,fill=BAND)
    d.rectangle([BX0,BY0+8,BX0+5,BY1-8],fill=ACCENT)
    d.text((BX0+34,BY0+11),title,font=f_title,fill=(255,255,255))
    d.text((BX0+36,BY0+58),kicker,font=f_kick,fill=KICK)
    for i,ln in enumerate(textwrap.wrap(body,width=74)[:2]):
        d.text((BX0+450,BY0+16+i*26),ln,font=f_body,fill=BODY_C)
    t=f"{n} / {total}"
    d.text((BX1-24-d.textlength(t,font=f_num),BY1-32),t,font=f_num,fill=NUM_C)
    return c

def title_card():
    c=Image.new('RGB',(W,H),BG)
    g=Image.new('RGB',(W,H),BG); gd=ImageDraw.Draw(g)
    gd.ellipse([-380,-480,600,480],fill=(11,28,52)); gd.ellipse([1400,600,2500,1500],fill=(11,28,52))
    c=Image.blend(c,g.filter(ImageFilter.GaussianBlur(150)),0.62); d=ImageDraw.Draw(c)
    for sp,off in zip(['set1/shots/shot-04.png','set1/shots/shot-17.png','set1/shots/shot-21.png'],
                      [(1035,120),(975,378),(1035,636)]):
        s=rounded(Image.open(sp).convert('RGB').resize((870,489),Image.LANCZOS),12)
        sh=Image.new('RGBA',(930,549),(0,0,0,0))
        ImageDraw.Draw(sh).rounded_rectangle([30,34,900,519],12,fill=(0,0,0,165))
        sh=sh.filter(ImageFilter.GaussianBlur(16)); c.paste(sh,(off[0]-30,off[1]-30),sh)
        c.paste(s,off,s)
    mk=Image.open('fixed/appro-mark.png').convert('RGBA')
    mk=mk.resize((250,int(250*mk.size[1]/mk.size[0])),Image.LANCZOS); c.paste(mk,(140,110),mk)
    ft=ImageFont.truetype(BOLD,96); tw=d.textlength("Super Portal",font=ft)
    d.rounded_rectangle([120,404,120+tw+100,404+148],74,fill=AMBER)
    d.text((170,428),"Super Portal",font=ft,fill=NAVY)
    d.text((146,624),"Walkthrough",font=ImageFont.truetype(REG,40),fill=(158,182,224))
    d.line([(148,712),(216,712)],fill=AMBER,width=4)
    d.text((146,744),"Eleven modules, end to end",font=ImageFont.truetype(REG,25),fill=(126,146,182))
    d.text((146,962),"Confidential — prepared by Appro",font=ImageFont.truetype(REG,25),fill=(198,209,228))
    return c

CUES=json.load(open('cues_v2.json')); total=len(CUES)
os.makedirs('frames_v2',exist_ok=True)
title_card().save('frames_v2/f000.png')
for i,c in enumerate(CUES,1):
    slide(c['src'], c.get('rect'), c['title'], c['kicker'], c['body'], i, total,
          preburned=c.get('preburned',False)).save(f'frames_v2/f{i:03d}.png')
print('rendered', total+1)
