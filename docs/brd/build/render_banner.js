const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:760,height:300},deviceScaleFactor:2});
  await p.goto('file://'+__dirname+'/banner.html'); await p.waitForTimeout(300);
  const el=await p.$('.card');
  await el.screenshot({path:__dirname+'/../assets/Banner_Score_Segment_Display.png'});
  console.log('banner rendered'); await b.close();
})();
