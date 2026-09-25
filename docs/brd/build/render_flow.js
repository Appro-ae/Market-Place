const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:1180,height:960},deviceScaleFactor:2});
  await p.goto('file://'+__dirname+'/flow.html');
  await p.waitForTimeout(400);
  await p.screenshot({path:__dirname+'/../assets/Flow_ECB_Consumer_Score_3.0.png'});
  console.log('flow rendered'); await b.close();
})();
