const fs=require('fs'),path=require('path');
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const D=__dirname;
  const font=fs.readFileSync(D+'/fonts/lato-inline.css','utf8');
  const html=fs.readFileSync(D+'/brd.html','utf8').replace('@@FONT@@',font);
  const tmp=D+'/.brd_build.html'; fs.writeFileSync(tmp,html);
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage();
  await p.goto('file://'+tmp,{waitUntil:'load'});
  await p.evaluate(()=>document.fonts.ready);
  const faces=await p.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight+' '+f.style));
  if(!faces.length) throw new Error('Lato did not load - refusing to render in a fallback face');
  const broken=await p.evaluate(()=>[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')));
  if(broken.length) throw new Error('images failed to load: '+broken.join(', '));
  const out=path.join(D,'.master.pdf');   // unprotected master; build/protect.py makes the circulation copy
  await p.pdf({path:out,format:'A4',printBackground:true,preferCSSPageSize:true});
  console.log('fonts:',faces.join(' | '));
  console.log('written',out);
  await b.close(); fs.unlinkSync(tmp);
})().catch(e=>{console.error(e.message);process.exit(1)});
