const fs=require('fs'),path=require('path');
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const D=__dirname;
const font=fs.readFileSync(D+'/fonts/pjs-inline.css','utf8');
const common=fs.readFileSync(D+'/sc_common.css','utf8');
const jobs=[
  {tpl:'sc3.gen.html', out:'../SC3_Rule_Engine_Values_Score_3.0.png', crop:null},
  {tpl:'sc6.gen.html', out:'../SC6_Rule_Engine_AECB_Score_Segment.png', crop:{x:0,y:188,width:876,height:258}, vw:876, vh:446},
  {tpl:'sc5.gen.html', out:'../SC5_Score_Check_Mgmt_AECB_Score_Range.png', crop:null, vw:2000, vh:913},
];
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  for(const j of jobs){
    const html=fs.readFileSync(D+'/'+j.tpl,'utf8').replace('@@FONT@@',font).replace('@@COMMON@@',common);
    const tmp=D+'/.build_'+j.tpl; fs.writeFileSync(tmp,html);
    const p=await b.newPage({viewport:{width:j.vw||876,height:j.vh||446},deviceScaleFactor:1});
    await p.goto('file://'+tmp);
    await p.evaluate(()=>document.fonts.ready);
    const faces=await p.evaluate(()=>[...document.fonts].map(f=>f.family+':'+f.status).join(','));
    if(!/loaded/.test(faces)) throw new Error('FONT NOT LOADED for '+j.tpl+' -> '+faces);
    await p.waitForTimeout(400);
    await p.screenshot({path:D+'/'+j.out, clip:j.crop||undefined});
    console.log('rendered',j.out, j.crop?`(cropped ${j.crop.width}x${j.crop.height})`:'', '| font', faces);
    await p.close(); fs.unlinkSync(tmp);
  }
  await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
