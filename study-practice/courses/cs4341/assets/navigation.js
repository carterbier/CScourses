(function(){
  'use strict';
  const NAV_KEY='cs4341Nav';
  let ready=false,fallbackRoutes=[],fallbackIndex=0,previousFocus=null;
  function routeNow(){
    if(!chapter)return {page:'home',exam:selectedExam};
    return {page:'study',exam:selectedExam,chapterId:chapter.id,topicId,tab,mcqView:tab==='Multiple Choice'?sectionMcqView:'stats'};
  }
  function routeUrl(route){return '#cs4341/'+encodeURIComponent(JSON.stringify(route))}
  function currentNav(){return window.history.state?.[NAV_KEY]||null}
  function routeKey(route){return JSON.stringify(route)}
  function commitRoute(){
    if(!ready)return;
    const route=routeNow(),current=currentNav();
    if(current&&routeKey(current.route)===routeKey(route))return;
    if(current&&current.route.page==='study'&&current.route.tab==='Multiple Choice'&&current.route.mcqView==='quiz'&&route.page==='study'&&route.tab==='Multiple Choice'&&route.mcqView==='results'&&current.route.topicId===route.topicId){replaceRoute(route,current.index);return}
    const index=(Number.isInteger(current?.index)?current.index:0)+1;
    try{window.history.pushState({[NAV_KEY]:{index,route}},'',routeUrl(route))}catch{}
    fallbackRoutes=fallbackRoutes.slice(0,fallbackIndex+1);fallbackRoutes.push(route);fallbackIndex=fallbackRoutes.length-1;
  }
  function replaceRoute(route,index=0){
    try{window.history.replaceState({[NAV_KEY]:{index,route}},'',routeUrl(route))}catch{}
    if(fallbackRoutes.length)fallbackRoutes[fallbackIndex]=route;else{fallbackRoutes=[route];fallbackIndex=0}
  }
  function validRoute(route){
    if(!route||!['home','study'].includes(route.page))return false;
    if(route.page==='home')return true;
    const c=CHAPTERS.find(x=>x.id===route.chapterId);
    return !!c&&c.topics.some(t=>t[0]===route.topicId)&&['Reference','Problem Solving','Multiple Choice'].includes(route.tab)&&(!route.mcqView||['stats','details','quiz','results'].includes(route.mcqView));
  }
  function restoreRoute(route){
    if(!validRoute(route))route={page:'home',exam:read('selectedExam',1)};
    selectedExam=Number.isInteger(route.exam)&&route.exam>=1&&route.exam<=3?route.exam:read('selectedExam',1);
    save('selectedExam',selectedExam);
    if(route.page==='home'){
      chapter=null;topicId=null;$('#study').classList.add('hidden');$('#home').classList.remove('hidden');drawHome();return;
    }
    chapter=CHAPTERS.find(x=>x.id===route.chapterId);topicId=route.topicId;tab=route.tab;
    sectionMcqView=route.tab==='Multiple Choice'&&['stats','details','quiz','results'].includes(route.mcqView)?route.mcqView:'stats';
    save('lastProblemTopic:'+chapter.id,topicId);
    $('#home').classList.add('hidden');$('#study').classList.remove('hidden');drawTopicSelect();drawTabs();render();
  }
  function closeDrawer(restore=true){
    const drawer=$('#chapterDrawer'),backdrop=$('#drawerBackdrop'),button=$('#menuButton');
    drawer.classList.add('hidden');backdrop.classList.add('hidden');button.setAttribute('aria-expanded','false');
    document.body.classList.remove('drawer-open');
    if(restore&&previousFocus?.isConnected)previousFocus.focus();previousFocus=null;
  }
  function openDrawer(){
    const drawer=$('#chapterDrawer'),backdrop=$('#drawerBackdrop'),button=$('#menuButton');
    previousFocus=document.activeElement;drawer.classList.remove('hidden');backdrop.classList.remove('hidden');button.setAttribute('aria-expanded','true');
    $('#drawerLinks').replaceChildren();
    const homeLink=document.createElement('button');homeLink.type='button';homeLink.className='drawer-link';homeLink.textContent='Home / Chapters';homeLink.onclick=()=>navigateHome(true);$('#drawerLinks').append(homeLink);
    CHAPTERS.forEach(c=>{const item=document.createElement('button');item.type='button';item.className='drawer-link';item.textContent=`Ch ${c.number} — ${c.title}`;item.onclick=()=>{closeDrawer(false);openChapter(c);$('#backButton').focus()};$('#drawerLinks').append(item)});
    document.body.classList.add('drawer-open');$('#closeDrawer').focus();
  }
  function navigateHome(fromDrawer=false){
    if(!chapter){closeDrawer(!fromDrawer);return}
    closeDrawer(false);window.home();const route={page:'home',exam:selectedExam},current=currentNav();replaceRoute(route,Number.isInteger(current?.index)?current.index:0);if(fromDrawer)$('#brandHome').focus();
  }
  window.initializeNavigation=function(){
    // Keep in-progress records written by the previously loaded per-type presenter reachable
    // through the established section-level Problem Solving controller.
    if(typeof window.problemState==='function'&&!window.problemState.__cs4341Compat){
      const readProblemState=window.problemState;
      const compatibleProblemState=function(){const state=readProblemState();if(!state.active&&state.activeByType&&state.selectedType&&state.activeByType[state.selectedType]){state.active=JSON.parse(JSON.stringify(state.activeByType[state.selectedType]));save('problems:'+topicId,state)}return state};
      compatibleProblemState.__cs4341Compat=true;window.problemState=compatibleProblemState;
    }
    const baseRender=window.render;
    window.render=function(){baseRender();const context=$('#breadcrumb');if(context&&chapter)context.textContent=`Chapters / Ch ${chapter.number} — ${chapter.title}`;commitRoute()};
    window.drawTabs=function(){
      const node=$('#tabs');node.replaceChildren();
      ['Reference','Problem Solving','Multiple Choice'].forEach(label=>{
        const button=document.createElement('button');button.type='button';button.textContent=label;
        button.setAttribute('aria-pressed',String(tab===label));button.setAttribute('aria-current',String(tab===label));
        button.onclick=()=>{if(label!==tab&&label!=='Multiple Choice')sectionMcqView='stats';tab=label;drawTabs();drawTopicSelect();render()};node.append(button);
      });
    };
    $('#backButton').onclick=()=>navigateHome(false);
    $('#brandHome').onclick=()=>navigateHome(false);
    $('#menuButton').onclick=()=>$('#menuButton').getAttribute('aria-expanded')==='true'?closeDrawer():openDrawer();
    $('#closeDrawer').onclick=()=>closeDrawer();$('#drawerBackdrop').onclick=()=>closeDrawer();
    document.addEventListener('keydown',event=>{const drawer=$('#chapterDrawer');if(drawer.classList.contains('hidden'))return;if(event.key==='Escape'){event.preventDefault();closeDrawer();return}if(event.key==='Tab'){const focusable=Array.from(drawer.querySelectorAll('button:not([disabled]),a[href],select:not([disabled]),input:not([disabled])'));if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
    window.addEventListener('popstate',event=>{const state=event.state?.[NAV_KEY];if(state&&validRoute(state.route)){fallbackIndex=Math.max(0,Math.min(Number.isInteger(state.index)?state.index:0,fallbackRoutes.length-1));restoreRoute(state.route)}});
    ready=true;const saved=currentNav();
    if(saved&&validRoute(saved.route))restoreRoute(saved.route);else replaceRoute(routeNow(),0);
    if(!fallbackRoutes.length)fallbackRoutes=[routeNow()];
  };
  window.syncHomeNavigationState=function(){if(!ready||chapter)return;const current=currentNav();replaceRoute(routeNow(),Number.isInteger(current?.index)?current.index:0)};
  window.initializeHomeTransferTools=function(){
    const root=$('#homeTransferTools');if(!root)return;root.replaceChildren();
    function icon(kind,label,path){
      const button=document.createElement('button');button.type='button';button.className='mc-transfer-button mc-transfer-'+kind;button.setAttribute('aria-label',label);button.title=label;
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
      const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('d',path);svg.append(line);button.append(svg);return button;
    }
    const tools=document.createElement('div');tools.className='mc-transfer-tools';
    const exportButton=icon('export','Export CS 4341 study data','M12 3v11m0 0 4-4m-4 4-4-4M4 17v3h16v-3');
    const importButton=icon('import','Import CS 4341 study data','M12 15V4m0 0L8 8m4-4 4 4M4 17v3h16v-3');
    const file=document.createElement('input');file.type='file';file.accept='.json,application/json';file.hidden=true;file.setAttribute('aria-label','Choose CS 4341 study backup');
    exportButton.onclick=()=>{try{exportState()}catch(error){window.alert('Export failed: '+error.message)}};
    importButton.onclick=()=>file.click();file.onchange=()=>{if(file.files?.[0])importState({target:file});file.value=''};
    tools.append(exportButton,importButton,file);root.append(tools);
  };
})();
