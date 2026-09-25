const fs=require('fs');const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const D=__dirname, font=fs.readFileSync(D+'/fonts/lato-inline.css','utf8');
  const html=fs.readFileSync(D+'/hero.html','utf8').replace('@@FONT@@',font);
  const tmp=D+'/.hero_build.html'; fs.writeFileSync(tmp,html);
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:840,height:780},deviceScaleFactor:3});
  await p.goto('file://'+tmp); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(300);
  const ok=await p.evaluate(()=>[...document.fonts].some(f=>f.status==='loaded'));
  if(!ok) throw new Error('Lato did not load');
  await p.screenshot({path:D+'/../assets/cover_hero_score.png',omitBackground:true});
  console.log('hero rendered'); await b.close(); fs.unlinkSync(tmp);
})().catch(e=>{console.error(e.message);process.exit(1)});
