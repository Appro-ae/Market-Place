const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  for(const [f,w,h,out] of [['sc2.html',876,446,'../SC3_Rule_Engine_Values_Score_3.0.png'],
                            ['sc3.html',2000,913,'../SC5_Score_Check_Mgmt_AECB_Score_Range.png']]){
    const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
    await p.goto('file://'+__dirname+'/'+f);
    await p.waitForLoadState('networkidle');
    await p.evaluate(()=>document.fonts.ready);
    await p.waitForTimeout(600);
    await p.screenshot({path:__dirname+'/'+out});
    console.log('rendered',out); await p.close();
  }
  await b.close();
})();
