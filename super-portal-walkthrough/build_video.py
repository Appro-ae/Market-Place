from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, json, subprocess, textwrap

F='/mnt/skills/examples/canvas-design/canvas-fonts/'
BOLD=F+'WorkSans-Bold.ttf'; REG=F+'WorkSans-Regular.ttf'
W,H=1920,1080
BG=(5,17,31); BAND=(11,23,40); ACCENT=(59,126,246); KICK=(127,165,232)
TITLE_C=(255,255,255); BODY_C=(224,231,242); NUM_C=(90,104,128); AMBER=(240,180,41); NAVY=(26,33,77)

WIN=(108,22,1704,958)                       # x,y,w,h  — measured off the source cut
BX0,BX1,BY0,BY1 = 108,1812,978,1072         # caption band, lifted 20px so nothing clips

f_title=ImageFont.truetype(BOLD,31); f_kick=ImageFont.truetype(REG,15)
f_body=ImageFont.truetype(REG,19);   f_num=ImageFont.truetype(REG,16)

def rounded(im, r=14):
    m=Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle([0,0,im.size[0]-1,im.size[1]-1], r, fill=255)
    out=Image.new('RGBA', im.size); out.paste(im, (0,0), m); return out

def slide(shot_path, title, kicker, body, n, total):
    c=Image.new('RGB',(W,H),BG)
    d=ImageDraw.Draw(c)
    # soft vignette circles, as in the source cut
    g=Image.new('RGB',(W,H),BG); gd=ImageDraw.Draw(g)
    gd.ellipse([-300,-400,500,400], fill=(9,24,44)); gd.ellipse([1500,700,2400,1400], fill=(9,24,44))
    c=Image.blend(c,g.filter(ImageFilter.GaussianBlur(120)),0.55); d=ImageDraw.Draw(c)
    # browser window
    sc=Image.open(shot_path).convert('RGB').resize((WIN[2],WIN[3]), Image.LANCZOS)
    sh=Image.new('RGBA',(WIN[2]+60,WIN[3]+60),(0,0,0,0))
    ImageDraw.Draw(sh).rounded_rectangle([30,34,WIN[2]+30,WIN[3]+36],16,fill=(0,0,0,150))
    sh=sh.filter(ImageFilter.GaussianBlur(18)); c.paste(sh,(WIN[0]-30,WIN[1]-30),sh)
    r=rounded(sc,14); c.paste(r,(WIN[0],WIN[1]),r)
    # caption band
    d.rounded_rectangle([BX0,BY0,BX1,BY1], 10, fill=BAND)
    d.rectangle([BX0,BY0+8,BX0+5,BY1-8], fill=ACCENT)
    d.text((BX0+34,BY0+11), title, font=f_title, fill=TITLE_C)
    d.text((BX0+36,BY0+58), kicker, font=f_kick, fill=KICK)
    lines=textwrap.wrap(body, width=74)[:2]
    for i,ln in enumerate(lines):
        d.text((BX0+450,BY0+16+i*26), ln, font=f_body, fill=BODY_C)
    t=f"{n} / {total}"
    d.text((BX1-24-d.textlength(t,font=f_num), BY1-32), t, font=f_num, fill=NUM_C)
    return c

def title_card(shots):
    c=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(c)
    g=Image.new('RGB',(W,H),BG); gd=ImageDraw.Draw(g)
    gd.ellipse([-350,-450,550,450], fill=(10,26,48)); gd.ellipse([1450,650,2450,1450], fill=(10,26,48))
    c=Image.blend(c,g.filter(ImageFilter.GaussianBlur(140)),0.6); d=ImageDraw.Draw(c)
    # stacked portal screenshots, right
    for i,(sp,off) in enumerate(zip(shots,[(1010,110),(960,360),(1010,620)])):
        s=Image.open(sp).convert('RGB'); s=s.resize((880,495), Image.LANCZOS); s=rounded(s,12)
        sh=Image.new('RGBA',(940,555),(0,0,0,0))
        ImageDraw.Draw(sh).rounded_rectangle([30,34,910,525],12,fill=(0,0,0,160))
        sh=sh.filter(ImageFilter.GaussianBlur(16)); c.paste(sh,(off[0]-30,off[1]-30),sh)
        c.paste(s,off,s)
    # appro wordmark
    mk=Image.open('fixed/appro-mark.png').convert('RGBA')
    mk=mk.resize((300,int(300*mk.size[1]/mk.size[0])), Image.LANCZOS)
    c.paste(mk,(140,95),mk)
    # amber pill
    ft=ImageFont.truetype(BOLD,92)
    tw=d.textlength("Super Portal",font=ft)
    d.rounded_rectangle([120,420,120+tw+96,420+140], 70, fill=AMBER)
    d.text((168,443),"Super Portal",font=ft,fill=NAVY)
    d.text((146,640),"Mortgage Loan walkthrough",font=ImageFont.truetype(REG,34),fill=(150,175,220))
    d.line([(146,940),(214,940)], fill=ACCENT, width=4)
    d.text((146,962),"Confidential — prepared by Appro",font=ImageFont.truetype(REG,26),fill=(205,215,232))
    return c

CUES=json.load(open('cues.json'))
os.makedirs('frames_out', exist_ok=True)
total=len(CUES)
tc=title_card(['fixed/shot-03.png' if False else 'set1/shots/shot-04.png',
               'set1/shots/shot-17.png','set1/shots/shot-21.png'])
tc.save('frames_out/f000.png')
for i,c in enumerate(CUES,1):
    src = c['src']
    im=slide(src, c['title'], c['kicker'], c['body'], i, total)
    im.save(f'frames_out/f{i:03d}.png')
print('rendered', total+1, 'frames')
