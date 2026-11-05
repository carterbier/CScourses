
function createHomeButton(){const button=document.createElement('button');button.type='button';button.textContent='\u2190 Home';button.setAttribute('aria-label','\u2190 Home');button.addEventListener('click',()=>showSection('home',true));return button}
/* Shared progress and diagram helpers, followed by the Leftist Heap workspace. */
function persistProgress(key,patch) {
 try {
  const previous=JSON.parse(CS3345Storage.getItem(key)||'{}');
  function merge(a,b){const out=a&&typeof a==='object'&&!Array.isArray(a)?{...a}:{};for(const[k,v]of Object.entries(b))out[k]=v&&typeof v==='object'&&!Array.isArray(v)?merge(out[k],v):v;return out;}
  CS3345Storage.setItem(key,JSON.stringify(merge(previous,patch)));
 } catch {}
}
/* Presentation-only sizing shared by expanding practice diagrams. */
const ExpandedViews=(()=>{
 const ns='http://www.w3.org/2000/svg';
 function svg(tag,attrs={},text){const el=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;return el;}
 function arrowMarker(id,size=7,color='#45564C'){const marker=svg('marker',{id,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:size,markerHeight:size,orient:'auto'});marker.append(svg('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:color}));return marker;}
 function width(id,padding=36){const root=typeof document==='undefined'?null:document.getElementById(id);let available=(root?.clientWidth||1000)-padding;const body=root?.querySelector('.nl-body');if(body?.clientWidth){const css=getComputedStyle(body);available=Math.min(available,body.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight)-4);}return Math.max(160,available);}
 function tree(m,available,node=38,rowPitch=null){
  const limit=Math.max(140,available),margin=node/2+12;if(m.width<=limit)return m;
  const ratio=Math.max(0,(limit-2*margin)/(m.width-2*margin)),gap=node+12;
  if(!m.items.some((a,i)=>m.items.slice(0,i).some(b=>Math.abs(a.y-b.y)<1&&Math.abs(a.x-b.x)*ratio<gap))){m.items.forEach(p=>p.x=margin+(p.x-margin)*ratio);m.width=limit;return m;}
  const children=new Map(m.items.map(i=>[i,[]]));m.edges.forEach(e=>children.get(e.a)?.push(e.b));children.forEach(a=>a.sort((x,y)=>x.x-y.x));const childSet=new Set(m.edges.map(e=>e.b)),roots=m.items.filter(i=>!childSet.has(i)),order=[],depths=new Map();let maxDepth=0;
  function visit(i,d){order.push(i);depths.set(i,d);maxDepth=Math.max(maxDepth,d);for(const c of children.get(i)||[])visit(c,d+1);}roots.forEach(i=>visit(i,0));
  const indent=Math.min(38,(limit-2*margin)/Math.max(1,maxDepth)),pitch=rowPitch??node+34;
  order.forEach((p,i)=>{p.x=margin+depths.get(p)*indent;p.y=margin+i*pitch;});
  for(const e of m.edges){const a=e.a,b=e.b,r=node/2;if(indent>=r+8){const x=Math.max(5,a.x-r-9);e.path='M '+(a.x-r)+' '+a.y+' L '+x+' '+a.y+' L '+x+' '+b.y+' L '+(b.x-r)+' '+b.y;}else{const x=8+depths.get(a)*3;e.path='M '+(a.x-r)+' '+a.y+' L '+x+' '+a.y+' L '+x+' '+b.y+' L '+(b.x-r)+' '+b.y;}}
  m.width=Math.max(...m.items.map(p=>p.x))+margin;m.height=Math.max(...m.items.map(p=>p.y))+margin+16;m.outline=true;return m;
 }
 function edge(svg,e,r=17,color='#45564C'){const line=document.createElementNS(ns,e.path?'path':'line');if(e.path){line.setAttribute('d',e.path);line.setAttribute('fill','none');}else for(const[k,v]of Object.entries({x1:e.a.x,y1:e.a.y+r,x2:e.b.x,y2:e.b.y-r}))line.setAttribute(k,v);line.setAttribute('stroke',color);line.setAttribute('stroke-width','1.5');svg.append(line);}
  function dag(g,available,{radius=24,annotations=false,labelText=e=>String(e.w??'')}={}){
  const w=Math.max(240,available),margin=annotations?58:46,pitch=annotations?190:145,cell=annotations?116:100,cols=Math.max(1,Math.floor((w-2*margin)/cell)+1),order=GraphCore.kahn(g).order,rank=Array(g.n).fill(0),positions=Array(g.n);
  for(const u of order)for(const e of g.edges.filter(e=>e.u===u))rank[e.v]=Math.max(rank[e.v],rank[u]+1);
  let row=0;for(let k=0;k<=Math.max(...rank);k++){const vs=order.filter(v=>rank[v]===k);for(let start=0;start<vs.length;start+=cols){const group=vs.slice(start,start+cols);group.forEach((v,i)=>positions[v]={x:group.length===1?w/2:margin+i*(w-2*margin)/(group.length-1),y:75+row*pitch});row++;}}
  const height=80+row*pitch,obstacles=positions.map(p=>({x:p.x-radius-4,y:p.y-radius-4,w:2*radius+8,h:2*radius+8}));
  if(annotations)for(const p of positions)for(const dy of [-48,48])obstacles.push({x:p.x-44,y:p.y+dy-13,w:88,h:26});
  const ports=positions.flatMap(p=>[{x:p.x+radius+10,y:p.y},{x:p.x-radius-10,y:p.y}]),unique=a=>[...new Set(a.filter(Number.isFinite).map(x=>Math.round(x*10)/10))].sort((a,b)=>a-b),xs=unique([8,w-8,...obstacles.flatMap(b=>[b.x-7,b.x+b.w+7]),...ports.map(p=>p.x)]).filter(x=>x>=7&&x<=w-7),ys=unique([8,height-8,...obstacles.flatMap(b=>[b.y-7,b.y+b.h+7]),...ports.map(p=>p.y)]).filter(y=>y>=7&&y<=height-7),nx=xs.length;
  const inside=(x,y)=>obstacles.some(b=>x>b.x-1&&x<b.x+b.w+1&&y>b.y-1&&y<b.y+b.h+1),blocked=new Uint8Array(nx*ys.length),adj=new Map();for(let y=0;y<ys.length;y++)for(let x=0;x<nx;x++)blocked[y*nx+x]=inside(xs[x],ys[y])?1:0;
  function clear(a,b){return!obstacles.some(r=>a.x===b.x?a.x>r.x-1&&a.x<r.x+r.w+1&&Math.max(a.y,b.y)>r.y-1&&Math.min(a.y,b.y)<r.y+r.h+1:a.y>r.y-1&&a.y<r.y+r.h+1&&Math.max(a.x,b.x)>r.x-1&&Math.min(a.x,b.x)<r.x+r.w+1);}
  function neighbors(id){if(adj.has(id))return adj.get(id);const x=id%nx,y=Math.floor(id/nx),out=[];for(const[dx,dy]of[[0,1],[1,0],[-1,0],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||xx>=nx||yy<0||yy>=ys.length)continue;const next=yy*nx+xx;if(!blocked[next]&&clear({x:xs[x],y:ys[y]},{x:xs[xx],y:ys[yy]}))out.push(next);}adj.set(id,out);return out;}
  function route(start,end){const index=p=>ys.indexOf(Math.round(p.y*10)/10)*nx+xs.indexOf(Math.round(p.x*10)/10),source=index(start),target=index(end),cost=new Map([[source,0]]),previous=new Map(),heap=[];
   const heuristic=id=>Math.abs(xs[id%nx]-end.x)+Math.abs(ys[Math.floor(id/nx)]-end.y);
   function push(item){heap.push(item);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=item.f)break;heap[i]=heap[p];i=p;}heap[i]=item;}
   function pop(){const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let c=2*i+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return first;}
   push({id:source,g:0,f:heuristic(source)});while(heap.length){const current=pop();if(current.g!==cost.get(current.id))continue;if(current.id===target){const ids=[target];while(ids[0]!==source)ids.unshift(previous.get(ids[0]));const points=ids.map(id=>({x:xs[id%nx],y:ys[Math.floor(id/nx)]}));return points.filter((p,i)=>!i||i===points.length-1||!((points[i-1].x===p.x&&p.x===points[i+1].x)||(points[i-1].y===p.y&&p.y===points[i+1].y)));}for(const next of neighbors(current.id)){const distance=Math.abs(xs[current.id%nx]-xs[next%nx])+Math.abs(ys[Math.floor(current.id/nx)]-ys[Math.floor(next/nx)]),nextCost=current.g+distance;if(nextCost<(cost.get(next)??Infinity)){cost.set(next,nextCost);previous.set(next,current.id);push({id:next,g:nextCost,f:nextCost+heuristic(next)});}}}throw Error('Unable to lay out this event connection.');
  }
  const placed=[],edges=[];const overlap=(a,b)=>a.x<b.x+b.w+5&&a.x+a.w+5>b.x&&a.y<b.y+b.h+5&&a.y+a.h+5>b.y;
  for(const e of g.edges){const a=positions[e.u],b=positions[e.v],points=[{x:a.x+radius+5,y:a.y},...route({x:a.x+radius+10,y:a.y},{x:b.x-radius-10,y:b.y}),{x:b.x-radius-5,y:b.y}],text=labelText(e),labelWidth=Math.max(30,String(text).length*8+12),candidates=[];for(let i=1;i<points.length;i++)for(const t of [.5,.3,.7,.15,.85]){const c=points[i-1],d=points[i];candidates.push({x:c.x+(d.x-c.x)*t-labelWidth/2,y:c.y+(d.y-c.y)*t-12,w:labelWidth,h:24});}
   let box=candidates.find(r=>r.x>=4&&r.x+r.w<=w-4&&!obstacles.some(b=>overlap(r,b))&&!placed.some(b=>overlap(r,b)));
   if(!box){const anchor=candidates[0]||{x:w/2,y:a.y};for(let radius=15;radius<height&&!box;radius+=20)for(const [dx,dy]of[[0,radius],[0,-radius],[30,radius],[-30,radius],[60,radius],[-60,radius]]){const r={x:Math.max(5,Math.min(w-labelWidth-5,anchor.x+dx)),y:anchor.y+dy,w:labelWidth,h:24};if(r.y>5&&r.y+r.h<height&&!obstacles.some(b=>overlap(r,b))&&!placed.some(b=>overlap(r,b))){box=r;break;}}}
   if(!box)throw Error('Unable to position an event label.');placed.push(box);edges.push({id:e.id,points,path:points.map((p,i)=>(i?'L ':'M ')+p.x+' '+p.y).join(' '),label:box});
  }return{width:w,height,positions,edges,timeOffsets:{E:-48,L:48}};
 }

 return{width,tree,edge,dag,svg,arrowMarker};
})();

/* Shared keyboard submission and past/future stack transitions. */
const FormEvents=(()=>({submitOnEnter(control,submit){control.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submit(e);}};return control;}}))();
const HistoryStack=(()=>({
 save(past,future,snapshot,limit=Infinity){past.push(snapshot);if(past.length>limit)past.shift();future.length=0;},
 undo(past,future,capture){if(!past.length)return null;future.push(capture());return past.pop();},
 redo(past,future,capture){if(!future.length)return null;past.push(capture());return future.pop();}
}))();

/* Consistent safe DOM creation for text and class names. */
const DomKit={element(tag,text,cls){const element=document.createElement(tag);if(text!==undefined)element.textContent=text;if(cls)element.className=cls;return element;}};

const Heap = (() => {
  const copy = x => JSON.parse(JSON.stringify(x));
  const rank = n => n ? 1 + Math.min(rank(n.l),rank(n.r)) : -1;
  const node = v => ({v,l:null,r:null});
  function merge(a,b,steps) {
    if (!a || !b) {
      if (steps) steps.push('One heap is empty; keep the other heap.');
      return a || b;
    }
    if (steps) steps.push('Compare '+a.v+' and '+b.v+'. Keep '+Math.min(a.v,b.v)+' as this root.');
    if (a.v>b.v) [a,b]=[b,a];
    a.r=merge(a.r,b,steps);
    if (rank(a.l)<rank(a.r)) {
      if (steps) steps.push('At '+a.v+', swap children because the left NPL is smaller.');
      [a.l,a.r]=[a.r,a.l];
    } else if (steps) steps.push('At '+a.v+', keep the children: left NPL ≥ right NPL.');
    return a;
  }
  function build(values) { return values.reduce((h,v)=>merge(h,node(v)),null); }
  function values(n) { return n ? [n.v,...values(n.l),...values(n.r)] : []; }
  function equal(a,b) { return !a || !b ? a===b : a.v===b.v && equal(a.l,b.l) && equal(a.r,b.r); }
  return {copy,rank,node,merge,build,values,equal};
})();
const $ = id => document.getElementById(id);
function fitTrees() {
  document.querySelectorAll('.tree-scroll').forEach(wrap=>{
    const canvas=wrap.firstElementChild,width=Number(wrap.dataset.width),height=Number(wrap.dataset.height);
    if (!canvas || !wrap.clientWidth) return;
    const scale=Math.min(1,(wrap.clientWidth-4)/width);
    canvas.style.transform='translateX(-50%) scale('+scale+')';
    wrap.style.height=Math.ceil(height*scale)+2+'px';
  });
}
/* Pure question generation and structural grading; no progress storage. */
const LeftistPractice = (() => {
  const copy=Heap.copy,values=Heap.values;
  function walk(n){return n?[n,...walk(n.l),...walk(n.r)]:[];}
  function inspect(n){const order=[],leftist=[];for(const x of walk(n)){if((x.l&&x.v>x.l.v)||(x.r&&x.v>x.r.v))order.push(x.v);if(Heap.rank(x.l)<Heap.rank(x.r))leftist.push(x.v);}return{order,leftist,valid:!order.length&&!leftist.length};}
  function depth(n){return n?1+Math.max(depth(n.l),depth(n.r)):0;}
  function path(n){const out=[];for(;n;n=n.r)out.push(n.v);return out;}
  function explain(a,b,steps){
    if(!a||!b){steps.push('One heap is empty; return the other heap unchanged.');return a||b;}
    if(a.v>b.v)[a,b]=[b,a];
    steps.push('Compare roots '+a.v+' and '+b.v+': retain '+a.v+'; merge its right subtree with the heap rooted at '+b.v+'.');
    a.r=explain(a.r,b,steps);
    const l=Heap.rank(a.l),r=Heap.rank(a.r);
    if(l<r){[a.l,a.r]=[a.r,a.l];steps.push('At '+a.v+', NPL(left) = '+l+' < NPL(right) = '+r+': swap children. NPL('+a.v+') = 1 + min('+r+', '+l+') = '+Heap.rank(a)+'.');}
    else steps.push('At '+a.v+', NPL(left) = '+l+' ≥ NPL(right) = '+r+': keep the children. NPL('+a.v+') = '+Heap.rank(a)+'.');
    return a;
  }
  function measure(steps){return{comparisons:steps.filter(s=>s.startsWith('Compare roots')).length,swaps:steps.filter(s=>s.includes(': swap children.')).length};}
  function distinct(n,r){const pool=Array.from({length:97},(_,i)=>i+1);for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,n);}
  const int=(r,a,b)=>a+Math.floor(r()*(b-a+1));
  function makeProcedure(mode,difficulty,r){
    const hard=difficulty==='hard',easy=difficulty==='easy',sequential=mode==='insert'&&r()<.45;
    let a=null,b=null,sequence=[],stages=[],expected=null,steps=[],available=[];
    if(mode==='merge'){
      const n=int(r,...(easy?[2,4]:hard?[8,11]:[4,7])),m=easy&&r()<.12?0:int(r,...(easy?[2,4]:hard?[8,11]:[4,7]));
      const v=distinct(n+m,r);a=Heap.build(v.slice(0,n));b=Heap.build(v.slice(n));
      if(easy&&m===0&&r()<.5)[a,b]=[b,a];
      expected=explain(copy(a),copy(b),steps);
    }else if(mode==='delete'){
      const n=int(r,...(easy?[4,7]:hard?[15,21]:[8,12]));a=Heap.build(distinct(n,r));
      steps.push('Remove minimum '+a.v+'. Merge its left and right subtrees.');expected=explain(copy(a.l),copy(a.r),steps);
    }else if(sequential){
      sequence=distinct(int(r,...(easy?[3,5]:hard?[9,11]:[5,7])),r);
      sequence.forEach((v,i)=>{steps.push('Insertion '+(i+1)+': merge the current heap with singleton '+v+'.');expected=explain(expected,Heap.node(v),steps);stages.push(copy(expected));});
    }else{
      const n=int(r,...(easy?[2,4]:hard?[13,18]:[6,9])),v=distinct(n+1,r);a=Heap.build(v.slice(0,n));sequence=[v[n]];
      steps.push('Insert '+sequence[0]+' by merging a singleton with the supplied heap.');expected=explain(copy(a),Heap.node(sequence[0]),steps);
    }
    available=values(expected);const metrics=measure(steps);
    return{category:mode,difficulty,a,b,sequence,sequential,stages,expected,steps,available,metrics};
  }
  function qualifies(p){
    if(p.difficulty!=='hard')return p.difficulty==='easy'||p.metrics.comparisons>=2;
    if(depth(p.expected)>8)return false;
    if(p.category==='merge')return p.metrics.comparisons>=4&&p.metrics.swaps>=2;
    if(p.category==='delete')return p.metrics.comparisons>=3&&p.metrics.swaps>=2;
    return p.sequential?p.metrics.comparisons>=12&&p.metrics.swaps>=4:p.metrics.comparisons>=3&&p.metrics.swaps>=1;
  }
  function structural(difficulty,r){
    const kinds=['npl','violations','validity','swaps','rightPath','rightCount','rightBound','mergeBound'],kind=kinds[int(r,0,kinds.length-1)];
    const p={category:'npl',difficulty,kind,a:null,steps:[],available:[]};
    if(kind==='rightBound'){p.rightLength=int(r,2,difficulty==='hard'?6:4);p.expected=2**p.rightLength-1;return p;}
    if(kind==='mergeBound'){p.expected='log';return p;}
    let n=int(r,...(difficulty==='easy'?[4,6]:difficulty==='hard'?[11,15]:[7,10]));p.a=Heap.build(distinct(n,r));
    if(['validity','violations','swaps'].includes(kind)){
      const mask=kind==='validity'?int(r,0,3):r()<.2?0:2;
      if(mask&2){
        const count=difficulty==='hard'&&kind==='violations'?int(r,1,3):1;
        for(let i=0;i<count;i++){const candidates=walk(p.a).filter(x=>Heap.rank(x.l)>Heap.rank(x.r));if(!candidates.length)break;const x=candidates[int(r,0,candidates.length-1)];[x.l,x.r]=[x.r,x.l];}
      }
      if(mask&1){const largest=walk(p.a).reduce((a,b)=>a.v>b.v?a:b);[p.a.v,largest.v]=[largest.v,p.a.v];}
    }
    const info=inspect(p.a);p.available=values(p.a);
    if(kind==='npl'){const all=walk(p.a);p.target=all[int(r,0,all.length-1)].v;p.expected=Heap.rank(all.find(x=>x.v===p.target));}
    if(kind==='validity')p.expected=info.valid;
    if(kind==='violations'||kind==='swaps')p.expected=info.leftist;
    if(kind==='rightPath')p.expected=path(p.a);
    if(kind==='rightCount')p.expected=path(p.a).length;
    return p;
  }
  function generate(mode,difficulty,r=Math.random){
    if(mode==='npl')return structural(difficulty,r);
    for(let attempt=0;attempt<600;attempt++){const p=makeProcedure(mode,difficulty,r);if(qualifies(p))return p;}
    throw Error('Unable to generate a sufficiently demanding leftist heap; try New Problem.');
  }
  function sameSet(a,b){return a.length===b.length&&new Set(a).size===a.length&&a.every(x=>b.includes(x));}
  function gradeQuestion(p,answer){
    let actual;
    if(Array.isArray(p.expected)){
      if(!answer.chosen?.length&&!answer.none)return{ok:false,text:'Select the requested nodes, or explicitly choose None.'};
      actual=answer.chosen||[];
      return{ok:sameSet(actual,p.expected),text:sameSet(actual,p.expected)?'Correct.':'The selected node set is incorrect. Check the stated structural condition.'};
    }
    if(p.kind==='validity')actual=answer.valid;
    else if(p.kind==='mergeBound')actual=answer.bound||null;
    else{if(!/^\d+$/.test(String(answer.value??'').trim()))return{ok:false,text:'Enter a nonnegative integer; a blank field is unanswered.'};actual=Number(answer.value);}
    if(actual===null||actual===undefined)return{ok:false,text:'Choose an answer before submitting.'};
    return{ok:actual===p.expected,text:actual===p.expected?'Correct.':'Incorrect. Recheck the requested property; Show Solution provides the calculations.'};
  }
  function gradeTree(p,result,components,introduced,completed){
    if(p.sequential){
      if(introduced!==p.sequence.length)return{ok:false,text:'Complete every insertion in the supplied sequence before submitting.'};
      for(let i=0;i<p.stages.length-1;i++)if(!Heap.equal(completed[i],p.stages[i]))return{ok:false,text:'Insertion '+(i+1)+' was not completed using the standard merge result before the next key was introduced. Undo to that insertion or Reset.'};
    }
    if(components!==1)return{ok:false,text:'Join all components into one heap before submitting.'};
    if(!sameSet(values(result),p.available))return{ok:false,text:'The result must contain exactly the required keys.'};
    const info=inspect(result);
    if(info.order.length)return{ok:false,text:'Min-heap order fails at node '+info.order[0]+': a parent exceeds a child.'};
    if(info.leftist.length)return{ok:false,text:'The leftist property fails at node '+info.leftist[0]+': NPL(left) is smaller than NPL(right).'};
    if(!Heap.equal(result,p.expected))return{ok:false,text:'This is a valid leftist min-heap, but not the result of the specified operation. Check right-subtree recursion and preserve child order when NPLs tie.'};
    return{ok:true,text:'Correct. The final structure matches the standard merge-based operation.'};
  }
  return{walk,inspect,depth,path,explain,measure,distinct,generate,qualifies,gradeQuestion,gradeTree,sameSet};
})();

let category='merge',problem,nodes={},root=null,selected=null,removedNode=null;
let history=[],future=[],solved=false,revealed=false,introduced=0,completed=[],answer={},componentOrder=[],showNpl=false;
let drag=null,dragHover=null,boardLayoutWidth=0;
function message(text,type='info'){$('feedback').textContent=text;$('feedback').className='feedback '+type;}
function procedural(){return category!=='npl';}
function flatten(n){if(!n)return;nodes[n.v]={v:n.v,l:n.l?.v??null,r:n.r?.v??null};flatten(n.l);flatten(n.r);}
function tree(id,seen=new Set()){
  if(id===null||id===undefined)return null;
  if(seen.has(id)||!nodes[id])throw Error('Invalid tree connection.');
  seen.add(id);const n=nodes[id];return{v:n.v,l:tree(n.l,seen),r:tree(n.r,seen)};
}
function parent(id){return Object.values(nodes).find(n=>n.l===id||n.r===id);}
function componentRoot(id){let p;while((p=parent(id)))id=p.v;return id;}
function forestRoots(){return Object.values(nodes).filter(n=>!parent(n.v)).map(n=>n.v);}
function contains(id,target){if(id===null||!nodes[id])return false;return id===target||contains(nodes[id].l,target)||contains(nodes[id].r,target);}
function snapshot(){return Heap.copy({nodes,root,selected,removedNode,introduced,completed,answer,componentOrder});}
function save(){history.push(snapshot());future=[];}
function restore(s){({nodes,root,selected,removedNode,introduced,completed,answer,componentOrder}=Heap.copy(s));$('solution').hidden=true;renderReferences();renderQuestionAnswer();renderEditor();message('');}
function changed(){solved=false;$('solution').hidden=true;renderEditor();message('');}
function detach(id){const p=parent(id);if(p){if(p.l===id)p.l=null;else p.r=null;}if(root===id)root=null;}
function choose(id){
  if(!procedural()){
    if(!Array.isArray(problem.expected))return;
    save();answer.chosen??=[];answer.chosen=answer.chosen.includes(id)?answer.chosen.filter(x=>x!==id):[...answer.chosen,id];answer.none=false;$('solution').hidden=true;renderQuestionAnswer();renderEditor();message('');return;
  }
  selected=selected===id?null:id;renderEditor();
}
function place(p,side,dragId){
  if(!procedural())return;const id=dragId===undefined?selected:dragId;
  if(id===null||!nodes[id]){message('Select a subtree first.','error');return;}
  if(p===null){makeRoot(id);return;}
  if(!nodes[p]||!['l','r'].includes(side)){message('Choose an existing L/R attachment position.','error');return;}
  if(contains(id,p)){message('A subtree cannot be attached inside itself.','error');return;}
  if(nodes[p][side]===id)return;
  save();detach(id);nodes[p][side]=id;root=componentRoot(p);selected=id;changed();
}
function edit(action){
  if(!procedural()||selected===null||!nodes[selected])return;
  const n=nodes[selected];
  if(action==='swap'&&n.l===null&&n.r===null)return;
  if(action==='detach'&&!parent(selected))return;
  if(!['swap','detach','remove'].includes(action))return;
  save();
  if(action==='swap')[n.l,n.r]=[n.r,n.l];
  if(action==='detach')detach(selected);
  if(action==='remove'){
    if(category==='delete'&&removedNode!==null)return;
    detach(selected);n.l=null;n.r=null;
    if(category==='delete'){removedNode=selected;delete nodes[selected];selected=null;}
  }
  changed();
}
function makeRoot(id=selected){
  if(!procedural()||id===null||!nodes[id])return;
  if(root===id&&!parent(id))return;
  save();detach(id);root=id;selected=id;changed();
}
function seed(blank=false,record=true){
  if(record)save();nodes={};root=null;selected=null;removedNode=null;introduced=0;completed=[];answer={value:'',chosen:[],none:false,valid:null,bound:''};componentOrder=[];
  if(procedural()){
    if(blank)problem.available.forEach(v=>nodes[v]={v,l:null,r:null});
    else if(category==='merge'){flatten(problem.a);flatten(problem.b);root=problem.a?.v??problem.b?.v??null;}
    else if(category==='delete'){flatten(problem.a);root=problem.a?.v??null;}
    else{flatten(problem.a);const v=problem.sequence[0];nodes[v]={v,l:null,r:null};introduced=1;root=problem.a?.v??v;}
  }else{flatten(problem.a);root=problem.a?.v??null;}
  $('solution').hidden=true;renderReferences();renderQuestionAnswer();changed();
}
function nextInsertion(){
  if(!problem.sequential||introduced>=problem.sequence.length)return;
  save();const roots=forestRoots();completed.push(roots.length===1?tree(roots[0]):null);
  const v=problem.sequence[introduced++];nodes[v]={v,l:null,r:null};selected=v;changed();renderReferences();
}
function startLeftist(p){
  problem=p;category=p.category;history=[];future=[];solved=false;revealed=false;showNpl=false;$('showNpl').checked=false;endDrag();
  document.querySelectorAll('#heapSection [data-category]').forEach(b=>{const active=b.dataset.category===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $('problemTitle').textContent='Question';
  const prompts={npl:'Find the NPL of highlighted node '+p.target+'.',violations:'Select every node that violates NPL(left) ≥ NPL(right). Select None if there are no violations.',validity:'Is this tree a valid leftist min-heap? Consider both heap order and the leftist property.',swaps:'During merge restoration, which nodes currently require their children to be swapped? Select all, or None.',rightPath:'Select every node on the right path, including the root.',rightCount:'How many nodes are on the right path, including the root?',rightBound:'A leftist heap has '+p.rightLength+' nodes on its right path. What is the minimum possible number of nodes in the heap?',mergeBound:'Which worst-case time bound describes merging two leftist heaps with N total nodes?'};
  $('problemDescription').textContent=category==='merge'?'Merge the two leftist heaps.':category==='delete'?'Perform one DeleteMin operation on the leftist heap.':category==='insert'?(p.sequential?'Starting empty, insert '+p.sequence.join(', ')+' in that order using merge. Finish each insertion before introducing the next key; all insertions are graded together.':'Insert value '+p.sequence[0]+' into the leftist heap.'):prompts[p.kind];
  seed(false,false);message('');
  if(!$('heapSection').hidden)$('lfNumber')?.focus({preventScroll:true});
}
function newProblem(){startLeftist(LeftistPractice.generate(category,$('difficulty').value));}
function switchCategory(c){if(!['merge','insert','delete','npl'].includes(c))return;category=c;newProblem();}

/* Contour layout keeps labels and attachment positions clear at their original size. */
function layout(n,slots=false,editing=false){
  const gap=editing?84:53,half=editing?46:22;
  function walk(n,depth){
    if(!n)return null;const item={x:0,y:depth*gap+32,n},res={items:[item],edges:[],lo:[-half],hi:[half],root:item};
    const left=walk(n.l,depth+1),right=walk(n.r,depth+1);let separation=editing?94:52;
    if(left&&right)for(let d=0;d<Math.min(left.hi.length,right.lo.length);d++)separation=Math.max(separation,left.hi[d]-right.lo[d]+12);
    for(const [child,offset,label]of [[left,-separation/2,'L'],[right,separation/2,'R']])if(child){
      child.items.forEach(i=>i.x+=offset);res.items.push(...child.items);res.edges.push(...child.edges,{a:item,b:child.root,label});
      for(let d=0;d<child.lo.length;d++){res.lo[d+1]=Math.min(res.lo[d+1]??Infinity,child.lo[d]+offset);res.hi[d+1]=Math.max(res.hi[d+1]??-Infinity,child.hi[d]+offset);}
    }return res;
  }
  const res=walk(n,0);if(!res)return{items:[],edges:[],width:100,height:50};
  const min=Math.min(...res.lo)-5,max=Math.max(...res.hi)+5;res.items.forEach(i=>i.x-=min);
  return{items:res.items,edges:res.edges,width:max-min,height:Math.max(...res.items.map(i=>i.y))+(editing?55:27)};
}
/* Fit readable Leftist diagrams to the page; grow vertically instead of scrolling. */
function expandedLeftistLayout(n,editing,available){
  const m=layout(n,false,editing),limit=Math.max(120,available),margin=editing?51:27;
  if(m.width<=limit)return m;
  const scale=Math.max(0,(limit-2*margin)/(m.width-2*margin)),clearance=editing?82:46;
  const crowded=m.items.some((a,i)=>m.items.slice(0,i).some(b=>a.y===b.y&&Math.abs(a.x-b.x)*scale<clearance));
  if(!crowded){m.items.forEach(i=>i.x=margin+(i.x-margin)*scale);m.width=limit;return m;}
  // A preorder outline keeps every node and L/R attachment readable on narrow pages.
  const depths=new Map();let row=0,maxDepth=0;
  function visit(t,depth){if(!t)return;depths.set(t.v,{depth,row:row++});maxDepth=Math.max(maxDepth,depth);visit(t.l,depth+1);visit(t.r,depth+1);}visit(n,0);
  const indent=Math.min(36,(limit-2*margin)/Math.max(1,maxDepth)),gap=editing?84:53,radius=editing?22:17;
  m.items.forEach(i=>{const p=depths.get(i.n.v);i.x=margin+p.depth*indent;i.y=32+p.row*gap;});
  for(const e of m.edges){
    const a=e.a,b=e.b,depth=depths.get(a.n.v).depth;
    if(indent>=30)e.path='M '+a.x+' '+(a.y+radius)+' L '+a.x+' '+b.y+' L '+(b.x-radius)+' '+b.y;
    else{const gutter=12+depth*4;e.path='M '+(a.x-radius)+' '+a.y+' L '+gutter+' '+a.y+' L '+gutter+' '+b.y+' L '+(b.x-radius)+' '+b.y;}
    e.labelX=b.x-radius-9;e.labelY=b.y-6;
  }
  m.width=Math.max(...m.items.map(i=>i.x))+margin;m.height=Math.max(...m.items.map(i=>i.y))+(editing?55:27);return m;
}

const lfElement=DomKit.element;
function diagram(models,{editing=false,selectable=false,ranks=false,target=null,availableWidth=null}={}){
  const view=lfElement('div',undefined,'lf-viewport'),stage=lfElement('div',undefined,'lf-stage'+(editing?'':' lf-static'));
  if(!models.length||models.every(x=>!x.n)){view.append(lfElement('div','Empty heap','lf-empty'));return view;}
  const limit=Math.max(120,availableWidth??($('canvas').clientWidth||940)),gap=18,items=[],edges=[],labels=[];let x=0,y=0,rowHeight=0,width=0;
  for(const model of models){
    if(!model.n)continue;const m=expandedLeftistLayout(model.n,editing,limit);
    if(editing&&x>0&&x+m.width>limit){y+=rowHeight+8;x=0;rowHeight=0;}
    const labelSpace=editing&&models.length>1?17:0;
    const shiftY=y+labelSpace;for(const edge of m.edges)if(edge.path){edge.path=edge.path.replace(/([ML]) ([\d.-]+) ([\d.-]+)/g,(_,command,px,py)=>command+' '+(Number(px)+x)+' '+(Number(py)+shiftY));edge.labelX+=x;edge.labelY+=shiftY;}m.items.forEach(i=>{i.x+=x;i.y+=shiftY;});items.push(...m.items);edges.push(...m.edges);
    if(labelSpace)labels.push({x:m.items[0].x,y:y+1,text:'Root '+model.n.v});
    rowHeight=Math.max(rowHeight,m.height+labelSpace);width=Math.max(width,x+m.width);x+=m.width+gap;
  }
  const height=y+rowHeight;stage.style.width=width+'px';stage.style.height=height+'px';
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('width',width);svg.setAttribute('height',height);svg.setAttribute('aria-hidden','true');
  for(const e of edges){const line=document.createElementNS(ns,e.path?'path':'line');if(e.path){line.setAttribute('d',e.path);line.setAttribute('fill','none');}else{line.setAttribute('x1',e.a.x);line.setAttribute('y1',e.a.y+(editing?20:15));line.setAttribute('x2',e.b.x);line.setAttribute('y2',e.b.y-(editing?20:15));}line.setAttribute('stroke','#45564C');line.setAttribute('stroke-width','1.5');svg.append(line);}
  stage.append(svg);labels.forEach(i=>{const e=lfElement('span',i.text,'lf-component');e.style.left=i.x+'px';e.style.top=i.y+'px';stage.append(e);});
  for(const i of items){
    const picked=editing?selected===i.n.v:selectable&&answer.chosen?.includes(i.n.v),el=lfElement(editing||selectable?'button':'div',i.n.v,'lf-node'+(picked?' selected':'')+(target===i.n.v?' target':''));
    el.style.left=i.x+'px';el.style.top=i.y+'px';el.dataset.node=i.n.v;
    if(el.tagName==='BUTTON'){el.type='button';el.setAttribute('aria-pressed',String(!!picked));}
    el.setAttribute('aria-label','Node '+i.n.v+(target===i.n.v?', calculate its NPL':'')+(ranks?', NPL '+Heap.rank(i.n):''));
    if(ranks)el.append(lfElement('span',Heap.rank(i.n),'lf-npl'));
    if(editing){el.onpointerdown=e=>beginDrag(e,i.n.v);el.onclick=e=>{if(e.detail===0)choose(i.n.v);};}
    if(selectable)el.onclick=()=>choose(i.n.v);
    stage.append(el);
    if(!editing||selected===null||contains(selected,i.n.v))continue;
    for(const side of ['l','r']){const port=lfElement('button',side.toUpperCase(),'lf-port'+(nodes[i.n.v][side]!==null?' occupied':''));port.type='button';port.dataset.target=i.n.v;port.dataset.side=side;port.style.left=(i.x+(side==='l'?-27:27))+'px';port.style.top=(i.y+31)+'px';port.setAttribute('aria-label','Attach selected subtree as '+(side==='l'?'left':'right')+' child of '+i.n.v+(nodes[i.n.v][side]!==null?'; release previous child':''));port.onclick=()=>place(i.n.v,side);stage.append(port);}
  }
  view.append(stage);return view;
}
function draw(n,interactive=false,ranks=false,availableWidth=null){return diagram([{n}],{selectable:interactive,ranks,availableWidth});}
function renderReferences(){
  $('given').replaceChildren();
  $('given').classList.remove('lf-stack-sources');
  if(!procedural()||category==='merge'||category==='delete')return;
  else if(problem.sequential){const row=lfElement('div',undefined,'lf-sequence');row.append(lfElement('span','Insertion order:'));problem.sequence.forEach((v,i)=>row.append(lfElement('span',v,'lf-key'+(i===introduced-1?' current':i>=introduced?' pending':''))));$('given').append(row);}
  else{const value=lfElement('div',undefined,'lf-source');value.append(lfElement('h3','Insert'),lfElement('span',problem.sequence[0],'lf-key'));$('given').append(value);}
}
function renderQuestionAnswer(){
  const box=$('lfQuestionAnswer');box.hidden=procedural();box.replaceChildren();if(procedural())return;
  const p=problem;
  if(Array.isArray(p.expected)){
    const label=lfElement('label'),input=document.createElement('input');input.type='checkbox';input.id='lfNone';input.checked=!!answer.none;input.onchange=()=>{save();answer.none=input.checked;if(input.checked)answer.chosen=[];$('solution').hidden=true;renderEditor();message('');};label.append(input,document.createTextNode(' None'));box.append(label,lfElement('span','Select nodes on the tree.','lf-answer-note'));
  }else if(p.kind==='validity'){
    for(const [v,name]of [[true,'Valid'],[false,'Invalid']]){const b=lfElement('button',name,'lf-choice');b.type='button';b.dataset.lfValid=String(v);b.setAttribute('aria-pressed',String(answer.valid===v));b.onclick=()=>{save();answer.valid=v;$('solution').hidden=true;renderQuestionAnswer();renderEditor();message('');};box.append(b);}
  }else if(p.kind==='mergeBound'){
    const label=lfElement('label','Worst-case time: '),s=document.createElement('select');s.id='lfBound';for(const [v,t]of [['','Choose'],['constant','O(1)'],['log','O(log N)'],['linear','O(N)'],['quadratic','O(N²)']]){const o=lfElement('option',t);o.value=v;s.append(o);}s.value=answer.bound;s.onchange=()=>{save();answer.bound=s.value;$('solution').hidden=true;message('');};label.append(s);box.append(label);
  }else{
    const label=lfElement('label',p.kind==='npl'?'NPL: ':'Your answer: '),input=document.createElement('input');input.id='lfNumber';input.type='text';input.inputMode='numeric';input.className='lf-input';input.autocomplete='off';input.value=answer.value;input.setAttribute('aria-label',p.kind==='npl'?'Null path length':'Numerical answer');input.oninput=()=>{save();answer.value=input.value;$('solution').hidden=true;message('');};input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();check();}};label.append(input);box.append(label);
  }
}
function renderEditor(){
  const host=$('canvas'),old=host.firstElementChild,sx=host.scrollLeft,sy=host.scrollTop,focus=document.activeElement;
  const focusNode=focus?.closest('#canvas [data-node]')?.dataset.node,focusSide=focus?.closest('#canvas [data-side]')?.dataset.side,focusTarget=focus?.closest('#canvas [data-target]')?.dataset.target;
  boardLayoutWidth=host.clientWidth;$('lfProcedure').hidden=!procedural();
  const roots=forestRoots();componentOrder=componentOrder.filter(id=>roots.includes(id));roots.forEach(id=>{if(!componentOrder.includes(id))componentOrder.push(id);});
  host.hidden=!procedural()&&!problem.a;
  host.replaceChildren(procedural()?diagram(componentOrder.map(id=>({n:tree(id)})),{editing:true,ranks:showNpl}):diagram([{n:problem.a}],{selectable:Array.isArray(problem.expected),target:problem.kind==='npl'?problem.target:null,ranks:showNpl}));
  host.scrollLeft=sx;host.scrollTop=sy;
  const selector=focusNode?'[data-node="'+focusNode+'"]':focusSide?'[data-target="'+focusTarget+'"][data-side="'+focusSide+'"]':null;
  if(selector)host.querySelector(selector)?.focus({preventScroll:true});
  $('selection').textContent=procedural()?(selected===null?'':'Selected subtree: '+selected):Array.isArray(problem.expected)?(answer.chosen.length?'Selected: '+answer.chosen.join(', '):answer.none?'None selected':''):'';
  const n=nodes[selected],remove=$('remove');remove.textContent=category==='delete'?'Remove':'Separate Node';remove.hidden=!procedural()||!n||(category==='delete'?removedNode!==null:n.l===null&&n.r===null);$('swap').hidden=!procedural()||!n||(n.l===null&&n.r===null);$('detach').hidden=!procedural()||!n||!parent(selected);$('rootTarget').hidden=!procedural()||!n||selected===root;
  $('lfNext').hidden=!problem.sequential||introduced>=problem.sequence.length;if(!$('lfNext').hidden)$('lfNext').textContent='Introduce next key: '+problem.sequence[introduced];
  $('undo').disabled=!history.length;$('redo').disabled=!future.length;
  if(!procedural()&&$('lfNone'))$('lfNone').checked=!!answer.none;
}
function check(){
  let result;
  if(!procedural())result=LeftistPractice.gradeQuestion(problem,answer);
  else{try{const roots=forestRoots();result=LeftistPractice.gradeTree(problem,roots.length===1?tree(roots[0]):null,roots.length,introduced,completed);}catch{result={ok:false,text:'The workspace contains an invalid tree connection.'};}}
  solved=result.ok;message(result.text,result.ok?'success':'error');return result.ok;
}
function showSolution(){
  revealed=true;$('solution').hidden=false;$('solutionTree').replaceChildren();const steps=[];
  function worked(n,label){const box=lfElement('div',undefined,'lf-source');box.leftistTree=n;box.append(lfElement('h3',label),draw(n,false,true,Math.max(120,$('solutionTree').clientWidth-16)));$('solutionTree').append(box);}
  if(procedural()){
    if(problem.sequential)problem.stages.forEach((n,i)=>worked(n,'After insertion '+(i+1)+' ('+problem.sequence[i]+')'));
    else worked(problem.expected,'Final heap · badges show NPL');steps.push(...problem.steps);
  }else{
    if(problem.a)worked(problem.a,'Given tree · badges show NPL');
    const p=problem,info=LeftistPractice.inspect(p.a);
    if(p.kind==='npl'){const n=LeftistPractice.walk(p.a).find(x=>x.v===p.target);steps.push('NPL('+n.v+') = 1 + min('+Heap.rank(n.l)+', '+Heap.rank(n.r)+') = '+p.expected+'.');}
    if(p.kind==='validity'){steps.push('Heap-order violations: '+(info.order.join(', ')||'none')+'. Leftist-property violations: '+(info.leftist.join(', ')||'none')+'. This tree is '+(p.expected?'valid':'invalid')+'.');}
    if(p.kind==='violations'||p.kind==='swaps')steps.push('Nodes with NPL(left) < NPL(right): '+(p.expected.join(', ')||'none')+'.');
    for(const v of info.leftist){const n=LeftistPractice.walk(p.a).find(x=>x.v===v);steps.push('At '+v+', left NPL = '+Heap.rank(n.l)+', right NPL = '+Heap.rank(n.r)+'. Swapping children restores the local leftist inequality.');}
    if(p.kind==='rightPath'||p.kind==='rightCount')steps.push('Following right children from the root gives '+LeftistPractice.path(p.a).join(' → ')+': '+LeftistPractice.path(p.a).length+' nodes.');
    if(p.kind==='rightBound')steps.push('With r nodes on the right path, a leftist heap needs at least 2^r − 1 nodes. Here 2^'+p.rightLength+' − 1 = '+p.expected+'.');
    if(p.kind==='mergeBound')steps.push('A right path has at most floor(log₂(N + 1)) nodes. Merge follows the two right paths with constant work at each visited node, giving O(log N) total time. A long left path does not invalidate this bound.');
  }
  $('steps').replaceChildren(...steps.map(s=>lfElement('li',s)));reflowBoard();message('Worked solution shown. Reset keeps it hidden until requested again.');
}
function undoLeftist(){if(!history.length)return;endDrag();future.push(snapshot());restore(history.pop());}
function redoLeftist(){if(!future.length)return;endDrag();history.push(snapshot());restore(future.pop());}
function endDrag(){drag=null;$('dragGhost').hidden=true;if(dragHover)dragHover.classList.remove('drag-target');dragHover=null;}
function beginDrag(e,id){if(e.button>0||!procedural())return;drag={id,x:e.clientX,y:e.clientY,moved:false,previous:selected};selected=id;e.preventDefault();renderEditor();}
window.addEventListener('pointermove',e=>{
  if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)drag.moved=true;if(!drag.moved)return;
  const ghost=$('dragGhost');ghost.textContent=drag.id+' · subtree';ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';ghost.hidden=false;
  const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('#heapSection .lf-port, #heapSection #rootTarget');
  if(target!==dragHover){dragHover?.classList.remove('drag-target');dragHover=target;dragHover?.classList.add('drag-target');}
});
window.addEventListener('pointerup',e=>{
  if(!drag)return;const d=drag,target=d.moved?document.elementFromPoint(e.clientX,e.clientY)?.closest('#heapSection .lf-port, #heapSection #rootTarget'):null;endDrag();
  if(target){if(target.id==='rootTarget')makeRoot(d.id);else place(Number(target.dataset.target),target.dataset.side,d.id);}
  else if(!d.moved){selected=d.previous===d.id?null:d.id;renderEditor();$('canvas').querySelector('[data-node="'+d.id+'"]')?.focus({preventScroll:true});}
});
window.addEventListener('pointercancel',endDrag);window.addEventListener('blur',endDrag);
document.querySelectorAll('#heapSection [data-category]').forEach(b=>b.onclick=()=>switchCategory(b.dataset.category));
$('showNpl').onchange=()=>{showNpl=$('showNpl').checked;renderEditor();};
$('newProblem').onclick=newProblem;$('difficulty').onchange=newProblem;$('check').onclick=check;$('reveal').onclick=showSolution;
$('swap').onclick=()=>edit('swap');$('detach').onclick=()=>edit('detach');$('remove').onclick=()=>edit('remove');$('rootTarget').onclick=()=>makeRoot();$('lfNext').onclick=nextInsertion;
$('undo').onclick=undoLeftist;$('redo').onclick=redoLeftist;$('reset').onclick=()=>{endDrag();seed(false);};
document.addEventListener('keydown',e=>{
  if($('heapSection').hidden||e.target?.matches?.('input,select,textarea,[contenteditable="true"]'))return;
  if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();e.key.toLowerCase()==='y'||e.shiftKey?redoLeftist():undoLeftist();}
  if(e.key==='Escape'){endDrag();selected=null;renderEditor();}
});
function reflowBoard(){if(!$('heapSection').hidden&&problem&&Math.abs($('canvas').clientWidth-boardLayoutWidth)>1){renderReferences();renderEditor();if(!$('solution').hidden)for(const box of $('solutionTree').children)box.querySelector('.lf-viewport')?.replaceWith(draw(box.leftistTree,false,true,Math.max(120,$('solutionTree').clientWidth-16)));}fitTrees();}
window.addEventListener('resize',reflowBoard);
if(typeof ResizeObserver!=='undefined')new ResizeObserver(reflowBoard).observe($('canvas'));
newProblem();


/* Binary Heap algorithms, question model, and shared heap UI. */
const BHCore = (() => {
  const copy=a=>a.slice();
  function record(steps,a,action,text){steps.push({...action,array:copy(a),text});}
  function sink(a,start,steps) {
    let i=start,n=a.length-1;
    while(2*i<=n){
      let child=2*i;if(child+1<=n&&a[child+1]<a[child])child++;
      if(a[i]<=a[child])break;
      const text='Swap index '+i+' ('+a[i]+') with its '+(child===2*i?'left':'right')+' child at index '+child+' ('+a[child]+').';
      [a[i],a[child]]=[a[child],a[i]];record(steps,a,{kind:'swap',a:i,b:child},text);i=child;
    }
  }
  function insert(input,value) {
    const a=copy(input),steps=[],index=a.length;a.push(value);
    record(steps,a,{kind:'append',index,value},'Place '+value+' at the next available array position, index '+index+'.');
    let i=index;
    while(i>1&&a[i]<a[Math.floor(i/2)]){
      const p=Math.floor(i/2),text='Compare with parent at index '+p+'. Swap '+a[i]+' upward past '+a[p]+'.';
      [a[i],a[p]]=[a[p],a[i]];record(steps,a,{kind:'swap',a:i,b:p},text);i=p;
    }
    return{array:a,steps,summary:'Append at index n + 1, then compare with parent floor(i/2). Percolate upward only while the inserted value is smaller. Stop at the root or when parent ≤ child.'};
  }
  function deleteMin(input) {
    const a=copy(input),steps=[],n=a.length-1;
    if(n<1)return{array:a,steps,summary:'The heap is empty; there is no minimum to remove.'};
    const removed=a[1];
    if(n===1){a.pop();record(steps,a,{kind:'removeMin',index:1},'Remove the only element, '+removed+'. The resulting heap is empty.');}
    else{
      a[1]=null;record(steps,a,{kind:'removeMin',index:1},'Remove the minimum root '+removed+'.');
      const last=a.pop();a[1]=last;record(steps,a,{kind:'moveLast',from:n,to:1},'Move the last element, '+last+' from index '+n+', into the root. Shrink the array by one.');
      sink(a,1,steps);
    }
    return{array:a,steps,summary:'Remove the root, replace it with the last element, then percolate down using the smaller existing child. If the children tie, choose the left child. Stop when parent ≤ children.'};
  }
  function build(input) {
    const a=copy(input),steps=[];
    for(let i=Math.floor((a.length-1)/2);i>=1;i--){
      record(steps,a,{kind:'start',index:i},'Begin processing non-leaf index '+i+'. Its child subheaps have already been processed.');
      sink(a,i,steps);
      record(steps,a,{kind:'processed',index:i},'Finish index '+i+'. Record the array, then move to index '+(i-1)+'.');
    }
    return{array:a,steps,summary:'Bottom-up buildHeap starts with the entire unsorted array. Process floor(n/2), floor(n/2) − 1, ..., 1, percolating each value down. This is different from sequential insertion, which starts empty and percolates each new value up.'};
  }
  function buildMetrics(input,reference=build(input)){
    let swaps=0,correctedRoots=0,multiLevelRoots=0,maxDepth=0,comparisons=0,depth=0,current=0;
    const n=input.length-1;
    for(const step of reference.steps){
      if(step.kind==='start'){depth=0;current=step.index;}
      if(step.kind==='swap'){comparisons+=2*current+1<=n?2:1;current=step.b;depth++;swaps++;}
      if(step.kind==='processed'){if(2*current<=n)comparisons+=2*current+1<=n?2:1;if(depth)correctedRoots++;if(depth>=2)multiLevelRoots++;maxDepth=Math.max(maxDepth,depth);}
    }
    const violations=input.slice(2).filter((x,i)=>input[Math.floor((i+2)/2)]>x).length;
    return{swaps,correctedRoots,multiLevelRoots,maxDepth,comparisons,violations};
  }
  function buildDemand(difficulty,m){
    return difficulty==='hard'?m.swaps>=13&&m.correctedRoots>=7&&m.multiLevelRoots>=3&&m.maxDepth>=3&&m.violations>=8:difficulty==='medium'?m.swaps>=3&&m.correctedRoots>=2&&m.maxDepth>=2:m.swaps>=1;
  }
  function generateBuild(difficulty,duplicates=false,r=Math.random,kind='finalArray'){
    const ranges=kind==='build'?{easy:[4,7],medium:[8,15],hard:[16,25]}:{easy:[5,8],medium:[8,15],hard:[16,25]},range=ranges[difficulty],int=(a,b)=>a+Math.floor(r()*(b-a+1));
    for(let attempt=0;attempt<160;attempt++){
      const n=attempt===159?(difficulty==='hard'?25:range[1]):int(...range),pool=Array.from({length:98},(_,i)=>i+2);
      for(let i=pool.length-1;i;i--){const j=int(0,i);[pool[i],pool[j]]=[pool[j],pool[i]];}
      const values=pool.slice(0,n);if(duplicates&&(attempt===159||r()<.45))values[n-1]=values[n-2];
      if(attempt===159||difficulty==='hard'&&r()<.5){values.sort((a,b)=>b-a);if(attempt!==159)for(let k=0;k<Math.floor(n/5);k++){const a=int(0,n-1),b=int(0,n-1);[values[a],values[b]]=[values[b],values[a]];}}
      const original=[null,...values],reference=build(original),complexity=buildMetrics(original,reference);
      if(buildDemand(difficulty,complexity))return{original,reference,complexity,attempts:attempt+1};
    }
    throw Error('Could not construct a calibrated heap problem.');
  }
  function treePositions(a,extra=false) {
    const n=a.length-1+(extra?1:0);if(n<1)return{items:[],edges:[],width:160,height:90};
    const levels=Math.floor(Math.log2(n))+1,width=Math.max(160,2**(levels-1)*56+30),items=[],edges=[];
    for(let i=1;i<=n;i++){const d=Math.floor(Math.log2(i)),j=i-2**d;items.push({index:i,value:i<a.length?a[i]:null,x:(j+.5)*width/2**d,y:40+d*82});}
    for(const item of items)if(item.index>1){const p=items[Math.floor(item.index/2)-1];edges.push({a:p,b:item});}
    return{items,edges,width,height:levels*82+20};
  }

  return{copy,insert,deleteMin,build,buildMetrics,buildDemand,generateBuild,treePositions};
})();


/* Binary/d-heap questions share entry mechanics; their existing solvers stay separate. */
const ArrayHeapPractice=(()=>{
 const int=(r,a,b)=>a+Math.floor(r()*(b-a+1)),copy=x=>JSON.parse(JSON.stringify(x));
 function parse(raw,empty=false){const s=String(raw??'').trim();if(empty&&(/^(?:empty|none)$/i.test(s)||s==='[]'))return{values:[]};const text=s.replace(/^\[(.*)\]$/,'$1').trim();if(!text)return{error:'Enter your answer; blank is unanswered.'};if(!/^[+-]?\d+(?:(?:\s*,\s*|\s+)[+-]?\d+)*$/.test(text))return{error:'Use integers separated by commas or spaces.'};const values=text.split(/[\s,]+/).map(Number);return values.every(Number.isSafeInteger)?{values}:{error:'Use ordinary safe integers.'};}
 function distinct(n,r){const a=Array.from({length:250},(_,i)=>i+2);for(let i=a.length-1;i;i--){const j=int(r,0,i);[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
 const parent=(i,d)=>i<=1?null:Math.floor((i-2)/d)+1;
 const children=(i,n,d)=>Array.from({length:d},(_,k)=>d*(i-1)+2+k).filter(x=>x<=n);
 function generate(C,family,mode,difficulty,d=2,r=Math.random){
  const binary=family==='binary',hard=difficulty==='hard',easy=difficulty==='easy',n=int(r,...(easy?[5,8]:hard?[18,25]:[9,15]));
  if(binary){
   let original=[null],reference=null,question='';const p={family,kind:mode,difficulty,d:2,procedural:true,answerKind:'array',n};
   if(mode==='finalArray'){const q=C.generateBuild(difficulty,false,r);original=q.original;reference=q.reference;question='Using bottom-up BuildHeap, transform the following array into a binary min-heap.';}
   else if(mode==='insert'){original=C.build([null,...distinct(n,r)]).array;const value=r()<.18?original[int(r,1,original.length-1)]:int(r,1,180);p.insertionValue=value;reference=C.insert(original,value);question='Insert '+value+' into this existing valid binary min-heap. Place the provided value in the array, then complete the insertion manually.';}
   else if(mode==='delete'){original=C.build([null,...distinct(n,r)]).array;reference=C.deleteMin(original);p.deleteCount=1;question='Perform exactly one DeleteMin operation on this binary min-heap. Select the element to remove, then restore the heap manually.';}
   else throw Error('Unsupported Binary Heaps mode.');
   p.original=original;p.reference=reference;p.expected=reference.array;p.question=question;p.n=original.length-1;return p;
  }
  const build=a=>C.build(a,d),insert=(a,v)=>C.insert(a,v,d),remove=a=>C.deleteMin(a,d);let original=[null],reference=null,question='',expected=null,sequence=[],deleteCount=0;
  const p={family,kind:mode,difficulty,d,original,reference,procedural:['insert','delete','build'].includes(mode),answerKind:'number',n};
  if(p.procedural){
   if(mode==='build'){original=[null,...distinct(n,r).sort((a,b)=>b-a)];if(!hard&&r()<.4)for(let i=0;i<3;i++){const a=int(r,1,n),b=int(r,1,n);[original[a],original[b]]=[original[b],original[a]];}reference=build(original);question='Using bottom-up BuildHeap, transform this unsorted array into a '+d+'-heap.';}
   else if(mode==='insert'){const values=distinct(n+1,r);original=build([null,...values.slice(0,n)]).array;sequence=[values[n]];reference=insert(original,sequence[0]);question='Insert '+sequence[0]+' into this existing valid '+d+'-heap. Place the provided value in the array, then complete insertion manually.';}
   else{original=build([null,...distinct(n,r)]).array;if(easy&&r()<.07)original=[null,original[1]];if(hard)original[original.length-1]=300;deleteCount=1;reference=remove(original);question='Perform exactly one DeleteMin operation on this '+d+'-heap. Select the element to remove, then restore the heap manually.';}
   p.answerKind='array';Object.assign(p,{original,reference,expected:reference.array,sequence,deleteCount,question,n:original.length-1});return p;
  }
  if(mode==='parent'||mode==='children'){
   p.n=int(r,...(easy?[5,25]:hard?[100,950]:[25,150]));p.target=r()<.15?1:r()<.25?p.n:int(r,1,p.n);p.variant=mode;const i=p.target;
   if(p.variant==='parent'){expected=parent(i,d);question='Find the parent index of node '+i+' in a '+d+'-heap with '+p.n+' occupied positions (1-based indexing).';p.answerKind='optional';}
   else if(p.variant==='children'){expected=children(i,p.n,d);question='List all existing child indices of node '+i+' in a '+d+'-heap with '+p.n+' occupied positions (1-based indexing).';p.answerKind='set';}
  }else throw Error('Unsupported d-Heap mode.');
  Object.assign(p,{expected,question});return p;
 } function grade(p,s){
 if(p.procedural){const actual=s.array.slice(1),expected=p.reference.array.slice(1);if(actual.some(x=>x===null)||actual.length!==expected.length)return{ok:false,message:'Fill every required array position before checking.'};const ok=actual.every((x,i)=>x===expected[i]);return{ok,message:ok?'Correct final array from the specified heap procedure.':'The array does not match the specified algorithm result. A generally valid heap is not sufficient.'};
  }
  if(p.answerKind==='set'){
   const parsed=s.answer.none?{values:[]}:parse(s.answer.value);if(parsed.error)return{ok:false,message:parsed.error};const actual=parsed.values,expected=p.expected,ok=actual.length===expected.length&&new Set(actual).size===actual.length&&actual.every(x=>expected.includes(x));return{ok,message:ok?'Correct.':'Select exactly the existing child indices.'};
  }
  const answered=s.answer.none||String(s.answer.value??'').trim()!=='';let actual=null;if(!s.answer.none){if(!/^\d+$/.test(String(s.answer.value??'').trim()))return{ok:false,message:'Enter a nonnegative integer, or choose the absence option when applicable.'};actual=Number(s.answer.value);}return{ok:answered&&actual===p.expected,message:answered&&actual===p.expected?'Correct.':answered?'Incorrect. Recheck the requested property.':'Choose an answer before submitting.'};
 }
 return{parse,distinct,parent,children,generate,grade,copy};
})();

function CompactArrayHeap(C,family,prefix,names){
 const P=ArrayHeapPractice,binary=family==='binary',$=id=>document.getElementById(prefix+id),section=document.getElementById(binary?'binarySection':'dheapSection'),copy=P.copy;
 const S={mode:binary?'finalArray':'parent',difficulty:'medium',d:binary?2:3,problem:null,array:[null],raw:'',answer:{},history:[],future:[],selected:[],actions:[],pendingIndex:0,removed:0,showTree:false,interactive:false,placingPending:false,insertedValuePlaced:false,removedValue:null};
 if(!binary){Object.defineProperties(S,{p:{get:()=>S.problem},a:{get:()=>S.array,set:a=>S.array=a},sel:{get:()=>S.selected}});}
 const E=DomKit.element;
 function msg(text,type='info'){$('Feedback').textContent=text;$('Feedback').className='feedback ah-feedback '+type;}
 function snapshot(){return copy({array:S.array,raw:S.raw,answer:S.answer,selected:S.selected,actions:S.actions,pendingIndex:S.pendingIndex,removed:S.removed,placingPending:S.placingPending,insertedValuePlaced:S.insertedValuePlaced,removedValue:S.removedValue});}
 function save(){S.history.push(snapshot());S.future=[];}
 function restore(s){Object.assign(S,copy(s));$('Solution').hidden=true;renderAnswers();renderWork();msg('');}
 function changed(){S.solved=false;$('Solution').hidden=true;renderWork();msg('');}
 function placeInsertion(index){
  if(S.problem?.kind!=='insert'||S.insertedValuePlaced||!Number.isInteger(index)||index<1||index>S.array.length)return;
  save();S.array.splice(index,0,binary?S.problem.insertionValue:S.problem.sequence[0]);S.insertedValuePlaced=true;S.placingPending=false;S.selected=[];changed();
 }
 function action(a){
  if(!S.problem?.procedural||a.kind!=='swap')return;
  const next=S.array.slice(),{a:first,b:second}=a;if(first===second||![first,second].every(i=>Number.isInteger(i)&&i>=1&&i<next.length))return;
  const x=next[first],y=next[second];if(x===null&&y===null)return;if(x===null)next[first]=y,next[second]=null;else if(y===null)next[second]=x,next[first]=null;else[next[first],next[second]]=[y,x];
  if(S.problem.kind==='delete')while(next.length>1&&next[next.length-1]===null)next.pop();
  save();S.array=next;S.actions.push(copy(a));S.selected=[];S.placingPending=false;changed();
 }
 function choose(i){
  if(!S.problem?.procedural)return;
  if(S.problem.kind==='insert'&&S.placingPending){placeInsertion(i);return;}
  if(S.selected.length===1&&S.selected[0]!==i){action({kind:'swap',a:S.selected[0],b:i});return;}
  S.selected=S.selected.includes(i)?[]:[i];renderWork();
 }
 function drop(a,b){action({kind:'swap',a,b});}
 function removeSelected(){
  const index=S.selected[0];if(S.problem?.kind!=='delete'||S.removed||!Number.isInteger(index)||S.array[index]===null)return;
  save();S.removedValue=S.array[index];S.array[index]=null;while(S.array.length>1&&S.array[S.array.length-1]===null)S.array.pop();S.removed=1;S.selected=[];changed();
 }
 let drag=null;
 function cancel(){drag=null;document.getElementById('dragGhost').hidden=true;}
 function begin(e,i){if(e.button>0)return;drag={i,x:e.clientX,y:e.clientY,moved:false,problem:S.problem};e.preventDefault();}
 function arrayView(a,editable=false){
  const row=E('div',undefined,'ah-array');row.onclick=e=>{if(editable&&S.placingPending&&e.target===row)placeInsertion(a.length);};if(a.length===1){row.append(E('span','Empty heap','ah-empty'));return row;}
   for(let i=1;i<a.length;i++){const empty=a[i]===null,label=empty?(binary?'Empty':String.fromCharCode(0x2014)):String(a[i]),b=E(editable?'button':'div',label,'ah-cell'+(empty?' empty':'')+(S.selected.includes(i)&&editable?' picked':''));if(editable){b.type='button';b.dataset.ahIndex=i;b.onclick=e=>{if(e.detail===0)choose(i);};b.onpointerdown=e=>begin(e,i);b.setAttribute('aria-pressed',String(S.selected.includes(i)));}b.append(E('small','['+i+']'));b.setAttribute('aria-label','Index '+i+', '+(empty?'empty':a[i]));row.append(b);}return row;
 }
 function treeView(a){
  const n=a.length-1,d=S.d,items=[],edges=[],widths=new Map();
  function measure(i){const kids=P.children(i,n,d),w=Math.max(45,kids.reduce((sum,k)=>sum+measure(k),0)+Math.max(0,kids.length-1)*6);widths.set(i,w);return w;}
  function visit(i,x,depth){const w=widths.get(i),it={i,x:x+w/2,y:depth*65+28};items.push(it);const kids=P.children(i,n,d),total=kids.reduce((sum,k)=>sum+widths.get(k),0)+Math.max(0,kids.length-1)*6;let next=x+(w-total)/2;for(const k of kids){const child=visit(k,next,depth+1);edges.push({a:it,b:child});next+=widths.get(k)+6;}return it;}
  const view=E('div',undefined,'ah-tree');if(!n){view.append(E('p','Empty heap'));return view;}measure(1);visit(1,5,0);const model=ExpandedViews.tree({items,edges,width:widths.get(1)+10,height:Math.max(...items.map(x=>x.y))+40},ExpandedViews.width(section.id,62),43),width=model.width,height=model.height,stage=E('div',undefined,'ah-stage');stage.style.width=width+'px';stage.style.height=height+'px';const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('width',width);svg.setAttribute('height',height);svg.setAttribute('aria-hidden','true');for(const e of edges)ExpandedViews.edge(svg,e,18,'#45564C');stage.append(svg);
  for(const p of items){const b=E(S.problem.procedural?'button':'div',a[p.i]===null?'—':a[p.i],'ah-dot'+(S.selected.includes(p.i)?' picked':''));b.style.left=p.x+'px';b.style.top=p.y+'px';b.append(E('small','['+p.i+']'));if(S.problem.procedural){b.type='button';b.dataset.ahIndex=p.i;b.onpointerdown=e=>begin(e,p.i);b.onclick=e=>{if(e.detail===0)choose(p.i);};}stage.append(b);}view.append(stage);return view;
 }
 function renderAnswers(){
  const p=S.problem,box=$('Answers');box.replaceChildren();box.hidden=p.procedural;if(box.hidden)return;
  function field(text,key,value,type='text'){
   const label=E('label',text+' '),input=E('input');input.type=type;input.id=prefix+(key==='raw'?'ArrayAnswer':'Answer'+key);input.className='ah-input'+(key==='raw'?' ah-wide':'');input.value=value??'';input.autocomplete='off';input.setAttribute('aria-label',text);if(key!=='raw'&&p.answerKind!=='set'&&p.answerKind!=='list')input.inputMode='numeric';
   input.oninput=()=>{save();if(key==='raw'){S.raw=input.value;const parsed=P.parse(S.raw,true);if(!parsed.error)S.array=[null,...parsed.values];}else S.answer[key]=input.value;$('Solution').hidden=true;renderWork();msg('');};input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();check();}};label.append(input);box.append(label);return input;
  }
  if(p.procedural)field('Final array (comma-separated)','raw',S.raw);else if(p.answerKind==='boolean'){
   for(const [v,t]of [[true,'Valid'],[false,'Invalid']]){const b=E('button',t,'ah-choice');b.type='button';b.dataset.ahValid=String(v);b.setAttribute('aria-pressed',String(S.answer.valid===v));b.onclick=()=>{save();S.answer.valid=v;$('Solution').hidden=true;renderAnswers();renderWork();msg('');};box.append(b);}
  }else if(p.answerKind==='choice'){
   for(const [v,t]of p.choices){const b=E('button',t,'ah-choice');b.type='button';b.dataset.ahChoice=v;b.setAttribute('aria-pressed',String(S.answer.choice===v));b.onclick=()=>{save();S.answer.choice=v;$('Solution').hidden=true;renderAnswers();renderWork();msg('');};box.append(b);}
  }else{
   const input=field(p.answerKind==='set'?'Existing indices (any order)':p.answerKind==='list'?'Binary depth, d-heap depth':'Your answer','value',S.answer.value);input.disabled=!!S.answer.none;
   if(p.answerKind==='optional'||p.answerKind==='set'){const l=E('label'),none=E('input');none.type='checkbox';none.id=prefix+'None';none.checked=!!S.answer.none;none.onchange=()=>{save();S.answer.none=none.checked;input.disabled=none.checked;$('Solution').hidden=true;renderWork();msg('');};l.append(none,document.createTextNode(p.variant==='parent'?' No parent':p.answerKind==='set'?' No existing children / indices':' No existing child'));box.append(l);}
  }
 }
 function renderWork(){
  if(!S.problem)return;const p=S.problem,allowed=p.procedural,focused=document.activeElement?.closest('[data-ah-index]')?.dataset.ahIndex,tree=$('Tree'),sx=tree.firstElementChild?.scrollLeft||0,sy=tree.firstElementChild?.scrollTop||0;
  $('Manual').hidden=!allowed;$('ShowTreeLabel').hidden=binary?!allowed:!(p.procedural||p.original.length>1);$('ShowTree').checked=S.showTree;$('WorkArray').replaceChildren(arrayView(S.array,true));
  const insertValue=binary?p.insertionValue:p.sequence?.[0],pending=$('Pending');pending.hidden=!allowed||p.kind!=='insert'||S.insertedValuePlaced;if(!pending.hidden){pending.replaceChildren(E('span',String(insertValue)),E('small','New'));pending.classList.toggle('active',S.placingPending);pending.setAttribute('aria-pressed',String(S.placingPending));pending.onpointerdown=e=>begin(e,'pending');pending.onclick=()=>{S.placingPending=!S.placingPending;S.selected=[];renderWork();};pending.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pending.click();}};}
  const remove=$('Remove');remove.hidden=!allowed||p.kind!=='delete'||S.removed>0;remove.disabled=!S.selected.length||S.array[S.selected[0]]===null||S.removed>0;
  $('Selection').textContent=p.kind==='insert'?'':p.kind==='delete'?(S.removedValue!==null?'Removed '+S.removedValue+'. Move values to restore heap order.':'Select an array value, then click Remove.'):S.selected.length?'Selected index '+S.selected[0]:'';
  tree.hidden=!S.showTree;tree.replaceChildren();if(S.showTree){const t=treeView(S.array);tree.append(t);t.scrollLeft=sx;t.scrollTop=sy;}
  $('Undo').disabled=!S.history.length;$('Redo').disabled=!S.future.length;if(focused)section.querySelector('[data-ah-index="'+focused+'"]')?.focus({preventScroll:true});
 }
 function render(){
  const p=S.problem;$('Question').textContent=p.question;$('Given').replaceChildren();
   if(!p.procedural&&p.original.length>1)$('Given').append(E('div','Given array','ah-caption'),arrayView(p.original));
  
  if(!binary)$('BranchValue').textContent='d = '+S.d;
  section.querySelectorAll(binary?'[data-bh-mode]':'[data-dh-mode]').forEach(b=>{const on=(binary?b.dataset.bhMode:b.dataset.dhMode)===S.mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});renderAnswers();renderWork();
 }
 function start(p){const fallback=binary?'finalArray':'parent';if(!Object.hasOwn(names,p?.kind)){S.mode=fallback;return generate();}cancel();S.problem=p;S.mode=p.kind;S.d=p.d;S.array=p.original.slice();S.raw='';S.answer={value:'',none:false,valid:null,choice:''};S.history=[];S.future=[];S.selected=[];S.actions=[];S.pendingIndex=0;S.removed=0;S.placingPending=false;S.insertedValuePlaced=false;S.removedValue=null;S.showTree=false;S.solved=false;S.revealed=false;$('Solution').hidden=true;render();msg('');if(!section.hidden){const target=section.querySelector('[data-ah-index]')||$('Answervalue');target?.focus({preventScroll:true});}}
 function generate(){if(!Object.hasOwn(names,S.mode))S.mode=binary?'finalArray':'parent';S.difficulty=$('Difficulty').value;let d=2;if(!binary){const choice=$('Branch').value;d=choice==='random'?3+Math.floor(Math.random()*4):Number(choice);}start(P.generate(C,family,S.mode,S.difficulty,d));}
 function change(mode){if(!Object.hasOwn(names,mode)){S.mode=binary?'finalArray':'parent';generate();return;}S.mode=mode;generate();}
 function setAnswer(v){save();if(S.problem.procedural){S.raw=Array.isArray(v)?v.slice(v[0]===null?1:0).join(', '):String(v);const parsed=P.parse(S.raw,true);if(!parsed.error)S.array=[null,...parsed.values];}else if(S.problem.answerKind==='boolean')S.answer.valid=v;else if(v===null){S.answer.none=true;}else if(S.problem.answerKind==='choice')S.answer.choice=v;else S.answer.value=Array.isArray(v)?v.join(', '):String(v);$('Solution').hidden=true;renderAnswers();renderWork();msg('');}
 function check(){const r=P.grade(S.problem,S);S.solved=r.ok;msg(r.message,r.ok?'success':'error');return r.ok;}
 function undo(){if(!S.history.length)return;cancel();S.future.push(snapshot());restore(S.history.pop());}
 function redo(){if(!S.future.length)return;cancel();S.history.push(snapshot());restore(S.future.pop());}
 function reset(){save();const old=S.problem;S.array=old.original.slice();S.raw='';S.answer={value:'',none:false,valid:null,choice:''};S.selected=[];S.actions=[];S.pendingIndex=0;S.removed=0;S.placingPending=false;S.insertedValuePlaced=false;S.removedValue=null;S.solved=false;S.revealed=false;$('Solution').hidden=true;renderAnswers();renderWork();msg('');}
 function reveal(){
  S.revealed=true;const p=S.problem,box=$('Solution');box.hidden=false;$('SolutionBody').replaceChildren();const body=$('SolutionBody');
  if(p.procedural){body.append(E('p','Final array: '+(p.reference.array.slice(1).join(', ')||'empty')),arrayView(p.reference.array));
   body.append(E('p',p.reference.summary+' Ties choose the lowest-index child; equal values do not swap.'));const ol=E('ol');p.reference.steps.forEach(s=>ol.append(E('li',s.text+' ['+s.array.slice(1).map(x=>x===null?'_':x).join(', ')+']')));body.append(ol);
  }else{
    let shownAnswer=p.expected;
    if(Array.isArray(p.expected))shownAnswer=p.expected.join(', ')||'no existing indices';
    else if(p.expected===null)shownAnswer='no parent / child';
    else if(p.expected===true)shownAnswer='Valid';
    else if(p.expected===false)shownAnswer='Invalid';
    else if(p.choices){const matched=p.choices.find(x=>x[0]===p.expected);if(matched)shownAnswer=matched[1];}
    body.append(E('p','Answer: '+shownAnswer+'.'));
    body.append(E('p','Parent(i) = floor((i − 2)/d) + 1 for i > 1. Children run from d(i − 1)+2 through d(i − 1)+d+1, restricted to positions ≤ n.'));
  }msg('Worked solution shown. Your answer is unchanged.');
 }
 section.querySelectorAll(binary?'[data-bh-mode]':'[data-dh-mode]').forEach(b=>b.onclick=()=>change(binary?b.dataset.bhMode:b.dataset.dhMode));
 $('Difficulty').onchange=generate;if(!binary)$('Branch').onchange=generate;$('New').onclick=generate;$('Check').onclick=check;$('Reveal').onclick=reveal;$('Undo').onclick=undo;$('Redo').onclick=redo;$('Reset').onclick=reset;
 $('Pending').onclick=()=>{if(S.problem?.kind!=='insert'||S.insertedValuePlaced)return;S.placingPending=!S.placingPending;S.selected=[];renderWork();};$('Remove').onclick=removeSelected;
 $('ShowTree').onchange=()=>{S.showTree=$('ShowTree').checked;renderWork();};
 window.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)drag.moved=true;if(!drag.moved)return;const ghost=document.getElementById('dragGhost');ghost.textContent=drag.i==='pending'?'New value':'Index '+drag.i;ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';ghost.hidden=false;});
 window.addEventListener('pointerup',e=>{if(!drag)return;const d=drag,point=d.moved?document.elementFromPoint(e.clientX,e.clientY):null,target=point?.closest('[data-ah-index]'),row=point?.closest('.ah-array');cancel();if(d.problem!==S.problem)return;if(!d.moved){if(d.i!=='pending')choose(d.i);}else if(d.i==='pending'&&row&&section.contains(row)){placeInsertion(target?Number(target.dataset.ahIndex):S.array.length);}else if(target&&section.contains(target))drop(d.i,Number(target.dataset.ahIndex));});window.addEventListener('pointercancel',cancel);window.addEventListener('blur',cancel);
 document.addEventListener('keydown',e=>{if(section.hidden||e.target?.matches?.('input,select,textarea,[contenteditable="true"]'))return;if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();e.key.toLowerCase()==='y'||e.shiftKey?redo():undo();}if(e.key==='Escape'){cancel();S.selected=[];renderWork();}});
  function init(){const fallback=binary?'finalArray':'parent';if(!Object.hasOwn(names,S.mode)){S.mode=fallback;S.problem=null;}if(S.problem&&!Object.hasOwn(names,S.problem.kind)){S.problem=null;S.mode=fallback;}return S.problem?render():generate();}
 return{state:S,init,start,generate,change,changeMode:change,action,dispatch:action,answer:setAnswer,setAnswer,choose,drop,check,undo,redo,reset,reveal,render,snapshot,cancel,cancelDrag:cancel};
}

const BH = CompactArrayHeap(BHCore, 'binary', 'bh', {finalArray:'BuildHeap',insert:'Insert',delete:'Delete Min'});


/* d-Heap algorithms and the branching-factor controller. */
const DHCore = (() => {
  function branching(d){if(!Number.isInteger(d)||d<2||d>6)throw Error('Supported branching factors are integers 2 through 6.');return d;}
  const parent=(i,d)=>{branching(d);return i>1?Math.floor((i-2)/d)+1:null;};
  const firstChild=(i,d)=>{branching(d);return d*(i-1)+2;};
  const lastChild=(i,d)=>firstChild(i,d)+d-1;
  function children(i,n,d){const first=firstChild(i,d),last=Math.min(lastChild(i,d),n);return first>n?[]:Array.from({length:last-first+1},(_,k)=>first+k);}
  const lastNonLeaf=(n,d)=>n<2?null:parent(n,d);
  const sameArray=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  function analyze(a,d){
    branching(d);const issues=[];let last=a.length-1;while(last>0&&a[last]===null)last--;
    for(let i=1;i<=last;i++){
      if(a[i]===null){issues.push({type:'complete',index:i,message:'Position '+i+' is empty while a later position '+last+' is occupied.'});continue;}
      const p=parent(i,d);if(p!==null&&a[p]!==null&&a[p]>a[i])issues.push({type:'order',index:i,parent:p,message:'Parent '+a[p]+' at index '+p+' is greater than child '+a[i]+' at index '+i+'.'});
    }
    return{valid:issues.length===0,complete:!issues.some(x=>x.type==='complete'),ordered:!issues.some(x=>x.type==='order'),issues};
  }
  function record(steps,a,action,text){steps.push({...action,array:a.slice(),text});}
  function sink(a,i,d,steps){
    const n=a.length-1;
    while(true){
      const list=children(i,n,d);if(!list.length)return;
      let smallest=list[0];for(const child of list)if(a[child]<a[smallest])smallest=child;
      if(a[i]<=a[smallest])return;
      const text='Compare all existing children '+list.join(', ')+'. Swap index '+i+' ('+a[i]+') with the smallest child at '+smallest+' ('+a[smallest]+').';
      [a[i],a[smallest]]=[a[smallest],a[i]];record(steps,a,{kind:'swap',a:i,b:smallest,compared:list},text);i=smallest;
    }
  }
  function insert(input,value,d){
    branching(d);const a=input.slice(),steps=[],index=a.length;a.push(value);
    record(steps,a,{kind:'append',index,value},'Append '+value+' at the next available position, index '+index+'.');
    let i=index;
    while(i>1){
      const p=parent(i,d);if(a[p]<=a[i])break;
      const text='For d = '+d+', the parent of index '+i+' is '+p+'. Swap '+a[i]+' upward past '+a[p]+'.';
      [a[i],a[p]]=[a[p],a[i]];record(steps,a,{kind:'swap',a:i,b:p},text);i=p;
    }
    return{array:a,steps,summary:'Append at n + 1. Percolate upward using parent(i) = floor((i − 2) / d) + 1, stopping at the root or when parent ≤ child.'};
  }
  function deleteMin(input,d){
    branching(d);const a=input.slice(),steps=[],n=a.length-1,removed=n?a[1]:null;
    if(n===1){a.pop();record(steps,a,{kind:'remove',index:1},'Remove the only element '+removed+'. The heap becomes empty.');}
    else if(n>1){
      a[1]=null;record(steps,a,{kind:'remove',index:1},'Remove the minimum root '+removed+'.');
      const last=a.pop();a[1]=last;record(steps,a,{kind:'replace',from:n,to:1},'Move the final value '+last+' from index '+n+' to the root, shrinking the array by one.');
      sink(a,1,d,steps);
    }
    return{array:a,steps,removed,summary:'Remove the root and replace it with the final array element. At each level compare ALL existing children, choosing the smallest. Ignore theoretical child positions greater than the current size. Ties use the lowest index.'};
  }
  function build(input,d){
    branching(d);const a=input.slice(),steps=[],last=lastNonLeaf(a.length-1,d);
    for(let i=last??0;i>=1;i--){
      record(steps,a,{kind:'start',index:i},'Start bottom-up processing at index '+i+'. Child subheaps have already been processed.');
      sink(a,i,d,steps);
      record(steps,a,{kind:'processed',index:i},'Finish index '+i+'. Continue backward to '+(i-1)+'.');
    }
    return{array:a,steps,summary:'Use the entire unsorted array. If n ≥ 2, the last non-leaf is floor((n − 2) / d) + 1. Process that index down to 1, percolating each value downward among its actual children. This is bottom-up construction, not repeated insertion.'};
  }
  function layout(a,d,extra=false){
    branching(d);const n=a.length-1+(extra?1:0);
    if(n<1)return{items:[],edges:[],width:160,height:100};
    const widths=new Map(),items=[],edges=[];
    function measure(i){const list=children(i,n,d),w=Math.max(58,list.reduce((s,c)=>s+measure(c),0)+Math.max(0,list.length-1)*10);widths.set(i,w);return w;}
    function place(i,x,level){
      const w=widths.get(i),item={index:i,value:i<a.length?a[i]:null,x:x+w/2,y:42+level*91,depth:level};items.push(item);
      const list=children(i,n,d),total=list.reduce((s,c)=>s+widths.get(c),0)+Math.max(0,list.length-1)*10;let cursor=x+(w-total)/2;
      for(const child of list){const node=place(child,cursor,level+1);edges.push({a:item,b:node});cursor+=widths.get(child)+10;}return item;
    }
    measure(1);place(1,10,0);
    return{items,edges,width:widths.get(1)+20,height:Math.max(...items.map(i=>i.y))+55};
  }
  return{branching,parent,firstChild,lastChild,children,lastNonLeaf,sameArray,analyze,insert,deleteMin,build,layout};
})();


const DH = CompactArrayHeap(DHCore, 'dheap', 'dh', {parent:'Parent Index',children:'Child Indices',insert:'Insert',delete:'Delete Min',build:'Build Heap'});


/* Sorting and graph cores, shared lab controls, and Prim practice. */
const SortCore=(()=>{
 const clone=a=>a.map(x=>({...x})),equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x.id===b[i].id&&x.key===b[i].key);
 function rng(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=Math.imul(h^h>>>15,h|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
 function input(seed,n,kind='random'){const r=rng(seed),pool=Array.from({length:99},(_,i)=>i+1);for(let i=98;i;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}let keys=pool.slice(0,n);if(kind==='duplicates')keys=keys.map(()=>1+Math.floor(r()*5));if(kind==='sorted')keys.sort((a,b)=>a-b);if(kind==='reverse')keys.sort((a,b)=>b-a);return keys.map((key,i)=>({key,id:String.fromCharCode(65+i)}));}
 function reference(original,algorithm,rule='median3'){
  if(!['insertion','heap','mergeRecursive','mergeBottom','quick'].includes(algorithm)||rule!=='median3')throw Error('Unsupported sorting algorithm or convention.');
  const a=clone(original),tasks=[];let counter=0;
  const swap=(i,j,list)=>{if(i===j)return;[a[i],a[j]]=[a[j],a[i]];list.push([i,j]);};
  function insertion(lo,hi,label='Insertion'){
   for(let i=lo+1;i<=hi;i++){const before=clone(a),key=a[i],swaps=[];for(let j=i;j>lo&&a[j-1].key>a[j].key;j--)swap(j,j-1,swaps);tasks.push({type:'insert',label:label+' pass '+(i-lo),lo,hi:i,keyId:key.id,pickIndex:i,swaps,before,expected:clone(a),pass:i-lo,heapN:a.length});}
  }
  function sink(i,n,list){while(2*i+1<n){let child=2*i+1;if(child+1<n&&a[child+1].key>a[child].key)child++;if(a[i].key>=a[child].key)break;swap(i,child,list);i=child;}}
  function heapify(i,n,label){const before=clone(a),swaps=[];sink(i,n,swaps);tasks.push({type:'heapify',label,lo:0,hi:n-1,pickIndex:i,before,expected:clone(a),swaps,heapN:n});}
  function merge(lo,mid,hi,pass){
   const before=clone(a),left=clone(a.slice(lo,mid+1)),right=clone(a.slice(mid+1,hi+1)),out=[],takes=[];let i=0,j=0;
   while(i<left.length||j<right.length){const side=j>=right.length||i<left.length&&left[i].key<=right[j].key?'L':'R';const value=side==='L'?left[i++]:right[j++];out.push(value);takes.push({side,id:value.id});}
   a.splice(lo,out.length,...out);tasks.push({type:'merge',label:pass?'Merge pass '+pass+' · ['+(lo+1)+'–'+(hi+1)+']':'Recursive merge '+(++counter)+' · ['+(lo+1)+'–'+(hi+1)+']',lo,mid,hi,left,right,takes,before,expected:clone(a),pass});
  }
  function recursiveMerge(lo,hi){if(lo>=hi)return;const mid=Math.floor((lo+hi)/2);recursiveMerge(lo,mid);recursiveMerge(mid+1,hi);merge(lo,mid,hi,null);}
  function quick(lo,hi){
   if(lo>=hi)return;if(hi-lo+1<=3){insertion(lo,hi,'Cutoff insertion ['+(lo+1)+'–'+(hi+1)+']');return;}
   const before=clone(a),swaps=[];let pivot,pickIndex,prep=0,boundary;
   if(rule==='median3'){
    const mid=Math.floor((lo+hi)/2);
    if(a[mid].key<a[lo].key)swap(lo,mid,swaps);if(a[hi].key<a[lo].key)swap(lo,hi,swaps);if(a[hi].key<a[mid].key)swap(mid,hi,swaps);
    pivot=a[mid];pickIndex=mid;prep=swaps.length;swap(mid,hi-1,swaps);
    let i=lo,j=hi-1;
    while(true){do{i++;}while(a[i].key<pivot.key);do{j--;}while(a[j].key>pivot.key);if(i<j)swap(i,j,swaps);else break;}
    swap(i,hi-1,swaps);boundary=i;
   }
   tasks.push({type:'quick',label:'Partition ['+(lo+1)+'–'+(hi+1)+']',lo,hi,before,expected:clone(a),swaps,pivotId:pivot.id,pickIndex,prep,boundary,rule});
   quick(lo,boundary-1);quick(boundary+1,hi);
  }
  if(algorithm==='insertion')insertion(0,a.length-1);
  else if(algorithm==='heap'){
   for(let i=Math.floor(a.length/2)-1;i>=0;i--)heapify(i,a.length,'Build max-heap: process index '+(i+1));
   for(let end=a.length-1;end>0;end--){const before=clone(a),swaps=[];swap(0,end,swaps);tasks.push({type:'extract',label:'Move maximum to sorted position '+(end+1),lo:0,hi:end,before,expected:clone(a),swaps,heapN:end});if(end>1)heapify(0,end,'Restore max-heap of size '+end);}
  }else if(algorithm==='mergeRecursive')recursiveMerge(0,a.length-1);
  else if(algorithm==='mergeBottom'){let pass=0;for(let width=1;width<a.length;width*=2){pass++;for(let lo=0;lo+width<a.length;lo+=2*width)merge(lo,lo+width-1,Math.min(a.length-1,lo+2*width-1),pass);}}
  else if(algorithm==='quick')quick(0,a.length-1);
  return{array:a,tasks};
 }
 function heapSnapshots(original,direction='ascending',extractions=0){
  const a=clone(original),n=a.length;
  if(!['ascending','descending'].includes(direction)||!Number.isInteger(extractions)||extractions<0||extractions>=n)throw Error('Invalid heapsort snapshot request.');
  const better=(x,y)=>direction==='ascending'?x.key>y.key:x.key<y.key;
  const blank=()=>({swaps:0,comparisons:0,maxDepth:0,multiLevel:0,directionChanges:0,left:0,right:0}),work={build:blank(),restore:blank()};let active=work.build;
  function sift(root,size){let depth=0,last=null;while(root*2+1<size){let child=root*2+1;if(child+1<size){active.comparisons++;if(better(a[child+1],a[child]))child++;}active.comparisons++;if(!better(a[child],a[root]))break;const side=child===root*2+1?'left':'right';active[side]++;if(last&&last!==side)active.directionChanges++;last=side;[a[root],a[child]]=[a[child],a[root]];active.swaps++;depth++;root=child;}active.maxDepth=Math.max(active.maxDepth,depth);if(depth>=2)active.multiLevel++;}
  for(let i=Math.floor(n/2)-1;i>=0;i--)sift(i,n);
  const built=clone(a),steps=[];
  active=work.restore;
  for(let iteration=1;iteration<=extractions;iteration++){const end=n-iteration;[a[0],a[end]]=[a[end],a[0]];sift(0,end);steps.push({iteration,heapN:end,array:clone(a)});}
  work.totalSwaps=work.build.swaps+work.restore.swaps;work.totalComparisons=work.build.comparisons+work.restore.comparisons;
  return{array:a,built,steps,heapN:n-extractions,direction,extractions,work};
 }
 function snapshotDemand(difficulty,ref){const w=ref.work;return difficulty==='hard'?ref.extractions>=4&&w.totalSwaps>=22&&w.build.swaps>=7&&w.restore.swaps>=11&&w.restore.maxDepth>=3&&w.restore.multiLevel>=3&&w.restore.directionChanges>=1&&w.restore.left>=2&&w.restore.right>=2:difficulty==='medium'?w.build.swaps>=3&&(ref.extractions===0||w.restore.swaps>=1):w.build.swaps>=1;}
 function snapshotGrade(p,s){const expected=p.snapshot.array,ok=s.a.length===expected.length&&s.a.every((x,i)=>x.key===expected[i].key);return{ok,message:ok?'Correct heapsort snapshot, including the active heap and sorted suffix.':'The array differs from the requested completed snapshot. Correct values remain hidden until Show Worked Solution.'};}
 function swapsEqual(log,expected){return log.length===expected.length&&log.every((s,i)=>s[0]===expected[i][0]&&s[1]===expected[i][1]||s[0]===expected[i][1]&&s[1]===expected[i][0]);}
 // Replay decisions instead of comparing against one implementation's swaps.
 function assessQuick(t,s,complete=true){
  if(!Array.isArray(s.quickEvents))return{ok:false,message:'The pivot and scan operation record is missing. Reset this problem and repeat the partition.'};
  const a=clone(t.before),lo=t.lo,hi=t.hi,mid=Math.floor((lo+hi)/2),candidates=new Set([lo,mid,hi]),log=[],scans=[];
  let pick=null,parked=false,restored=false,marked=false,i=lo,j=hi-1,leftMoved=false,rightMoved=false,action=0;
  const fail=message=>{throw Error(message);},pair=(x,y,u,v)=>x===u&&y===v||x===v&&y===u;
  const swap=(x,y)=>{if(x!==y){[a[x],a[y]]=[a[y],a[x]];log.push([x,y]);}};
  const stopped=()=>leftMoved&&rightMoved&&a[i].key>=pick.key&&a[j].key<=pick.key;
  function park(from,to){
   if(!pick)fail('Select the center median before parking the pivot.');
   if(parked)fail('The pivot is already parked; do not restart the scans by parking it again.');
   if(from!==mid||to!==hi-1||a[from].id!==pick.id)fail('Park the selected center pivot at right − 1.');
   swap(from,to);parked=true;
  }
  function restore(from,to){
   if(restored&&from===i&&to===i)return;
   if(!parked)fail('Park the pivot before restoring it.');
   if(!stopped())fail('Complete both strict scans before restoring the pivot.');
   if(i<j)fail('The scan pointers have not crossed; exchange their stopped items before restoring the pivot.');
   if(from!==hi-1||to!==i||a[from].id!==pick.id)fail('Restore the parked pivot to the stopped left scan position i.');
   swap(from,to);restored=true;
  }
  try{
   for(const e of s.quickEvents){
    action++;if(marked)fail('No operation may follow the final pivot-position mark in this partition.');
    if(e.type==='swap'){
     if(!Number.isInteger(e.a)||!Number.isInteger(e.b)||e.a<lo||e.b<lo||e.a>hi||e.b>hi||e.a===e.b)fail('Exchange two distinct positions inside the active partition.');
     if(!pick){if(!candidates.has(e.a)||!candidates.has(e.b))fail('Median preparation may exchange only left, center, and right candidates.');swap(e.a,e.b);}
     else if(!parked){if(!pair(e.a,e.b,mid,hi-1))fail('After selecting the median, park that pivot at right − 1.');park(mid,hi-1);}
     else if(restored)fail('The pivot has been restored; mark its final position before starting a recursive subarray.');
     else if(stopped()&&i>=j){if(!pair(e.a,e.b,i,hi-1))fail('The pointers have crossed; restore the parked pivot at i instead of exchanging scan items.');restore(hi-1,i);}
     else{
      if(!stopped())fail('Both pointers must finish their strict scans before exchanging items.');
      if(!pair(e.a,e.b,i,j))fail('Exchange only the items at the stopped scan positions i and j.');
      swap(e.a,e.b);leftMoved=rightMoved=false;
     }
    }else if(e.type==='select'){
     if(parked)fail('Choose the pivot before parking and scanning.');
     if(a[lo].key>a[mid].key||a[mid].key>a[hi].key)fail('The median candidates are not arranged: require left ≤ center ≤ right before selecting the pivot.');
     if(e.index!==mid||e.id!==a[mid].id)fail('Select the median candidate at the center position.');
     if(e.at!==log.length)fail('The pivot-selection record does not match the exchanges already performed.');
     pick={id:e.id,index:mid,at:e.at,key:a[mid].key};
    }else if(e.type==='park')park(e.from,e.to);
    else if(e.type==='scan'){
     if(!parked||restored)fail('Move scan pointers only after parking the pivot and before restoring it.');
     if(e.at!==log.length)fail('A pointer movement is recorded at the wrong exchange position.');
     if(e.pointer==='qLeft'){
      if(e.from!==i||e.to!==i+1||e.to>hi-1)fail('Advance the left scan i one position to the right.');
      if(leftMoved&&a[i].key>=pick.key)fail('The left scan must stop at its first value ≥ pivot; equal values stop the scan.');
      i=e.to;leftMoved=true;
     }else if(e.pointer==='qRight'){
      if(e.from!==j||e.to!==j-1||e.to<lo)fail('Advance the right scan j one position to the left.');
      if(rightMoved&&a[j].key<=pick.key)fail('The right scan must stop at its first value ≤ pivot; equal values stop the scan.');
      j=e.to;rightMoved=true;
     }else fail('Unknown scan pointer.');
     scans.push({pointer:e.pointer,from:e.from,to:e.to,at:e.at});
    }else if(e.type==='restore')restore(e.from,e.to);
    else if(e.type==='mark'){
     // No exchange is necessary when the parked pivot already occupies i.
     if(!restored&&parked&&stopped()&&i>=j&&i===hi-1)restored=true;
     if(!restored)fail('Finish both scans and restore the pivot before marking its final position.');
     if(e.boundary!==i||a[i].id!==pick.id)fail('The marked boundary must be the restored pivot at scan position i.');
     if(a.slice(lo,i).some(x=>x.key>pick.key)||a.slice(i+1,hi+1).some(x=>x.key<pick.key))fail('The completed partition has an item on the wrong side of the pivot.');
     marked=true;
    }else fail('Unknown partition operation.');
   }
   if(!swapsEqual(s.log||[],log))fail('The exchange history does not match the recorded pivot and scan decisions.');
   if(JSON.stringify(s.scans||[])!==JSON.stringify(scans))fail('The pointer history does not match the recorded scan decisions.');
   if(!equal(a,s.a))fail('The array does not match replaying the recorded exchanges.');
   if(pick?(s.pick?.id!==pick.id||s.pick.index!==mid||s.pick.at!==pick.at):s.pick!=null)fail('The selected pivot does not match the recorded center-median choice.');
   if(parked&&((s.qLeft??lo)!==i||(s.qRight??hi-1)!==j))fail('The displayed scan pointers do not match their recorded movements.');
   if(marked?s.boundary!==i:s.boundary!=null)fail('The final boundary does not match the recorded pivot-position mark.');
   if(complete&&!marked)fail(!pick?'Select the arranged center median.':!parked?'Park the selected pivot at right − 1.':'Finish the partition scans, restore the pivot, and mark its final position.');
   return{ok:true,array:a,boundary:marked?i:null,message:marked?'Correct median preparation and partition decisions.':'The recorded partition prefix is valid.'};
  }catch(error){return{ok:false,message:'Partition action '+action+': '+error.message};}
 }

 function assessTask(t,s){
  if(!t)return{ok:false,message:'All tasks have already been submitted.'};
  if(t.type==='quick')return assessQuick(t,s);
  if(t.type==='insert'){
   if(s.pick?.id!==t.keyId||s.pick.index!==t.pickIndex||s.pick.at!==0)return{ok:false,message:'Identify the next key at the beginning of this insertion pass.'};
   const replay=clone(t.before);
   for(const pair of s.log){const lo=Math.min(...pair),hi=Math.max(...pair);if(hi!==lo+1||replay[hi].id!==t.keyId||replay[lo].key<=replay[hi].key||lo<t.lo)return{ok:false,message:'Insertion shifts the chosen key left only past strictly larger values. Preserve equal-key order.'};[replay[lo],replay[hi]]=[replay[hi],replay[lo]];}
   if(!equal(replay,s.a))return{ok:false,message:'The array must match your recorded insertion shifts. Select the key and insert it using the array controls.'};
  }else if(t.type==='merge'){
   const b=s.merge;
   if(!b||b.lo!==t.lo||b.mid!==t.mid||b.hi!==t.hi)return{ok:false,message:'Choose the required adjacent sorted subarrays for this stage.'};
   if(b.takes.length!==t.takes.length||b.takes.some((x,i)=>x.side!==t.takes[i].side||x.id!==t.takes[i].id))return{ok:false,message:'Choose the smaller remaining head each time; take the left head on equal keys for stability.'};
   const a=clone(s.a);a.splice(t.lo,b.out.length,...b.out);if(!equal(a,t.expected))return{ok:false,message:'The merged output is incomplete or incorrect.'};return{ok:true,array:a,message:'Correct stable merge.'};
  }else{
   if(t.type==='heapify'&&s.heapN!==t.heapN)return{ok:false,message:'The active heap size is incorrect.'};
   if(t.type==='heapify'&&(s.pick?.index!==t.pickIndex||s.pick.at!==0))return{ok:false,message:'Start by choosing the correct non-leaf index for this heap adjustment.'};
   if(!swapsEqual(s.log,t.swaps))return{ok:false,message:'The swaps do not follow the specified '+(t.type==='quick'?'partition method':'max-heap procedure')+'.'};
   if(t.type==='extract'&&s.heapN!==t.heapN)return{ok:false,message:'Shrink the active heap by one after moving its root to the sorted suffix.'};
  }
  return (['heapify','extract'].includes(t.type)?s.a.length===t.expected.length&&s.a.every((x,i)=>x.key===t.expected[i].key):equal(s.a,t.expected))?{ok:true,array:clone(s.a),message:'Correct checkpoint.'}:{ok:false,message:'The current array does not match this algorithm checkpoint, including item identities.'};
 }

 function grade(p,s){if(s.index!==p.tasks.length||s.ledger.length!==p.tasks.length)return{ok:false,message:'Submit every required algorithm checkpoint; a sorted array alone is insufficient.'};for(let i=0;i<s.ledger.length;i++){if(s.ledger[i].index!==i||!assessTask(p.tasks[i],s.ledger[i].work).ok)return{ok:false,message:'An algorithm checkpoint was skipped or is invalid.'};}const expected=p.tasks.at(-1)?.expected||p.original;return equal(s.a,expected)?{ok:true,message:'All procedural checkpoints and the final requested array are correct.'}:{ok:false,message:'The final array differs from the requested result.'};}
 return{clone,equal,rng,input,reference,heapSnapshots,snapshotDemand,snapshotGrade,assessQuick,assessTask,grade};
})();


const GraphCore=(()=>{
 const clone=x=>Array.isArray(x)?x.map(clone):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,clone(v)])):x;
 const rng=SortCore.rng,integer=(r,a,b)=>a+Math.floor(r()*(b-a+1));
 const graph=(n,edges,directed=false)=>({n,directed,edges:edges.map((e,i)=>({id:'e'+i,...e}))});
 function weighted(n,r,directed=false,ties=false,unreachable=false){
  const es=[];for(let i=0;i<n-1;i++)es.push({u:i,v:i+1,w:ties?1:integer(r,0,19)});es.push({u:0,v:n-1,w:ties?1:integer(r,1,19)});
  for(let i=2;i<n-1;i++)es.push({u:0,v:i,w:ties?integer(r,2,9):integer(r,0,19)});
  if(unreachable)for(let i=es.length-1;i>=0;i--)if(es[i].u===n-1||es[i].v===n-1)es.splice(i,1);
  return graph(n,es,directed);
 }
 function dsu(n){const p=Array.from({length:n},(_,i)=>i),find=i=>p[i]===i?i:p[i]=find(p[i]);return{find,join(a,b){a=find(a);b=find(b);if(a===b)return false;p[a]=b;return true;}};}
 const edge=(g,id)=>g.edges.find(e=>e.id===id);
 function crossing(g,visited){const s=new Set(visited);return g.edges.filter(e=>s.has(e.u)!==s.has(e.v));}
 function primStep(g,visited,id){const e=edge(g,id),s=new Set(visited);if(!e)return{ok:false,code:'missing',message:'Unknown edge.'};if(s.has(e.u)&&s.has(e.v))return{ok:false,code:'cycle',message:'Both endpoints are already in the tree: cycle or no expansion.'};if(!s.has(e.u)&&!s.has(e.v))return{ok:false,code:'outside',message:'Both endpoints are outside the current tree.'};const min=Math.min(...crossing(g,visited).map(e=>e.w));return e.w===min?{ok:true,code:'valid',message:'Minimum crossing edge; ties are valid.'}:{ok:false,code:'heavy',message:'Another eligible crossing edge has smaller weight.'};}
 function prim(g,source=0){const visited=[source],selected=[],steps=[];let weight=0;while(visited.length<g.n){const list=crossing(g,visited).sort((a,b)=>a.w-b.w||a.id.localeCompare(b.id));if(!list.length)break;const e=list[0],before=visited.slice();visited.push(visited.includes(e.u)?e.v:e.u);selected.push(e.id);weight+=e.w;steps.push({before,eligible:list.map(x=>x.id),edge:e.id,total:weight,visited:visited.slice()});}return{selected,weight,steps,connected:visited.length===g.n};}
 function kruskal(g){const d=dsu(g.n),selected=[];let weight=0;for(const e of g.edges.slice().sort((a,b)=>a.w-b.w||a.id.localeCompare(b.id)))if(d.join(e.u,e.v)){selected.push(e.id);weight+=e.w;}return{weight,selected,connected:selected.length===g.n-1};}
 function mstCheck(g,ids){if(new Set(ids).size!==ids.length||ids.length!==g.n-1)return{ok:false,message:'Choose exactly V − 1 distinct edges.'};const d=dsu(g.n);let weight=0;for(const id of ids){const e=edge(g,id);if(!e)return{ok:false,message:'Unknown edge.'};if(!d.join(e.u,e.v))return{ok:false,message:'The selected edges contain a cycle.'};weight+=e.w;}if(new Set(Array.from({length:g.n},(_,i)=>d.find(i))).size!==1)return{ok:false,message:'Not every vertex is connected.'};return weight===kruskal(g).weight?{ok:true,weight,message:'Connected, acyclic, and minimum total weight.'}:{ok:false,weight,message:'This spanning tree is heavier than an MST.'};}
 function primTrace(g,source,ids){const visited=[source];for(const id of ids){const check=primStep(g,visited,id);if(!check.ok)return check;const e=edge(g,id);visited.push(visited.includes(e.u)?e.v:e.u);}return{ok:true,visited,message:'Every selected edge is a valid Prim step.'};}
 function dag(n,r,cycle=false){const order=Array.from({length:n},(_,i)=>i);for(let i=n-1;i;i--){const j=integer(r,0,i);[order[i],order[j]]=[order[j],order[i]];}const es=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if((j===i+1&&r()<.6)||r()<.16)es.push({u:order[i],v:order[j],w:1});if(cycle)for(const[u,v]of [[order[0],order[1]],[order[1],order[2]],[order[2],order[0]]])if(!es.some(e=>e.u===u&&e.v===v))es.push({u,v,w:1});return graph(n,es,true);}
 function degrees(g,done=[]){const used=new Set(done),a=Array(g.n).fill(0);for(const e of g.edges)if(!used.has(e.u)&&!used.has(e.v))a[e.v]++;return a;}
 const eligible=(g,done=[])=>degrees(g,done).map((d,v)=>!done.includes(v)&&d===0?v:null).filter(v=>v!==null);
 function topoValid(g,order,full=true){if(new Set(order).size!==order.length||order.some(v=>v<0||v>=g.n))return{ok:false,message:'Each vertex must occur once.'};const done=[];for(const v of order){const blockers=g.edges.filter(e=>e.v===v&&!done.includes(e.u));if(blockers.length)return{ok:false,message:'Vertex '+String.fromCharCode(65+v)+' still depends on '+blockers.map(e=>String.fromCharCode(65+e.u)).join(', ')+'.'};done.push(v);}return full&&done.length!==g.n?{ok:false,message:'The ordering is incomplete.'}:{ok:true,message:'Every dependency is respected.'};}
 function kahn(g,stack=false){const deg=degrees(g),bag=[],order=[],trace=[],states=[];for(let v=0;v<g.n;v++)if(deg[v]===0){bag.push(v);trace.push({type:'enqueue',v});}while(bag.length){const v=stack?bag.pop():bag.shift();order.push(v);trace.push({type:'process',v});for(const e of g.edges.filter(e=>e.u===v).sort((a,b)=>a.v-b.v)){deg[e.v]--;trace.push({type:'degree',v:e.v,value:deg[e.v]});if(deg[e.v]===0){bag.push(e.v);trace.push({type:'enqueue',v:e.v});}}states.push({order:order.slice(),bag:bag.slice(),deg:deg.slice()});}return{order,trace,states,cyclic:order.length!==g.n};}
 function cycle(g){const c=Array(g.n).fill(0),stack=[];let found=null;function dfs(v){c[v]=1;stack.push(v);for(const e of g.edges.filter(e=>e.u===v)){if(c[e.v]===1){found=stack.slice(stack.indexOf(e.v));return true;}if(c[e.v]===0&&dfs(e.v))return true;}stack.pop();c[v]=2;return false;}for(let v=0;v<g.n&&!found;v++)if(c[v]===0)dfs(v);return found;}
 const arcs=g=>g.directed?g.edges.map(e=>({...e})):g.edges.flatMap(e=>[{...e},{...e,u:e.v,v:e.u}]);

 function bellman(g,source=0){const d=Array(g.n).fill(Infinity);d[source]=0;const es=arcs(g);for(let k=1;k<g.n;k++){let changed=false;for(const e of es)if(d[e.u]+e.w<d[e.v]){d[e.v]=d[e.u]+e.w;changed=true;}if(!changed)break;}return d;}
 function initialDijkstra(g,source){const dist=Array(g.n).fill(Infinity);dist[source]=0;return{dist,prev:Array(g.n).fill(null),known:Array(g.n).fill(false),pending:[],current:null};}
 function dijkstra(g,source=0,limit=Infinity){if(g.edges.some(e=>e.w<0))throw Error('Dijkstra requires nonnegative weights.');const s=initialDijkstra(g,source),steps=[];for(let k=0;k<Math.min(limit,g.n);k++){let u=null;for(let v=0;v<g.n;v++)if(!s.known[v]&&Number.isFinite(s.dist[v])&&(u===null||s.dist[v]<s.dist[u]))u=v;if(u===null)break;s.known[u]=true;const updates=[];for(const e of arcs(g).filter(e=>e.u===u).sort((a,b)=>a.v-b.v))if(!s.known[e.v]&&s.dist[u]+e.w<s.dist[e.v]){s.dist[e.v]=s.dist[u]+e.w;s.prev[e.v]=u;updates.push({edge:e.id,v:e.v,dist:s.dist[e.v]});}steps.push({u,updates,dist:s.dist.slice(),prev:s.prev.slice(),known:s.known.slice()});}return{...s,steps};}
 function dijkstraAction(g,s,a){if(g.edges.some(e=>e.w<0))return{ok:false,message:'Ordinary Dijkstra steps are disabled for negative-weight graphs.'};
  if(a.type==='finalize'){const min=Math.min(...s.dist.filter((d,v)=>!s.known[v]));if(s.pending.length||s.known[a.v]||!Number.isFinite(s.dist[a.v])||s.dist[a.v]!==min)return{ok:false,message:s.pending.length?'Finish examining outgoing edges first.':'Finalize an unfinalized vertex with minimum finite tentative distance.'};s.known[a.v]=true;s.current=a.v;s.pending=arcs(g).filter(e=>e.u===a.v&&!s.known[e.v]).map(e=>e.id+':'+e.v);return{ok:true};}
  const e=arcs(g).find(e=>e.id===a.edge&&e.u===s.current&&e.v===a.to);
  if(!e||!s.pending.includes(e.id+':'+e.v))return{ok:false,message:'Examine an unprocessed outgoing edge of the current vertex.'};
  const old=s.dist[e.v],candidate=s.dist[e.u]+e.w,wanted=Math.min(old,candidate),preds=wanted<old?[e.u]:candidate===wanted?[s.prev[e.v],e.u]:[s.prev[e.v]];
  if(a.distance!==wanted||!preds.includes(a.prev))return{ok:false,message:'Check the candidate distance and predecessor. Equal tight predecessors may be retained or replaced.'};
  s.dist[e.v]=a.distance;s.prev[e.v]=a.prev;s.pending=s.pending.filter(x=>x!==e.id+':'+e.v);return{ok:true};
 }
 function dijkstraTrace(g,source,actions){const s=initialDijkstra(g,source);for(const a of actions){const r=dijkstraAction(g,s,a);if(!r.ok)return{...r,state:s};}return{ok:true,state:s};}
 function predCheck(g,source,dist,prev,known=null,truth=bellman(g,source)){
  const es=arcs(g);for(let v=0;v<g.n;v++){
   if(dist[v]!==truth[v])return{ok:false,message:'Distance for '+String.fromCharCode(65+v)+' is incorrect.'};
   if(known&&known[v]!==Number.isFinite(truth[v]))return{ok:false,message:'Finalize every reachable vertex; unreachable vertices remain unknown.'};
   if(v===source||!Number.isFinite(truth[v])){if(prev[v]!==null)return{ok:false,message:'The source and unreachable vertices have no predecessor.'};continue;}
   let x=v;const seen=new Set();while(x!==source){if(seen.has(x)||prev[x]===null||prev[x]===undefined)return{ok:false,message:'Predecessors must form a path to the source without cycles.'};seen.add(x);const p=prev[x];if(!es.some(e=>e.u===p&&e.v===x&&dist[p]+e.w===dist[x]))return{ok:false,message:'A predecessor edge is not tight for the entered distances.'};x=p;}
  }return{ok:true,message:'Correct distances and valid shortest-path predecessors.'};
 }
 function pathCheck(g,source,target,path,total){
  const truth=bellman(g,source);if(!Number.isFinite(truth[target]))return !path.length&&total===Infinity?{ok:true,message:'Correct: unreachable destination.'}:{ok:false,message:'This destination is unreachable.'};
  if(path[0]!==source||path.at(-1)!==target||new Set(path).size!==path.length)return{ok:false,message:'Choose a simple source-to-destination path.'};
  let sum=0;for(let i=1;i<path.length;i++){const edges=arcs(g).filter(e=>e.u===path[i-1]&&e.v===path[i]);if(!edges.length)return{ok:false,message:'The selected sequence uses a missing directed edge.'};sum+=Math.min(...edges.map(e=>e.w));}return sum===truth[target]&&sum===total?{ok:true,message:'Valid shortest path and cost. Tied shortest paths are accepted.'}:{ok:false,message:'Check the path cost and its optimality.'};
 }

 function residual(g,f){return g.edges.flatMap((e,i)=>[{id:e.id+'+',edge:i,sign:1,u:e.u,v:e.v,cap:e.cap-f[i]},{id:e.id+'-',edge:i,sign:-1,u:e.v,v:e.u,cap:f[i]}]).filter(e=>e.cap>0);}
 function pathFlow(g,f,ids,source=0,sink=g.n-1){const arcs=residual(g,f),selected=[],seen=new Set([source]);let u=source;for(const id of ids){const e=arcs.find(e=>e.id===id);if(!e||e.u!==u||seen.has(e.v))return{ok:false,message:'Select a continuous directed simple residual path with positive capacity.'};selected.push(e);u=e.v;seen.add(u);}return u===sink&&selected.length?{ok:true,arcs:selected,bottleneck:Math.min(...selected.map(e=>e.cap))}:{ok:false,message:'Continue the residual path from source to sink.'};}
 function augment(g,f,path,delta,source=0,sink=g.n-1){const p=pathFlow(g,f,path,source,sink);if(!p.ok||delta<=0||delta>p.bottleneck)throw Error(p.message||'Invalid augmentation amount.');const out=f.slice();for(const e of p.arcs)out[e.edge]+=e.sign*delta;return out;}
 function reachable(g,f,source=0){const q=[source],rs=residual(g,f);for(let i=0;i<q.length;i++)for(const e of rs)if(e.u===q[i]&&!q.includes(e.v))q.push(e.v);return q;}
 function flowCheck(g,f,source=0,sink=g.n-1){if(f.length!==g.edges.length)return{ok:false,message:'Every original edge needs a flow.'};const b=Array(g.n).fill(0);for(let i=0;i<f.length;i++){const e=g.edges[i];if(!Number.isFinite(f[i])||f[i]<0||f[i]>e.cap)return{ok:false,message:'Flow violates the nonnegative/capacity limit on '+e.id+'.'};b[e.u]-=f[i];b[e.v]+=f[i];}for(let v=0;v<g.n;v++)if(v!==source&&v!==sink&&Math.abs(b[v])>1e-8)return{ok:false,message:'Conservation fails at vertex '+String.fromCharCode(65+v)+'.'};if(-b[source]<0||Math.abs(b[source]+b[sink])>1e-8)return{ok:false,message:'Source and sink totals disagree.'};return{ok:true,value:-b[source],message:'Capacity and conservation constraints hold.'};}
 function findAugment(g,f,source=0,sink=g.n-1){const q=[source],prev=Array(g.n).fill(null),rs=residual(g,f);for(let i=0;i<q.length&&!q.includes(sink);i++)for(const e of rs)if(e.u===q[i]&&e.v!==source&&prev[e.v]===null){prev[e.v]=e;q.push(e.v);}if(!q.includes(sink))return null;const path=[];for(let v=sink;v!==source;v=prev[v].u)path.unshift(prev[v].id);return path;}
 function maxFlow(g,source=0,sink=g.n-1){if(source===sink||source<0||sink>=g.n)throw Error('Source and sink must be distinct valid vertices.');let f=Array(g.edges.length).fill(0),path;const steps=[];while((path=findAugment(g,f,source,sink))){const p=pathFlow(g,f,path,source,sink),before=f.slice();f=augment(g,f,path,p.bottleneck,source,sink);steps.push({path,delta:p.bottleneck,before,after:f.slice(),value:flowCheck(g,f,source,sink).value});}const reach=reachable(g,f,source),cut=g.edges.filter(e=>reach.includes(e.u)&&!reach.includes(e.v)).reduce((s,e)=>s+e.cap,0);return{flows:f,value:flowCheck(g,f,source,sink).value,steps,reach,cut};}
 function maxFlowCheck(g,f,total){const valid=flowCheck(g,f);if(!valid.ok)return valid;if(reachable(g,f).includes(g.n-1)||valid.value!==maxFlow(g).value)return{ok:false,message:'This flow is not maximum: a residual augmenting path remains.'};return total===valid.value?{ok:true,message:'Correct maximum flow; a minimum-cut certificate has the same capacity.'}:{ok:false,message:'The entered total differs from the net source flow.'};}
 function network(n,r){const t=n-1,es=[{u:0,v:1,cap:1},{u:0,v:2,cap:1},{u:1,v:2,cap:1},{u:1,v:t,cap:1},{u:2,v:t,cap:1}];if(n>4){es.push({u:0,v:3,cap:integer(r,2,7)});for(let i=3;i<n-2;i++)es.push({u:i,v:i+1,cap:integer(r,2,8)});es.push({u:n-2,v:t,cap:integer(r,2,8)});}if(r()<.5)es.push({u:2,v:1,cap:integer(r,0,3)});return graph(n,es,true);}
 function treeNetwork(n,r,single=false){const es=[];for(let v=1;v<n;v++)es.push({u:Math.floor((v-1)/2),v,cap:integer(r,1,12)});const g=graph(n,es,true),leaves=Array.from({length:n},(_,i)=>i).filter(i=>!es.some(e=>e.u===i)),sinks=single?[leaves[integer(r,0,leaves.length-1)]]:leaves,dp=Array(n).fill(0);for(let v=n-1;v>=0;v--)dp[v]=sinks.includes(v)?Infinity:es.filter(e=>e.u===v).reduce((s,e)=>s+Math.min(e.cap,dp[e.v]),0);return{g,sinks,dp};}
 function primMetrics(g,source=0,reverseTies=false){
  const inside=[source],selected=[];let totalCandidates=0,wideDecisions=0,closeDecisions=0,tieDecisions=0,blockedCheapStages=0;
  while(inside.length<g.n){const cut=crossing(g,inside).sort((a,b)=>a.w-b.w||(reverseTies?b.id.localeCompare(a.id):a.id.localeCompare(b.id)));if(!cut.length)throw Error('Disconnected Prim calibration graph.');const e=cut[0];totalCandidates+=cut.length;if(cut.length>=6)wideDecisions++;if(cut.filter(x=>x.w<=e.w+3).length>=2)closeDecisions++;if(cut.filter(x=>x.w===e.w).length>=2)tieDecisions++;if(g.edges.some(x=>inside.includes(x.u)&&inside.includes(x.v)&&!selected.includes(x.id)&&x.w<=e.w))blockedCheapStages++;selected.push(e.id);inside.push(inside.includes(e.u)?e.v:e.u);}
  const degrees=Array(g.n).fill(0);for(const id of selected){const e=edge(g,id);degrees[e.u]++;degrees[e.v]++;}
  return{totalCandidates,wideDecisions,closeDecisions,tieDecisions,blockedCheapStages,weightVariety:new Set(g.edges.map(e=>e.w)).size,selectedWeightVariety:new Set(selected.map(id=>edge(g,id).w)).size,branchVertices:degrees.filter(d=>d>=3).length,steps:selected.length};
 }
 function primDemand(d,m){return d==='hard'?m.totalCandidates>=75&&m.wideDecisions>=6&&m.closeDecisions>=4&&m.blockedCheapStages>=3&&m.branchVertices>=1&&m.weightVariety>=8&&m.selectedWeightVariety>=3:d==='medium'?m.totalCandidates>=18&&m.closeDecisions>=2&&m.branchVertices>=1:true;}
 function calibratedPrim(difficulty,r,requestedSource=0,forceTies=false){
  const range={easy:[4,5],medium:[6,8],hard:[9,11]}[difficulty],wantTies=forceTies||difficulty==='hard'&&r()<.3;
  for(let attempt=0;attempt<600;attempt++){
   const n=integer(r,...range),source=Math.max(0,Math.min(n-1,Number(requestedSource)||0)),pairs=[],seen=new Set(),add=(u,v)=>{const a=Math.min(u,v),b=Math.max(u,v),k=a+':'+b;if(a!==b&&!seen.has(k)){seen.add(k);pairs.push({u:a,v:b});}};
   for(let v=0;v<n;v++)add(v,(v+1)%n);
   const candidates=[];for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)if(!seen.has(a+':'+b))candidates.push([a,b]);
   for(let i=candidates.length-1;i;i--){const j=integer(r,0,i);[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
   const target=Math.min(n*(n-1)/2,difficulty==='hard'?3*n-3:difficulty==='medium'?2*n-2:n+1);for(const[u,v]of candidates){if(pairs.length>=target)break;add(u,v);}
   const weights=Array.from({length:pairs.length},(_,i)=>i+1);for(let i=weights.length-1;i;i--){const j=integer(r,0,i);[weights[i],weights[j]]=[weights[j],weights[i]];}
   const g=graph(n,pairs.map((e,i)=>({...e,w:wantTies?integer(r,1,14):weights[i]})),false),complexity=primMetrics(g,source),reverse=primMetrics(g,source,true);
   if(!primDemand(difficulty,complexity)||!primDemand(difficulty,reverse))continue;
   if(wantTies){const mst=kruskal(g);if(!complexity.tieDecisions||!mst.selected.some(id=>{const other=kruskal({...g,edges:g.edges.filter(e=>e.id!==id)});return other.connected&&other.weight===mst.weight;}))continue;}
   return{g,source,complexity,reverseComplexity:reverse,attempts:attempt+1};
  }
  const bank={"false":[[0,1,3],[1,2,6],[2,3,30],[3,4,9],[4,5,8],[5,6,22],[6,7,1],[7,8,28],[8,9,13],[9,10,15],[0,10,14],[8,10,26],[1,6,20],[6,8,4],[4,8,12],[6,9,25],[1,8,29],[0,2,7],[4,10,10],[0,5,5],[3,9,24],[2,8,18],[3,8,11],[1,4,21],[4,6,23],[4,7,27],[4,9,2],[2,9,17],[0,6,19],[5,10,16]],"true":[[0,1,10],[1,2,5],[2,3,4],[3,4,3],[4,5,4],[5,6,6],[6,7,8],[7,8,6],[8,9,2],[9,10,3],[0,10,10],[4,8,2],[0,6,7],[2,10,6],[1,10,10],[5,7,6],[1,9,12],[0,9,13],[4,6,6],[5,8,9],[5,9,10],[6,10,5],[2,9,12],[2,8,1],[4,9,6],[3,10,4],[0,4,2],[0,5,4],[1,8,9],[1,5,3]]};const n=difficulty==='hard'?11:difficulty==='medium'?7:4,source=Math.max(0,Math.min(n-1,Number(requestedSource)||0));let es;if(difficulty==='hard')es=bank[String(wantTies)];else{es=[];for(let u=0;u<n;u++)for(let v=u+1;v<n;v++)es.push([u,v,u===0?(wantTies?1:v):wantTies&&u===1&&v===2?1:10+u*n+v]);}const g=graph(n,es.map(([u,v,w])=>({u:(u+source)%n,v:(v+source)%n,w})),false),complexity=primMetrics(g,source),reverseComplexity=primMetrics(g,source,true);if(!primDemand(difficulty,complexity)||!primDemand(difficulty,reverseComplexity))throw Error('Invalid Prim calibration fallback.');return{g,source,complexity,reverseComplexity,attempts:601};
 }
 return{clone,rng,integer,graph,weighted,edge,crossing,primStep,prim,kruskal,mstCheck,primTrace,primMetrics,primDemand,calibratedPrim,dag,degrees,eligible,topoValid,kahn,cycle,arcs,bellman,initialDijkstra,dijkstra,dijkstraAction,dijkstraTrace,predCheck,pathCheck,residual,pathFlow,augment,reachable,flowCheck,findAugment,maxFlow,maxFlowCheck,network,treeNetwork};
})();


/* Insertion-specific questions reuse SortCore.reference; no second sorting engine. */
const InsertionPractice=(()=>{
 const C=SortCore,int=(r,a,b)=>a+Math.floor(r()*(b-a+1));
 function parse(raw){const s=String(raw??'').trim().replace(/^\[(.*)\]$/,'$1').trim();if(!s)return{error:'Enter the entire requested array.'};if(!/^[+-]?\d+(?:(?:\s*,\s*|\s+)[+-]?\d+)*$/.test(s))return{error:'Use integers separated by commas or spaces.'};const values=s.split(/[\s,]+/).map(Number);if(values.some(x=>!Number.isSafeInteger(x)))return{error:'Use ordinary safe integers.'};return{values};}
 function info(original){const ref=C.reference(original,'insertion');return{ref,shifts:ref.tasks.map(t=>t.swaps.length),total:ref.tasks.reduce((n,t)=>n+t.swaps.length,0)};}
 function generate(cfg){
  cfg={...cfg,rule:'median3',insertionType:cfg.insertionType||'complete'};const r=C.rng(cfg.seed+':insertion-questions'),type=cfg.insertionType,d=cfg.difficulty,range={easy:[4,6],medium:[7,10],hard:[11,16]}[d];let original,details,n,pass;
  const auto=cfg.autoInsertion!==false;
  for(let attempt=0;attempt<200;attempt++){
   n=int(r,...range);let kind=cfg.case||'random';if(auto){const roll=r();kind=roll<.25?'duplicates':roll<.4?'reverse':roll<.5&&type!=='complete'?'sorted':roll<.65?'nearly':'random';}
   original=C.input(cfg.seed+':insertion-'+attempt,n,kind==='nearly'?'random':kind);
   if(kind==='nearly'){original.sort((a,b)=>a.key-b.key);for(let i=0;i<Math.max(1,Math.floor(n/4));i++){const at=int(r,0,n-2);[original[at],original[at+1]]=[original[at+1],original[at]];}original=original.map((x,i)=>({...x,id:String.fromCharCode(65+i)}));}
   details=info(original);pass=type==='pass'&&d==='hard'?int(r,Math.max(3,Math.floor(n*.6)),n-1):int(r,1,n-1);
   if(!auto||type!=='complete'&&type!=='pass'&&!(type==='shifts'&&d==='hard'))break;
   if(type==='shifts'&&d==='hard'){if(details.total>=n&&details.shifts.filter(x=>x>=2).length>=3)break;continue;}
   const demand=type==='complete'?(d==='hard'?details.total>=n*1.5&&details.shifts.filter(x=>x>=2).length>=Math.ceil(n/3)&&Math.max(...details.shifts)>=4:d==='medium'?details.total>=n&&Math.max(...details.shifts)>=3:details.total>=2):(d!=='hard'||details.shifts.slice(0,pass).reduce((a,b)=>a+b,0)>=n&&details.shifts[pass-1]>=2);
   if(demand)break;
  }
  const p={cfg,original,tasks:details.ref.tasks,full:details.ref,title:'Question',type,pass,totalShifts:details.total,shifts:details.shifts,contract:'',initial:{a:C.clone(original),todo:null,procedure:[],index:0,ledger:[],sel:[],log:[],pick:null,boundary:null,heapN:n,merge:null,runChoices:[],runs:[],dragMode:'swap',bars:false,tree:false,response:'',choice:''}};
  if(type==='complete')p.question='Complete every insertion pass, then submit once. Select the key and choose its destination; intervening elements shift right. Use Keep Key Here to record no movement.';
  if(type==='pass'){p.question='Give the entire array after pass '+pass+'. Pass 1 processes index 1 (the second element); pass p processes index p. Use zero-based indices.';p.expected=p.tasks[pass-1].expected.map(x=>x.key);}
  if(type==='shifts'){
   const kinds=d==='hard'?['total','total','destination','shifts']:['destination','shifts','total','noMove','passes'];p.kind=kinds[int(r,0,kinds.length-1)];
   if(p.kind==='noMove'&&!details.shifts.includes(0)){original[n-1].key=Math.max(...original.map(x=>x.key))+1;details=info(original);p.tasks=details.ref.tasks;p.full=details.ref;p.shifts=details.shifts;p.totalShifts=details.total;p.initial.a=C.clone(original);}
   if(d==='hard'&&['destination','shifts'].includes(p.kind)){const candidates=p.tasks.filter(t=>t.swaps.length>=2);if(candidates.length)p.pass=candidates[int(r,0,candidates.length-1)].pass;}
   const t=p.tasks[p.pass-1],destination=t.expected.findIndex(x=>x.id===t.keyId);
   const prompts={destination:'On pass '+p.pass+', at which zero-based index does the key finish?',shifts:'How many preceding elements shift one position right during pass '+p.pass+'?',total:'How many rightward element shifts are needed to complete insertion sort?',noMove:'Enter any pass number where the key stays in place (zero rightward shifts).',passes:'For N = '+n+' elements, how many insertion sort passes are performed?'};
   p.question=prompts[p.kind]+' Pass 1 processes the second element; indices start at 0.';p.expected=p.kind==='destination'?destination:p.kind==='shifts'?t.swaps.length:p.kind==='total'?p.totalShifts:p.kind==='passes'?n-1:p.tasks.filter(t=>t.swaps.length===0).map(t=>t.pass);
  }
  if(type==='complexity'){
   const easy=['best','worst','arrangement','passes'],medium=['average','nearly','shiftEffect','fewest'],hard=['fewest','fewest','average','shiftEffect'],kind=(d==='easy'?easy:d==='hard'?hard:medium)[int(r,0,3)];p.kind=kind;
   const q={best:['What is the running time of insertion sort on presorted input?','linear'],worst:['What is insertion sort’s worst-case running time?','quadratic'],average:['What is insertion sort’s average-case running time?','quadratic'],arrangement:['Which arrangement produces worst-case quadratic movement for distinct keys?','reverse'],nearly:['Why does insertion sort often run quickly on nearly sorted input?','fewShifts'],shiftEffect:['For fixed N, what reduces the work of insertion sort?','fewShifts'],passes:['How many passes does insertion sort perform for N = '+n+' elements?',n-1]};
   if(kind==='fewest'){
    p.candidates=[];const totals=new Set();for(let i=0;p.candidates.length<3&&i<200;i++){const a=C.input(cfg.seed+':candidate'+i,d==='hard'?8:6,'random'),total=info(a).total;if(!totals.has(total)){totals.add(total);p.candidates.push({array:a,total});}}
    p.expected=String(p.candidates.reduce((best,x,i)=>x.total<p.candidates[best].total?i:best,0));p.question='Which array requires the fewest rightward element shifts to complete insertion sort?';p.choices=p.candidates.map((x,i)=>[String(i),String.fromCharCode(65+i)+': '+x.array.map(y=>y.key).join(', ')]);
   }else{[p.question,p.expected]=q[kind];p.choices=kind==='passes'?null:kind==='arrangement'?[['sorted','Already sorted'],['reverse','Reverse sorted'],['equal','All values equal']]:kind==='nearly'||kind==='shiftEffect'?[['fewShifts','Fewer preceding values need to shift'],['skip','The algorithm skips its required passes'],['unstable','Equal elements change order']]:[['constant','Θ(1)'],['linear','Θ(N)'],['quadratic','Θ(N²)'],['nlogn','Θ(N log N)']];}
  }
  return p;
 }
 function grade(p,s){
  if(p.type==='pass'){const values=Array.isArray(s.a)?s.a.map(x=>x.key):parse(s.response).values;if(!values||values.length!==p.original.length)return{ok:false,message:'Complete the array after pass '+p.pass+'.'};const ok=values.every((x,i)=>x===p.expected[i]);return{ok,message:ok?'Correct snapshot after pass '+p.pass+'.':'The array does not match the requested pass. Check the sorted prefix and the untouched suffix.'};}
  if(p.type==='complexity'&&p.choices){if(s.choice==='')return{ok:false,message:'Choose an answer before submitting.'};const ok=s.choice===p.expected;return{ok,message:ok?'Correct.':'Incorrect. Recheck the requested input case or movement count.'};}
  if(!/^\d+$/.test(String(s.response??'').trim()))return{ok:false,message:'Enter a nonnegative integer; a blank field is unanswered.'};
  const v=Number(s.response),ok=Array.isArray(p.expected)?p.expected.includes(v):v===p.expected;return{ok,message:ok?'Correct.':'Incorrect. Count rightward element shifts, use zero-based positions, and check the stated pass.'};
 }
 return{parse,info,generate,grade};
})();


/* Focused sorting questions use the same reference implementation as full procedures. */
const SortingTopics=(()=>{
 const C=SortCore,copy=C.clone,int=(r,a,b)=>a+Math.floor(r()*(b-a+1));
 const meta={insertion:{title:'Insertion Sort',pages:'p. 272',algorithm:'insertion',types:[['complete','Complete Sort'],['pass','Array After Pass'],['shifts','Shifts & Positions'],['complexity','Complexity']]},merge:{title:'Merge Sort',pages:'pp. 282–284',algorithm:'mergeRecursive',types:[['complete','Complete Sort'],['runs','Merge Two Runs'],['snapshot','Array After Merge'],['complexity','Splits & Complexity'],['bottom','Bottom-Up Mergesort']]},heapsort:{title:'Heapsort',pages:'pp. 278–280, p. 282',algorithm:'heap',types:[['complete','Complete Sort'],['build','Build Max-Heap'],['extract','Extract & Restore'],['snapshot','Array Snapshot'],['complexity','Complexity']]},quicksort:{title:'Quicksort',pages:'pp. 288–291, p. 294',algorithm:'quick',types:[['complete','Complete Sort'],['pivot','Pivot Selection'],['snapshot','Partition Snapshot'],['ranges','Recursive Ranges'],['complexity','Complexity']]}};
 function partitionTrace(t){
  const a=copy(t.before),steps=[],states={},lo=t.lo,hi=t.hi,mid=Math.floor((lo+hi)/2),exchange=(i,j)=>{if(i!==j)[a[i],a[j]]=[a[j],a[i]];};
  for(const [i,j]of t.swaps.slice(0,t.prep))exchange(i,j);states.arranged=copy(a);const pivot=a[mid];steps.push('Candidates at '+lo+', '+mid+', '+hi+' are arranged; median pivot = '+pivot.key+'.');exchange(mid,hi-1);states.parked=copy(a);steps.push('Park the pivot at index '+(hi-1)+'.');
  let i=lo,j=hi-1;while(true){const startI=i,startJ=j;do{i++;}while(a[i].key<pivot.key);do{j--;}while(a[j].key>pivot.key);steps.push('Strict scans: i '+startI+' → '+i+', j '+startJ+' → '+j+'. Equal values stop both pointers.');if(i>=j)break;exchange(i,j);steps.push('Exchange indices '+i+' and '+j+'.');states.firstSwap??=copy(a);}
  exchange(i,hi-1);states.restored=copy(a);steps.push('Restore the pivot at index '+i+'. Left range ['+lo+', '+(i-1)+']; right range ['+(i+1)+', '+hi+'].');return{states,steps,boundary:i,pivot:pivot.key,lo,hi,mid};
 }
 function initial(a){return{a:copy(a),todo:null,procedure:[],index:0,ledger:[],sel:[],log:[],pick:null,boundary:null,heapN:a.length,merge:null,runChoices:[],runs:a.map((_,i)=>({lo:i,hi:i})),dragMode:'swap',bars:false,tree:false,response:'',choice:'',fields:{},answerMethod:'direct',editor:false};}
 function autoInput(seed,n,r,allowPresorted=true){const x=r(),kind=x<.25?'duplicates':allowPresorted&&x<.35?'sorted':allowPresorted&&x<.45?'reverse':'random';return C.input(seed,n,kind);}
 function generate(topic,cfg,base,snapshotProblem){
  const exercise=cfg.exercise||'complete',d=cfg.difficulty,r=C.rng(cfg.seed+':'+topic+':'+exercise),hard=d==='hard',range={easy:[5,7],medium:[8,11],hard:[12,16]}[d];
  cfg={...cfg,mode:meta[topic].algorithm,exercise,topic,rule:'median3'};
  if(topic==='insertion'){const p=InsertionPractice.generate({...cfg,insertionType:exercise,autoInsertion:true});p.topic=topic;p.exercise=exercise;return p;}
  let original,n,full;
  for(let attempt=0;attempt<240;attempt++){
   n=int(r,...range);original=autoInput(cfg.seed+':'+attempt,n,r,!(hard&&exercise==='complete'));if(topic==='quicksort'&&exercise==='ranges')original=C.input(cfg.seed+':range'+attempt,n,'random');
   if(topic==='quicksort'&&exercise==='complete'&&!hard&&r()<.04)original.forEach(x=>x.key=7);
   if(topic==='heapsort'&&(exercise==='complete'||exercise==='build')&&hard&&attempt>30)original.sort((a,b)=>a.key-b.key);
   full=C.reference(original,cfg.mode,'median3');
   if(topic==='heapsort'&&(exercise==='complete'||exercise==='build')){const buildTasks=full.tasks.slice(0,Math.floor(n/2)),swaps=buildTasks.reduce((s,t)=>s+t.swaps.length,0),depth=Math.max(...buildTasks.map(t=>t.swaps.length));if(hard&&(swaps<8||depth<3||buildTasks.filter(t=>t.swaps.length>=2).length<2))continue;if(d==='medium'&&swaps<3)continue;if(d==='easy'&&swaps<1)continue;}
   if(topic==='quicksort'&&exercise==='complete'&&hard){const tasks=full.tasks.filter(t=>t.type==='quick');if(tasks.length<3||tasks.reduce((s,t)=>s+t.swaps.length-t.prep-1,0)<3)continue;}
   break;
  }
  const p={cfg,topic,exercise,original:copy(original),full,tasks:full.tasks,title:'Question',contract:'',initial:initial(original),steps:[],answerForm:null};
  if(topic==='heapsort'){
   const built=C.heapSnapshots(original,'ascending',0).built;p.built=copy(built);p.buildCount=Math.floor(n/2);
    if(exercise==='complete'){p.question='Perform bottom-up BuildHeap, then complete in-place ascending heapsort. Choose each build root and exchange yourself; submit the full recorded procedure once.';p.initial.heapBuild=true;p.initial.heapTarget=null;}
   if(exercise==='build'){p.expected=copy(built);p.answerForm='array';p.question='Using bottom-up BuildHeap, give the resulting max-heap array.';p.tasks=full.tasks.slice(0,p.buildCount);}
   if(exercise==='extract'){
    const iterations=1,snap=C.heapSnapshots(original,'ascending',iterations);p.original=copy(snap.built);p.initial=initial(p.original);p.built=copy(snap.built);p.iterations=iterations;p.expected=copy(snap.array);p.targetHeapN=snap.heapN;p.tasks=full.tasks.slice(p.buildCount).filter(t=>t.type==='extract'?t.heapN>=snap.heapN:t.heapN>=snap.heapN);p.question='Perform one extraction from this max-heap: exchange the root and last active element, shrink the active heap, and restore heap order. Give the complete array.';p.answerForm='extract';p.steps=snap.steps.map(s=>'After extraction '+s.iteration+': active size '+s.heapN+', array ['+s.array.map(x=>x.key).join(', ')+'].');
   }
   if(exercise==='snapshot'){
    const q=snapshotProblem({...cfg,mode:'heapSnapshots',sortDirection:'random',snapshotAt:'random',snapDuplicates:r()<.3});Object.assign(p,q,{cfg:{...q.cfg,topic,exercise},topic,exercise,answerForm:'array',expected:copy(q.snapshot.array),targetHeapN:q.snapshot.heapN});p.initial={...q.initial,response:'',choice:'',fields:{},editor:false,answerMethod:'direct',tree:false};p.question=q.question+' Use zero-based array indices.';p.contract='';p.steps=q.snapshot.steps.map(s=>'Extraction '+s.iteration+': active size '+s.heapN+', ['+s.array.map(x=>x.key).join(', ')+'].');
   }
   if(exercise==='complexity'){
    const questions=[['What is the time to build a heap bottom-up?','linear',[['log','O(log N)'],['linear','O(N)'],['nlogn','O(N log N)']], 'Bottom-up construction is O(N), since most nodes are close to the leaves.'],['What is the worst-case time for one extraction with heap restoration?','log',[['constant','O(1)'],['log','O(log N)'],['linear','O(N)']],'Percolation follows at most the logarithmic heap height.'],['What is heapsort’s total worst-case time?','nlogn',[['linear','O(N)'],['nlogn','O(N log N)'],['quadratic','O(N²)']],'O(N) construction plus N − 1 logarithmic extractions gives O(N log N).'],['Which heap ordering produces ascending in-place heapsort output?','max',[['min','Min-heap'],['max','Max-heap']],'Move each maximum to the final active position. A min-heap analog produces descending output.'],['Why does the active heap shrink after a root/end exchange?','final',[['final','The extracted extreme is finalized in the suffix'],['space','The array loses an element'],['root','The new root is already in final order']],'The extracted element remains in the array, but outside subsequent heap operations.'],['Does standard in-place heapsort require a second output array?','no',[['yes','Yes'],['no','No']],'The shrinking heap’s unused suffix stores extracted elements.'],['What is the maximum depth (root depth 0) in a complete binary heap with '+n+' elements?',Math.floor(Math.log2(n)),null,'The deepest occupied zero-based level is floor(log₂ N).']];
    const q=questions[int(r,0,questions.length-1)];p.question=q[0];p.expected=q[1];p.choices=q[2];p.steps=[q[3]];p.answerForm=q[2]?'choice':'number';p.original=[];
   }
  }else if(topic==='quicksort'){
   if(exercise==='complete'){p.initial.todo=[{type:'quick',lo:0,hi:n-1,pickIndex:Math.floor((n-1)/2),label:'Partition [0–'+(n-1)+']'}];p.question='Complete median-of-three Quicksort using strict scans and left-first recursion. Subarrays of at most 3 elements use stable insertion sort. Submit the entire recorded procedure once.';}
   else if(exercise==='complexity'){
    const questions=[['What is Quicksort’s average running time?','nlogn','Balanced partitions produce logarithmic recursion depth with linear partition work.'],['What is Quicksort’s worst-case running time?','quadratic','Repeatedly highly unbalanced partitions produce quadratic total work.'],['Why can the first element be a poor pivot for presorted distinct input?','unbalanced','It repeatedly creates an empty side and a side of almost the original size.'],['Under our partition convention, what should happen when a pointer meets a value equal to the pivot?','stop','Both pointers stop on equality; equal-valued exchanges help avoid severely unbalanced equal-key partitions.'],['Why use insertion sort for small recursive subarrays?','overhead','Insertion sort has low overhead and performs well on very small inputs.'],['Which partition pattern generally reduces recursive depth?','balanced','Two comparably sized subproblems reduce the largest remaining size quickly.']];const q=questions[int(r,0,questions.length-1)];p.question=q[0];p.expected=q[1];p.steps=[q[2]];p.choices=q[1]==='nlogn'||q[1]==='quadratic'?[['linear','O(N)'],['nlogn','O(N log N)'],['quadratic','O(N²)']]:q[1]==='stop'?[['stop','Both scans stop on equality'],['left','Only the left scan stops'],['neither','Neither scan stops']]:q[1]==='overhead'?[['overhead','Less overhead on small inputs'],['stable','It makes all of Quicksort stable'],['constant','Its time is constant for every N']]:[['balanced','Two comparably sized partitions'],['unbalanced','One nearly empty partition and one large partition']];p.answerForm='choice';p.original=[];
   }else{
    const tasks=full.tasks.filter(t=>t.type==='quick'),t=tasks[int(r,0,tasks.length-1)],trace=partitionTrace(t);p.task=t;p.trace=trace;p.original=copy(exercise==='ranges'?t.expected:t.before);p.initial=initial(p.original);p.steps=trace.steps;
    if(exercise==='pivot'){
     p.variant=(r()<.55?'value':r()<.67?'index':r()<.84?'positions':'park');p.question='Active range ['+t.lo+', '+t.hi+'], zero-based indices. '+({value:'What is the median-of-three pivot value?',index:'At which original candidate index is the median-of-three value? If candidates tie, any candidate holding the median value is accepted.',positions:'List the first, center, and last candidate indices.',park:'At which temporary index must the selected pivot be parked?'}[p.variant]);
     p.expected=p.variant==='value'?trace.pivot:p.variant==='park'?t.hi-1:p.variant==='positions'?[t.lo,trace.mid,t.hi]:[t.lo,trace.mid,t.hi].filter(i=>t.before[i].key===trace.pivot);p.answerForm=p.variant==='positions'?'set':p.variant==='index'?'oneOf':'number';
    }else if(exercise==='snapshot'){
     const available=['arranged','parked',...(trace.states.firstSwap?['firstSwap']:[]),'restored'];p.checkpoint=available[int(r,0,available.length-1)];p.expected=trace.states[p.checkpoint];p.question='Post-selection checkpoint for range ['+t.lo+', '+t.hi+']: the median-of-three pivot '+trace.pivot+' has already been selected. Give the entire array '+({arranged:'after arranging left ≤ center ≤ right',parked:'after arranging the candidates and parking the pivot at right − 1',firstSwap:'after the first exchange of stopped scan items (following median arrangement and pivot parking)',restored:'after completing this partition and restoring the pivot'}[p.checkpoint])+'. Use strict < and > scans; both stop on equality.';p.answerForm='array';
    }else{
     const b=t.boundary;p.question='This is a completed partition of ['+t.lo+', '+t.hi+'] with pivot value '+trace.pivot+'. Give its zero-based index, the nonempty left/right child ranges, and the next range of at least 2 elements processed under left-first recursion. Select Empty for an absent range.';p.expected={pivot:b,leftLo:t.lo,leftHi:b-1,rightLo:b+1,rightHi:t.hi,leftEmpty:b===t.lo,rightEmpty:b===t.hi,next:b-t.lo>=2?'left':t.hi-b>=2?'right':'none'};p.answerForm='ranges';
    }
   }
  }else{
     if(exercise==='complete'||exercise==='bottom'){const q=base({...cfg,mode:exercise==='bottom'?'mergeBottom':'mergeRecursive',case:r()<.3?'duplicates':'random'}),problem={...q,topic,exercise,cfg:{...q.cfg,topic,exercise},title:'Question'};if(exercise==='bottom'){problem.question='Complete every bottom-up merge pass by copying values from the preceding array into the grouped output cells.';problem.initial={...problem.initial,bottomRows:[Array(problem.original.length).fill(null)],bottomEditing:null,bottomSelection:null};}return problem;}
   if(exercise==='runs'){
    const mid=int(r,1,n-3),a=original.slice(0,mid+1).sort((a,b)=>a.key-b.key),b=original.slice(mid+1).sort((a,b)=>a.key-b.key);p.original=copy([...a,...b]);const ref=C.reference(p.original,'mergeBottom'),t=ref.tasks.at(-1);t.lo=0;t.mid=mid;t.hi=n-1;t.before=copy(p.original);t.left=copy(a);t.right=copy(b);t.expected=copy([...a,...b].sort((x,y)=>x.key-y.key));let i=0,j=0;t.takes=[];while(i<a.length||j<b.length){const side=j>=b.length||i<a.length&&a[i].key<=b[j].key?'L':'R',x=side==='L'?a[i++]:b[j++];t.takes.push({side,id:x.id});}p.tasks=[t];p.full={array:t.expected,tasks:p.tasks};p.initial=initial(p.original);p.cfg.mode='mergeBottom';p.question='Merge the two sorted runs. Choose every next output element yourself; take the left head on equal keys.';p.steps=['Left run: '+a.map(x=>x.key).join(', ')+'. Right run: '+b.map(x=>x.key).join(', ')+'.'];
   }else if(exercise==='snapshot'){
    const at=int(r,hard?Math.floor(full.tasks.length/2):0,full.tasks.length-1);p.mergeNumber=at+1;p.expected=copy(full.tasks[at].expected);p.original=copy(full.tasks[at].before);p.initial=initial(p.original);p.question='Given the array immediately before recursive left-first merge '+p.mergeNumber+' of '+full.tasks.length+', give the entire array immediately after this merge. The two runs occupy ['+full.tasks[at].lo+', '+full.tasks[at].mid+'] and ['+(full.tasks[at].mid+1)+', '+full.tasks[at].hi+'].';p.answerForm='array';p.steps=full.tasks.slice(0,at+1).map((t,i)=>'Merge '+(i+1)+' of ['+t.lo+', '+t.mid+'] and ['+(t.mid+1)+', '+t.hi+']: ['+t.expected.map(x=>x.key).join(', ')+'].' );
   }else{
    const variant=int(r,0,4),lo=int(r,0,n-3),hi=int(r,lo+2,n-1),q=[['A recursive range is ['+lo+', '+hi+'] (zero-based). What is the final index in its left half?',Math.floor((lo+hi)/2),'The left half ends at floor((left + right)/2).'],['How many two-run merges occur when recursively sorting '+n+' singleton elements?',n-1,'Each merge reduces the number of runs by one.'],['When merging sorted runs with '+n+' elements in total, what is the maximum number of comparisons?',n-1,'At most N − 1 head comparisons are needed; the remaining tail is copied.'],['What is mergesort’s worst-case time complexity?','nlogn','Divide into halves, recursively sort them, and perform linear merges.'],['Which run supplies the next element when its head equals the other run’s head?','left','Taking the left head preserves stable equal-key order.']][variant];p.question=q[0];p.expected=q[1];p.steps=[q[2]];p.answerForm=typeof q[1]==='number'?'number':'choice';p.choices=q[1]==='left'?[['left','Left run'],['right','Right run']]:[['linear','O(N)'],['nlogn','O(N log N)'],['quadratic','O(N²)']];p.original=[];
   }
  }
  return p;
 }
 function grade(p,s){
  const fail=message=>({ok:false,message});
  if(p.answerForm==='choice'){if(!s.choice)return fail('Choose an answer before submitting.');return{ok:s.choice===p.expected,message:s.choice===p.expected?'Correct.':'Incorrect. Recheck the requested algorithmic property.'};}
  if(['array','extract'].includes(p.answerForm)){const a=InsertionPractice.parse(s.response);if(a.error)return fail(a.error);const want=p.expected.map(x=>x.key);if(a.values.length!==want.length)return fail('Enter all '+want.length+' array values.');const ok=a.values.every((x,i)=>x===want[i]);return{ok,message:ok?'Correct requested array.':'The array does not match the requested operation or checkpoint.'};}
  if(p.answerForm==='ranges'){
   const f=s.fields,e=p.expected;for(const k of ['pivot',...(!e.leftEmpty?['leftLo','leftHi']:[]),...(!e.rightEmpty?['rightLo','rightHi']:[])])if(!/^\d+$/.test(String(f[k]??'').trim())||Number(f[k])!==e[k])return fail('Check the pivot index and child-range endpoints.');if(!!f.leftEmpty!==e.leftEmpty||!!f.rightEmpty!==e.rightEmpty)return fail('Check which child ranges are empty.');if(f.next!==e.next)return fail('Check the left-first choice of the next nontrivial subarray.');return{ok:true,message:'Correct pivot index, child ranges, and next recursive subproblem.'};
  }
  const parsed=InsertionPractice.parse(s.response);if(parsed.error)return fail(parsed.error);const actual=parsed.values;
  const ok=p.answerForm==='set'?actual.length===p.expected.length&&new Set(actual).size===actual.length&&actual.every(x=>p.expected.includes(x)):actual.length===1&&(p.answerForm==='oneOf'?p.expected.includes(actual[0]):actual[0]===p.expected);
  return{ok,message:ok?'Correct.':'Incorrect. Recheck the requested position or calculation.'};
 }
 return{meta,partitionTrace,initial,generate,grade};
})();

const CompactQuiz=(()=>{
 const K={input:(...a)=>LabKit.input(...a),button:(...a)=>LabKit.button(...a)},E=(...a)=>LabKit.E(...a);
 function number(raw){const s=String(raw??'').trim();return/^[+-]?\d+$/.test(s)&&Number.isSafeInteger(Number(s))?Number(s):null;}
 function field(ctx,label,key='value',numeric=false){const l=E('label',label+' ','cq-field'),input=K.input(ctx.s.answers?.[key]??'',v=>ctx.edit(s=>{s.answers??={};s.answers[key]=v;}));input.id=ctx.key+'Answer'+key;input.autocomplete='off';input.setAttribute('aria-label',label);if(numeric)input.inputMode='numeric';FormEvents.submitOnEnter(input,()=>ctx.check('final'));l.append(input);return l;}
 function choices(ctx,items,key='choice'){const row=E('div',undefined,'cq-choices');for(const [v,label]of items){const b=K.button(label,()=>ctx.edit(s=>{s.answers[key]=v;}),'cq-choice');b.id=ctx.key+'Choice'+key+String(v);b.dataset.compactChoice=key+':'+v;b.setAttribute('aria-pressed',String(ctx.s.answers[key]===v));row.append(b);}return row;}
 function gradeFields(p,s){for(const f of p.fields){const actual=s.answers[f.key];if(f.type==='choice'){if(actual===undefined||actual===null||actual==='')return{ok:false,message:'Choose an answer before submitting.'};if(actual!==f.expected)return{ok:false,message:'The selected conclusion is incorrect. Recheck the stated assumptions.'};}else if(f.type==='list'){const a=ArrayHeapPractice.parse(actual,true);if(a.error)return{ok:false,message:a.error};if(a.values.length!==f.expected.length||!a.values.every((v,i)=>v===f.expected[i]))return{ok:false,message:'Recheck the requested sequence.'};}else{const n=number(actual);if(n===null)return{ok:false,message:'Answer each requested calculation with an integer; blank fields are unanswered.'};if(n!==f.expected)return{ok:false,message:'The calculation is incorrect. Recheck the requested quantity and rounding.'};}}return{ok:true,message:'Correct.'};}
 function renderFields(ctx){for(const f of ctx.p.fields)ctx.ui.body.append(f.type==='choice'?choices(ctx,f.choices,f.key):field(ctx,f.label,f.key,f.type!=='list'));}
 function attach(ctx,pages,rulesText){
  if(typeof document.getElementById!=='function')return ctx;const root=document.getElementById(ctx.key+'Section');root.classList.add('compact-quiz');const intro=root.querySelector('.intro');intro.querySelector('.eyebrow').hidden=true;intro.querySelector('p').hidden=true;intro.append(E('p',pages,'cq-reading'));root.querySelector('.section-breadcrumb span').textContent='/ '+ctx.title;
  ctx.ui.diff.value='medium';ctx.ui.seed.parentElement.hidden=true;root.querySelector('.nl-settings>button').hidden=true;ctx.ui.mastery.hidden=true;
  const bar=ctx.ui.workspace.querySelector('.bh-actions'),[undo,redo,reset,check,reveal,fresh]=[...bar.children];bar.append(check,fresh,undo,redo,reset,reveal);check.textContent='Check Answer';fresh.textContent='New Problem';undo.textContent='Undo';redo.textContent='Redo';reveal.textContent='Show Solution';
  const rules=E('details',undefined,'rules cq-rules');rules.append(E('summary','Rules'),E('p',rulesText));root.append(rules);
  const render=ctx.render,start=ctx.start,msg=ctx.msg;
  ctx.msg=(text,type='info')=>msg(type==='info'&&/^(Choice recorded|Operation recorded|Problem ready|Undone|Redone|Problem reset)/.test(text)?'':text,type);
  ctx.render=()=>{const focused=document.activeElement,id=root.contains(focused)?focused.id:null;render();ctx.ui.mastery.hidden=true;undo.disabled=!ctx.history.length;redo.disabled=!ctx.future.length;if(id)document.getElementById(id)?.focus({preventScroll:true});};
  ctx.start=fresh=>{start(fresh);ctx.ui.body.querySelector('input:not([type="checkbox"]):not(:disabled)')?.focus({preventScroll:true});};
  ctx.check=which=>{if(which!=='final')return false;const field=document.activeElement,id=field?.id,caret=field?.selectionStart,result=ctx.adapter.check(ctx);if(result.ok&&!ctx.revealed)ctx.solved=true;ctx.signatures.add(JSON.stringify(ctx.adapter.signature?.(ctx)??ctx.s));ctx.render();ctx.msg((result.ok&&/^(Recheck|Check the)/.test(result.message)?'Correct.':result.message)+(ctx.revealed?' Solution was revealed.':''),result.ok?'success':'error');if(id){const input=document.getElementById(id);input?.focus({preventScroll:true});if(input?.setSelectionRange&&caret!==null&&caret!==undefined)input.setSelectionRange(caret,caret);}return result.ok;};
  document.addEventListener('keydown',e=>{if(root.hidden||e.target?.matches?.('input,select,textarea,[contenteditable="true"]'))return;if(e.key==='Escape'&&ctx.s){if(ctx.key==='activity'){ctx.edit(s=>{s.from=null;s.eventSelected=null;});}else if(ctx.s.selected!==undefined&&!Array.isArray(ctx.s.selected)){ctx.s.selected=null;ctx.render();}else if(ctx.s.chosen?.length)ctx.edit(s=>{s.chosen=[];s.answers[ctx.p.kind==='path'||ctx.p.variant==='path'?'path':'value']='';});}});
  return ctx;
 }
 return{number,field,choices,gradeFields,renderFields,attach};
})();

const LabKit=(()=>{
 const C=GraphCore,$=id=>document.getElementById(id),E=DomKit.element;
 const clone=C.clone,letter=v=>String.fromCharCode(65+v),num=x=>String(x).trim()===''||['∞','inf','infinity'].includes(String(x).toLowerCase())?Infinity:Number(x),fmt=x=>x===Infinity?'∞':x===-Infinity?'−∞':Number.isNaN(x)?'invalid':String(x);
 const button=(text,fn,cls='')=>{const b=E('button',text,cls);b.type='button';b.onclick=fn;return b;};
 function select(values,value,fn){const s=E('select');for(const[v,text]of values){const o=E('option',text);o.value=String(v);s.appendChild(o);}s.value=String(value);if(fn)s.onchange=()=>fn(s.value);return s;}
 function field(label,input){const l=E('label',undefined,'nl-field');l.append(E('span',label),input);return l;}
 let editing=false;
 function input(value,fn,type='text'){const x=E('input');x.type=type;x.value=typeof value==='number'?fmt(value):value??'';x.oninput=()=>{editing=true;try{fn(x.value);}finally{editing=false;}};return x;}
 function table(headers,rows){const t=E('table',undefined,'nl-table'),head=E('tr');headers.forEach(h=>head.appendChild(E('th',h)));const thead=E('thead');thead.appendChild(head);t.appendChild(thead);const body=E('tbody');for(const row of rows){const tr=E('tr');for(const cell of row){const td=E('td');if(cell&&typeof cell==='object')td.appendChild(cell);else td.textContent=cell;tr.appendChild(td);}body.appendChild(tr);}t.appendChild(body);const wrap=E('div',undefined,'nl-table-wrap');wrap.appendChild(t);return wrap;}
 function numberField(ctx,label,key,allowInfinity=false){return field(label,input(ctx.s[key]??'',v=>ctx.edit(s=>{s[key]=allowInfinity?num(v):v.trim()===''?null:Number(v);}),'text'));}
 function seed(){return Date.now().toString(36)+'-'+Math.floor(Math.random()*1e7).toString(36);}
 const contexts={};
 function create(key,title,description,adapter){
  const root=$(key+'Section'),ui={},ctx={key,title,adapter,ui,mode:Object.keys(adapter.modes)[0],p:null,s:null,history:[],future:[],revealed:false,solved:false,signatures:new Set(),stats:{}};
  for(const mode in adapter.modes){ctx.stats[mode]={};for(const d of ['easy','medium','hard'])ctx.stats[mode][d]={solved:0,correct:0,incorrect:0};}
  try{const saved=JSON.parse(CS3345Storage.getItem(key+'MasteryV1')||'{}');for(const m in ctx.stats)for(const d in ctx.stats[m])for(const f of ['solved','correct','incorrect'])if(Number.isInteger(saved[m]?.[d]?.[f])&&saved[m][d][f]>=0)ctx.stats[m][d][f]=saved[m][d][f];}catch{}
  const crumb=E('div',undefined,'section-breadcrumb');crumb.append(createHomeButton(),E('span','/ '+title+' \u00b7 CS 3345'));root.appendChild(crumb);
  const intro=E('div',undefined,'intro'),introText=E('div');introText.append(E('div','INTERACTIVE ALGORITHM PRACTICE','eyebrow'),E('h1',title),E('p',description));intro.appendChild(introText);root.appendChild(intro);
  const nav=E('nav',undefined,'nl-nav');ui.modeButtons={};const modeEntries=Object.entries(adapter.modes);for(const[m,name]of modeEntries.length>1?modeEntries:[]){const b=button(name,()=>{ctx.mode=m;ctx.start(false);});b.setAttribute('aria-pressed',String(m===ctx.mode));ui.modeButtons[m]=b;nav.appendChild(b);}if(modeEntries.length>1)root.appendChild(nav);
  const settings=E('div',undefined,'nl-settings');ui.diff=select([['easy','Easy'],['medium','Medium'],['hard','Hard']],'easy',()=>ctx.start(false));settings.appendChild(field('Difficulty',ui.diff));
  ui.seed=input(seed(),()=>{});settings.append(field('Seed',ui.seed),button('Replay seed',()=>ctx.start(false)));
  ui.exam={checked:true};ui.hints={checked:false};ui.validate={checked:false};
  ui.extra={};for(const opt of adapter.options||[]){const value=opt.value??opt.values?.[0][0]??false;const control=opt.values?select(opt.values,value,()=>ctx.start(false)):E('input');if(!opt.values){control.type='checkbox';control.checked=!!value;control.onchange=()=>ctx.start(false);}ui.extra[opt.key]=control;settings.appendChild(field(opt.label,control));}
  root.appendChild(settings);
  ui.task=E('section',undefined,'panel nl-task');ui.taskTitle=E('h2');ui.question=E('p');ui.contract=E('p',undefined,'nl-contract');ui.task.append(ui.taskTitle,ui.question,ui.contract);root.appendChild(ui.task);
  ui.workspace=E('section',undefined,'panel nl-workspace');ui.body=E('div',undefined,'nl-body');ui.workspace.appendChild(ui.body);
  const actions=E('div',undefined,'bh-actions');actions.append(button('↶ Undo',()=>ctx.undo()),button('↷ Redo',()=>ctx.redo()),button('Reset',()=>ctx.reset()),button('Check Final Answer',()=>ctx.check('final'),'primary'),button('Show Worked Solution',()=>ctx.reveal()),button('New Problem →',()=>ctx.start(true),'accent'));ui.workspace.appendChild(actions);
  ui.feedback=E('div',undefined,'feedback bh-feedback');ui.feedback.setAttribute('role','status');ui.feedback.setAttribute('aria-live','polite');ui.workspace.appendChild(ui.feedback);
  ui.solution=E('details',undefined,'nl-solution');ui.solution.hidden=true;ui.solution.appendChild(E('summary','Worked solution'));ui.solutionBody=E('div');ui.solution.appendChild(ui.solutionBody);ui.workspace.appendChild(ui.solution);root.appendChild(ui.workspace);
  ui.mastery=E('details',undefined,'panel nl-mastery');ui.mastery.appendChild(E('summary','Accuracy by mode and difficulty'));ui.stats=E('div');ui.mastery.appendChild(ui.stats);ui.mastery.appendChild(E('small','Only distinct final submissions affect accuracy. An independent solve is credited once per problem. Revealed problems are unscored.'));root.appendChild(ui.mastery);
  ctx.msg=(text,type='info')=>{ui.feedback.textContent=text;ui.feedback.className='feedback bh-feedback '+type;};
  ctx.config=()=>{const cfg={mode:ctx.mode,difficulty:ui.diff.value,seed:ui.seed.value};for(const opt of adapter.options||[]){if(opt.modes&&!opt.modes.includes(ctx.mode)||opt.hideModes?.includes(ctx.mode))continue;const c=ui.extra[opt.key];cfg[opt.key]=c.type==='checkbox'?c.checked:c.value;}return cfg;};
   const attempts=new Map(),attemptKey=cfg=>JSON.stringify(Object.fromEntries(Object.entries(cfg).sort(([a],[b])=>a.localeCompare(b))));ctx.submitted=false;ctx.lastResult=null;
  ctx.start=(fresh=false)=>{
   if(ctx.p)attempts.set(attemptKey(ctx.p.cfg),{revealed:ctx.revealed,solved:ctx.solved,signatures:ctx.signatures});
    if(fresh)ui.seed.value=seed();ctx.p=adapter.generate(ctx.config());ctx.rejected=[];ctx.s=clone(ctx.p.initial);ctx.submitted=false;ctx.lastResult=null;
   if(ui.extra.source&&ctx.p.g){const ctl=ui.extra.source;ctl.replaceChildren(...Array.from({length:ctx.p.g.n},(_,v)=>{const o=E('option',letter(v));o.value=String(v);return o;}));ctl.value=String(ctx.p.source??0);}
   ctx.history=[];ctx.future=[];Object.assign(ctx,attempts.get(attemptKey(ctx.p.cfg))||{revealed:false,solved:false,signatures:new Set()});ui.solution.hidden=true;ui.solutionBody.replaceChildren();ctx.render();ctx.msg('Problem ready. Make your decisions, then submit.'+(ctx.revealed?' Revealed seed: unscored.':ctx.solved?' This seed has already earned its independent solve.':''));
  };
   ctx.save=()=>{HistoryStack.save(ctx.history,ctx.future,clone(ctx.s),300);ctx.submitted=false;ctx.lastResult=null;};
   ctx.edit=fn=>{if(!ctx.s)return;ctx.save();fn(ctx.s);ctx.submitted=false;ctx.lastResult=null;ui.solution.hidden=true;if(!editing)ctx.render();else ctx.refreshGraph?.();ctx.msg(ui.exam.checked?'Choice recorded.':'Choice recorded. Submit when ready.');};
  ctx.perform=fn=>{const next=clone(ctx.s),r=fn(next)||{ok:true};ctx.save();ctx.s=next;ctx.rejected=[];ui.solution.hidden=true;ctx.render();ctx.msg('Operation recorded. Submit when ready.');return r.ok!==false;};
  ctx.undo=()=>{const previous=HistoryStack.undo(ctx.history,ctx.future,()=>clone(ctx.s));if(previous===null)return;ctx.s=previous;ctx.render();ctx.msg('Undone.');};
  ctx.redo=()=>{const next=HistoryStack.redo(ctx.history,ctx.future,()=>clone(ctx.s));if(next===null)return;ctx.s=next;ctx.render();ctx.msg('Redone.');};
  ctx.reset=()=>{if(!ctx.p)return;ctx.save();ctx.s=clone(ctx.p.initial);ui.solution.hidden=true;ctx.render();ctx.msg('Problem reset.');};
   ctx.check=which=>{if(!ctx.p)return false;if(which!=='final'){ctx.msg('Submit the completed answer with Check Final Answer.');return false;}const r=adapter.check(ctx,which);ctx.submitted=true;ctx.lastResult={ok:!!r.ok};if(which==='final'&&!ctx.revealed&&!ctx.solved){const signature=JSON.stringify(adapter.signature?.(ctx)??ctx.s,(_,v)=>typeof v==='number'&&!Number.isFinite(v)?Number.isNaN(v)?'__NaN__':v>0?'__Infinity__':'__NegativeInfinity__':v);if(!ctx.signatures.has(signature)){ctx.signatures.add(signature);const keys=[ctx.mode];for(const mode of keys){const t=ctx.stats[mode][ui.diff.value];t[r.ok?'correct':'incorrect']++;if(r.ok&&!ctx.solved)t.solved++;}if(r.ok)ctx.solved=true;try{persistProgress(key+'MasteryV1',ctx.stats);}catch{}}}ctx.render();ctx.msg(r.message+(ctx.revealed?' Revealed problem: unscored.':''),r.ok?'success':'error');return r.ok;};
  ctx.reveal=()=>{ctx.revealed=true;ui.solution.hidden=false;ui.solution.open=true;ui.solutionBody.replaceChildren();const content=adapter.solution(ctx);if(typeof content==='string')ui.solutionBody.appendChild(E('p',content));else if(Array.isArray(content))ui.solutionBody.append(...content);else if(content)ui.solutionBody.appendChild(content);ctx.msg('Worked solution shown. This problem cannot earn an independent solve.');};
  ctx.render=()=>{if(!ctx.p)return;for(const[m,b]of Object.entries(ui.modeButtons)){b.classList.toggle('active',m===ctx.mode);b.setAttribute('aria-pressed',String(m===ctx.mode));}for(const opt of adapter.options||[]){const control=ui.extra[opt.key];if(control?.parentElement)control.parentElement.hidden=!!opt.modes&&!opt.modes.includes(ctx.p.cfg.mode)||!!opt.hideModes?.includes(ctx.p.cfg.mode);}ui.taskTitle.textContent=ctx.p.title;ui.question.textContent=ctx.p.question;ui.contract.textContent=ctx.p.contract||'';ui.body.replaceChildren();adapter.render(ctx);const rows=[];for(const m in ctx.stats){const row=[adapter.modes[m]];for(const d of ['easy','medium','hard']){const t=ctx.stats[m][d],n=t.correct+t.incorrect;row.push(t.solved+' solved · '+(n?Math.round(t.correct/n*100)+'% ('+t.correct+'/'+n+')':'—'));}rows.push(row);}ui.stats.replaceChildren(table(['Mode','Easy','Medium','Hard'],rows));};
  contexts[key]=ctx;
  document.addEventListener('keydown',e=>{if(root.hidden||e.target?.matches?.('input,textarea,select'))return;if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();e.shiftKey||e.key.toLowerCase()==='y'?ctx.redo():ctx.undo();}});
  return ctx;
 }
 let svgNumber=0;
 function graphView(ctx,g,opts={}){
  const wrap=E('div',undefined,'nl-graph'),ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),uid='nlgraph'+(++svgNumber);svg.setAttribute('viewBox','0 0 900 600');svg.setAttribute('width',900);svg.setAttribute('height',600);svg.setAttribute('role','img');svg.setAttribute('aria-label','Interactive '+(g.directed?'directed':'undirected')+' graph');
  const defs=document.createElementNS(ns,'defs');for(const[name,color]of [['normal','#45564C'],['selected','#10A37F'],['rejected','#CF7468']]){const marker=document.createElementNS(ns,'marker');for(const[k,v]of Object.entries({id:uid+name,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto'}))marker.setAttribute(k,v);const path=document.createElementNS(ns,'path');path.setAttribute('d','M 0 0 L 10 5 L 0 10 z');path.setAttribute('fill',color);marker.appendChild(path);defs.appendChild(marker);}svg.appendChild(defs);
  const positions=opts.positions||Array.from({length:g.n},(_,v)=>({x:450+340*Math.cos(-Math.PI/2+v*2*Math.PI/g.n),y:290+215*Math.sin(-Math.PI/2+v*2*Math.PI/g.n)}));
  const labels=[],subtitles=[],subtitlePosition=v=>opts.subtitlePositions?.[v]||{x:positions[v].x,y:positions[v].y+43};
  for(const e of g.edges){
   const a=positions[e.u],b=positions[e.v],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
   const group=g.edges.filter(x=>Math.min(x.u,x.v)===Math.min(e.u,e.v)&&Math.max(x.u,x.v)===Math.max(e.u,e.v)),rank=group.findIndex(x=>x.id===e.id),offset=(rank-(group.length-1)/2)*38*(e.u<e.v?1:-1);
   const sx=a.x+ux*25,sy=a.y+uy*25,tx=b.x-ux*29,ty=b.y-uy*29,cx=(sx+tx)/2-uy*offset,cy=(sy+ty)/2+ux*offset;
   const focused=opts.focusEdges?.includes(e.id),selected=opts.selectedEdges?.includes(e.id),bad=opts.rejectedEdges?.includes(e.id),eligible=ctx.ui.hints.checked&&!ctx.ui.exam.checked&&opts.eligibleEdges?.includes(e.id),muted=opts.mutedEdges?.includes(e.id),kind=bad?'rejected':selected?'selected':'normal',color=bad?'#CF7468':selected?'#10A37F':focused?'#D0A65A':eligible?'#45564C':'#454545';
   const path=document.createElementNS(ns,'path');for(const[k,v]of Object.entries({d:'M '+sx+' '+sy+' Q '+cx+' '+cy+' '+tx+' '+ty,stroke:color,'stroke-width':selected?4:eligible?3:2,fill:'none',opacity:muted?.25:1}))path.setAttribute(k,v);if(g.directed)path.setAttribute('marker-end','url(#'+uid+kind+')');path.dataset.graphEdge=e.id;svg.appendChild(path);
   const hit=document.createElementNS(ns,'path');hit.setAttribute('d',path.getAttribute('d'));hit.setAttribute('stroke','transparent');hit.setAttribute('stroke-width','18');hit.setAttribute('fill','none');hit.style.cursor='pointer';hit.dataset.graphEdge=e.id;hit.dataset.graphU=e.u;hit.dataset.graphV=e.v;hit.setAttribute('role','button');hit.setAttribute('tabindex','0');hit.setAttribute('aria-label','Edge '+letter(e.u)+' to '+letter(e.v));hit.onclick=()=>opts.edgeClick?.(e.id);hit.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();opts.edgeClick?.(e.id);}};svg.appendChild(hit);
   const label=opts.edgeLabel?opts.edgeLabel(e):opts.weighted===false?'':String(e.w??'');
   if(label!==''){let x=(sx+2*cx+tx)/4,y=(sy+2*cy+ty)/4;
    const anchorX=x,anchorY=y,labelWidth=Math.max(26,String(label).length*7.6+10);let placed=false;for(let radius=0;radius<=180&&!placed;radius+=20){for(let dx=-radius;dx<=radius&&!placed;dx+=20)for(let dy=-radius;dy<=radius&&!placed;dy+=20){if(radius&&Math.max(Math.abs(dx),Math.abs(dy))!==radius)continue;const px=anchorX+dx,py=anchorY+dy;if(px-labelWidth/2<12||px+labelWidth/2>888||py<20||py>575)continue;if(labels.some(q=>Math.abs(q.x-px)<(q.w+labelWidth)/2+7&&Math.abs(q.y-py)<28))continue;if(positions.some((q,v)=>Math.abs(q.x-px)<labelWidth/2+29&&Math.abs(q.y-py)<38||opts.subtitle?.(v)&&Math.abs(subtitlePosition(v).x-px)<labelWidth/2+55&&Math.abs(subtitlePosition(v).y-py)<24))continue;x=px;y=py;placed=true;}}
    labels.push({x,y,w:labelWidth});const line=document.createElementNS(ns,'line');line.setAttribute('x1',(sx+2*cx+tx)/4);line.setAttribute('y1',(sy+2*cy+ty)/4);line.setAttribute('x2',x);line.setAttribute('y2',y);line.setAttribute('stroke','#2F2F2F');svg.appendChild(line);
    const rect=document.createElementNS(ns,'rect');rect.setAttribute('x',x-Math.max(13,String(label).length*3.8+5));rect.setAttribute('y',y-12);rect.setAttribute('width',Math.max(26,String(label).length*7.6+10));rect.setAttribute('height',24);rect.setAttribute('rx',6);rect.setAttribute('fill','#2F2F2F');rect.setAttribute('stroke',color);rect.dataset.graphEdge=e.id;rect.onclick=()=>opts.edgeClick?.(e.id);svg.appendChild(rect);
    const text=document.createElementNS(ns,'text');for(const[k,v]of Object.entries({x,y:y+5,'text-anchor':'middle','font-size':13,fill:'#A8B7AC'}))text.setAttribute(k,v);text.dataset.graphEdge=e.id;text.textContent=label;text.style.cursor='pointer';text.onclick=()=>opts.edgeClick?.(e.id);svg.appendChild(text);
   }
  }
  for(let v=0;v<g.n;v++){
   const p=positions[v],known=opts.known?.includes(v),chosen=opts.selectedVertices?.includes(v),eligible=ctx.ui.hints.checked&&!ctx.ui.exam.checked&&opts.eligibleVertices?.includes(v);
   const circle=document.createElementNS(ns,'circle');for(const[k,val]of Object.entries({cx:p.x,cy:p.y,r:23,fill:chosen?'#293A34':known?'#10A37F':'#2F2F2F',stroke:v===opts.source?'#665A3D':eligible?'#45564C':'#45564C','stroke-width':v===opts.source?4:2}))circle.setAttribute(k,val);circle.dataset.graphVertex=v;circle.setAttribute('role','button');circle.setAttribute('tabindex','0');circle.setAttribute('aria-label','Vertex '+letter(v));circle.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();opts.vertexClick?.(v);}};circle.style.cursor='pointer';circle.onclick=()=>opts.vertexClick?.(v);svg.appendChild(circle);
   const text=document.createElementNS(ns,'text');for(const[k,val]of Object.entries({x:p.x,y:p.y+5,'text-anchor':'middle','font-size':16,'font-weight':700,fill:known&&!chosen?'white':'#A8B7AC'}))text.setAttribute(k,val);text.textContent=opts.vertexLabel?opts.vertexLabel(v):letter(v);text.style.pointerEvents='none';svg.appendChild(text);
   const sub=opts.subtitle?.(v);if(sub){const t=document.createElementNS(ns,'text'),where=subtitlePosition(v);t.setAttribute('x',where.x);t.setAttribute('y',where.y);t.setAttribute('text-anchor','middle');t.setAttribute('font-size','12');t.setAttribute('fill','#A8B7AC');t.textContent=sub;t.dataset.graphSubtitle=v;subtitles.push({v,node:t});svg.appendChild(t);}
  }
  ctx.refreshGraph=()=>{for(const x of subtitles)x.node.textContent=opts.subtitle?.(x.v)||'';};wrap.appendChild(svg);return wrap;
 }
 const list=items=>{const ol=E('ol');for(const text of items)ol.appendChild(E('li',text));return ol;};
 return{$,E,button,select,field,input,table,numberField,seed,create,contexts,graphView,list,clone,letter,num,fmt};
})();


const SortingLab=(()=>{
 const K=LabKit,C=SortCore,E=K.E;
 const independent=p=>p?.cfg.mode==='mergeRecursive';
 const IndependentMerge=(()=>{
  const id=(lo,hi)=>lo+':'+hi,find=(s,key)=>s.nodes.find(n=>n.id===key);
   function initial(a){const values=C.clone(a);return{a:values,nodes:values.length?[{id:id(0,values.length-1),lo:0,hi:values.length-1,parent:null,children:null,mid:null,base:C.clone(values),result:values.length===1?C.clone(values):null,mergeOut:null,done:values.length===1}]:[],events:[],selected:[],mid:'',merge:null,selection:null};}
  function available(s,n){return !!n&&n.done&&(n.parent===null||!find(s,n.parent)?.done);}
   function next(s,node=find(s,id(0,s.a.length-1))){if(!node||node.lo===node.hi||node.done)return null;if(!node.children)return{type:'split',node};const left=find(s,node.children[0]),right=find(s,node.children[1]);if(!left.done)return next(s,left);if(!right.done)return next(s,right);return{type:'merge',node};}
   function prepare(s){const step=next(s);if(step?.type==='merge'&&!s.merge){const n=step.node,l=find(s,n.children[0]),r=find(s,n.children[1]);s.merge={parent:n.id,left:C.clone(l.result),right:C.clone(r.result),out:Array(n.hi-n.lo+1).fill(null)};}if(step?.type!=='merge')s.merge=null;s.selection=null;}
  function select(s,key){if(s.merge||!find(s,key))return false;s.selected=s.selected.includes(key)?s.selected.filter(x=>x!==key):s.selected.length===2?[key]:[...s.selected,key];s.mid='';return true;}
  function split(s,key,mid){
    const n=find(s,key),step=next(s);if(s.merge||!n||step?.type!=='split'||step.node.id!==key||n.children||n.done||!Number.isInteger(mid)||mid<n.lo||mid>=n.hi)return false;
    const left={id:id(n.lo,mid),lo:n.lo,hi:mid,parent:n.id,children:null,mid:null,base:C.clone(n.base.slice(0,mid-n.lo+1)),result:mid===n.lo?C.clone(n.base.slice(0,1)):null,mergeOut:null,done:mid===n.lo},right={id:id(mid+1,n.hi),lo:mid+1,hi:n.hi,parent:n.id,children:null,mid:null,base:C.clone(n.base.slice(mid+1-n.lo)),result:mid+1===n.hi?C.clone(n.base.slice(-1)):null,mergeOut:null,done:mid+1===n.hi};
    n.mid=mid;n.children=[left.id,right.id];s.nodes.push(left,right);s.events.push({type:'split',lo:n.lo,mid,hi:n.hi});s.selected=[];s.mid='';prepare(s);return true;
  }
   function put(s,side,index,destination){const m=s.merge,input=side==='L'?m?.left:side==='R'?m?.right:null;if(!m||!input?.[index]||!Number.isInteger(destination)||destination<0||destination>=m.out.length||m.out[destination]||m.out.some(cell=>cell?.from===side+':'+index))return false;m.out[destination]={item:C.clone(input[index]),from:side+':'+index};s.selection=null;return true;}
   function remove(s,index){if(!s.merge?.out[index])return false;s.merge.out[index]=null;s.selection=null;return true;}
   function move(s,from,to){const m=s.merge;if(!m||!m.out[from]||!Number.isInteger(to)||to<0||to>=m.out.length||from===to)return false;[m.out[from],m.out[to]]=[m.out[to],m.out[from]];s.selection=null;return true;}
   function place(s){const m=s.merge;if(!m||!m.out.every(Boolean))return false;const n=find(s,m.parent),values=m.out.map(cell=>C.clone(cell.item));n.result=values;n.mergeOut=values.map(x=>x.id);n.done=true;s.a.splice(n.lo,n.hi-n.lo+1,...C.clone(values));s.events.push({type:'merge',lo:n.lo,mid:n.mid,hi:n.hi,out:n.mergeOut.slice(),placed:true});s.merge=null;s.selected=[];prepare(s);return true;}
   function editMerge(s,key){const n=find(s,key);if(!n?.children||!n.done)return false;let at=n;while(at){at.done=false;at.result=null;at.mergeOut=null;at=find(s,at.parent);}s.events=s.events.filter(e=>e.type!=='merge'||!isAncestorOrSelf(s,id(e.lo,e.hi),key));s.a=C.clone(s.nodes[0].base);s.selected=[];s.merge=null;prepare(s);return true;}
   function isAncestorOrSelf(s,key,candidate){let n=find(s,candidate);while(n){if(n.id===key)return true;n=find(s,n.parent);}return false;}
  function plan(n){const out=[];function visit(lo,hi){if(lo>=hi)return;const mid=Math.floor((lo+hi)/2);out.push({type:'split',lo,mid,hi});visit(lo,mid);visit(mid+1,hi);out.push({type:'merge',lo,mid,hi});}visit(0,n-1);return out;}
   function grade(original,s){const fail=message=>({ok:false,message:message+' Correct operations remain hidden until Show Worked Solution.'});try{const expected=plan(original.length),root=find(s,id(0,original.length-1)),expectedIds={};function sorted(lo,hi){if(lo===hi)return[original[lo]];const mid=Math.floor((lo+hi)/2),left=sorted(lo,mid),right=sorted(mid+1,hi),out=[];let i=0,j=0;while(i<left.length||j<right.length)out.push(j>=right.length||i<left.length&&left[i].key<=right[j].key?left[i++]:right[j++]);expectedIds[id(lo,hi)]=out.map(x=>x.id);return out;}sorted(0,original.length-1);if(!root?.done||s.merge||!Array.isArray(s.events)||s.events.length!==expected.length)return fail('Complete every recursive split and merge before submitting.');for(const op of expected){const n=find(s,id(op.lo,op.hi));if(!n)return fail('A recursive range is missing.');if(op.type==='split'){if(!n.children||n.mid!==op.mid)return fail('The recursive subdivision boundaries or left-first structure are incorrect.');}else if(!n.done||!Array.isArray(n.mergeOut)||n.mergeOut.length!==op.hi-op.lo+1)return fail('A merge output is incomplete.');}for(const op of expected)if(op.type==='merge'){const n=find(s,id(op.lo,op.hi));if(n.mergeOut.some((value,i)=>value!==expectedIds[n.id][i]))return fail('A recursive merge or stable duplicate order is incorrect.');}return{ok:true,message:'Correct complete recursive mergesort: subdivisions, left-first processing, stable merges, and final array.'};}catch{return fail('The recorded recursive procedure is incomplete or invalid.');}}
   return{initial,available,select,split,put,remove,move,place,editMerge,prepare,next,plan,grade,id,find};
 })();
 function topicArray(ctx,a=ctx.s.a,editable=false){
  const row=E('div',undefined,'sp-array');row.setAttribute('aria-label','Array with zero-based indices');const p=ctx.p,s=ctx.s;
  a.forEach((x,i)=>{const b=E(editable?'button':'div',String(x.key),'sp-cell'+(s.sel?.includes(i)?' selected':'')+(p.topic==='heapsort'&&i>=(p.targetHeapN??s.heapN)?' sp-final':''));b.append(E('small','['+i+']'));if(editable){b.type='button';b.dataset.directIndex=i;b.setAttribute('aria-label','Index '+i+', '+x.key);b.onclick=e=>{if(e.detail===0)directSortSelect(ctx,i);};b.onpointerdown=e=>{if(e.button>0)return;drag={ctx,i,x:e.clientX,y:e.clientY,moved:false,topicDirect:true,problem:p};e.preventDefault();};}row.append(b);});return row;
 }
 function directSortSelect(ctx,i){
  const s=ctx.s;if(s.sel.length===1&&s.sel[0]!==i){const from=s.sel[0];ctx.edit(x=>{[x.a[from],x.a[i]]=[x.a[i],x.a[from]];x.sel=[];x.response=x.a.map(v=>v.key).join(', ');x.answerMethod='direct';});}else ctx.edit(x=>{x.sel=x.sel.includes(i)?[]:[i];});
 }
  function topicHeapTree(ctx,direct=false){
   const s=ctx.s,n=ctx.p.targetHeapN??s.heapN,widths=new Map(),items=[],edges=[];
  function measure(i){const kids=[i*2+1,i*2+2].filter(x=>x<n),w=Math.max(43,kids.reduce((a,k)=>a+measure(k),0)+Math.max(0,kids.length-1)*8);widths.set(i,w);return w;}
  function visit(i,x,depth){const w=widths.get(i),item={i,x:x+w/2,y:depth*62+25};items.push(item);const kids=[i*2+1,i*2+2].filter(x=>x<n),total=kids.reduce((a,k)=>a+widths.get(k),0)+Math.max(0,kids.length-1)*8;let left=x+(w-total)/2;for(const k of kids){const next=visit(k,left,depth+1);edges.push({a:item,b:next});left+=widths.get(k)+8;}return item;}
   const view=E('div',undefined,'sp-tree');if(n<1)return view;measure(0);visit(0,5,0);const available=view.parentElement?.clientWidth||ExpandedViews.width(ctx.key+'Section',62),model=ExpandedViews.tree({items,edges,width:widths.get(0)+10,height:Math.max(...items.map(x=>x.y))+42},available,37),width=model.width,height=model.height,stage=E('div',undefined,'sp-tree-stage');stage.style.width=width+'px';stage.style.height=height+'px';const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('width',width);svg.setAttribute('height',height);for(const e of edges)ExpandedViews.edge(svg,e,17,'#45564C');stage.append(svg);
   const completeWorkbench=!direct&&ctx.p.topic==='heapsort'&&ctx.p.exercise==='complete';for(const p of items){const x=s.a[p.i];if(!x)continue;const b=K.button(String(x.key),()=>direct?directSortSelect(ctx,p.i):workSelect(ctx,p.i),'sp-dot'+(s.sel.includes(p.i)?' selected':''));b.dataset.heapNode=p.i;b.dataset.sortIndex=p.i;b.style.left=p.x+'px';b.style.top=p.y+'px';b.append(E('small','['+p.i+']'));b.setAttribute('aria-label','Index '+p.i+', '+x.key);if(completeWorkbench){b.onpointerdown=e=>{if(e.button>0)return;drag={ctx,i:p.i,x:e.clientX,y:e.clientY,moved:false,workbench:true,kind:'array',problem:ctx.p,pass:s.index};if(e.pointerType!=='touch')e.preventDefault();};b.onclick=e=>{if(e.detail===0)workSelect(ctx,p.i);};}stage.append(b);}view.append(stage);return view;
 }
 function topicField(ctx,label,key='response',numeric=false){
  const l=E('label',label+' ','sp-field'),input=K.input(key==='response'?ctx.s.response:ctx.s.fields[key]??'',v=>{ctx.edit(s=>{if(key==='response'){s.response=v;s.answerMethod='direct';if(['array','extract'].includes(ctx.p.answerForm)){const a=InsertionPractice.parse(v);if(!a.error&&a.values.length===ctx.p.original.length)s.a=a.values.map((key,i)=>({key,id:ctx.p.original[i]?.id??String(i)}));}}else s.fields[key]=v;});if(ctx.s.tree&&ctx.p.topic==='heapsort'){const view=ctx.ui.body.querySelector('.sp-answer-tree');view?.replaceChildren(topicHeapTree(ctx,true));}});input.id=ctx.key+'Answer'+key;input.autocomplete='off';input.className='sp-answer-input';input.setAttribute('aria-label',label);if(numeric)input.inputMode='numeric';FormEvents.submitOnEnter(input,()=>ctx.check('final'));l.append(input);return l;
 }
 function renderTopicQuestion(ctx){
  const p=ctx.p,s=ctx.s,body=ctx.ui.body;
  if(['array','extract'].includes(p.answerForm)){
   body.append(E('h3','Your array'),E('p','Select two values to swap them. Indices start at zero.','sp-status'),topicArray(ctx,s.a,true));
   if(p.topic==='heapsort'){
    if(p.targetHeapN!==undefined)body.append(E('p','Requested active heap: '+p.targetHeapN+' elements; suffix indices '+p.targetHeapN+'–'+(p.original.length-1)+'.','sp-status'));
    const tools=E('div',undefined,'sp-tools'),label=E('label'),tree=E('input');tree.type='checkbox';tree.checked=!!s.tree;tree.onchange=()=>ctx.edit(x=>{x.tree=tree.checked;});label.append(tree,document.createTextNode(' Show Tree'));tools.append(label);body.append(tools);const view=E('div',undefined,'sp-answer-tree');if(s.tree)view.append(topicHeapTree(ctx,true));body.append(view);
   }
   return;
  }
  if(p.original.length){body.append(E('h3',p.topic==='quicksort'&&p.exercise==='ranges'?'Completed partition':'Given array'),topicArray(ctx,p.original));}
  if(p.answerForm==='choice'){
   const group=E('div',undefined,'sp-choices');for(const[v,t]of p.choices){const b=K.button(t,()=>ctx.edit(x=>{x.choice=v;}),'sp-choice');b.dataset.topicChoice=v;b.setAttribute('aria-pressed',String(s.choice===v));group.append(b);}body.append(group);return;
  }
  if(p.answerForm==='ranges'){
   const fields=E('div',undefined,'sp-fields');fields.append(topicField(ctx,'Pivot index','pivot',true));for(const side of ['left','right']){const group=E('div',undefined,'sp-range-fields'),none=E('input');none.type='checkbox';none.id=ctx.key+side+'Empty';none.checked=!!s.fields[side+'Empty'];none.onchange=()=>ctx.edit(x=>{x.fields[side+'Empty']=none.checked;});const l=E('label');l.append(none,document.createTextNode(' Empty '+side+' range'));group.append(l);for(const end of ['Lo','Hi']){const f=topicField(ctx,side+' '+(end==='Lo'?'start':'end'),side+end,true);f.querySelector('input').disabled=none.checked;group.append(f);}fields.append(group);}const select=K.select([['','Choose'],['left','Left range'],['right','Right range'],['none','None']],s.fields.next??'',v=>ctx.edit(x=>{x.fields.next=v;}));select.id=ctx.key+'NextRange';fields.append(K.field('Next range with at least 2 elements',select));body.append(fields);return;
  }
  body.append(topicField(ctx,['array','extract'].includes(p.answerForm)?'Your complete array (comma-separated)':'Your answer', 'response',!['array','extract','set'].includes(p.answerForm)));
  if(p.topic==='heapsort'&&['array','extract'].includes(p.answerForm)){
   if(p.targetHeapN!==undefined)body.append(E('p','Requested active heap: '+p.targetHeapN+' elements; suffix indices '+p.targetHeapN+'–'+(p.original.length-1)+'.','sp-status'));
   const editor=E('details',undefined,'sp-array-editor');editor.open=!!s.editor;editor.append(E('summary',p.exercise==='extract'?'Optional extraction editor':'Optional array editor'));editor.ontoggle=()=>s.editor=editor.open;
   if(p.exercise==='extract'){const area=E('div',undefined,'sp-extraction-work');editor.append(area);const old=ctx.ui.body;ctx.ui.body=area;renderTopicHeap(ctx);ctx.ui.body=old;}
   else editor.append(topicArray(ctx,s.a,true));body.append(editor);
   const tools=E('div',undefined,'sp-tools'),l=E('label'),tree=E('input');tree.type='checkbox';tree.checked=!!s.tree;tree.onchange=()=>ctx.edit(x=>{x.tree=tree.checked;});l.append(tree,document.createTextNode(' Show Tree'));tools.append(l);body.append(tools);const view=E('div',undefined,'sp-answer-tree');if(s.tree)view.append(topicHeapTree(ctx,true));body.append(view);
  }
 }
 function subtreeHeapValid(a,i,size){for(const k of [i*2+1,i*2+2])if(k<size&&(a[i].key<a[k].key||!subtreeHeapValid(a,k,size)))return false;return true;}
 function renderTopicHeap(ctx){
  const p=ctx.p,s=ctx.s,t=task(ctx),body=ctx.ui.body,building=p.exercise==='complete'&&s.index<p.buildCount;
   if(p.exercise==='complete'){
    const total=Math.max(0,p.original.length-1),extracted=s.ledger.filter(entry=>entry.task?.type==='extract').length,complete=!t,phase=complete?'Complete':building?'Build Max-Heap':t.type==='extract'?'Extract Maximum':'Restore Max-Heap';
    let progress,instruction;
    if(complete){progress='All required heapsort operations recorded. Active heap: '+s.heapN+' element'+(s.heapN===1?'':'s')+' · Sorted suffix: '+(s.a.length-s.heapN)+' element'+(s.a.length-s.heapN===1?'':'s')+'.';instruction='Select Check Final Answer when ready.';}
    else if(building){progress='Extractions recorded: '+extracted+' of '+total+' · Active heap: '+s.heapN+' elements · Sorted suffix: '+(s.a.length-s.heapN)+' elements.';instruction='Select the appropriate non-leaf node, then choose parent-child exchanges to build the max-heap. If its subtree already satisfies heap order, selecting it records that stage.';}
    else if(t.type==='extract'){const number=extracted+1;progress=(number===total?'Final extraction · ':'')+'Extraction '+number+' of '+total+' · Active heap: '+s.heapN+' elements · Sorted suffix: '+(s.a.length-s.heapN)+' elements.';instruction='Exchange the root with the last element in the active heap to move the maximum into the sorted suffix.';}
    else{progress='Extraction '+extracted+' of '+total+' · Active heap: '+s.heapN+' elements · Sorted suffix: '+(s.a.length-s.heapN)+' elements.';instruction='Restore max-heap order with parent-child exchanges that you choose. The processing node is labeled separately from your selected value.';}
    body.append(E('h3',phase),E('p',progress,'sp-status'),E('p',instruction+' Click two positions to exchange, or drag between them. A green cell is actually selected; a “heapify node” label only identifies the current processing position.','sp-help'));
    const label=E('label',undefined,'sp-tree-toggle'),check=E('input');check.type='checkbox';check.checked=!!s.tree;check.onchange=()=>ctx.edit(x=>{x.tree=check.checked;});label.append(check,document.createTextNode(' Show Tree'));body.append(label);const workspace=E('div',undefined,'sp-heap-complete-workspace'+(s.tree?' has-tree':'')),arrayPane=E('div',undefined,'sp-heap-complete-array');arrayPane.append(workTiles(ctx));workspace.append(arrayPane);let treePane=null;if(s.tree){treePane=E('div',undefined,'sp-heap-complete-tree');workspace.append(treePane);}body.append(workspace);if(treePane){treePane.append(topicHeapTree(ctx));if(ctx.heapResizeHandler)window.removeEventListener('resize',ctx.heapResizeHandler);let width=workspace.clientWidth;ctx.heapResizeHandler=()=>{const nextWidth=workspace.clientWidth;if(Math.abs(nextWidth-width)<2)return;width=nextWidth;if(ctx.s.tree&&treePane.isConnected)treePane.replaceChildren(topicHeapTree(ctx));};window.addEventListener('resize',ctx.heapResizeHandler,{passive:true});}else if(ctx.heapResizeHandler){window.removeEventListener('resize',ctx.heapResizeHandler);ctx.heapResizeHandler=null;}return;
   }
  body.append(E('h3',building?'BuildHeap':t?.type==='extract'?'Extraction':'Restore active heap'),E('p','Active heap: '+s.heapN+' elements · sorted suffix: '+(s.heapN<s.a.length?'indices '+s.heapN+'–'+(s.a.length-1):'empty')+'.','sp-status'));
  if(!t){body.append(E('p','Requested operations recorded. Submit when ready.','sp-status'),workTiles(ctx));return;}
  if(building)body.append(E('p','Choose the next non-leaf to process, then percolate down. Selecting a subtree that needs no exchange records it unchanged.','sp-help'));
  else body.append(E('p',t.type==='extract'?'Exchange the root and last active element; the heap boundary then shrinks.':'Continue with parent/child exchanges until heap order is restored.','sp-help'));
  body.append(workTiles(ctx));const label=E('label',undefined,'sp-tree-toggle'),check=E('input');check.type='checkbox';check.checked=!!s.tree;check.onchange=()=>ctx.edit(x=>{x.tree=check.checked;});label.append(check,document.createTextNode(' Show Tree'));body.append(label);if(s.tree)body.append(topicHeapTree(ctx));
 }
 function jumpPointer(ctx,key,to){
  const t=task(ctx);if(t?.type!=='quick'||!Number.isInteger(to)||to<t.lo||to>t.hi)return;
  const from=ctx.s[key]??(key==='qLeft'?t.lo:t.hi-1),step=key==='qLeft'?1:-1;if((to-from)*step<0)return ctx.msg('Use Undo to revise a scan; this pointer moves only in its scan direction.');
  commit(ctx,s=>{for(let at=from;at!==to;at+=step){const scan={pointer:key,from:at,to:at+step,at:s.log.length};(s.scans??=[]).push(scan);(s.quickEvents??=[]).push({type:'scan',...scan});}s[key]=to;});
 }
 function renderTopicQuick(ctx){
  const t=task(ctx),s=ctx.s,body=ctx.ui.body,phase=s.qPhase||(s.pick?'pivot':'arrange'),pivot=s.pick?s.a.find(x=>x.id===s.pick.id):null,tools=E('div',undefined,'sp-tools');
  body.append(E('h3','Active range ['+t.lo+', '+t.hi+']'),E('p','Candidates: '+t.lo+', '+Math.floor((t.lo+t.hi)/2)+', '+t.hi+'. '+(pivot?'Selected pivot: '+pivot.key+'.':'Arrange the candidates, then select the pivot.'),'sp-status'),workTiles(ctx));
  if(phase==='arrange')tools.append(K.button(s.qAction==='pivot'?'Choose your pivot in the array':'Choose Pivot',()=>quickAction(ctx,'pivot')));
  else if(phase==='pivot')tools.append(K.button('Park Pivot at right − 1',()=>quickAction(ctx,'park')),K.button('Change Pivot',()=>quickAction(ctx,'pivot')));
  else if(phase==='partition'){
   for(const [key,name,delta]of [['qLeft','i',1],['qRight','j',-1]]){const b=K.button('Set '+name+' by clicking an index',()=>commit(ctx,x=>{x.qAction=key;}));b.dataset.pointerTool=key;b.setAttribute('aria-pressed',String(s.qAction===key));b.onkeydown=e=>{if((key==='qLeft'&&e.key==='ArrowRight')||(key==='qRight'&&e.key==='ArrowLeft')){e.preventDefault();pointerMove(ctx,key,delta);}};tools.append(b,K.button(name+(delta>0?' →':' ←'),()=>pointerMove(ctx,key,delta)));}
   tools.append(K.button('Exchange i & j',()=>exchange(ctx,s.qLeft??t.lo,s.qRight??t.hi-1)),K.button('Restore Pivot at i',()=>quickAction(ctx,'restore')));
  }else tools.append(K.button('Record Pivot Position',()=>quickAction(ctx,'mark')));
  body.append(tools);
  const previous=s.ledger.filter(e=>e.task?.type==='quick');if(previous.length){const e=previous.at(-1),b=e.work.boundary;body.append(E('p','Last partition ['+e.task.lo+', '+e.task.hi+'] → ['+e.task.lo+', '+(b-1)+'] and ['+(b+1)+', '+e.task.hi+'].','sp-status'));const history=E('details',undefined,'sp-history');history.append(E('summary','Partition history'),K.list(previous.map(e=>'['+e.task.lo+', '+e.task.hi+']: pivot at '+e.work.boundary+'.')));body.append(history);}
 }
 function topicSolution(ctx){
  const p=ctx.p,format=a=>'['+a.map(x=>x.key).join(', ')+']';
  if(p.topic==='merge'&&p.exercise==='bottom')return renderBottomWorksheet(ctx,true);
  if(p.topic==='insertion')return insertionSolution(ctx);
  if(p.answerForm&&p.exercise==='complexity')return K.list(p.steps);
  if(p.topic==='heapsort'){
   const steps=['Original: '+format(p.original)];
   if(p.exercise==='snapshot'){steps.push(...p.steps,'Requested snapshot: '+format(p.expected));}
   else{for(const t of p.tasks){if(t.type==='heapify')steps.push((t.label.startsWith('Build')?'BuildHeap root ':'Restore from index ')+t.pickIndex+'.');let a=C.clone(t.before);for(const [i,j]of t.swaps){[a[i],a[j]]=[a[j],a[i]];steps.push('Exchange indices '+i+' and '+j+': '+format(a)+'.');}if(t.type==='extract')steps.push('Active heap size becomes '+t.heapN+'.');}steps.push('Requested result: '+format(p.expected||p.full.array));}
   return K.list(steps);
  }
  if(p.topic==='quicksort'){
   if(p.answerForm){let answer=p.expected;if(p.answerForm==='array')answer=format(p.expected);else if(p.answerForm==='ranges'){const e=p.expected;answer='pivot '+e.pivot+'; left '+(e.leftEmpty?'empty':'['+e.leftLo+', '+e.leftHi+']')+'; right '+(e.rightEmpty?'empty':'['+e.rightLo+', '+e.rightHi+']')+'; next '+e.next;}else if(Array.isArray(answer))answer=answer.join(', ');return[K.list(p.steps),E('p','Requested answer: '+answer+'.')];}
   return K.list(p.tasks.flatMap(t=>t.type==='quick'?['Range ['+t.lo+', '+t.hi+']: '+format(t.before),...SortingTopics.partitionTrace(t).steps,'After partition: '+format(t.expected)]:['Cutoff insertion at index '+t.pickIndex+': '+format(t.expected)+'.']).concat('Final sorted array: '+format(p.full.array)));
  }
  if(p.exercise==='complete')return independentSolution(ctx);
  if(p.answerForm)return[K.list(p.steps),E('p','Requested answer: '+(p.answerForm==='array'?format(p.expected):p.choices?.find(x=>x[0]===p.expected)?.[1]??p.expected)+'.')];
  return[E('p','Final result: '+format(p.full.array)),K.list(p.tasks.map(t=>t.label+': '+format(t.expected)))];
 }
 function createSortingTopic(topic){
  const m=SortingTopics.meta[topic],pageAdapter={modes:{[m.algorithm]:m.title},options:[{key:'exercise',label:'Exercise',values:m.types}],signature:ctx=>ctx.p.answerForm?{exercise:ctx.p.exercise,response:ctx.s.response,choice:ctx.s.choice,fields:ctx.s.fields,answerMethod:ctx.s.answerMethod,a:ctx.s.a,ledger:ctx.s.ledger}:adapter.signature(ctx),generate:cfg=>SortingTopics.generate(topic,cfg,adapter.generate,snapshotProblem),render(ctx){     const p=ctx.p,checkButton=ctx.ui.workspace.querySelector('.bh-actions .primary');if(checkButton)checkButton.textContent=p.cfg.mode==='mergeBottom'?'Check Answer':'Check Final Answer';ctx.ui.body.classList.toggle('mb-worksheet',topic==='merge'&&p.exercise==='bottom');ctx.ui.body.classList.toggle('recursive-worksheet',topic==='merge'&&independent(p));if(topic==='merge'&&p.exercise==='bottom'){renderBottomWorksheet(ctx);return;}if(topic==='insertion'){adapter.render(ctx);return;}     if(p.answerForm){renderTopicQuestion(ctx);return;}
   if(topic==='heapsort'){renderTopicHeap(ctx);return;}
   if(topic==='quicksort'&&task(ctx)?.type==='quick'){renderTopicQuick(ctx);showCurrentKey(ctx);return;}
   if(topic==='quicksort'&&task(ctx)?.type==='insert'){const t=task(ctx);ctx.ui.body.append(E('h3','Cutoff insertion ['+t.lo+', '+t.hi+'] · key index '+t.pickIndex),workTiles(ctx),K.button('Keep Key Here',()=>insertKey(ctx,t.pickIndex,t.pickIndex)));return;}
   renderWorkbench(ctx);
  },check(ctx){if(ctx.p.topic==='merge'&&ctx.p.exercise==='bottom')return bottomGrade(ctx);if(ctx.p.answerForm&&!(ctx.p.answerForm==='extract'&&ctx.s.answerMethod==='interactive'))return SortingTopics.grade(ctx.p,ctx.s);return adapter.check(ctx,'final');},solution:topicSolution};
  const page=K.create(topic,m.title,'',pageAdapter),root=document.getElementById(topic+'Section');page.ui.diff.value='medium';if(topic==='insertion')page.ui.extra.insertionType=page.ui.extra.exercise;
  const settings=root.querySelector('.nl-settings');page.ui.seed.parentElement.hidden=true;settings.querySelector('button').hidden=true;page.ui.extra.exercise.parentElement.hidden=true;page.ui.mastery.hidden=true;
  root.querySelector('.intro .eyebrow').hidden=true;root.querySelector('.intro p').hidden=true;root.querySelector('.section-breadcrumb span').textContent='/ '+m.title;
  if(topic!=='insertion'){root.querySelector('.intro').append(E('p',m.pages,'sp-reading'));const nav=E('nav',undefined,'sp-tabs');nav.setAttribute('aria-label',m.title+' exercise');for(const [value,title]of m.types){const b=K.button(title,()=>{page.ui.extra.exercise.value=value;page.start(true);});b.dataset.topicType=value;nav.append(b);}settings.before(nav);}
  const actions=page.ui.workspace.querySelector('.bh-actions'),[undo,redo,reset,check,reveal,fresh]=[...actions.children];if(topic!=='insertion'){actions.append(check,fresh,undo,redo,reset,reveal);[check.textContent,fresh.textContent,undo.textContent,redo.textContent,reveal.textContent]=['Check Answer','New Problem','Undo','Redo','Show Solution'];}
  const rules=E('details',undefined,'rules sp-rules');rules.append(E('summary','Rules'));
  const texts={insertion:'Pass p processes zero-based index p. Move only past larger values, preserving equal-key order. Record all N − 1 passes. Best time is Θ(N); worst and average are Θ(N²).',merge:'Recursive mergesort splits at floor((left + right)/2), processes the left child before the right, then merges. Take the left run on equal keys. The recursive editor labels positions from 1; focused questions explicitly use zero-based indices. Bottom-up practice uses widths 1, 2, 4, ….',heapsort:'Use zero-based indices: children 2i+1 and 2i+2; parent floor((i−1)/2). BuildHeap processes non-leaves from floor(N/2)−1 down to 0. Ascending output uses a max-heap; descending output uses a min-heap. Exchange root/last active, shrink, and restore. Choose the lower-index child on equal-child ties; never swap equal parent/child values. BuildHeap is O(N); heapsort is O(N log N) and uses the same array.',quicksort:'Use zero-based indices. Arrange left ≤ center ≤ right, select the center median, and park it at right−1. Strict scans move i right and j left; both stop on equality. Exchange stopped items while i<j; otherwise restore the pivot at i and recurse left first. The practice cutoff is 3 elements, handled by stable insertion sort. Clicking a pointer destination records every intervening scan step without deciding where it should stop. Average time is O(N log N); worst case is O(N²).'};rules.append(E('p',texts[topic]));root.append(rules);
  const histories=new Map(),baseStart=page.start,baseRender=page.render,baseMessage=page.msg;
  page.msg=(text,type='info')=>baseMessage(type==='info'&&/^(Choice recorded|Operation recorded|Problem ready|Undone|Redone|Problem reset)/.test(text)?'':text,type);
  page.render=()=>{const field=document.activeElement?.closest('input,select'),id=field&&root.contains(field)?field.id:null;const before=page.ui.body.querySelector('.sort-array')?.scrollLeft??0;baseRender();root.querySelectorAll('[data-topic-type]').forEach(b=>{const on=b.dataset.topicType===page.p.exercise;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});page.ui.extra.exercise.parentElement.hidden=true;page.ui.mastery.hidden=true;const row=page.ui.body.querySelector('.sort-array');if(row)row.scrollLeft=before;if(id)document.getElementById(id)?.focus({preventScroll:true});};
  page.start=fresh=>{if(page.p)histories.set(JSON.stringify(page.p.cfg),{revealed:page.revealed,solved:page.solved,signatures:page.signatures});baseStart(fresh);Object.assign(page,histories.get(JSON.stringify(page.p.cfg))||{revealed:false,solved:false,signatures:new Set()});const input=page.ui.body.querySelector('input:not([type="checkbox"])');input?.focus({preventScroll:true});};
  page.check=which=>{if(which!=='final')return false;const field=document.activeElement,selection=field?.selectionStart,fieldId=field?.id;const r=pageAdapter.check(page);if(!page.revealed&&r.ok)page.solved=true;page.signatures.add(JSON.stringify(pageAdapter.signature(page)));page.render();page.msg(r.message+(page.revealed?' Solution was revealed.':''),r.ok?'success':'error');if(fieldId){const next=document.getElementById(fieldId);next?.focus({preventScroll:true});if(next?.setSelectionRange&&selection!==null&&selection!==undefined)next.setSelectionRange(selection,selection);}return r.ok;};
  return page;
 }

 function insertionChrome(ctx){
  const root=ctx.ui.body.closest('.sorting-topic'),active=ctx.p.cfg.mode==='insertion';if(!root)return;
  root.classList.toggle('insertion-compact',active);
  let ui=ctx.ui.insertion;
  if(!ui){
   const intro=root.querySelector('.intro'),heading=intro.querySelector('h1'),crumb=root.querySelector('.section-breadcrumb span'),read=E('p','p. 272','ins-reading'),nav=E('nav',undefined,'ins-tabs');nav.setAttribute('aria-label','Insertion sort exercise');
   intro.append(read);intro.after(nav);const buttons={};for(const [v,t]of [['complete','Complete Sort'],['pass','Array After Pass'],['shifts','Shifts & Positions'],['complexity','Complexity']]){const b=K.button(t,()=>{ctx.ui.extra.insertionType.value=v;ctx.start(true);});b.dataset.insertionType=v;buttons[v]=b;nav.append(b);}
   const actions=ctx.ui.workspace.querySelector('.bh-actions'),oldButtons=[...actions.children],oldLabels=oldButtons.map(b=>b.textContent);ui=ctx.ui.insertion={heading,crumb,oldHeading:heading.textContent,oldCrumb:crumb.textContent,read,nav,buttons,actions,oldButtons,oldLabels};
  }
  ui.heading.textContent=active?'Insertion Sort':ui.oldHeading;ui.crumb.textContent=active?'/ Insertion Sort':ui.oldCrumb;ui.read.hidden=!active;ui.nav.hidden=!active;
  const generic=root.querySelector('.nl-nav');if(generic)generic.hidden=active;ctx.ui.mastery.hidden=active;
  ctx.ui.seed.parentElement.hidden=active;const replay=[...root.querySelector('.nl-settings').children].find(e=>e.tagName==='BUTTON');if(replay)replay.hidden=active;
  if(active){for(const c of Object.values(ctx.ui.extra))c.parentElement.hidden=true;for(const [v,b]of Object.entries(ui.buttons)){const on=ctx.p.type===v;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));}
   const [undo,redo,reset,check,reveal,fresh]=ui.oldButtons;ui.actions.append(check,fresh,undo,redo,reset,reveal);check.textContent='Check Answer';fresh.textContent='New Problem';undo.textContent='Undo';redo.textContent='Redo';reveal.textContent='Show Solution';
  }else{ui.actions.append(...ui.oldButtons);ui.oldButtons.forEach((b,i)=>b.textContent=ui.oldLabels[i]);}
 }
 function renderInsertionQuestion(ctx){
  const p=ctx.p,body=ctx.ui.body;
  if(p.type==='pass'){
   body.append(E('h3','Array after pass '+p.pass),E('p','Select two values to swap them. Indices start at zero.','sp-status'));
   const row=E('div',undefined,'sp-array');row.setAttribute('aria-label','Editable array after the requested insertion pass');
   ctx.s.a.forEach((x,i)=>{const b=K.button(String(x.key),()=>ctx.edit(s=>{if(s.sel.length===1&&s.sel[0]!==i){const j=s.sel[0];[s.a[i],s.a[j]]=[s.a[j],s.a[i]];s.sel=[];s.response=s.a.map(v=>v.key).join(', ');}else s.sel=s.sel.includes(i)?[]:[i];}),'sp-cell'+(ctx.s.sel.includes(i)?' selected':''));b.append(E('small','['+i+']'));b.setAttribute('aria-label','Index '+i+', '+x.key);row.append(b);});body.append(row);return;
  }
  if(p.type!=='complexity'||!p.choices&&p.kind!=='passes'){
   if(p.kind!=='passes'){body.append(E('h3','Original array'));const row=E('div',undefined,'ins-reference');for(const [i,x]of p.original.entries()){const cell=E('div',String(x.key),'ins-cell');cell.append(E('small','['+i+']'));row.append(cell);}body.append(row);}
  }
  if(p.type==='complexity'&&p.choices){
   const group=E('div',undefined,'ins-choices');group.setAttribute('role','group');group.setAttribute('aria-label','Your answer');for(const [v,t]of p.choices){const b=K.button(t,()=>ctx.edit(s=>{s.choice=v;}),'ins-choice');b.dataset.insChoice=v;b.setAttribute('aria-pressed',String(ctx.s.choice===v));group.append(b);}body.append(group);
  }else{
   const label=E('label',p.type==='pass'?'Your array: ':'Your answer: ','ins-answer-label'),input=K.input(ctx.s.response,v=>ctx.edit(s=>{s.response=v;}));input.id='insAnswer';input.className='ins-answer';input.autocomplete='off';input.setAttribute('aria-label',p.type==='pass'?'Complete array after the specified pass':'Numerical answer');if(p.type!=='pass')input.inputMode='numeric';FormEvents.submitOnEnter(input,()=>ctx.check('final'));label.append(input);body.append(label);
  }
 }
 function insertionSolution(ctx){
  const p=ctx.p,format=a=>'['+a.map(x=>x.key+(p.type==='complete'&&new Set(p.original.map(x=>x.key)).size<p.original.length?'·'+x.id:'')).join(', ')+']',steps=[];
  if(p.type==='complexity'){
   if(p.kind==='fewest')steps.push(...p.candidates.map((x,i)=>String.fromCharCode(65+i)+': '+InsertionPractice.info(x.array).shifts.join(' + ')+' = '+x.total+' shifts.'),'The fewest shifts occur in array '+String.fromCharCode(65+Number(p.expected))+'.');
   else if(p.kind==='passes')steps.push('Insertion sort performs N − 1 = '+(p.original.length-1)+' passes.');
   else steps.push(p.kind==='best'?'Presorted input requires no rightward shifts; N − 1 passes give linear Θ(N) time.':p.kind==='average'?'Average-case time is Θ(N²), as stated in the assigned analysis.':p.kind==='worst'||p.kind==='arrangement'?'Reverse-sorted distinct input shifts every prior element on each pass: 1 + 2 + … + (N − 1), giving Θ(N²).':'Nearly sorted input tends to require fewer rightward shifts. Required passes remain N − 1; less movement reduces the work within each pass.');
   return K.list(steps);
  }
  const relevant=p.type==='pass'?p.tasks.slice(0,p.pass):p.tasks;
  for(const t of relevant){const key=t.before[t.pickIndex],to=t.expected.findIndex(x=>x.id===t.keyId);steps.push('Pass '+t.pass+': key '+key.key+' from index '+t.pickIndex+' → index '+to+'; '+t.swaps.length+' rightward shift'+(t.swaps.length===1?'':'s')+'. '+format(t.expected));}
  if(p.type==='shifts')steps.push(p.kind==='noMove'?'Zero-shift passes: '+p.expected.join(', ')+'.':'Requested answer: '+p.expected+'.', 'Total rightward shifts: '+p.shifts.join(' + ')+' = '+p.totalShifts+'.');
  return[E('p','Original: '+format(p.original)),K.list(steps),E('p',p.type==='pass'?'Requested snapshot: '+format(p.tasks[p.pass-1].expected):'Final sorted array: '+format(p.full.array))];
 }

 const adapter={
 modes:{insertion:'Insertion Sort',heap:'Heapsort',heapSnapshots:'Heapsort Snapshots',mergeRecursive:'Mergesort · recursive',mergeBottom:'Mergesort · bottom-up',quick:'Quicksort'},
 finalOnly:()=>true,
 signature(ctx){if(ctx.p.topic==='merge'&&ctx.p.exercise==='bottom')return{bottomRows:ctx.s.bottomRows};if(ctx.p.cfg.mode==='insertion'&&ctx.p.type!=='complete')return{type:ctx.p.type,response:ctx.s.response,choice:ctx.s.choice};if(independent(ctx.p))return{a:ctx.s.im.a,nodes:ctx.s.im.nodes,events:ctx.s.im.events,merge:ctx.s.im.merge};if(ctx.p.cfg.mode==='heapSnapshots')return ctx.s.a.map(x=>x.key);const {a,index,ledger,log,pick,boundary,heapN,merge,procedure,quickEvents,scans}=ctx.s;return{a,index,ledger,log,pick,boundary,heapN,merge,procedure,quickEvents,scans};},
 options:[{key:'insertionType',label:'Exercise',modes:['insertion'],values:[['complete','Complete Sort'],['pass','Array After Pass'],['shifts','Shifts & Positions'],['complexity','Complexity']]},{key:'case',label:'Array case',values:[['random','Unique random'],['duplicates','Duplicate keys / stability'],['sorted','Already sorted'],['reverse','Reverse sorted']]}],
 generate(cfg){
  if(!Object.hasOwn(adapter.modes,cfg.mode))throw Error('Unknown sorting exercise.');cfg={...cfg,rule:'median3'};
  if(cfg.mode==='insertion')return InsertionPractice.generate({...cfg,autoInsertion:!!cfg.insertionType});
  if(independent({cfg}))return independentProblem(cfg);
  if(cfg.mode==='heapSnapshots')return snapshotProblem(cfg);
  const r=C.rng(cfg.seed+cfg.mode),range={easy:[4,6],medium:[7,10],hard:[11,16]}[cfg.difficulty],n=range[0]+Math.floor(r()*(range[1]-range[0]+1)),original=C.input(cfg.seed,n,cfg.case),ref=C.reference(original,cfg.mode,cfg.rule,cfg.gaps);
  const start=cfg.mode==='heap'?C.heapSnapshots(original,'ascending',0).built:C.clone(original);
  let tasks=cfg.mode==='heap'?ref.tasks.slice(Math.floor(n/2)):ref.tasks;
  const contract=cfg.mode==='quick'?'Weiss-style median-of-three: order left/center/right; select the center median, park it at right − 1; scan with strict < and > (equal keys stop both scans); restore pivot; recurse left first. Subarrays of size ≤ 3 use stable insertion sort.':cfg.mode==='mergeBottom'?'Stable merge: take the left head on equal keys. Bottom-up widths 1, 2, 4…; merge windows left to right.' :cfg.mode==='heap'?'A valid MAX-heap is provided. Exchange its root with its last active item; the boundary shrinks after your exchange. Repair downward using the larger child before the next extraction. Tied children choose the lower index.':'Stable insertion sort: process keys left to right and move a key only past strictly larger values. Visible letter IDs preserve equal-key identity.';
  return{cfg,original,tasks,full:ref,title:adapter.modes[cfg.mode],question:'Complete the sort.'+' Operations advance automatically and are recorded without correctness feedback. Submit once with Check Final Answer; a sorted array alone does not pass.',contract,initial:{a:C.clone(start),todo:cfg.mode==='quick'?quickRanges(start,0,n-1,cfg.rule):null,procedure:[],index:0,ledger:[],sel:[],log:[],pick:null,boundary:null,heapN:n,merge:null,runChoices:[],runs:original.map((_,i)=>({lo:i,hi:i})),dragMode:'swap',bars:false,tree:false}};
 },
 render(ctx){insertionChrome(ctx);if(ctx.p.cfg.mode==='insertion'&&ctx.p.type!=='complete')renderInsertionQuestion(ctx);else renderWorkbench(ctx);},
 check(ctx,which){
  if(ctx.p.cfg.mode==='insertion'&&ctx.p.type!=='complete')return InsertionPractice.grade(ctx.p,ctx.s);
  if(independent(ctx.p))return which==='final'?IndependentMerge.grade(ctx.p.original,ctx.s.im):{ok:false,message:'Complete the exercise and submit once with Check Final Answer.'};
  if(ctx.p.cfg.mode==='heapSnapshots')return C.snapshotGrade(ctx.p,ctx.s);
  return gradeProcedure(ctx.p,ctx.s);
 },
 solution(ctx){if(ctx.p.cfg.mode==='insertion')return insertionSolution(ctx);if(independent(ctx.p))return independentSolution(ctx);if(ctx.p.cfg.mode==='heapSnapshots'){const p=ctx.p,fmt=a=>'['+a.map(x=>x.key).join(', ')+']';return[E('p','Original array: '+fmt(p.original)),K.list(['Given starting '+p.heapType+'-heap: '+fmt(p.snapshot.built),...p.snapshot.steps.map(step=>'Extraction '+step.iteration+': exchange the root with position '+(step.heapN+1)+', shrink to '+step.heapN+' elements, and restore '+p.heapType+'-heap order. '+fmt(step.array)+' · active [1–'+step.heapN+']; sorted suffix ['+(step.heapN+1)+'–'+p.original.length+'].' )]),E('p','Requested snapshot: '+fmt(p.snapshot.array))];}return[E('p','Requested final array: '+ctx.p.tasks.at(-1)?.expected.map(x=>x.key+'·'+x.id).join(', ')),K.list(ctx.p.tasks.map(t=>t.label+': ['+t.expected.map(x=>x.key+'·'+x.id).join(', ')+']'+(t.type==='quick'?' · pivot '+t.pivotId+' · boundary '+(t.boundary+1):'')+(t.swaps?.length?' · '+(t.type==='insert'?'key shifts':'swaps')+' '+t.swaps.map(x=>'('+(x[0]+1)+','+(x[1]+1)+')').join(' '):'')))];}
 };
 // Workbench edits record the student's decisions without consulting expected
 // swaps, destinations or merge heads. The unchanged checkpoint grader judges
 // them only when submitted.
 // Completion is mechanical and uses the student's state. It never calls the
 // answer grader or repairs an array on the student's behalf.
 function currentTask(p,s){return p.cfg.mode==='quick'?(s.todo?.[0]??null):p.tasks[s.index];}
 function quickRanges(a,lo,hi,rule){if(lo>=hi)return[];if(hi-lo+1<=3)return Array.from({length:hi-lo},(_,k)=>{const i=lo+k+1;return{type:'insert',lo,hi:i,pickIndex:i,keyId:a[i].id,pass:k+1,label:'Cutoff insertion ['+(lo+1)+'–'+(hi+1)+'] pass '+(k+1)};});return[{type:'quick',lo,hi,pickIndex:rule==='median3'?Math.floor((lo+hi)/2):hi,label:'Partition ['+(lo+1)+'–'+(hi+1)+']'}];}
 function heapValid(a,n){for(let i=1;i<n;i++)if(a[Math.floor((i-1)/2)].key<a[i].key)return false;return true;}
 function stageWork(s){return{a:C.clone(s.a),log:s.log.map(x=>x.slice()),pick:s.pick?{...s.pick}:null,heapTarget:s.heapTarget?{...s.heapTarget}:null,boundary:s.boundary,heapN:s.heapN,merge:s.merge?K.clone(s.merge):null,scans:K.clone(s.scans||[]),quickEvents:K.clone(s.quickEvents||[]),qLeft:s.qLeft,qRight:s.qRight};}
 function recordStage(p,s,t){
  const work=stageWork(s),meta={type:t.type,lo:t.lo,hi:t.hi,pickIndex:t.pickIndex};
  s.ledger.push({index:s.index,task:meta,work});
  if(t.type==='merge'){s.a.splice(t.lo,t.hi-t.lo+1,...C.clone(s.merge.out));s.runs=s.runs.filter(x=>!(x.lo>=t.lo&&x.hi<=t.hi));s.runs.push({lo:t.lo,hi:t.hi});s.runs.sort((a,b)=>a.lo-b.lo);}
  if(p.cfg.mode==='quick'){s.todo.shift();if(t.type==='quick')s.todo.unshift(...quickRanges(s.a,t.lo,s.boundary-1,p.cfg.rule),...quickRanges(s.a,s.boundary+1,t.hi,p.cfg.rule));}
  s.index++;s.sel=[];s.log=[];s.pick=null;s.boundary=null;s.merge=null;s.runChoices=[];if(p.topic==='heapsort'&&p.exercise==='complete')s.heapTarget=null;
  for(const k of ['qLeft','qRight','qAction','qPhase','heapExtracted','insertPlaced','scans','quickEvents'])delete s[k];
 }
 function advance(p,s){
   if(independent(p))return;
  if(p.cfg.mode==='heapSnapshots')return;
  for(let guard=0;guard<2*s.a.length+4;guard++){
   const t=currentTask(p,s);if(!t)return;
    if(p.cfg.mode==='heap'&&t.type==='heapify'&&!s.pick&&!(p.topic==='heapsort'&&p.exercise==='complete'&&s.index<p.buildCount)){s.pick={id:s.a[0].id,index:0,at:0};if(p.topic==='heapsort'&&p.exercise==='complete')s.heapTarget={...s.pick};}
   const building=p.topic==='heapsort'&&p.exercise==='complete'&&s.index<p.buildCount;
   const done=t.type==='insert'?s.insertPlaced:t.type==='merge'?s.merge&&s.merge.li===s.merge.L.length&&s.merge.ri===s.merge.R.length:t.type==='quick'?s.boundary!==null:t.type==='extract'?s.heapExtracted:t.type==='heapify'&&p.cfg.mode==='heap'?(building?!!s.pick&&subtreeHeapValid(s.a,s.pick.index,s.heapN):heapValid(s.a,s.heapN)):false;
   if(!done)return;recordStage(p,s,t);
  }
 }
 function heapEvidence(p,s){
  const expected=[];for(const [stage,t]of p.tasks.entries()){for(const [a,b]of t.swaps)expected.push({kind:'swap',a,b,size:t.type==='extract'?t.heapN+1:t.heapN,stage,label:t.label});if(t.type==='extract')expected.push({kind:'resize',from:t.heapN+1,to:t.heapN,stage,label:t.label});}
  const actual=s.procedure;if(!Array.isArray(actual))return{ok:false,message:'The heapsort operation record is missing.'};
  const a=C.clone(p.initial.a);let size=a.length;
  for(let i=0;i<actual.length;i++){
   const e=actual[i],wanted=expected[i],where=wanted?'stage '+(wanted.stage+1)+' ('+wanted.label+')':'after the requested sorting stages';
   if(!wanted)return{ok:false,message:'First mistake at action '+(i+1)+': an extra operation was recorded '+where+'.'};
   if(e.kind==='swap'){
    if(!Number.isInteger(e.a)||!Number.isInteger(e.b)||e.a<0||e.b<0||e.a>=size||e.b>=size)return{ok:false,message:'First mistake at action '+(i+1)+': an exchange touches the finalized suffix or an invalid heap position.'};
    if(wanted.kind!=='swap'||e.size!==size||wanted.size!==size||!((e.a===wanted.a&&e.b===wanted.b)||(e.b===wanted.a&&e.a===wanted.b)))return{ok:false,message:'First mistake at action '+(i+1)+', '+where+': exchange '+(e.a+1)+' ↔ '+(e.b+1)+' does not follow the required root/end or larger-child percolation procedure.'};
    [a[e.a],a[e.b]]=[a[e.b],a[e.a]];
   }else if(e.kind==='resize'){
    if(wanted.kind!=='resize'||e.from!==size||e.to!==size-1||e.from!==wanted.from||e.to!==wanted.to)return{ok:false,message:'First mistake at action '+(i+1)+', '+where+': the active heap boundary changed at the wrong time or by the wrong amount.'};size--;
   }else return{ok:false,message:'First mistake at action '+(i+1)+': unknown heapsort operation.'};
  }
  if(!C.equal(a,s.a)||s.heapN!==size)return{ok:false,message:'The current array or active boundary does not match replaying the recorded heapsort operations.'};
  return{ok:true,complete:actual.length===expected.length};
 }
 function gradeQuickProcedure(p,s){
  let a=C.clone(p.initial.a);const queue=quickRanges(a,0,a.length-1,'median3');
  function insertion(t){const expected=C.clone(a),key=expected[t.pickIndex];let j=t.pickIndex;while(j>t.lo&&expected[j-1].key>key.key){expected[j]=expected[j-1];j--;}expected[j]=key;return{...t,before:C.clone(a),expected};}
  for(let index=0;index<s.ledger.length;index++){
   const entry=s.ledger[index],t=queue.shift();
   if(!t||entry.index!==index||!entry.task||['type','lo','hi'].some(key=>entry.task[key]!==t[key]))return{ok:false,message:'First mistake at stage '+(index+1)+': process the recorded left recursive subarray before the right subarray, using the insertion cutoff for sizes ≤ 3.'};
   const result=t.type==='quick'?C.assessQuick({...t,before:a},entry.work):C.assessTask(insertion(t),entry.work);
   if(!result.ok)return{ok:false,message:'First mistake at stage '+(index+1)+' ('+t.label+'): '+result.message};
   a=C.clone(result.array);if(t.type==='quick')queue.unshift(...quickRanges(a,t.lo,result.boundary-1,'median3'),...quickRanges(a,result.boundary+1,t.hi,'median3'));
  }
  if(s.index!==s.ledger.length)return{ok:false,message:'The stage count does not match the recorded recursive procedure.'};
  if(queue.length){
   const t=queue[0],active=currentTask(p,s);
   if(!active||['type','lo','hi'].some(key=>active[key]!==t[key]))return{ok:false,message:'The active recursive subarray does not follow the completed partition.'};
   let result;
   if(t.type==='quick')result=C.assessQuick({...t,before:a},stageWork(s),false);
   else if(s.pick)result=C.assessTask({...insertion(t),expected:s.a},s);
   else result={ok:C.equal(a,s.a),message:'The cutoff array changed without a recorded key insertion.'};
   if(!result.ok)return{ok:false,message:'First mistake in active stage '+(s.index+1)+': '+result.message};
   return{ok:false,message:'The Quicksort procedure is incomplete. Finish the active partition or cutoff insertion, then submit.'};
  }
  if(currentTask(p,s)||!C.equal(a,s.a)||s.a.some((x,i)=>i&&s.a[i-1].key>x.key))return{ok:false,message:'The final array or remaining recursive ranges do not match the recorded Quicksort procedure.'};
  return{ok:true,message:'Correct complete Quicksort: median arrangement, pivot placement, strict scans, recursive ranges, stable cutoff insertions, and final array.'};
 }

 function gradeProcedure(p,s){
  if(p.cfg.mode==='quick')return gradeQuickProcedure(p,s);
  if(p.cfg.mode==='heap'){const evidence=heapEvidence(p,s);if(!evidence.ok)return evidence;if(s.index===p.tasks.length&&!evidence.complete)return{ok:false,message:'The heapsort operation record is incomplete.'};}
  for(let i=0;i<s.ledger.length;i++){
   const entry=s.ledger[i],t=p.tasks[i];if(!t)return{ok:false,message:'First mistake: an unexpected stage was recorded after the requested exercise.'};
   if(entry.index!==i||!entry.task||['type','lo','hi'].some(k=>entry.task[k]!==t[k]))return{ok:false,message:'First mistake at stage '+(i+1)+': the recorded recursive range or operation order is incorrect.'};
   const result=C.assessTask(t,entry.work);if(!result.ok)return{ok:false,message:'First mistake at stage '+(i+1)+' ('+t.label+'): '+result.message};
  }
  const t=currentTask(p,s);
  if(t){const canonical=p.tasks[s.index];if(canonical&&s.log?.length){for(let i=0;i<s.log.length;i++){const want=canonical.swaps?.[i],pair=s.log[i];if(!want||!((pair[0]===want[0]&&pair[1]===want[1])||(pair[0]===want[1]&&pair[1]===want[0])))return{ok:false,message:'First mistake in the active stage '+(s.index+1)+' ('+canonical.label+'), exchange '+(i+1)+'.'};}}
   if(canonical?.type==='merge'&&s.merge)for(let i=0;i<s.merge.takes.length;i++)if(s.merge.takes[i].side!==canonical.takes[i]?.side||s.merge.takes[i].id!==canonical.takes[i]?.id)return{ok:false,message:'First mistake in the active merge, output choice '+(i+1)+': the required stable head order was not followed.'};
   return{ok:false,message:'The requested procedure is incomplete. Continue the active operation, then use Check Final Answer.'};
  }
  if(s.index!==p.tasks.length||s.ledger.length!==p.tasks.length)return{ok:false,message:'The recorded procedure has missing or extra sorting stages.'};
  const expected=p.tasks.at(-1)?.expected||p.initial.a;if(!(p.cfg.mode==='heap'?s.a.length===expected.length&&s.a.every((x,i)=>x.key===expected[i].key):C.equal(s.a,expected)))return{ok:false,message:'The final array does not match the result of the required recorded procedure, including item identities.'};
  return{ok:true,message:'All recorded sorting operations and the final requested array are correct.'};
 }

 const task=ctx=>currentTask(ctx.p,ctx.s),itemText=x=>x.key+'·'+x.id;
 function independentProblem(cfg){
  const r=C.rng(cfg.seed+cfg.mode),range={easy:[4,6],medium:[7,10],hard:[11,16]}[cfg.difficulty],n=range[0]+Math.floor(r()*(range[1]-range[0]+1)),original=C.input(cfg.seed,n,cfg.case),ref=C.reference(original,'mergeRecursive');
  return{cfg,original,tasks:ref.tasks,full:ref,title:'Recursive Mergesort',question:'Construct the recursive subdivisions and stable merges yourself. Complete the entire sort, then submit once with Check Final Answer.',contract:'Use Weiss’s left-first recursive calls: split a range, finish its left child, finish its right child, then merge. Choose midpoint boundaries and ready child runs yourself. Correctness is checked only at final submission.',initial:{a:C.clone(original),index:0,ledger:[],sel:[],log:[],pick:null,boundary:null,heapN:n,merge:null,im:IndependentMerge.initial(original)}};

 }

 function independentSolution(ctx){const p=ctx.p,events=IndependentMerge.plan(p.original.length);return[E('p','Sorted result: ['+p.full.array.map(itemText).join(', ')+'].'),K.list(events.map(e=>{const range='['+(e.lo+1)+'–'+(e.hi+1)+']';if(e.type==='split')return'Split '+range+' after position '+(e.mid+1)+': ['+(e.lo+1)+'–'+(e.mid+1)+'] and ['+(e.mid+2)+'–'+(e.hi+1)+']. Process the left child before the right child.';const merge=p.full.tasks.find(t=>t.lo===e.lo&&t.hi===e.hi);return'Merge '+range+': ['+merge.expected.slice(e.lo,e.hi+1).map(itemText).join(', ')+']. Equal keys take the left run first.';}))];}
  function imSelect(ctx,key){const s=ctx.s.im;if(s.merge||!IndependentMerge.find(s,key))return;s.selected=s.selected[0]===key?[]:[key];s.mid='';ctx.render();}
  function imSplit(ctx){const s=ctx.s.im,mid=/^\d+$/.test(s.mid.trim())?Number(s.mid)-1:NaN,key=s.selected[0];if(!key||!Number.isInteger(mid))return ctx.msg('Select the next range to split and enter the last position of its left half.');const draft=K.clone(s);if(!IndependentMerge.split(draft,key,mid))return ctx.msg('Follow the left-first recursive order and split this range into two nonempty contiguous ranges.');ctx.edit(x=>{IndependentMerge.split(x.im,key,mid);});}
  function imBegin(ctx){return ctx.msg('The merge row appears when both recursive child ranges are ready.');}
  function imSource(ctx,parent,side,index){const m=ctx.s.im.merge;if(!m||m.parent!==parent)return;const source=side==='L'?m.left:m.right;if(!source?.[index]||m.out.some(cell=>cell?.from===side+':'+index))return;const current=ctx.s.im.selection;ctx.s.im.selection=current?.parent===parent&&current.side===side&&current.index===index?null:{parent,side,index};ctx.render();}
  function imPut(ctx,parent,side,index,destination){const m=ctx.s.im.merge;if(!m||m.parent!==parent)return ctx.msg('Use a value from the two child ranges shown for this merge.');ctx.edit(s=>{if(!IndependentMerge.put(s.im,side,index,destination))return;if(s.im.merge.out.every(Boolean))IndependentMerge.place(s.im);});}
  function imRemove(ctx,index){ctx.edit(s=>IndependentMerge.remove(s.im,index));}
  function imMove(ctx,from,to){const draft=K.clone(ctx.s.im);if(!IndependentMerge.move(draft,from,to))return ctx.msg('Keep each placed value in this merge output row.');ctx.edit(s=>{IndependentMerge.move(s.im,from,to);});}
  function imEdit(ctx,key){ctx.edit(s=>{IndependentMerge.editMerge(s.im,key);});}
 function imTree(ctx,node){const s=ctx.s.im,wrap=E('div',undefined,'sort-division-node'),available=IndependentMerge.available(s,node),ready=node.children?.every(key=>IndependentMerge.find(s,key).done),b=K.button('['+(node.lo+1)+'–'+(node.hi+1)+']',()=>imSelect(ctx,node.id),s.selected.includes(node.id)?'sort-active-range':'');b.dataset.imNode=node.id;b.setAttribute('aria-pressed',String(s.selected.includes(node.id)));b.disabled=!!s.merge;wrap.append(b,E('small',node.done?(node.children?'merged · unverified':'one item')+(available?' · available':' · used'):node.children?(ready?'child runs available':'split recorded'):'not divided','im-node-status'));if(node.children){const children=E('div',undefined,'sort-division-children');for(const key of node.children)children.appendChild(imTree(ctx,IndependentMerge.find(s,key)));wrap.appendChild(children);}return wrap;}
 function imArray(items,ranges){const row=E('div',undefined,'nl-tiles sort-array');items.forEach((x,i)=>{const cell=E('div',itemText(x),'nl-tile'+(ranges.length&&!ranges.some(r=>i>=r.lo&&i<=r.hi)?' nl-inactive':''));cell.appendChild(E('small','['+(i+1)+']'));cell.dataset.imPosition=i;row.appendChild(cell);});return row;}
  function renderRecursiveWorksheet(ctx){
   const s=ctx.s.im,body=ctx.ui.body,root=s.nodes[0],step=IndependentMerge.next(s);body.classList.add('mb-worksheet','recursive-worksheet');body.append(E('p','Choose each midpoint yourself, then copy values from the two child arrays into their merge output. The original array and recorded recursive ranges stay visible.','mb-instructions'));
   function valueArray(label,values,{source=null,parent=null,output=false,depth=0,editKey=null,lo=0}={}){const section=E('section',undefined,'mb-row mb-rec-row');section.style.marginLeft=Math.min(depth*13,65)+'px';const head=E('div',undefined,'mb-row-head');head.append(E('strong',label));if(editKey)head.append(K.button('Edit merge',()=>imEdit(ctx,editKey),'mb-row-edit'));section.append(head);const list=E('div',undefined,'mb-run-list'),group=E('div',undefined,'mb-run-group');values.forEach((value,index)=>{const slot=output?value:null,item=output?(slot?.item||null):value,used=!!source&&s.merge?.parent===parent&&s.merge.out.some(cell=>cell?.from===source+':'+index),selected=!!source&&s.selection?.parent===parent&&s.selection.side===source&&s.selection.index===index,empty=output&&!item,tag=output||source&&!used?'button':'div',cell=E(tag,undefined,'mb-cell'+(empty?' is-empty':'')+(used?' is-used':'')+(selected?' selected':''));if(tag==='button')cell.type='button';cell.append(E('span',item?String(item.key):'', 'mb-value'),E('small',String(lo+index+1),'mb-position'));
    if(source){cell.classList.add('mb-source');cell.disabled=used;cell.draggable=!used;cell.setAttribute('aria-label','Input position '+(index+1)+', '+value.key+(used?', already used in this merge':', source value'));cell.setAttribute('aria-pressed',String(!!selected));if(!used){cell.onclick=()=>imSource(ctx,parent,source,index);cell.ondragstart=e=>{s.selection={parent,side:source,index};cell.classList.add('selected');e.dataTransfer?.setData('text/plain',JSON.stringify({kind:'source',parent,side:source,index}));if(e.dataTransfer)e.dataTransfer.effectAllowed='copy';};}}
    if(output){cell.setAttribute('aria-label',empty?'Empty merge output position '+(index+1):'Output position '+(index+1)+', '+item.key+', click to remove');if(empty)cell.onclick=()=>{const pick=s.selection;if(pick?.parent===parent)imPut(ctx,parent,pick.side,pick.index,index);else ctx.msg('Select a value from either child array first.');};else{cell.draggable=true;cell.onclick=()=>imRemove(ctx,index);cell.ondragstart=e=>{e.dataTransfer?.setData('text/plain',JSON.stringify({kind:'placed',parent,index}));if(e.dataTransfer)e.dataTransfer.effectAllowed='move';};}cell.ondragover=e=>{e.preventDefault();cell.classList.add('drop-ready');};cell.ondragleave=()=>cell.classList.remove('drop-ready');cell.ondrop=e=>{e.preventDefault();cell.classList.remove('drop-ready');let data;try{data=JSON.parse(e.dataTransfer?.getData('text/plain')||'{}');}catch{return;}if(data.kind==='source'&&data.parent===parent)imPut(ctx,parent,data.side,data.index,index);else if(data.kind==='placed'&&data.parent===parent)imMove(ctx,data.index,index);};}
    group.append(cell);});list.append(group);section.append(list);return section;}
   function rangeNode(node,depth=0){const out=E('div',undefined,'mb-rec-range');out.style.marginLeft=Math.min(depth*13,65)+'px';const selected=s.selected[0]===node.id,values=node.done?node.result:node.base,head=E('div',undefined,'mb-row-head');head.append(E('strong','Range ['+(node.lo+1)+'–'+(node.hi+1)+']'));const choose=K.button(node.done?'Completed':'Select range',()=>imSelect(ctx,node.id),'mb-row-edit');choose.disabled=!!s.merge||node.lo===node.hi||!!node.children;choose.classList.toggle('selected',selected);head.append(choose);out.append(head);const list=E('div',undefined,'mb-run-list'),group=E('div',undefined,'mb-run-group');values.forEach((item,i)=>{const cell=E('div',String(item.key),'mb-cell');cell.append(E('small','['+(node.lo+i+1)+']','mb-position'));group.append(cell);});list.append(group);out.append(list);
    if(node.children){for(const key of node.children)out.append(rangeNode(IndependentMerge.find(s,key),depth+1));if(s.merge?.parent===node.id){const m=s.merge,merge=E('section',undefined,'mb-rec-merge');merge.style.marginLeft=Math.min((depth+1)*13,78)+'px';const mh=E('div',undefined,'mb-row-head');mh.append(E('strong','Merge range ['+(node.lo+1)+'–'+(node.hi+1)+']'));merge.append(mh,E('p','Copy values from either child array into the output. Inputs stay unchanged; each occurrence can be used once.','mb-rec-note'));merge.append(valueArray('Left input ['+(node.lo+1)+'–'+(node.mid+1)+']',m.left,{source:'L',parent:node.id,depth:depth+1,lo:node.lo}),valueArray('Right input ['+(node.mid+2)+'–'+(node.hi+1)+']',m.right,{source:'R',parent:node.id,depth:depth+1,lo:node.mid+1}),valueArray('Merge output',m.out,{output:true,parent:node.id,depth:depth+1,lo:node.lo}));out.append(merge);}else if(node.done&&node.mergeOut)out.append(valueArray('Completed merge ['+(node.lo+1)+'–'+(node.hi+1)+']',node.result,{depth:depth+1,lo:node.lo,editKey:node.id}));}
    if(step?.type==='split'&&step.node.id===node.id&&selected){const controls=E('div',undefined,'mb-rec-split-controls'),field=K.input(s.mid,value=>ctx.edit(x=>{x.im.mid=value;}));field.inputMode='numeric';field.maxLength=3;field.setAttribute('aria-label','Last position in left half');field.dataset.imMidpoint='true';controls.append(K.field('Last position in left half (one-based)',field),K.button('Record split',()=>imSplit(ctx)));out.append(controls);}return out;}
   valueArray('Original Array',ctx.p.original,{lo:0});if(root)body.append(rangeNode(root));if(!step&&root?.done)body.append(E('p','Recursive worksheet complete. Submit with Check Final Answer when ready.','mb-rec-note'));else if(step?.type==='split')body.append(E('p','Next recursive operation: choose a midpoint for range ['+(step.node.lo+1)+'–'+(step.node.hi+1)+'].','mb-rec-note'));else if(step?.type==='merge')body.append(E('p','Both child ranges are ready. Complete the merge output shown below them.','mb-rec-note'));
  }
  function renderIndependent(ctx){
  const s=ctx.s.im,body=ctx.ui.body;
  body.append(E('h3','Your recursive mergesort procedure'),E('p','Select ranges in your tree to split or merge. The tree contains only actions you have recorded; it does not identify the next operation.','sort-instruction'));
  if(s.events.length)body.append(E('p','Original input: ['+ctx.p.original.map(itemText).join(', ')+']','nl-help'));
  body.append(E('p',s.events.length?'Current array after your placed merges':'Original array','nl-help'),imArray(s.a,s.merge?[s.merge]:s.selected.map(key=>IndependentMerge.find(s,key))));
  const tree=E('div',undefined,'sort-division im-tree');tree.setAttribute('aria-label','Student-created recursion tree');if(s.nodes.length)tree.appendChild(imTree(ctx,s.nodes[0]));body.appendChild(tree);
  body.append(E('p','Available means structurally ready, not checked for correctness. Choose the recursive processing order yourself.','nl-help'));
  if(s.merge){
   const m=s.merge;body.appendChild(E('p','Your selected child runs: ['+(m.lo+1)+'–'+(m.mid+1)+'] and ['+(m.mid+2)+'–'+(m.hi+1)+'].','nl-output'));renderMergeRuns(ctx,m,m,true);
  }else{
   const controls=E('div',undefined,'nl-tools'),field=K.input(s.mid,value=>ctx.edit(x=>{x.im.mid=value;}));field.inputMode='numeric';field.maxLength=3;field.setAttribute('aria-label','Last position in the left half');field.dataset.imMidpoint='true';
   const split=K.button('Record split',()=>imSplit(ctx)),begin=K.button('Merge selected child runs',()=>imBegin(ctx));split.disabled=s.selected.length!==1;begin.disabled=s.selected.length!==2;
   controls.append(K.field('Last position in left half',field),split,begin);body.append(E('p','Selected ranges: '+(s.selected.map(key=>{const n=IndependentMerge.find(s,key);return'['+(n.lo+1)+'–'+(n.hi+1)+']';}).join(' and ')||'none')+'. Positions are one-based; item letter IDs remain unchanged.','nl-help'),controls);
  }
  const splits=s.events.filter(e=>e.type==='split').length,merges=s.events.filter(e=>e.type==='merge'&&e.placed).length;body.appendChild(E('p',splits+' splits recorded · '+merges+' merges placed. '+(s.nodes[0]?.done?'Root run recorded. Submit the whole procedure when ready.':'No correctness checks have been performed.'),'nl-help'));
 }
 function keepVisible(el){/* Expanding array rows keep all entries visible. */}
 function commit(ctx,fn,id){const body=ctx.ui?.body,old=body?.querySelector('.sort-array'),left=old?.scrollLeft||0,active=typeof document==='undefined'?null:document.activeElement,label=active?.tagName==='BUTTON'&&body?.contains?.(active)?active.textContent:null,side=active?.dataset?.mergeSide,treeIndex=active?.dataset?.heapNode;ctx.edit(s=>{fn(s);if(ctx.p.topic==='heapsort'&&ctx.p.exercise==='extract'){s.answerMethod='interactive';s.response='';}advance(ctx.p,s);});const row=body?.querySelector('.sort-array');if(row)row.scrollLeft=left;let next;if(treeIndex!==undefined)next=body.querySelector('[data-heap-node="'+(ctx.s.sel[0]??treeIndex)+'"]');else if(side)next=[...body.querySelectorAll('[data-merge-side="'+side+'"]')].find(b=>!b.disabled);else if(id)next=body?.querySelector('[data-sort-id="'+id+'"]');else if(label)next=[...body.querySelectorAll('button')].find(b=>b.textContent===label&&!b.disabled);next?.focus({preventScroll:true});}
 function chooseKey(ctx,i){const t=task(ctx);if(!t||t.type!=='insert'||ctx.s.a[i]?.id!==t.keyId)return;const id=t.keyId;if(ctx.s.pick)return;commit(ctx,s=>{s.pick={id,index:i,at:s.log.length};s.sel=[i];},id);}
 function insertKey(ctx,from,to){
  const t=task(ctx),s=ctx.s,keyId=t?.keyId;
  if(!t||s.a[from]?.id!==keyId||!Number.isInteger(to)||to<t.lo||to>from)return ctx.msg('Choose a position to the left in this key’s active sequence, or use Undo to revise the insertion.');
  const id=keyId;commit(ctx,x=>{x.pick??={id,index:from,at:x.log.length};const key=x.a[from];for(let j=from;j>to;j--){x.a[j]=x.a[j-1];x.log.push([j,j-1]);}x.a[to]=key;x.sel=[to];x.insertPlaced=true;},id);
 }
 function exchange(ctx,a,b){
  const t=task(ctx),s=ctx.s;if(!t||!Number.isInteger(a)||!Number.isInteger(b)||a<t.lo||b<t.lo||a>t.hi||b>t.hi)return ctx.msg('Choose positions inside the active subarray.');
  const heap=ctx.p.cfg.mode==='heap';
  if(heap&&(a>=s.heapN||b>=s.heapN))return ctx.msg('The finalized suffix is outside the active max-heap.');
  if(t.type==='heapify'&&Math.floor((Math.max(a,b)-1)/2)!==Math.min(a,b))return ctx.msg('Choose a parent and one of its children in the active max-heap.');
   if(a===b)return;const id=s.a[heap?a:b].id,heapChild=heap&&t.type==='heapify'?(Math.floor((a-1)/2)===b?a:b):b;commit(ctx,x=>{[x.a[a],x.a[b]]=[x.a[b],x.a[a]];x.log.push([a,b]);if(t.type==='quick')(x.quickEvents??=[]).push({type:'swap',a,b});x.sel=heap&&t.type==='heapify'?[heapChild]:heap?[b]:[];if(heap){x.procedure.push({kind:'swap',a,b,size:x.heapN});if(t.type==='heapify'&&ctx.p.topic==='heapsort'&&ctx.p.exercise==='complete')x.heapTarget={id:x.a[heapChild].id,index:heapChild,at:x.log.length};if(t.type==='extract'){x.procedure.push({kind:'resize',from:x.heapN,to:x.heapN-1});x.heapN--;x.heapExtracted=true;x.sel=[];}}},id);
 }

 function workSelect(ctx,i){
  const t=task(ctx),s=ctx.s;if(!t||i<t.lo||i>t.hi)return;
  if(ctx.p.topic==='quicksort'&&t.type==='quick'&&['qLeft','qRight'].includes(s.qAction))return jumpPointer(ctx,s.qAction,i);
  if(t.type==='insert'){if(s.a[i].id===t.keyId){if(s.pick)insertKey(ctx,i,i);else chooseKey(ctx,i);}else if(s.pick)insertKey(ctx,s.a.findIndex(x=>x.id===s.pick.id),i);else ctx.msg('Select the highlighted key first, then choose where to insert it.');return;}
  if(t.type==='merge'||ctx.p.cfg.mode==='heap'&&i>=s.heapN)return;
  if(t.type==='quick'&&s.qAction==='pivot'){commit(ctx,x=>{x.pick={id:x.a[i].id,index:i,at:x.log.length};(x.quickEvents??=[]).push({type:'select',...x.pick});x.sel=[];x.qAction='exchange';if(ctx.p.topic==='quicksort')x.qPhase='pivot';},s.a[i].id);return;}
   if(t.type==='heapify'&&!s.pick){commit(ctx,x=>{x.pick={id:x.a[i].id,index:i,at:x.log.length};if(ctx.p.topic==='heapsort'&&ctx.p.exercise==='complete')x.heapTarget={...x.pick};x.sel=[i];},s.a[i].id);return;}
  if(s.sel.length===1&&s.sel[0]!==i)exchange(ctx,s.sel[0],i);else commit(ctx,x=>{x.sel=x.sel.includes(i)?[]:[i];},s.a[i].id);
 }
 function mergeModel(s,t){return{lo:t.lo,mid:t.mid,hi:t.hi,L:C.clone(s.a.slice(t.lo,t.mid+1)),R:C.clone(s.a.slice(t.mid+1,t.hi+1)),li:0,ri:0,out:[],takes:[]};}
  function bottomPassCount(p){return Math.ceil(Math.log2(Math.max(1,p.original.length)));}
  function bottomExpectedRows(p){const rows=[],count=bottomPassCount(p);for(let pass=1;pass<=count;pass++){const tasks=p.full.tasks.filter(t=>t.type==='merge'&&t.pass===pass);rows.push(tasks.length?tasks[tasks.length-1].expected.map(x=>x.id):(rows.at(-1)||p.original).map(x=>typeof x==='string'?x:x.id));}return rows;}
  function bottomInput(ctx,pass){if(pass===0)return ctx.p.original;const byId=new Map(ctx.p.original.map(item=>[item.id,item]));return ctx.s.bottomRows[pass-1].map(cell=>cell?byId.get(cell.id):null);}
   function bottomActivePass(ctx){const rows=ctx.s.bottomRows,count=bottomPassCount(ctx.p);if(ctx.s.bottomEditing!==null&&ctx.s.bottomEditing!==undefined)return ctx.s.bottomEditing;const pass=rows.length-1;return pass>=0&&pass<count&&rows[pass]?.some(cell=>!cell)?pass:null;}
  function bottomRun(index,pass){return Math.floor(index/(2**(pass+1)));}
  function bottomRevealNext(s,p,pass){const count=bottomPassCount(p);if(pass+1<count){s.bottomRows=s.bottomRows.slice(0,pass+1);s.bottomRows.push(Array(p.original.length).fill(null));}s.bottomEditing=null;s.bottomSelection=null;}
  function bottomPlace(ctx,pass,sourceIndex,destination){const p=ctx.p,s=ctx.s,active=bottomActivePass(ctx),n=p.original.length,row=s.bottomRows[pass],input=pass>=0?bottomInput(ctx,pass):null;if(pass!==active||!row||!Number.isInteger(sourceIndex)||!Number.isInteger(destination)||destination<0||destination>=n||!input?.[sourceIndex])return ctx.msg('Choose a value from the preceding array and an empty cell in this pass.','error');if(bottomRun(sourceIndex,pass)!==bottomRun(destination,pass))return ctx.msg('Use values from the input runs grouped above this output run.','error');if(row[destination])return ctx.msg('Choose an empty output cell.','error');if(row.some(cell=>cell?.from===sourceIndex))return ctx.msg('That source occurrence has already been used in this pass.','error');ctx.edit(next=>{const out=next.bottomRows[pass];out[destination]={id:input[sourceIndex].id,from:sourceIndex};next.bottomSelection=null;if(out.every(Boolean))bottomRevealNext(next,p,pass);});}
  function bottomSelectSource(ctx,pass,index){if(bottomActivePass(ctx)!==pass)return;const row=ctx.s.bottomRows[pass],input=bottomInput(ctx,pass);if(!input?.[index]||row.some(cell=>cell?.from===index))return;const current=ctx.s.bottomSelection;ctx.s.bottomSelection=current?.pass===pass&&current.index===index?null:{pass,index};ctx.render();}
  function bottomRemove(ctx,pass,index){const row=ctx.s.bottomRows[pass];if(!row?.[index])return;ctx.edit(s=>{s.bottomRows=s.bottomRows.slice(0,pass+1);s.bottomRows[pass][index]=null;s.bottomEditing=pass;s.bottomSelection=null;});}
  function bottomMove(ctx,pass,from,to){const p=ctx.p,s=ctx.s,row=s.bottomRows[pass],active=bottomActivePass(ctx);if(pass!==active||!row?.[from]||!Number.isInteger(to)||to<0||to>=row.length||from===to)return;if(bottomRun(from,pass)!==bottomRun(to,pass))return ctx.msg('Keep a placed value within its current output run.','error');ctx.edit(next=>{const out=next.bottomRows[pass],value=out[from];if(out[to]){out[from]=out[to];out[to]=value;}else{out[to]=value;out[from]=null;}next.bottomRows=next.bottomRows.slice(0,pass+1);next.bottomSelection=null;if(out.every(Boolean))bottomRevealNext(next,p,pass);else next.bottomEditing=pass;});}
  function bottomEditPass(ctx,pass){if(!ctx.s.bottomRows[pass]?.every(Boolean))return;ctx.edit(s=>{s.bottomRows=s.bottomRows.slice(0,pass+1);s.bottomEditing=pass;s.bottomSelection=null;});}
  function bottomContinue(ctx,pass){if(!ctx.s.bottomRows[pass]?.every(Boolean))return;ctx.edit(s=>bottomRevealNext(s,ctx.p,pass));}
  function bottomGrade(ctx){const expected=bottomExpectedRows(ctx.p),rows=ctx.s.bottomRows;if(rows.length!==expected.length||rows.some(row=>!row||row.some(cell=>!cell)))return{ok:false,message:'Complete every required bottom-up pass before checking.'};for(let pass=0;pass<expected.length;pass++)if(rows[pass].some((cell,i)=>cell.id!==expected[pass][i]))return{ok:false,message:'One or more passes is incorrect. Review each run and its stable merge order.'};return{ok:true,message:'Correct. Every bottom-up pass and the final sorted array are valid.'};}
 function takeHead(ctx,side){if(independent(ctx.p))return;const t=task(ctx);if(t?.type!=='merge'||!['L','R'].includes(side))return;const m=ctx.s.merge||mergeModel(ctx.s,t),at=side==='L'?m.li:m.ri;if(!m[side][at])return;
  commit(ctx,s=>{s.merge??=mergeModel(s,t);const b=s.merge,k=side==='L'?'li':'ri',value=b[side][b[k]++];b.out.push({...value});b.takes.push({side,id:value.id});});
 }
 function quickAction(ctx,action){const t=task(ctx);if(t?.type!=='quick')return;
  if(action==='pivot')return commit(ctx,s=>{s.qAction='pivot';if(ctx.p.topic==='quicksort')s.qPhase='arrange';s.sel=[];});
  if(action==='exchange')return commit(ctx,s=>{s.qAction='exchange';s.sel=[];});
  if(action==='mark'){if(!ctx.s.pick)return ctx.msg('Select your pivot first.');return commit(ctx,s=>{s.boundary=s.a.findIndex(x=>x.id===s.pick.id);(s.quickEvents??=[]).push({type:'mark',boundary:s.boundary});s.sel=[];});}
  const s=ctx.s,pivot=s.pick?s.a.findIndex(x=>x.id===s.pick.id):-1;
  if(pivot<0)return ctx.msg('Select your pivot first.');
  if(action==='park'){const to=t.hi-1;commit(ctx,x=>{(x.quickEvents??=[]).push({type:'park',from:pivot,to});if(pivot!==to){[x.a[pivot],x.a[to]]=[x.a[to],x.a[pivot]];x.log.push([pivot,to]);}x.qLeft=t.lo;x.qRight=t.hi-1;if(ctx.p.topic==='quicksort')x.qPhase='partition';x.sel=[];});}
  else if(action==='restore'){const to=s.qLeft??t.lo;commit(ctx,x=>{(x.quickEvents??=[]).push({type:'restore',from:pivot,to});if(pivot!==to){[x.a[pivot],x.a[to]]=[x.a[to],x.a[pivot]];x.log.push([pivot,to]);}if(ctx.p.topic==='quicksort')x.qPhase='restored';x.sel=[];});}
 }
 function pointerMove(ctx,key,delta){const t=task(ctx);if(t?.type!=='quick')return;commit(ctx,s=>{const initial=key==='qLeft'?t.lo:ctx.p.cfg.rule==='median3'?t.hi-1:t.lo;const from=s[key]??initial;s[key]=Math.max(t.lo,Math.min(t.hi,from+delta));const scan={pointer:key,from,to:s[key],at:s.log.length};(s.scans??=[]).push(scan);(s.quickEvents??=[]).push({type:'scan',...scan});});}
 function workTiles(ctx){
  const s=ctx.s,t=task(ctx),mode=ctx.p.cfg.mode,row=E('div',undefined,'nl-tiles sort-array');
   const insertion=mode==='insertion',zeroBased=insertion||['heapsort','quicksort'].includes(ctx.p.topic),showIds=!insertion||new Set(ctx.p.original.map(x=>x.key)).size<ctx.p.original.length,heapComplete=ctx.p.topic==='heapsort'&&ctx.p.exercise==='complete';
  row.setAttribute('aria-label',insertion?'Student array; zero-based indices':'Student array; positions are one-based');
  const keyId=t?.type==='insert'?t.keyId:null;
  const fixed=new Set(s.ledger.filter(x=>x.task?.type==='quick').map(x=>x.work.boundary));
  s.a.forEach((item,i)=>{
   const active=!!t&&i>=t.lo&&i<=t.hi&&(mode!=='heap'||i<s.heapN),key=active&&item.id===keyId;
   let cls='nl-tile'+(!active?' nl-inactive':'')+(s.sel.includes(i)?' selected':'');
   if(mode==='heap'&&i>=s.heapN)cls+=' nl-sorted';
   if(t?.type==='insert'&&active&&!key)cls+=' sort-prefix';if(key)cls+=' sort-key';if(fixed.has(i))cls+=' sort-fixed';if(t?.type==='quick'&&s.pick?.id===item.id)cls+=' sort-key';
    const b=K.button(insertion||ctx.p.topic?String(item.key):itemText(item),()=>workSelect(ctx,i),cls);b.dataset.sortIndex=i;b.dataset.sortId=item.id;b.disabled=!active||t?.type==='merge';b.setAttribute('aria-label',(zeroBased?'Index '+i:'Position '+(i+1))+', '+item.key+', item '+item.id+(key?', current key':''));b.setAttribute('aria-pressed',String(heapComplete?s.sel.includes(i):s.pick?.id===item.id||s.sel.includes(i)));
   b.appendChild(E('small','['+(zeroBased?i:i+1)+']'+((insertion&&showIds||ctx.p.topic==='quicksort'&&t?.type==='insert'&&new Set(ctx.p.original.map(x=>x.key)).size<ctx.p.original.length)?' · '+item.id:'')));
    if(key)b.appendChild(E('span','KEY','sort-role'));else if(fixed.has(i))b.appendChild(E('span','fixed pivot','sort-role'));if(heapComplete&&s.heapTarget?.index===i)b.appendChild(E('span','heapify node','sort-role sort-heap-target'));
   if(t?.type==='quick'){const names=[];if(s.pick?.id===item.id)names.push('PIVOT');if(i===t.lo)names.push('left');if(i===t.hi)names.push('right');if(ctx.p.cfg.rule==='median3'&&i===Math.floor((t.lo+t.hi)/2))names.push('center');if(i===(s.qLeft??t.lo))names.push('i');if(i===(s.qRight??(ctx.p.cfg.rule==='median3'?t.hi-1:t.lo)))names.push('j');if(names.length)b.appendChild(E('span',names.join(' / '),'sort-role'));}
   if(active&&t.type!=='merge'){b.onpointerdown=e=>{if(e.button>0)return;drag={ctx,i,x:e.clientX,y:e.clientY,moved:false,workbench:true,kind:'array',problem:ctx.p,pass:s.index};if(e.pointerType!=='touch'||key)e.preventDefault();};b.onclick=e=>{if(e.detail===0)workSelect(ctx,i);};}
   row.appendChild(b);
  });return row;
 }
 function renderInsertion(ctx){if(ctx.p.cfg.mode!=='insertion')return renderCutoffInsertion(ctx);const s=ctx.s,t=task(ctx),keep=K.button('Keep Key Here',()=>insertKey(ctx,t.pickIndex,t.pickIndex));keep.dataset.insKeep='true';ctx.ui.body.append(E('h3','Pass '+t.pass+' of '+ctx.p.tasks.length),E('p','Sorted prefix: indices 0–'+(t.pickIndex-1)+'. Select the key and place it, or record that it stays here.','nl-help'),workTiles(ctx),keep);}
 function renderCutoffInsertion(ctx){const s=ctx.s,t=task(ctx);ctx.ui.body.append(E('h3',t.label+' · checkpoint '+(s.index+1)+' / '+ctx.p.tasks.length),E('p','Insert the highlighted key into the sorted portion on its left.','sort-instruction'),E('p','Active positions '+(t.lo+1)+'–'+(t.hi+1)+'. Previously sorted prefix: '+(t.lo+1)+'–'+t.pickIndex+'. Later elements are dimmed.','nl-help'),E('p',s.pick?'Key selected. Click an earlier position or drag the key there; intervening items shift right. Each placement records this pass and opens the next one. Click the selected key again to leave it in place. Use Undo to revise a placement.':'Click the outlined key to select it, or drag it directly to a position on its left. Click the selected key again to leave it in place and record the pass.','nl-help'),workTiles(ctx));}
 function renderMerge(ctx){
  const s=ctx.s,t=task(ctx),bottom=ctx.p.cfg.mode==='mergeBottom',body=ctx.ui.body,m=s.merge||mergeModel(s,t),width=2**(t.pass-1);
  body.append(E('h3',bottom?'Bottom-up pass '+t.pass+' · run width '+width:t.label),E('p','Merge positions '+(t.lo+1)+'–'+(t.mid+1)+' with '+(t.mid+2)+'–'+(t.hi+1)+'. Choose each next output item yourself. Equal keys must retain left-before-right identity.','sort-instruction'));
  if(bottom){const strips=E('div',undefined,'nl-bag');for(let w=1;w<s.a.length;w*=2)strips.appendChild(E('span','width '+w,w===width?'sort-active-range':''));body.append(strips);for(let lo=0;lo<s.a.length;lo+=2*width)if(lo+width>=s.a.length)body.appendChild(E('p','Unpaired run ['+(lo+1)+'–'+s.a.length+'] carries forward unchanged in this width pass.','nl-help'));}
  body.append(E('p','Array after your recorded operations; construct this merge in the output area below. A filled output is placed automatically.','nl-help'),workTiles(ctx));
  renderMergeRuns(ctx,t,m);
 }

 function renderMergeRuns(ctx,t,m,im=false){const s=ctx.s,body=ctx.ui.body;
  const grid=E('div',undefined,'sort-merge-grid');for(const side of ['L','R']){const consumed=side==='L'?m.li:m.ri,panel=E('section',undefined,'nl-panel');panel.appendChild(E('h4',side==='L'?'Left sorted run':'Right sorted run'));const row=E('div',undefined,'nl-tiles sort-run');m[side].forEach((item,i)=>{const head=i===consumed,b=K.button(itemText(item),()=>takeHead(ctx,side),'nl-tile'+(i<consumed?' sort-consumed':head?' sort-run-head':' sort-waiting'));b.disabled=!head;b.dataset.mergeSide=side;b.dataset.mergeItem=item.id;b.appendChild(E('small',i<consumed?'consumed':head?'take this head':'remaining'));if(head){keepVisible(b);b.onpointerdown=e=>{if(e.button>0)return;drag={ctx,side,x:e.clientX,y:e.clientY,moved:false,workbench:true,kind:'merge',problem:ctx.p,pass:s.index,mergeToken:im?m.eventIndex:undefined};e.preventDefault();};b.onclick=e=>{if(e.detail===0)takeHead(ctx,side);};}row.appendChild(b);});panel.appendChild(row);if(consumed===m[side].length)panel.appendChild(E('p','Run exhausted.','nl-help'));grid.appendChild(panel);}body.appendChild(grid);
  const out=E('section',undefined,'nl-panel sort-merge-output');out.dataset.mergeOutput='true';out.append(E('h4','Your merged output · '+m.out.length+' / '+(t.hi-t.lo+1)),E('p','Click either run head, or drag a head into this area. When filled, your output is placed automatically. Choices are graded only with Check Final Answer.','nl-help'));const row=E('div',undefined,'nl-tiles');for(let i=0;i<=t.hi-t.lo;i++)row.appendChild(E('div',m.out[i]?itemText(m.out[i]):'—','nl-tile'+(m.out[i]?'':' sort-empty')));out.appendChild(row);body.appendChild(out);
 }
   function renderBottomWorksheet(ctx,solution=false){
    const p=ctx.p,s=ctx.s,n=p.original.length,passCount=bottomPassCount(p),body=solution?E('div',undefined,'mb-worksheet mb-solution'):ctx.ui.body,byId=new Map(p.original.map(item=>[item.id,item])),rows=solution?bottomExpectedRows(p).map(ids=>ids.map(id=>({id}))):s.bottomRows,active=solution?null:bottomActivePass(ctx),editing=solution?null:s.bottomEditing;
    if(!solution){body.classList.add('mb-worksheet');body.append(E('p','Drag a value from the row above, or click it and then an empty cell. Each occurrence can be used once per run. Click a placed value to remove it; use Edit to revise a completed pass.','mb-instructions'));}
    function addRow(title,values,{original=false,pass=-1,sourceFor=null,editable=false,answer=false}={}){
      const section=E('section',undefined,'mb-row'),head=E('div',undefined,'mb-row-head');head.append(E('strong',title));
      const complete=answer&&values.every(Boolean);
      if(!solution&&answer&&complete&&editing===pass)head.append(K.button(pass+1<passCount?'Continue':'Finish editing',()=>bottomContinue(ctx,pass),'mb-row-edit'));
      else if(!solution&&answer&&complete)head.append(K.button('Edit',()=>bottomEditPass(ctx,pass),'mb-row-edit'));
      else if(!solution&&answer&&editing===pass)head.append(E('span','Editing','mb-editing'));
      section.append(head);const list=E('div',undefined,'mb-run-list'),runSize=original?1:2**(pass+1),usedRow=sourceFor!==null?s.bottomRows[sourceFor]:null,used=usedRow?new Set(usedRow.filter(Boolean).map(cell=>cell.from)):new Set();
      for(let lo=0,run=0;lo<n;lo+=runSize,run++){const hi=Math.min(n,lo+runSize),group=E('div',undefined,'mb-run-group'+(original?' mb-original-group':''));group.setAttribute('aria-label',original?'Original array':('Output run '+(run+1)+', positions '+(lo+1)+' through '+hi));
        for(let i=lo;i<hi;i++){
          const slot=answer?values[i]:null,item=original?values[i]:answer?(slot?byId.get(slot.id):null):values[i],isSource=sourceFor!==null&&sourceFor===active,sourceUsed=isSource&&used.has(i),empty=answer&&!item,selected=isSource&&s.bottomSelection?.pass===sourceFor&&s.bottomSelection.index===i,isEditable=answer&&editable,tag=isSource||isEditable?'button':'div',cell=E(tag,undefined,'mb-cell'+(empty?' is-empty':'')+(sourceUsed?' is-used':'')+(selected?' selected':''));if(tag==='button')cell.type='button';
          cell.append(E('span',item?String(item.key):'', 'mb-value'),E('small',String(i+1),'mb-position'));if(sourceUsed)cell.append(E('small','used','mb-use'));
          if(isSource){cell.classList.add('mb-source');cell.dataset.mbKind='source';cell.dataset.mbPass=String(sourceFor);cell.dataset.mbIndex=String(i);cell.disabled=sourceUsed;cell.setAttribute('aria-label','Position '+(i+1)+', '+item.key+(sourceUsed?', already used in this pass':', source value'));cell.setAttribute('aria-pressed',String(!!selected));cell.onclick=()=>bottomSelectSource(ctx,sourceFor,i);cell.draggable=!sourceUsed;cell.ondragstart=e=>{if(sourceUsed){e.preventDefault();return;}s.bottomSelection={pass:sourceFor,index:i};cell.classList.add('selected');e.dataTransfer?.setData('text/plain',JSON.stringify({kind:'source',pass:sourceFor,index:i}));if(e.dataTransfer)e.dataTransfer.effectAllowed='copy';};}
          else if(isEditable){cell.dataset.mbKind='answer';cell.dataset.mbPass=String(pass);cell.dataset.mbIndex=String(i);cell.setAttribute('aria-label',empty?'Empty output position '+(i+1):'Position '+(i+1)+', '+item.key+', click to remove');if(empty)cell.onclick=()=>{const pick=s.bottomSelection;if(pick?.pass===pass)bottomPlace(ctx,pass,pick.index,i);else ctx.msg('Select a value from the preceding array first.');};else{cell.draggable=true;cell.onclick=()=>bottomRemove(ctx,pass,i);cell.ondragstart=e=>{e.dataTransfer?.setData('text/plain',JSON.stringify({kind:'placed',pass,index:i}));if(e.dataTransfer)e.dataTransfer.effectAllowed='move';};}
            cell.ondragover=e=>{e.preventDefault();cell.classList.add('drop-ready');};cell.ondragleave=()=>cell.classList.remove('drop-ready');cell.ondrop=e=>{e.preventDefault();cell.classList.remove('drop-ready');let data;try{data=JSON.parse(e.dataTransfer?.getData('text/plain')||'{}');}catch{return;}if(data.kind==='source')bottomPlace(ctx,pass,data.index,i);else if(data.kind==='placed'&&data.pass===pass)bottomMove(ctx,pass,data.index,i);};}
          group.append(cell);
        }
        list.append(group);
      }
      section.append(list);body.append(section);
    }
    addRow('Original Array',p.original,{original:true,sourceFor:!solution&&active===0?0:null});
    rows.forEach((row,pass)=>{const title='Pass '+(pass+1)+' — width '+(2**pass);addRow(title,row,{pass,answer:true,editable:!solution&&active===pass,sourceFor:!solution&&active===pass+1?active:null});});
    return body;
  }function renderHeapTree(ctx){const s=ctx.s,a=[null,...s.a.slice(0,s.heapN).map(x=>x.key)],m=BHCore.treePositions(a),wrap=E('div',undefined,'tree-scroll'),canvas=E('div',undefined,'tree');wrap.dataset.width=m.width;wrap.dataset.height=m.height;wrap.style.height=m.height+'px';canvas.style.width=m.width+'px';canvas.style.height=m.height+'px';const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('width',m.width);svg.setAttribute('height',m.height);for(const edge of m.edges){const line=document.createElementNS(ns,'line');for(const[k,v]of Object.entries({x1:edge.a.x,y1:edge.a.y+16,x2:edge.b.x,y2:edge.b.y-16,stroke:'#45564C'}))line.setAttribute(k,v);svg.appendChild(line);}canvas.appendChild(svg);for(const node of m.items){const i=node.index-1,b=K.button(itemText(s.a[i]),()=>workSelect(ctx,i),'bh-dot'+(s.sel.includes(i)?' bh-selected':''));b.dataset.heapNode=i;b.style.left=node.x+'px';b.style.top=node.y+'px';canvas.appendChild(b);}wrap.appendChild(canvas);ctx.ui.body.appendChild(wrap);requestAnimationFrame(fitTrees);}
 function renderHeap(ctx){const s=ctx.s,t=task(ctx),extract=t.type==='extract',tools=E('div',undefined,'nl-tools');
  ctx.ui.body.append(E('h3',extract?'Extract maximum':'Restore max-heap order'),E('p','MAX-HEAP · ascending heapsort. Active heap: positions 1–'+s.heapN+'. Finalized suffix: '+(s.heapN<s.a.length?(s.heapN+1)+'–'+s.a.length:'empty')+'.','sort-instruction'),E('p','The starting array is a prebuilt max-heap. All exchanges and boundary changes are recorded; correctness is checked only on final submission.','nl-help'));
  ctx.ui.body.appendChild(E('p',extract?'Choose the root and last active item by clicking them, or drag one onto the other. Your exchange automatically reduces the active heap by one.':'Continue percolating the replacement root downward: click or drag between a parent and your chosen child. When the active heap is restored, the next extraction opens automatically. Use Undo to revise an operation.','nl-help'));
  tools.appendChild(K.button(s.tree?'Hide max-heap tree':'Show max-heap tree',()=>commit(ctx,x=>{x.tree=!x.tree;})));ctx.ui.body.append(tools,workTiles(ctx));if(s.tree)renderHeapTree(ctx);
 }
 function renderQuick(ctx){
  const t=task(ctx),s=ctx.s,tools=E('div',undefined,'nl-tools'),left=s.qLeft??t.lo,right=s.qRight??t.hi-1,pivot=s.pick?s.a.find(x=>x.id===s.pick.id):null;
  ctx.ui.body.append(E('h3','Partition ['+(t.lo+1)+'–'+(t.hi+1)+'] · median of three'),E('p','Arrange left / center / right; choose the median pivot, park it at right − 1, partition using strict scans, restore the pivot, and mark its final position.','sort-instruction'));
  tools.append(K.button('Arrange / exchange partition items',()=>quickAction(ctx,'exchange')),K.button('Select median pivot from array',()=>quickAction(ctx,'pivot')),K.button('Park selected pivot at right − 1',()=>quickAction(ctx,'park')));
  ctx.ui.body.append(tools,E('p','Current interaction: '+(s.qAction==='pivot'?'click your chosen pivot':'click two values, or drag between them, to exchange')+'. Selected pivot: '+(pivot?itemText(pivot):'not selected')+'.','nl-output'),workTiles(ctx));
  const pointers=E('div',undefined,'nl-panel');pointers.appendChild(E('p','Left scan i = '+(left+1)+'; right scan j = '+(right+1)+'. Move the scan pointers yourself.','nl-help'));const controls=E('div',undefined,'nl-tools');
  controls.append(K.button('Advance i →',()=>pointerMove(ctx,'qLeft',1)),K.button('Advance j ←',()=>pointerMove(ctx,'qRight',-1)),K.button('Exchange scan positions i and j',()=>exchange(ctx,left,right)),K.button('Restore pivot at scan i',()=>quickAction(ctx,'restore')),K.button('Mark pivot’s final position',()=>quickAction(ctx,'mark')));pointers.appendChild(controls);ctx.ui.body.appendChild(pointers);
 }
 function partitionHistory(ctx){const previous=ctx.s.ledger.filter(x=>x.task?.type==='quick');if(previous.length){ctx.ui.body.appendChild(E('p','Recorded partitions and recursive subproblems (left first). Fixed pivots are marked in the array; inactive positions are dimmed.','nl-help'));ctx.ui.body.appendChild(K.list(previous.map(x=>{const p=x.task,b=x.work.boundary;return'['+(p.lo+1)+'–'+(p.hi+1)+'] → pivot at '+(b+1)+', left '+(b>p.lo?'['+(p.lo+1)+'–'+b+']':'empty')+', right '+(b<p.hi?'['+(b+2)+'–'+(p.hi+1)+']':'empty')+'.';})));}}
 const presentedKeys=new WeakMap();
 function showCurrentKey(ctx){const key=ctx.ui.body.querySelector('.sort-array .sort-key');if(!key)return;const previous=presentedKeys.get(ctx),token=[ctx.p,ctx.s.index,key.dataset.sortId];if(previous&&previous.every((x,i)=>x===token[i]))return;presentedKeys.set(ctx,token);keepVisible(key);}
 function renderWorkbench(ctx){const mode=ctx.p.cfg.mode,t=task(ctx);for(const control of [ctx.ui.hints,ctx.ui.validate])if(control?.parentElement)control.parentElement.hidden=true;
  if(independent(ctx.p)){renderRecursiveWorksheet(ctx);return;}
  // Workbench transitions record the student's work without grading it.
  if(mode!=='heapSnapshots'){ctx.ui.hints.disabled=true;ctx.ui.validate.disabled=true;}
  if(mode==='heapSnapshots'){renderSnapshot(ctx);return;}
  if(!t&&mode==='insertion'){ctx.ui.body.append(E('h3','All '+ctx.p.tasks.length+' passes recorded'),workTiles(ctx));return;}
  if(!t){ctx.ui.body.append(E('h3','Requested operations recorded'),E('p','Press Check Final Answer to submit the exercise.','sort-instruction'),workTiles(ctx));return;}
  if(t.type==='insert')renderInsertion(ctx);else if(t.type==='merge')renderMerge(ctx);else if(mode==='heap')renderHeap(ctx);else if(mode==='quick')renderQuick(ctx);if(mode==='quick')partitionHistory(ctx);showCurrentKey(ctx);
 }
 function workPointerUp(d,e){const ctx=d.ctx;if(ctx.p!==d.problem||ctx.s.index!==d.pass)return;if(independent(ctx.p)&&d.mergeToken!==ctx.s.im.merge?.eventIndex)return;const target=document.elementFromPoint(e.clientX,e.clientY);if(d.kind==='merge'){if(!d.moved||target?.closest('[data-merge-output]')&&ctx.ui.body.contains(target))takeHead(ctx,d.side);return;}
  if(!d.moved){workSelect(ctx,d.i);return;}const tile=target?.closest('[data-sort-index]');if(!tile||!ctx.ui.body.contains(tile))return;const to=Number(tile.dataset.sortIndex),t=task(ctx);
  if(t.type==='insert'){if(ctx.s.a[d.i]?.id===t.keyId)insertKey(ctx,d.i,to);}
  else if(ctx.p.cfg.mode==='heap'){exchange(ctx,d.i,to);}else if(t.type==='quick')exchange(ctx,d.i,to);
 }

 function snapshotProblem(cfg){
  cfg={...cfg};if(cfg.snapshotAt==='build')throw Error('Construction-only snapshots are not an exercise.');const r=C.rng(cfg.seed+':heapSnapshots-v2'),range={easy:[5,7],medium:[8,11],hard:[12,16]}[cfg.difficulty],hard=cfg.difficulty==='hard',int=(a,b)=>a+Math.floor(r()*(b-a+1));
  if(hard&&['one','two','three'].includes(cfg.snapshotAt))cfg.snapshotAt='random';
  const direction=cfg.sortDirection==='random'||!cfg.sortDirection?(r()<.5?'ascending':'descending'):cfg.sortDirection,heapType=direction==='ascending'?'max':'min';
  let original,n,extractions,snapshot,attempts;
  for(let attempt=0;attempt<240;attempt++){
   n=attempt===239&&hard?16:int(Math.max(range[0],({four:5,five:6,six:7}[cfg.snapshotAt]||range[0])),range[1]);original=C.input(cfg.seed+':candidate-'+attempt,n,'random');
   if(cfg.snapDuplicates&&r()<.45)original[n-1].key=original[n-2].key;
   if(hard&&(attempt===239||r()<.5)){original.sort((a,b)=>direction==='ascending'?a.key-b.key:b.key-a.key);if(attempt!==239)for(let i=0;i<2;i++){const a=int(0,n-1),b=int(0,n-1);[original[a],original[b]]=[original[b],original[a]];}}
   if(attempt===239&&hard)original=Array.from({length:16},(_,i)=>({id:String.fromCharCode(65+i),key:direction==='ascending'?i+1:16-i}));
   const counts={one:1,two:2,three:3,four:4,five:5,six:6,final:n-1},pool=hard?[4,5,6,n-1]:cfg.difficulty==='medium'?[1,2,3]:[1,2];
   extractions=Object.hasOwn(counts,cfg.snapshotAt)?Math.min(n-1,counts[cfg.snapshotAt]):pool[int(0,pool.length-1)];snapshot=C.heapSnapshots(original,direction,extractions);attempts=attempt+1;
   if(C.snapshotDemand(cfg.difficulty,snapshot))break;
  }
  if(!C.snapshotDemand(cfg.difficulty,snapshot))throw Error('Could not construct a calibrated heapsort snapshot.');
  const stage=extractions===n-1?'after all '+extractions+' completed extractions (the final sorted array)':'after '+extractions+' completed extraction '+(extractions===1?'iteration':'iterations');
  return{cfg,kind:'heapSnapshots',original:C.clone(snapshot.built),tasks:[],snapshot,heapType,complexity:snapshot.work,attempts,title:'Heapsort Snapshots · '+direction,question:'Using standard in-place heapsort with a '+heapType+'-heap for '+direction+' order, show the complete array '+stage+'.',contract:'A valid starting '+heapType+'-heap is supplied. Each counted extraction exchanges root/last active element, shrinks the heap, then restores heap order. Choose the left child on equal-child ties; do not swap equal parent/child values. Equal-valued item identities are interchangeable. Submit the complete array; edits are not graded.'+(hard?' Hard snapshots require at least four extractions. 1–3 extraction practice is available on Easy and Medium.':''),initial:{a:C.clone(snapshot.built),sel:[],heapN:snapshot.heapN,dragMode:'swap',bars:false}};
 }
 function renderSnapshot(ctx){
  const p=ctx.p,s=ctx.s,n=p.original.length,size=p.snapshot.heapN,tools=E('div',undefined,'nl-tools');
  ctx.ui.body.appendChild(E('p','Checkpoint: after '+p.snapshot.extractions+' complete extraction(s), including heap restoration after the last exchange and size reduction.','sort-instruction'));
  const stageControl=ctx.ui.extra.snapshotAt;for(const option of stageControl.options)option.disabled=p.cfg.difficulty==='hard'&&['one','two','three'].includes(option.value);stageControl.value=p.cfg.snapshotAt||'random';
  tools.append(K.field('Drag behavior',K.select([['swap','Swap'],['move','Move / shift']],s.dragMode,v=>ctx.edit(x=>{x.dragMode=v;}))));
  ctx.ui.body.append(E('h3','Your complete snapshot'),E('p','Given starting heap: ['+p.original.map(x=>x.key).join(', ')+']','nl-output'),E('p','Requested boundary: active '+p.heapType+'-heap at positions 1–'+size+'; '+(size===n?'sorted suffix is empty.':'sorted suffix at positions '+(size+1)+'–'+n+'.')+(size===1?' The remaining root is also in its final sorted position.':''),'nl-help'),E('p','Click two values to swap, or drag between positions. The suffix shading marks the requested boundary and does not check your entries.','nl-help'),tools,tiles(ctx,s.a,null));
 }
 function division(l,r){if(l===r)return'['+(l+1)+']';const m=Math.floor((l+r)/2);return'['+(l+1)+'–'+(r+1)+'] → ('+division(l,m)+' | '+division(m+1,r)+')';}
 function select(ctx,i){if(ctx.p.cfg.mode!=='heapSnapshots')return workSelect(ctx,i);if(ctx.p.cfg.mode==='heapSnapshots'&&ctx.s.sel.length===1&&ctx.s.sel[0]!==i){ctx.perform(s=>rawSwap(ctx,s,s.sel[0],i));return;}ctx.edit(s=>{s.sel=s.sel.includes(i)?s.sel.filter(j=>j!==i):s.sel.length===2?[i]:[...s.sel,i];});}
 function rawSwap(ctx,s,a,b){
  if(ctx.p.cfg.mode==='heapSnapshots'){if(!Number.isInteger(a)||!Number.isInteger(b)||a===b||a<0||b<0||a>=s.a.length||b>=s.a.length)return{ok:false,message:'Choose two positions.'};[s.a[a],s.a[b]]=[s.a[b],s.a[a]];s.sel=[];return{ok:true,message:'Swap recorded.'};}
  const t=ctx.p.tasks[s.index];if(!t||t.type==='merge'||!Number.isInteger(a)||!Number.isInteger(b)||a===b||a<0||b<0||a>=s.a.length||b>=s.a.length)return{ok:false,message:'Choose two usable items for this task.'};
  const before=C.clone(s.a);[s.a[a],s.a[b]]=[s.a[b],s.a[a]];s.log.push([a,b]);s.sel=[b];let valid;
  if(t.type==='insert'){const lo=Math.min(a,b),hi=Math.max(a,b);valid=s.pick?.id===t.keyId&&hi===lo+1&&before[hi].id===t.keyId&&before[lo].key>before[hi].key&&lo>=t.lo;}
  else{const want=t.swaps[s.log.length-1];valid=!!want&&((want[0]===a&&want[1]===b)||(want[1]===a&&want[0]===b));if(t.type==='quick'&&s.log.length>t.prep)valid=valid&&s.pick?.id===t.pivotId&&s.pick.at===t.prep;if(t.type==='heapify')valid=valid&&s.pick?.index===t.pickIndex;}
  return{ok:valid,message:valid?'Swap recorded.':'That swap does not follow the current comparison procedure.'};
 }
 function move(ctx,s,from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||from===to)return{ok:false,message:'Choose the source and destination.'};let ok=true;const direction=to>from?1:-1;for(let i=from;i!==to;i+=direction)ok=rawSwap(ctx,s,i,i+direction).ok&&ok;return{ok,message:ok?'Move recorded as adjacent shifts.':'This move crosses positions outside the permitted insertion shifts.'};}
 function tiles(ctx,a,t){const wrap=E('div',undefined,'nl-tiles');a.forEach((item,i)=>{const b=K.button(item.key+'·'+item.id,()=>select(ctx,i),'nl-tile'+(ctx.s.sel.includes(i)?' selected':'')+(t&&(i<t.lo||i>t.hi)?' nl-inactive':'')+(['heap','heapSnapshots'].includes(ctx.p.cfg.mode)&&i>=ctx.s.heapN?' nl-sorted':''));b.appendChild(E('small','['+(i+1)+']'));b.dataset.sortIndex=i;b.onpointerdown=e=>{if(e.button>0)return;drag={ctx,i,x:e.clientX,y:e.clientY,moved:false};e.preventDefault();};b.onclick=e=>{if(e.detail===0)select(ctx,i);};if(ctx.s.bars){const bar=E('span',undefined,'nl-bar');bar.style.height=Math.max(8,item.key/Math.max(...a.map(x=>x.key))*120)+'px';b.prepend(bar);}wrap.appendChild(b);});return wrap;}
 let drag=null;window.addEventListener('pointermove',e=>{if(drag&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8)drag.moved=true;});window.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;if(d.topicDirect){if(d.ctx.p!==d.problem)return;if(!d.moved)directSortSelect(d.ctx,d.i);else{const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-direct-index]');if(el&&d.ctx.ui.body.contains(el)){const j=Number(el.dataset.directIndex);d.ctx.edit(s=>{[s.a[d.i],s.a[j]]=[s.a[j],s.a[d.i]];s.sel=[];s.response=s.a.map(x=>x.key).join(', ');s.answerMethod='direct';});}}return;}if(d.workbench){workPointerUp(d,e);return;}const target=d.moved?document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-sort-index]'):null;if(!d.moved)select(d.ctx,d.i);else if(target){const j=Number(target.dataset.sortIndex);d.ctx.perform(s=>s.dragMode==='move'?move(d.ctx,s,d.i,j):rawSwap(d.ctx,s,d.i,j));}});window.addEventListener('pointercancel',()=>drag=null);
 for(const opt of adapter.options)opt.hideModes=['heapSnapshots'];
 adapter.options.push({key:'sortDirection',label:'Sort direction',modes:['heapSnapshots'],values:[['random','Mixed directions'],['ascending','Ascending · max-heap'],['descending','Descending · min-heap']]},{key:'snapshotAt',label:'Requested snapshot',modes:['heapSnapshots'],values:[['random','Mixed snapshots'],['one','After 1 extraction'],['two','After 2 extractions'],['three','After 3 extractions'],['four','After 4 extractions'],['five','After 5 extractions'],['six','After 6 extractions'],['final','Final sorted array']]},{key:'snapDuplicates',label:'Duplicate values',modes:['heapSnapshots'],value:false});
 const pages={};let ctx;
 if(typeof document.getElementById==='function'){
  for(const topic of Object.keys(SortingTopics.meta))pages[topic]=createSortingTopic(topic);
  ctx=pages.insertion;
  document.addEventListener('keydown',e=>{const page=pages.quicksort;if(document.getElementById('quicksortSection').hidden||e.defaultPrevented||e.target?.matches?.('input,select,textarea,[contenteditable="true"]'))return;if(e.key==='Escape'){page.s.sel=[];page.s.qAction='exchange';page.render();}const key=page.s.qAction;if((key==='qLeft'&&e.key==='ArrowRight')||(key==='qRight'&&e.key==='ArrowLeft')){e.preventDefault();pointerMove(page,key,key==='qLeft'?1:-1);}});
 }else ctx=K.create('sorting',"Sorting Algorithms",'',adapter);
 return{get ctx(){return typeof activeSection==='string'&&pages[activeSection]||ctx;},pages,adapter,snapshotProblem,independent:IndependentMerge,flow:{task:currentTask,advance,grade:gradeProcedure,heapEvidence},actions:{select:workSelect,insert:insertKey,exchange,take:takeHead,quick:quickAction,pointer:pointerMove,jump:jumpPointer,imSelect,imSplit,imBegin},cancel:()=>{drag=null;}};
})();


/* Drawing and inspection only: no MST calculation or answer-state changes. */
const GraphEdgeInspection=(()=>{
 let serial=0;
 function install(svg,records){if(!records.length)return;const ns='http://www.w3.org/2000/svg',defs=svg.querySelector('defs')||svg.insertBefore(document.createElementNS(ns,'defs'),svg.firstChild),marker=document.createElementNS(ns,'marker'),markerId='q2-inspect-arrow-'+(++serial);for(const [k,v]of Object.entries({id:markerId,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto'}))marker.setAttribute(k,v);const tip=document.createElementNS(ns,'path');tip.setAttribute('d','M 0 0 L 10 5 L 0 10 z');tip.setAttribute('fill','#bdd8cd');marker.append(tip);defs.append(marker);
  const overlay=document.createElementNS(ns,'g');overlay.classList.add('q2-edge-inspection-overlay');overlay.setAttribute('pointer-events','none');svg.append(overlay);let active=null;
  const raisedLabel=record=>{
   const label=record.labelGroup?.cloneNode(true)||document.createElementNS(ns,'g');
   if(!record.labelGroup){if(record.rect)label.append(record.rect.cloneNode(true));if(record.text)label.append(record.text.cloneNode(true));}
   label.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
   const rect=label.querySelector('rect'),text=label.querySelector('text');
   if(rect){for(const key of ['x','y'])rect.setAttribute(key,String(Number(rect.getAttribute(key)||0)-2));for(const key of ['width','height'])rect.setAttribute(key,String(Number(rect.getAttribute(key)||0)+4));rect.setAttribute('fill','#303030');rect.setAttribute('stroke','#bdd8cd');rect.setAttribute('stroke-width','2.5');}
   if(text){text.setAttribute('font-size',String((parseFloat(text.getAttribute('font-size'))||14)+2));text.setAttribute('font-weight','800');text.setAttribute('fill','#fff');}
   label.setAttribute('pointer-events','none');return label;
  };
  const set=record=>{if(active===record)return;if(active)for(const part of [active.path,active.rect,active.text,active.labelGroup].filter(Boolean))part.classList.remove('q2-edge-inspected');active=record;overlay.replaceChildren();if(!record)return;for(const part of [record.path,record.rect,record.text,record.labelGroup].filter(Boolean))part.classList.add('q2-edge-inspected');if(record.path){const raised=record.path.cloneNode(false);raised.removeAttribute('id');raised.removeAttribute('role');raised.removeAttribute('tabindex');raised.removeAttribute('aria-label');raised.removeAttribute('data-graph-edge');raised.setAttribute('stroke','#bdd8cd');raised.setAttribute('stroke-width','5');raised.setAttribute('opacity','1');raised.setAttribute('fill','none');raised.setAttribute('pointer-events','none');if(record.path.hasAttribute('marker-end'))raised.setAttribute('marker-end','url(#'+markerId+')');overlay.append(raised);const label=raisedLabel(record);if(label.childNodes.length)overlay.append(label);}};
  for(const record of records){for(const target of [record.path,record.hit,record.rect,record.text,record.labelGroup].filter(Boolean)){target.addEventListener('pointerenter',()=>set(record));target.addEventListener('pointerleave',ev=>{const next=ev.relatedTarget,sharedParent=record.path?.parentElement;if(!sharedParent?.contains?.(next)&&!record.path?.contains?.(next)&&!record.labelGroup?.contains?.(next))set(null);});target.addEventListener('focus',()=>set(record));target.addEventListener('blur',()=>set(null));target.addEventListener('pointerdown',ev=>{if(ev.pointerType==='touch')set(record);});}}
  svg.addEventListener('pointerleave',()=>set(null));return{clear:()=>set(null)};
 }
 return{install};
})();
const PrimGraph=(()=>{
 const models=new WeakMap(),inspection=new WeakMap();let sequence=0;
 const label=v=>String.fromCharCode(65+v),R=26;
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function crosses(a,b,c,d){const side=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);return side(a,b,c)*side(a,b,d)<-1e-7&&side(c,d,a)*side(c,d,b)<-1e-7;}
 function pointSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
 function overlap(a,b,pad=0){return a.x<b.x+b.w+pad&&b.x<a.x+a.w+pad&&a.y<b.y+b.h+pad&&b.y<a.y+a.h+pad;}
 function segmentRect(a,b,rect,pad=0){
  let lo=0,hi=1;const dx=b.x-a.x,dy=b.y-a.y;
  for(const[p,q]of [[-dx,a.x-rect.x+pad],[dx,rect.x+rect.w+pad-a.x],[-dy,a.y-rect.y+pad],[dy,rect.y+rect.h+pad-a.y]]){if(Math.abs(p)<1e-9){if(q<0)return false;}else{const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}}
  return true;
 }
 function curveHitsRect(curve,rect,pad=0){if(!overlap(curve.bounds,rect,pad))return false;return curve.points.some((p,i)=>i&&segmentRect(curve.points[i-1],p,rect,pad));}
 function at(curve,t){const s=1-t;return{x:s*s*curve.a.x+2*s*t*curve.c.x+t*t*curve.b.x,y:s*s*curve.a.y+2*s*t*curve.c.y+t*t*curve.b.y};}
 function curve(a,b,offset){
  const len=distance(a,b),c={x:(a.x+b.x)/2-(b.y-a.y)*offset/len,y:(a.y+b.y)/2+(b.x-a.x)*offset/len},la=distance(a,c),lb=distance(b,c),out={a:{x:a.x+(c.x-a.x)*33/la,y:a.y+(c.y-a.y)*33/la},b:{x:b.x+(c.x-b.x)*33/lb,y:b.y+(c.y-b.y)*33/lb},c,offset};
  out.points=Array.from({length:25},(_,i)=>at(out,i/24));const xs=out.points.map(p=>p.x),ys=out.points.map(p=>p.y);out.bounds={x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
  out.path='M '+out.a.x+' '+out.a.y+' Q '+c.x+' '+c.y+' '+out.b.x+' '+out.b.y;return out;
 }
 function crossingCount(g,positions){let count=0;for(let i=0;i<g.edges.length;i++)for(let j=i+1;j<g.edges.length;j++){const a=g.edges[i],b=g.edges[j];if([a.u,a.v].some(v=>v===b.u||v===b.v))continue;if(crosses(positions[a.u],positions[a.v],positions[b.u],positions[b.v]))count++;}return count;}
 function vertexOrder(g){
  // Optimize only topology, never weights, visited vertices, or an MST.
  const seed=g.n+':'+g.edges.map(e=>[Math.min(e.u,e.v),Math.max(e.u,e.v)].join('-')).sort().join(','),r=GraphCore.rng('prim-drawing:'+seed),identity=Array.from({length:g.n},(_,i)=>i);
  function score(order){const index=Array(g.n);order.forEach((v,i)=>index[v]=i);let crossing=0,length=0;for(const e of g.edges){const d=Math.abs(index[e.u]-index[e.v]),span=Math.min(d,g.n-d);length+=span*span;}for(let i=0;i<g.edges.length;i++)for(let j=i+1;j<g.edges.length;j++){const a=g.edges[i],b=g.edges[j];if([a.u,a.v].some(v=>v===b.u||v===b.v))continue;const between=(u,v,x)=>(index[x]-index[u]+g.n)%g.n<(index[v]-index[u]+g.n)%g.n;if(between(a.u,a.v,b.u)!==between(a.u,a.v,b.v)&&between(b.u,b.v,a.u)!==between(b.u,b.v,a.v))crossing++;}return crossing*10000+length;}
  let best=identity.slice(),bestScore=score(best);
  for(let start=0;start<5;start++){
   let order=identity.slice();if(start)for(let i=order.length-1;i;i--){const j=Math.floor(r()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
   let current=score(order);for(let pass=0;pass<18;pass++){let next=current,swap=null;for(let i=0;i<g.n;i++)for(let j=i+1;j<g.n;j++){[order[i],order[j]]=[order[j],order[i]];const s=score(order);[order[i],order[j]]=[order[j],order[i]];if(s<next){next=s;swap=[i,j];}}if(!swap)break;[order[swap[0]],order[swap[1]]]=[order[swap[1]],order[swap[0]]];current=next;}
   if(current<bestScore){best=order;bestScore=current;}
  }
  const top=best.indexOf(0);return best.slice(top).concat(best.slice(0,top));
 }
 function vertexPlacements(g,order){
  if(g.n<=5)return[null];const width=g.n<=8?960:1140,height=g.n<=8?660:780,r=GraphCore.rng('prim-spacing:'+g.n+':'+g.edges.map(e=>e.u+'-'+e.v).join(',')),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function score(p){let value=crossingCount(g,p)*10000;for(let u=0;u<g.n;u++)for(let v=u+1;v<g.n;v++){const d=distance(p[u],p[v]);if(d<155)value+=1e6+(155-d)**2*1000;else if(d<210)value+=(210-d)**2*2;}for(const e of g.edges){value+=distance(p[e.u],p[e.v])*.08;for(let v=0;v<g.n;v++)if(v!==e.u&&v!==e.v){const d=pointSegment(p[v],p[e.u],p[e.v]);if(d<42)value+=1e6+(42-d)**2*5000;else if(d<78)value+=(78-d)**2*6;}}return value;}
  const choices=[];
  for(let start=0;start<3;start++){
   const p=Array(g.n);order.forEach((v,i)=>{const a=-Math.PI/2+i*2*Math.PI/g.n+(start?r()*.4-.2:0);p[v]={x:width/2+(width/2-105)*Math.cos(a),y:height/2+(height/2-95)*Math.sin(a)};});
   for(let iteration=0;iteration<180;iteration++){
    const forces=p.map(()=>({x:0,y:0})),k=205;
    for(let u=0;u<g.n;u++)for(let v=u+1;v<g.n;v++){const dx=p[u].x-p[v].x,dy=p[u].y-p[v].y,d=Math.max(1,Math.hypot(dx,dy)),f=k*k/(d*d);forces[u].x+=dx*f;forces[u].y+=dy*f;forces[v].x-=dx*f;forces[v].y-=dy*f;}
    for(const e of g.edges){const a=p[e.u],b=p[e.v],dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),f=d/k*.55;forces[e.u].x+=dx*f;forces[e.u].y+=dy*f;forces[e.v].x-=dx*f;forces[e.v].y-=dy*f;
     for(let v=0;v<g.n;v++)if(v!==e.u&&v!==e.v){const t=clamp(((p[v].x-a.x)*dx+(p[v].y-a.y)*dy)/(d*d),0,1),qx=a.x+t*dx,qy=a.y+t*dy,nx=p[v].x-qx,ny=p[v].y-qy,nd=Math.max(1,Math.hypot(nx,ny));if(nd<90){const push=(90-nd)*1.4/nd;forces[v].x+=nx*push;forces[v].y+=ny*push;forces[e.u].x-=nx*push*.5;forces[e.u].y-=ny*push*.5;forces[e.v].x-=nx*push*.5;forces[e.v].y-=ny*push*.5;}}
    }
    const temperature=22*(1-iteration/180)+1;for(let v=0;v<g.n;v++){const f=forces[v];f.x+=(width/2-p[v].x)*.03;f.y+=(height/2-p[v].y)*.03;const magnitude=Math.max(1,Math.hypot(f.x,f.y)),step=Math.min(temperature,magnitude)/magnitude;p[v].x=clamp(p[v].x+f.x*step,85,width-85);p[v].y=clamp(p[v].y+f.y*step,80,height-80);}
   }
   let current=score(p);for(const step of [80,40,20,10])for(let pass=0;pass<2;pass++)for(let v=0;v<g.n;v++){const original=p[v];let best=original,next=current;for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]){p[v]={x:clamp(original.x+dx*step,85,width-85),y:clamp(original.y+dy*step,80,height-80)};const candidate=score(p);if(candidate<next){next=candidate;best=p[v];}}p[v]=best;current=next;}
   choices.push({cost:current,points:p.map(point=>({x:point.x/width,y:point.y/height}))});
  }
  choices.sort((a,b)=>a.cost-b.cost);return[...choices.map(c=>c.points),null];
 }
 function makeModel(g,order,scale,placement=null){
  const width=Math.round((g.n<=5?820:g.n<=8?960:1140)*scale),height=Math.round((g.n<=5?570:g.n<=8?660:780)*scale),positions=Array(g.n),place=vertices=>{const p=Array(g.n);vertices.forEach((v,i)=>{const angle=-Math.PI/2+i*2*Math.PI/g.n;p[v]={x:width/2+(width/2-100)*Math.cos(angle),y:height/2+(height/2-90)*Math.sin(angle)};});return p;};
  (placement?placement.map(p=>({x:p.x*width,y:p.y*height})):place(order)).forEach((p,v)=>positions[v]=p);
  const routes=g.edges.map(e=>({...e,curve:curve(positions[e.u],positions[e.v],0),label:null})),assigned=[];
  const priority=routes.slice().sort((a,b)=>distance(positions[b.u],positions[b.v])-distance(positions[a.u],positions[a.v])||a.id.localeCompare(b.id));
  for(const edge of priority){
   let winner=null,best=Infinity;
   for(const offset of [0,36,-36,72,-72,112,-112,160,-160,220,-220]){
    const c=curve(positions[edge.u],positions[edge.v],offset);
    if(c.points.some(p=>p.x<16||p.x>width-16||p.y<16||p.y>height-16))continue;
    if(positions.some((p,v)=>v!==edge.u&&v!==edge.v&&c.points.some((b,i)=>i&&pointSegment(p,c.points[i-1],b)<R+12)))continue;
    if(assigned.some(other=>curveHitsRect(c,other.label,7)))continue;
    let crossings=0;for(const other of routes){if(other===edge||[other.u,other.v].includes(edge.u)||[other.u,other.v].includes(edge.v))continue;for(let a=3;a<c.points.length;a+=3)for(let b=3;b<other.curve.points.length;b+=3)if(crosses(c.points[a-3],c.points[a],other.curve.points[b-3],other.curve.points[b]))crossings++;}
    for(const t of [.5,.35,.65,.25,.75,.42,.58,.2,.8,.15,.85]){
     const p=at(c,t),rect={x:p.x-36,y:p.y-17,w:72,h:34};
     if(rect.x<16||rect.y<16||rect.x+rect.w>width-16||rect.y+rect.h>height-16)continue;
     if(positions.some(node=>{const x=Math.max(rect.x,Math.min(node.x,rect.x+rect.w)),y=Math.max(rect.y,Math.min(node.y,rect.y+rect.h));return Math.hypot(node.x-x,node.y-y)<R+10;}))continue;
     if(assigned.some(other=>overlap(rect,other.label,12)))continue;
     if(assigned.some(other=>curveHitsRect(other.curve,rect,7)))continue;
     const futureConflicts=routes.filter(other=>other!==edge&&!other.label&&curveHitsRect(other.curve,rect,7)).length;

     const cost=crossings*8+futureConflicts*20+Math.abs(offset)*.04+Math.abs(t-.5)*30;
     if(cost<best){best=cost;winner={curve:c,label:rect};}
    }
   }
   if(!winner)return null;
   edge.curve=winner.curve;edge.label=winner.label;assigned.push(edge);
  }
  return{width,height,positions,edges:routes,order:order.slice(),crossingsBefore:crossingCount(g,place(Array.from({length:g.n},(_,i)=>i))),crossingsAfter:crossingCount(g,positions),scale};
 }
 function layout(g){
  if(models.has(g))return models.get(g);const order=vertexOrder(g),placements=vertexPlacements(g,order);
  for(const scale of [1,1.18,1.4,1.7,2.1,2.6])for(const placement of placements){const model=makeModel(g,order,scale,placement);if(model){models.set(g,model);return model;}}
  throw Error('Could not place readable Prim edge labels.');
 }
 function clear(ctx){const state=inspection.get(ctx);if(state){state.vertex=null;state.edge=null;state.update?.();}}
 function view(ctx,g,opts){
  const K=LabKit,E=K.E,model=layout(g),ns='http://www.w3.org/2000/svg',S=ExpandedViews.svg;
  let state=inspection.get(ctx);if(!state||state.problem!==ctx.p){state={problem:ctx.p,vertex:null,edge:null,zoom:100,left:0,top:0};inspection.set(ctx,state);}
  const root=E('div',undefined,'prim-drawing'),tools=E('div',undefined,'nl-tools prim-inspection-tools'),status=E('span',undefined,'prim-inspection-status'),clearButton=K.button('Clear inspection',()=>clear(ctx));clearButton.dataset.primClear='';
  const zoom=E('input');zoom.type='range';zoom.min=65;zoom.max=150;zoom.step=5;zoom.value=state.zoom;zoom.setAttribute('aria-label','Prim graph zoom');zoom.dataset.primZoom='';const zoomValue=E('span',state.zoom+'%','muted');tools.append(K.field('Graph zoom',zoom),zoomValue,clearButton,status);status.setAttribute('role','status');status.setAttribute('aria-live','polite');root.append(tools,E('p','Labels show edge weights. Hover an edge or label to trace it; tap a vertex to inspect its connections. Click an edge or its label to select it.','nl-help'));
  const wrap=E('div',undefined,'nl-graph prim-graph-scroll');wrap.tabIndex=0;wrap.setAttribute('aria-label','Scrollable Prim graph');const svg=S('svg',{viewBox:'0 0 '+model.width+' '+model.height,role:'group','aria-label':'Weighted undirected graph. Activate a vertex to inspect its connections; activate an edge to select it.'});
  const edgeLayer=S('g'),overlay=S('g',{'pointer-events':'none'}),labelLayer=S('g',{class:'prim-edge-label-layer'}),nodeLayer=S('g'),edgeViews=new Map(),labelViews=new Map(),nodeViews=new Map();
  const active=()=>state.root===root,hover=id=>{if(!active())return;state.edge=id;update();},activate=fn=>ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();fn();}};
  for(const edge of model.edges){
   const selected=opts.selectedEdges?.includes(edge.id),rejected=opts.rejectedEdges?.includes(edge.id),proposed=opts.focusEdges?.includes(edge.id),eligible=ctx.ui.hints.checked&&!ctx.ui.exam.checked&&opts.eligibleEdges?.includes(edge.id),color=rejected?'#CF7468':selected?'#10A37F':proposed?'#D0A65A':eligible?'#45564C':'#45564C',weight=g.edges.find(e=>e.id===edge.id).w,group=S('g',{'data-graph-edge':edge.id,'data-prim-edge':edge.id,class:'prim-edge'+(selected?' prim-mst-edge':''),role:'button',tabindex:0,'aria-label':'Edge '+label(edge.u)+' to '+label(edge.v)+', weight '+weight,'aria-pressed':String(!!selected),stroke:color,'stroke-width':selected?4:2.2});
   group.append(S('path',{d:edge.curve.path,class:'prim-edge-halo',stroke:'#2F2F2F','stroke-width':7,fill:'none','pointer-events':'none'}),S('path',{d:edge.curve.path,class:'prim-edge-line',fill:'none','pointer-events':'none'}),S('path',{d:edge.curve.path,class:'prim-edge-hit',fill:'none',stroke:'transparent','stroke-width':18}));
   const box=S('g',{class:'prim-edge-weight','data-prim-edge':edge.id,'aria-hidden':'true','pointer-events':'all'});box.append(S('rect',{...{x:edge.label.x,y:edge.label.y,width:edge.label.w,height:edge.label.h},rx:8,fill:'#2F2F2F',stroke:color,'stroke-width':selected?2:1.3}),S('text',{x:edge.label.x+edge.label.w/2,y:edge.label.y+edge.label.h/2+5,'text-anchor':'middle',fill:'#A8B7AC',stroke:'none','font-size':14,'font-family':'Consolas, monospace'},String(weight)));
   const clearLinkedHover=ev=>{const related=ev.relatedTarget?.closest?.('[data-prim-edge]');if(related?.dataset.primEdge===edge.id)return;if(state.edge===edge.id)hover(null);};
   group.onclick=()=>opts.edgeClick?.(edge.id);group.onkeydown=activate(()=>opts.edgeClick?.(edge.id));group.onpointerenter=ev=>{if(ev.pointerType!=='touch')hover(edge.id);};group.onpointerleave=clearLinkedHover;group.onfocus=()=>hover(edge.id);group.onblur=()=>hover(null);
   box.onclick=ev=>{ev.stopPropagation();opts.edgeClick?.(edge.id);};box.onpointerenter=ev=>{if(ev.pointerType!=='touch')hover(edge.id);};box.onpointerleave=clearLinkedHover;
   edgeLayer.appendChild(group);labelLayer.appendChild(box);edgeViews.set(edge.id,group);labelViews.set(edge.id,box);
  }
  for(let v=0;v<g.n;v++){
   const p=model.positions[v],known=opts.known?.includes(v),node=S('g',{'data-prim-vertex':v,class:'prim-vertex',role:'button',tabindex:0,'aria-label':'Inspect connections of vertex '+label(v),'aria-pressed':String(state.vertex===v)});
   node.append(S('circle',{cx:p.x,cy:p.y,r:R+7,class:'prim-inspection-ring',fill:'none',stroke:'#10A37F','stroke-width':3,opacity:0}),S('circle',{cx:p.x,cy:p.y,r:R,'data-graph-vertex':v,fill:known?'#10A37F':'#2F2F2F',stroke:v===opts.source?'#D0A65A':'#45564C','stroke-width':v===opts.source?4:2}),S('text',{x:p.x,y:p.y+6,'text-anchor':'middle','font-size':19,'font-weight':700,fill:known?'#2F2F2F':'#A8B7AC','pointer-events':'none'},label(v)));
   const inspect=()=>{if(!active())return;state.vertex=state.vertex===v?null:v;state.edge=null;update();};node.onclick=inspect;node.onkeydown=activate(inspect);nodeLayer.appendChild(node);nodeViews.set(v,node);
  }
  svg.append(edgeLayer,overlay,labelLayer,nodeLayer);wrap.appendChild(svg);root.appendChild(wrap);state.root=root;
  function update(){
   const focused=state.edge?model.edges.find(e=>e.id===state.edge):null,ids=new Set(focused?[focused.id]:state.vertex!==null?model.edges.filter(e=>e.u===state.vertex||e.v===state.vertex).map(e=>e.id):[]),vertices=new Set();for(const e of model.edges)if(ids.has(e.id)){vertices.add(e.u);vertices.add(e.v);}if(state.vertex!==null&&!focused)vertices.add(state.vertex);
   overlay.replaceChildren();for(const e of model.edges){const el=edgeViews.get(e.id),box=labelViews.get(e.id),lit=ids.has(e.id),text=box.querySelector('text'),rect=box.querySelector('rect'),hovered=state.edge===e.id;el.classList.toggle('prim-traced',lit);el.classList.toggle('prim-muted',ids.size>0&&!lit);box.classList.toggle('prim-traced',lit);box.classList.toggle('prim-muted',ids.size>0&&!lit);box.classList.toggle('prim-mst-edge',el.classList.contains('prim-mst-edge'));if(hovered){const x=e.label.x+e.label.w/2,y=e.label.y+e.label.h/2;box.setAttribute('transform','translate('+x+' '+y+') scale(1.1) translate('+(-x)+' '+(-y)+')');box.classList.add('q2-edge-inspected');text.setAttribute('font-size','15');text.setAttribute('font-weight','800');text.setAttribute('fill','#fff');rect.setAttribute('stroke','#bdd8cd');rect.setAttribute('stroke-width','2.5');}else{box.removeAttribute('transform');box.classList.remove('q2-edge-inspected');text.setAttribute('font-size','14');text.setAttribute('font-weight','650');text.setAttribute('fill','#A8B7AC');rect.setAttribute('stroke',el.getAttribute('stroke'));rect.setAttribute('stroke-width',el.classList.contains('prim-mst-edge')?'2':'1.3');}if(lit)overlay.append(S('path',{d:e.curve.path,fill:'none',stroke:'#2F2F2F','stroke-width':9}),S('path',{d:e.curve.path,fill:'none',stroke:'#10A37F','stroke-width':4.5}));}
   for(const[v,node]of nodeViews){node.classList.toggle('prim-traced',vertices.has(v));node.classList.toggle('prim-muted',ids.size>0&&!vertices.has(v));node.setAttribute('aria-pressed',String(state.vertex===v));}
   clearButton.disabled=state.vertex===null&&!state.edge;
   status.textContent=focused?label(focused.u)+' — '+label(focused.v)+' · weight '+g.edges.find(e=>e.id===focused.id).w:state.vertex!==null?'Inspecting '+label(state.vertex)+' · '+ids.size+' connections. Tap again to clear.':'No inspection · edge clicks select your MST.';
  }
  state.update=update;svg.onkeydown=ev=>{if(ev.key==='Escape'){ev.preventDefault();clear(ctx);}};
  function size(){const width=model.width*state.zoom/100,height=model.height*state.zoom/100;svg.setAttribute('width',width);svg.setAttribute('height',height);svg.style.width=width+'px';svg.style.height=height+'px';zoomValue.textContent=state.zoom+'%';}
  zoom.oninput=()=>{const previous=state.zoom,centerX=(wrap.scrollLeft+wrap.clientWidth/2)/previous,centerY=(wrap.scrollTop+wrap.clientHeight/2)/previous;state.zoom=Number(zoom.value);size();wrap.scrollLeft=centerX*state.zoom-wrap.clientWidth/2;wrap.scrollTop=centerY*state.zoom-wrap.clientHeight/2;};
  wrap.onscroll=()=>{if(active()){state.left=wrap.scrollLeft;state.top=wrap.scrollTop;}};size();update();requestAnimationFrame(()=>{if(active()){wrap.scrollLeft=state.left;wrap.scrollTop=state.top;}});return root;
 }
 return{layout,view,clear,crossingCount,curveHitsRect,overlap,pointSegment};
})();

const PrimQuestions=(()=>{
 const G=GraphCore,L=v=>String.fromCharCode(65+v),modes={full:'Build MST',trace:'Execute Prim',next:'Next Edge',concepts:'Concepts'};
 function visited(p,edges){const a=[p.source];for(const id of edges){const e=G.edge(p.g,id);if(e&&a.includes(e.u)!==a.includes(e.v))a.push(a.includes(e.u)?e.v:e.u);}return a;}
 function generate(cfg){const r=G.rng(cfg.seed+':prim-compact'),p={cfg,kind:cfg.mode,title:'Question',fields:[],steps:[],weighted:true,contract:'Choose independently; correctness is checked only after Check Answer.',initial:{answers:{},chosen:[],edges:[]}};
  if(cfg.mode==='concepts'){p.showGraph=false;const qi=G.integer(r,0,7),q=[['How many edges does a spanning tree of N vertices contain?','nminus',[['nminus','N − 1'],['n','N'],['square','N²']],'A connected acyclic graph on N vertices has N − 1 edges.'],['Which edge may Prim add to its growing tree?','cross',[['cross','A minimum-weight edge crossing from selected to unselected vertices'],['global','The globally smallest remaining edge, regardless of endpoints'],['both','Any edge with both endpoints already selected']],'The edge must add a new vertex and have minimum weight among all crossing edges.'],['With adjacency lists and a binary heap, what is the usual Prim bound?','heap',[['heap','O((|V| + |E|) log |V|)'],['linear','O(|V| + |E|)'],['square','O(|V|²)']],'Extract-min and connection-cost priority updates use heap operations. For a connected graph this is commonly written O(|E| log |V|).'],['With an adjacency matrix and linear minimum selection, what is Prim’s bound?','square',[['square','O(|V|²)'],['linear','O(|V| + |E|)'],['log','O(log |V|)']],'Each iteration scans the vertex keys and one matrix row.'],['What does Prim’s tentative value for an unselected vertex mean?','edge',[['edge','Weight of its best connecting edge to the current tree'],['path','Total distance from the starting vertex'],['degree','Number of incident edges']],'Prim minimizes the next connecting-edge weight. Dijkstra instead maintains source-to-vertex path distances.'],['Several eligible crossing edges tie for minimum weight. Which may Prim choose?','any',[['any','Any tied minimum crossing edge'],['one','Only the edge chosen by a particular reference implementation'],['none','None; Prim cannot handle ties']],'Different valid tie choices may produce different MSTs of the same minimum weight.'],['Which ordinary input supports a spanning MST under Prim’s procedure?','connected',[['connected','A connected weighted undirected graph'],['directed','Any weighted directed graph'],['disconnected','A disconnected graph with no connecting edges']],'A spanning tree must connect every vertex; ordinary Prim treats each selected undirected edge as connecting the current tree to one new endpoint.'],['Why must an edge between two already selected vertices not be added to a Prim tree?','cycle',[['cycle','It would create a cycle instead of reaching a new vertex'],['weight','Its weight is necessarily too large'],['negative','Its weight must be negative']],'The current selected tree already contains a path between those endpoints. Another internal edge closes a cycle.']][qi];p.concept=['edgeCount','crossing','heapComplexity','arrayComplexity','dijkstra','ties','connected','cycle'][qi];p.question=q[0];p.fields=[{key:'choice',type:'choice',choices:q[2],expected:q[1]}];p.steps=[q[3]];return p;}
  const base=G.calibratedPrim(cfg.difficulty,r,G.integer(r,0,11));Object.assign(p,{g:base.g,source:base.source,ref:G.prim(base.g,base.source),complexity:base.complexity});
  if(cfg.mode==='full')p.question='Select a minimum spanning tree and enter its total weight.';
  if(cfg.mode==='trace')p.question='Execute Prim from '+L(p.source)+'. Select one minimum crossing edge per step, then enter the final total. Each edge click records a step; no decision is checked before submission.';
  if(cfg.mode==='next'){const k=G.integer(r,1,p.g.n-2);p.prefix=p.ref.selected.slice(0,k);p.visited=visited(p,p.prefix);p.question='Current Prim tree vertices: {'+p.visited.map(L).join(', ')+'}. Select one edge Prim may choose next. Tied minimum crossing edges are accepted.';}
  return p;
 }
 function check(p,s){if(p.fields.length)return CompactQuiz.gradeFields(p,s);if(p.kind==='next')return s.edges.length===1?G.primStep(p.g,p.visited,s.edges[0]):{ok:false,message:'Select exactly one proposed next edge.'};if(p.kind==='trace'){if(s.edges.length!==p.g.n-1)return{ok:false,message:'Record exactly |V| − 1 edge choices.'};const trace=G.primTrace(p.g,p.source,s.edges);if(!trace.ok)return trace;}const result=G.mstCheck(p.g,s.edges);if(!result.ok)return result;return{ok:CompactQuiz.number(s.answers.total)===result.weight,message:CompactQuiz.number(s.answers.total)===result.weight?'Correct minimum spanning tree'+(p.kind==='trace'?' and Prim procedure':'')+'.':'Recheck the total selected-edge weight.'};}
 return{modes,generate,check,visited};
})();
const PrimLab=(()=>{
 const K=LabKit,E=K.E,Q=PrimQuestions,G=GraphCore,L=K.letter;
 const choose=(ctx,id)=>ctx.edit(s=>{if(ctx.p.kind==='trace')s.edges.push(id);else if(ctx.p.kind==='next')s.edges=[id];else s.edges=s.edges.includes(id)?s.edges.filter(e=>e!==id):[...s.edges,id];});
 const adapter={modes:Q.modes,signature:ctx=>ctx.s,generate:Q.generate,check:ctx=>Q.check(ctx.p,ctx.s),render(ctx){const p=ctx.p,s=ctx.s;if(p.showGraph===false){CompactQuiz.renderFields(ctx);return;}const selected=p.kind==='next'?[...p.prefix,...s.edges]:s.edges,known=p.kind==='trace'?Q.visited(p,s.edges):p.visited||[];GraphExamUI.layout(ctx,()=>{if(p.fields.length){CompactQuiz.renderFields(ctx);return;}ctx.ui.body.append(E('p',(p.kind==='trace'?'Recorded steps: ':'Selected: ')+(s.edges.map(id=>{const e=G.edge(p.g,id);return L(e.u)+' \u2192 '+L(e.v);}).join(', ')||'none'),'ge-output'));const row=E('div',undefined,'ge-edge-list');for(const e of p.g.edges){const b=K.button(L(e.u)+' \u2192 '+L(e.v)+' ('+e.w+')',()=>choose(ctx,e.id));b.dataset.primChoice=e.id;b.setAttribute('aria-pressed',String(s.edges.includes(e.id)));row.append(b);}ctx.ui.body.append(row);if(p.kind!=='next')ctx.ui.body.append(CompactQuiz.field(ctx,'Total weight','total',true));if(p.kind==='trace'&&s.edges.length)ctx.ui.body.append(K.button('Remove Last Step',()=>ctx.edit(x=>x.edges.pop())));},{source:p.source,known,selectedEdges:selected,edgeClick:id=>choose(ctx,id)});},solution(ctx){const p=ctx.p;if(p.fields.length)return K.list(p.steps);if(p.kind==='next'){const es=G.crossing(p.g,p.visited),min=Math.min(...es.map(e=>e.w));return[E('p','Only edges with one endpoint in {'+p.visited.map(L).join(', ')+'} are eligible.'),K.list(es.map(e=>L(e.u)+' \u2192 '+L(e.v)+': '+e.w+(e.w===min?' (minimum; valid next choice)':'')))];}return[E('p','One MST has total weight '+p.ref.weight+'. Alternative optimal trees and tied Prim choices are accepted.'),K.list(p.ref.steps.map(st=>{const e=G.edge(p.g,st.edge),cross=G.crossing(p.g,st.before);return'Tree {'+st.before.map(L).join(', ')+'}: crossing weights ['+cross.map(x=>x.w).join(', ')+']. Choose '+L(e.u)+' \u2192 '+L(e.v)+' ('+e.w+'); cumulative '+st.total+'.';}))];}};
 const ctx=CompactQuiz.attach(K.create('prim',"Prim's Algorithm",'',adapter),'pp. 393–397','A spanning tree connects all vertices without cycles using |V| − 1 edges. Prim starts with the specified vertex and repeatedly adds a minimum-weight crossing edge to one new vertex. Any tied minimum is valid. Build MST grades the final tree; Execute Prim also grades every recorded boundary-crossing choice. No Kruskal procedure is required.');return{ctx,adapter,choose};
})();




/* Shared graph-exam core and the Topological, Dijkstra, and Flow labs. */
/* State transitions for final-only graph traces; references remain GraphCore/QuizGraphCore. */
const GraphExamCore=(()=>{
 const G=GraphCore,copy=G.clone,L=v=>String.fromCharCode(65+v);
 const numeric=raw=>CompactQuiz.number(raw),vertices=(raw,n)=>FundamentalQuestions.vertices(raw,n);
 function initial(g,source,mode){return{dist:Array.from({length:g.n},(_,v)=>v===source?0:Infinity),prev:Array(g.n).fill(null),known:Array(g.n).fill(false),queue:mode==='dag'?[]:[source],order:[]};}
 function step(g,mode,before,u){
  const s=copy(before);if(mode==='dijkstra')s.known[u]=true;else if(mode!=='dag')s.queue.shift();s.order.push(u);const updates=[];
  for(const e of G.arcs(g).filter(e=>e.u===u).sort((a,b)=>a.v-b.v||a.w-b.w)){
   if(mode==='dijkstra'&&s.known[e.v])continue;const candidate=s.dist[u]+(mode==='bfs'?1:e.w),improve=mode==='bfs'?s.dist[e.v]===Infinity&&Number.isFinite(s.dist[u]):candidate<s.dist[e.v];
   if(improve){const old=s.dist[e.v];s.dist[e.v]=candidate;s.prev[e.v]=u;if(!['dag','dijkstra'].includes(mode)&&!s.queue.includes(e.v))s.queue.push(e.v);updates.push({v:e.v,old,dist:candidate,prev:u});}
  }return{...s,updates,u};
 }
 function trace(g,source,mode,order=null){let s=initial(g,source,mode);const states=[];for(let guard=0;guard<10000;guard++){
  let u;if(mode==='dag'){if(s.order.length===g.n)break;u=order?order[s.order.length]:G.eligible(g,s.order)[0];}
  else if(mode==='dijkstra'){u=s.dist.map((d,v)=>!s.known[v]&&Number.isFinite(d)?v:null).filter(v=>v!==null).sort((a,b)=>s.dist[a]-s.dist[b]||a-b)[0];if(u===undefined)break;}
  else{if(!s.queue.length)break;u=s.queue[0];}const before=copy(s);s=step(g,mode,s,u);states.push({before,after:copy(s)});
 }return{states,final:s};}
 function draft(before){return{before:copy(before),processed:null,dist:before.dist.slice(),prev:before.prev.slice(),queue:'',recorded:false,dirty:false};}
 function traceGrade(p,s){
  if(s.stages.some(x=>!x.recorded&&x.dirty))return{ok:false,message:'Record the active stage before submitting, or Undo its unrecorded changes.'};let state=initial(p.g,p.source,p.traceMode);const recorded=s.stages.filter(x=>x.recorded);
  for(let i=0;i<recorded.length;i++){
   const e=recorded[i],u=e.processed;if(!Number.isInteger(u)||u<0||u>=p.g.n)return{ok:false,message:'Stage '+(i+1)+': select the vertex processed.'};
   if(p.traceMode==='dag'?!G.eligible(p.g,state.order).includes(u):state.queue[0]!==u)return{ok:false,message:'Stage '+(i+1)+': the processed vertex does not follow the stated topological / FIFO procedure.'};
   const after=step(p.g,p.traceMode,state,u);if(!Array.isArray(e.dist)||e.dist.length!==p.g.n||e.dist.some((x,v)=>x!==after.dist[v])||e.prev.some((x,v)=>x!==after.prev[v]))return{ok:false,message:'Stage '+(i+1)+': recheck distances and strict-improvement predecessor updates.'};
   if(p.traceMode!=='dag'){const q=vertices(e.queue,p.g.n);if(!q||q.length!==after.queue.length||q.some((x,j)=>x!==after.queue[j]))return{ok:false,message:'Stage '+(i+1)+': recheck FIFO queue membership, neighbor order, and duplicate enqueues.'};}state=after;
  }
  if(p.traceMode==='dag'?state.order.length!==p.g.n:state.queue.length!==0)return{ok:false,message:'The recorded procedure is incomplete.'};
  if(state.dist.some((x,v)=>x!==p.ref.dist[v]))return{ok:false,message:'The final distances do not match the required shortest-path result.'};return{ok:true,message:'Correct complete procedure, queue / topological choices, and distance updates.'};
 }
 function recordTrace(ctx){ctx.edit(s=>{const current=s.stages[s.active];current.recorded=true;current.dirty=false;s.stages=s.stages.slice(0,s.active+1);const q=vertices(current.queue,ctx.p.g.n)||[],before={dist:current.dist.slice(),prev:current.prev.slice(),known:Array(ctx.p.g.n).fill(false),queue:q,queueText:current.queue,order:s.stages.filter(x=>x.recorded).map(x=>x.processed)};s.active++;if(!s.stages[s.active])s.stages.push(draft(before));});}
 function affected(g,source){const dist=G.bellman(g,source),seeds=new Set();for(const e of G.arcs(g))if(Number.isFinite(dist[e.u])&&dist[e.u]+e.w<dist[e.v])seeds.add(e.v);const all=new Set(seeds),q=[...seeds];for(let i=0;i<q.length;i++)for(const e of G.arcs(g))if(e.u===q[i]&&!all.has(e.v)){all.add(e.v);q.push(e.v);}return[...all];}
 function tableCheck(p,s,prevRequired=false,knownRequired=false){if(s.dist.length!==p.g.n||s.dist.some((x,v)=>x===null||x===undefined||x!==p.ref.dist[v]))return{ok:false,message:'Recheck the distance entries and explicit Unreachable choices.'};if(knownRequired&&s.known.some((x,v)=>x!==p.ref.known[v]))return{ok:false,message:'Known status must match the stated termination rule; unreachable vertices remain unknown.'};return prevRequired?G.predCheck(p.g,p.source,s.dist,s.prev,null,p.ref.dist):{ok:true,message:'Correct shortest-path distances.'};}
 function pathCheck(p,s){const path=vertices(s.answers.path,p.g.n);if(s.noPath)return{ok:!Number.isFinite(p.ref.dist[p.target]),message:!Number.isFinite(p.ref.dist[p.target])?'Correct: target is unreachable.':'A finite shortest path exists.'};if(!path?.length)return{ok:false,message:'Enter a source-to-target path, or explicitly mark the target Unreachable.'};const result=G.pathCheck(p.g,p.source,p.target,path,p.ref.dist[p.target]);if(!result.ok)return result;if(p.askCost&&numeric(s.answers.cost)!==p.ref.dist[p.target])return{ok:false,message:'Recheck the path’s total cost.'};return result;}
 return{copy,L,numeric,vertices,initial,step,trace,draft,traceGrade,recordTrace,affected,tableCheck,pathCheck};
})();

const GraphExamUI=(()=>{
 const K=LabKit,E=K.E,C=GraphExamCore,L=K.letter;
 function distance(ctx,array,v,id,label='Unreachable',changed=null){
  const row=E('div',undefined,'ge-distance'),input=E('input'),none=E('input'),l=E('label');input.type='text';input.id=id;input.autocomplete='off';input.inputMode='numeric';input.setAttribute('aria-label','Distance to '+L(v));input.value=array[v]===Infinity?'':array[v]??'';input.disabled=array[v]===Infinity;
  none.type='checkbox';none.id=id+'Unreachable';none.checked=array[v]===Infinity;none.setAttribute('aria-label',label+' for '+L(v));l.append(none,E('span',label));
  const mark=()=>{ctx.ui.solution.hidden=true;ctx.msg('');changed?.();};input.oninput=()=>{ctx.save();array[v]=C.numeric(input.value);mark();};none.onchange=()=>{ctx.save();array[v]=none.checked?Infinity:null;input.disabled=none.checked;input.value='';mark();if(!none.checked)input.focus({preventScroll:true});};FormEvents.submitOnEnter(input,()=>ctx.check('final'));row.append(input,l);return row;
 }
 function table(ctx,{dist=ctx.s.dist,prev=ctx.s.prev,known=null,before=null,tentative=false,mark=null}={}){
  const rows=[];for(let v=0;v<ctx.p.g.n;v++){
   const row=[L(v)];if(before)row.push((before.known?.[v]?'K · ':'')+K.fmt(before.dist[v])+' / '+(before.prev[v]===null?'—':L(before.prev[v])));
   if(known){const cb=E('input');cb.type='checkbox';cb.checked=known[v];cb.id=ctx.key+'Known'+v;cb.setAttribute('aria-label','Known '+L(v));cb.onchange=()=>{ctx.save();known[v]=cb.checked;ctx.ui.solution.hidden=true;mark?.();ctx.msg('');};row.push(cb);}
   row.push(distance(ctx,dist,v,ctx.key+'Distance'+v,tentative?'No tentative distance':'Unreachable',mark));
   if(prev){const select=K.select([['none','—'],...Array.from({length:ctx.p.g.n},(_,u)=>[String(u),L(u)])],prev[v]===null?'none':String(prev[v]),()=>{});select.id=ctx.key+'Previous'+v;select.setAttribute('aria-label','Predecessor of '+L(v));select.onchange=()=>{ctx.save();prev[v]=select.value==='none'?null:Number(select.value);ctx.ui.solution.hidden=true;mark?.();ctx.msg('');};row.push(select);}rows.push(row);
  }const headers=['Vertex',...(before?['Given d / prev']:[]),...(known?['Known']:[]),'Distance',...(prev?['Previous']:[])],table=K.table(headers,rows);table.classList.add('ge-table');return table;
 }
 function layout(ctx,answer,opts={}){const row=E('div',undefined,'fg-layout ge-layout'),answers=E('div',undefined,'ge-answers');opts={...opts,selection:()=>ctx.key==='flow'?ctx.s.side:ctx.key==='activity'?ctx.p.kind==='node'?ctx.s.from===null?[]:[ctx.s.from]:ctx.p.kind==='eligible'?ctx.s.selected:ctx.s.order:ctx.s.chosen||[]};row.append(FundamentalDrawing.view(ctx,opts),answers);ctx.ui.body.append(row);const old=ctx.ui.body;ctx.ui.body=answers;answer(answers);ctx.ui.body=old;if(ctx.key==='activity'&&ctx.p.kind==='node'){const redraw=()=>{const prior=ctx.p,g={...prior.g,edges:ctx.s.edges.map(id=>{const[u,v]=id.split(':').map(Number);return{id,u,v,w:1};}).filter(e=>[e.u,e.v].every(v=>Number.isInteger(v)&&v>=0&&v<prior.g.n)&&e.u!==e.v)};ctx.p={...prior,g};const next=FundamentalDrawing.view(ctx,opts);row.querySelector('.fg-diagram').replaceWith(next);ctx.p=prior;ctx.refreshGraph=redraw;};ctx.refreshGraph=redraw;}return row;}
 function vertexEntry(ctx,label='Your vertices',key='value',mode='sequence'){
  const l=E('label',label+' ','cq-field'),input=K.input(ctx.s.answers[key]??'',v=>ctx.edit(s=>{s.answers[key]=v;s.chosen=C.vertices(v,ctx.p.g.n)||[];}));input.id=ctx.key+'Vertices'+key;input.autocomplete='off';input.setAttribute('aria-label',label);FormEvents.submitOnEnter(input,()=>ctx.check('final'));l.append(input);return l;
 }
 function select(ctx,v,key='value',mode='sequence'){ctx.edit(s=>{if(mode==='set')s.chosen=s.chosen.includes(v)?s.chosen.filter(x=>x!==v):[...s.chosen,v];else s.chosen.push(v);s.answers[key]=s.chosen.map(L).join(', ');s.noPath=false;});}
 function path(ctx){ctx.ui.body.append(vertexEntry(ctx,'Your path','path'));if(ctx.s.chosen.length)ctx.ui.body.append(K.button('Remove Last',()=>ctx.edit(s=>{s.chosen.pop();s.answers.path=s.chosen.map(L).join(', ');})));const none=E('input');none.type='checkbox';none.checked=!!ctx.s.noPath;none.onchange=()=>ctx.edit(s=>{s.noPath=none.checked;if(none.checked){s.chosen=[];s.answers.path='';}});const l=E('label');l.append(none,E('span',' Target Unreachable'));ctx.ui.body.append(l);if(ctx.p.askCost)ctx.ui.body.append(CompactQuiz.field(ctx,'Total path cost','cost',true));}
 function trace(ctx){
  const p=ctx.p,s=ctx.s,stage=s.stages[s.active],tabs=E('div',undefined,'cq-stage-tabs');s.stages.forEach((st,i)=>{const b=K.button('Step '+(i+1),()=>ctx.edit(x=>x.active=i));b.dataset.traceStage=i;b.setAttribute('aria-pressed',String(i===s.active));tabs.append(b);});ctx.ui.body.append(tabs);
  const given=stage.before;ctx.ui.body.append(E('p',p.traceMode==='dag'?'Previously processed: '+(given.order.map(L).join(', ')||'none'):'Given FIFO queue / previous recorded entry: '+((given.queueText??given.queue.map(L).join(', '))||'none'),'cq-file'));
  const vertex=K.select([['','Choose'],...Array.from({length:p.g.n},(_,v)=>[String(v),L(v)])],stage.processed===null?'':String(stage.processed),value=>ctx.edit(x=>{const st=x.stages[x.active];st.processed=value===''?null:Number(value);st.dirty=true;}));vertex.id=ctx.key+'ProcessVertex';ctx.ui.body.append(K.field('Vertex to process',vertex),table(ctx,{dist:stage.dist,prev:stage.prev,before:given,tentative:true,mark:()=>stage.dirty=true}));
  if(p.traceMode!=='dag'){const l=E('label','Queue after processing: ','cq-field'),input=K.input(stage.queue,v=>ctx.edit(x=>{const st=x.stages[x.active];st.queue=v;st.dirty=true;}));input.id=ctx.key+'QueueAfter';input.setAttribute('aria-label','FIFO queue after this step');l.append(input);ctx.ui.body.append(l,E('p','Enter queue labels in order, or none. Examine outgoing neighbors in alphabetical order; enqueue improved vertices only if not already waiting.','cq-help'));}
  const record=K.button('Record Stage',()=>C.recordTrace(ctx));record.dataset.graphRecord='true';ctx.ui.body.append(record);
 }
 function solution(p){const r=p.ref,items=[E('p','Source: '+L(p.source)+'.'),K.table(['Vertex','Distance','One predecessor'],r.dist.map((d,v)=>[L(v),K.fmt(d),r.prev[v]===null?'—':L(r.prev[v])]))];if(p.traceMode){const tr=C.trace(p.g,p.source,p.traceMode,p.traceMode==='dag'?r.order:null);items.push(K.list(tr.states.map(st=>'Process '+L(st.after.u)+': '+(st.after.updates.map(x=>L(x.v)+' '+K.fmt(x.old)+' → '+K.fmt(x.dist)+', previous '+L(x.prev)).join('; ')||'no improvements')+(p.traceMode==='dag'?'':' · queue ['+st.after.queue.map(L).join(', ')+']')+'.')));}return items;}
 return{distance,table,layout,vertexEntry,select,path,trace,solution};
})();

const TopoQuestions=(()=>{
 const G=GraphCore,C=GraphExamCore,L=C.L;
 const modes={construct:'Topological Order',indegree:'Indegree Updates',eligible:'Eligible Vertices',cycles:'Cycle Detection',concepts:'DAG Concepts'};
 function generate(cfg){const r=G.rng(cfg.seed+cfg.mode),n=G.integer(r,...{easy:[4,5],medium:[6,8],hard:[9,12]}[cfg.difficulty]),g=G.dag(n,r,cfg.mode==='cycles'&&r()<.55),ref=G.kahn(g),p={cfg,g,ref,kind:cfg.mode,title:'Question',weighted:false,fields:[],steps:[],contract:'No correctness feedback is given until Check Answer.'};
  p.prefix=cfg.mode==='eligible'||cfg.mode==='indegree'&&r()<.65?ref.order.slice(0,G.integer(r,0,Math.min(n-2,cfg.difficulty==='easy'?1:3))):[];
  p.initial={answers:{},chosen:[],stages:[],active:0};
  if(cfg.mode==='construct')p.question='Give any complete topological order. Click vertices in order or enter comma-separated labels.';
  if(cfg.mode==='eligible')p.question='Removed: '+(p.prefix.map(L).join(', ')||'none')+'. Select every remaining vertex that may be processed next.';
  if(cfg.mode==='indegree'){p.multi=cfg.difficulty!=='easy'&&r()<.6;p.single=!p.multi&&r()<.4;p.vertex=G.integer(r,0,n-1);if(p.prefix.includes(p.vertex))p.vertex=Array.from({length:n},(_,v)=>v).find(v=>!p.prefix.includes(v));p.removals=p.multi?(cfg.difficulty==='hard'?3:2):0;p.initial.stages=[{removed:p.prefix.slice(),values:Array(n).fill(null),next:null}];p.question=p.multi?'Starting with '+(p.prefix.map(L).join(', ')||'no vertices')+' removed, enter remaining indegrees, then choose and record '+p.removals+' further removals. Include the table after the last removal.':'Removed: '+(p.prefix.map(L).join(', ')||'none')+'. Calculate '+(p.single?'the remaining indegree of '+L(p.vertex):'all remaining indegrees')+'.';}
  if(cfg.mode==='cycles'){p.witness=r()<.6;p.question='Does a topological ordering exist?'+(p.witness?' If not, provide any directed cycle (repeat the starting vertex to close it).':'');p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:ref.cyclic?'no':'yes'}];}
  if(cfg.mode==='concepts'){const v=G.integer(r,0,4);p.concept=['complexity','positiveIndegree','multipleOrders','cycle','dag'][v];p.showGraph=false;const questions=[['A queue-based topological sort uses adjacency lists. What is its running time?','linear',[['linear','O(|V| + |E|)'],['square','O(|V|²)'],['log','O(log |V|)']],'Each vertex enters the queue once; each directed edge causes one indegree decrement.'],['Why can a vertex with positive remaining indegree not be processed next?','dependency',[['dependency','An unprocessed prerequisite remains'],['weight','Its edges have positive weights'],['last','It must always be last']],'A remaining incoming edge means its predecessor has not been processed.'],['Can one DAG have several valid topological orders?','yes',[['yes','Yes'],['no','No']],'Independent zero-indegree choices may be taken in different orders.'],['A topological process stops before all vertices are removed and no remaining vertex has indegree zero. What follows?','cycle',[['cycle','The remaining graph contains a directed cycle'],['dag','The graph is a DAG'],['empty','All vertices have been processed']],'Every remaining vertex has an incoming dependency; following these dependencies in a finite graph reaches a directed cycle.'],['Which condition defines a DAG?','dag',[['dag','Directed and acyclic'],['connected','Undirected and connected'],['positive','All edge weights positive']],'DAG means directed acyclic graph.']];const q=questions[v];p.question=q[0];p.fields=[{key:'choice',type:'choice',choices:q[2],expected:q[1]}];p.steps=[q[3]];}
  return p;
 }
 function check(p,s){if(p.kind==='concepts')return CompactQuiz.gradeFields(p,s);if(p.kind==='construct'){const a=C.vertices(s.answers.value,p.g.n);return a?G.topoValid(p.g,a):{ok:false,message:'Enter a complete vertex ordering.'};}if(p.kind==='eligible'){const a=C.vertices(s.answers.value,p.g.n),want=G.eligible(p.g,p.prefix);return{ok:!!a&&a.length===new Set(a).size&&a.length===want.length&&a.every(v=>want.includes(v)),message:'Check the complete set of remaining zero-indegree vertices.'};}
  if(p.kind==='indegree'){if(s.stages.length!==p.removals+1)return{ok:false,message:'Record all requested removals and the final indegree table.'};let removed=p.prefix.slice();for(let i=0;i<s.stages.length;i++){const st=s.stages[i],deg=G.degrees(p.g,removed),vertices=p.single?[p.vertex]:deg.map((_,v)=>v).filter(v=>!removed.includes(v));if(st.removed.join()!==removed.join()||vertices.some(v=>st.values[v]!==deg[v]))return{ok:false,message:'Recheck the indegree table at stage '+(i+1)+'.'};if(i<p.removals){if(!G.eligible(p.g,removed).includes(st.next))return{ok:false,message:'A recorded removal has an unprocessed prerequisite or repeats a vertex.'};removed.push(st.next);}}return{ok:true,message:'Correct indegrees and removal stages.'};}
  const conclusion=CompactQuiz.gradeFields(p,s);if(!conclusion.ok)return conclusion;if(p.ref.cyclic&&p.witness){const a=C.vertices(s.answers.value,p.g.n);if(!a||a.length<3||a[0]!==a.at(-1)||new Set(a.slice(0,-1)).size!==a.length-1||!a.slice(1).every((v,i)=>p.g.edges.some(e=>e.u===a[i]&&e.v===v)))return{ok:false,message:'Supply a closed directed cycle without repeated interior vertices.'};}return{ok:true,message:'Correct classification and cycle evidence where requested.'};
 }
 return{modes,generate,check};
})();
const TopoLab=(()=>{
 const K=LabKit,E=K.E,C=GraphExamCore,U=GraphExamUI,Q=TopoQuestions,G=GraphCore,L=K.letter;
 const adapter={modes:Q.modes,signature:ctx=>ctx.s,generate:Q.generate,check:ctx=>Q.check(ctx.p,ctx.s),render(ctx){const p=ctx.p,s=ctx.s;if(p.showGraph===false){CompactQuiz.renderFields(ctx);return;}const done=p.kind==='indegree'?s.stages[s.active].removed:p.prefix||[];U.layout(ctx,()=>{
   if(['construct','eligible'].includes(p.kind)){ctx.ui.body.append(U.vertexEntry(ctx,p.kind==='eligible'?'Eligible vertices':'Your order','value',p.kind==='eligible'?'set':'sequence'));if(s.chosen.length)ctx.ui.body.append(K.button('Remove Last',()=>ctx.edit(x=>{x.chosen.pop();x.answers.value=x.chosen.map(L).join(', ');})));}
   if(p.kind==='cycles'){CompactQuiz.renderFields(ctx);if(p.witness)ctx.ui.body.append(U.vertexEntry(ctx,'Cycle if no order exists'));}
   if(p.kind==='indegree'){const stage=s.stages[s.active],tabs=E('div',undefined,'ge-stages');s.stages.forEach((st,i)=>{const b=K.button(i===0?'Initial':'Removal '+i,()=>ctx.edit(x=>x.active=i));b.setAttribute('aria-pressed',String(s.active===i));tabs.append(b);});ctx.ui.body.append(tabs,E('p','Removed: '+(stage.removed.map(L).join(', ')||'none')));const rows=[];for(let v=0;v<p.g.n;v++)if(!stage.removed.includes(v)&&(!p.single||v===p.vertex)){const input=K.input(stage.values[v]??'',raw=>ctx.edit(x=>x.stages[x.active].values[v]=C.numeric(raw)));input.id='topoDegree'+v;input.setAttribute('aria-label','Remaining indegree '+L(v));FormEvents.submitOnEnter(input,()=>ctx.check('final'));rows.push([L(v),input]);}ctx.ui.body.append(K.table(['Vertex','Remaining indegree'],rows));if(p.multi&&s.active<p.removals){const choose=K.select([['','Choose'],...Array.from({length:p.g.n},(_,v)=>[String(v),L(v)])],stage.next===null?'':stage.next,value=>ctx.edit(x=>x.stages[x.active].next=value===''?null:Number(value)));ctx.ui.body.append(K.field('Remove next',choose),K.button('Record Removal',()=>{if(stage.next===null){ctx.msg('Choose the vertex to remove.');return;}ctx.edit(x=>{const st=x.stages[x.active];x.stages=x.stages.slice(0,x.active+1);x.stages.push({removed:[...st.removed,st.next],values:st.values.slice(),next:null});x.active++;});}));}}
  },{known:done,selectedVertices:s.chosen,vertexClick:['construct','eligible','cycles'].includes(p.kind)?v=>U.select(ctx,v,'value',p.kind==='eligible'?'set':'sequence'):undefined});},
  solution(ctx){const p=ctx.p;if(p.kind==='concepts')return K.list(p.steps);const cycle=G.cycle(p.g);if(cycle)return[E('p','One directed cycle: '+[...cycle,cycle[0]].map(L).join(' → ')+'. A topological order cannot place every predecessor before its successor around this cycle.')];const order=p.ref.order,items=[E('p','One valid order: '+order.map(L).join(', ')+'. Alternative valid orders are accepted.'),K.table(['Vertex','Initial indegree'],G.degrees(p.g).map((d,v)=>[L(v),d]))];if(p.kind==='eligible')items.push(E('p','After the given removals, eligible vertices are '+G.eligible(p.g,p.prefix).map(L).join(', ')+'.'));items.push(K.list(order.map((v,i)=>'Remove '+L(v)+' from the zero-indegree set {'+G.eligible(p.g,order.slice(0,i)).map(L).join(', ')+'}; remove outgoing edges to '+(p.g.edges.filter(e=>e.u===v).map(e=>L(e.v)).join(', ')||'none')+'.')));return items;}};
 const ctx=CompactQuiz.attach(K.create('topo','Topological Sort / DAGs','',adapter),'pp. 362–364','A topological order includes every vertex once, with each directed edge pointing forward in the order. Repeatedly remove a zero-indegree vertex and its outgoing edges. Different eligible choices are valid. A directed cycle prevents a complete order. Queue-based adjacency-list processing takes O(|V| + |E|).');return{ctx,adapter};
})();


// Dijkstra-only graphs: geometric topology, bounded source degree, measured work.
const DijkstraGraph=(()=>{
 const C=GraphCore;
 function shuffle(a,r){for(let i=a.length-1;i;i--){const j=C.integer(r,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
 function positions(n,r){
  const columns=Math.ceil(Math.sqrt(n*1.5)),rows=Math.ceil(n/columns),flipX=r()<.5,flipY=r()<.5,stagger=r()<.5;
  return shuffle(Array.from({length:n},(_,v)=>{
   const row=Math.floor(v/columns),col=v%columns,count=Math.min(columns,n-row*columns);
   let x=110+(col+(columns-count)/2)*650/(columns-1)+(r()-.5)*42,y=95+row*365/(rows-1)+(r()-.5)*34;
   if(stagger&&row%2)x+=28;
   return{x:flipX?900-x:x,y:flipY?550-y:y};
  }),r);
 }
 const orient=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 function crosses(a,b,c,d){return orient(a,b,c)*orient(a,b,d)<0&&orient(c,d,a)*orient(c,d,b)<0;}
 function clearance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
 function metrics(g,source){
  const ref=C.dijkstra(g,source),seen=Array(g.n).fill(false),improved=new Set();let improvements=0;
  for(const step of ref.steps)for(const update of step.updates){if(seen[update.v]){improvements++;improved.add(update.v);}seen[update.v]=true;}
  const arcs=C.arcs(g),hops=Array(g.n).fill(Infinity),q=[source];hops[source]=0;
  for(let i=0;i<q.length;i++)for(const e of arcs)if(e.u===q[i]&&ref.dist[e.u]+e.w===ref.dist[e.v]&&hops[e.v]===Infinity){hops[e.v]=hops[e.u]+1;q.push(e.v);}
  const competing=ref.dist.filter((d,v)=>v!==source&&arcs.filter(e=>e.v===v&&ref.dist[e.u]<=d&&e.u!==v).length>=2).length;
  return{improvements,improvedVertices:improved.size,maxHops:Math.max(...hops),competing,sourceDegree:arcs.filter(e=>e.u===source).length,reachable:ref.dist.every(Number.isFinite),hops};
 }
  function demand(d,m,n){return m.reachable&&m.sourceDegree<=Math.min(d==='easy'?2:3,Math.floor(n/2))&&m.maxHops>=(d==='hard'?3:d==='medium'?2:1)&&m.improvements>=(d==='hard'?3:d==='medium'?1:0)&&m.improvedVertices>=(d==='hard'?2:d==='medium'?1:0)&&m.competing>=(d==='hard'?3:d==='medium'?2:1);}
 function generate(difficulty,r,requestedSource=0,directed=true){
   const n=C.integer(r,...{easy:[4,5],medium:[6,7],hard:[8,10]}[difficulty]),source=Math.max(0,Math.min(n-1,Number(requestedSource)||0)),wantCycle=false;
  for(let attempt=0;attempt<400;attempt++){
   const pos=positions(n,r),pairs=[],all=[],sourceLimit=Math.min(difficulty==='easy'?2:3,Math.floor(n/2));
   for(let u=0;u<n;u++)for(let v=u+1;v<n;v++)if(pos.every((p,k)=>k===u||k===v||clearance(p,pos[u],pos[v])>60))all.push({u,v,length:Math.hypot(pos[u].x-pos[v].x,pos[u].y-pos[v].y)*(0.8+r()*.4)});
   const feasible=(u,v)=>!pairs.some(e=>e.u===u&&e.v===v||e.u===v&&e.v===u||![u,v].includes(e.u)&&![u,v].includes(e.v)&&crosses(pos[u],pos[v],pos[e.u],pos[e.v]));
   const reached=new Set([source]),rank=Array(n).fill(null);rank[source]=0;let sourceDegree=0;
   while(reached.size<n){
    const choices=all.filter(e=>reached.has(e.u)!==reached.has(e.v)&&(!(e.u===source||e.v===source)||sourceDegree<sourceLimit)&&feasible(e.u,e.v)).sort((a,b)=>a.length-b.length);
    if(!choices.length)break;
    const e=choices[C.integer(r,0,Math.min(2,choices.length-1))],u=reached.has(e.u)?e.u:e.v,v=u===e.u?e.v:e.u;
    pairs.push({u,v});if(u===source)sourceDegree++;rank[v]=reached.size;reached.add(v);
   }
   if(reached.size<n)continue;
    const target=C.integer(r,Math.ceil(n*(difficulty==='easy'?1.1:difficulty==='medium'?1.45:1.7)),Math.ceil(n*(difficulty==='easy'?1.35:difficulty==='medium'?1.75:2.05)));
   for(const e of all.sort((a,b)=>a.length-b.length)){
    if(pairs.length>=target)break;if(!feasible(e.u,e.v))continue;
    let u=e.u,v=e.v;if(rank[u]>rank[v])[u,v]=[v,u];if(directed&&wantCycle&&r()<.65)[u,v]=[v,u];
    if((u===source||!directed&&v===source)&&sourceDegree>=sourceLimit)continue;
    pairs.push({u,v});if(u===source||!directed&&v===source)sourceDegree++;
   }
   const bare=C.graph(n,pairs,directed);if(directed&&!!C.cycle(bare)!==wantCycle)continue;
   for(let weights=0;weights<45;weights++){
     const g=C.graph(n,pairs.map(e=>({...e,w:C.integer(r,0,difficulty==='easy'?10:difficulty==='medium'?15:20)})),true),complexity=metrics(g,source);
     if(demand(difficulty,complexity,n)){g.positions=pos;return{g,source,complexity};}
   }
  }
  throw Error('Could not generate a varied Dijkstra problem. Try another seed.');
 }
 // Keep the supplied distances out of incident arrows as well as weight labels.
 function subtitles(g){
  const boxes=[],result=[],pos=g.positions,overlap=(a,b)=>a.x<b.x+b.w+5&&a.x+a.w+5>b.x&&a.y<b.y+b.h+5&&a.y+a.h+5>b.y;
  const hits=(a,b,box)=>{const corners=[{x:box.x,y:box.y},{x:box.x+box.w,y:box.y},{x:box.x+box.w,y:box.y+box.h},{x:box.x,y:box.y+box.h}],inside=p=>p.x>=box.x&&p.x<=box.x+box.w&&p.y>=box.y&&p.y<=box.y+box.h;return inside(a)||inside(b)||corners.some((c,i)=>crosses(a,b,c,corners[(i+1)%4]));};
  for(let v=0;v<g.n;v++){
   const candidates=[];for(const radius of [43,60,80,105,135,175])for(const dx of [-radius,-radius/2,0,radius/2,radius])for(const dy of [-radius,-radius/2,0,radius/2,radius])if(dx||dy)candidates.push({x:pos[v].x+dx,y:pos[v].y+dy,score:Math.hypot(dx,dy)+(dy>0?0:8)});
   const point=candidates.sort((a,b)=>a.score-b.score).find(p=>{const box={x:p.x-50,y:p.y-14,w:100,h:20};return box.x>10&&box.x+box.w<890&&box.y>10&&box.y+box.h<580&&!boxes.some(b=>overlap(box,b))&&!pos.some(q=>Math.hypot(q.x-Math.max(box.x,Math.min(q.x,box.x+box.w)),q.y-Math.max(box.y,Math.min(q.y,box.y+box.h)))<30)&&!g.edges.some(e=>hits(pos[e.u],pos[e.v],box));});
   if(!point)throw Error('Could not place a given distance clear of graph edges.');
   result.push({x:point.x,y:point.y});boxes.push({x:point.x-50,y:point.y-14,w:100,h:20});
  }
  return result;
 }
 const subtitleModels=new WeakMap();function givenPositions(g){if(!subtitleModels.has(g))subtitleModels.set(g,subtitles(g));return subtitleModels.get(g);}
 return{generate,metrics,demand,crosses,clearance,givenPositions};
})();

// Distance answers use an explicit infinity state; blanks remain unanswered.
const DistanceAnswer=(()=>{
 function control(ctx,vertex,key,attribute){
  const K=LabKit,E=K.E,value=ctx.s[key][vertex],marked=value===Infinity,row=E('div',undefined,'distance-entry');
  const input=K.input(marked?'':value??'',text=>ctx.edit(answer=>{const trimmed=text.trim();answer[key][vertex]=trimmed===''?null:/^[+-]?\d+$/.test(trimmed)?Number(trimmed):NaN;}));
  input.dataset[attribute]=vertex;input.disabled=marked;input.placeholder='Integer';input.setAttribute('aria-label','Distance to '+K.letter(vertex));
  const checkbox=E('input');checkbox.type='checkbox';checkbox.checked=marked;checkbox.dataset.distanceUnreachable=vertex;checkbox.setAttribute('aria-label',K.letter(vertex)+' is unreachable');
  const label=E('label',undefined,'distance-unreachable');label.append(checkbox,E('span','Unreachable'));
  checkbox.onchange=()=>{const checked=checkbox.checked;ctx.edit(answer=>answer[key][vertex]=checked?Infinity:null);const target=checked?ctx.ui.body.querySelector('input[data-distance-unreachable="'+vertex+'"]'):ctx.ui.body.querySelector('[data-'+attribute.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+'="'+vertex+'"]');target?.focus({preventScroll:true});};
  row.append(input,label);return row;
 }
 return{control};
})();

const DijkstraQuestions=(()=>{
 const G=GraphCore,C=GraphExamCore,L=C.L,modes={table:'Complete Table',iteration:'One Iteration',relax:'Relaxation',path:'Shortest Path',complexity:'Complexity'};
 function generate(cfg){const r=G.rng(cfg.seed+cfg.mode),kind=cfg.mode,p={cfg,kind,title:'Question',fields:[],steps:[],weighted:true,showGraph:true,contract:'Strict improvement changes a predecessor; equal candidates retain it. Submit only when your answer is complete.'};
  p.initial={answers:{},chosen:[],noPath:false};
   if(kind==='complexity'){p.showGraph=false;const ci=G.integer(r,0,3),q=[['Using adjacency lists and a binary heap, what is Dijkstra’s running-time bound?','heap',[['heap','O((|V| + |E|) log |V|)'],['linear','O(|V| + |E|)'],['square','O(|V|²)']],'Each vertex is extracted once, and edge relaxations may update heap priorities.'],['Using an array to scan all unknown vertices for the minimum, what is the standard running-time bound?','square',[['square','O(|V|²)'],['log','O(log |V|)'],['linear','O(|V| + |E|)']],'Repeated linear minimum selection costs O(|V|²); adjacency-matrix scanning has the same bound.'],['Why must ordinary Dijkstra require nonnegative edge weights?','known',[['known','A later path through an unknown vertex must not reduce a finalized distance'],['positive','Every path must have positive total cost'],['cycles','The graph must have no cycles']],'A negative edge can improve a distance after its vertex was finalized. Zero-weight edges are allowed.'],['Which unknown vertex may be finalized next?','min',[['min','One with the smallest finite tentative distance'],['edge','One incident to the globally lightest edge'],['largest','One with the largest tentative distance']],'Tentative values represent source-to-vertex path costs. Equal minimum choices are allowed.']][ci];p.concept=['heap','array','nonnegative','nextVertex'][ci];p.question=q[0];p.fields=[{key:'choice',type:'choice',choices:q[2],expected:q[1]}];p.steps=[q[3]];return p;}
   if(kind==='relax'&&r()<.35){p.showGraph=false;p.variant='beforeAfter';const du=G.integer(r,0,24),dv=G.integer(r,du+1,45),w=G.integer(r,0,12),candidate=du+w,oldPrev=r()<.5?'W':'none',improves=candidate<dv,after=improves?candidate:dv,afterPrev=improves?'U':oldPrev;p.question='Before relaxing U → V: d[U] = '+du+', d[V] = '+dv+', previous[V] = '+oldPrev+'. Edge weight w(U,V) = '+w+'. Give the after-state under strict-improvement relaxation.';p.fields=[{key:'distance',type:'number',label:'After d[V]',expected:after},{key:'predecessor',type:'choice',label:'After previous[V]',choices:[['U','U'],['W','W'],['none','none']],expected:afterPrev}];p.steps=['Candidate = '+du+' + '+w+' = '+candidate+'. Since '+candidate+(improves?' < ':' ≥ ')+dv+', after d[V] = '+after+' and previous[V] = '+afterPrev+'.'];return p;}
   if(kind==='relax'){p.showGraph=false;const du=G.integer(r,0,30),dv=G.integer(r,0,45),w=G.integer(r,0,12),candidate=du+w;p.du=du;p.dv=dv;p.w=w;p.variant=['distance','improve','predecessor','competing'][G.integer(r,0,3)];p.question='For edge U → V, d[U] = '+du+', d[V] = '+dv+', and weight = '+w+'. ';if(p.variant==='distance'){p.question+='Give d[V] after strict-improvement relaxation.';p.fields=[{key:'value',type:'number',label:'New tentative distance',expected:Math.min(dv,candidate)}];}else if(p.variant==='competing'){const choices=Array.from({length:3},()=>({d:G.integer(r,0,25),w:G.integer(r,0,12)}));p.candidates=choices;p.question='Current d[V] = '+dv+'. Three incoming candidates have (distance to predecessor, edge weight): '+choices.map(x=>'('+x.d+', '+x.w+')').join(', ')+'. Give d[V] after all three relaxations.';p.fields=[{key:'value',type:'number',label:'Updated distance',expected:Math.min(dv,...choices.map(x=>x.d+x.w))}];p.steps=['Candidate path costs are '+choices.map(x=>x.d+' + '+x.w+' = '+(x.d+x.w)).join('; ')+'. Compare all of them with the old distance '+dv+'. The minimum is '+p.fields[0].expected+'.'];return p;}else{p.question+=p.variant==='improve'?'Does this relaxation strictly improve d[V]?':'Should previous[V] change to U under strict-improvement relaxation?';p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:candidate<dv?'yes':'no'}];}p.steps=['Candidate = '+du+' + '+w+' = '+candidate+'. New d[V] = min('+dv+', '+candidate+') = '+Math.min(dv,candidate)+'. '+(candidate<dv?'Set previous[V] to U.':'Retain previous[V], including on equality.')];return p;}

   const made=DijkstraGraph.generate(cfg.difficulty,r,0,true),perm=QuizGraphCore.shuffle(Array.from({length:made.g.n},(_,v)=>v),r);p.g={...made.g,edges:made.g.edges.map(e=>({...e,u:perm[e.u],v:perm[e.v]})),directed:true};if(made.g.positions){p.g.positions=Array(made.g.n);made.g.positions.forEach((point,v)=>p.g.positions[perm[v]]=point);}p.source=perm[made.source];p.ref=G.dijkstra(p.g,p.source);p.target=G.integer(r,0,p.g.n-1);if(p.target===p.source)p.target=(p.target+1)%p.g.n;
  p.initial.dist=Array(p.g.n).fill(null);p.initial.prev=Array(p.g.n).fill(null);p.initial.known=Array(p.g.n).fill(false);
   if(kind==='table'){p.distanceTable=true;p.initial.rows=Array.from({length:p.g.n},()=>({vertex:'',dist:Array(p.g.n).fill('')}));p.question='Using Dijkstra’s algorithm, starting from the specified source vertex, fill in the table below. Each row must show the vertex finalized and the tentative distance to every vertex after relaxing its outgoing edges.';}
  if(kind==='path'){p.askCost=r()<.55;p.question='Give any minimum-cost path from '+L(p.source)+' to '+L(p.target)+(p.askCost?' and its total cost.':'.')+' Mark Target Unreachable if no path exists.';}
  if(kind==='iteration'){const count=G.integer(r,0,Math.max(0,p.ref.steps.length-1));p.before=count?{dist:p.ref.steps[count-1].dist.slice(),prev:p.ref.steps[count-1].prev.slice(),known:p.ref.steps[count-1].known.slice(),order:p.ref.steps.slice(0,count).map(x=>x.u),queue:[]}:C.initial(p.g,p.source,'dijkstra');p.initial.dist=p.before.dist.slice();p.initial.prev=p.before.prev.slice();p.initial.known=p.before.known.slice();p.initial.next=null;p.question='Given the before-state from source '+L(p.source)+', select a minimum finite unknown vertex and perform one full Dijkstra iteration. Update Known, distances, and predecessors; retain the previous predecessor on equal cost.';}
  return p;
 }
  function check(p,s){if(p.distanceTable){const rowCount=p.ref.steps.length;if(!Array.isArray(s.rows)||s.rows.length!==rowCount)return{ok:false,message:'Complete every row of the table before checking your answer.'};let dist=Array(p.g.n).fill(Infinity),known=Array(p.g.n).fill(false);dist[p.source]=0;for(let i=0;i<rowCount;i++){const row=s.rows[i];if(!row||row.vertex===''||!Array.isArray(row.dist)||row.dist.length!==p.g.n||row.dist.some(v=>String(v).trim()===''))return{ok:false,message:'Complete every finalized-vertex choice and every distance cell before checking.'};const v=Number(row.vertex);if(!Number.isInteger(v)||v<0||v>=p.g.n)return{ok:false,message:'Choose a valid vertex in every row.'};const eligible=dist.map((d,u)=>!known[u]&&Number.isFinite(d)?u:null).filter(u=>u!==null);if(!eligible.length||!eligible.includes(v)||dist[v]!==Math.min(...eligible.map(u=>dist[u])))return{ok:false,message:'Row '+(i+1)+' must finalize a vertex with the smallest finite tentative distance.'};known[v]=true;for(const e of p.g.edges)if(e.u===v&&!known[e.v])dist[e.v]=Math.min(dist[e.v],dist[v]+e.w);const parsed=row.dist.map(raw=>{const x=String(raw).trim().toLowerCase();if(['∞','inf','infinity'].includes(x))return Infinity;if(/^\d+$/.test(x))return Number(x);return NaN;});if(parsed.some((x,u)=>x!==dist[u]))return{ok:false,message:'Check every distance in row '+(i+1)+', including values that did not change.'};}return{ok:true,message:'Correct. Every row follows a valid Dijkstra finalization and relaxation sequence.'};}if(p.fields.length)return CompactQuiz.gradeFields(p,s);if(p.kind==='path')return C.pathCheck(p,s);if(p.kind==='table')return C.tableCheck(p,s,true,true);const eligible=p.before.dist.map((d,v)=>!p.before.known[v]&&Number.isFinite(d)?v:null).filter(v=>v!==null),min=Math.min(...eligible.map(v=>p.before.dist[v]));if(!eligible.includes(s.next)||p.before.dist[s.next]!==min)return{ok:false,message:'Select an unknown vertex with the minimum finite tentative distance.'};const after=C.step(p.g,'dijkstra',p.before,s.next);return{ok:s.dist.every((d,v)=>d===after.dist[v])&&s.prev.every((v,i)=>v===after.prev[i])&&s.known.every((v,i)=>v===after.known[i]),message:'Recheck the complete after-state, including strict-improvement predecessors and Known flags.'};}
 return{modes,generate,check};
})();
 const DijkstraLab=(()=>{
  const K=LabKit,E=K.E,Q=DijkstraQuestions,U=GraphExamUI,C=GraphExamCore;
   const adapter={modes:{table:'Complete Distance Table'},signature:ctx=>ctx.s,generate:Q.generate,check:ctx=>Q.check(ctx.p,ctx.s),render(ctx){const p=ctx.p,s=ctx.s;ctx.ui.taskTitle.textContent='Complete Distance Table';if(p.distanceTable){const source=E('p','Source vertex: v'+(p.source+1),'dijkstra-source'),graph=K.graphView(ctx,p.g,{source,positions:p.g.positions,weighted:true,vertexLabel:v=>'v'+(v+1)}),figure=E('div',undefined,'dijkstra-graph');figure.append(graph);const table=E('table',undefined,'nl-table dijkstra-table'),head=E('tr');['After finalizing',...Array.from({length:p.g.n},(_,v)=>'d'+(v+1))].forEach(text=>head.append(E('th',text)));const thead=E('thead');thead.append(head);table.append(thead);const body=E('tbody');s.rows.forEach((row,i)=>{const tr=E('tr'),td=E('td'),select=K.select([['','Choose'],...Array.from({length:p.g.n},(_,v)=>[String(v),'v'+(v+1)])],row.vertex,value=>{ctx.save();row.vertex=value;ctx.ui.solution.hidden=true;ctx.msg('');});select.setAttribute('aria-label','Vertex finalized in row '+(i+1));td.append(select);tr.append(td);row.dist.forEach((value,v)=>{const cell=E('td'),input=E('input');input.type='text';input.value=value;input.autocomplete='off';input.spellcheck=false;input.placeholder='∞ or integer';input.setAttribute('aria-label','Row '+(i+1)+', distance to v'+(v+1));let savedEdit=false;input.oninput=()=>{if(!savedEdit){ctx.save();savedEdit=true;}row.dist[v]=input.value;ctx.ui.solution.hidden=true;ctx.msg('');};input.onblur=()=>{savedEdit=false;};cell.append(input);tr.append(cell);});body.append(tr);});table.append(body);const wrap=E('div',undefined,'dijkstra-table-wrap');wrap.append(table);ctx.ui.body.append(source,figure,wrap);return;}if(!p.showGraph){CompactQuiz.renderFields(ctx);return;}U.layout(ctx,()=>{if(p.kind==='path')U.path(ctx);else{if(p.kind==='iteration'){const select=K.select([['','Choose'],...Array.from({length:p.g.n},(_,v)=>[String(v),K.letter(v)])],s.next===null?'':s.next,raw=>ctx.edit(x=>x.next=raw===''?null:Number(raw)));ctx.ui.body.append(K.field('Finalize vertex',select));}ctx.ui.body.append(U.table(ctx,{known:s.known,before:p.before,tentative:p.kind==='iteration'}));}},{source:p.source,known:p.before?.known.flatMap((yes,v)=>yes?[v]:[]),selectedVertices:s.chosen,vertexClick:p.kind==='path'?v=>U.select(ctx,v,'path'):undefined});},solution(ctx){const p=ctx.p;if(p.distanceTable){const rows=p.ref.steps.map(step=>['v'+(step.u+1),...step.dist.map(value=>value===Infinity?'∞':String(value))]);return[E('p','One valid chronological solution from source v'+(p.source+1)+'. Any tied minimum choices are accepted if each following row is consistent.'),K.table(['After finalizing',...Array.from({length:p.g.n},(_,v)=>'d'+(v+1))],rows)];}if(p.fields.length)return K.list(p.steps);if(p.kind==='iteration'){const possible=p.before.dist.map((d,v)=>!p.before.known[v]&&Number.isFinite(d)?v:null).filter(v=>v!==null),min=Math.min(...possible.map(v=>p.before.dist[v])),u=possible.find(v=>p.before.dist[v]===min),after=C.step(p.g,'dijkstra',p.before,u);return[E('p','One valid choice is '+K.letter(u)+' with tentative distance '+min+'. Tied choices are accepted.'),K.table(['Vertex','Known','Distance','Previous'],after.dist.map((d,v)=>[K.letter(v),after.known[v]?'yes':'no',K.fmt(d),after.prev[v]===null?'none':K.letter(after.prev[v])])),K.list(after.updates.map(x=>'Relax '+K.letter(u)+' → '+K.letter(x.v)+': '+K.fmt(x.old)+' → '+K.fmt(x.dist)+'.'))];}const items=U.solution(p);items.push(K.list(p.ref.steps.map(step=>'Finalize '+K.letter(step.u)+'. '+(step.updates.map(x=>'d['+K.letter(x.v)+'] = '+x.dist+', previous = '+K.letter(step.u)).join('; ')||'No strict improvement.'))));if(p.kind==='path')items.push(E('p',Number.isFinite(p.ref.dist[p.target])?'One shortest path: '+QuizGraphCore.path(p.ref,p.target).map(K.letter).join(' → ')+', cost '+p.ref.dist[p.target]+'.':'Target is unreachable.'));return items;}};
  const ctx=CompactQuiz.attach(K.create('dijkstra',"Dijkstra's Algorithm",'',adapter),'Weiss, pp. 372–377','Use directed edges with nonnegative integer weights. Enter every distance in every row; use ∞, inf, or infinity for an unreachable distance.');
  for(const mode in Q.modes)if(!ctx.stats[mode]){ctx.stats[mode]={};for(const difficulty of ['easy','medium','hard'])ctx.stats[mode][difficulty]={solved:0,correct:0,incorrect:0};}
  const root=K.$('dijkstraSection'),settings=root.querySelector('.nl-settings'),actions=ctx.ui.workspace.querySelector('.bh-actions'),newButton=K.button('New Problem',()=>{ctx.mode='table';ctx.start(true);},'accent');ctx.ui.seed.parentElement.remove();settings.querySelector('button').remove();settings.append(newButton);ctx.ui.mastery.hidden=true;actions.querySelector('button.accent').hidden=true;ctx.ui.taskTitle.textContent='Complete Distance Table';ctx.ui.contract.hidden=true;ctx.ui.question.textContent='Using Dijkstra’s algorithm, starting from the specified source vertex, fill in the table below. Each row must show the vertex finalized and the tentative distance to every vertex after relaxing its outgoing edges.';
  return{ctx,adapter};
 })();


const FlowQuestions=(()=>{
 const G=GraphCore,L=(v,n)=>v===0?'s':v===n-1?'t':String.fromCharCode(96+v),modes={maximum:'Maximum Flow',augment:'Augmenting Path',residual:'Residual Network',cut:'Minimum Cut',validity:'Flow Validity'},eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 function allArcs(g){return g.edges.flatMap((e,i)=>[{id:e.id+'+',edge:i,sign:1,u:e.u,v:e.v},{id:e.id+'-',edge:i,sign:-1,u:e.v,v:e.u}]);}
 function edgeLabel(g,index){const e=g.edges[index];if(!e)return'';const peers=g.edges.flatMap((x,i)=>x.u===e.u&&x.v===e.v?[i]:[]),rank=peers.indexOf(index),base=L(e.u,g.n)+' → '+L(e.v,g.n);return peers.length>1?base+' ('+(rank+1)+')':base;}
 function residualLabel(g,id){const arc=allArcs(g).find(a=>a.id===id);if(!arc)return'';const base=L(arc.u,g.n)+' → '+L(arc.v,g.n);return arc.sign<0?base+' (reverse of '+edgeLabel(g,arc.edge)+')':edgeLabel(g,arc.edge);}
 function parsePath(p,f,raw){const text=String(raw??'').trim().replace(/−/g,'-');if(!text)return[];if(/^e\d+[+-]/i.test(text))return text.toLowerCase().split(/[\s,]+/).filter(Boolean);const vs=GraphExamCore.vertices(text,p.g.n);if(!vs)return null;const arcs=G.residual(p.g,f),ids=[];for(let i=1;i<vs.length;i++){const found=arcs.filter(e=>e.u===vs[i-1]&&e.v===vs[i]);if(found.length!==1)return null;ids.push(found[0].id);}return ids;}
 function mechanical(g,f,path,delta){const after=f.slice(),arcs=allArcs(g);for(const id of path){const e=arcs.find(e=>e.id===id);if(e)after[e.edge]+=e.sign*delta;}return after;}
 function generate(cfg){const r=G.rng(cfg.seed+':flow-focus'),n=G.integer(r,...{easy:[4,5],medium:[6,7],hard:[7,9]}[cfg.difficulty]);let g=G.network(n,r);if(cfg.difficulty==='hard'&&!g.edges.some(e=>e.u===2&&e.v===1))g.edges.push({id:'e'+g.edges.length,u:2,v:1,cap:2});if(cfg.difficulty!=='easy'){for(let k=0;k<(cfg.difficulty==='hard'?3:1);k++){const u=G.integer(r,1,n-2),v=G.integer(r,1,n-2);if(u!==v&&!g.edges.some(e=>e.u===u&&e.v===v))g.edges.push({id:'e'+g.edges.length,u,v,cap:G.integer(r,1,4)});}}const perm=[0,...QuizGraphCore.shuffle(Array.from({length:n-2},(_,v)=>v+1),r),n-1];g={...g,edges:g.edges.map(e=>({...e,u:perm[e.u],v:perm[e.v]}))};const ref=G.maxFlow(g),kind=cfg.mode,p={cfg,kind,g,ref,title:'Question',weighted:true,fields:[],steps:[],contract:'Source is s; sink is t. Intermediate vertices use a, b, c, and so on. Parallel and antiparallel edges remain distinct. A reverse residual edge cancels flow on its corresponding original edge.'};
  const count=G.integer(r,0,Math.max(0,ref.steps.length-(kind==='validity'?0:1))),given=count?ref.steps[count-1].after.slice():Array(g.edges.length).fill(0);p.given=kind==='cut'?ref.flows.slice():given;p.initial={answers:{},chosen:[],f:kind==='maximum'?Array(g.edges.length).fill(0):p.given.slice(),draft:kind==='maximum'?Array(g.edges.length).fill(0):p.given.slice(),path:[],pathText:'',delta:'',total:'',side:kind==='cut'?[0]:[],log:[],active:0,residual:kind==='augment',manual:false,proposed:{}};
  if(kind==='maximum')p.question='Start at zero flow. Choose residual paths and their full bottlenecks, then Record Augmentation. Continue to maximum flow and enter its value. Enter proposed original-edge flows after each augmentation; the complete procedure is graded at submission.';
  if(kind==='augment')p.question='For the given feasible flow, select any simple residual path from s to t and enter its bottleneck. The increase in total flow equals this amount.';
  if(kind==='cut')p.question='The displayed flow is maximum. Select the source side S of a minimum cut and enter its capacity. The source s belongs to S; the sink t does not.';
  if(kind==='residual'){p.edgeIndex=G.integer(r,0,g.edges.length-1);p.variant=G.integer(r,0,3);const e=g.edges[p.edgeIndex],f=given[p.edgeIndex];p.question='Original edge '+edgeLabel(g,p.edgeIndex)+', capacity '+e.cap+', current flow '+f+'. '+(p.variant===0?'What is its forward residual capacity?':p.variant===1?'What is its reverse residual capacity?':'If '+(p.delta=f?G.integer(r,1,f):0)+' units use this edge’s reverse residual arc, what is its new original flow?');p.fields=[{key:'value',type:'number',label:p.variant===0?'Forward residual capacity':p.variant===1?'Reverse residual capacity':'New original flow',expected:p.variant===0?e.cap-f:p.variant===1?f:f-p.delta}];p.steps=[p.variant===0?'Forward residual = capacity − flow = '+e.cap+' − '+f+' = '+(e.cap-f)+'.':p.variant===1?'Reverse residual = current flow = '+f+'.':'Reverse use cancels original flow: '+f+' − '+p.delta+' = '+(f-p.delta)+'. A separate antiparallel original edge is unchanged.'];}
  if(kind==='residual'&&p.variant===3){const path=G.findAugment(g,given),info=G.pathFlow(g,given,path),after=mechanical(g,given,path,info.bottleneck),targets=[...new Set([allArcs(g).find(e=>e.id===path[0]).edge,p.edgeIndex])];p.augmentationPath=path.slice();p.augmentation=info.bottleneck;p.targetEdges=targets.slice();p.question='For the given feasible flow, augment along '+path.map(id=>residualLabel(g,id)).join('; ')+' by '+info.bottleneck+'. Calculate forward and reverse residual capacities for '+targets.map(i=>edgeLabel(g,i)).join(' and ')+'.';p.fields=targets.flatMap(i=>[{key:'forward'+i,type:'number',label:edgeLabel(g,i)+' forward residual',expected:g.edges[i].cap-after[i]},{key:'reverse'+i,type:'number',label:edgeLabel(g,i)+' reverse residual',expected:after[i]}]);p.steps=targets.map(i=>'Original edge '+edgeLabel(g,i)+': flow '+given[i]+' → '+after[i]+'. Forward = '+g.edges[i].cap+' − '+after[i]+' = '+(g.edges[i].cap-after[i])+'. Reverse = '+after[i]+'. A reverse arc cancels only its identified original edge.');}
  if(kind==='validity'){
   p.variant=G.integer(r,0,4);
   if(p.variant===0&&r()<.6)p.given[G.integer(r,0,g.edges.length-1)]+=G.integer(r,1,3);
   if(p.variant===4){const edgeIndex=g.edges.findIndex(e=>e.u===0&&e.v>0&&e.v<n-1),edge=g.edges[edgeIndex];p.given[edgeIndex]+=p.given[edgeIndex]<edge.cap?1:-1;p.variant='conservationWitness';p.initial.witnessVertex=null;const balance=Array(n).fill(0);g.edges.forEach((e,i)=>{balance[e.u]-=p.given[i];balance[e.v]+=p.given[i];});p.witnessVertices=balance.flatMap((v,i)=>i!==0&&i!==n-1&&v!==0?[i]:[]);p.question='The displayed flows respect every edge capacity. Identify an internal vertex where incoming and outgoing flow differ.';p.steps=['Compare incoming and outgoing flow at each internal vertex.'];}
   const valid=G.flowCheck(g,p.given),max=valid.ok&&!G.reachable(g,p.given).includes(n-1);p.initial.f=p.given.slice();p.initial.draft=p.given.slice();
   if(p.variant===0){const badEdge=g.edges.findIndex((e,i)=>p.given[i]<0||p.given[i]>e.cap),witness=valid.ok?'none':g.edges[badEdge]?.id||'none',choices=[...g.edges.map((e,i)=>[e.id,edgeLabel(g,i)]),['none','No violated capacity edge']];p.question='Are the displayed original-edge flows feasible? If not, identify a violated capacity edge; otherwise choose none.';p.fields=[{key:'choice',type:'choice',choices:[['yes','Feasible'],['no','Not feasible']],expected:valid.ok?'yes':'no'},{key:'witness',type:'choice',label:'Capacity witness',choices,expected:witness}];p.steps=[valid.ok?valid.message:'The flow on '+edgeLabel(g,badEdge)+' violates its capacity bounds.'];}
   if(p.variant===1){p.question='Calculate the current flow value (net outflow from source s).';p.fields=[{key:'value',type:'number',label:'Flow value',expected:valid.value}];p.steps=['Net source outflow = outgoing original flows minus incoming original flows = '+valid.value+'.'];}
   if(p.variant===2){p.question='Is this feasible flow already maximum?';p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:max?'yes':'no'}];p.steps=[max?'No positive-capacity residual source-to-sink path remains.':'A residual augmenting path remains, so the flow can increase.'];}
   if(p.variant===3){p.question='Does the residual network of this feasible flow contain an augmenting path?';p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:max?'no':'yes'}];p.steps=[max?'The sink is not residual-reachable from the source.':'The sink remains reachable through positive residual arcs.'];}
  }
 return p;
 }
 function check(p,s){if(p.kind==='validity'&&p.variant==='conservationWitness'){if(!Number.isInteger(s.witnessVertex))return{ok:false,message:'Select an internal witness vertex.'};return{ok:p.witnessVertices.includes(s.witnessVertex),message:p.witnessVertices.includes(s.witnessVertex)?'Correct conservation witness.':'Flow is conserved at that internal vertex.'};}if(p.fields.length)return CompactQuiz.gradeFields(p,s);if(p.kind==='cut'){const side=Array.isArray(s.side)?s.side:GraphExamCore.vertices(s.answers.side,p.g.n);if(!side||side.length!==new Set(side).size||!side.includes(0)||side.includes(p.g.n-1))return{ok:false,message:'Select a source-side set containing s and excluding t.'};const cap=p.g.edges.filter(e=>side.includes(e.u)&&!side.includes(e.v)).reduce((sum,e)=>sum+e.cap,0);return{ok:CompactQuiz.number(s.answers.total)===cap&&cap===p.ref.value,message:'Recheck S → T original capacities and the minimum-cut bound.'};}
  if(p.kind==='augment'){const ids=parsePath(p,p.given,s.pathText);if(!ids)return{ok:false,message:'Select an unambiguous directed residual path from s to t.'};const path=G.pathFlow(p.g,p.given,ids);return{ok:path.ok&&CompactQuiz.number(s.delta)===path.bottleneck,message:'Recheck the directed residual path and its minimum capacity.'};}
  let f=Array(p.g.edges.length).fill(0);for(let i=0;i<s.log.length;i++){const st=s.log[i],path=G.pathFlow(p.g,f,st.path);if(!eq(f,st.before)||!path.ok||st.delta!==path.bottleneck||!eq(st.after,mechanical(p.g,f,st.path,st.delta))||!G.flowCheck(p.g,st.after).ok)return{ok:false,message:'Recheck path continuity, bottleneck, and forward/reverse updates at augmentation '+(i+1)+'.'};f=st.after.slice();}if(s.pathText.trim()||String(s.delta).trim())return{ok:false,message:'Record or clear the pending augmentation.'};if(!eq(s.f,f))return{ok:false,message:'The current flows must match the recorded history.'};const result=G.maxFlowCheck(p.g,f,CompactQuiz.number(s.answers.total));return result.ok?result:{...result,message:result.message.replace(/\be\d+\b/g,id=>{const i=p.g.edges.findIndex(e=>e.id===id);return i<0?id:edgeLabel(p.g,i);})};
 }
 return{modes,generate,check,mechanical,parsePath,allArcs,edgeLabel,residualLabel};
})();
const FlowLab=(()=>{
 const K=LabKit,E=K.E,G=GraphCore,Q=FlowQuestions;
 const label=(v,n)=>v===0?'s':v===n-1?'t':String.fromCharCode(96+v);
 function shownFlow(ctx){const {p,s}=ctx;return p.kind==='maximum'&&s.active<s.log.length?s.active?s.log[s.active-1].after.slice():Array(p.g.edges.length).fill(0):p.kind==='maximum'?s.f.slice():p.given.slice();}
 function storedPath(ctx,flow=shownFlow(ctx)){return Array.isArray(ctx.s.path)&&ctx.s.path.length?ctx.s.path.slice():Q.parsePath(ctx.p,flow,ctx.s.pathText)||[];}
 function record(ctx){const {p,s}=ctx,flow=shownFlow(ctx),path=storedPath(ctx,flow),delta=CompactQuiz.number(s.delta),result=G.pathFlow(p.g,flow,path);if(!result.ok){ctx.msg('Select a connected residual path from s to t.');return;}if(!Number.isSafeInteger(delta)||delta<=0){ctx.msg('Enter a positive integer bottleneck.');return;}const affected=[...new Set(result.arcs.map(a=>a.edge))],after=flow.slice();for(const i of affected){const raw=s.proposed?.[i];if(raw===undefined||String(raw).trim()===''){ctx.msg('Enter a proposed flow for every original edge used by the path.');return;}const value=CompactQuiz.number(raw);if(!Number.isSafeInteger(value)){ctx.msg('Proposed flows must be integers.');return;}after[i]=value;}ctx.edit(x=>{x.log.push({before:flow.slice(),path:path.slice(),delta,after:after.slice()});x.f=after.slice();x.draft=after.slice();x.active=x.log.length;x.path=[];x.pathText='';x.delta='';x.proposed={};});}
 function choose(ctx,id){const {p,s}=ctx;if(p.kind==='maximum'&&s.active<s.log.length)return;const flow=p.kind==='maximum'?shownFlow(ctx):p.given,arcs=G.residual(p.g,flow),arc=arcs.find(a=>a.id===id),path=storedPath(ctx,flow);if(!arc)return;const at=path.indexOf(id);if(at>=0){ctx.edit(x=>{x.path=path.slice(0,at);x.pathText=x.path.join(', ');x.proposed={};});return;}let current=0;const seen=new Set([0]);for(const chosen of path){const prev=arcs.find(a=>a.id===chosen);if(!prev||prev.u!==current)return;current=prev.v;seen.add(current);}if(arc.u!==current||seen.has(arc.v))return;ctx.edit(x=>{x.path=[...path,id];x.pathText=x.path.join(', ');});}
 function pathVertices(p,flow,path){const arcs=G.residual(p.g,flow),out=[0];let at=0;for(const id of path){const e=arcs.find(a=>a.id===id);if(!e||e.u!==at)return[];out.push(e.v);at=e.v;}return out;}
 const adapter={modes:Q.modes,signature:ctx=>ctx.s,generate:Q.generate,check:ctx=>Q.check(ctx.p,ctx.s),render(ctx){const p=ctx.p,s=ctx.s,flow=shownFlow(ctx),selectedPath=storedPath(ctx,flow),old=p.kind==='maximum'&&s.active<s.log.length;
  const triple=E('div',undefined,'flow-triple'),residual=G.residual(p.g,flow).map(a=>({...a,w:a.cap})),available=ctx.ui.body.clientWidth||1050,graphWidth=window.innerWidth<=900?Math.min(520,available-28):Math.max(300,Math.min(520,Math.floor((available-54)/3)));
  const views=[
   {key:'original',title:'Original Graph (G)',graph:p.g,edgeLabel:e=>String(e.cap)},
   {key:'flow',title:'Flow Graph (Gf)',graph:{...p.g,edges:p.g.edges.map((e,i)=>({...e,w:flow[i]}))},edgeLabel:e=>String(e.w)},
   {key:'residual',title:'Residual Graph (Gr)',graph:{n:p.g.n,directed:true,edges:residual},edgeLabel:e=>String(e.w)}
  ];
  for(const view of views){const panel=E('section',undefined,'flow-graph-panel');panel.append(E('h3',view.title));triple.append(panel);const canChoose=view.key==='residual'&&['maximum','augment'].includes(p.kind)&&!old,drawState=p.variant==='conservationWitness'?{...s,side:Number.isInteger(s.witnessVertex)?[s.witnessVertex]:[]}:s;const fake={...ctx,p:{...p,g:view.graph},s:drawState,ui:{...ctx.ui,body:panel}};GraphExamUI.layout(fake,()=>{},{source:0,width:graphWidth,selectedEdges:canChoose?selectedPath:[],selectedVertices:p.kind==='cut'?[0,...(s.side||[]).filter(v=>v!==p.g.n-1)]:p.variant==='conservationWitness'?(Number.isInteger(s.witnessVertex)?[s.witnessVertex]:[]):[],idPrefix:'flow'+view.key,vertexLabel:v=>label(v,p.g.n),vertexClick:view.key==='original'&&p.kind==='cut'?v=>{if(v===0||v===p.g.n-1)return;ctx.edit(x=>{x.side=x.side.includes(v)?x.side.filter(a=>a!==v):[...x.side,v];x.side=[0,...x.side.filter(a=>a!==0&&a!==p.g.n-1)];x.answers.side=x.side.map(a=>a===0?'A':a===p.g.n-1?String.fromCharCode(64+p.g.n):String.fromCharCode(65+a)).join(', ');});}:p.variant==='conservationWitness'?v=>ctx.edit(x=>x.witnessVertex=v):undefined,edgeClick:canChoose?id=>choose(ctx,id):undefined,edgeLabel:view.edgeLabel,edgeTitle:e=>{const i=view.key==='residual'?e.edge:p.g.edges.findIndex(x=>x.id===e.id),name=view.key==='residual'?Q.residualLabel(p.g,e.id):Q.edgeLabel(p.g,i),original=p.g.edges[i];return view.key==='residual'?'Residual '+name+', capacity '+e.cap:view.key==='original'?name+', capacity '+original.cap:name+', current flow '+flow[i]+' of '+original.cap;}});const nodes=panel.querySelectorAll('.fg-vertex');nodes[0]?.classList.add('flow-source');nodes[p.g.n-1]?.classList.add('flow-sink');}
  ctx.ui.body.append(triple,E('p',p.question,'ge-output'));
  if(p.fields.length){CompactQuiz.renderFields(ctx);const indexes=Array.isArray(p.targetEdges)?p.targetEdges:Number.isInteger(p.edgeIndex)?[p.edgeIndex]:[],details=indexes.map(i=>{const e=p.g.edges[i];return e?E('p','Original edge '+Q.edgeLabel(p.g,i)+' · capacity '+e.cap+' · current flow '+p.given[i]+'.','ge-context'):null;}).filter(Boolean);if(details.length)ctx.ui.body.append(...details);return;}
  if(p.kind==='validity'&&p.variant==='conservationWitness'){const witness=K.select([['','Choose'],...Array.from({length:p.g.n-2},(_,i)=>[String(i+1),label(i+1,p.g.n)])],Number.isInteger(s.witnessVertex)?String(s.witnessVertex):'',v=>ctx.edit(x=>x.witnessVertex=v===''?null:Number(v)));ctx.ui.body.append(E('p','Select an internal vertex in the graph or with the selector.','cq-help'),K.field('Witness vertex',witness));return;}
  if(p.kind==='cut'){const side=[0,...(s.side||[]).filter(v=>v!==0&&v!==p.g.n-1)];ctx.ui.body.append(E('p','Source Side (S): {'+side.map(v=>label(v,p.g.n)).join(', ')+'}','ge-context'),CompactQuiz.field(ctx,'Cut Capacity','total',true));return;}
  if(p.kind==='maximum'){const history=E('div',undefined,'ge-stages');for(let i=0;i<=s.log.length;i++){const b=K.button(i?'Augment '+i:'Initial',()=>ctx.edit(x=>x.active=i));b.setAttribute('aria-pressed',String(s.active===i));history.append(b);}ctx.ui.body.append(E('h3','Augmentation History'),history);if(old){ctx.ui.body.append(E('p','Reviewing recorded stage '+s.active+'. Later stages depend on this state.','cq-help'),K.button('Revise from This Stage',()=>ctx.edit(x=>{x.log=x.log.slice(0,x.active);x.f=flow.slice();x.draft=flow.slice();x.path=[];x.pathText='';x.delta='';x.proposed={};})));return;}}
  if(['maximum','augment'].includes(p.kind)){
   const vertices=pathVertices(p,flow,selectedPath),summary=vertices.length?vertices.map(v=>label(v,p.g.n)).join(' → '):'Select a residual edge leaving s.';ctx.ui.body.append(E('h3','Selected Path'),E('p',summary,'flow-selected-path'));
   const selectedArcs=G.residual(p.g,flow).filter(a=>selectedPath.includes(a.id)),arcNames=selectedArcs.map(a=>Q.residualLabel(p.g,a.id));if(arcNames.some((name,i)=>name!==label(selectedArcs[i].u,p.g.n)+' → '+label(selectedArcs[i].v,p.g.n)))ctx.ui.body.append(E('p','Selected residual edges: '+arcNames.join(' · '),'flow-residual-instructions'));
   const pathTools=E('div',undefined,'flow-path-tools');if(selectedPath.length){pathTools.append(K.button('Remove Last Edge',()=>ctx.edit(x=>{x.path=selectedPath.slice(0,-1);x.pathText=x.path.join(', ');x.proposed={};})),K.button('Clear Path',()=>ctx.edit(x=>{x.path=[];x.pathText='';x.proposed={};})));}const delta=K.input(s.delta,raw=>ctx.edit(x=>x.delta=raw));delta.inputMode='numeric';delta.setAttribute('aria-label','Bottleneck delta');const deltaField=K.field('Bottleneck (Δ)',delta);deltaField.classList.add('flow-bottleneck-field');pathTools.append(deltaField);ctx.ui.body.append(pathTools);
   const pathResult=G.pathFlow(p.g,flow,selectedPath);if(p.kind==='maximum'&&selectedPath.length&&pathResult.ok){const affected=[...new Set(pathResult.arcs.map(a=>a.edge))],hasReverse=pathResult.arcs.some(a=>a.sign<0),rows=affected.map(i=>{const e=p.g.edges[i],arc=pathResult.arcs.find(a=>a.edge===i),input=K.input(s.proposed?.[i]??'',raw=>ctx.edit(x=>{x.proposed={...(x.proposed||{}),[i]:raw};}));input.inputMode='numeric';input.setAttribute('aria-label','Proposed flow for original edge '+Q.edgeLabel(p.g,i));const row=[Q.edgeLabel(p.g,i)];if(hasReverse)row.push(arc?.sign<0?'Decrease flow':'Increase flow');row.push(flow[i]+' / '+e.cap,input);return row;}),headers=hasReverse?['Original Edge','Operation','Current / Capacity','Proposed Flow']:['Original Edge','Current / Capacity','Proposed Flow'],table=K.table(headers,rows),scroll=E('div',undefined,'flow-proposal-scroll');table.classList.add('ge-table','flow-proposal');scroll.append(table);ctx.ui.body.append(E('h3','Proposed Flow Updates'),scroll,E('p','Only edges on the selected path need a proposed flow. A reverse traversal decreases flow on its corresponding original edge.','cq-help'));}
   if(p.kind==='maximum'){const submit=E('div',undefined,'flow-submit-controls'),recordButton=K.button('Record Augmentation',()=>record(ctx),'primary'),totalField=CompactQuiz.field(ctx,'Maximum-flow value','total',true);totalField.classList.add('flow-total-field');submit.append(recordButton,totalField);ctx.ui.body.append(submit);}
   return;
  }
 },solution(ctx){const p=ctx.p,L=v=>label(v,p.g.n);if(p.variant==='conservationWitness')return[K.list(p.steps),E('p','Conservation is violated at '+p.witnessVertices.map(L).join(', ')+'. These vertices have unequal total incoming and outgoing original-edge flow.')];if(p.fields.length)return K.list(p.steps);if(p.kind==='augment'){const path=G.findAugment(p.g,p.given),info=G.pathFlow(p.g,p.given,path);return[E('p','One augmenting path: '+path.map(id=>Q.residualLabel(p.g,id)).join('; ')+'.'),K.list(info.arcs.map(a=>Q.residualLabel(p.g,a.id)+': residual capacity '+a.cap+'.')),E('p','Bottleneck = minimum residual capacity = '+info.bottleneck+'. Total flow increases by '+info.bottleneck+'.')];}if(p.kind==='cut'){const side=p.ref.reach,edges=p.g.edges.flatMap((e,i)=>side.includes(e.u)&&!side.includes(e.v)?[{e,i}]:[]);return[E('p','One minimum cut has S = {'+side.map(L).join(', ')+'}.'),E('p','Only original S \u2192 T edges count: '+edges.map(x=>Q.edgeLabel(p.g,x.i)+' ('+x.e.cap+')').join(' + ')+' = '+p.ref.cut+'. Opposite-direction edges are not subtracted.')];}return[E('p','One maximum flow is '+p.ref.value+'. Other valid augmentation sequences are accepted.'),K.list(p.ref.steps.map(st=>{const arcs=G.residual(p.g,st.before),path=st.path.map(id=>Q.residualLabel(p.g,id)).join('; '),changes=st.path.map(id=>{const a=arcs.find(x=>x.id===id),edge=Q.edgeLabel(p.g,a.edge);return(a.sign<0?'Decrease flow on ':'Increase flow on ')+edge+' by '+st.delta;}).join('; ');return'Path '+path+', bottleneck '+st.delta+'. '+changes+'. Flows ['+st.after.join(', ')+'].';})),K.table(['Original edge','Final flow / capacity'],p.g.edges.map((e,i)=>[Q.edgeLabel(p.g,i),p.ref.flows[i]+'/'+e.cap])),E('p','Residual reachable source side {'+p.ref.reach.map(L).join(', ')+'} gives a minimum cut of capacity '+p.ref.cut+'. No augmenting path remains.')];}};
 const ctx=CompactQuiz.attach(K.create('flow','Network Flow','',adapter),'pp. 386–392','Original flows must satisfy 0 ≤ f ≤ capacity and conservation at every intermediate vertex. Forward residual capacity is c − f; reverse residual capacity is f. A simple residual source-to-sink path augments by its minimum residual capacity. Reverse arcs cancel the identified original edge’s flow. No residual augmenting path means maximum flow. A directed cut counts original capacities from S to T only.');return{ctx,adapter,record,choose};
})();





const PertCore=(()=>{
 const modes={earliest:'Earliest Completion Times',latest:'Latest Completion Times',critical:'Critical Paths',slack:'Activity Slack'};
 const difficulties=['easy','medium','hard'],label=(v,g)=>g?.labels?.[v]??String.fromCharCode(65+v);
 function topology(g){
  if(!Number.isInteger(g.n)||g.n<2||!Array.isArray(g.edges))throw Error('Invalid event graph.');
  if(g.labels&&(!Array.isArray(g.labels)||g.labels.length!==g.n||g.labels.some(s=>typeof s!=='string'||!s.trim())||new Set(g.labels).size!==g.n))throw Error('Event labels must be distinct.');
  const incoming=Array.from({length:g.n},()=>[]),outgoing=Array.from({length:g.n},()=>[]),pairs=new Set(),ids=new Set();
  for(const e of g.edges){
   if(!Number.isInteger(e.u)||!Number.isInteger(e.v)||e.u<0||e.u>=g.n||e.v<0||e.v>=g.n||!Number.isSafeInteger(e.w)||(e.dummy===true?e.w!==0:e.w<=0)||typeof e.id!=='string'||ids.has(e.id)||pairs.has(e.u+':'+e.v))throw Error('Edges need distinct IDs and endpoints, with positive integer durations or explicitly marked zero-duration dummies.');
   pairs.add(e.u+':'+e.v);ids.add(e.id);incoming[e.v].push(e);outgoing[e.u].push(e);
  }
  const sources=incoming.flatMap((es,v)=>es.length?[]:[v]),sinks=outgoing.flatMap((es,v)=>es.length?[]:[v]);
  if(sources.length!==1||sinks.length!==1)throw Error('Exactly one start and one finish are required.');
  const degree=incoming.map(es=>es.length),order=[sources[0]];
  for(let i=0;i<order.length;i++)for(const e of outgoing[order[i]])if(--degree[e.v]===0)order.push(e.v);
  if(order.length!==g.n)throw Error('The graph contains a cycle or an unreachable event.');
  const canFinish=new Set([sinks[0]]);for(const v of order.slice().reverse())if(outgoing[v].some(e=>canFinish.has(e.v)))canFinish.add(v);
  if(canFinish.size!==g.n)throw Error('Every event must lead to the finish.');
  return{order,incoming,outgoing,start:sources[0],finish:sinks[0]};
 }
 function solve(g){
  const t=topology(g),E=Array(g.n).fill(0),L=Array(g.n).fill(Infinity);
  for(const v of t.order)if(v!==t.start)E[v]=Math.max(...t.incoming[v].map(e=>E[e.u]+e.w));
  const duration=E[t.finish];L[t.finish]=duration;
  for(const u of t.order.slice().reverse())if(u!==t.finish)L[u]=Math.min(...t.outgoing[u].map(e=>L[e.v]-e.w));
  const slack=g.edges.map(e=>L[e.v]-E[e.u]-e.w),critical=g.edges.filter((e,i)=>slack[i]===0).map(e=>e.id);
  if(E.some((x,v)=>!Number.isSafeInteger(x)||!Number.isSafeInteger(L[v])||x>L[v])||slack.some(x=>x<0))throw Error('Invalid PERT solution.');
  return{...t,E,L,duration,slack,critical};
 }
 function generate(cfg){
  if(!Object.hasOwn(modes,cfg.mode))throw Error('Unknown PERT exercise.');
  if(!difficulties.includes(cfg.difficulty)||!modes[cfg.mode])throw Error('Unknown PERT configuration.');
  if(cfg.format!==undefined&&!['standard','exam'].includes(cfg.format))throw Error('Unknown PERT graph format.');
  if(cfg.format==='exam')return generateExam(cfg);
  const r=GraphCore.rng('pert-v2:'+cfg.seed+':'+cfg.difficulty),pick=a=>a[Math.floor(r()*a.length)],int=(a,b)=>a+Math.floor(r()*(b-a+1));
  const kind=cfg.mode;
  const wantTies=cfg.difficulty==='hard'&&r()<.28;
  for(let attempt=0;attempt<400;attempt++){
  const patterns={easy:[[1,2,1],[1,3,1]],medium:[[1,2,2,1],[1,2,1,2,1],[1,2,2,2,1]],hard:[[1,2,2,1,2,1],[1,2,3,3,1],[1,3,2,1,3,1],[1,2,3,2,3,1],[1,2,2,1,2,1,2,1]]};
  const sizes=pick(patterns[cfg.difficulty]),layers=[];let n=0;for(const size of sizes)layers.push(Array.from({length:size},()=>n++));
  const edges=[],maxWeight={easy:5,medium:8,hard:9}[cfg.difficulty],add=(u,v)=>edges.push({id:'e'+edges.length,u,v,w:int(1,maxWeight)});
  // Monotone adjacent-layer routes keep harder dependencies readable.
  for(let k=1;k<layers.length;k++){
   const a=layers[k-1],b=layers[k];
   if(a.length===1||b.length===1)for(const u of a)for(const v of b)add(u,v);
   else if(a.length===b.length){for(let i=0;i<a.length;i++)add(a[i],b[i]);const down=r()<.5;for(let i=0;i<a.length-1;i++)if(down)add(a[i],b[i+1]);else add(a[i+1],b[i]);}
   else if(a.length===2){add(a[0],b[0]);add(a[0],b[1]);add(a[1],b[1]);add(a[1],b[2]);}
   else{add(a[0],b[0]);add(a[1],b[0]);add(a[1],b[1]);add(a[2],b[1]);}
  }
  const g={n,directed:true,edges,layers};
  if(wantTies){const provisional=solve(g),incoming=provisional.incoming[provisional.finish],target=provisional.duration;for(const e of incoming.slice(0,2))e.w=target-provisional.E[e.u];if(edges.some(e=>e.w>14))continue;}
  const ref=solve(g),complexity=metrics(g,ref);
  if(!demand(cfg.difficulty,complexity)||cfg.difficulty==='hard'&&(wantTies?complexity.criticalPaths<2:complexity.criticalPaths!==1))continue;
  const shuffled=edges.map(e=>e.id);
  for(let i=shuffled.length-1;i;i--){const j=int(0,i);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  return{cfg:{...cfg},kind,g,ref,complexity,attempts:attempt+1,slackIds:g.edges.map(e=>e.id)};
  }
  const bank={"false":{"layers":[[0],[1,2],[3,4,5],[6,7,8],[9]],"edges":[[0,1,1],[0,2,9],[1,3,7],[1,4,6],[2,4,9],[2,5,9],[3,6,9],[4,7,6],[5,8,3],[4,6,7],[5,7,3],[6,9,5],[7,9,8],[8,9,7]]},"true":{"layers":[[0],[1,2],[3,4,5],[6,7,8],[9]],"edges":[[0,1,8],[0,2,8],[1,3,9],[1,4,7],[2,4,2],[2,5,1],[3,6,9],[4,7,3],[5,8,7],[3,7,9],[4,8,4],[6,9,7],[7,9,7],[8,9,2]]}},f=cfg.difficulty==='hard'?bank[String(wantTies)]:cfg.difficulty==='medium'?{layers:[[0],[1,2],[3,4],[5]],edges:[[0,1,3],[0,2,2],[1,3,4],[2,3,1],[2,4,5],[3,5,2],[4,5,1]]}:{layers:[[0],[1,2],[3]],edges:[[0,1,3],[0,2,2],[1,3,4],[2,3,1]]};const g={n:f.layers.flat().length,directed:true,layers:f.layers,edges:f.edges.map(([u,v,w],i)=>({id:'e'+i,u,v,w}))},ref=solve(g),complexity=metrics(g,ref);if(!demand(cfg.difficulty,complexity))throw Error('Invalid PERT calibration fallback.');return{cfg:{...cfg},kind,g,ref,complexity,attempts:401,slackIds:g.edges.map(e=>e.id)};
 }
 // Compile activity prerequisites into the notation used in Quiz 2, Problem 6.
 // Each activity has its own completion event. A multi-prerequisite activity
 // starts at a separate primed merge event, reached ONLY by its prerequisites.
 // This keeps a predecessor's independent successors out of that merge.
 function eventGraph(activities){
  const edges=[],labels=['1'],ends=new Map(),used=new Set(),plans=[];
  const add=(u,v,w,activity)=>edges.push({id:'e'+edges.length,u,v,w,...(activity?{activity}:{dummy:true})});
  for(const [i,a]of activities.entries()){
   if(typeof a.name!=='string'||!a.name||used.has(a.name)||!Array.isArray(a.after)||new Set(a.after).size!==a.after.length||a.after.some(p=>!ends.has(p))||!Number.isSafeInteger(a.w)||a.w<=0)throw Error('Activities need unique names, positive durations, and earlier prerequisites.');
   used.add(a.name);let from=0;
   if(a.after.length===1)from=ends.get(a.after[0]);
   else if(a.after.length>1){from=labels.length;labels.push(String(i+2)+'′');for(const p of a.after)add(ends.get(p),from,0);}
   const to=labels.length;labels.push(String(i+2));ends.set(a.name,to);add(from,to,a.w,a.name);plans.push({...a,after:[...a.after]});
  }
  if(!plans.length)throw Error('At least one activity is required.');
  const terminals=plans.filter(a=>!plans.some(b=>b.after.includes(a.name)));
  if(terminals.length>1){const finish=labels.length;labels.push(String(activities.length+2));for(const a of terminals)add(ends.get(a.name),finish,0);}
  const g={n:labels.length,directed:true,format:'exam',labels,edges,activities:plans},t=topology(g),rank=Array(g.n).fill(0);
  for(const v of t.order)for(const e of t.outgoing[v])rank[e.v]=Math.max(rank[e.v],rank[v]+1);
  g.layers=Array.from({length:Math.max(...rank)+1},(_,k)=>t.order.filter(v=>rank[v]===k));return g;
 }
 function generateExam(cfg){
  const r=GraphCore.rng('pert-exam-v1:'+cfg.seed+':'+cfg.difficulty),int=(a,b)=>a+Math.floor(r()*(b-a+1));
  const kind=cfg.mode;
  // Hard's base dependency pattern matches the quiz: D follows A/B;
  // F follows C/D; G follows D/E; H follows F/G/K.
  const easy=[['A',[]],['B',[]],['C',['A','B']]],easyBranch=[['A',[]],['B',[]],['C',['A']],['D',['A','B']]];
  const medium=[['A',[]],['B',[]],['C',['A']],['D',['A','B']],['E',['B']],['F',['C','D','E']]];
  const hard=[['A',[]],['B',[]],['C',['A']],['E',['B']],['D',['A','B']],['F',['C','D']],['G',['D','E']],['K',['E']],['H',['F','G','K']]];
  let template=cfg.difficulty==='easy'?(r()<.5?easy:easyBranch):cfg.difficulty==='medium'?medium:hard;
  template=template.map(([name,after])=>[name,[...after]]);
  if(cfg.difficulty==='medium'&&r()<.5){template.splice(5,0,['G',['E']]);template.at(-1)[1]=['C','D','G'];}
  if(cfg.difficulty==='hard'&&r()<.5){template.splice(8,0,['I',['C']]);template.at(-1)[1].push('I');}
  const wantTies=cfg.difficulty==='hard'&&r()<.3;
  for(let attempt=0;attempt<=400;attempt++){
   const fallback=attempt===400,pattern=fallback?(cfg.difficulty==='hard'?hard:cfg.difficulty==='medium'?medium:easyBranch):template;
   const fixed=cfg.difficulty==='hard'?[3,2,3,1,2,3,2,4,1]:cfg.difficulty==='medium'?[3,2,4,2,1,3]:[3,2,4,2];
   const activities=pattern.map(([name,after],i)=>({name,after,w:fallback?fixed[i]:int(1,{easy:5,medium:8,hard:9}[cfg.difficulty])}));
   if(wantTies){
    const provisional=eventGraph(activities),ref=solve(provisional),names=['F','K'],es=names.map(name=>provisional.edges.find(e=>e.activity===name)),target=ref.E[provisional.edges.find(e=>e.activity==='H').u];
    for(let i=0;i<names.length;i++)activities.find(a=>a.name===names[i]).w=target-ref.E[es[i].u];
   }
   const g=eventGraph(activities),ref=solve(g),complexity=metrics(g,ref);
   if(!demand(cfg.difficulty,complexity)||cfg.difficulty==='hard'&&wantTies&&complexity.criticalPaths<2)continue;
   const ids=g.edges.map(e=>e.id);for(let i=ids.length-1;i;i--){const j=int(0,i);[ids[i],ids[j]]=[ids[j],ids[i]];}
   // Include a dummy slack question as well as ordinary activity questions.
   const slackIds=g.edges.map(e=>e.id);
   return{cfg:{...cfg},kind,g,ref,complexity,attempts:attempt+1,slackIds};
  }
  throw Error('Invalid Exam Style calibration fallback.');
 }
 function metrics(g,ref=solve(g)){
  const branches=ref.outgoing.filter(a=>a.length>1).length,merges=ref.incoming.filter(a=>a.length>1).length;
  const maxDecisions=ref.incoming.filter(a=>a.length>1&&new Set(a.map(e=>ref.E[e.u]+e.w)).size>1).length,minDecisions=ref.outgoing.filter(a=>a.length>1&&new Set(a.map(e=>ref.L[e.v]-e.w)).size>1).length;
  const positive=ref.slack.filter(s=>s>0),positiveEvents=ref.E.filter((e,v)=>ref.L[v]>e).length,counts=Array(g.n).fill(0),criticalCounts=Array(g.n).fill(0);counts[ref.start]=criticalCounts[ref.start]=1;
  for(const u of ref.order)for(const e of ref.outgoing[u]){counts[e.v]+=counts[u];if(ref.critical.includes(e.id))criticalCounts[e.v]+=criticalCounts[u];}
  return{branches,merges,maxDecisions,minDecisions,noncriticalActivities:positive.length,distinctPositiveSlack:new Set(positive).size,positiveEvents,paths:counts[ref.finish],criticalPaths:criticalCounts[ref.finish],work:2*g.edges.length+maxDecisions+minDecisions+positiveEvents};
 }
 function demand(d,m){return d==='hard'?m.branches>=3&&m.merges>=3&&m.maxDecisions>=2&&m.minDecisions>=2&&m.noncriticalActivities>=4&&m.distinctPositiveSlack>=3&&m.positiveEvents>=3&&m.paths>=6&&m.work>=30:d==='medium'?m.maxDecisions>=1&&m.minDecisions>=1&&m.noncriticalActivities>=1:true;}
 function initial(p){return{E:Array(p.g.n).fill(''),L:Array(p.g.n).fill(''),duration:'',selected:[],slack:{}};}
 function requiredSlackIds(p){
  if(p.kind!=='slack')return[];const r=GraphCore.rng('slack-targets:'+p.cfg.seed),ids=p.g.edges.map(e=>e.id);
  for(let i=ids.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
  const dummy=p.g.edges.find(e=>e.dummy)?.id,positive=p.g.edges.find((e,i)=>p.ref.slack[i]>0)?.id,chosen=[...new Set([dummy,positive].filter(Boolean))];
  return[...chosen,...ids.filter(id=>!chosen.includes(id))].slice(0,Math.min(ids.length,{easy:3,medium:4,hard:6}[p.cfg.difficulty]));
 }
 const numeric=x=>typeof x==='number'?Number.isSafeInteger(x)?x:null:typeof x==='string'&&/^\+?\d+(?:\.0+)?$/.test(x.trim())&&Number.isSafeInteger(Number(x))?Number(x):null;
 function grade(p,a){
  const entries=[],add=(key,wanted,actual)=>entries.push({key,ok:numeric(actual)===wanted});
  for(let v=0;v<p.g.n;v++){
   if(p.kind==='earliest'&&v!==p.ref.start)add('E:'+v,p.ref.E[v],a.E?.[v]);
   if(p.kind==='latest')add('L:'+v,p.ref.L[v],a.L?.[v]);
  }
  if(p.kind==='critical'){
   add('duration',p.ref.duration,a.duration);
   const selected=new Set(a.selected||[]);
   for(const e of p.g.edges)entries.push({key:'edge:'+e.id,ok:selected.has(e.id)===p.ref.critical.includes(e.id)});
   if([...selected].some(id=>!p.g.edges.some(e=>e.id===id)))entries.push({key:'unknown edge',ok:false});
  }
  if(p.kind==='slack')for(const id of requiredSlackIds(p))add('slack:'+id,p.ref.slack[p.g.edges.findIndex(e=>e.id===id)],a.slack?.[id]);
  return{ok:entries.length>0&&entries.every(e=>e.ok),correct:entries.filter(e=>e.ok).length,total:entries.length,entries};
 }
 // Canonicalize by vertex/edge identity, never by the order of user edits.
 function signature(p,a){return JSON.stringify([a.E.map(numeric),a.L.map(numeric),numeric(a.duration),[...new Set(a.selected)].sort(),requiredSlackIds(p).map(id=>numeric(a.slack[id]))]);}
 function criticalPaths(g,ref=solve(g)){
  const paths=[];function visit(v,path){if(v===ref.finish){paths.push(path);return;}for(const e of ref.outgoing[v])if(ref.critical.includes(e.id))visit(e.v,[...path,e.v]);}visit(ref.start,[ref.start]);return paths;
 }
 const drawingCache=new WeakMap();
 const overlaps=(a,b,pad=0)=>a.x<b.x+b.w+pad&&b.x<a.x+a.w+pad&&a.y<b.y+b.h+pad&&b.y<a.y+a.h+pad;
 function segmentBox(a,b,box,pad=0){
  let lo=0,hi=1;const dx=b.x-a.x,dy=b.y-a.y;
  for(const[p,q]of [[-dx,a.x-box.x+pad],[dx,box.x+box.w+pad-a.x],[-dy,a.y-box.y+pad],[dy,box.y+box.h+pad-a.y]]){
   if(p===0){if(q<0)return false;}else{const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}
  }return true;
 }
 const routeHits=(points,box,pad=0)=>points.some((p,i)=>i&&segmentBox(points[i-1],p,box,pad));
 function examLayout(g){
  if(drawingCache.has(g))return drawingCache.get(g);
  // Virtual routing points carry long edges through their own rows, keeping
  // bypass dependencies away from intermediate vertices and time labels.
  const layers=g.layers.map(a=>a.map(v=>'v'+v)),ranks=Array(g.n),links=[],routes=[];
  g.layers.forEach((a,k)=>a.forEach(v=>ranks[v]=k));
  for(const e of g.edges){const keys=['v'+e.u];for(let k=ranks[e.u]+1;k<ranks[e.v];k++){const key=e.id+':'+k;layers[k].push(key);keys.push(key);}keys.push('v'+e.v);routes.push({e,keys});for(let i=1;i<keys.length;i++)links.push([keys[i-1],keys[i]]);}
  for(let pass=0;pass<12;pass++){
   const forward=pass%2===0,index=new Map(layers.flatMap(a=>a.map((v,i)=>[v,i]))),sequence=forward?layers:layers.slice().reverse();
   for(const layer of sequence){const mean=key=>{const ns=links.filter(p=>p[forward?1:0]===key).map(p=>index.get(p[forward?0:1]));return ns.length?ns.reduce((a,b)=>a+b,0)/ns.length:index.get(key);};layer.sort((a,b)=>mean(a)-mean(b));layer.forEach((v,i)=>index.set(v,i));}
  }
  for(let scale=1;scale<=8;scale++){
   const gap=250*scale,row=180*scale,height=200+row*(Math.max(...layers.map(a=>a.length))-1),width=180+gap*(layers.length-1),points=new Map(),positions=Array(g.n);
   layers.forEach((a,k)=>a.forEach((key,i)=>{const p={x:90+k*gap,y:height/2+(i-(a.length-1)/2)*row};points.set(key,p);if(key[0]==='v')positions[Number(key.slice(1))]=p;}));
   const edges=routes.map(({e,keys})=>{
    const a=points.get(keys[0]),b=points.get(keys.at(-1)),next=points.get(keys[1]),prev=points.get(keys.at(-2)),da=Math.sign(next.y-a.y),db=Math.sign(b.y-prev.y);
    const ps=[{x:a.x+27,y:a.y+da*10},{x:a.x+68,y:a.y+da*18},...keys.slice(1,-1).map(key=>points.get(key)),{x:b.x-68,y:b.y-db*18},{x:b.x-36,y:b.y-db*10}];
    return{id:e.id,labelWidth:e.dummy?28:52,points:ps,path:ps.map((p,i)=>(i?'L ':'M ')+p.x+' '+p.y).join(' ')};
   });
   const obstacles=positions.map(p=>({x:p.x-58,y:p.y-72,w:116,h:144})),placed=[];let ok=true;
   for(const edge of edges){
    const candidates=[];
    for(let j=1;j<edge.points.length;j++){const a=edge.points[j-1],b=edge.points[j];for(const t of [.5,.3,.7,.2,.8,.4,.6,.1,.9]){const cx=a.x+(b.x-a.x)*t,cy=a.y+(b.y-a.y)*t;candidates.push({x:cx-edge.labelWidth/2,y:cy-14,w:edge.labelWidth,h:28});}}
    const box=candidates.find(box=>!obstacles.some(b=>overlaps(box,b,6))&&!placed.some(b=>overlaps(box,b,10))&&!edges.some(other=>other!==edge&&routeHits(other.points,box,6)));
    if(!box){ok=false;break;}edge.label=box;placed.push(box);
   }
   if(ok){const model={width,height,positions,edges,timeOffsets:{E:-48,L:48}};drawingCache.set(g,model);return model;}
  }
  throw Error('Unable to place Exam Style labels without collisions.');
 }
 function layout(g){
  if(g.format==='exam')return examLayout(g);
  const large=g.n>=9,gap=large?230:210,height=g.layers.some(a=>a.length===3)?650:460,width=180+gap*(g.layers.length-1),positions=Array(g.n);
  g.layers.forEach((layer,k)=>layer.forEach((v,i)=>positions[v]={x:90+gap*k,y:height/2+(i-(layer.length-1)/2)*180}));
  return{width,height,positions,timeOffsets:{E:-52,L:52}};
 }
 function emptyStats(){return Object.fromEntries(Object.keys(modes).map(k=>[k,Object.fromEntries(difficulties.map(d=>[d,{solved:0,correct:0,incorrect:0}]))]));}
 function record(stats,p,attempt,a,result){
  const sig=signature(p,a);if(attempt.revealed||attempt.assisted||attempt.solved||attempt.signatures.has(sig))return false;
  attempt.signatures.add(sig);for(const k of [p.kind]){const t=stats[k][p.cfg.difficulty];t[result.ok?'correct':'incorrect']++;if(result.ok)t.solved++;}
  if(result.ok)attempt.solved=true;return true;
 }
 function disqualify(stats,p,attempt,reason='revealed'){
  if(attempt.solved&&!attempt.revealed&&!attempt.assisted)for(const k of [p.kind]){const t=stats[k][p.cfg.difficulty];t.solved--;t.correct--;}
  attempt[reason]=true;
 }
 return{modes,difficulties,label,topology,solve,generate,eventGraph,metrics,demand,initial,requiredSlackIds,numeric,grade,signature,criticalPaths,layout,overlaps,routeHits,emptyStats,record,disqualify};
})();

const PertQuestions=(()=>{
 const C=PertCore,G=GraphCore,modes={earliest:'Earliest Times',latest:'Latest Times',slack:'Activity Slack',critical:'Critical Path',complete:'Complete PERT'};
 function generate(cfg){const p=C.generate({...cfg,mode:cfg.mode==='complete'?'earliest':cfg.mode,format:cfg.format||'exam'}),r=G.rng(cfg.seed+':pert-focus');p.cfg=cfg;p.kind=cfg.mode;p.title='Question';p.variant=['critical','complete'].includes(cfg.mode)?'all':['single','selected','all'].includes(cfg.variant)?cfg.variant:['single','selected','all'][G.integer(r,0,2)];p.vertices=p.ref.order.filter(v=>cfg.mode!=='earliest'||v!==p.ref.start);if(p.variant!=='all')p.vertices=QuizGraphCore.shuffle(p.vertices.slice(),r).slice(0,p.variant==='single'?1:cfg.difficulty==='hard'?4:3);p.slackIds=cfg.mode==='complete'?p.g.edges.map(e=>e.id):cfg.mode==='slack'?(p.variant==='all'?C.requiredSlackIds(p):C.requiredSlackIds(p).slice(0,p.variant==='single'?1:3)):[];
  p.initial={...C.initial(p),answers:{},chosen:[],active:'earliest',paths:''};p.initial.E[p.ref.start]='0';const names=p.vertices.map(v=>C.label(v,p.g)).join(', ');
  p.question=cfg.mode==='earliest'?'Calculate earliest event times for '+(p.variant==='all'?'every event':names)+'. E(start) = 0.':cfg.mode==='latest'?'Given earliest times and project duration '+p.ref.duration+', calculate latest times for '+(p.variant==='all'?'every event':names)+'.':cfg.mode==='slack'?'Calculate slack for the requested activities, including any listed zero-duration dummy.':cfg.mode==='critical'?'Determine project duration and select ALL critical activities, including zero-slack dummy arrows and every critical branch.':'Complete earliest times, latest times, activity slack, project duration, and all critical activities and paths. Use the answer tabs; submit all sections together.';p.contract='Numbered events are the exam default; primed labels are distinct. Real activities show activity/duration; dashed arrows labeled 0 are dummy edges. Blank fields are unanswered.';return p;
 }
 function check(p,s){const num=C.numeric,r=p.ref,bad=()=>({ok:false,message:'Recheck all requested event times, slack values, and critical choices. Blank fields are unanswered.'});if(p.kind==='earliest'&&p.vertices.some(v=>num(s.E[v])!==r.E[v]))return bad();if(p.kind==='latest'&&p.vertices.some(v=>num(s.L[v])!==r.L[v]))return bad();if(p.kind==='slack'&&p.slackIds.some(id=>num(s.slack[id])!==r.slack[p.g.edges.findIndex(e=>e.id===id)]))return bad();if(['critical','complete'].includes(p.kind)){if(num(s.duration)!==r.duration||s.selected.length!==new Set(s.selected).size||s.selected.length!==r.critical.length||!s.selected.every(id=>r.critical.includes(id)))return bad();}
  if(p.kind==='complete'){if(r.E.some((d,v)=>num(s.E[v])!==d)||r.L.some((d,v)=>num(s.L[v])!==d)||p.slackIds.some(id=>num(s.slack[id])!==r.slack[p.g.edges.findIndex(e=>e.id===id)]))return bad();const normalize=x=>String(x).toUpperCase().replace(/['’′]/g,"'"),names=Array.from({length:p.g.n},(_,v)=>normalize(C.label(v,p.g))),paths=String(s.paths).split(';').map(raw=>raw.trim().replace(/(?:->|→)/g,',').split(/[\s,]+/).filter(Boolean).map(x=>names.indexOf(normalize(x)))),expected=C.criticalPaths(p.g,r).map(a=>a.join(','));if(paths.some(a=>a.some(v=>v<0))||paths.length!==expected.length||new Set(paths.map(a=>a.join(','))).size!==paths.length||!paths.every(a=>expected.includes(a.join(','))))return{ok:false,message:'Enter every critical event path, separated by semicolons, using the displayed event labels.'};}return{ok:true,message:'All requested PERT answers are correct.'};
 }
 return{modes,generate,check};
})();
const PertDrawing=(()=>{
 let serial=0;
 function view(ctx){const p=ctx.p,s=ctx.s,C=PertCore,E=LabKit.E,originalModel=C.layout(p.g),m=GraphCore.clone(originalModel),ns='http://www.w3.org/2000/svg',S=ExpandedViews.svg,scale=.82,svg=S('svg',{width:m.width*scale,height:m.height*scale,viewBox:'0 0 '+m.width+' '+m.height,role:'group','aria-label':'PERT event network; numbered exam format'}),id='compactPertArrow'+(++serial),defs=S('defs');defs.append(ExpandedViews.arrowMarker(id,8));svg.append(defs);const minY=Math.min(...m.positions.map(p=>p.y)),maxY=Math.max(...m.positions.map(p=>p.y)),shiftY=minY-82,fx=x=>45+(x-90)*.5,fy=y=>y-shiftY;m.positions=m.positions.map(p=>({x:fx(p.x),y:fy(p.y)}));m.width=Math.max(...m.positions.map(p=>p.x))+65;m.height=maxY-minY+170;if(m.edges)for(const route of m.edges){route.path=route.points.map((q,i)=>(i?'L ':'M ')+fx(q.x)+' '+fy(q.y)).join(' ');route.label={...route.label,x:fx(route.label.x+route.label.w/2)-route.label.w/2,y:fy(route.label.y)};}const pathPoints=(m.edges||[]).flatMap(e=>Array.from((e.path||'').matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g),a=>({x:Number(a[1]),y:Number(a[2])}))),pathPad=12,minX=Math.min(0,...(m.edges||[]).map(e=>e.label.x-8),...pathPoints.map(q=>q.x-pathPad)),topY=Math.min(0,...(m.edges||[]).map(e=>e.label.y-8),...pathPoints.map(q=>q.y-pathPad)),maxX=Math.max(m.width,...(m.edges||[]).map(e=>e.label.x+e.label.w+8),...pathPoints.map(q=>q.x+pathPad)),bottomY=Math.max(m.height,...(m.edges||[]).map(e=>e.label.y+e.label.h+8),...pathPoints.map(q=>q.y+pathPad));m.viewportX=minX;m.viewportY=topY;m.width=maxX-minX;m.height=bottomY-topY;if(m.width*scale>ExpandedViews.width('pertSection',70)){m.viewportX=0;m.viewportY=0;Object.assign(m,ExpandedViews.dag(p.g,ExpandedViews.width('pertSection',70)/scale,{radius:27,annotations:true,labelText:e=>e.dummy?'0':(e.activity||e.id)+'/'+e.w}));}svg.setAttribute('viewBox',(m.viewportX||0)+' '+(m.viewportY||0)+' '+m.width+' '+m.height);svg.setAttribute('width',m.width*scale);svg.setAttribute('height',m.height*scale);const active=p.kind==='complete'?s.active:p.kind,critical=active==='critical',showTimes=active==='slack',texts=[];
  const select=id=>ctx.edit(x=>x.selected=x.selected.includes(id)?x.selected.filter(e=>e!==id):[...x.selected,id]);
  for(const e of p.g.edges){const route=m.edges?.find(x=>x.id===e.id),a=m.positions[e.u],b=m.positions[e.v],d=route?.path||'M '+(a.x+27)+' '+a.y+' L '+(b.x-30)+' '+b.y,color=s.selected.includes(e.id)?'#10A37F':'#45564C',group=S('g',{'data-pert-edge':e.id});group.append(S('path',{d,fill:'none',stroke:color,'stroke-width':s.selected.includes(e.id)?4:2.3,'stroke-dasharray':e.dummy?'6 4':'','marker-end':'url(#'+id+')'}));const box=route?.label||{x:(a.x+b.x)/2-25,y:(a.y+b.y)/2-14,w:50,h:28},eventNames=C.label(e.u,p.g)+' \u2192 '+C.label(e.v,p.g),edgeName=e.dummy?eventNames+' (0)':(e.activity||'Activity')+'/'+e.w+' · '+eventNames;group.setAttribute('aria-label',e.dummy?'Dummy edge '+edgeName:'Activity '+edgeName);group.append(S('title',{},edgeName),S('rect',{x:box.x,y:box.y,width:box.w,height:box.h,rx:6,fill:'white',stroke:color}),S('text',{x:box.x+box.w/2,y:box.y+box.h/2+5,'text-anchor':'middle','font-size':15,fill:color},e.dummy?'0':(e.activity||'Activity')+'/'+e.w));if(critical){group.prepend(S('path',{d,fill:'none',stroke:'transparent','stroke-width':22}));group.setAttribute('role','button');group.setAttribute('tabindex','0');group.setAttribute('aria-label','Select critical edge '+edgeName);group.setAttribute('aria-pressed',String(s.selected.includes(e.id)));group.onclick=()=>select(e.id);group.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(e.id);}};}svg.append(group);}
  const inspected=[...svg.querySelectorAll('g[data-pert-edge]')].map(group=>{const path=group.querySelector('path[marker-end]'),rect=group.querySelector('rect'),text=group.querySelector('text');if(!group.hasAttribute('tabindex'))group.setAttribute('tabindex','0');if(!group.querySelector('path[stroke="transparent"]')){const hit=S('path',{d:path.getAttribute('d'),fill:'none',stroke:'transparent','stroke-width':14});group.prepend(hit);}return{path,hit:group.querySelector('path[stroke="transparent"]'),rect,text};});GraphEdgeInspection.install(svg,inspected);
  for(let v=0;v<p.g.n;v++){const a=m.positions[v],group=S('g',{'data-pert-node':v});group.append(S('circle',{cx:a.x,cy:a.y,r:27,fill:'#2F2F2F',stroke:'#45564C','stroke-width':2}),S('text',{x:a.x,y:a.y+6,'text-anchor':'middle','font-size':19,'font-weight':650,fill:'#A8B7AC'},C.label(v,p.g)));if(['earliest','latest'].includes(active)&&(p.kind==='complete'||p.vertices.includes(v))&&!(active==='earliest'&&v===p.ref.start)){const which=active==='earliest'?'E':'L';group.setAttribute('role','button');group.setAttribute('tabindex','0');group.setAttribute('aria-label','Focus '+which+' for event '+C.label(v,p.g));const focus=()=>document.getElementById('pert'+which+v)?.focus({preventScroll:true});group.onclick=focus;group.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();focus();}};}
   if(p.kind==='latest'){group.append(S('text',{x:a.x,y:a.y+(m.timeOffsets?.E??-42),'text-anchor':'middle','font-size':14,fill:'#9FC5D8'},String(p.ref.E[v])));}if(['earliest','latest'].includes(active)){const which=active==='earliest'?'E':'L',text=S('text',{x:a.x,y:a.y+(which==='E'?(m.timeOffsets?.E??-42):(m.timeOffsets?.L??48)),'text-anchor':'middle','font-size':14,fill:'#A8B7AC'});texts.push({text,which,v});group.append(text);}if(showTimes){for(const which of ['E','L']){const value=p.kind==='complete'?(s[which][v]??'?'):p.ref[which][v],text=S('text',{x:a.x,y:a.y+(which==='E'?(m.timeOffsets?.E??-48):(m.timeOffsets?.L??48)),'text-anchor':'middle','font-size':14,'font-weight':650,fill:which==='E'?'#9FC5D8':'#A8B7AC','data-pert-time':which+':'+v},which+' = '+value);group.append(text);}}svg.append(group);}
  ctx.refreshGraph=()=>texts.forEach(({text,which,v})=>text.textContent=(which==='L'?'L = ':'')+(s[which][v]??'?'));ctx.refreshGraph();const wrap=E('div',undefined,'pert-graph cq-pert-graph');wrap.tabIndex=0;wrap.append(svg);if(showTimes)wrap.append(E('div','E = earliest completion time · L = latest completion time','pert-time-legend'));return wrap;
 }
 return{view};
})();
const PERT=(()=>{
 const K=LabKit,E=K.E,C=PertCore,Q=PertQuestions,edgeLabel=(e,p)=>{const ends=C.label(e.u,p.g)+' \u2192 '+C.label(e.v,p.g);return e.dummy?ends+' (0)':(e.activity||'Activity')+'/'+e.w+' · '+ends;};
 function input(ctx,id,value,fn){const e=K.input(value,raw=>ctx.edit(fn.bind(null,raw)));e.id=id;e.autocomplete='off';e.inputMode='numeric';e.setAttribute('aria-label',id);e.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();ctx.check('final');}};return e;}
 const adapter={modes:Q.modes,signature:ctx=>ctx.s,generate:Q.generate,check:ctx=>Q.check(ctx.p,ctx.s),render(ctx){const p=ctx.p,s=ctx.s,grid=E('div',undefined,'ge-layout'),answer=E('div',undefined,'ge-answers'),active=p.kind==='complete'?s.active:p.kind;grid.append(PertDrawing.view(ctx),answer);ctx.ui.body.append(grid);if(p.kind==='complete'){const tabs=E('div',undefined,'ge-stages');for(const [key,title]of [['earliest','Earliest'],['latest','Latest'],['slack','Slack'],['critical','Critical']]){const b=K.button(title,()=>ctx.edit(x=>x.active=key));b.dataset.pertStage=key;b.setAttribute('aria-pressed',String(active===key));tabs.append(b);}answer.append(tabs);}
   if(['earliest','latest'].includes(active)){const which=active==='earliest'?'E':'L',vertices=p.kind==='complete'?p.ref.order:p.vertices;answer.append(K.table(['Event',...(p.kind==='latest'?['Given E']:[]),'Your '+which],vertices.map(v=>[C.label(v,p.g),...(p.kind==='latest'?[p.ref.E[v]]:[]),active==='earliest'&&v===p.ref.start?'0 (given)':input(ctx,'pert'+which+v,s[which][v],(raw,x)=>x[which][v]=raw)])));}
   if(active==='slack')answer.append(K.table(['Activity / event edge','Duration','Slack'],p.slackIds.map(id=>{const e=p.g.edges.find(e=>e.id===id);return[edgeLabel(e,p),e.w,input(ctx,'pertSlack'+id,s.slack[id]??'',(raw,x)=>x.slack[id]=raw)];})));
   if(active==='critical'){answer.append(K.field('Project duration',input(ctx,'pertDuration',s.duration,(raw,x)=>x.duration=raw)));const row=E('div',undefined,'ge-edge-list');for(const e of p.g.edges){const l=E('label'),cb=E('input');cb.type='checkbox';cb.checked=s.selected.includes(e.id);cb.dataset.pertEdgeCheck=e.id;cb.onchange=()=>ctx.edit(x=>x.selected=cb.checked?[...new Set([...x.selected,e.id])]:x.selected.filter(id=>id!==e.id));l.append(cb,E('span',edgeLabel(e,p)));row.append(l);}answer.append(row);if(p.kind==='complete'){const paths=input(ctx,'pertCriticalPaths',s.paths,(raw,x)=>x.paths=raw);paths.inputMode='text';answer.append(K.field('All critical event paths (; separates paths)',paths),E('p',"Use an ordinary apostrophe for primed events, for example 5'.",'cq-help'));}}
  },solution(ctx){const p=ctx.p,r=p.ref,label=v=>C.label(v,p.g),forward=r.order.map(v=>v===r.start?'E('+label(v)+') = 0.':'E('+label(v)+') = max('+r.incoming[v].map(e=>r.E[e.u]+' + '+e.w).join(', ')+') = '+r.E[v]+'.'),backward=r.order.slice().reverse().map(v=>v===r.finish?'L('+label(v)+') = '+r.duration+'.':'L('+label(v)+') = min('+r.outgoing[v].map(e=>r.L[e.v]+' − '+e.w).join(', ')+') = '+r.L[v]+'.');return[E('h3','Forward pass'),K.list(forward),E('p','Project duration = '+r.duration+'.'),E('h3','Backward pass'),K.list(backward),K.table(['Activity','Slack calculation','Critical'],p.g.edges.map((e,i)=>[edgeLabel(e,p),r.L[e.v]+' − '+r.E[e.u]+' − '+e.w+' = '+r.slack[i],r.slack[i]===0?'yes':'no'])),E('p','All critical event paths:'),K.list(C.criticalPaths(p.g,r).map(path=>path.map(label).join(' → ')))];}};
 const ctx=CompactQuiz.attach(K.create('pert','PERT','',adapter),'pp. 381–384','E(start) = 0. E(v) is the maximum incoming E(u) + duration. Project duration is E(finish). L(finish) equals project duration; L(u) is the minimum outgoing L(v) − duration. Activity slack is L(v) − E(u) − duration. Zero-slack real and dummy activities belong to critical routes. Preserve all equally long critical paths.');
 if(typeof document.getElementById==='function'){const display=E('details',undefined,'cq-rules');display.append(E('summary','Display'),K.field('Event labels',K.select([['exam','Numbered (exam default)'],['standard','Lettered']],'exam',value=>{ctx.format=value;ctx.start(false);})));document.getElementById('pertSection').append(display);const config=ctx.config;let lockedVariant=null;ctx.config=()=>({...config(),format:ctx.format||'exam',variant:lockedVariant||undefined});const start=ctx.start;ctx.start=fresh=>{const prior=ctx.p,sameScope=prior&&prior.kind===ctx.mode&&prior.cfg.difficulty===ctx.ui.diff.value&&(prior.cfg.format||'exam')===(ctx.format||'exam');lockedVariant=sameScope?prior.variant:null;start(fresh);};}
 const exposed=new Set(),family=p=>JSON.stringify([p.cfg.seed,p.cfg.difficulty,p.cfg.format||'exam']),start=ctx.start,reveal=ctx.reveal;ctx.start=fresh=>{if(ctx.p&&ctx.revealed)exposed.add(family(ctx.p));start(fresh);if(exposed.has(family(ctx.p))){ctx.revealed=true;ctx.solved=false;ctx.msg('Solution previously revealed for this network.');}};ctx.reveal=()=>{exposed.add(family(ctx.p));reveal();};return{ctx,adapter,ui:ctx.ui,get state(){return{mode:ctx.mode,p:ctx.p,a:ctx.s};},init(){if(!ctx.p)ctx.start();else ctx.render();},start:fresh=>ctx.start(fresh),check:()=>ctx.check('final'),reset:()=>ctx.reset(),undo:()=>ctx.undo(),redo:()=>ctx.redo(),reveal:()=>ctx.reveal()};
})();

// Independent graph labs: assigned Weiss sections 9.3.1, 9.3.3 and 9.3.4.
const QuizGraphCore=(()=>{
 const C=GraphCore,shuffle=(a,r)=>{for(let i=a.length-1;i;i--){const j=C.integer(r,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
 function queuePaths(g,source,unweighted=false){
  const dist=Array(g.n).fill(Infinity),prev=Array(g.n).fill(null),inside=Array(g.n).fill(false),counts=Array(g.n).fill(0),queue=[source],steps=[];dist[source]=0;inside[source]=true;let improvements=0;
  for(let head=0;head<queue.length;head++){
   const u=queue[head],updates=[];inside[u]=false;counts[u]++;
   if(head>100000)throw Error('Finite queue problem did not terminate.');
   for(const e of g.edges.filter(e=>e.u===u).sort((a,b)=>a.v-b.v))if((!unweighted||dist[e.v]===Infinity)&&dist[u]+e.w<dist[e.v]){
    const old=dist[e.v];if(Number.isFinite(old))improvements++;dist[e.v]=dist[u]+e.w;prev[e.v]=u;updates.push({v:e.v,old,dist:dist[e.v],edge:e.id});
    if(!inside[e.v]){queue.push(e.v);inside[e.v]=true;}
   }
   steps.push({u,updates,queue:queue.slice(head+1),dist:dist.slice()});
  }
  return{dist,prev,steps,improvements,revisits:counts.reduce((s,n)=>s+Math.max(0,n-1),0)};
 }
 // Internal certificate only; students use the queue algorithm in the finite mode.
 function negativeCycle(g,source){
  const dist=Array(g.n).fill(Infinity),prev=Array(g.n).fill(null);dist[source]=0;let last=null;
  for(let pass=0;pass<g.n;pass++){last=null;for(const e of g.edges)if(Number.isFinite(dist[e.u])&&dist[e.u]+e.w<dist[e.v]){dist[e.v]=dist[e.u]+e.w;prev[e.v]=e.u;last=e.v;}if(last===null)return{exists:false,cycle:[]};}
  let v=last;for(let k=0;k<g.n;k++)v=prev[v];const cycle=[v];for(let u=prev[v];u!==v;u=prev[u])cycle.push(u);cycle.reverse();return{exists:true,cycle};
 }
 function dagPaths(g,source,order=C.kahn(g).order){
  if(!C.topoValid(g,order).ok)throw Error('A DAG processing order is required.');
  const dist=Array(g.n).fill(Infinity),prev=Array(g.n).fill(null),steps=[];dist[source]=0;let improvements=0;
  for(const u of order){const updates=[];for(const e of g.edges.filter(e=>e.u===u))if(dist[u]+e.w<dist[e.v]){const old=dist[e.v];if(Number.isFinite(old))improvements++;dist[e.v]=dist[u]+e.w;prev[e.v]=u;updates.push({v:e.v,old,dist:dist[e.v],edge:e.id});}steps.push({u,updates,dist:dist.slice()});}
  return{dist,prev,steps,improvements,order};
 }
 function depths(g,source,dist){const hops=Array(g.n).fill(Infinity),q=[source];hops[source]=0;for(let i=0;i<q.length;i++)for(const e of g.edges)if(e.u===q[i]&&dist[e.u]+e.w===dist[e.v]&&hops[e.v]===Infinity){hops[e.v]=hops[e.u]+1;q.push(e.v);}return hops;}
 function path(ref,target){const result=[],seen=new Set();for(let v=target;v!==null;v=ref.prev[v]){if(seen.has(v))throw Error('Cyclic predecessor certificate.');seen.add(v);result.unshift(v);}return result;}
 function shortestProblem(cfg){
  const r=C.rng('shortest-v1:'+cfg.seed+':'+cfg.mode+':'+cfg.difficulty),d=cfg.difficulty,wantUnreachable=r()<.27;
  for(let attempt=0;attempt<350;attempt++){
   const base=DijkstraGraph.generate(d,r,C.integer(r,0,11),true),source=base.source,n=base.g.n;let g=C.clone(base.g),ref;
   if(cfg.mode==='cycle'){
    const scenario=C.integer(r,0,3);
    const potential=Array.from({length:n},()=>C.integer(r,-10,10));g.edges.forEach(e=>e.w+=potential[e.v]-potential[e.u]);
    if(scenario!==0){
     const e=g.edges.find(e=>e.u!==source&&e.v!==source);if(!e)continue;g.edges=g.edges.filter(x=>!(x.u===e.v&&x.v===e.u));e.w=C.integer(r,1,7);g.edges.push({id:'cycle-back',u:e.v,v:e.u,w:-e.w-C.integer(r,1,7)});
     if(scenario===1)g.edges=g.edges.filter(x=>![e.u,e.v].includes(x.v)||[e.u,e.v].includes(x.u));
    }
    const info=negativeCycle(g,source);return{g,source,info};
   }
   if(cfg.mode==='dag'){
    const order=shuffle(Array.from({length:n},(_,v)=>v),r),rank=Array(n);order.forEach((v,k)=>rank[v]=k);
    g.edges=g.edges.map(e=>rank[e.u]<rank[e.v]?e:{...e,u:e.v,v:e.u});g.edges.forEach(e=>e.w=C.integer(r,-9,17));
    const start=order[wantUnreachable?1:0];ref=dagPaths(g,start);if(!g.edges.some(e=>e.w<0)||!g.edges.some(e=>e.w>0))continue;
    const hops=depths(g,start,ref.dist),max=Math.max(...hops.filter(Number.isFinite));
    if(ref.dist.filter(Number.isFinite).length<n-2||max<(d==='easy'?2:d==='medium'?3:4)||ref.improvements<(d==='easy'?0:d==='medium'?2:3))continue;
    const targets=hops.map((h,v)=>v!==start&&Number.isFinite(h)&&h>=Math.min(max,d==='hard'?3:2)?v:null).filter(v=>v!==null);
    return{g,source:start,ref,target:targets[C.integer(r,0,targets.length-1)]};
   }
   if(wantUnreachable){const v=(source+n-1)%n;g.edges=g.edges.filter(e=>e.u!==v&&e.v!==v);}
   if(cfg.mode==='bfs')g.edges.forEach(e=>e.w=1);
   else{const potential=Array.from({length:n},()=>C.integer(r,-14,14));g.edges.forEach(e=>e.w+=potential[e.v]-potential[e.u]);if(!g.edges.some(e=>e.w<0)||!g.edges.some(e=>e.w>0))continue;}
   ref=queuePaths(g,source,cfg.mode==='bfs');const hops=depths(g,source,ref.dist),max=Math.max(...hops.filter(Number.isFinite));
   if(ref.dist.filter(Number.isFinite).length<n-2||max<(d==='easy'?2:d==='medium'?3:4))continue;
   if(cfg.mode==='negative'&&(ref.revisits<(d==='easy'?1:d==='medium'?2:3)||ref.improvements<(d==='easy'?1:d==='medium'?2:4)))continue;
   const unreachable=ref.dist.map((x,v)=>x===Infinity?v:null).filter(v=>v!==null),targets=hops.map((h,v)=>v!==source&&Number.isFinite(h)&&h>=2?v:null).filter(v=>v!==null);
   const pool=unreachable.length&&r()<.5?unreachable:targets;return{g,source,ref,target:pool[C.integer(r,0,pool.length-1)]};
  }
  throw Error('Could not generate the requested shortest-path problem. Try another seed.');
 }
 function closure(g){const reach=Array.from({length:g.n},()=>Array(g.n).fill(false));for(const e of g.edges)reach[e.u][e.v]=true;for(let k=0;k<g.n;k++)for(let u=0;u<g.n;u++)for(let v=0;v<g.n;v++)reach[u][v]||=reach[u][k]&&reach[k][v];return reach;}
 function reduce(g){return C.graph(g.n,g.edges.filter(e=>!closure({...g,edges:g.edges.filter(x=>x!==e)})[e.u][e.v]),true);}
 function activityPositions(g,r){
  const angle=r()*2*Math.PI,points=shuffle(Array.from({length:g.n},(_,v)=>({x:450+350*Math.cos(angle+2*Math.PI*v/g.n),y:300+235*Math.sin(angle+2*Math.PI*v/g.n)})),r);
  const crossings=()=>{let count=0;for(let i=0;i<g.edges.length;i++)for(let j=i+1;j<g.edges.length;j++){const a=g.edges[i],b=g.edges[j];if(![a.u,a.v].includes(b.u)&&![a.u,a.v].includes(b.v)&&DijkstraGraph.crosses(points[a.u],points[a.v],points[b.u],points[b.v]))count++;}return count;};
  let score=crossings();for(let pass=0;pass<8;pass++){let changed=false;for(let u=0;u<g.n;u++)for(let v=u+1;v<g.n;v++){[points[u],points[v]]=[points[v],points[u]];const next=crossings();if(next<score){score=next;changed=true;}else[points[u],points[v]]=[points[v],points[u]];}if(!changed)break;}
  return points;
 }
 function activityProblem(cfg){
  const r=C.rng('activity-v1:'+cfg.seed+':'+cfg.mode+':'+cfg.difficulty),d=cfg.difficulty,n=C.integer(r,...{easy:[4,5],medium:[6,8],hard:[8,12]}[d]);
  for(let attempt=0;attempt<300;attempt++){
   const order=shuffle(Array.from({length:n},(_,v)=>v),r),es=[{u:order[0],v:order[2]},{u:order[1],v:order[2]},{u:order[C.integer(r,0,1)],v:order[3]}];
   for(let i=4;i<n;i++){const count=C.integer(r,1,Math.min(d==='easy'?2:3,i)),parents=shuffle(order.slice(0,i),r).slice(0,count);for(const u of parents)es.push({u,v:order[i]});}
   const g=reduce(C.graph(n,es,true)),inDegree=C.degrees(g),outDegree=Array.from({length:n},(_,v)=>g.edges.filter(e=>e.u===v).length);
   if(inDegree.filter(x=>x>1).length<(d==='hard'?3:d==='medium'?2:1)||d==='hard'&&outDegree.filter(x=>x>1).length<3)continue;
   const durations=Array.from({length:n},()=>C.integer(r,1,9));g.positions=activityPositions(g,r);
   let completed=[];for(let k=0;k<C.integer(r,1,Math.max(1,n-3));k++){const available=C.eligible(g,completed);completed.push(available[C.integer(r,0,available.length-1)]);}
   return{g,durations,completed,order:C.kahn(g).order,reach:closure(g)};
  }
  throw Error('Could not generate an activity network. Try another seed.');
 }
 function eventProblem(base,cfg){
  const r=C.rng('event-v1:'+cfg.seed+cfg.difficulty),n=base.g.n,rank=Array(n);base.order.forEach((v,i)=>rank[v]=i);
  const real=Array.from({length:n},(_,v)=>({id:'a'+v,u:2*v,v:2*v+1,w:base.durations[v],activity:v}));
  const pairs=base.g.edges.map(e=>({u:e.u,v:e.v,required:true})),other=[];
  for(let u=0;u<n;u++)for(let v=0;v<n;v++)if(rank[u]<rank[v]&&!pairs.some(e=>e.u===u&&e.v===v))other.push({u,v,required:false});
  shuffle(other,r);pairs.push(...other.slice(0,cfg.difficulty==='hard'?6:cfg.difficulty==='medium'?4:2));shuffle(pairs,r);
  const candidates=pairs.map((e,i)=>({id:'q'+(i+1),u:2*e.u+1,v:2*e.v,w:0,required:e.required})),proposed=candidates.filter(e=>e.required?r()<.7:r()<.4).map(e=>e.id),diagram=C.graph(2*n,[...real,...candidates],true),sorted=C.kahn(diagram).order,level=Array(2*n).fill(0);
  for(const u of sorted)for(const e of diagram.edges.filter(e=>e.u===u))level[e.v]=Math.max(level[e.v],level[u]+1);
  diagram.format='exam';diagram.layers=Array.from({length:Math.max(...level)+1},(_,k)=>sorted.filter(v=>level[v]===k));
  return{real,candidates,proposed,diagram};
 }
 function eventRelations(p,selected){const edges=[...p.real,...p.candidates.filter(e=>selected.includes(e.id))],g=C.graph(p.diagram.n,edges,true);if(C.kahn(g).cyclic)return null;const reach=closure(g);return p.g.positions.map((_,u)=>p.g.positions.map((_,v)=>reach[2*u+1][2*v]));}
 function sameRelations(a,b){return !!a&&a.every((row,u)=>row.every((yes,v)=>yes===b[u][v]));}
 function eventLabel(v){return String(Math.floor(v/2)+1)+(v%2?'':'′');}
 const eventModels=new WeakMap();
 function eventLayout(p){
  if(eventModels.has(p.diagram))return eventModels.get(p.diagram);
  const rows=Math.ceil(p.g.n/3),width=1100,height=230+(rows-1)*200,positions=Array(p.diagram.n),routes=[],boxes=[];
  p.order.forEach((v,i)=>{positions[2*v]={x:100+(i%3)*350,y:110+Math.floor(i/3)*200};positions[2*v+1]={x:235+(i%3)*350,y:110+Math.floor(i/3)*200};});
  const nodeBoxes=positions.map(a=>({x:a.x-34,y:a.y-34,w:68,h:68})),overlap=(a,b,pad=0)=>a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;
  const lanes=[];for(let row=0;row<rows;row++)for(const offset of [-70,65,85])lanes.push(110+row*200+offset);
  function label(points,strict){const candidates=[];for(let j=1;j<points.length;j++)for(const t of [.5,.3,.7,.15,.85]){const a=points[j-1],b=points[j],x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;candidates.push({x:x-26,y:y-14,w:52,h:28});}return candidates.find(box=>box.x>5&&box.x+box.w<width-5&&box.y>5&&box.y+box.h<height-5&&!nodeBoxes.some(node=>overlap(box,node,5))&&!boxes.some(b=>overlap(box,b,9))&&(!strict||!routes.some(r=>PertCore.routeHits(r.points,box,5))));}
  for(const e of p.diagram.edges){
   const a=positions[e.u],b=positions[e.v],real=e.id[0]==='a';let chosen=null;
   for(const strict of [true,false]){
    const choices=real?[a.y]:lanes.slice().sort((x,y)=>Math.abs(x-(a.y+b.y)/2)-Math.abs(y-(a.y+b.y)/2));
    outer:for(const lane of choices)for(const out of real?[0]:[60,80,100])for(const into of real?[0]:[60,80,100]){
     const points=real?[{x:a.x+27,y:a.y},{x:b.x-30,y:b.y}]:[{x:a.x+27,y:a.y},{x:a.x+out,y:a.y},{x:a.x+out,y:lane},{x:b.x-into,y:lane},{x:b.x-into,y:b.y},{x:b.x-30,y:b.y}];
     if(points.some(q=>q.x<5||q.x>width-5||q.y<5||q.y>height-5)||nodeBoxes.some((box,v)=>v!==e.u&&v!==e.v&&PertCore.routeHits(points,box,2))||strict&&boxes.some(box=>PertCore.routeHits(points,box,5)))continue;
     const box=label(points,strict);if(box){chosen={id:e.id,points,label:box,path:points.map((q,i)=>(i?'L ':'M ')+q.x+' '+q.y).join(' ')};break outer;}
    }
    if(chosen)break;
   }
   if(!chosen)throw Error('Could not route the fixed event diagram. Try another seed.');routes.push(chosen);boxes.push(chosen.label);
  }
  const model={width,height,positions,edges:routes};eventModels.set(p.diagram,model);return model;
 }
 let diagramId=0;
 function eventView(ctx,p,selected,solution=false){
  const K=LabKit,E=K.E,natural=eventLayout(p),available=ExpandedViews.width('activitySection',70),model=natural.width>available?ExpandedViews.dag(p.diagram,available,{radius:24,labelText:e=>e.id[0]==='a'?K.letter(e.activity)+'/'+e.w:'0'}):natural,ns='http://www.w3.org/2000/svg',S=ExpandedViews.svg,wrap=E('div',undefined,'nl-graph new-event-graph'),svg=S('svg',{viewBox:'0 0 '+model.width+' '+model.height,width:model.width,height:model.height,role:'group','aria-label':'Fixed event network; primed events are distinct vertices'}),id='activity-arrows-'+(++diagramId),defs=S('defs');defs.append(ExpandedViews.arrowMarker(id,7));svg.append(defs);
  const edgeLayer=S('g'),labelLayer=S('g');svg.append(edgeLayer,labelLayer);
  for(const e of p.diagram.edges){const real=e.id[0]==='a',on=real||selected.includes(e.id),route=model.edges.find(x=>x.id===e.id),color=on?'#A8B7AC':'#454545',group=S('g',{'data-activity-connection':e.id}),path=S('path',{d:route.path,fill:'none',stroke:color,'stroke-width':on?2.5:1.5,'marker-end':'url(#'+id+')',opacity:on?1:.55});if(!real)path.setAttribute('stroke-dasharray','6 4');group.append(path);edgeLayer.append(group);const b=route.label,box=S('g',{tabindex:0,'aria-label':real?'Activity '+K.letter(e.activity)+' '+eventLabel(e.u)+' to '+eventLabel(e.v)+' duration '+e.w:'Zero-duration dummy edge '+eventLabel(e.u)+' to '+eventLabel(e.v)+' (0)'});box.dataset.activityEditor=e.id;box.id=(solution?'activityWorkedEdge':'activityEventEdge')+e.id;box.style.cursor='pointer';if(ctx.selectEventEdge&&!solution){const choose=()=>ctx.selectEventEdge(e.id);group.onclick=choose;box.onclick=choose;box.setAttribute('role','button');box.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();choose();}};}box.append(S('title',{},real?'Activity '+K.letter(e.activity)+'/'+e.w+': '+eventLabel(e.u)+' to '+eventLabel(e.v):eventLabel(e.u)+' \u2192 '+eventLabel(e.v)+' (0), dummy edge'),S('rect',{x:b.x,y:b.y,width:b.w,height:b.h,rx:7,fill:'#2F2F2F',stroke:color}),S('text',{x:b.x+b.w/2,y:b.y+b.h/2+5,'text-anchor':'middle',fill:color,'font-size':14},real?K.letter(e.activity)+'/'+e.w:'0'));const trace=active=>{path.setAttribute('stroke',active?'#10A37F':color);path.setAttribute('stroke-width',active?4:on?2.5:1.5);path.setAttribute('opacity',active?1:on?1:.55);};box.onpointerenter=()=>trace(true);box.onpointerleave=()=>trace(false);box.onfocus=()=>trace(true);box.onblur=()=>trace(false);labelLayer.append(box);}
  const inspected=[...edgeLayer.querySelectorAll('g[data-activity-connection]')].map(group=>{const path=group.querySelector('path'),hit=S('path',{d:path.getAttribute('d'),fill:'none',stroke:'transparent','stroke-width':14});group.append(hit);const label=[...labelLayer.querySelectorAll('g[data-activity-editor]')].find(x=>x.dataset.activityEditor===group.dataset.activityConnection);return{path,hit,rect:label?.querySelector('rect'),text:label?.querySelector('text'),labelGroup:label};});GraphEdgeInspection.install(svg,inspected);
  for(let v=0;v<p.diagram.n;v++){const a=model.positions[v];svg.append(S('circle',{cx:a.x,cy:a.y,r:24,fill:'#2F2F2F',stroke:'#45564C','stroke-width':2}),S('text',{x:a.x,y:a.y+5,'text-anchor':'middle','font-size':16,fill:'#A8B7AC'},eventLabel(v)));}
  svg.style.width=model.width+'px';svg.style.height=model.height+'px';wrap.tabIndex=0;wrap.append(svg);return wrap;
 }
 const eventEdgeLabel=e=>e.id[0]==='a'?String.fromCharCode(65+e.activity)+' '+eventLabel(e.u)+' \u2192 '+eventLabel(e.v)+' ('+e.w+')':eventLabel(e.u)+' \u2192 '+eventLabel(e.v)+' (0)';return{shuffle,queuePaths,negativeCycle,dagPaths,depths,path,shortestProblem,closure,activityProblem,eventProblem,eventRelations,sameRelations,eventLabel,eventEdgeLabel,eventLayout,eventView};
})();

const ShortestQuestions=(()=>{
 const G=GraphCore,Q=QuizGraphCore,C=GraphExamCore,L=C.L,modes={bfs:'Unweighted Paths',negative:'Negative Edges',cycle:'Negative Cycles',dag:'DAG Shortest Paths'};
 const sameSet=(a,b)=>a&&a.length===new Set(a).size&&a.length===b.length&&a.every(v=>b.includes(v));
 function generate(cfg){const r=G.rng(cfg.seed+':focus'),base=Q.shortestProblem(cfg),p={...base,cfg,kind:cfg.mode,title:'Question',fields:[],steps:[],weighted:cfg.mode!=='bfs',showGraph:true,contract:'Use explicit Unreachable controls for final distances. Blank fields are unanswered. No correctness feedback before Check Answer.'};
  // Reoriented geometric arcs can coincide; keep the lightest directed edge.
  const unique=new Map();for(const e of p.g.edges){const key=e.u+':'+e.v;if(!unique.has(key)||unique.get(key).w>e.w)unique.set(key,e);}p.g={...p.g,edges:[...unique.values()]};
  p.initial={answers:{},chosen:[],noPath:false,dist:Array(p.g.n).fill(null),prev:Array(p.g.n).fill(null),known:Array(p.g.n).fill(false),stages:[],active:0};
  if(p.kind==='cycle'){p.target=G.integer(r,0,p.g.n-1);p.variant=['exists','witness','affected'][G.integer(r,0,2)];p.affected=C.affected(p.g,p.source);p.info=Q.negativeCycle(p.g,p.source);p.question=p.variant==='affected'?'From source '+L(p.source)+', classify the shortest distance to '+L(p.target)+'.':(p.variant==='witness'?'Is a negative-cost cycle reachable from '+L(p.source)+'? If yes, identify any such cycle and enter its total weight.':'Is any negative-cost cycle reachable from source '+L(p.source)+'?');p.fields=[{key:'choice',type:'choice',choices:p.variant==='affected'?[['finite','Finite shortest distance'],['unreachable','Unreachable'],['unbounded','Unbounded below']]:[['yes','Yes'],['no','No']],expected:p.variant==='affected'?p.affected.includes(p.target)?'unbounded':Number.isFinite(G.bellman(p.g,p.source)[p.target])?'finite':'unreachable':p.info.exists?'yes':'no'}];return p;}
  if(p.kind==='bfs'&&r()<.35)p.g={...p.g,directed:false};const tr=C.trace(p.g,p.source,p.kind);p.ref={dist:tr.final.dist,prev:tr.final.prev,order:tr.final.order,steps:tr.states.map(x=>x.after)};p.referenceTrace=tr;
  const variants=p.kind==='bfs'?['distance','path','table','level','step','trace']:p.kind==='negative'?['table','path','relax','step','trace']:['distance','path','table','order','eligible','step','trace'];p.variant=variants[G.integer(r,0,variants.length-1)];
  if(p.variant==='distance')p.question='From '+L(p.source)+', determine the shortest '+(p.kind==='bfs'?'distance in number of edges':'path cost')+' to '+L(p.target)+'.';
  if(p.variant==='path'){p.askCost=p.kind!=='bfs'&&r()<.5;p.question='Give any shortest path from '+L(p.source)+' to '+L(p.target)+(p.askCost?' and its total cost.':'.');}
  if(p.variant==='table'){p.askPrev=r()<.5;p.question='Determine all final shortest distances from '+L(p.source)+(p.askPrev?' and a valid predecessor for each reachable non-source vertex.':'.')+(p.kind==='negative'?' Use queue-based reprocessing; negative edges are present but no reachable negative-cost cycle exists.':p.kind==='dag'?' Use topological-order relaxation; negative edges are allowed.':' Count edges, regardless of the displayed layout.');}
  if(p.variant==='level'){p.level=G.integer(r,1,Math.max(1,Math.min(4,...p.ref.dist.filter(Number.isFinite).map(x=>Math.max(1,x)))));p.expected=p.ref.dist.flatMap((d,v)=>d===p.level?[v]:[]);p.question='Which vertices have unweighted distance '+p.level+' from '+L(p.source)+'? Enter none if no vertex does.';}
  if(p.variant==='order')p.question='Give any complete topological processing order for this DAG. Negative weights do not change which orders are valid.';
  if(p.variant==='eligible'){p.prefix=p.ref.order.slice(0,G.integer(r,1,Math.max(1,p.g.n-2)));p.expected=G.eligible(p.g,p.prefix);p.question='Already processed: '+p.prefix.map(L).join(', ')+'. Which vertices may be processed next in a topological-order shortest-path algorithm?';}
  if(p.variant==='relax'){const edge=p.g.edges[G.integer(r,0,p.g.edges.length-1)],du=G.integer(r,-12,20),dv=G.integer(r,-8,30),candidate=du+edge.w;p.edge=edge;p.du=du;p.dv=dv;p.showGraph=false;p.question='Queue-based negative-edge relaxation: d['+L(edge.u)+'] = '+du+', d['+L(edge.v)+'] = '+dv+', edge '+L(edge.u)+' → '+L(edge.v)+' has weight '+edge.w+'. Give the updated d['+L(edge.v)+'] and whether its predecessor changes.';p.fields=[{key:'value',label:'Updated distance',type:'number',expected:Math.min(dv,candidate)},{key:'choice',type:'choice',choices:[['yes','Predecessor changes'],['no','Predecessor unchanged']],expected:candidate<dv?'yes':'no'}];p.steps=['Candidate '+du+' + ('+edge.w+') = '+candidate+'. Take min('+dv+', '+candidate+'). '+(candidate<dv?'Set the predecessor to '+L(edge.u)+'. Enqueue the destination only if it is not already waiting.':'Retain the previous predecessor. An equal alternative is not a strict improvement.')];}
  if(['step','trace'].includes(p.variant)){p.traceMode=p.kind;const start=p.variant==='step'?G.integer(r,0,Math.max(0,tr.states.length-1)):0;p.stepIndex=p.variant==='step'?start:undefined;p.startState=p.variant==='step'?tr.states[start].before:C.initial(p.g,p.source,p.kind);p.initial.stages=[C.draft(p.startState)];p.question=p.variant==='step'?'Perform one '+(p.kind==='dag'?'topological relaxation stage':'FIFO queue-processing iteration')+' from the given state.':'Record the complete '+(p.kind==='dag'?'topological-order relaxation':'FIFO queue-based shortest-path')+' procedure from source '+L(p.source)+'.';p.contract='Choose the processed vertex and enter the complete after-state. Outgoing neighbors are examined alphabetically. Relax only on strict improvement; enqueue improved destinations only if not already waiting. Record Stage saves your work without checking it. '+(p.kind==='dag'?'Any valid topological order is accepted.':'A queued vertex may be processed again after a later improvement.');}
  return p;
 }
 function check(p,s){if(p.fields.length){const result=CompactQuiz.gradeFields(p,s);if(!result.ok)return result;if(p.kind!=='cycle'||p.variant!=='witness'||!p.info.exists)return result;const a=C.vertices(s.answers.value,p.g.n);if(!a||a.length<3||a[0]!==a.at(-1)||new Set(a.slice(0,-1)).size!==a.length-1)return{ok:false,message:'Enter a closed simple directed cycle.'};let cost=0;for(let i=1;i<a.length;i++){const edges=p.g.edges.filter(e=>e.u===a[i-1]&&e.v===a[i]);if(!edges.length)return{ok:false,message:'The witness uses a missing directed edge.'};cost+=Math.min(...edges.map(e=>e.w));}const reach=C.trace({...p.g,edges:p.g.edges.map(e=>({...e,w:1}))},p.source,'bfs').final.dist;return{ok:Number.isFinite(reach[a[0]])&&cost<0&&C.numeric(s.answers.cost)===cost,message:'Recheck source reachability, directed edges, and the cycle’s negative total weight.'};}
  if(p.variant==='distance')return{ok:s.dist[p.target]!==null&&s.dist[p.target]===p.ref.dist[p.target],message:'Recheck the requested distance and reachability.'};if(p.variant==='path')return C.pathCheck(p,s);if(p.variant==='table')return C.tableCheck(p,s,p.askPrev);if(['level','eligible'].includes(p.variant))return{ok:sameSet(C.vertices(s.answers.value,p.g.n),p.expected),message:'Check the complete requested vertex set.'};if(p.variant==='order'){const order=C.vertices(s.answers.value,p.g.n);return order?G.topoValid(p.g,order):{ok:false,message:'Enter a complete topological order.'};}
  if(p.variant==='trace')return C.traceGrade(p,s);
  const st=s.stages[0],before=p.startState,u=st.processed;if(!Number.isInteger(u)||(p.kind==='dag'?!G.eligible(p.g,before.order).includes(u):before.queue[0]!==u))return{ok:false,message:'Recheck which vertex may be processed in this state.'};const after=C.step(p.g,p.kind,before,u),queue=C.vertices(st.queue,p.g.n);return{ok:st.dist.every((d,v)=>d===after.dist[v])&&st.prev.every((v,i)=>v===after.prev[i])&&(p.kind==='dag'||queue&&queue.join()===after.queue.join()),message:'Recheck the distances, strict-improvement predecessors, and FIFO queue after this iteration.'};
 }
 return{modes,generate,check};
})();
const ShortestLab=(()=>{
 const K=LabKit,E=K.E,Q=ShortestQuestions,U=GraphExamUI,C=GraphExamCore,L=K.letter;
 const adapter={modes:Q.modes,signature:ctx=>ctx.s,generate:Q.generate,check:ctx=>Q.check(ctx.p,ctx.s),render(ctx){const p=ctx.p,s=ctx.s;if(!p.showGraph){CompactQuiz.renderFields(ctx);return;}const set=['level','eligible'].includes(p.variant),sequence=['path','order'].includes(p.variant)||p.kind==='cycle'&&p.variant==='witness';U.layout(ctx,()=>{
   if(p.fields.length){CompactQuiz.renderFields(ctx);if(p.kind==='cycle'&&p.variant==='witness'){ctx.ui.body.append(U.vertexEntry(ctx,'Cycle if reachable'),CompactQuiz.field(ctx,'Cycle total weight','cost',true));}return;}
   if(p.variant==='distance')ctx.ui.body.append(K.field('Distance to '+L(p.target),U.distance(ctx,s.dist,p.target,'shortestSingleDistance')));
   if(p.variant==='path')U.path(ctx);
   if(p.variant==='table')ctx.ui.body.append(U.table(ctx,{prev:p.askPrev?s.prev:null}));
   if(set||p.variant==='order')ctx.ui.body.append(U.vertexEntry(ctx,set?'Your vertex set':'Your processing order'));
   if(['trace','step'].includes(p.variant)){U.trace(ctx);if(p.variant==='step')ctx.ui.body.querySelector('[data-graph-record]')?.remove();}
  },{source:p.source,known:p.prefix||[],selectedVertices:s.chosen,vertexClick:set||sequence?v=>U.select(ctx,v,p.variant==='path'?'path':'value',set?'set':'sequence'):undefined});},
  solution(ctx){const p=ctx.p;if(p.kind==='cycle'){const items=[E('p',p.info.exists?'A negative-cost cycle is reachable from the source.':'No negative-cost cycle is reachable from this source; disconnected negative cycles do not affect it.'),E('p','Vertices with costs unbounded below: '+(p.affected.map(L).join(', ')||'none')+'. Other reachable vertices retain finite distances.')];if(p.info.exists){const a=p.info.cycle,cost=a.reduce((sum,u,i)=>sum+Math.min(...p.g.edges.filter(e=>e.u===u&&e.v===a[(i+1)%a.length]).map(e=>e.w)),0);items.push(E('p','One witness: '+[...a,a[0]].map(L).join(' → ')+', total '+cost+'. Repeat this reachable cycle arbitrarily often, then follow a path to any affected destination.'));}if(p.variant==='affected')items.push(E('p','Requested destination: '+p.fields[0].expected+'.'));return items;}if(p.fields.length)return K.list(p.steps);
   if(p.variant==='step'){const before=p.startState,u=p.kind==='dag'?GraphCore.eligible(p.g,before.order)[0]:before.queue[0],after=C.step(p.g,p.kind,before,u);return[E('p','One valid processed vertex: '+L(u)+'.'),K.table(['Vertex','After distance','Previous'],after.dist.map((d,v)=>[L(v),K.fmt(d),after.prev[v]===null?'none':L(after.prev[v])])),E('p',p.kind==='dag'?'Only outgoing edges of the processed vertex are relaxed.':'Queue after: '+(after.queue.map(L).join(', ')||'none')+'.'),K.list(after.updates.map(x=>L(x.v)+': '+K.fmt(x.old)+' → '+K.fmt(x.dist)+'.'))];}
   const items=U.solution({...p,traceMode:p.kind});if(p.kind==='dag')items.unshift(E('p','One valid topological order: '+p.ref.order.map(L).join(', ')+'. Negative weights are safe because the graph has no directed cycle.'));if(p.variant==='level'||p.variant==='eligible')items.push(E('p','Requested vertex set: '+(p.expected.map(L).join(', ')||'none')+'.'));if(p.variant==='path')items.push(E('p',Number.isFinite(p.ref.dist[p.target])?'One shortest path: '+QuizGraphCore.path(p.ref,p.target).map(L).join(' → ')+', cost '+p.ref.dist[p.target]+'.':'The target is unreachable.'));return items;
  }};
 const ctx=CompactQuiz.attach(K.create('shortest','Shortest-Path Algorithms','',adapter),'pp. 366–370, p. 372, pp. 380–381','Unweighted distances count edges. FIFO processing examines outgoing neighbors alphabetically. The negative-edge algorithm can reprocess a vertex after its distance improves; do not permanently finalize it. Enqueue an improved vertex only if it is not waiting. A reachable negative cycle makes costs unbounded only for vertices downstream of it. In a DAG, relax vertices in any valid topological order; negative weights are allowed.');return{ctx,adapter};
})();


const ActivityQuestions=(()=>{
 function focus(p){const G=GraphCore,r=G.rng(p.cfg.seed+':precedence'),L=LabKit.letter,a=G.integer(r,0,p.g.n-1),b=(a+G.integer(r,1,p.g.n-1))%p.g.n,reach=QuizGraphCore.closure(p.g),variant=G.integer(r,0,6);p.relationFrom=a;p.relationTo=b;let answer;
  if(variant===0){p.question='Is '+L(a)+' an immediate prerequisite of '+L(b)+'?';answer=p.g.edges.some(e=>e.u===a&&e.v===b);p.steps=['Immediate prerequisites correspond to direct arrows, not merely a multi-edge path. '+(answer?'The direct arrow exists.':'There is no direct arrow for this ordered pair.')];}
  if(variant===1){p.question='Must activity '+L(a)+' finish before '+L(b)+' can begin, directly or indirectly?';answer=reach[a][b];p.steps=['Follow directed prerequisite paths. '+(answer?'A directed path connects the specified predecessor to its successor.':'No directed path establishes that dependency.')];}
  if(variant===2){p.question='Can '+L(a)+' and '+L(b)+' potentially run in parallel once their other prerequisites are met?';answer=!reach[a][b]&&!reach[b][a];p.steps=['Parallelism requires neither activity to depend on the other. '+(answer?'There is no path in either direction.':'A prerequisite path prevents overlap.')];}
  if(variant===3){p.question='Completed: '+(p.completed.map(L).join(', ')||'none')+'. May uncompleted activity '+L(a)+' begin now?';answer=!p.completed.includes(a)&&p.g.edges.filter(e=>e.v===a).every(e=>p.completed.includes(e.u));p.steps=[p.completed.includes(a)?'It is already complete, so it is not an uncompleted activity that may begin.':'Check all immediate prerequisites: '+(p.g.edges.filter(e=>e.v===a).map(e=>L(e.u)).join(', ')||'none')+'.'];}
  if(variant===4){const proposed=p.order.slice();if(r()<.55){const i=G.integer(r,0,proposed.length-2);[proposed[i],proposed[i+1]]=[proposed[i+1],proposed[i]];}p.proposedOrder=proposed.slice();p.question='Is this a valid complete activity execution order: '+proposed.map(L).join(', ')+'?';answer=G.topoValid(p.g,proposed).ok;p.steps=['Check each immediate arrow against the proposed positions. '+(answer?'Every predecessor occurs before its successor.':'At least one successor is placed before its prerequisite.')];}
  if(variant===5){p.question='Would adding '+L(a)+' → '+L(b)+' impose a prerequisite that is not already implied by the original activity graph?';answer=!reach[a][b];p.steps=[answer?'There is no original directed prerequisite path from '+L(a)+' to '+L(b)+'. The new connection therefore adds a dependency (and may create a cycle if the reverse path already exists).':'The existing directed path already implies this precedence. The added edge changes the immediate-edge set but not the transitive precedence relation.'];}
  if(variant===6){p.question='An event-node connector represents only a prerequisite, with no actual work. Must it be a dummy edge of duration zero?';answer=true;p.steps=['A dummy connector records precedence without adding project duration. It is not a real activity.'];}
  p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:answer?'yes':'no'}];p.variant=variant;
 }
 return{focus};
})();

const ActivityLab=(()=>{
 const K=LabKit,C=GraphCore,Q=QuizGraphCore,E=K.E,L=K.letter,key=(u,v)=>u+':'+v;
 const specification=p=>K.table(['Activity','Duration','Immediate prerequisites'],p.durations.map((w,v)=>[L(v),w,p.g.edges.filter(e=>e.v===v).map(e=>L(e.u)).join(', ')||'None']));
 function add(ctx,u,v){if(u===v){ctx.msg('Choose two distinct activity vertices.');return;}ctx.edit(s=>{const id=key(u,v);s.edges=s.edges.includes(id)?s.edges.filter(x=>x!==id):[...s.edges,id];s.from=null;});}
 function graph(ctx,g,opts={}){const prior=ctx.p,refresh=ctx.refreshGraph;ctx.p={...prior,g,weighted:false};const view=FundamentalDrawing.view(ctx,{idPrefix:'activityWorked',vertexLabel:v=>L(v)+'/'+prior.durations[v],...opts});ctx.p=prior;ctx.refreshGraph=refresh;return view;}
 const adapter={
  modes:{node:'Construct Graph',eligible:'Eligible Activities',order:'Execution Order',event:'Event Graph',precedence:'Precedence'},
  signature:ctx=>({edges:ctx.s.edges.slice().sort(),selected:ctx.s.selected.slice().sort((a,b)=>a-b),order:ctx.s.order,connections:ctx.s.connections.slice().sort(),types:ctx.s.types,durations:ctx.s.durations,initialAnswer:ctx.s.initialAnswer}),
  generate(cfg){if(!Object.hasOwn(adapter.modes,cfg.mode))throw Error('Unknown activity exercise.');const base=Q.activityProblem({...cfg,mode:cfg.mode==='precedence'?'eligible':cfg.mode}),event=cfg.mode==='event'?Q.eventProblem(base,cfg):{},p={...base,...event,cfg,kind:cfg.mode,title:adapter.modes[cfg.mode]};
   if(cfg.mode==='event')p.proposedFaithful=Q.sameRelations(Q.eventRelations(p,p.proposed),p.reach);
   return{...p,question:cfg.mode==='node'?'Construct the activity-node graph from the table. Add exactly the listed immediate prerequisite edges.':cfg.mode==='eligible'?'The listed activities are completed. Select every uncompleted activity that can begin now.':cfg.mode==='order'?'Construct one complete valid activity execution order for this network.':'Does the proposed event network encode exactly the listed precedences? Record your conclusion, then repair its optional connections and classify the included edges with their durations.',contract:cfg.mode==='event'?'Activity edges are fixed. Toggle optional q-connections to represent dependencies. Primed event labels identify distinct vertices. The initial proposal is listed below; your repairs are graded separately. Equivalent networks with the same precedence relationships are accepted.':cfg.mode==='node'?'Vertices show activity/duration. Click a source and destination to toggle an edge, or use the selectors. Click an existing edge to remove it. No validation occurs until final submission.':'Vertices show activity/duration. Parallel activities may be processed in any valid order.',initial:{answers:{},chosen:[],eventSelected:null,edges:[],from:null,to:0,selected:[],order:[],connections:cfg.mode==='event'?p.proposed.slice():[],types:{},durations:{},initialAnswer:null}};
  },
  render(ctx){
   const p=ctx.p,s=ctx.s,U=GraphExamUI;
   if(p.kind==='event'){
    const grid=E('div',undefined,'ge-layout'),diagram=E('div'),answer=E('div',undefined,'ge-answers');ctx.selectEventEdge=id=>ctx.edit(x=>x.eventSelected=id);diagram.append(Q.eventView(ctx,p,s.connections));grid.append(diagram,answer);ctx.ui.body.append(grid);
    answer.append(specification(p),E('p','Original optional connections: '+(p.candidates.filter(e=>p.proposed.includes(e.id)).map(Q.eventEdgeLabel).join(', ')||'none')+'.'));
    const conclusion=K.select([['','Choose'],['yes','Original proposal preserves precedence'],['no','Original proposal adds / omits dependencies']],s.initialAnswer??'',v=>ctx.edit(x=>x.initialAnswer=v||null));answer.append(K.field('Original proposal',conclusion));
    const all=[...p.real,...p.candidates],select=K.select([['','Select an edge'],...all.map(e=>[e.id,Q.eventEdgeLabel(e)])],s.eventSelected??'',v=>ctx.selectEventEdge(v||null));answer.append(K.field('Edit connection',select));
    const edge=all.find(e=>e.id===s.eventSelected);if(edge){const real=edge.id[0]==='a',panel=E('div',undefined,'ge-context');panel.append(E('strong',Q.eventEdgeLabel(edge)));
     if(!real){const include=E('input');include.type='checkbox';include.checked=s.connections.includes(edge.id);include.dataset.activityConnection=edge.id;include.onchange=()=>ctx.edit(x=>x.connections=include.checked?[...new Set([...x.connections,edge.id])]:x.connections.filter(id=>id!==edge.id));panel.append(K.field('Include',include));}
     if(real||s.connections.includes(edge.id)){const type=K.select([['','Choose'],['activity','Activity'],['dummy','Dummy']],s.types[edge.id]??'',v=>ctx.edit(x=>x.types[edge.id]=v)),duration=K.input(s.durations[edge.id]??'',v=>ctx.edit(x=>x.durations[edge.id]=CompactQuiz.number(v)));type.id='activityType'+edge.id;type.dataset.activityType=edge.id;duration.dataset.activityDuration=edge.id;duration.id='activityDuration'+edge.id;duration.setAttribute('aria-label','Duration for '+Q.eventEdgeLabel(edge));panel.append(K.field('Type',type),K.field('Duration',duration));}answer.append(panel);
    }else answer.append(E('p','Select an edge label to edit its inclusion, type, and duration.','cq-help'));return;
   }
   const g=p.kind==='node'?{...p.g,edges:s.edges.map(id=>{const[u,v]=id.split(':').map(Number);return{id,u,v,w:1};}).filter(e=>[e.u,e.v].every(v=>Number.isInteger(v)&&v>=0&&v<p.g.n)&&e.u!==e.v)}:p.g;
   const original=ctx.p;ctx.p={...p,g,weighted:false};U.layout(ctx,()=>{
    if(p.kind==='node'){ctx.ui.body.append(specification(p));const input=K.input(s.answers.edges??'',value=>ctx.edit(x=>{x.answers.edges=value;const tokens=value.trim()?value.toUpperCase().split(',').map(t=>t.trim()):[];x.edges=tokens.map(t=>{const m=t.match(/^([A-Z])\s*(?:>|->|→)\s*([A-Z])$/);return m?(m[1].charCodeAt(0)-65)+':'+(m[2].charCodeAt(0)-65):'invalid';});}));input.id='activityEdges';input.setAttribute('aria-label','Immediate edges');FormEvents.submitOnEnter(input,()=>ctx.check('final'));ctx.ui.body.append(K.field('Your edges (A>B, A>C)',input));}
    if(['eligible','order'].includes(p.kind)){if(p.kind==='eligible')ctx.ui.body.append(E('p','Completed: '+(p.completed.map(L).join(', ')||'none')));const input=K.input(s.answers.value??'',value=>ctx.edit(x=>{x.answers.value=value;const a=GraphExamCore.vertices(value,p.g.n)||[];if(p.kind==='eligible')x.selected=a;else x.order=a;x.chosen=a;}));input.id='activityVertices';input.setAttribute('aria-label',p.kind==='eligible'?'Eligible activities':'Execution order');FormEvents.submitOnEnter(input,()=>ctx.check('final'));ctx.ui.body.append(K.field(p.kind==='eligible'?'Eligible activities':'Execution order',input));}
    if(p.kind==='precedence')CompactQuiz.renderFields(ctx);
   },{vertexLabel:v=>L(v)+'/'+p.durations[v],known:p.kind==='eligible'?p.completed:[],selectedVertices:p.kind==='node'?s.from===null?[]:[s.from]:p.kind==='eligible'?s.selected:s.order,vertexClick:p.kind==='precedence'?undefined:v=>{if(p.kind==='node'){if(s.from===null)ctx.edit(x=>x.from=v);else if(s.from!==v)ctx.edit(x=>{const id=key(x.from,v);x.edges=x.edges.includes(id)?x.edges.filter(e=>e!==id):[...x.edges,id];x.from=null;x.answers.edges=x.edges.map(e=>e.split(':').map(Number).map(L).join('>')).join(', ');});}else ctx.edit(x=>{if(p.kind==='eligible')x.selected=x.selected.includes(v)?x.selected.filter(a=>a!==v):[...x.selected,v];else x.order.push(v);x.chosen=p.kind==='eligible'?x.selected:x.order;x.answers.value=x.chosen.map(L).join(', ');});},edgeClick:p.kind==='node'?id=>ctx.edit(x=>{x.edges=x.edges.filter(e=>e!==id);x.answers.edges=x.edges.map(e=>e.split(':').map(Number).map(L).join('>')).join(', ');}):undefined});ctx.p=original;
  },
  check(ctx){
   const p=ctx.p,s=ctx.s;if(p.kind==='precedence')return CompactQuiz.gradeFields(p,s);if(p.kind==='node'){
    if(new Set(s.edges).size!==s.edges.length)return{ok:false,message:'Do not repeat precedence edges.'};const actual=s.edges.map(id=>{const[u,v]=id.split(':').map(Number);return{u,v};});
    if(actual.some(e=>![e.u,e.v].every(v=>Number.isInteger(v)&&v>=0&&v<p.g.n)||e.u===e.v)||C.kahn(C.graph(p.g.n,actual,true)).cyclic)return{ok:false,message:'The activity graph must have distinct valid vertices on each edge and no directed cycles.'};
    const expected=new Set(p.g.edges.map(e=>key(e.u,e.v)));return{ok:s.edges.length===expected.size&&s.edges.every(id=>expected.has(id)),message:s.edges.length===expected.size&&s.edges.every(id=>expected.has(id))?'Correct immediate prerequisite graph and preserved durations.':'The graph omits or adds immediate prerequisites. Compare it with the supplied table.'};
   }
   if(p.kind==='eligible'){if(!String(s.answers.value??'').trim())return{ok:false,message:'Select eligible activities or enter none explicitly.'};const eligible=C.eligible(p.g,p.completed);return{ok:new Set(s.selected).size===s.selected.length&&s.selected.length===eligible.length&&s.selected.every(v=>eligible.includes(v)),message:s.selected.length===eligible.length&&s.selected.every(v=>eligible.includes(v))?'Correct eligible activities.':'Select all and only uncompleted activities whose prerequisites are completed.'};}
   if(p.kind==='order')return C.topoValid(p.g,s.order);
   if(!['yes','no'].includes(s.initialAnswer)||(s.initialAnswer==='yes')!==p.proposedFaithful)return{ok:false,message:'Recheck whether the original proposal adds or omits any precedence, separately from your repaired graph.'};
   if(new Set(s.connections).size!==s.connections.length||s.connections.some(id=>!p.candidates.some(e=>e.id===id)))return{ok:false,message:'Use distinct connections from the fixed event layout.'};
   for(const e of [...p.real,...p.candidates.filter(e=>s.connections.includes(e.id))])if(s.types[e.id]!==('activity'in e?'activity':'dummy')||s.durations[e.id]!==e.w)return{ok:false,message:'Recheck the included edge classifications and durations. Empty duration fields are unanswered.'};
   return{ok:Q.sameRelations(Q.eventRelations(p,s.connections),p.reach),message:Q.sameRelations(Q.eventRelations(p,s.connections),p.reach)?'Correct event network, edge types, durations, and exact precedence relationships.':'The repaired network adds a false dependency or omits a required dependency.'};
  },
  solution(ctx){
   const p=ctx.p;if(p.kind==='precedence')return K.list(p.steps);if(p.kind==='event'){const chosen=p.candidates.filter(e=>e.required).map(e=>e.id);return[E('p','The initial proposal '+(p.proposedFaithful?'preserves':'does not preserve')+' the listed precedences. One correct repair uses '+p.candidates.filter(e=>chosen.includes(e.id)).map(Q.eventEdgeLabel).join(', ')+'. Other connections preserving exactly the same transitive precedence relation are also valid.'),Q.eventView(ctx,p,chosen,true),K.table(['Edge','Type','Duration'],[...p.real,...p.candidates.filter(e=>e.required)].map(e=>[Q.eventEdgeLabel(e),e.id[0]==='a'?'Real activity':'Dummy edge',e.w])),K.list(p.g.edges.map(e=>'Completion of '+L(e.u)+' \u2192 '+L(e.v)+', so retain a zero-duration connector '+Q.eventLabel(2*e.u+1)+' \u2192 '+Q.eventLabel(2*e.v)+'. No unrelated predecessor is merged into that start event.'))];}
   if(p.kind==='node')return[specification(p),graph(ctx,p.g),K.list(p.g.edges.map(e=>'Draw '+L(e.u)+' \u2192 '+L(e.v)+' because '+L(e.u)+' \u2192 '+L(e.v)+'.'))];
   if(p.kind==='eligible')return[E('p','Eligible: '+C.eligible(p.g,p.completed).map(L).join(', ')+'.'),K.list(Array.from({length:p.g.n},(_,v)=>L(v)+': '+(p.completed.includes(v)?'already completed':p.g.edges.filter(e=>e.v===v).every(e=>p.completed.includes(e.u))?'all prerequisites completed':'still waiting for '+p.g.edges.filter(e=>e.v===v&&!p.completed.includes(e.u)).map(e=>L(e.u)).join(', '))))];
   return[E('p','One valid execution order: '+p.order.map(L).join(' → ')+'. Other topological orders are accepted.'),K.list(p.order.map((v,i)=>L(v)+' has all prerequisites among {'+p.order.slice(0,i).map(L).join(', ')+'}.'))];
  }
 };
 const generate=adapter.generate;adapter.generate=cfg=>{const p=generate(cfg);p.title='Question';if(cfg.mode==='eligible'&&C.rng(cfg.seed+':all-complete')()<.1)p.completed=p.order.slice();p.contract=cfg.mode==='node'?'Click a predecessor then a successor, or enter A>B edges. Click an existing edge to remove it.':cfg.mode==='event'?'Select a connection to edit it. Primed event labels are distinct; optional dummy connections must preserve exactly the listed dependencies.':'';if(cfg.mode==='precedence')ActivityQuestions.focus(p);return p;};const ctx=CompactQuiz.attach(K.create('activity','Activity Graphs','',adapter),'pp. 380–384','Activity vertices carry durations; arrows give immediate prerequisites. An activity may begin after every prerequisite is completed. Independent activities may proceed in parallel. Event-node networks represent real activities as duration-bearing edges and dummy dependencies as zero-duration edges. Preserve exactly the intended precedence relation; extra transitive edges are not immediate prerequisites.');return{ctx,adapter};
})();
// End independent graph labs.

// Additional assigned Quiz 2 topics; no existing lab behavior is replaced.
/* Presentation shared only by the three focused Quiz 2 topics. */

const LowerBoundCore=(()=>{
 const G=GraphCore,Q=QuizGraphCore;
 function factorial(n){let x=1;for(let i=2;i<=n;i++)x*=i;return x;}
 function depth(leaves){let d=0,capacity=1;while(capacity<leaves){d++;capacity*=2;}return d;}
 function permutations(a){if(!a.length)return[[]];return a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[v,...p]));}
 function makeTree(n,r){let id=0;const all=permutations(Array.from({length:n},(_,i)=>i));
  function build(cases){const node={id:'t'+id++};if(cases.length===1)return node;
   const pairs=[];for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){const left=cases.filter(p=>p.indexOf(a)<p.indexOf(b));if(left.length&&left.length<cases.length)pairs.push({a,b,score:Math.abs(cases.length-2*left.length)});}
   pairs.sort((a,b)=>a.score-b.score);const pair=pairs[G.integer(r,0,Math.min(2,pairs.length-1))];node.a=pair.a;node.b=pair.b;node.left=build(cases.filter(p=>p.indexOf(pair.a)<p.indexOf(pair.b)));node.right=build(cases.filter(p=>p.indexOf(pair.a)>p.indexOf(pair.b)));return node;
  }
  return build(all);
 }
 function nodes(tree){return[tree,...(tree.left?[...nodes(tree.left),...nodes(tree.right)]:[])];}
 function interpret(tree,n){const leaves=nodes(tree).filter(x=>!x.left),cases=Object.fromEntries(leaves.map(x=>[x.id,[]]));let maxDepth=0;for(const order of permutations(Array.from({length:n},(_,i)=>i))){let node=tree,d=0;while(node.left){if(node.a===node.b||![node.a,node.b].every(x=>Number.isInteger(x)&&x>=0&&x<n))return null;node=order.indexOf(node.a)<order.indexOf(node.b)?node.left:node.right;d++;}cases[node.id].push(order);maxDepth=Math.max(maxDepth,d);}const structuralDepth=t=>t.left?1+Math.max(structuralDepth(t.left),structuralDepth(t.right)):0;return{leaves:leaves.length,depth:structuralDepth(tree),maxDepth,cases,enough:Object.values(cases).every(a=>a.length<=1)};}
 function parseOrder(value,n){const letters=String(value??'').toUpperCase().match(/[A-Z]/g)||[];if(letters.length!==n||new Set(letters).size!==n||letters.some(x=>x.charCodeAt(0)-65>=n))return null;return letters.map(x=>x.charCodeAt(0)-65);}
 function gradeTree(tree,n,labels){const info=interpret(tree,n);if(!info||!info.enough)return{ok:false,message:'The completed tree still sends different input orderings to the same leaf, or contains an invalid comparison.'};for(const[id,cases]of Object.entries(info.cases)){if(!cases.length){if(!['unreachable','none'].includes(String(labels[id]).trim().toLowerCase()))return{ok:false,message:'An unreachable branch cannot be labeled with a possible ordering.'};}else{const order=parseOrder(labels[id],n);if(!order||order.some((v,i)=>v!==cases[0][i]))return{ok:false,message:'A leaf ordering is missing or contradicts a comparison on its path.'};}}return{ok:true,message:'Correct complete comparison tree; every ordering reaches a correctly labeled leaf.'};}
 function draw(tree,n,labels={},worked=false,onSelect,target=null,selected=null){
  const K=LabKit,E=K.E,ns='http://www.w3.org/2000/svg',S=ExpandedViews.svg,all=nodes(tree),leaves=all.filter(x=>!x.left),info=worked?interpret(tree,n):null,width=Math.max(180,leaves.length*82+12),height=65+interpret(tree,n).depth*70,svg=S('svg',{width,height,viewBox:'0 0 '+width+' '+height,role:'group','aria-label':'Comparison decision tree; left branches mean less, right branches mean greater'}),positions=new Map();let next=0;
  function place(t,depth){let x;if(t.left){const a=place(t.left,depth+1),b=place(t.right,depth+1);x=(a+b)/2;}else x=47+(next++)*82;positions.set(t.id,{x,y:30+depth*70});return x;}place(tree,0);
  const visualItems=all.map(t=>({id:t.id,...positions.get(t.id)})),visualMap=new Map(visualItems.map(i=>[i.id,i])),visualEdges=all.filter(t=>t.left).flatMap(t=>[{a:visualMap.get(t.id),b:visualMap.get(t.left.id)},{a:visualMap.get(t.id),b:visualMap.get(t.right.id)}]),visual=ExpandedViews.tree({items:visualItems,edges:visualEdges,width,height},ExpandedViews.width('boundsSection',44),76,60);visual.items.forEach(i=>positions.set(i.id,i));svg.setAttribute('width',visual.width);svg.setAttribute('height',visual.height);svg.setAttribute('viewBox','0 0 '+visual.width+' '+visual.height);
  for(const t of all)if(t.left){const p=positions.get(t.id);for(const [child,outcome,offset]of [[t.left,'<',-9],[t.right,'>',9]]){const q=positions.get(child.id);const route=visual.edges.find(e=>e.a.id===t.id&&e.b.id===child.id);svg.append(route?.path?S('path',{d:route.path,fill:'none',stroke:'#45564C','stroke-width':1.5}):S('line',{x1:p.x,y1:p.y+16,x2:q.x,y2:q.y-17,stroke:'#45564C','stroke-width':1.5}),S('text',{x:route?.path?q.x-47:(p.x+q.x)/2+offset,y:route?.path?q.y-5:(p.y+q.y)/2,'font-size':11,fill:'#45564C'},outcome));}}
  for(const t of all){const p=positions.get(t.id),text=t.left?K.letter(t.a)+' ? '+K.letter(t.b):worked?(info.cases[t.id][0]||[]).map(K.letter).join('<')||'unreachable':labels[t.id]||t.id,chosen=selected===t.id,group=S('g',{'data-decision-node':t.id,id:(worked?'boundsWorkedNode_':'boundsDecisionNode_')+t.id,class:'cq-decision-node'+(chosen?' selected':'')+(target===t.id?' target':'')});group.append(S('rect',{x:p.x-37,y:p.y-16,width:74,height:32,rx:7,fill:chosen?'#293A34':t.left?'#2F2F2F':'white',stroke:target===t.id?'#665A3D':'#45564C','stroke-width':target===t.id?2.5:1.3}),S('text',{x:p.x,y:p.y+4,'text-anchor':'middle','font-size':12,fill:'#A8B7AC'},String(text).length>13?String(text).slice(0,12)+'…':text));if(!t.left&&onSelect){group.setAttribute('role','button');group.setAttribute('tabindex','0');group.setAttribute('aria-label','Edit leaf '+t.id+(labels[t.id]?', current ordering '+labels[t.id]:''));group.setAttribute('aria-pressed',String(chosen));group.onclick=()=>onSelect(t.id);group.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(t.id);}};}svg.append(group);}
  const wrap=E('div',undefined,'cq-decision-scroll');wrap.tabIndex=0;wrap.setAttribute('aria-label','Scrollable decision-tree diagram');wrap.append(svg);return wrap;
 }

 return{factorial,depth,permutations,makeTree,nodes,interpret,gradeTree,parseOrder,draw};
})();

const LowerBoundQuestions=(()=>{
 const G=GraphCore,B=LowerBoundCore,K=LabKit;
 function generate(cfg){
  const r=G.rng('focused-bounds:'+cfg.mode+cfg.difficulty+cfg.seed),hard=cfg.difficulty==='hard',easy=cfg.difficulty==='easy',n=G.integer(r,...(easy?[3,5]:hard?[9,12]:[5,8])),f=B.factorial(n),bound=B.depth(f),p={cfg,kind:cfg.mode,n,f,bound,title:'Question',contract:'',fields:[],steps:[],initial:{answers:{},tree:null,labels:{},selected:null,a:0,b:1}};
  const numeric=(key,label,expected)=>({key,label,expected,type:'number'}),choice=(label,expected,choices=[['yes','Yes'],['no','No']])=>({key:'choice',label,expected,type:'choice',choices});
  const base=n+'! = '+Array.from({length:n},(_,i)=>i+1).join(' × ')+' = '+f+'. At least '+f+' leaves are needed. The smallest depth d with 2^d ≥ '+f+' is '+bound+'. This is a necessary lower bound, not proof that an algorithm attains it.';
  if(cfg.mode==='minimum'){
   const variant=G.integer(r,0,5);p.question=variant<3?'For '+n+' distinct elements, '+['calculate N!.','how many possible input orderings must a comparison sorter distinguish?','what is the necessary minimum number of decision-tree leaves?'][variant]:variant===3?'For '+n+' distinct elements, calculate the necessary worst-case comparison lower bound ceil(log₂(N!)).':variant===4?'What decision-tree depth is necessary to distinguish all orderings of '+n+' distinct elements?':'For '+n+' distinct elements, give the necessary leaf count and the resulting comparison lower bound.';
   p.fields=variant===5?[numeric('leaves','Necessary leaves',f),numeric('bound','Comparison lower bound',bound)]:[numeric('value','Your answer',variant<3?f:bound)];p.steps=[base];return p;
  }
  if(cfg.mode==='bounds'){
   const variant=G.integer(r,0,3),budget=Math.max(0,bound+G.integer(r,hard?-1:-3,hard?1:2));p.budget=budget;
   if(variant<2){p.question='A comparison sorter claims at most '+budget+' comparisons for '+n+' distinct keys. Is the claim ruled out by the decision-tree lower bound?'+(variant===1?' Also calculate the maximum leaf capacity of that comparison budget.':'');p.fields=[choice('Ruled out?',budget<bound?'yes':'no'),...(variant===1?[numeric('capacity','Leaf capacity',2**budget)]:[])];p.steps=[base,'A depth-'+budget+' binary tree has at most 2^'+budget+' = '+2**budget+' leaves. The bound '+(budget<bound?'rules out':'does not rule out')+' this claim. Sufficient capacity alone does not establish an algorithm.'];}
   else if(variant===2){p.question='A comparison decision tree has enough leaf capacity for all N! orderings. Does this alone prove that a sorting algorithm exists with that depth?';p.fields=[choice('Proves existence?','no')];p.steps=['The leaf-capacity argument gives a necessary condition. It does not construct a logically valid comparison tree attaining that depth.'];}
   else{p.question='Can an algorithm that uses only comparisons guarantee O(N) worst-case sorting for all input sizes?';p.fields=[choice('Possible?','no')];p.steps=['Comparison sorting requires Ω(N log N) comparisons in the worst case. A claimed O(N) guarantee for all N contradicts that bound.'];}return p;
  }
  if(cfg.mode==='theory'){
   const variant=G.integer(r,0,5),d=G.integer(r,easy?2:5,hard?15:9);
   const q=[['How many outcomes can one comparison have when both keys are distinct?',2,'The first key is either smaller or larger; equality is excluded.'],['A binary decision tree has depth '+d+'. What is its maximum possible leaf count?',2**d,'Each level can double the number of branches, giving at most 2^'+d+' leaves.'],['Why must a comparison sorter distinguish N! input orderings?','permutations','The N distinct elements have N! possible relative orderings; different orderings require distinguishable outcomes.'],['Which asymptotic worst-case comparison lower bound applies to every comparison-based sorting algorithm?','nlogn','Theorem 7.7 derives Ω(N log N) from the N! required leaves.'],['Why is the comparison-only assumption important?','binary','The decision-tree argument models information from binary comparison outcomes; it does not model arbitrary non-comparison operations.'],['For a particular comparison-sorting algorithm, what measures its worst-case comparison count?','depth','The longest reachable comparison path counts the maximum comparisons on any input.']][variant];p.question=q[0];
   const choices=q[1]==='permutations'?[['permutations','Each relative ordering must be distinguishable'],['values','Each numerical key value requires one leaf'],['algorithms','Each sorting algorithm requires a different leaf']]:q[1]==='nlogn'?[['linear','Ω(N) only'],['nlogn','Ω(N log N)'],['quadratic','Ω(N²)']]:q[1]==='binary'?[['binary','Its branches model comparison outcomes'],['memory','It assumes a fixed memory capacity'],['heap','It assumes a heap-based algorithm']]:[['depth','Maximum reachable tree depth'],['leaves','Number of leaves alone'],['nodes','Number of all tree nodes']];p.fields=typeof q[1]==='number'?[numeric('value','Your answer',q[1])]:[choice('Your answer',q[1],choices)];p.steps=[q[2]];return p;
  }
  const size=easy?3:hard?4:r()<.8?3:4,full=B.makeTree(size,r),tree=G.clone(full);p.size=size;p.full=full;p.tree=tree;
  p.variant=easy?['leaves','depth','comparisons','enough','leaf'][G.integer(r,0,4)]:r()<(hard?.65:.45)?'complete':['leaves','depth','enough','leaf'][G.integer(r,0,3)];
  if(p.variant==='complete'||p.variant==='enough'&&r()<.5){const candidates=B.nodes(tree).filter(x=>x.left&&B.nodes(x).filter(y=>!y.left).length>1&&B.nodes(x).filter(y=>!y.left).length<=(hard?7:4));const chosen=candidates[G.integer(r,0,candidates.length-1)];delete chosen.a;delete chosen.b;delete chosen.left;delete chosen.right;}
  p.info=B.interpret(tree,size);p.initial.tree=G.clone(tree);
  if(p.variant==='complete'){
   const labels={};for(const [id,cases]of Object.entries(p.info.cases))if(cases.length===1)labels[id]=cases[0].map(K.letter).join('<');p.initial.labels=labels;
   p.question='Complete the supplied decision tree for distinct elements A–'+K.letter(size-1)+'. Select a leaf to label it or split it using your own comparison. Existing supplied ordering labels may remain. Submit the completed tree once.';p.steps=['Each less-than or greater-than branch must agree with the comparison at its parent. Every reachable final leaf must distinguish exactly one relative ordering. Alternative valid comparison trees are accepted.'];
  }else if(p.variant==='leaf'){
   const leaves=B.nodes(tree).filter(x=>!x.left&&p.info.cases[x.id].length===1);p.target=leaves[G.integer(r,0,leaves.length-1)].id;p.expectedOrder=p.info.cases[p.target][0];p.question='Which increasing ordering reaches highlighted leaf '+p.target+'? Follow the < / > branch outcomes.';p.steps=['The comparisons on the path to '+p.target+' imply '+p.expectedOrder.map(K.letter).join('<')+'.'];
  }else{
   const q={leaves:['How many leaves are in this supplied decision tree?',p.info.leaves],depth:['What is the maximum depth of this tree (root depth 0)?',p.info.depth],comparisons:['What is the worst-case number of comparisons in this particular decision tree?',p.info.depth],enough:['Does this tree distinguish every ordering of its '+size+' distinct elements?',p.info.enough?'yes':'no']}[p.variant];p.question=q[0];p.fields=[p.variant==='enough'?choice('Distinguishes all orderings?',q[1]):numeric('value','Your answer',q[1])];p.steps=['The supplied tree has '+p.info.leaves+' leaves and depth '+p.info.depth+'. It '+(p.info.enough?'does':'does not')+' distinguish every possible ordering. Tree depth counts comparisons on the longest path.'];
  }return p;
 }
 function check(p,s){if(p.kind==='tree'&&p.variant==='complete')return B.gradeTree(s.tree,p.size,s.labels);if(p.kind==='tree'&&p.variant==='leaf'){const a=B.parseOrder(s.answers.value,p.size),ok=a&&a.every((v,i)=>v===p.expectedOrder[i]);return{ok:!!ok,message:ok?'Correct leaf ordering.':'The ordering is missing or contradicts a comparison on that branch path.'};}return CompactQuiz.gradeFields(p,s);}
 return{generate,check};
})();

const LowerBoundsLab=(()=>{
 const K=LabKit,B=LowerBoundCore,E=K.E;
 const adapter={modes:{minimum:'Comparison Bound',tree:'Decision Trees',bounds:'Claim Evaluation',theory:'Theory'},signature:ctx=>ctx.s,generate:LowerBoundQuestions.generate,
  render(ctx){const p=ctx.p,s=ctx.s;if(p.kind!=='tree'){CompactQuiz.renderFields(ctx);return;}
   ctx.ui.body.append(B.draw(p.variant==='complete'?s.tree:p.tree,p.size,p.variant==='complete'?s.labels:{},false,p.variant==='complete'?id=>ctx.edit(x=>x.selected=id):null,p.target,s.selected));
   if(p.variant==='leaf'){ctx.ui.body.append(CompactQuiz.field(ctx,'Increasing ordering (for example A<B<C)'));return;}
   if(p.variant!=='complete'){CompactQuiz.renderFields(ctx);return;}
   const n=B.nodes(s.tree).find(x=>x.id===s.selected&&!x.left);if(!n){ctx.ui.body.append(E('p','Select a leaf to edit its ordering or add a comparison.','cq-help'));return;}
   const tools=E('div',undefined,'cq-tree-tools');tools.append(E('span','Selected leaf: '+n.id));const label=E('label','Ordering: '),entry=K.input(s.labels[n.id]??'',v=>ctx.edit(x=>x.labels[n.id]=v));entry.id='boundsLeafOrdering';entry.setAttribute('aria-label','Ordering at '+n.id);FormEvents.submitOnEnter(entry,()=>ctx.check('final'));label.append(entry);tools.append(label);
   const items=Array.from({length:p.size},(_,i)=>[String(i),K.letter(i)]);tools.append(K.field('Compare',K.select(items,s.a,v=>ctx.edit(x=>x.a=Number(v)))),K.field('with',K.select(items,s.b,v=>ctx.edit(x=>x.b=Number(v)))),K.button('Split Selected Leaf',()=>{if(s.a===s.b){ctx.msg('Choose two distinct elements.','error');return;}if(B.nodes(s.tree).length>=125){ctx.msg('Tree size limit reached; Undo to simplify it.','error');return;}ctx.edit(x=>{const node=B.nodes(x.tree).find(y=>y.id===x.selected&&!y.left);if(!node)return;const next=Math.max(...B.nodes(x.tree).map(y=>Number(y.id.slice(1))))+1;node.a=x.a;node.b=x.b;node.left={id:'t'+next};node.right={id:'t'+(next+1)};delete x.labels[node.id];x.selected=null;});}));ctx.ui.body.append(tools);
  },check:ctx=>LowerBoundQuestions.check(ctx.p,ctx.s),solution(ctx){const p=ctx.p;return[K.list(p.steps),...(p.kind==='tree'?[B.draw(p.variant==='complete'?p.full:p.tree,p.size,{},true)]:[])];}};
 const ctx=CompactQuiz.attach(K.create('bounds','Sorting Lower Bounds','',adapter),'pp. 302–304','For N distinct keys there are N! possible relative orderings. A binary tree of depth d has at most 2^d leaves, so ceil(log₂(N!)) comparisons are necessary in the worst case. This is not a claim that the bound is always achievable. The asymptotic comparison-sorting lower bound is Ω(N log N). Tree branches mean < and >; root depth is 0.');return{ctx,adapter};
})();

const ExternalCore=(()=>{
 const names=['Ta1','Ta2','Tb1','Tb2'],pair=letter=>letter==='a'?[0,1]:[2,3];
 function initial(data,m){const tapes=[[],[],[],[]];for(let i=0;i<data.length;i+=m)tapes[2+Math.floor(i/m)%2].push(data.slice(i,i+m).sort((a,b)=>a-b));return tapes;}
 function merge(a,b){const out=[];let i=0,j=0;while(i<a.length||j<b.length)out.push(j===b.length||i<a.length&&a[i]<=b[j]?a[i++]:b[j++]);return out;}
 function pass(tapes,input){const from=pair(input),output=input==='a'?'b':'a',to=pair(output),result=[[],[],[],[]];for(let i=0;i<Math.max(tapes[from[0]].length,tapes[from[1]].length);i++)result[to[i%2]].push(merge(tapes[from[0]][i]||[],tapes[from[1]][i]||[]));return{tapes:result,input,output};}
 function reference(data,m){const states=[{tapes:initial(data,m),input:'a',output:'b'}];let current=states[0];while(current.tapes.flat().length>1){current=pass(current.tapes,current.output);states.push(current);}return states;}
 function format(runs){return runs.length?runs.map(run=>run.join(', ')).join(' | '):'empty';}
 function parse(value){if(value===null||value===undefined||String(value).trim()==='')return null;const s=String(value).trim();if(/^(empty|none|—|-)$/i.test(s))return[];const runs=s.split('|').map(part=>{const tokens=part.trim().split(/[\s,]+/);return tokens.every(t=>/^-?\d+$/.test(t))?tokens.map(Number):null;});return runs.every(x=>x&&x.length)?runs:null;}
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function stageAnswer(){return{input:null,output:null,tapes:[null,null,null,null]};}
 function gradeStage(stage,expected){if(stage.input!==expected.input||stage.output!==expected.output)return{ok:false,message:'The input/output tape roles do not match this pass.'};for(let i=0;i<4;i++){const parsed=parse(stage.tapes[i]);if(parsed===null||!equal(parsed,expected.tapes[i]))return{ok:false,message:'A tape has missing, misplaced, unsorted, or incorrectly merged runs. Check pairing, leftover runs, and alternating destinations.'};}return{ok:true};}
 function view(tapes,caption){const K=LabKit,E=K.E,root=E('div',undefined,'external-tapes');root.append(E('h3',caption));for(let i=0;i<4;i++){const row=E('div',undefined,'external-tape');row.append(E('strong',names[i]));for(const run of tapes[i])row.append(E('span','['+run.join(', ')+']','external-run'));if(!tapes[i].length)row.append(E('span','empty','muted'));root.append(row);}return root;}
 return{names,pair,initial,merge,pass,reference,format,parse,equal,stageAnswer,gradeStage,view};
})();

const ExternalQuestions=(()=>{
 const G=GraphCore,X=ExternalCore,Q=CompactQuiz;
 function stage(input=null){return{input,output:input?input==='a'?'b':'a':null,entries:[null,null,null,null],tileOut:[[],[],[],[]],targetTape:null,recorded:false,dirty:false};}
 function materialize(s){const tapes=[null,null,null,null];if(s.input){X.pair(s.input).forEach(i=>tapes[i]='empty');X.pair(s.output).forEach(i=>{const runs=s.tileOut?.[i];tapes[i]=runs?.flat().length?X.format(runs.filter(r=>r.length).map(r=>r.map(x=>x.value))):runs&&s.entries[i]===null?'empty':s.entries[i];});}return{input:s.input,output:s.output,tapes};}
 function generate(cfg){
  const r=G.rng('focused-external:'+cfg.mode+cfg.difficulty+cfg.seed),easy=cfg.difficulty==='easy',hard=cfg.difficulty==='hard',m=G.integer(r,2,hard?3:4),count=G.integer(r,...(easy?[2,4]:hard?[7,9]:[5,7])),n=count*m-G.integer(r,0,m-1),data=Array.from({length:n},()=>G.integer(r,0,59)),ref=X.reference(data,m),p={cfg,kind:cfg.mode,n,m,data,ref,title:'Question',contract:'',fields:[],steps:[],initial:{answers:{},stages:[],active:0,nextPair:''}};
  const number=(label,expected,key='value')=>({key,label,expected,type:'number'}),list=(label,expected)=>({key:'value',label,expected,type:'list'}),choice=(label,expected)=>({key:'choice',label,expected,type:'choice',choices:[['yes','Yes'],['no','No']]});
  if(cfg.mode==='runs'){
   p.variant=['count','last','sizes','distribution'][G.integer(r,0,3)];const sizes=Array.from({length:count},(_,i)=>Math.min(m,n-i*m));p.question='A file contains '+n+' records and memory holds '+m+' records. '+({count:'How many initial sorted runs are produced?',last:'How many records are in the final initial run?',sizes:'List the sizes of the initial runs in original file order.',distribution:'Form the sorted runs and distribute them alternately to Tb1 and Tb2, starting at Tb1.'}[p.variant]);
   if(p.variant==='distribution')p.initial.stages=[stage('a')];else p.fields=[p.variant==='sizes'?list('Run sizes',sizes):number('Your answer',p.variant==='count'?count:sizes.at(-1))];p.steps=['Initial run count = ceil('+n+'/'+m+') = '+count+'. Read consecutive chunks of at most '+m+' records. Sizes: '+sizes.join(', ')+'. Alternate sorted chunks onto Tb1, Tb2; retain the final partial chunk.'];return p;
  }
  if(cfg.mode==='passes'){
   const R=G.integer(r,...(easy?[1,4]:hard?[9,17]:[5,9])),counts=[];for(let k=R;k>1;){k=Math.ceil(k/2);counts.push(k);}p.startRuns=R;p.variant=['total','one','counts','length','leftover'][G.integer(r,0,4)];if(R===1&&!['total','counts'].includes(p.variant))p.variant='total';
   if(p.variant==='total'){p.question='Starting with '+R+' sorted runs, how many additional two-way merge passes are required to obtain one run? Exclude initial run formation.';p.fields=[number('Merge passes',counts.length)];}
   if(p.variant==='one'){p.question='A two-way merge pass begins with '+R+' sorted runs. How many runs remain after this pass?';p.fields=[number('Remaining runs',Math.ceil(R/2))];}
   if(p.variant==='counts'){p.question='Starting with '+R+' sorted runs, list the run counts after every merge pass, ending at 1. Exclude the starting count; enter none if no merge pass is needed.';p.fields=[list('Successive run counts',counts)];}
   if(p.variant==='length'){p.k=G.integer(r,1,Math.floor(Math.log2(R)));p.question='There are '+R+' full initial runs of '+m+' records each. What is the maximum full-run length after '+p.k+' two-way merge passes?';p.fields=[number('Records in a full merged run',m*2**p.k)];}
   if(p.variant==='leftover'){p.question='A two-way pass begins with '+R+' sorted runs. Will one unpaired run have to be copied without merging?';p.fields=[choice('Unpaired run?',R%2?'yes':'no')];}
   p.steps=['Run-count progression: '+[R,...counts].join(' → ')+'. Each pass uses ceil(R/2), preserving an odd leftover run. '+counts.length+' merge passes are needed; initial run construction is separate.',...(p.variant==='length'?['Maximum full-run length = '+m+' × 2^'+p.k+' = '+m*2**p.k+'.']:[])];return p;
  }
  if(cfg.mode==='tapes'){
   p.given=ref[G.integer(r,0,ref.length-2)];p.expected=X.pass(p.given.tapes,p.given.output);p.initial.stages=[stage(p.expected.input)];p.question='Perform one complete two-way merge pass. Inputs are '+X.pair(p.expected.input).map(i=>X.names[i]).join(' and ')+'. Enter the output distributions and identify the next pass’s input pair.';
  }else{p.initial.stages=[stage('a')];p.question='Sort '+n+' records using memory M = '+m+'. Form initial runs across Ta1 / Ta2, then complete '+(ref.length-1)+' two-way merge pass'+(ref.length===2?'':'es')+' with alternating output tapes and role reversal between passes. Record each stage before proceeding.';}
  return p;
 }
 function check(p,s){
  if(p.fields.length)return Q.gradeFields(p,s);
  if(p.kind==='runs')return X.gradeStage(materialize(s.stages[0]),p.ref[0]);
  if(p.kind==='tapes'){const r=X.gradeStage(materialize(s.stages[0]),p.expected);if(!r.ok)return r;return{ok:s.nextPair===p.expected.output,message:s.nextPair===p.expected.output?'Correct merge pass and next input pair.':'Recheck the next pass’s input pair.'};}
  if(s.stages.some(x=>!x.recorded&&x.dirty))return{ok:false,message:'Record the current stage before final submission, or Undo its unrecorded edits.'};
  const recorded=s.stages.filter(x=>x.recorded);if(recorded.length!==p.ref.length)return{ok:false,message:'Record initial run formation and every merge pass through one final run. Remove extra stages with Undo.'};
  for(let i=0;i<recorded.length;i++){const r=X.gradeStage(materialize(recorded[i]),p.ref[i]);if(!r.ok)return{ok:false,message:(i===0?'Initial runs':'Pass '+i)+': '+r.message};}return{ok:true,message:'Correct complete external sort and every tape-role transition.'};
 }
 return{stage,materialize,generate,check};
})();

const ExternalLab=(()=>{
 const K=LabKit,X=ExternalCore,Q=ExternalQuestions,E=K.E,pairName=p=>p?X.pair(p).map(i=>X.names[i]).join(' / '):'not selected';
 function sourceRuns(ctx,at){const p=ctx.p,s=ctx.s;if(p.kind==='tapes')return p.given.tapes.map((runs,t)=>runs.map((run,j)=>run.map((value,k)=>({id:'given-'+t+'-'+j+'-'+k,value}))));if(at===0)return[[p.data.map((value,i)=>({id:'file-'+i,value}))],[],[],[]];const prev=s.stages[at-1];return prev.tileOut.map(runs=>runs.map(run=>run.slice()));}
 function tileAudit(ctx,at){const st=ctx.s.stages[at];if(!st?.input||!st.output)return false;const src=sourceRuns(ctx,at),inputIds=src.flatMap(r=>r.flat()).map(x=>x.id),placed=st.tileOut.flat().flat(),outIds=placed.map(x=>x.id);return placed.length===inputIds.length&&new Set(outIds).size===outIds.length&&inputIds.every(id=>outIds.includes(id))&&st.tileOut.every(runs=>runs.every(run=>run.length>0));}
 function tileEditor(ctx,at,fixed){const s=ctx.s,st=s.stages[at],sources=sourceRuns(ctx,at),used=new Set(st.tileOut.flat().flat().map(x=>x.id)),eligible=[];for(const t of at>0&&!st.input?[]:X.pair(st.input||'a'))for(const run of sources[t]||[]){const next=run.find(x=>!used.has(x.id));if(next)eligible.push({t,run,next});}if(at===0&&ctx.p.kind==='complete'){for(const run of sources[0]||[])for(const x of run)if(!used.has(x.id)&&!eligible.some(y=>y.next.id===x.id))eligible.push({t:0,run,next:x});}
  const root=E('div',undefined,'external-tile-work');if(at>0){const pair=K.select([['','Choose input pair'],['a','Ta1 / Ta2'],['b','Tb1 / Tb2']],st.input||'',v=>ctx.edit(x=>{const q=x.stages[at];q.input=v||null;q.output=v?v==='a'?'b':'a':null;q.targetTape=null;q.selectedTile=null;q.dirty=true;}));root.append(K.field('Input tapes',pair));}const roles=E('p','Inputs: '+pairName(st.input)+' · outputs: '+pairName(st.output)+'. Select a next record tile, then choose its output tape. Start a new output run at each run boundary.','cq-help');root.append(roles);
  const input=E('div',undefined,'external-tile-input');for(let t=0;t<4;t++){if(!X.pair(st.input||'a').includes(t)&&!(ctx.p.kind==='complete'&&at===0&&t===0))continue;const lane=E('div',undefined,'external-tile-lane');lane.append(E('strong',ctx.p.kind==='complete'&&at===0?'Original file · Ta1':X.names[t]));for(const run of sources[t]||[]){const row=E('div',undefined,'external-tile-run');for(const tile of run){const done=used.has(tile.id),b=K.button(String(tile.value),()=>ctx.msg(''));b.classList.add('external-record');b.dataset.recordId=tile.id;b.disabled=done||!eligible.some(x=>x.next.id===tile.id);b.setAttribute('aria-label',(done?'Placed':'Select')+' record '+tile.value+' from '+X.names[t]);if(st.selectedTile===tile.id)b.setAttribute('aria-pressed','true');else b.setAttribute('aria-pressed','false');b.onclick=()=>ctx.edit(x=>{const q=x.stages[at];if(used.has(tile.id))return;q.selectedTile=tile.id;q.selectedValue=tile.value;q.selectedFrom=t;q.dirty=true;});row.append(b);}lane.append(row);}input.append(lane);}root.append(input);
  const outputs=E('div',undefined,'external-tile-outputs');for(const t of X.pair(st.output||'b')){const lane=E('section',undefined,'external-tile-lane');lane.append(E('strong',X.names[t]+' · output'));const choose=K.button('Use '+X.names[t],()=>ctx.edit(x=>{x.stages[at].targetTape=t;}));choose.disabled=!st.output;choose.setAttribute('aria-pressed',String(st.targetTape===t));lane.append(choose);for(const run of st.tileOut[t]){const r=E('div',undefined,'external-tile-run');for(const tile of run)r.append(E('span',String(tile.value),'external-record'));lane.append(r);}const add=K.button('Place selected record',()=>ctx.edit(x=>{const q=x.stages[at],tileId=q.selectedTile;if(!tileId||q.targetTape!==t)return;const tile=sources.flatMap(r=>r.flat()).find(v=>v.id===tileId);if(!tile||q.tileOut.flat().flat().some(v=>v.id===tileId))return;if(!q.tileOut[t].length)q.tileOut[t].push([]);const last=q.tileOut[t].at(-1);if(ctx.p.kind==='complete'&&at===0&&last.length>=ctx.p.m)return;last.push(tile);q.selectedTile=null;q.dirty=true;}));add.disabled=!st.output||st.targetTape!==t||!st.selectedTile;lane.append(add);const boundary=K.button('Start new run on '+X.names[t],()=>ctx.edit(x=>{x.stages[at].tileOut[t].push([]);x.stages[at].targetTape=t;x.stages[at].dirty=true;}));boundary.disabled=!st.output||st.tileOut[t].length===0||st.tileOut[t].at(-1).length===0;lane.append(boundary);outputs.append(lane);}root.append(outputs);return root;}
 function editor(ctx,at,fixed=false,onlyOutputs=false){
  if(['tapes','complete'].includes(ctx.p.kind))return tileEditor(ctx,at,fixed);
  const s=ctx.s,stage=s.stages[at],box=E('div',undefined,'cq-tape-editor');
  if(!fixed){const input=K.select([['','Choose input pair'],['a','Ta1 / Ta2'],['b','Tb1 / Tb2']],stage.input??'',v=>ctx.edit(x=>{const st=x.stages[at];st.input=v||null;st.output=v?v==='a'?'b':'a':null;st.dirty=true;}));input.id='externalInputPair';box.append(K.field('Input tapes',input));}
  else box.append(E('p','Inputs: '+pairName(stage.input)+' · outputs: '+pairName(stage.output)+'.','cq-help'));
  box.append(E('p','Separate records with commas and runs with |. Example: 1, 4, 7 | 9, 12. Use empty for an unused output tape.','cq-help'));
  const rows=E('div',undefined,'cq-tapes');for(let t=0;t<4;t++){
   if(onlyOutputs&&!X.pair(stage.output).includes(t))continue;const row=E('div',undefined,'cq-tape-row'),inputTape=stage.input&&X.pair(stage.input).includes(t);row.append(E('strong',X.names[t]));
   if(inputTape)row.append(E('span','Consumed / empty','cq-tape-consumed'));
   else{const input=K.input(stage.entries[t]??'',v=>ctx.edit(x=>{x.stages[at].entries[t]=v;x.stages[at].dirty=true;}));input.id='externalTape'+at+'_'+t;input.dataset.externalTape=at+':'+t;input.setAttribute('aria-label',X.names[t]+' output runs');input.disabled=!stage.input;FormEvents.submitOnEnter(input,()=>ctx.check('final'));row.append(input);}rows.append(row);
  }box.append(rows);return box;
 }
 const adapter={modes:{runs:'Initial Runs',passes:'Merge Passes',tapes:'Four-Tape Pass',complete:'Complete Sort'},signature:ctx=>ctx.s,generate:Q.generate,
  render(ctx){const p=ctx.p,s=ctx.s;if(p.fields.length){CompactQuiz.renderFields(ctx);return;}
   if(p.kind==='tapes')ctx.ui.body.append(E('p','Complete one pass from the displayed input pair; place each merged (or leftover) run on alternating output tapes.','cq-help'));
   else ctx.ui.body.append(E('p','Initial file: Ta1 · memory M = '+p.m+' · '+Math.ceil(p.n/p.m)+' initial runs · '+(p.ref.length-1)+' merge passes.','cq-file'));
   if(p.kind==='runs'){ctx.ui.body.append(editor(ctx,0,true,true));return;}
   if(p.kind==='tapes'){ctx.ui.body.append(editor(ctx,0,true),K.field('Next pass’s inputs',K.select([['','Choose'],['a','Ta1 / Ta2'],['b','Tb1 / Tb2']],s.nextPair,v=>ctx.edit(x=>x.nextPair=v))));return;}
   const tabs=E('div',undefined,'cq-stage-tabs');s.stages.forEach((stage,i)=>{const b=K.button(i===0?'Initial Runs':'Pass '+i,()=>ctx.edit(x=>x.active=i));b.dataset.externalStage=i;b.setAttribute('aria-pressed',String(i===s.active));tabs.append(b);});ctx.ui.body.append(tabs);
   if(s.active>0){const prior=Q.materialize(s.stages[s.active-1]);ctx.ui.body.append(E('p','Previous recorded outputs: '+(prior.output?X.pair(prior.output).map(t=>X.names[t]+': '+(prior.tapes[t]??'unanswered')).join(' · '):'input pair not selected')+'.','cq-file'));}
   ctx.ui.body.append(E('h3',s.active===0?'Initial run formation':'Merge pass '+s.active),editor(ctx,s.active,s.active===0));
   const record=K.button('Record Stage',()=>{if(!tileAudit(ctx,s.active))return ctx.msg('Place every input record exactly once and select the tape roles before recording this pass.');ctx.edit(x=>{x.stages[x.active].recorded=true;x.stages[x.active].dirty=false;x.active++;if(!x.stages[x.active])x.stages.push(Q.stage());});requestAnimationFrame(()=>ctx.ui.body.querySelector('#externalInputPair')?.focus({preventScroll:true}));});record.disabled=!tileAudit(ctx,s.active);record.dataset.recordStage='true';ctx.ui.body.append(record);
  },check(ctx){const r=Q.check(ctx.p,ctx.s);return{...r,message:r.message||'Correct initial sorted-run distribution.'};},
  solution(ctx){const p=ctx.p;if(p.fields.length)return K.list(p.steps);const states=p.kind==='tapes'?[p.expected]:p.kind==='runs'?[p.ref[0]]:p.ref,blocks=[E('p','Original file: ['+p.data.join(', ')+']; memory M = '+p.m+'. Initial runs: '+Math.ceil(p.n/p.m)+'. Additional merge passes: '+(p.ref.length-1)+'. Sort each original chunk before distributing it; pair runs and alternate destinations thereafter.')];
   states.forEach((stage,i)=>{const title=p.kind==='tapes'?'Requested merge pass':i===0?'Initial runs':'Merge pass '+i,details=E('details',undefined,'cq-worked-stage');details.open=states.length===1;details.append(E('summary',title+' · inputs '+pairName(stage.input)+' → outputs '+pairName(stage.output)),X.view(stage.tapes,title));if(i>0||p.kind==='tapes'){const previous=p.kind==='tapes'?p.given.tapes:states[i-1].tapes,from=X.pair(stage.input),steps=[];for(let k=0;k<Math.max(previous[from[0]].length,previous[from[1]].length);k++){const a=previous[from[0]][k],b=previous[from[1]][k],to=X.pair(stage.output)[k%2];steps.push((a&&b?'Merge ['+a.join(', ')+'] with ['+b.join(', ')+']':'Copy leftover ['+(a||b).join(', ')+']')+' onto '+X.names[to]+'.');}details.append(K.list(steps));}else{const chunks=[];for(let start=0,k=0;start<p.data.length;start+=p.m,k++)chunks.push('Read ['+p.data.slice(start,start+p.m).join(', ')+']; sort to ['+p.data.slice(start,start+p.m).sort((a,b)=>a-b).join(', ')+']; write to '+X.names[2+k%2]+'.');details.append(K.list(chunks));}blocks.push(details);});return blocks;
  }};
 const ctx=CompactQuiz.attach(K.create('external','External Sorting','',adapter),'pp. 316–317','The original file starts on Ta1. Form sorted runs of at most M records, alternating them onto Tb1 and Tb2. A two-way pass merges corresponding runs from the current input pair and alternates outputs across the other pair, beginning with its first tape. Copy an unpaired run unchanged. Reverse roles for the next pass. Initial run formation is separate from ceil(log₂ R) additional merge passes. Record Stage saves your entry without checking it.');return{ctx,adapter};
})();

const FundamentalCore=(()=>{
 const G=GraphCore,Q=QuizGraphCore;
 function generate(cfg){const r=G.rng('fundamentals-v1:'+cfg.seed+cfg.mode+cfg.difficulty),directed=r()<.65,base=DijkstraGraph.generate(cfg.difficulty,r,G.integer(r,0,11),directed),g=G.clone(base.g),scenario=G.integer(r,0,3),weighted=['matrix','list'].includes(cfg.mode)&&r()<.5;
  if(scenario===0){const order=Q.shuffle(Array.from({length:g.n},(_,v)=>v),r),half=new Set(order.slice(0,G.integer(r,1,g.n-1)));g.edges=g.edges.filter(e=>half.has(e.u)===half.has(e.v));}
  if(directed&&scenario===1){const order=Q.shuffle(Array.from({length:g.n},(_,v)=>v),r),rank=Array(g.n);order.forEach((v,i)=>rank[v]=i);g.edges=g.edges.map(e=>rank[e.u]<rank[e.v]?e:{...e,u:e.v,v:e.u});}
  if(directed&&scenario===2){for(const e of g.edges.slice())if(!g.edges.some(x=>x.u===e.v&&x.v===e.u))g.edges.push({id:'reverse-'+e.id,u:e.v,v:e.u,w:G.integer(r,0,19)});}
  if(!weighted)g.edges.forEach(e=>e.w=1);const source=base.source,vertex=G.integer(r,0,g.n-1),order=Q.shuffle(Array.from({length:g.n},(_,v)=>v),r);return{g,source,vertex,vertexOrder:order,weighted};
 }
 function cycle(g){if(g.directed)return GraphCore.cycle(g);const adj=Array.from({length:g.n},()=>[]);for(const e of g.edges){adj[e.u].push(e.v);adj[e.v].push(e.u);}const seen=new Set(),stack=[];let found=null;function visit(u,parent){seen.add(u);stack.push(u);for(const v of adj[u]){if(v===parent)continue;if(seen.has(v)){const at=stack.indexOf(v);if(at>=0){found=stack.slice(at);return true;}}else if(visit(v,u))return true;}stack.pop();return false;}for(let u=0;u<g.n&&!found;u++)if(!seen.has(u))visit(u,null);return found;}
 function properties(g,source){const reach=Q.closure(g.directed?g:{...g,edges:GraphCore.arcs(g)});for(let v=0;v<g.n;v++)reach[v][v]=true;const weak=Q.closure({...g,edges:g.edges.flatMap(e=>[e,{...e,u:e.v,v:e.u}])}),strong=reach.every(row=>row.every(Boolean)),connected=weak.every((row,u)=>row.every((yes,v)=>u===v||yes));return{reachable:reach[source].map((yes,v)=>yes?v:null).filter(v=>v!==null),cycle:cycle(g),connectivity:g.directed?strong?'strong':connected?'weak':'disconnected':connected?'connected':'disconnected'};}
 function matrix(g,order,weighted){const arcs=GraphCore.arcs(g);return order.map(u=>order.map(v=>{const matches=arcs.filter(e=>e.u===u&&e.v===v);return matches.length?(weighted?matches[0].w:matches.length):u===v?0:weighted?Infinity:0;}));}
 function parseList(value,n,weighted){if(value===null||String(value).trim()==='')return null;if(/^(none|empty|—|-)$/i.test(String(value).trim()))return[];const tokens=String(value).trim().toUpperCase().split(/[\s,;]+/),out=[];for(const token of tokens){const match=weighted?/^([A-Z]):(-?\d+)$/.exec(token):/^([A-Z])$/.exec(token);if(!match)return null;const v=match[1].charCodeAt(0)-65;if(v>=n||out.some(e=>e.v===v))return null;out.push({v,w:weighted?Number(match[2]):1});}return out;}
 return{generate,cycle,properties,matrix,parseList};
})();

const FundamentalQuestions=(()=>{
 const G=GraphCore,F=FundamentalCore,Q=QuizGraphCore,L=LabKit.letter;
 function vertices(raw,n){const s=String(raw??'').trim();if(!s)return null;if(/^(none|empty)$/i.test(s))return[];const tokens=s.toUpperCase().replace(/(?:->|→|<->)/g,',').split(/[\s,]+/);if(tokens.some(x=>!/^[A-Z]$/.test(x)||x.charCodeAt(0)-65>=n))return null;return tokens.map(x=>x.charCodeAt(0)-65);}
 function pathInfo(g,seq){const arcs=G.arcs(g),valid=Array.isArray(seq)&&seq.length>0&&seq.every(v=>Number.isInteger(v)&&v>=0&&v<g.n)&&seq.every((v,i)=>i===0||arcs.some(e=>e.u===seq[i-1]&&e.v===v));const closed=valid&&seq.length>1&&seq[0]===seq.at(-1),internal=closed?seq.slice(0,-1):seq||[];return{valid,closed,length:valid?seq.length-1:null,simple:valid&&new Set(internal).size===internal.length};}
 function cycleValid(g,seq,requireClosed=false,simple=true){if(!Array.isArray(seq)||!seq.length)return false;const closed=seq.length>1&&seq[0]===seq.at(-1);if(requireClosed&&!closed)return false;const a=closed?seq.slice(0,-1):seq;if(a.length<(g.directed?2:3))return false;if(simple&&new Set(a).size!==a.length)return false;const arcs=G.arcs(g),edges=new Set();for(let i=0;i<a.length;i++){const u=a[i],v=a[(i+1)%a.length];if(!arcs.some(e=>e.u===u&&e.v===v))return false;const key=g.directed?u+':'+v:Math.min(u,v)+':'+Math.max(u,v);if(!g.directed&&edges.has(key))return false;edges.add(key);}return true;}
 function compactGraph(cfg,r){
  const base=F.generate(cfg),want=G.integer(r,...(cfg.mode==='matrix'?cfg.difficulty==='easy'?[4,5]:cfg.difficulty==='hard'?[6,7]:[5,6]:cfg.difficulty==='easy'?[4,5]:cfg.difficulty==='hard'?[7,9]:[5,7])),g=base.g;
  const picked=[G.integer(r,0,g.n-1)];while(picked.length<Math.min(want,g.n)){const frontier=g.edges.flatMap(e=>picked.includes(e.u)&&!picked.includes(e.v)?[e.v]:picked.includes(e.v)&&!picked.includes(e.u)?[e.u]:[]),available=frontier.length?frontier:Array.from({length:g.n},(_,v)=>v).filter(v=>!picked.includes(v));picked.push(available[G.integer(r,0,available.length-1)]);}
  const remap=new Map(picked.map((v,i)=>[v,i])),seen=new Map();for(const e of g.edges){if(!remap.has(e.u)||!remap.has(e.v))continue;const u=remap.get(e.u),v=remap.get(e.v);if(u===v)continue;const key=g.directed?u+':'+v:Math.min(u,v)+':'+Math.max(u,v);if(!seen.has(key)||e.w<seen.get(key).w)seen.set(key,{u,v,w:e.w});}
  const small=G.graph(picked.length,[...seen.values()],g.directed);if(base.weighted&&small.edges.length&&r()<.25)small.edges[G.integer(r,0,small.edges.length-1)].w=0;
  return{g:small,weighted:base.weighted,vertexOrder:Q.shuffle(Array.from({length:small.n},(_,i)=>i),r),source:G.integer(r,0,small.n-1),vertex:G.integer(r,0,small.n-1)};
 }
 function walk(g,start,r,max){const a=[start],arcs=G.arcs(g);for(let i=0;i<max;i++){const out=arcs.filter(e=>e.u===a.at(-1));if(!out.length)break;a.push(out[G.integer(r,0,out.length-1)].v);}return a;}
 function generate(cfg){
  const r=G.rng('focused-fundamentals:'+cfg.mode+cfg.difficulty+cfg.seed),multi=cfg.mode==='matrix'&&r()<.28,base=multi?null:compactGraph(cfg,r),g=multi?(()=>{const n=3,edges=[{u:0,v:1},{u:0,v:1},{u:1,v:1},{u:1,v:2}];return G.graph(n,edges,true);})():base.g,chosen=multi?{g,weighted:false,vertexOrder:[0,1,2],source:0,vertex:1}:base,{arcs,ref}=(()=>({arcs:G.arcs(g),ref:F.properties(g,chosen.source)}))(),p={...chosen,cfg,kind:cfg.mode,title:'Question',contract:'',fields:[],steps:[],showGraph:true,multigraph:multi,initial:{answers:{},matrix:Array.from({length:g.n},()=>Array(g.n).fill('')),lists:Array(g.n).fill(''),chosen:[]}};
  const number=(key,label,expected)=>({key,label,expected,type:'number'}),choice=(label,expected,choices=[['yes','Yes'],['no','No']])=>({key:'choice',label,expected,type:'choice',choices});
  if(!multi&&['matrix','list'].includes(cfg.mode)&&r()<.16){
   const variant=G.integer(r,0,4);p.variant='theory';p.showGraph=false;
   const questions=cfg.mode==='matrix'?[['An adjacency matrix represents '+g.n+' vertices. How many matrix entries are stored?',g.n*g.n,'The matrix has |V| rows and |V| columns: '+g.n+'² = '+g.n*g.n+'.'],['What is the space complexity of an adjacency matrix?','square','It stores one entry for every ordered vertex pair.'],['For a dense graph with Θ(|V|²) edges, can Θ(|V|²) matrix storage be asymptotically reasonable?','yes','The graph itself already contains quadratically many edges.'],['If zero is a valid edge weight, can zero also represent an absent edge without ambiguity?','no','A separate sentinel is necessary to distinguish a zero-weight edge from no edge.'],['A loopless complete directed graph has '+g.n+' vertices. How many directed edges does it have?',g.n*(g.n-1),'Each vertex has an edge to each of the other |V|−1 vertices.']]:[['What is adjacency-list space complexity?','list','Store |V| list headers and O(|E|) edge records.'],['An undirected graph has '+g.edges.length+' edges. How many total neighbor entries appear in its adjacency lists?',2*g.edges.length,'Each undirected edge appears in the lists of both endpoints.'],['Which representation generally uses less space for a sparse graph?','adjlist','An adjacency list uses O(|V|+|E|), avoiding a mostly empty |V|² matrix.'],['In a directed graph, does an edge A → B require B in A’s outgoing list?','yes','An outgoing list stores the destinations of that vertex’s edges.'],['A complete undirected graph has '+g.n+' vertices. How many edges does it have?',g.n*(g.n-1)/2,'Each unordered pair contributes one edge, giving |V|(|V|−1)/2.']];
   const q=questions[variant];p.question=q[0];p.steps=[q[2]];p.fields=typeof q[1]==='number'?[number('value','Your answer',q[1])]:[choice('Your answer',q[1],q[1]==='square'?[['square','Θ(|V|²)'],['list','O(|V|+|E|)'],['edges','O(|E|)']]:q[1]==='list'?[['square','Θ(|V|²)'],['list','O(|V|+|E|)'],['vertices','O(|V|) only']]:q[1]==='adjlist'?[['adjlist','Adjacency list'],['matrix','Adjacency matrix']]:[['yes','Yes'],['no','No']])];return p;
  }
  const direction=g.directed?'Directed: follow arrow directions. ':'Undirected: each edge joins both endpoints. ';
  if(cfg.mode==='matrix'){p.question=multi?'Unweighted directed multigraph. Construct the adjacency matrix in vertex order [A, B, C]. Each cell is the count of directed edges from its row vertex to its column vertex; loops count on the diagonal and parallel edges add multiplicity.':'Construct the adjacency matrix in vertex order ['+p.vertexOrder.map(L).join(', ')+']. '+direction+(p.weighted?'Enter weights, x for no off-diagonal edge, and 0 on the diagonal. A weight of 0 is a real edge.':'Enter 1 for an edge and 0 otherwise, including the diagonal.');return p;}
  if(cfg.mode==='list'){
   p.vertices=cfg.difficulty==='hard'&&r()<.75||cfg.difficulty!=='easy'&&r()<.25?Array.from({length:g.n},(_,v)=>v):[p.vertex];p.question=(p.vertices.length===1?'Give the outgoing adjacency list of '+L(p.vertex)+'.':'Give each vertex’s outgoing adjacency list.')+' '+direction+(p.weighted?'Use B:4, D:0 notation.':'Use comma-separated vertex labels.')+' Enter none for an empty list.';return p;
  }
  if(cfg.mode==='degree'){
   const incoming=arcs.filter(e=>e.v===p.vertex).length,outgoing=arcs.filter(e=>e.u===p.vertex).length;
   const options=g.directed?[[number('value','Indegree',incoming)],[number('value','Outdegree',outgoing)],[number('in','Indegree',incoming),number('out','Outdegree',outgoing)],[number('value','Sum of all indegrees',g.edges.length)],[number('value','Sum of all outdegrees',g.edges.length)],[number('in','Sum of indegrees',g.edges.length),number('out','Sum of outdegrees',g.edges.length)]]:[[number('value','Degree',outgoing)],[number('value','Sum of all degrees',2*g.edges.length)],[number('degree','Degree of '+L(p.vertex),outgoing),number('sum','Sum of all degrees',2*g.edges.length)]];
   p.fields=options[G.integer(r,0,options.length-1)];p.question=direction+'Compute '+p.fields.map(x=>x.label.toLowerCase()+(x.label==='Indegree'||x.label==='Outdegree'||x.label==='Degree'?' of '+L(p.vertex):'')).join(' and ')+'. Count edges, not weights.';p.steps=['At '+L(p.vertex)+': indegree '+incoming+', outdegree / undirected degree '+outgoing+'. '+(g.directed?'Each edge adds one to the total indegree and one to total outdegree: both sums are '+g.edges.length+'.':'Each edge contributes two degrees: total = 2 × '+g.edges.length+' = '+2*g.edges.length+'.')];return p;
  }
  if(cfg.mode==='connectivity'){
   p.question=direction+'Classify this graph’s connectivity.';p.fields=[choice('Connectivity',ref.connectivity,g.directed?[['strong','Strongly connected'],['weak','Weakly connected, not strongly'],['disconnected','Not weakly connected']]:[['connected','Connected'],['disconnected','Disconnected']])];p.steps=[g.directed?ref.connectivity==='strong'?'Every vertex can reach every other vertex following arrows.':ref.connectivity==='weak'?'Ignoring directions connects every vertex, but some directed vertex pairs have no path.':'Even after ignoring directions, the graph has disconnected components.':ref.connectivity==='connected'?'Every vertex pair is joined by an undirected path.':'Some vertex pairs lie in different components.'];return p;
  }
  if(cfg.mode==='paths'){
   p.variant=['reachable','exists','valid','length','simple','construct'][G.integer(r,0,5)];p.target=G.integer(r,0,g.n-1);p.sequence=walk(g,p.source,r,G.integer(r,1,cfg.difficulty==='hard'?6:3));
   if(p.variant==='reachable'){p.question=direction+'Select all vertices reachable from '+L(p.source)+', or enter their labels. Include the source (a zero-edge path).';p.expected=ref.reachable;}
   if(p.variant==='exists'){p.question=direction+'Is there a path from '+L(p.source)+' to '+L(p.target)+'?';p.fields=[choice('Path exists?',ref.reachable.includes(p.target)?'yes':'no')];}
   if(p.variant==='valid'){if(r()<.5)p.sequence[G.integer(r,0,p.sequence.length-1)]=G.integer(r,0,g.n-1);p.question=direction+'Is '+p.sequence.map(L).join(' → ')+' a valid path?';p.fields=[choice('Valid path?',pathInfo(g,p.sequence).valid?'yes':'no')];}
   if(p.variant==='length'){p.question=direction+'What is the length in edges of path '+p.sequence.map(L).join(' → ')+'?';p.fields=[number('value','Path length',p.sequence.length-1)];}
   if(p.variant==='simple'){if(p.sequence.length>1&&p.sequence[0]===p.sequence.at(-1))p.sequence.pop();p.question=direction+'Is path '+p.sequence.map(L).join(' → ')+' simple (no repeated vertices)?';p.fields=[choice('Simple path?',pathInfo(g,p.sequence).simple?'yes':'no')];}
   if(p.variant==='construct'){if(p.sequence.length===1&&g.edges.length){const e=g.edges[G.integer(r,0,g.edges.length-1)];p.sequence=[e.u,e.v];}p.source=p.sequence[0];p.target=p.sequence.at(-1);p.question=direction+'Give any valid path from '+L(p.source)+' to '+L(p.target)+'. Select vertices in order, or enter comma/arrow-separated labels.';}
   p.steps=['Reachable from '+L(p.source)+': '+F.properties(g,p.source).reachable.map(L).join(', ')+'.',...(p.sequence.length?['One displayed / constructed sequence is '+p.sequence.map(L).join(' → ')+', with '+(p.sequence.length-1)+' edges. Each consecutive pair must follow an actual edge. Repeated internal vertices prevent simplicity.']:[])];return p;
  }
  p.variant=['graph','identify','sequence','simple',...(g.directed?['dag']:[])][G.integer(r,0,g.directed?4:3)];p.cycle=ref.cycle;
  if(p.variant==='identify'){p.question=direction+'Identify any one simple cycle by selecting vertices in order or entering their labels. You may repeat the starting vertex to close it. Enter none if no cycle exists.';}
  else if(p.variant==='graph'||p.variant==='dag'){p.question=direction+(p.variant==='dag'?'Is this graph a DAG?':'Does this graph contain a cycle?');p.fields=[choice(p.variant==='dag'?'DAG?':'Contains a cycle?',(p.variant==='dag'?!ref.cycle:!!ref.cycle)?'yes':'no')];}
  else{
   p.sequence=ref.cycle?[...ref.cycle,ref.cycle[0]]:[...walk(g,p.source,r,3),p.source];if(r()<.5){if(p.variant==='simple'&&ref.cycle)p.sequence=[...ref.cycle,...ref.cycle,ref.cycle[0]];else p.sequence[G.integer(r,0,p.sequence.length-1)]=G.integer(r,0,g.n-1);}
   p.question=direction+'Does '+p.sequence.map(L).join(' → ')+' form '+(p.variant==='simple'?'a simple cycle':'a cycle')+'? The sequence must explicitly close.';p.fields=[choice('Valid '+(p.variant==='simple'?'simple ':'')+'cycle?',cycleValid(g,p.sequence,true,p.variant==='simple')?'yes':'no')];
  }
  p.steps=[ref.cycle?'One simple cycle is '+[...ref.cycle,ref.cycle[0]].map(L).join(' → ')+'.':'No cycle exists.',g.directed?'Opposite directed edges are distinct, so a two-vertex directed cycle is possible.':'An undirected edge cannot be reused to close a cycle; A–B–A is not a cycle.',...(p.sequence?['Check each consecutive edge, the closing endpoint, and any repeated internal vertices in '+p.sequence.map(L).join(' → ')+'.']:[])];return p;
 }
 function check(p,s){
  if(p.fields.length)return CompactQuiz.gradeFields(p,s);
  if(p.kind==='matrix'){
   const expected=F.matrix(p.g,p.vertexOrder,p.weighted);for(let u=0;u<p.g.n;u++)for(let v=0;v<p.g.n;v++){const raw=String(s.matrix[u]?.[v]??'').trim(),actual=p.weighted&&/^(x|inf|infinity|∞)$/i.test(raw)?Infinity:CompactQuiz.number(raw);if(actual===null||actual!==expected[u][v])return{ok:false,message:'Recheck matrix entries, vertex order, direction, and the absent-edge convention.'};}return{ok:true,message:'Correct complete adjacency matrix.'};
  }
  if(p.kind==='list'){const arcs=G.arcs(p.g);for(const v of p.vertices){const a=F.parseList(s.lists[v],p.g.n,p.weighted),wanted=arcs.filter(e=>e.u===v);if(!a||a.length!==wanted.length||a.some(e=>!wanted.some(w=>w.v===e.v&&w.w===e.w)))return{ok:false,message:'An adjacency list is missing a neighbor, contains an extra entry, or has a wrong weight.'};}return{ok:true,message:'Correct adjacency lists; neighbor order is unrestricted.'};}
  const seq=vertices(s.answers.value,p.g.n);if(!seq)return{ok:false,message:'Enter vertex labels or select vertices on the graph. A blank answer is unanswered.'};
  if(p.kind==='paths'){
   const ok=p.variant==='reachable'?new Set(seq).size===seq.length&&seq.length===p.expected.length&&seq.every(v=>p.expected.includes(v)):pathInfo(p.g,seq).valid&&seq[0]===p.source&&seq.at(-1)===p.target;return{ok,message:ok?'Correct. Alternative valid answers are accepted.':'Recheck the reachable set or the path’s endpoints and directed edges.'};
  }
  const ok=p.cycle?cycleValid(p.g,seq):seq.length===0;return{ok,message:ok?'Correct cycle answer. Alternative starting vertices and valid cycles are accepted.':'The submitted cycle must close on actual edges without repeating internal vertices or reusing an undirected edge.'};
 }
 return{vertices,pathInfo,cycleValid,compactGraph,generate,check};
})();

/* Readable graph drawing scoped to Graph Fundamentals; shared graph views are unchanged. */
const FundamentalDrawing=(()=>{
 let serial=0;
 function view(ctx,opts={}){
  const p=ctx.p,g=p.g,s=ctx.s,E=LabKit.E,L=LabKit.letter,selecting=!!opts.vertexClick||p.kind==='paths'&&['reachable','construct'].includes(p.variant)||p.kind==='cycles'&&p.variant==='identify',compact=ctx.key!=='fundamentals',width=Math.min(opts.width||ExpandedViews.width(ctx.key+'Section',70),compact?(g.n<=5?360:g.n<=8?440:530):(g.n<=5?430:g.n<=7?550:650)),height=Math.max(compact?(g.n<=5?250:g.n<=8?300:345):(g.n<=5?300:g.n<=7?350:410),width<380?g.n*53:0),positions=Array(g.n),r=GraphCore.rng(p.cfg.seed+':drawing'),order=QuizGraphCore.shuffle(Array.from({length:g.n},(_,i)=>i),r),rotation=r()*Math.PI*2;
  order.forEach((v,i)=>{const a=rotation+i*2*Math.PI/g.n;positions[v]={x:width/2+(width/2-48)*Math.cos(a),y:height/2+(height/2-45)*Math.sin(a)};});
  if(compact&&g.positions?.length===g.n){const xs=g.positions.map(p=>p.x),ys=g.positions.map(p=>p.y),minX=Math.min(...xs),minY=Math.min(...ys),spanX=Math.max(...xs)-minX||1,spanY=Math.max(...ys)-minY||1;g.positions.forEach((p,v)=>positions[v]={x:45+(p.x-minX)*(width-90)/spanX,y:42+(p.y-minY)*(height-84)/spanY});}
  let displayHeight=height;if(width<380){for(let pass=0;pass<24;pass++)for(let i=0;i<g.n;i++)for(let j=0;j<i;j++){const a=positions[i],b=positions[j],dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);if(dx<46&&Math.hypot(dx,dy)<46){const gap=(Math.sqrt(46*46-dx*dx)-dy)/2+.2;if(a.y<b.y||a.y===b.y&&i<j){a.y-=gap;b.y+=gap;}else{a.y+=gap;b.y-=gap;}}}const shift=Math.max(0,44-Math.min(...positions.map(p=>p.y)));positions.forEach(p=>p.y+=shift);displayHeight=Math.max(height,Math.max(...positions.map(p=>p.y))+44);}
  const ns='http://www.w3.org/2000/svg',S=ExpandedViews.svg,svg=S('svg',{width,height:displayHeight,viewBox:'0 0 '+width+' '+displayHeight,role:'group','aria-label':(g.directed?'Directed':'Undirected')+(p.weighted?' weighted':' unweighted')+' graph'}),uid='fund-arrows-'+(++serial),defs=S('defs');defs.append(ExpandedViews.arrowMarker(uid,7));svg.append(defs);const labels=[],nodes=new Map(),inspections=[];
  for(const e of g.edges){
   const a=positions[e.u],b=positions[e.v],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),ux=len?dx/len:0,uy=len?dy/len:0,peers=g.edges.filter(x=>Math.min(x.u,x.v)===Math.min(e.u,e.v)&&Math.max(x.u,x.v)===Math.max(e.u,e.v)),rank=peers.findIndex(x=>x.id===e.id),offset=(rank-(peers.length-1)/2)*48*(e.u<e.v?1:-1),cx=(a.x+b.x)/2-uy*offset,cy=(a.y+b.y)/2+ux*offset,sx=e.u===e.v?a.x-12:a.x+ux*21,sy=e.u===e.v?a.y-18:a.y+uy*21,tx=e.u===e.v?a.x+12:b.x-ux*(g.directed?26:21),ty=e.u===e.v?a.y-18:b.y-uy*(g.directed?26:21),path=S('path',{d:e.u===e.v?'M '+sx+' '+sy+' C '+(a.x-34-rank*8)+' '+(a.y-66-rank*8)+', '+(a.x+34+rank*8)+' '+(a.y-66-rank*8)+', '+tx+' '+ty:'M '+sx+' '+sy+' Q '+cx+' '+cy+' '+tx+' '+ty,fill:'none',stroke:'#45564C','stroke-width':1.6});
   const inspected={id:e.id,path};path.dataset.graphEdge=e.id;if(opts.edgeTitle)path.append(S('title',undefined,String(opts.edgeTitle(e))));if(opts.selectedEdges?.includes(e.id)){path.setAttribute('stroke','#10A37F');path.setAttribute('stroke-width',3.5);}if(opts.edgeClick){path.id=ctx.key+'Edge'+e.id;path.setAttribute('tabindex','0');path.setAttribute('role','button');path.setAttribute('aria-label',opts.edgeTitle?String(opts.edgeTitle(e)):'Edge '+L(e.u)+' \u2192 '+L(e.v)+' '+e.id);path.style.cursor='pointer';path.onclick=()=>opts.edgeClick(e.id);path.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();opts.edgeClick(e.id);}};}else{path.setAttribute('tabindex','0');path.setAttribute('aria-label',opts.edgeTitle?String(opts.edgeTitle(e)):'Inspect edge '+L(e.u)+' to '+L(e.v));}if(g.directed)path.setAttribute('marker-end','url(#'+uid+')');svg.append(path);const hit=S('path',{d:path.getAttribute('d'),fill:'none',stroke:'transparent','stroke-width':14,'data-graph-hit':e.id});hit.style.cursor='pointer';if(opts.edgeClick)hit.onclick=()=>opts.edgeClick(e.id);svg.append(hit);inspected.hit=hit;
   const edgeText=opts.edgeLabel?String(opts.edgeLabel(e)):p.weighted?String(e.w):'';if(edgeText!==''){const anchor={x:(sx+2*cx+tx)/4,y:(sy+2*cy+ty)/4},w=edgeText.length*7+12;let label=null;
    for(let radius=0;radius<=100&&!label;radius+=12)for(let angle=0;angle<8&&!label;angle++){const x=anchor.x+radius*Math.cos(angle*Math.PI/4),y=anchor.y+radius*Math.sin(angle*Math.PI/4);if(x<w/2+5||x>width-w/2-5||y<16||y>displayHeight-16)continue;if(positions.some(q=>Math.abs(q.x-x)<w/2+23&&Math.abs(q.y-y)<32))continue;if(labels.some(q=>Math.abs(q.x-x)<(q.w+w)/2+5&&Math.abs(q.y-y)<24))continue;label={x,y,w};}
    if(!label){let nearest=Infinity;for(let y=18;y<displayHeight-16;y+=18)for(let x=w/2+6;x<width-w/2-5;x+=16){if(positions.some(q=>Math.abs(q.x-x)<w/2+23&&Math.abs(q.y-y)<32)||labels.some(q=>Math.abs(q.x-x)<(q.w+w)/2+5&&Math.abs(q.y-y)<24))continue;const distance=Math.hypot(x-anchor.x,y-anchor.y);if(distance<nearest){nearest=distance;label={x,y,w};}}}if(!label){label={x:width/2,y:displayHeight+18,w};displayHeight+=40;}labels.push(label);if(Math.hypot(label.x-anchor.x,label.y-anchor.y)>8)svg.append(S('line',{x1:anchor.x,y1:anchor.y,x2:label.x,y2:label.y,stroke:'#293A34','stroke-width':1}));const box=S('rect',{x:label.x-w/2,y:label.y-10,width:w,height:20,rx:4,fill:'white',stroke:'#293A34','data-label-edge':e.id}),text=S('text',{x:label.x,y:label.y+4,'text-anchor':'middle','font-size':12,fill:'#A8B7AC','data-label-edge':e.id},edgeText);if(opts.edgeClick)for(const node of [box,text]){node.style.cursor='pointer';node.onclick=()=>opts.edgeClick(e.id);}svg.append(box,text);inspected.rect=box;inspected.text=text;
   }
   inspections.push(inspected);
  }
  for(let v=0;v<g.n;v++){
   const q=positions[v],group=S('g',{'data-fundamental-vertex':v,class:'fg-vertex',id:ctx.key==='fundamentals'?'fundVertex'+v:(opts.idPrefix||ctx.key)+'Vertex'+v}),target=v===opts.source||p.kind==='degree'&&v===p.vertex||p.kind==='list'&&p.vertices.length===1&&v===p.vertex||p.kind==='paths'&&v===p.source;
   group.append(S('circle',{cx:q.x,cy:q.y,r:19,fill:'white',stroke:target?'#45564C':'#45564C','stroke-width':target?3:1.6}),S('text',{x:q.x,y:q.y+5,'text-anchor':'middle','font-size':14,'font-weight':650,fill:'#A8B7AC','pointer-events':'none'},opts.vertexLabel?opts.vertexLabel(v):L(v)));
   if(selecting){group.setAttribute('role','button');group.setAttribute('tabindex','0');group.setAttribute('aria-label','Select vertex '+L(v));const choose=opts.vertexClick?()=>opts.vertexClick(v):()=>ctx.edit(x=>{if(p.kind==='paths'&&p.variant==='reachable')x.chosen=x.chosen.includes(v)?x.chosen.filter(a=>a!==v):[...x.chosen,v];else x.chosen.push(v);x.answers.value=x.chosen.map(L).join(', ');});group.onclick=choose;group.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}};}else group.setAttribute('aria-label','Vertex '+L(v));nodes.set(v,group);svg.append(group);
  }
  function refresh(){for(const [v,node]of nodes){const yes=(opts.selection?opts.selection():opts.selectedVertices||s.chosen||[]).includes(v);const known=opts.known?.includes(v);if(ctx.key!=='fundamentals'){node.querySelector('circle').setAttribute('stroke',known?'#A8B7AC':v===opts.source?'#665A3D':'#45564C');node.querySelector('circle').setAttribute('stroke-width',known||v===opts.source?3:1.6);}node.classList.toggle('selected',yes);node.querySelector('circle').setAttribute('fill',yes?'#293A34':'white');if(selecting)node.setAttribute('aria-pressed',String(yes));}}
  ctx.refreshGraph=refresh;refresh();svg.setAttribute('height',displayHeight);svg.setAttribute('viewBox','0 0 '+width+' '+displayHeight);GraphEdgeInspection.install(svg,inspections);const wrap=E('div',undefined,'fg-diagram');wrap.tabIndex=0;wrap.setAttribute('aria-label','Scrollable graph diagram');wrap.append(svg);return wrap;
 }
 return{view};
})();

const FundamentalsLab=(()=>{
 const K=LabKit,G=GraphCore,F=FundamentalCore,Q=FundamentalQuestions,E=K.E,L=K.letter;
 const adapter={modes:{matrix:'Adjacency Matrix',list:'Adjacency List',degree:'Degrees',paths:'Paths & Reachability',cycles:'Cycles',connectivity:'Connectivity'},signature:ctx=>ctx.s,generate:Q.generate,
  render(ctx){const p=ctx.p,s=ctx.s;if(!p.showGraph){CompactQuiz.renderFields(ctx);return;}
   const grid=E('div',undefined,'fg-layout'),answers=E('div',undefined,'fg-answers');grid.append(FundamentalDrawing.view(ctx),answers);ctx.ui.body.append(grid);
   if(p.kind==='matrix'){
    const table=E('table',undefined,'fg-matrix'),head=E('tr');head.append(E('th','From / To'));p.vertexOrder.forEach(v=>head.append(E('th',L(v))));table.append(head);
    p.vertexOrder.forEach((v,row)=>{const tr=E('tr');tr.append(E('th',L(v)));p.vertexOrder.forEach((w,col)=>{const td=E('td'),input=K.input(s.matrix[row][col],value=>ctx.edit(x=>x.matrix[row][col]=value));input.dataset.fundamentalMatrix=row+':'+col;input.id='fundMatrix'+row+'_'+col;input.setAttribute('aria-label',L(v)+' to '+L(w));input.autocomplete='off';input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ctx.check('final');return;}let r=row,c=col;if(e.key==='ArrowUp')r--;else if(e.key==='ArrowDown')r++;else if(e.key==='ArrowLeft'&&input.selectionStart===0)c--;else if(e.key==='ArrowRight'&&input.selectionStart===input.value.length)c++;else return;const target=document.getElementById('fundMatrix'+r+'_'+c);if(target){e.preventDefault();target.focus({preventScroll:true});}};td.append(input);tr.append(td);});table.append(tr);});const wrap=E('div',undefined,'fg-matrix-scroll');wrap.append(table);answers.append(wrap);return;
   }
   if(p.kind==='list'){
    const rows=E('div',undefined,'fg-lists');for(const v of p.vertices){const label=E('label',L(v)+' → '),input=K.input(s.lists[v],value=>ctx.edit(x=>x.lists[v]=value));input.dataset.fundamentalList=v;input.id='fundList'+v;input.setAttribute('aria-label','Outgoing neighbors of '+L(v));input.autocomplete='off';FormEvents.submitOnEnter(input,()=>ctx.check('final'));label.append(input);rows.append(label);}answers.append(rows);return;
   }
   if(p.fields.length){const original=ctx.ui.body;ctx.ui.body=answers;CompactQuiz.renderFields(ctx);ctx.ui.body=original;return;}
   const label=E('label',p.kind==='paths'&&p.variant==='reachable'?'Reachable vertices: ':'Vertex sequence: ','cq-field'),input=K.input(s.answers.value??'',v=>ctx.edit(x=>{x.answers.value=v;x.chosen=Q.vertices(v,p.g.n)||[];}));input.id='fundamentalsAnswerValue';input.setAttribute('aria-label',label.textContent);input.autocomplete='off';FormEvents.submitOnEnter(input,()=>ctx.check('final'));label.append(input);answers.append(label);
   if(s.chosen.length)answers.append(K.button(p.kind==='paths'&&p.variant==='reachable'?'Clear Selection':'Remove Last Vertex',()=>ctx.edit(x=>{if(p.kind==='paths'&&p.variant==='reachable')x.chosen=[];else x.chosen.pop();x.answers.value=x.chosen.map(L).join(', ');})));answers.append(E('p',p.kind==='paths'&&p.variant==='reachable'?'Select / deselect vertices, or type labels in any order.':'Click vertices in sequence, or type labels separated by commas or arrows.','cq-help'));
  },check:ctx=>Q.check(ctx.p,ctx.s),solution(ctx){const p=ctx.p;if(p.fields.length||!p.showGraph)return K.list(p.steps);const arcs=G.arcs(p.g);
   if(p.kind==='matrix')return[K.table(['From / To',...p.vertexOrder.map(L)],F.matrix(p.g,p.vertexOrder,p.weighted).map((row,i)=>[L(p.vertexOrder[i]),...row.map(x=>x===Infinity?'x':x)])),E('p',p.weighted?'Each existing edge contributes its weight; x marks absence and cannot be confused with a zero-weight edge. Diagonal entries are 0.':'Each existing edge contributes 1 at its ordered row/column pair. All other entries, including diagonal entries, are 0.')];
   if(p.kind==='list')return[K.table(['Vertex','Outgoing adjacency list'],p.vertices.map(v=>[L(v),arcs.filter(e=>e.u===v).map(e=>L(e.v)+(p.weighted?':'+e.w:'')).join(', ')||'none'])),E('p',p.g.directed?'Only outgoing arrows belong in each list.':'Each undirected edge contributes a neighbor entry at both endpoints.')];
   return K.list(p.steps);
  }};
 const ctx=CompactQuiz.attach(K.create('fundamentals','Graph Fundamentals','',adapter),'pp. 359–362','An edge (u,v) in a directed graph permits movement from u to v. A path’s length is its number of edges; each vertex reaches itself by a zero-edge path. Simple paths have no repeated vertices except a possible common first/last endpoint. A cycle closes on its starting vertex; undirected cycles cannot reuse an edge, so A–B–A is not a cycle. A DAG is directed and acyclic. Strong connectivity respects arrows; weak connectivity ignores directions. Matrices use Θ(|V|²) space; adjacency lists use O(|V|+|E|). Use x for absent weighted matrix edges, distinct from real zero-weight edges.');return{ctx,adapter};
})();

// End additional Quiz 2 labs.

const BinomialCore = (() => {
  const copy=x=>JSON.parse(JSON.stringify(x));
  const order=t=>t.children.length;
  const label=k=>'B'+String(k).split('').map(c=>'₀₁₂₃₄₅₆₇₈₉'[Number(c)]).join('');
  const singleton=key=>({id:key,key,children:[]});
  const values=t=>[t.key,...t.children.flatMap(values)];
  const equal=(a,b)=>!!a&&!!b&&a.key===b.key&&a.children.length===b.children.length&&a.children.every((c,i)=>equal(c,b.children[i]));
  function canonicalLink(a,b,trace) {
    const k=order(a);if(a.key>b.key)[a,b]=[b,a];
    if(trace)trace.push('Link '+label(k)+' roots '+a.key+' and '+b.key+'. Keep '+a.key+' as parent; carry '+label(k+1)+'.');
    a.children.unshift(b);return a;
  }
  function merge(a,b,trace) {
    const slots=[];
    for(let t of [...a,...b]) {
      let k=order(t);
      while(slots[k]){const other=slots[k];slots[k]=null;t=canonicalLink(other,t,trace);k++;}
      slots[k]=t;
    }
    return slots.filter(Boolean);
  }
  function build(keys,trace) {
    let queue=[];
    keys.forEach((key,i)=>{if(trace)trace.push('Insertion '+(i+1)+': create '+label(0)+' containing '+key+'.');queue=merge(queue,[singleton(key)],trace);});
    return queue;
  }
  function validateTree(tree,seen=new Set()){
    if(seen.has(tree.id))return 'A node appears more than once.';seen.add(tree.id);
    const k=order(tree);
    for(let i=0;i<k;i++){
      const child=tree.children[i],expectedOrder=k-1-i;
      if(order(child)!==expectedOrder)return 'Tree rooted at '+tree.key+' is not a '+label(k)+': its child orders must be '+Array.from({length:k},(_,j)=>label(k-1-j)).join(', ')+'.';
      if(child.key<tree.key)return 'Min-heap order is broken: child '+child.key+' is smaller than parent '+tree.key+'. Undo that link or reverse it with Undo tree link.';
      const error=validateTree(child,seen);if(error)return error;
    }
    if(values(tree).length!==2**k)return 'Tree rooted at '+tree.key+' has the wrong number of nodes for '+label(k)+'.';
    return null;
  }
  const int=(r,a,b)=>a+Math.floor(r()*(b-a+1));
  function keys(n,r){const p=Array.from({length:198},(_,i)=>i+2);for(let i=p.length-1;i>0;i--){const j=int(r,0,i);[p[i],p[j]]=[p[j],p[i]];}return p.slice(0,n);}
  function orders(n){const a=[];for(let k=0;n>0;k++,n=Math.floor(n/2))if(n%2)a.push(k);return a;}
  function carries(a,b){const out=[];let carry=0;for(let k=0;k<=Math.max(0,...a,...b)+1;k++){const count=Number(a.includes(k))+Number(b.includes(k))+carry;carry=count>=2?1:0;if(carry)out.push(k);}return out;}
  function list(raw){
    const s=String(raw??'').trim();if(!s)return{error:'Enter the requested orders, or choose None.'};if(/^none$/i.test(s))return{values:[]};
    if(!/^(?:B?\d+)(?:(?:\s*,\s*|\s+)B?\d+)*$/i.test(s))return{error:'Use comma-separated nonnegative orders, such as 0, 2, 3.'};
    const a=s.split(/[\s,]+/).map(x=>Number(x.replace(/^b/i,'')));if(new Set(a).size!==a.length)return{error:'List each order only once.'};return{values:a};
  }
  function forestIssue(trees,slots,expectedKeys){
    const actual=trees.flatMap(values).sort((a,b)=>a-b),wanted=expectedKeys.slice().sort((a,b)=>a-b);
    if(actual.length!==wanted.length||actual.some((x,i)=>x!==wanted[i]))return'The queue does not contain exactly the required keys.';
    const seen=new Set();for(const t of trees){const error=validateTree(t,seen);if(error)return error;}
    if(trees.some(t=>!slots.includes(t.id)))return'Place every remaining tree in a queue slot.';
    const assigned=new Set();for(let k=0;k<slots.length;k++){const id=slots[k];if(id===null)continue;const t=trees.find(t=>t.id===id);if(!t)return'A slot refers to a missing tree.';if(assigned.has(id))return'A tree occupies more than one slot.';assigned.add(id);if(order(t)!==k)return'The tree rooted at '+t.key+' is assigned to the wrong order.';}return null;
  }
  function properties(difficulty,r){
    const kinds=['nodes','order','children','orders','total','carries','minimum','complexity'],kind=kinds[int(r,0,kinds.length-1)],p={mode:'properties',kind,difficulty,a:[],b:[],steps:[]};
    const max=difficulty==='easy'?3:difficulty==='hard'?8:5;
    if(kind==='nodes'||kind==='order'||kind==='children'){
      p.k=int(r,kind==='children'?0:1,max);p.n=2**p.k;p.expected=kind==='nodes'?p.n:kind==='order'?p.k:Array.from({length:p.k},(_,i)=>p.k-1-i);
      p.question=kind==='nodes'?'How many nodes does B'+p.k+' contain?':kind==='order'?'A binomial tree contains '+p.n+' nodes. What is its order?':'List the orders of the root’s child subtrees in B'+p.k+'.';
      p.steps=['Bₖ contains 2^k nodes. Its root has one child of each order k−1 through 0. Answer: '+(Array.isArray(p.expected)?p.expected.join(', ')||'none':p.expected)+'.'];
    }else if(kind==='orders'||kind==='total'){
      p.n=int(r,1,2**Math.min(max+1,9)-1);p.orders=orders(p.n);p.expected=kind==='orders'?p.orders:p.n;
      p.question=kind==='orders'?'A binomial queue contains '+p.n+' elements. List its occupied tree orders.':'A queue contains '+p.orders.map(label).join(', ')+'. How many elements does it contain?';
      p.steps=[p.n+' in binary is '+p.n.toString(2)+'. The occupied orders are '+p.orders.map(label).join(', ')+'; '+p.orders.map(k=>'2^'+k).join(' + ')+' = '+p.n+'.'];
    }else if(kind==='carries'){
      p.na=int(r,1,difficulty==='easy'?7:difficulty==='hard'?63:15);p.nb=int(r,1,difficulty==='easy'?7:difficulty==='hard'?63:15);p.oa=orders(p.na);p.ob=orders(p.nb);p.expected=carries(p.oa,p.ob);
      p.question='List each source order k where a link generates a carry into B(k+1) when these queues merge. Include incoming carries; enter None if no links are needed.';
      let carry=0;for(let k=0;k<=Math.max(...p.oa,...p.ob)+1;k++){const c=Number(p.oa.includes(k))+Number(p.ob.includes(k))+carry;carry=c>=2?1:0;p.steps.push(label(k)+': '+c+' tree'+(c===1?'':'s')+' → '+(c%2?'retain one':'leave empty')+(carry?', link two and carry '+label(k+1):', no carry')+'.');}
    }else if(kind==='minimum'){
      p.a=build(keys([7,11,15][['easy','medium','hard'].indexOf(difficulty)],r));p.expected=Math.min(...p.a.map(t=>t.key));p.question='Which root contains the minimum? Select that root or enter its value.';p.steps=['Compare only the queue roots: '+p.a.map(t=>t.key).join(', ')+'. The minimum is '+p.expected+'.'];
    }else if(kind==='complexity'){
      const tasks=[['Merge','log','Merge examines O(log N) orders.'],['Insert, worst case','log','A carry can pass through O(log N) occupied orders.'],['Insert, average','constant','The expected number of links is constant.'],['DeleteMin','log','Scanning roots, releasing children, and merging take O(log N).'],['FindMin by scanning roots','log','There are at most O(log N) roots.'],['FindMin with a separately maintained minimum','constant','Read the maintained minimum in constant time.']];
      const q=tasks[int(r,0,tasks.length-1)];p.operation=q[0];p.expected=q[1];p.question='What is the time complexity of '+q[0]+' in a binomial queue of N elements?';p.steps=[q[2]];
    }return p;
  }
  function generate(mode,difficulty,r=Math.random){
    if(mode==='properties')return properties(difficulty,r);
    const level=['easy','medium','hard'].indexOf(difficulty);let a=[],b=[],sequence=[],expected=[],steps=[],minimum=null,sequential=false;
    if(mode==='merge'){
      const pairs=[[[1,1],[2,1],[3,1],[2,4]],[[3,5],[3,6],[5,7],[6,7]],[[7,7],[7,11],[11,13],[15,7],[15,13]]][level],pair=pairs[int(r,0,pairs.length-1)],v=keys(pair[0]+pair[1],r);a=build(v.slice(0,pair[0]));b=build(v.slice(pair[0]));expected=merge(copy(a),copy(b),steps);
    }else if(mode==='insert'){
      sequential=level===2&&r()<.25;
      if(sequential){sequence=keys(int(r,8,11),r);for(const [i,v]of sequence.entries()){steps.push('Insertion '+(i+1)+': introduce singleton '+v+'.');expected=merge(expected,[singleton(v)],steps);}}
      else{const counts=[[2,3,4,5],[5,6,7,9],[7,11,15]][level],n=counts[int(r,0,counts.length-1)],v=keys(n+1,r);a=build(v.slice(0,n));sequence=[v[n]];steps.push('Introduce singleton '+sequence[0]+' into the starting queue.');expected=merge(copy(a),[singleton(sequence[0])],steps);}
    }else{
      const counts=[[3,5,7],[7,11,13],[15,19,23,27]][level],wantB0=level<2&&r()<.23;
      for(let attempt=0;attempt<200;attempt++){
        const n=counts[int(r,0,counts.length-1)],v=keys(n,r);
        if(wantB0){const min=v.indexOf(Math.min(...v));[v[min],v[n-1]]=[v[n-1],v[min]];}
        a=build(v);minimum=a.reduce((x,y)=>x.key<y.key?x:y);steps=['Remove minimum root '+minimum.key+' from '+label(order(minimum))+'. Release its children: '+(minimum.children.map(t=>label(order(t))).join(', ')||'none')+'.'];
        expected=merge(copy(a.filter(t=>t.id!==minimum.id)),copy(minimum.children).reverse(),steps);
        if(wantB0||level===0||level===1&&order(minimum)>0||level===2&&order(minimum)>=2&&steps.filter(s=>s.startsWith('Link ')).length>=2)break;
      }
    }
    const expectedKeys=expected.flatMap(values),trees=copy([...a,...b]),slots=Array(Math.floor(Math.log2(Math.max(1,expectedKeys.length)))+1).fill(null);
    let sequenceIndex=0;if(mode==='insert'&&!sequential){const t=singleton(sequence[0]);t.source='New key';trees.push(t);sequenceIndex=1;}
    // DeleteMin starts with the original forest, whose maximum order may exceed that of N−1.
    while(slots.length<=Math.max(0,...trees.map(order)))slots.push(null);
    return{mode,difficulty,a:copy(a),b:copy(b),sequence,sequential,expected,expectedKeys,steps,minimum:copy(minimum),initial:{trees,slots,sequenceIndex,minRemoved:mode!=='delete',deletedRoot:null,completed:[],answer:{value:'',choice:''}}};
  }
  function gradeProperties(p,a){
    let actual;
    if(p.kind==='complexity'){if(!a.choice)return'Choose an answer before submitting.';return a.choice===p.expected?null:'Recheck the requested operation and whether an average or worst-case bound is asked.';}
    if(Array.isArray(p.expected)){const parsed=list(a.value);if(parsed.error)return parsed.error;actual=parsed.values;return actual.length===p.expected.length&&actual.every(k=>p.expected.includes(k))?null:'The submitted set of orders is incorrect.';}
    if(!/^\d+$/.test(String(a.value??'').trim()))return'Enter a nonnegative integer; a blank field is unanswered.';
    return Number(a.value)===p.expected?null:'Incorrect. Recheck the requested tree or queue property.';
  }
  function treeLayout(tree){
    const cache=new Map(),items=[],edges=[];
    function measure(t){const w=Math.max(42,t.children.reduce((s,c)=>s+measure(c),0)+Math.max(0,t.children.length-1)*6);cache.set(t.id,w);return w;}
    function visit(t,x,depth){const w=cache.get(t.id),item={tree:t,x:x+w/2,y:depth*56+25};items.push(item);const total=t.children.reduce((s,c)=>s+cache.get(c.id),0)+Math.max(0,t.children.length-1)*6;let next=x+(w-total)/2;t.children.forEach(c=>{const child=visit(c,next,depth+1);edges.push({a:item,b:child});next+=cache.get(c.id)+6;});return item;}
    measure(tree);visit(tree,5,0);return{items,edges,width:cache.get(tree.id)+10,height:Math.max(...items.map(i=>i.y))+25};
  }
  return{copy,order,label,singleton,values,equal,canonicalLink,merge,build,validateTree,orders,carries,list,forestIssue,generate,gradeProperties,treeLayout};
})();
const BQ = (() => {
  const C=BinomialCore,{copy,order,label,singleton,values}=C,$=id=>document.getElementById(id);
  const state={mode:'merge',problem:null,trees:[],slots:[],selected:[],sequenceIndex:0,minRemoved:true,deletedRoot:null,completed:[],answer:{},history:[],future:[],solved:false,revealed:false};
  const find=id=>state.trees.find(t=>t.id===id),E=DomKit.element;
  function message(text,type='info'){$('bqFeedback').textContent=text;$('bqFeedback').className='feedback '+type;}
  function snapshot(){return copy({trees:state.trees,slots:state.slots,selected:state.selected,sequenceIndex:state.sequenceIndex,minRemoved:state.minRemoved,deletedRoot:state.deletedRoot,completed:state.completed,answer:state.answer});}
  function restore(s){Object.assign(state,copy(s));state.selected=copy(s.selected||[]);$('bqSolution').hidden=true;renderGiven();renderProperties();render();message('');}
  function save(){HistoryStack.save(state.history,state.future,snapshot());}
  function changed(){$('bqSolution').hidden=true;state.solved=false;render();message('');}
  function clearSlots(ids){state.slots=state.slots.map(id=>ids.includes(id)?null:id);}
  function choose(id){
    if(!find(id))return;
    if(state.mode==='properties'){save();state.answer.value=String(find(id).key);state.selected=[id];$('bqSolution').hidden=true;renderProperties();render();message('');return;}
    state.selected=state.selected.includes(id)?[]:[id];render();message('');
  }
  function ready(){if(state.mode==='delete'&&!state.minRemoved){message('Remove your selected root before merging the released children.','error');return false;}return state.mode!=='properties';}
  function combine(parentId,childId){
    if(!ready())return;const a=find(parentId),b=find(childId);
    if(!a||!b||a===b){message('Select two separate roots.','error');return;}
    if(order(a)!==order(b)){message('Only equal-order trees can be linked.','error');return;}
    if(b.key<a.key){message('The child root cannot be smaller than its parent. Choose a valid attachment target.','error');return;}
    save();clearSlots([a.id,b.id]);state.trees=state.trees.filter(t=>t!==a&&t!==b);a.children.unshift(b);state.trees.push(a);state.selected=[];changed();
  }
  function add(){
    const p=state.problem;if(state.mode!=='insert'||state.sequenceIndex>=p.sequence.length)return;
    if(p.sequential&&C.forestIssue(state.trees,state.slots,p.sequence.slice(0,state.sequenceIndex))){message('Place the completed queue before introducing the next key.','error');return;}
    save();state.completed.push({trees:copy(state.trees),slots:copy(state.slots),count:state.sequenceIndex});
    state.slots=state.slots.map(()=>null);state.trees.forEach(t=>{if(t.source==='New key')t.source='Earlier inserted key';});const t=singleton(p.sequence[state.sequenceIndex++]);t.source='New key';state.trees.push(t);state.selected=[];changed();renderGiven();
  }
  function removeMin(){
    if(state.mode!=='delete'||state.minRemoved)return;const t=state.selected.length===1?find(state.selected[0]):null;if(!t)return;
    save();clearSlots([t.id]);state.trees=state.trees.filter(x=>x!==t);t.children.forEach(c=>{c.source='Released child';state.trees.push(c);});state.deletedRoot=t.id;state.minRemoved=true;state.selected=[];changed();
  }
  function undo(){if(!state.history.length)return;cancelDrag();restore(HistoryStack.undo(state.history,state.future,snapshot));}
  function redo(){if(!state.future.length)return;cancelDrag();restore(HistoryStack.redo(state.history,state.future,snapshot));}
  function reset(){if(!state.problem)return;save();restore(state.problem.initial);}
  function placeAll(){
    if(state.mode==='delete'&&!state.minRemoved){message('Remove the minimum root before placing the forest.','error');return;}
    if(!ready())return;
    if(state.slots.some(id=>id!==null)){message('The destination slots already contain this placed forest.','info');return;}
    const trees=state.trees.slice(),p=state.problem;
    if(!trees.length){message('There are no trees to place yet.','error');return;}
    const seen=new Set();for(const t of trees){const issue=C.validateTree(t,seen);if(issue){message('A tree is not a valid binomial tree or violates min-heap order. Correct the links before placing.','error');return;}}
    const keysNow=trees.flatMap(values).sort((a,b)=>a-b),wanted=state.mode==='insert'&&p.sequential?p.sequence.slice(0,state.sequenceIndex).slice().sort((a,b)=>a-b):p.expectedKeys.slice().sort((a,b)=>a-b);
    if(keysNow.length!==wanted.length||keysNow.some((v,i)=>v!==wanted[i])){message('The unplaced forest is missing or has extra keys. Correct the trees before placing.','error');return;}
    if(new Set(trees.map(order)).size!==trees.length){message('Equal-order trees still need to be linked before placement.','error');return;}
    save();state.slots=state.slots.map(()=>null);for(const t of trees){while(state.slots.length<=order(t))state.slots.push(null);state.slots[order(t)]=t.id;}state.selected=[];changed();message('All completed trees placed by order.');
  }
  function start(p){
    cancelDrag();state.mode=p.mode;state.problem=p;state.history=[];state.future=[];state.solved=false;state.revealed=false;
    if(p.mode==='properties')p.initial={trees:copy(p.a),slots:[],selected:[],sequenceIndex:0,minRemoved:true,deletedRoot:null,completed:[],answer:{value:'',choice:''}};
    document.querySelectorAll('#binomialSection [data-bq-mode]').forEach(b=>{const active=b.dataset.bqMode===p.mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    $('bqDescription').textContent=p.mode==='properties'?p.question:p.mode==='merge'?'Merge the two binomial queues.':p.mode==='delete'?'Perform one DeleteMin operation on the binomial queue.':p.sequential?'Insert the given values into an initially empty binomial queue in order.':'Insert the given value into the binomial queue.';
    restore(p.initial);if(!$('binomialSection').hidden)$('bqValue')?.focus({preventScroll:true});
  }
  function generate(){start(C.generate(state.mode,$('bqDifficulty').value));}
  function changeMode(mode){if(!['merge','insert','delete','properties'].includes(mode))return;state.mode=mode;generate();}
  function treeView(tree,interactive=false,minimumId=null){
    const m=ExpandedViews.tree(C.treeLayout(tree),ExpandedViews.width('binomialSection',70),34),view=E('div',undefined,'bqc-tree-view'),stage=E('div',undefined,'bqc-tree-stage');
    const showPort=interactive&&state.mode!=='properties'&&state.selected.length===1&&state.selected[0]!==tree.id&&!(state.mode==='delete'&&!state.minRemoved);
    if(showPort){const root=m.items.find(item=>item.tree.id===tree.id),extra=42;for(const item of m.items)if(item!==root)item.y+=extra;for(const edge of m.edges){if(edge.a===root){const side=edge.b.x<root.x?1:-1,lane=root.x+side*16;edge.path='M '+root.x+' '+(root.y+15)+' L '+lane+' '+(root.y+23)+' L '+lane+' '+(root.y+52)+' L '+edge.b.x+' '+(edge.b.y-15);}else if(edge.path)edge.path=edge.path.replace(/([ML])\s*([-\d.]+)\s+([-\d.]+)/g,(_,command,x,y)=>command+' '+x+' '+(Number(y)+extra));}m.height+=extra;}
    stage.style.width=m.width+'px';stage.style.height=m.height+'px';
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('width',m.width);svg.setAttribute('height',m.height);svg.setAttribute('aria-hidden','true');
    for(const e of m.edges)ExpandedViews.edge(svg,e,15);stage.append(svg);
    for(const i of m.items){const t=i.tree,isRoot=t.id===tree.id,node=E(interactive&&isRoot?'button':'div',t.key,'bqc-node'+(isRoot&&state.selected.includes(tree.id)?' selected':''));node.style.left=i.x+'px';node.style.top=i.y+'px';node.setAttribute('aria-label',(isRoot&&tree.source==='New key'&&order(tree)===0?'New insertion singleton, ':'')+(isRoot?'Root ':'Node ')+t.key+', '+label(order(t)));
      if(interactive&&isRoot){node.type='button';node.dataset.bqRoot=tree.id;node.setAttribute('aria-pressed',String(state.selected.includes(tree.id)));if(state.mode==='properties')node.onclick=()=>choose(tree.id);else{node.onpointerdown=e=>startDrag(e,tree.id);node.onclick=e=>{if(e.detail===0)choose(tree.id);};}if(showPort){const port=E('button','+','bqc-attach-target');port.type='button';port.dataset.bqAttach=tree.id;port.style.left=i.x+'px';port.style.top=(i.y+37)+'px';port.setAttribute('aria-label','Attach selected child tree to parent root '+t.key);port.title='Attach selected tree to root '+t.key;port.onclick=e=>{e.stopPropagation();combine(tree.id,state.selected[0]);};port.onpointerdown=e=>e.stopPropagation();stage.append(port);}}
      if(minimumId===t.id){node.style.outline='2px solid #665A3D';node.title='Removed minimum';}stage.append(node);
    }view.append(stage);return view;
  }
  function tile(t,interactive=true){const card=E('div',undefined,'bqc-tree-card'+(t.source==='New key'&&order(t)===0?' bqc-new-key':''));card.style.width=Math.min(ExpandedViews.width('binomialSection',70),Math.max(76,C.treeLayout(t).width+50))+'px';card.append(treeView(t,interactive));return card;}
  function miniForest(q,target){target.replaceChildren(...q.slice().sort((a,b)=>order(a)-order(b)).map(t=>tile(t,false)));if(!q.length)target.append(E('p','Empty queue.'));}
  function renderGiven(){
    const p=state.problem,box=$('bqGiven');box.replaceChildren();
    box.hidden=state.mode!=='properties';if(box.hidden)return;
    if(state.mode==='properties'){
      if(p.kind==='carries'){const table=E('table',undefined,'bqc-order-table');for(const [title,items]of [['H1',p.oa],['H2',p.ob]]){const row=E('tr');row.append(E('th',title),E('td',items.map(label).join(', ')||'empty'));table.append(row);}box.append(table);}
return;
    }
  }
  function renderProperties(){
    const box=$('bqPropertyAnswer'),p=state.problem;box.hidden=state.mode!=='properties';box.replaceChildren();if(box.hidden)return;
    function input(label,key){const l=E('label',label+' '),e=E('input');e.id='bqValue';e.className='bqc-input';e.type='text';e.autocomplete='off';e.value=state.answer[key];e.setAttribute('aria-label',label);e.oninput=()=>{save();state.answer[key]=e.value;$('bqSolution').hidden=true;message('');};FormEvents.submitOnEnter(e,check);l.append(e);box.append(l);}
    if(p.kind==='complexity'){const l=E('label','Time: '),s=E('select');s.id='bqComplexity';for(const [v,t]of [['','Choose'],['constant','O(1)'],['log','O(log N)'],['linear','O(N)'],['quadratic','O(N²)']]){const o=E('option',t);o.value=v;s.append(o);}s.value=state.answer.choice;s.onchange=()=>{save();state.answer.choice=s.value;$('bqSolution').hidden=true;message('');};l.append(s);box.append(l);}
    else{input(Array.isArray(p.expected)?'Orders (comma-separated):':'Your answer:','value');if(Array.isArray(p.expected)){const none=E('button','None');none.type='button';none.onclick=()=>{save();state.answer.value='none';renderProperties();message('');};box.append(none);}}
  }
  function render(){
    if(!state.problem)return;const p=state.problem,isProperty=state.mode==='properties';$('bqProcedure').hidden=isProperty;
    $('bqUndo').disabled=!state.history.length;$('bqRedo').disabled=!state.future.length;
    if(isProperty){$('bqSelection').textContent='';$('bqPropertyGraph').replaceChildren();if(p.kind==='minimum'){const forest=E('div',undefined,'bqc-forest');state.trees.forEach(t=>forest.append(tile(t)));$('bqPropertyGraph').append(forest);}return;}
    $('bqPropertyGraph').replaceChildren();
    const board=$('bqBoard'),sx=board.scrollLeft,sy=board.scrollTop,active=document.activeElement?.closest('[data-bq-root]')?.dataset.bqRoot,selected=state.selected.map(find).filter(Boolean);
    const one=selected.length===1?selected[0]:null;$('bqSelection').textContent=one?'Selected child: '+one.key+' ('+label(order(one))+').':'';
    $('bqClearSelection').hidden=!selected.length;
    $('bqAdd').hidden=state.mode!=='insert'||state.sequenceIndex>=p.sequence.length;if(!$('bqAdd').hidden)$('bqAdd').textContent='Introduce next key: '+p.sequence[state.sequenceIndex];
    $('bqDelete').hidden=state.mode!=='delete'||state.minRemoved||!one;
    $('bqPlaceAll').hidden=isProperty;
    $('bqSlots').replaceChildren();state.slots.forEach((id,k)=>{const slot=E('div',undefined,'bqc-slot'),head=E('div',label(k),'bqc-slot-head');head.setAttribute('aria-label',label(k)+' final destination slot');slot.append(head);const t=find(id);if(t){slot.classList.add('expanded-filled');slot.style.flexBasis=Math.min(ExpandedViews.width('binomialSection',70),Math.max(165,C.treeLayout(t).width+70))+'px';}slot.append(t?tile(t,false):E('div','Empty','bqc-empty'));$('bqSlots').append(slot);});
    const loose=state.trees.filter(t=>!state.slots.includes(t.id));$('bqLoose').replaceChildren(...loose.map(t=>tile(t)));if(!loose.length)$('bqLoose').append(E('div','None','bqc-empty'));
    board.scrollLeft=sx;board.scrollTop=sy;if(active)$('binomialSection').querySelector('[data-bq-root="'+active+'"]')?.focus({preventScroll:true});
  }
  function check(){
    const p=state.problem;let issue=null;
    if(state.mode==='properties')issue=C.gradeProperties(p,state.answer);
    else if(state.mode==='delete'&&(!state.minRemoved||state.deletedRoot!==p.minimum.id))issue='The original minimum root has not been removed correctly.';
    else if(state.mode==='insert'&&state.sequenceIndex!==p.sequence.length)issue='Complete every insertion in the supplied sequence.';
    else{
      if(p.sequential)for(let i=0;i<state.completed.length;i++){const s=state.completed[i],error=C.forestIssue(s.trees,s.slots,p.sequence.slice(0,s.count));if(error){issue='Insertion '+s.count+' was not completed correctly before the next key was introduced. Undo to that stage or Reset.';break;}}
      if(!issue)issue=C.forestIssue(state.trees,state.slots,p.expectedKeys);
    }
    state.solved=!issue;message(issue||'Correct. All required values, structural properties, and tree orders are valid.',issue?'error':'success');return!issue;
  }
  function reveal(){state.revealed=true;$('bqSolution').hidden=false;miniForest(state.mode==='properties'?state.problem.a:state.problem.expected,$('bqSolutionForest'));$('bqSteps').replaceChildren(...state.problem.steps.map(s=>E('li',s)),...(state.mode!=='properties'?[E('li','Final orders: '+(state.problem.expected.map(t=>label(order(t))).join(', ')||'none')+'. Other valid carry choices may produce different internal trees.')]:[]));message('Worked solution shown; your workspace is unchanged.');}
  let drag=null,hover=null;
  function cancelDrag(){drag=null;hover?.classList.remove('drop-over');hover=null;$('dragGhost').hidden=true;}
  function startDrag(e,id){if(e.button>0)return;drag={id,x:e.clientX,y:e.clientY,moved:false,wasSelected:state.selected.includes(id)};e.preventDefault();}
  window.addEventListener('pointermove',e=>{if(!drag)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){drag.moved=true;state.selected=[drag.id];render();}if(!drag.moved)return;const t=find(drag.id);if(!t){cancelDrag();return;}const ghost=$('dragGhost');ghost.textContent=label(order(t))+' · '+t.key;ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';ghost.hidden=false;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('#binomialSection [data-bq-attach]');if(target!==hover){hover?.classList.remove('drop-over');hover=target;hover?.classList.add('drop-over');}});
  window.addEventListener('pointerup',e=>{if(!drag)return;const d=drag,target=d.moved?document.elementFromPoint(e.clientX,e.clientY)?.closest('#binomialSection [data-bq-attach]'):null;cancelDrag();if(!d.moved){state.selected=d.wasSelected?[]:[d.id];render();message('');return;}if(target)combine(Number(target.dataset.bqAttach),d.id);});
  window.addEventListener('pointercancel',cancelDrag);window.addEventListener('blur',cancelDrag);
  document.querySelectorAll('#binomialSection [data-bq-mode]').forEach(b=>b.onclick=()=>changeMode(b.dataset.bqMode));
  $('bqDifficulty').onchange=generate;$('bqNew').onclick=generate;$('bqAdd').onclick=add;$('bqDelete').onclick=removeMin;
  $('bqPlaceAll').onclick=placeAll;$('bqClearSelection').onclick=()=>{state.selected=[];render();message('');};
  $('bqUndo').onclick=undo;$('bqRedo').onclick=redo;$('bqReset').onclick=reset;$('bqCheck').onclick=check;$('bqReveal').onclick=reveal;
  document.addEventListener('keydown',e=>{if($('binomialSection').hidden||e.target?.matches?.('input,select,textarea,[contenteditable="true"]'))return;if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();e.key.toLowerCase()==='y'||e.shiftKey?redo():undo();}if(e.key==='Escape'){cancelDrag();state.selected=[];render();}});
  function reflow(){if(!state.problem)return;renderGiven();render();if(!$('bqSolution').hidden)miniForest(state.mode==='properties'?state.problem.a:state.problem.expected,$('bqSolutionForest'));}
  function init(){state.problem?render():generate();}
  return{state,init,reflow,start,generate,changeMode,choose,combine,placeAll,add,removeMin,undo,redo,reset,check,reveal,render,cancelDrag,core:C};
})();
/* Expand presentation containers without modifying practice state or answers. */
const ExpandedWindows=(()=>{
 const selector='.bqc-board,.bqc-tree-view,.ah-tree,.sp-tree,.tree-scroll,.nl-graph,.fg-diagram,.pert-graph,.cq-decision-scroll,.nl-table-wrap,.fg-matrix-scroll,.bh-table-wrap,.dh-table-wrap,.ge-edge-list,.cq-stage-tabs,.im-tree,.sort-division,.sort-array,.sort-run,.sp-array,.external-tapes,.bqc-code,.ah-code';
 let queued=false;
 function scan(){queued=false;for(const root of document.querySelectorAll('main>section:not(#homeSection)')){if(root.hidden)continue;root.querySelectorAll(selector).forEach(e=>{e.classList.add('expanded-window');if(e.getAttribute('aria-label')?.startsWith('Scrollable'))e.setAttribute('aria-label',e.getAttribute('aria-label').replace('Scrollable ','Full '));});
   for(const grid of root.querySelectorAll('.fg-layout,.ge-layout,.ah-editor-layout,.sort-merge-grid,.nl-grid')){grid.classList.remove('expanded-stack');const diagrams=grid.querySelectorAll('.fg-diagram,.pert-graph,.nl-graph,.ah-tree,.sp-tree');if([...diagrams].some(e=>e.scrollWidth>e.clientWidth+2))grid.classList.add('expanded-stack');}
   for(const table of root.querySelectorAll('table')){if(!table.getClientRects().length)continue;table.classList.remove('expanded-records');const parent=table.parentElement;if(table.scrollWidth>parent.clientWidth+1||table.getBoundingClientRect().width>root.clientWidth-28){const rows=[...table.rows],head=table.tHead?.rows[0]||rows.find(r=>[...r.cells].every(c=>c.tagName==='TH'));const headings=head?[...head.cells].map(c=>c.textContent.trim()):[];if(head)head.classList.add('expanded-table-head');for(const row of rows)if(row!==head)[...row.cells].forEach((cell,i)=>{cell.dataset.column=headings[i]||'Column '+(i+1);});table.classList.add('expanded-records');}}
   for(const tree of root.querySelectorAll('.im-tree,.sort-division'))if(tree.scrollWidth>tree.clientWidth+1)tree.classList.add('expanded-outline');
  }}
 function request(){if(!queued){queued=true;requestAnimationFrame(scan);}}
 function boot(){const main=document.querySelector('main');new MutationObserver(request).observe(main,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open']});
  for(const root of main.children){if(root.id==='homeSection'||root.tagName!=='SECTION')continue;let measured=root.clientWidth,wasHidden=!measured;new ResizeObserver(()=>{const w=root.clientWidth;if(!w){wasHidden=true;return;}if(wasHidden){measured=w;wasHidden=false;request();return;}if(Math.abs(w-measured)<1)return;measured=w;const focused=document.activeElement,id=root.contains(focused)?focused.id:null,start=focused?.selectionStart,end=focused?.selectionEnd;requestAnimationFrame(()=>{if(root.hidden)return;if(root.id==='binomialSection')BQ.reflow();else if(root.id==='binarySection')BH.render();else if(root.id==='dheapSection')DH.render();else{const ctx=Object.values(LabKit.contexts).find(c=>document.getElementById(c.key+'Section')===root);ctx?.render();}if(id){const input=document.getElementById(id);input?.focus({preventScroll:true});if(start!==null&&start!==undefined&&input?.setSelectionRange)try{input.setSelectionRange(start,end);}catch{}}request();});}).observe(root);}
  request();}
 return{scan,request,boot};
})();

let activeSection='home';
function showSection(section,updateHash=true,sortMode=null) {
 const sortingAliases={insertion:'insertion',mergeRecursive:'merge',mergeBottom:'merge',heap:'heapsort',heapSnapshots:'heapsort',quick:'quicksort'};
 if(section==='sorting')section=sortingAliases[sortMode]||'insertion';
 const ids={home:'homeSection',chapter:'cs3345ChapterSection',topic:'cs3345TopicSection',interactivePractice:'interactivePracticeSection',javaReference:'javaReferenceSection',mcPractice:'mcPracticeSection',studyGuide:'studyGuideSection',heaps:'heapSection',binomial:'binomialSection',binary:'binarySection',dheaps:'dheapSection',insertion:'insertionSection',merge:'mergeSection',heapsort:'heapsortSection',quicksort:'quicksortSection',prim:'primSection',topo:'topoSection',dijkstra:'dijkstraSection',flow:'flowSection',pert:'pertSection',shortest:'shortestSection',activity:'activitySection',bounds:'boundsSection',external:'externalSection',fundamentals:'fundamentalsSection'};
 if(!ids[section])section='home';
 endDrag();BQ.cancelDrag();BH.cancelDrag();DH.cancel();SortingLab.cancel();activeSection=section;
 $('siteHeader').hidden=false;document.querySelectorAll('main>section').forEach(el=>el.hidden=el.id!==ids[section]);document.title='CS 3345 — Cumulative Practice';
 if(section==='heaps')reflowBoard();if(section==='binomial')BQ.init();if(section==='binary')BH.init();if(section==='dheaps')DH.init();if(section==='pert')PERT.init();
 const lab=LabKit.contexts[section];if(lab){if(!lab.p)lab.start(false);else lab.render();}
 if(sortMode==='mergeBottom'&&section==='merge'&&SortingLab.pages.merge.ui.extra.exercise.value!=='bottom'){SortingLab.pages.merge.ui.extra.exercise.value='bottom';SortingLab.pages.merge.start(true);}
 if(sortMode==='heapSnapshots'&&section==='heapsort'&&SortingLab.pages.heapsort.ui.extra.exercise.value!=='snapshot'){SortingLab.pages.heapsort.ui.extra.exercise.value='snapshot';SortingLab.pages.heapsort.start(true);}
 if(updateHash&&window.location.hash!=='#'+section){try{window.history.pushState(null,'','#'+section);}catch{}}
 requestAnimationFrame(fitTrees);
}

/* Portable ChatGPT interchange: problem JSON contains graph/task data only;
   internal p.ref values are recomputed by the existing algorithm cores. */
const ChatGPTExchange=(()=>{
 const topics=new Set(['fundamentals','topo','dijkstra','shortest','activity','pert','flow','prim']);
 const maxChars=300000;
  const clone=x=>JSON.parse(JSON.stringify(x,(k,v)=>typeof v==='number'&&!Number.isFinite(v)?{$q2Number:Number.isNaN(v)?'NaN':v>0?'Infinity':'-Infinity'}:v),(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===1&&v.$q2Number?({NaN:NaN,Infinity:Infinity,'-Infinity':-Infinity}[v.$q2Number]??v):v);
  const stringify=(x,space)=>JSON.stringify(x,(k,v)=>typeof v==='number'&&!Number.isFinite(v)?{$q2Number:Number.isNaN(v)?'NaN':v>0?'Infinity':'-Infinity'}:v,space);
  const parse=x=>JSON.parse(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===1&&v.$q2Number?({NaN:NaN,Infinity:Infinity,'-Infinity':-Infinity}[v.$q2Number]??v):v);
  function safeStudentValue(v,depth=0){if(depth>20)return false;if(v===null||typeof v==='string'||typeof v==='boolean')return true;if(typeof v==='number')return Number.isFinite(v)||v===Infinity||v===-Infinity;if(Array.isArray(v))return v.length<=500&&v.every(x=>safeStudentValue(x,depth+1));if(typeof v==='object')return Object.keys(v).length<=200&&Object.keys(v).every(k=>k!=='__proto__'&&k!=='constructor'&&k!=='prototype'&&safeStudentValue(v[k],depth+1));return false;}
  function stateShape(shape,value,depth=0,key=''){if(depth>20)return false;if(Array.isArray(shape)){if(!Array.isArray(value)||value.length>500)return false;if(['chosen','stages','log','path','edges','connections','selected','order','side'].includes(key))return value.every(x=>safeStudentValue(x));return shape.length===value.length&&shape.every((x,i)=>stateShape(x,value[i],depth+1,key));}if(shape&&typeof shape==='object'){if(!value||typeof value!=='object'||Array.isArray(value)||!Object.keys(shape).every(k=>Object.hasOwn(value,k)&&stateShape(shape[k],value[k],depth+1,k)))return false;const extra=Object.keys(value).filter(k=>!Object.hasOwn(shape,k));if(!extra.length)return true;if(!['answers','types','durations'].includes(key))return false;return extra.every(k=>/^[\w-]{1,80}$/.test(k)&&safeStudentValue(value[k]));}if(shape===null)return value===null||typeof value==='string'||typeof value==='number'||typeof value==='boolean';return typeof value===typeof shape;}
 const labels={fundamentals:'Graph Fundamentals',topo:'Topological Sort / DAGs',dijkstra:"Dijkstra's Algorithm",shortest:'Shortest-Path Algorithms',activity:'Activity Graphs',pert:'PERT',flow:'Network Flow',prim:"Prim's Algorithm"};
 const setStatus=(node,text,kind='')=>{node.textContent=text;node.className='q2-exchange-status'+(kind?' '+kind:'');};
 function graphOf(p){return p?.g&&Number.isInteger(p.g.n)?p.g:p?.graph&&Number.isInteger(p.graph.n)?p.graph:null;}
  function connected(g){if(!g?.n)return true;const seen=new Set([0]),q=[0];for(let i=0;i<q.length;i++)for(const e of g.edges)if(e.u===q[i]&&!seen.has(e.v)){seen.add(e.v);q.push(e.v);}else if(e.v===q[i]&&!seen.has(e.u)){seen.add(e.u);q.push(e.u);}return seen.size===g.n;}
  function validate(payload){
   if(!payload||payload.version!==1||!topics.has(payload.topic)||typeof payload.mode!=='string'||!['easy','medium','hard'].includes(payload.difficulty))return false;
    const hasAnswerKey=x=>{if(!x||typeof x!=='object')return false;for(const[k,v]of Object.entries(x)){if(/^(answer|answers|expected|reference|ref|solution|answerkey|correct)$/i.test(k)||hasAnswerKey(v))return true;}return false;};if(hasAnswerKey(payload))return false;
    const ctx=LabKit.contexts[payload.topic],graph=payload.graph,task=payload.task;if(!ctx||(!Object.hasOwn(ctx.adapter.modes,payload.mode)&&!(payload.topic==='dijkstra'&&['table','path','iteration','relax','complexity'].includes(payload.mode)))||!graph||typeof graph.directed!=='boolean'||!Array.isArray(graph.vertices)||!Array.isArray(graph.edges)||graph.vertices.length<1||graph.vertices.length>24||graph.edges.length>160||!task||typeof task!=='object'||Array.isArray(task)||typeof task.type!=='string')return false;
   if(graph.vertices.some(v=>typeof v!=='string'||!v||v.length>32)||new Set(graph.vertices).size!==graph.vertices.length)return false;
    if(payload.topic==='dijkstra'&&!graph.directed)return false;
   const multigraphCase=payload.topic==='fundamentals'&&payload.mode==='matrix'&&task.type==='adjacencyMatrix'&&task.multigraph===true&&task.weighted===false&&graph.directed===true;if(task.multigraph!==undefined&&!multigraphCase)return false;
   const ids=new Set(),seen=new Set();for(const e of graph.edges){if(!e||typeof e!=='object'||typeof e.id!=='string'||!e.id||ids.has(e.id)||!graph.vertices.includes(e.from)||!graph.vertices.includes(e.to)||(!multigraphCase&&e.from===e.to)||(multigraphCase&&['weight','duration','capacity'].some(k=>e[k]!==undefined)))return false;ids.add(e.id);const pair=graph.directed?e.from+'>'+e.to:[e.from,e.to].sort().join('<>');if(!multigraphCase&&seen.has(pair))return false;seen.add(pair);for(const k of ['weight','duration','capacity'])if(e[k]!==undefined&&(!Number.isFinite(e[k])||Math.abs(e[k])>1000000))return false;if(e.dummy&&e.duration!==0&&e.weight!==0)return false;if(payload.topic==='flow'&&(e.capacity===undefined||e.capacity<0))return false;if(payload.topic==='dijkstra'&&(e.weight===undefined||e.weight<0))return false;}
   if(task.question!==undefined&&(typeof task.question!=='string'||task.question.length>3000))return false;
   if(!topicModeTypes[payload.topic]?.[payload.mode]||task.type!==topicModeTypes[payload.topic][payload.mode])return false;
   try{buildPortable(payload);}catch{return false;}return true;
  }
  function graphSchema(p){const g=graphOf(p);if(!g)return{directed:false,vertices:['U'],edges:[]};const vertices=g.labels?.length===g.n?g.labels.map(String):Array.from({length:g.n},(_,i)=>String.fromCharCode(65+i));return{directed:!!g.directed,vertices,edges:g.edges.map((e,i)=>({id:String(e.id??'e'+i),from:vertices[e.u],to:vertices[e.v],...(e.w!==undefined?(g.format?{duration:e.w}:p.kind==='bfs'?{}:{weight:e.w}):{}),...(e.cap!==undefined?{capacity:e.cap}:{}),...(e.dummy!==undefined?{dummy:!!e.dummy}:{}),...(e.activity!==undefined?{activity:String(e.activity)}:{}),...(e.label!==undefined?{label:String(e.label)}:{})}))};}
  const topicModeTypes={fundamentals:{matrix:'adjacencyMatrix',list:'adjacencyList',degree:'vertexDegree',paths:'pathQuestion',cycles:'cycleQuestion',connectivity:'connectivity'},topo:{construct:'topologicalOrder',eligible:'eligibleVertices',indegree:'indegreeUpdates',cycles:'cycleDetection',concepts:'dagConcept'},dijkstra:{table:'dijkstraTable',path:'dijkstraPath',iteration:'dijkstraIteration',relax:'dijkstraRelaxation',complexity:'dijkstraComplexity'},shortest:{bfs:'unweightedTable',negative:'negativeEdgePaths',cycle:'negativeCycle',dag:'dagShortestPaths'},activity:{node:'activityGraph',order:'activityOrder',eligible:'eligibleActivities',precedence:'activityPrecedence',event:'eventGraph'},pert:{earliest:'earliestTimes',latest:'latestTimes',slack:'activitySlack',critical:'criticalPath',complete:'completePert'},flow:{maximum:'maximumFlow',augment:'augmentingPath',residual:'residualNetwork',cut:'minimumCut',validity:'flowValidity'},prim:{full:'minimumSpanningTree',trace:'primTrace',next:'primNextEdge',concepts:'primConcept'}};
  function makeProblem(ctx){const p=ctx.p;if(p?.portableProblem)return{...clone(p.portableProblem),difficulty:ctx.ui.diff.value};const g=graphOf(p),topic=ctx.key,mode=ctx.mode,type=topicModeTypes[topic]?.[mode];if(!type)throw Error('This exercise mode does not yet have a portable task adapter.');const graph=graphSchema(p),task={type,question:String(p.question??'')};
   if(topic==='fundamentals')Object.assign(task,{weighted:!!p.weighted,vertexOrder:p.vertexOrder.map(v=>graph.vertices[v]),...(p.multigraph?{multigraph:true}:{})});
   if(topic==='fundamentals')Object.assign(task,{variant:p.variant,source:graph.vertices[p.source],target:graph.vertices[p.target],vertex:graph.vertices[p.vertex],vertices:p.vertices?.map(v=>graph.vertices[v]),sequence:p.sequence?.map(v=>graph.vertices[v])});
   if(topic==='fundamentals'&&mode==='degree')task.degreeKind=p.fields[0]?.key==='value'?(p.fields[0].label==='Indegree'?'indegree':p.fields[0].label==='Outdegree'?'outdegree':p.fields[0].label==='Degree'?'degree':p.fields[0].label==='Sum of all indegrees'?'sumIndegree':p.fields[0].label==='Sum of all outdegrees'?'sumOutdegree':'sumDegree'):undefined;
   if(topic==='topo')Object.assign(task,{removed:p.prefix?.map(v=>graph.vertices[v])||[],multi:!!p.multi,single:!!p.single,vertex:p.vertex===undefined?undefined:graph.vertices[p.vertex],removals:p.removals||0,witness:!!p.witness,concept:p.concept});
   if(topic==='dijkstra'||topic==='shortest')Object.assign(task,{source:graph.vertices[p.source],target:graph.vertices[p.target],includePredecessors:!!p.askPrev,includeCost:!!p.askCost});
   if(topic==='dijkstra'&&mode==='iteration'&&p.before)task.before={distances:p.before.dist.map(x=>Number.isFinite(x)?x:null),predecessors:p.before.prev.map(v=>v===null?null:graph.vertices[v]),known:p.before.known.slice()};
   if(topic==='dijkstra'&&mode==='relax')Object.assign(task,{fromDistance:p.du,currentDistance:p.dv,weight:p.w,variant:p.variant,candidates:(p.candidates||[]).map(x=>({distance:x.d,weight:x.w}))});
   if(topic==='dijkstra'&&mode==='complexity')task.concept=p.concept;
   if(topic==='shortest')Object.assign(task,{source:graph.vertices[p.source],target:graph.vertices[p.target],variant:p.variant,includePredecessors:!!p.askPrev,level:p.level,processed:p.prefix?.map(v=>graph.vertices[v]),traceMode:p.traceMode,stepIndex:p.stepIndex,relaxEdge:p.edge?.id,fromDistance:p.du,currentDistance:p.dv});
   if(topic==='activity')Object.assign(task,{durations:Object.fromEntries(graph.vertices.map((v,i)=>[v,p.durations[i]]))});
   if(topic==='activity'&&mode==='event')task.eventLayout={candidates:p.candidates.map(e=>({id:e.id,fromActivity:graph.vertices[Math.floor(e.u/2)],toActivity:graph.vertices[Math.floor(e.v/2)]})),proposed:p.proposed.slice()};
   if(topic==='activity'&&mode==='eligible')task.completed=p.completed.map(v=>graph.vertices[v]);
   if(topic==='activity'&&mode==='precedence')Object.assign(task,{relation:{from:graph.vertices[p.relationFrom],to:graph.vertices[p.relationTo]},variant:p.variant,completed:(p.completed||[]).map(v=>graph.vertices[v]),proposedOrder:p.proposedOrder?.map(v=>graph.vertices[v])});
    if(topic==='pert')Object.assign(task,{format:p.g.format||'exam',start:graph.vertices[p.ref?.start??0],finish:graph.vertices[p.ref?.finish??g.n-1],variant:p.variant,requestedEvents:p.variant==='all'?'all':p.vertices.map(v=>graph.vertices[v]),activities:p.slackIds});
   if(topic==='flow')Object.assign(task,{source:graph.vertices[0],sink:graph.vertices[g.n-1],initialFlows:Object.fromEntries(graph.edges.map((e,i)=>[e.id,p.given?.[i]??0])),variant:mode==='residual'?({0:'forward',1:'reverse',2:'afterReverse',3:'afterAugment'}[p.variant]??p.variant):mode==='validity'?({0:'feasible',1:'value',2:'maximum',3:'augmentingPath',4:'conservationWitness'}[p.variant]??p.variant):p.variant,edgeIndex:p.edgeIndex,delta:p.delta,augmentationPath:p.augmentationPath,augmentation:p.augmentation,targetEdges:p.targetEdges?.map(i=>graph.edges[i].id)});
   if(topic==='prim')Object.assign(task,{start:graph.vertices[p.source],concept:p.concept,variant:p.variant,selectedEdges:mode==='next'?p.prefix:p.given});
   return{version:1,topic,mode,difficulty:ctx.ui.diff.value,graph,task};}
  function buildPortable(d){
   const vertices=d.graph.vertices,index=new Map(vertices.map((v,i)=>[v,i])),edges=d.graph.edges.map((e,i)=>({id:e.id||'e'+i,u:index.get(e.from),v:index.get(e.to),...(e.weight!==undefined?{w:e.weight}:e.duration!==undefined?{w:e.duration}:{}),...(e.capacity!==undefined?{cap:e.capacity}:{}),...(e.dummy!==undefined?{dummy:e.dummy}:{}),...(e.activity!==undefined?{activity:e.activity}:{})})),g={n:vertices.length,directed:d.graph.directed,edges,labels:vertices.slice()},cfg={mode:d.mode,difficulty:d.difficulty,seed:'portable-v1'},t=d.task||{},q=t.question||'Solve the graph exercise using the displayed data.',p={cfg,kind:d.mode,title:'Question',question:q,contract:'The graph and task were imported as explicit data. Correctness is checked with the section algorithm.',fields:[],steps:[],g,weighted:true,showGraph:true};
   const blank={answers:{},chosen:[]};
   if(d.topic==='fundamentals'&&d.mode==='matrix'){if(t.multigraph===true&&(!graph.directed||t.weighted!==false))throw Error('The multigraph discriminator is limited to directed unweighted adjacency matrices.');p.kind='matrix';p.weighted=!!t.weighted;p.multigraph=t.multigraph===true;p.vertexOrder=(t.vertexOrder||vertices).map(v=>index.get(v));if(p.vertexOrder.some(v=>v===undefined)||new Set(p.vertexOrder).size!==vertices.length)throw Error('Adjacency matrix vertexOrder must contain each graph vertex exactly once.');p.source=0;p.vertex=0;p.initial={answers:{},matrix:Array.from({length:g.n},()=>Array(g.n).fill('')),lists:Array(g.n).fill(''),chosen:[]};p.question=q||(p.multigraph?'Construct an unweighted directed multigraph adjacency matrix of edge counts in the stated vertex order; loops appear on the diagonal and parallel edges contribute multiplicity.':'Construct the adjacency matrix in the stated vertex order.');}
   else if(d.topic==='fundamentals'&&d.mode==='list'){p.kind='list';p.weighted=!!t.weighted;p.vertices=(t.vertices||vertices).map(v=>index.get(v));if(p.vertices.some(v=>v===undefined))throw Error('Adjacency list task.vertices contains an unknown vertex.');p.vertex=p.vertices[0]??0;p.source=0;p.vertexOrder=vertices.map((_,i)=>i);p.initial={answers:{},matrix:Array.from({length:g.n},()=>Array(g.n).fill('')),lists:Array(g.n).fill(''),chosen:[]};p.question=q||'Enter the outgoing adjacency list for the requested vertices.';}
   else if(d.topic==='fundamentals'&&d.mode==='degree'){p.kind='degree';p.weighted=false;p.vertex=index.get(t.vertex);if(p.vertex===undefined)throw Error('Degree task.vertex must name a graph vertex.');p.source=p.vertex;p.vertexOrder=vertices.map((_,i)=>i);const arcs=GraphCore.arcs(g),ins=arcs.filter(e=>e.v===p.vertex).length,outs=arcs.filter(e=>e.u===p.vertex).length,key=t.degreeKind|| (g.directed?'indegree':'degree'),spec={indegree:['Indegree',ins],outdegree:['Outdegree',outs],degree:['Degree',outs],sumIndegree:['Sum of all indegrees',g.edges.length],sumOutdegree:['Sum of all outdegrees',g.edges.length],sumDegree:['Sum of all degrees',2*g.edges.length]}[key];if(!spec||!g.directed&&['indegree','outdegree','sumIndegree','sumOutdegree'].includes(key)||g.directed&&['degree','sumDegree'].includes(key))throw Error('Unsupported degreeKind for this graph type.');p.fields=[{key:'value',type:'number',label:spec[0],expected:spec[1]}];p.initial={answers:{},matrix:Array.from({length:g.n},()=>Array(g.n).fill('')),lists:Array(g.n).fill(''),chosen:[]};p.question=q||'Calculate '+spec[0].toLowerCase()+(key==='degree'||key==='indegree'||key==='outdegree'?' of '+t.vertex:'')+'.';}
   else if(d.topic==='fundamentals'&&d.mode==='paths'){p.kind='paths';p.weighted=false;p.source=index.get(t.source);p.target=index.get(t.target);p.variant=t.variant||'exists';if(p.source===undefined)throw Error('Paths task.source must name a vertex.');if(['exists','construct'].includes(p.variant)&&p.target===undefined)throw Error('This path task requires task.target.');p.sequence=(t.sequence||[]).map(v=>index.get(v));if(p.sequence.some(v=>v===undefined))throw Error('Paths task.sequence contains an unknown vertex.');p.expected=FundamentalCore.properties(g,p.source).reachable;if(p.variant==='exists')p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:p.expected.includes(p.target)?'yes':'no'}];if(p.variant==='length'||p.variant==='valid'||p.variant==='simple'){const info=FundamentalQuestions.pathInfo(g,p.sequence);if(p.variant==='length')p.fields=[{key:'value',type:'number',label:'Path length',expected:p.sequence.length-1}];else p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:(p.variant==='valid'?info.valid:info.simple)?'yes':'no'}];}p.initial={answers:{},matrix:Array.from({length:g.n},()=>Array(g.n).fill('')),lists:Array(g.n).fill(''),chosen:[]};p.question=q||({reachable:'Select all vertices reachable from '+t.source+'.',exists:'Is there a path from '+t.source+' to '+t.target+'?',construct:'Give any valid path from '+t.source+' to '+t.target+'.',length:'Find the edge length of the specified path.',valid:'Is the specified sequence a valid path?',simple:'Is the specified path simple?'}[p.variant]||'Answer the path question.');}
   else if(d.topic==='fundamentals'&&d.mode==='cycles'){p.kind='cycles';p.weighted=false;p.variant=t.variant||'graph';p.cycle=FundamentalCore.cycle(g);p.sequence=(t.sequence||[]).map(v=>index.get(v));if(p.sequence.some(v=>v===undefined))throw Error('Cycle task.sequence contains an unknown vertex.');p.source=0;p.vertexOrder=vertices.map((_,i)=>i);if(['graph','dag'].includes(p.variant))p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:(p.variant==='dag'?!p.cycle:!!p.cycle)?'yes':'no'}];else if(p.variant==='sequence'||p.variant==='simple')p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:FundamentalQuestions.cycleValid(g,p.sequence,true,p.variant==='simple')?'yes':'no'}];p.initial={answers:{},matrix:Array.from({length:g.n},()=>Array(g.n).fill('')),lists:Array(g.n).fill(''),chosen:[]};p.question=q||'Determine whether the specified cycle claim is valid.';}
   else if(d.topic==='fundamentals'&&d.mode==='connectivity'){p.kind='connectivity';p.weighted=false;p.source=0;p.vertexOrder=vertices.map((_,i)=>i);const state=FundamentalCore.properties(g,0).connectivity,choices=g.directed?[['strong','Strongly connected'],['weak','Weakly connected, not strongly'],['disconnected','Not weakly connected']]:[['connected','Connected'],['disconnected','Disconnected']];p.fields=[{key:'choice',type:'choice',choices,expected:state}];p.initial={answers:{},matrix:Array.from({length:g.n},()=>Array(g.n).fill('')),lists:Array(g.n).fill(''),chosen:[]};p.question=q||'Classify this graph’s connectivity.';}
   else if(d.topic==='topo'&&d.mode==='construct'){if(!g.directed||GraphCore.kahn(g).cyclic)throw Error('Topological Order requires a directed acyclic graph.');p.ref=GraphCore.kahn(g);p.prefix=[];p.weighted=false;p.initial={...blank,stages:[],active:0};p.question=q||'Enter any complete topological ordering.';}
    else if(d.topic==='topo'&&['eligible','indegree','cycles'].includes(d.mode)){if(!g.directed)throw Error('Topological exercises require a directed graph.');p.ref=GraphCore.kahn(g);p.prefix=(t.removed||[]).map(v=>index.get(v));if(p.prefix.some(v=>v===undefined)||new Set(p.prefix).size!==p.prefix.length)throw Error('task.removed must contain distinct graph vertices.');{const removed=new Set();for(const v of p.prefix){if(GraphCore.eligible(g,[...removed]).includes(v)===false)throw Error('task.removed must be a valid zero-indegree processing prefix.');removed.add(v);}}p.weighted=false;p.initial={answers:{},chosen:[],stages:[],active:0};if(d.mode==='eligible'){p.kind='eligible';p.initial={...p.initial,stages:[],active:0};p.question=q||'Select all remaining vertices with indegree zero after the listed removals.';}else if(d.mode==='indegree'){p.kind='indegree';p.multi=!!t.multi;p.single=!!t.single;p.vertex=t.vertex===undefined?undefined:index.get(t.vertex);if(p.single&&p.vertex===undefined)throw Error('Single-vertex indegree tasks require task.vertex.');p.removals=Number(t.removals||0);if(!Number.isInteger(p.removals)||p.removals<0||p.removals>g.n-p.prefix.length)throw Error('Invalid task.removals count.');p.initial.stages=[{removed:p.prefix.slice(),values:Array(g.n).fill(null),next:null}];p.question=q||'Record the remaining indegrees and requested valid removals.';}else{p.kind='cycles';p.witness=!!t.witness;p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:p.ref.cyclic?'no':'yes'}];p.question=q||'Does a complete topological order exist?';}}
   else if(d.topic==='topo'&&d.mode==='concepts'){p.kind='concepts';p.showGraph=false;const prompts={dag:['Which condition defines a DAG?','dag',[['dag','Directed and acyclic'],['connected','Undirected and connected'],['weighted','All edges have positive weights']]],positiveIndegree:['Why can a remaining vertex with positive indegree not be removed next?','dependency',[['dependency','At least one unprocessed prerequisite remains'],['weight','It has an outgoing edge'],['degree','It has no outgoing edges']]],multipleOrders:['Can a DAG have more than one valid topological order?','yes',[['yes','Yes'],['no','No']]],cycle:['If vertices remain but none has indegree zero, what does this imply?','cycle',[['cycle','A directed cycle remains'],['dag','The remaining graph is acyclic'],['done','All vertices were processed']]],complexity:['With adjacency lists and indegree processing, what is the running time?','linear',[['linear','O(|V| + |E|)'],['square','O(|V|²)'],['log','O(log |V|)']]]};const x=prompts[t.concept];if(!x)throw Error('DAG concept must be dag, positiveIndegree, multipleOrders, cycle, or complexity.');p.fields=[{key:'choice',type:'choice',choices:x[2],expected:x[1]}];p.question=q||x[0];p.steps=['A topological process repeatedly removes a zero-indegree vertex and its outgoing edges.'];}
    else if(d.topic==='dijkstra'&&d.mode==='table'){if(edges.some(e=>e.w===undefined||e.w<0))throw Error('Dijkstra requires nonnegative edge weights.');p.source=index.get(t.source);if(p.source===undefined)throw Error('Dijkstra task.source must name a graph vertex.');p.target=index.get(t.target)??p.source;p.ref=GraphCore.dijkstra(g,p.source);p.distanceTable=true;p.initial={...blank,noPath:false,dist:Array(g.n).fill(null),prev:Array(g.n).fill(null),known:Array(g.n).fill(false),rows:Array.from({length:p.ref.steps.length},()=>({vertex:'',dist:Array(g.n).fill('')}))};p.question=q||'Using Dijkstra’s algorithm, starting from '+t.source+', complete every row of the distance table.';}
   else if(d.topic==='dijkstra'&&['path','iteration'].includes(d.mode)){if(edges.some(e=>e.w===undefined||e.w<0))throw Error('Dijkstra requires nonnegative edge weights.');p.source=index.get(t.source);p.target=index.get(t.target);if(p.source===undefined||p.target===undefined)throw Error('Dijkstra task.source and task.target must name graph vertices.');p.ref=GraphCore.dijkstra(g,p.source);p.askCost=!!t.includeCost;p.initial={...blank,noPath:false,dist:Array(g.n).fill(null),prev:Array(g.n).fill(null),known:Array(g.n).fill(false)};if(d.mode==='path'){p.kind='path';p.question=q||'Give any minimum-cost path from '+t.source+' to '+t.target+'.';}else{const b=t.before;if(!b||!Array.isArray(b.distances)||!Array.isArray(b.predecessors)||!Array.isArray(b.known)||b.distances.length!==g.n||b.predecessors.length!==g.n||b.known.length!==g.n)throw Error('Dijkstra iteration requires before.distances, before.predecessors, and before.known arrays matching the vertices.');p.kind='iteration';p.before={dist:b.distances.map(x=>x===null?Infinity:x),prev:b.predecessors.map(x=>x===null?null:index.get(x)),known:b.known.slice(),order:[],queue:[]};if(p.before.prev.some((v,i)=>b.predecessors[i]!==null&&v===undefined)||p.before.known.some(x=>typeof x!=='boolean'))throw Error('Invalid Dijkstra before-state.');p.initial.dist=p.before.dist.slice();p.initial.prev=p.before.prev.slice();p.initial.known=p.before.known.slice();p.initial.next=null;p.question=q||'Perform one Dijkstra iteration from the supplied tentative state.';}}
    else if(d.topic==='dijkstra'&&d.mode==='relax'){p.kind='relax';p.showGraph=false;p.variant=t.variant||'distance';const du=Number(t.fromDistance),dv=Number(t.currentDistance),w=Number(t.weight);if(!Number.isFinite(du)||!Number.isFinite(dv)||!Number.isFinite(w)||w<0)throw Error('Dijkstra Relaxation requires finite task.fromDistance, task.currentDistance, and nonnegative task.weight.');const candidates=t.candidates||[],costs=candidates.map(x=>Number(x.distance)+Number(x.weight));if(p.variant==='competing'){if(candidates.length!==3||candidates.some(x=>!Number.isFinite(x.distance)||!Number.isFinite(x.weight)||x.weight<0))throw Error('Competing relaxation requires exactly three nonnegative candidate distance/weight pairs.');p.fields=[{key:'value',type:'number',label:'Updated distance',expected:Math.min(dv,...costs)}];p.question=q||'Compare the current distance with all incoming candidate path costs and give the new distance.';p.steps=['Candidate costs are '+costs.join(', ')+'. Compare them with the current value '+dv+'.'];}
     else{const candidate=du+w;p.fields=[{key:'value',type:'number',label:'Updated distance',expected:Math.min(dv,candidate)}];if(p.variant==='improve'||p.variant==='predecessor')p.fields.push({key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:candidate<dv?'yes':'no'});if(!['distance','improve','predecessor'].includes(p.variant))throw Error('Dijkstra Relaxation task.variant must be distance, improve, predecessor, or competing.');p.question=q||'For an edge from U to V, with d[U]='+du+', d[V]='+dv+', and weight '+w+', apply strict-improvement relaxation.';p.steps=['Candidate = '+du+' + '+w+' = '+candidate+'. Update to min('+dv+', '+candidate+'); an equal candidate does not change the predecessor.'];}}
   else if(d.topic==='dijkstra'&&d.mode==='complexity'){p.kind='complexity';p.showGraph=false;const questions={heap:['heap','Using adjacency lists and a binary heap, what is the running-time bound?','heap',[['heap','O((|V| + |E|) log |V|)'],['square','O(|V|²)'],['linear','O(|V| + |E|)']]],array:['array','With an array-based minimum scan, what is the standard bound?','square',[['square','O(|V|²)'],['log','O(log |V|)'],['linear','O(|V| + |E|)']]],nonnegative:['nonnegative','Why must ordinary Dijkstra use nonnegative edge weights?','known',[['known','A later path cannot improve a finalized distance'],['connected','The graph must be connected'],['positive','Every edge must be strictly positive']]],nextVertex:['nextVertex','Which unknown vertex may be finalized next?','min',[['min','One with the smallest finite tentative distance'],['lightest','One incident to the globally lightest edge'],['largest','The largest tentative distance']]]};const x=questions[t.concept];if(!x)throw Error('Dijkstra Complexity task.concept must be heap, array, nonnegative, or nextVertex.');p.fields=[{key:'choice',type:'choice',choices:x[3],expected:x[2]}];p.question=q||x[1];p.steps=['Dijkstra relies on nonnegative edge weights so a finalized minimum tentative distance cannot later improve.'];}
   else if(d.topic==='dijkstra'&&d.mode==='relax'){const u=Number(t.fromDistance),v=Number(t.currentDistance),w=Number(t.weight);if(!Number.isFinite(u)||!Number.isFinite(v)||!Number.isFinite(w)||w<0)throw Error('Relaxation requires finite distances and a nonnegative edge weight.');const candidate=u+w,variant=t.variant||'distance';p.kind='relax';p.showGraph=false;p.variant=variant;p.initial={answers:{},chosen:[],noPath:false};p.question=q||'For an edge with d[u]='+u+', d[v]='+v+', and weight '+w+', apply strict-improvement relaxation.';if(variant==='distance'||variant==='improve'||variant==='predecessor'){p.fields=[{key:'value',type:'number',label:'Updated distance',expected:Math.min(v,candidate)}];if(variant!=='distance')p.fields.push({key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:candidate<v?'yes':'no'});}else throw Error('Unknown Dijkstra relaxation task.variant.');}
   else if(d.topic==='shortest'&&['bfs','negative','dag'].includes(d.mode)){
    const mode=d.mode;if(mode==='bfs'&&edges.some(e=>e.w!==undefined))throw Error('Unweighted Paths must not include weights.');if(mode!=='bfs'&&edges.some(e=>e.w===undefined))throw Error('Weighted shortest-path tasks require a weight on every edge.');if(mode==='dag'&&(!g.directed||GraphCore.kahn(g).cyclic))throw Error('DAG shortest paths require a directed acyclic graph.');
    p.kind=mode;p.weighted=mode!=='bfs';p.source=index.get(t.source);p.target=index.get(t.target);if(p.source===undefined)throw Error('Shortest-path task.source must name a vertex.');if(mode==='negative'&&QuizGraphCore.negativeCycle(g,p.source).exists)throw Error('Ordinary negative-edge exercises cannot have a source-reachable negative cycle.');
    const tr=GraphExamCore.trace(g,p.source,mode);p.ref={dist:tr.final.dist,prev:tr.final.prev,order:tr.final.order,steps:tr.states.map(x=>x.after)};p.referenceTrace=tr;p.variant=t.variant||(mode==='bfs'?'table':'table');p.askPrev=!!t.includePredecessors;p.prefix=(t.processed||[]).map(v=>index.get(v));if(p.prefix.some(v=>v===undefined)||new Set(p.prefix).size!==p.prefix.length)throw Error('task.processed must contain distinct known vertices.');p.initial={...blank,noPath:false,dist:Array(g.n).fill(null),prev:Array(g.n).fill(null),known:Array(g.n).fill(false),stages:[],active:0};
    if(p.variant==='distance'||p.variant==='path'){if(p.target===undefined)throw Error('Distance and path variants require task.target.');if(p.variant==='distance')p.question=q||'Find the shortest '+(mode==='bfs'?'distance in edges':'path cost')+' from '+t.source+' to '+t.target+'.';else p.question=q||'Give any shortest path from '+t.source+' to '+t.target+'.';}
    else if(p.variant==='level'){if(mode!=='bfs'||!Number.isInteger(t.level)||t.level<0)throw Error('BFS level variant requires a nonnegative integer task.level.');p.level=t.level;p.expected=p.ref.dist.flatMap((v,i)=>v===t.level?[i]:[]);p.question=q||'Select vertices at distance '+t.level+' from '+t.source+'.';}
    else if(p.variant==='eligible'){if(mode!=='dag')throw Error('Eligible-vertex variant is only valid for DAG shortest paths.');p.expected=GraphCore.eligible(g,p.prefix);p.question=q||'Select eligible vertices after the supplied topological prefix.';}
    else if(p.variant==='order'){if(mode!=='dag')throw Error('Order variant is only valid for DAG shortest paths.');p.question=q||'Enter any valid topological processing order.';}
     else if(p.variant==='relax'&&mode==='negative'){const e=edges.find(x=>x.id===t.relaxEdge),du=Number(t.fromDistance),dv=Number(t.currentDistance);if(!e||!Number.isFinite(du)||!Number.isFinite(dv))throw Error('Negative-edge relaxation requires task.relaxEdge, fromDistance, and currentDistance.');const candidate=du+e.w;p.edge=e;p.du=du;p.dv=dv;p.showGraph=false;p.fields=[{key:'value',label:'Updated distance',type:'number',expected:Math.min(dv,candidate)},{key:'choice',type:'choice',choices:[['yes','Predecessor changes'],['no','Predecessor unchanged']],expected:candidate<dv?'yes':'no'}];p.steps=['Candidate '+du+' + ('+e.w+') = '+candidate+'. Compare it with '+dv+'; only strict improvement changes the predecessor.'];p.question=q||'Apply strict-improvement relaxation for the specified negative-edge algorithm.';}
     else if(p.variant==='step'||p.variant==='trace'){if(p.variant==='step'){if(!Number.isInteger(t.stepIndex)||t.stepIndex<0||t.stepIndex>=tr.states.length)throw Error('task.stepIndex is outside the reference trace.');p.startState=tr.states[t.stepIndex].before;}else p.startState=GraphExamCore.initial(g,p.source,mode);p.traceMode=mode;p.initial.stages=[GraphExamCore.draft(p.startState)];p.question=q||'Record the requested algorithm stage without omitting queue or distance updates.';}
    else if(p.variant==='table')p.question=q||'Complete the final shortest-path table from '+t.source+'.';else throw Error('Unknown shortest-path task.variant.');
   }
   else if(d.topic==='shortest'&&d.mode==='cycle'){if(edges.some(e=>e.w===undefined))throw Error('Negative-cycle questions require edge weights.');p.kind='cycle';p.weighted=true;p.source=index.get(t.source);p.target=index.get(t.target);if(p.source===undefined)throw Error('Negative-cycle task.source must name a vertex.');p.info=QuizGraphCore.negativeCycle(g,p.source);p.affected=GraphExamCore.affected(g,p.source);p.variant=t.variant||'exists';p.initial={answers:{},chosen:[],noPath:false,dist:Array(g.n).fill(null),prev:Array(g.n).fill(null),known:Array(g.n).fill(false),stages:[],active:0};if(p.variant==='affected'){if(p.target===undefined)throw Error('Affected-destination questions require task.target.');p.fields=[{key:'choice',type:'choice',choices:[['finite','Finite shortest distance'],['unreachable','Unreachable'],['unbounded','Unbounded below']],expected:p.affected.includes(p.target)?'unbounded':Number.isFinite(GraphCore.bellman(g,p.source)[p.target])?'finite':'unreachable'}];}else{if(!['exists','witness'].includes(p.variant))throw Error('Negative-cycle task.variant must be exists, witness, or affected.');p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:p.info.exists?'yes':'no'}];if(p.variant==='witness'&&p.info.exists)p.fields.push({key:'cost',type:'number',label:'Cycle total weight',expected:p.info.cycle.reduce((sum,u,i)=>sum+Math.min(...g.edges.filter(e=>e.u===u&&e.v===p.info.cycle[(i+1)%p.info.cycle.length]).map(e=>e.w)),0)});}p.question=q||'Is a negative-cost cycle reachable from '+t.source+'?';}
    else if(d.topic==='activity'&&d.mode==='node'){if(!g.directed||GraphCore.kahn(g).cyclic)throw Error('Activity-node construction requires an acyclic directed graph.');p.kind='node';p.weighted=false;if(!t.durations||vertices.some(v=>!Object.hasOwn(t.durations,v)))throw Error('Activity-node tasks must provide a duration for every activity.');p.durations=vertices.map(v=>t.durations[v]);if(p.durations.some(x=>!Number.isSafeInteger(x)||x<1))throw Error('Activity durations must be positive integers.');p.reach=QuizGraphCore.closure(g);p.order=GraphCore.kahn(g).order;p.initial={answers:{edges:''},chosen:[],eventSelected:null,edges:[],from:null,to:0,selected:[],order:[],connections:[],types:{},durations:{},initialAnswer:null};p.question=q||'Construct the activity-node graph using exactly the stated immediate prerequisite edges.';}
    else if(d.topic==='activity'&&d.mode==='event'){if(!g.directed||GraphCore.kahn(g).cyclic)throw Error('Event graph exercises require an acyclic activity precedence graph.');const el=t.eventLayout;if(!el||!Array.isArray(el.candidates)||!Array.isArray(el.proposed))throw Error('Event Graph requires task.eventLayout.candidates and proposed.');if(!t.durations||vertices.some(v=>!Object.hasOwn(t.durations,v)))throw Error('Event graph tasks must provide a duration for every activity.');p.kind='event';p.weighted=true;p.durations=vertices.map(v=>t.durations[v]);if(p.durations.some(x=>!Number.isSafeInteger(x)||x<1))throw Error('Real activity durations must be positive integers.');p.g.positions=vertices.map((_,i)=>({x:i,y:0}));p.reach=QuizGraphCore.closure(g);p.order=GraphCore.kahn(g).order;p.real=vertices.map((_,v)=>({id:'a'+v,u:2*v,v:2*v+1,w:p.durations[v],activity:v}));p.candidates=el.candidates.map(x=>{const u=index.get(x.fromActivity),v=index.get(x.toActivity);if(!x||typeof x.id!=='string'||!x.id||u===undefined||v===undefined||u===v||p.order.indexOf(u)>=p.order.indexOf(v))throw Error('Event candidate must point from an earlier activity to a distinct later activity.');return{id:x.id,u:2*u+1,v:2*v,w:0,required:g.edges.some(e=>e.u===u&&e.v===v)};});if(new Set(p.candidates.map(e=>e.id)).size!==p.candidates.length||p.candidates.some(e=>p.real.some(r=>r.id===e.id)))throw Error('Event edge IDs must be unique.');if(el.proposed.some(id=>!p.candidates.some(e=>e.id===id))||new Set(el.proposed).size!==el.proposed.length)throw Error('task.eventLayout.proposed must contain unique optional edge IDs.');p.proposed=el.proposed.slice();const diagram=GraphCore.graph(2*vertices.length,[...p.real,...p.candidates],true),sort=GraphCore.kahn(diagram);if(sort.cyclic)throw Error('The supplied fixed event layout contains a directed cycle.');const level=Array(diagram.n).fill(0);for(const u of sort.order)for(const e of diagram.edges.filter(x=>x.u===u))level[e.v]=Math.max(level[e.v],level[u]+1);diagram.format=t.format||'exam';diagram.layers=Array.from({length:Math.max(...level)+1},(_,k)=>sort.order.filter(v=>level[v]===k));p.diagram=diagram;p.proposedFaithful=QuizGraphCore.sameRelations(QuizGraphCore.eventRelations(p,p.proposed),p.reach);p.initial={answers:{},chosen:[],eventSelected:null,edges:[],from:null,to:0,selected:[],order:[],connections:p.proposed.slice(),types:{},durations:{},initialAnswer:null};p.question=q||'Check whether the initial event network preserves the activity precedences, then repair it and classify edge types/durations.';}
   else if(d.topic==='activity'&&d.mode==='order'){if(!g.directed||GraphCore.kahn(g).cyclic)throw Error('Activity execution order requires an acyclic directed graph.');p.kind='order';p.weighted=false;p.durations=vertices.map(v=>t.durations?.[v]??1);p.completed=[];p.reach=QuizGraphCore.closure(g);p.order=GraphCore.kahn(g).order;p.initial={...blank,eventSelected:null,edges:[],from:null,to:0,selected:[],order:[],connections:[],types:{},durations:{},initialAnswer:null};p.question=q||'Enter any valid activity execution order.';}
    else if(d.topic==='activity'&&['eligible','precedence'].includes(d.mode)){if(!g.directed||GraphCore.kahn(g).cyclic)throw Error('Activity exercises require a directed acyclic graph.');p.kind=d.mode;p.weighted=false;p.durations=vertices.map(v=>t.durations?.[v]??1);p.reach=QuizGraphCore.closure(g);p.order=GraphCore.kahn(g).order;p.completed=(t.completed||[]).map(v=>index.get(v));if(p.completed.some(v=>v===undefined)||new Set(p.completed).size!==p.completed.length)throw Error('task.completed must contain distinct known activities.');p.initial={answers:{},chosen:[],eventSelected:null,edges:[],from:null,to:0,selected:[],order:[],connections:[],types:{},durations:{},initialAnswer:null};if(d.mode==='eligible')p.question=q||'Select all uncompleted activities whose immediate prerequisites are complete.';else{const from=index.get(t.relation?.from),to=index.get(t.relation?.to),variant=t.variant;if(from===undefined||to===undefined||from===to)throw Error('Precedence task.relation requires distinct from/to vertices.');p.relationFrom=from;p.relationTo=to;p.variant=variant;if(!Number.isInteger(variant)||variant<0||variant>6)throw Error('Precedence task.variant must be an integer from 0 through 6.');let answer=false,explanation='';if(variant===0){answer=g.edges.some(e=>e.u===from&&e.v===to);explanation='Immediate prerequisite means a direct edge.';}if(variant===1){answer=p.reach[from][to];explanation='Direct or indirect precedence is determined by directed reachability.';}if(variant===2){answer=!p.reach[from][to]&&!p.reach[to][from];explanation='Activities may run in parallel when neither precedes the other.';}if(variant===3){answer=!p.completed.includes(from)&&g.edges.filter(e=>e.v===from).every(e=>p.completed.includes(e.u));explanation='An uncompleted activity may begin once every immediate prerequisite is completed.';}if(variant===4){p.proposedOrder=(t.proposedOrder||[]).map(v=>index.get(v));if(p.proposedOrder.length!==g.n||p.proposedOrder.some(v=>v===undefined))throw Error('Ordering question requires a complete task.proposedOrder.');answer=GraphCore.topoValid(g,p.proposedOrder).ok;explanation='Each immediate predecessor must occur before its successor.';}if(variant===5){answer=!p.reach[from][to];explanation=answer?'No path currently establishes this ordered precedence, so the new edge adds a dependency.':'A directed path already implies this ordered precedence.';}if(variant===6){answer=true;explanation='A dummy connector represents precedence without work and therefore has duration zero.';}p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:answer?'yes':'no'}];p.question=q||'Answer the activity-precedence question for the specified pair.';p.steps=[explanation];}}
    else if(d.topic==='pert'&&['earliest','latest','slack','critical','complete'].includes(d.mode)){g.format=t.format||'exam';if(!g.directed||edges.some(e=>e.w===undefined||!Number.isSafeInteger(e.w)||e.w<0||e.dummy&&e.w!==0||!e.dummy&&e.w===0))throw Error('PERT edges need positive integer durations; dummy edges must have duration zero.');p.ref=PertCore.solve(g);if(index.get(t.start)!==p.ref.start||index.get(t.finish)!==p.ref.finish)throw Error('PERT task.start and task.finish must identify the unique source and finish events in the graph.');const level=Array(g.n).fill(0);for(const v of p.ref.order)for(const e of p.ref.outgoing[v])level[e.v]=Math.max(level[e.v],level[v]+1);g.layers=Array.from({length:Math.max(...level)+1},(_,k)=>level.flatMap((x,v)=>x===k?[v]:[]));p.kind=d.mode;p.weighted=true;p.variant=['critical','complete'].includes(d.mode)?'all':t.variant||'all';p.vertices=p.variant==='all'?p.ref.order.filter(v=>d.mode!=='earliest'||v!==p.ref.start):(t.requestedEvents||[]).map(v=>index.get(v));if(p.vertices.some(v=>v===undefined))throw Error('PERT requestedEvents contains an unknown event.');p.slackIds=d.mode==='complete'?g.edges.map(e=>e.id):d.mode==='slack'?(t.activities||g.edges.map(e=>e.id)):[];if(p.slackIds.some(id=>!g.edges.some(e=>e.id===id)))throw Error('PERT task.activities contains an unknown edge ID.');p.initial={...PertCore.initial(p),answers:{},chosen:[],active:'earliest',paths:''};p.initial.E[p.ref.start]='0';if(d.mode==='latest')p.initial.E=p.ref.E.map(String);p.question=q||({earliest:'Calculate earliest event completion times.',latest:'Given earliest event times and project duration, calculate latest event times.',slack:'Calculate the requested activity slacks.',critical:'Determine project duration and all critical activities.',complete:'Complete the forward pass, backward pass, slack values, and critical paths.'}[d.mode]);}
   else if(d.topic==='flow'&&['maximum','augment','residual','cut','validity'].includes(d.mode)){
    if(!g.directed||edges.some(e=>e.cap===undefined||e.cap<0||!Number.isSafeInteger(e.cap)))throw Error('Flow graphs require directed edges with nonnegative integer capacities.');
    const source=index.get(t.source),sink=index.get(t.sink);if(source===undefined||sink===undefined||source===sink)throw Error('Flow task.source and task.sink must name different vertices.');
    if(source!==0||sink!==g.n-1)throw Error('The current Network Flow renderer uses the first vertex as source and last vertex as sink; order graph.vertices accordingly.');
    p.kind=d.mode;p.weighted=true;p.source=source;p.sink=sink;p.ref=GraphCore.maxFlow(g);const flows=edges.map(e=>t.initialFlows?.[e.id]??0);if(flows.some(x=>!Number.isSafeInteger(x)||x<0))throw Error('task.initialFlows must contain nonnegative integer flows.');
    p.given=d.mode==='maximum'?Array(edges.length).fill(0):flows;
    if(!['maximum','validity'].includes(d.mode)&&!GraphCore.flowCheck(g,p.given).ok)throw Error('This flow mode requires feasible initialFlows respecting capacity and conservation.');
    p.initial={answers:{},chosen:[],f:p.given.slice(),draft:p.given.slice(),path:[],pathText:'',delta:'',total:'',side:[],log:[],active:0,residual:['maximum','augment'].includes(d.mode),manual:false};
    if(d.mode==='maximum')p.question=q||'Starting from zero flow, find a maximum flow. Record valid augmentations and enter its value.';
    if(d.mode==='augment'){p.question=q||'Find one augmenting path and its bottleneck.';p.variant='portable';}
    if(d.mode==='residual'){const ei=Number(t.edgeIndex);if(!Number.isInteger(ei)||ei<0||ei>=edges.length)throw Error('Residual Network requires task.edgeIndex.');p.edgeIndex=ei;p.variant=t.variant;const e=edges[ei],f=flows[ei],delta=Number(t.delta||0);if(p.variant==='afterAugment'){if(!Array.isArray(t.augmentationPath)||!Number.isSafeInteger(t.augmentation)||t.augmentation<=0)throw Error('afterAugment requires task.augmentationPath and a positive task.augmentation.');const result=GraphCore.pathFlow(g,flows,t.augmentationPath);if(!result.ok||result.bottleneck!==t.augmentation)throw Error('The supplied residual augmentation is not valid at its full bottleneck.');const after=FlowQuestions.mechanical(g,flows,t.augmentationPath,t.augmentation),targetIds=t.targetEdges||[e.id],targets=targetIds.map(id=>edges.findIndex(x=>x.id===id));if(targets.some(i=>i<0))throw Error('task.targetEdges contains an unknown edge ID.');p.fields=targets.flatMap(i=>[{key:'forward'+i,type:'number',label:edges[i].id+' forward residual',expected:edges[i].cap-after[i]},{key:'reverse'+i,type:'number',label:edges[i].id+' reverse residual',expected:after[i]}]);p.augmentationPath=t.augmentationPath.slice();p.augmentation=t.augmentation;p.targetEdges=targets;p.steps=['Apply the residual path to the identified original edges, then compute c−f forward and f reverse. Antiparallel originals remain separate.'];}
     else{if(!['forward','reverse','afterReverse'].includes(p.variant))throw Error('Residual task.variant must be forward, reverse, afterReverse, or afterAugment.');if(p.variant==='afterReverse'&&(!Number.isSafeInteger(delta)||delta<0||delta>f))throw Error('task.delta must be between zero and the current flow.');p.delta=delta;const expected=p.variant==='forward'?e.cap-f:p.variant==='reverse'?f:f-delta;p.fields=[{key:'value',type:'number',label:'Residual capacity / updated flow',expected}];p.steps=['For '+e.id+': forward residual is capacity − flow; reverse residual equals flow.'];}p.question=q||('Find the '+(p.variant==='forward'?'forward residual capacity':p.variant==='reverse'?'reverse residual capacity':p.variant==='afterReverse'?'new flow after reverse use':'residual capacities after the stated augmentation')+' for edge '+e.id+'.');}
    if(d.mode==='cut'){p.given=p.ref.flows.slice();p.initial.f=p.given.slice();p.initial.draft=p.given.slice();p.question=q||'Select the source side of any minimum cut and enter its capacity.';}
    if(d.mode==='validity'){p.variant=t.variant||'feasible';const check=GraphCore.flowCheck(g,flows),hasPath=check.ok&&GraphCore.reachable(g,flows).includes(sink);if(p.variant==='conservationWitness'){const balance=Array(g.n).fill(0);g.edges.forEach((e,i)=>{balance[e.u]-=flows[i];balance[e.v]+=flows[i];});if(g.edges.some((e,i)=>flows[i]>e.cap)||!balance.some((x,v)=>v>0&&v<g.n-1&&x!==0))throw Error('A conservationWitness task requires capacity-feasible flows with an internal conservation violation.');p.witnessVertices=balance.flatMap((x,v)=>v>0&&v<g.n-1&&x!==0?[v]:[]);p.initial.witnessVertex=null;p.steps=['Compare incoming and outgoing flow at each internal vertex.'];}else if(p.variant==='feasible')p.fields=[{key:'choice',type:'choice',choices:[['yes','Feasible'],['no','Not feasible']],expected:check.ok?'yes':'no'}];else if(p.variant==='value')p.fields=[{key:'value',type:'number',label:'Current flow value',expected:check.value}];else if(p.variant==='maximum'||p.variant==='augmentingPath')p.fields=[{key:'choice',type:'choice',choices:[['yes','Yes'],['no','No']],expected:(p.variant==='maximum'?!hasPath:hasPath)?'yes':'no'}];else throw Error('Flow validity task.variant must be feasible, value, maximum, augmentingPath, or conservationWitness.');if(p.variant!=='conservationWitness')p.steps=[check.message];p.question=q||({feasible:'Are the displayed flows feasible?',value:'What is the current flow value?',maximum:'Is this flow maximum?',augmentingPath:'Does an augmenting path remain?',conservationWitness:'The displayed flows respect every edge capacity. Identify an internal vertex where incoming and outgoing flow differ.'}[p.variant]);}
   }
   else if(d.topic==='prim'&&['full','trace','next'].includes(d.mode)){if(g.directed||!connected(g)||edges.some(e=>e.w===undefined||!Number.isFinite(e.w)))throw Error('Prim requires a connected weighted undirected graph.');p.source=index.get(t.start);if(p.source===undefined)throw Error('Prim task.start must name a graph vertex.');p.ref=GraphCore.prim(g,p.source);p.kind=d.mode;p.initial={answers:{},chosen:[],edges:[]};
    if(d.mode==='full')p.question=q||'Select a minimum spanning tree and enter its total weight.';
    if(d.mode==='trace')p.question=q||'Execute Prim from the specified start. Record a minimum eligible crossing edge at each step.';
    if(d.mode==='next'){p.prefix=t.selectedEdges;if(!Array.isArray(p.prefix)||p.prefix.some(id=>!edges.some(e=>e.id===id)))throw Error('Prim next-edge task.selectedEdges must list valid edge IDs.');p.visited=PrimQuestions.visited(p,p.prefix);if(p.visited.length!==p.prefix.length+1)throw Error('The selectedEdges must form a tree grown from task.start.');p.question=q||'Select one minimum-weight edge crossing the current tree boundary.';}
   }
   else if(d.topic==='prim'&&d.mode==='concepts'){p.kind='concepts';p.showGraph=false;let prompt,expected,choices,explanation;
    if(t.concept==='edgeCount'){prompt='How many edges does a spanning tree on N vertices contain?';expected='N−1';choices=[['N−1','N−1'],['N','N'],['E','|E|']];explanation='A tree on N vertices has N−1 edges.';}
    else if(t.concept==='crossing'){prompt='Which edge can Prim add next?';expected='crossing';choices=[['crossing','Minimum eligible edge crossing to an unselected vertex'],['global','Globally lightest edge regardless of endpoints'],['internal','An edge within the selected tree']];explanation='The chosen edge must cross the current tree boundary and add one new vertex.';}
    else if(t.concept==='arrayComplexity'){prompt='With an adjacency matrix and linear minimum selection, what is Prim’s bound?';expected='square';choices=[['square','O(|V|²)'],['linear','O(|V|+|E|)'],['log','O(log |V|)']];explanation='Linear minimum selection and row scans over all vertices give O(|V|²).';}
    else if(t.concept==='heapComplexity'){prompt='With adjacency lists and a binary heap, what is the usual Prim bound?';expected='heap';choices=[['heap','O((|V|+|E|) log |V|)'],['square','O(|V|²)'],['linear','O(|V|+|E|)']];explanation='Heap operations over vertices and edge updates give the usual O((|V|+|E|) log |V|) bound.';}
    else if(t.concept==='dijkstra'){prompt='What does Prim’s tentative key represent?';expected='edge';choices=[['edge','Best connecting-edge weight to the current tree'],['path','Total source-to-vertex path distance'],['degree','Vertex degree']];explanation='Prim tracks a connecting edge; Dijkstra tracks source-to-vertex path distance.';}
    else if(t.concept==='ties'){prompt='Several eligible crossing edges share the minimum weight. Which may Prim choose?';expected='any';choices=[['any','Any tied minimum crossing edge'],['one','Only one fixed reference edge'],['none','No edge; ties prevent Prim']];explanation='Any minimum crossing edge is a valid greedy choice; tied choices can produce different MSTs.';}
    else if(t.concept==='connected'){prompt='What graph condition is required for a spanning minimum spanning tree?';expected='connected';choices=[['connected','The weighted undirected graph is connected'],['directed','The graph is directed'],['acyclic','The input graph must already be acyclic']];explanation='A spanning tree must connect every vertex, so the weighted undirected input graph must be connected.';}
    else if(t.concept==='cycle'){prompt='Why does Prim avoid adding an edge whose endpoints are both already in its tree?';expected='cycle';choices=[['cycle','It would create a cycle'],['large','Its weight must be too large'],['negative','It must have negative weight']];explanation='The current selected edges already connect those endpoints, so adding another edge would create a cycle.';}
    else throw Error('Unknown Prim concept.');p.fields=[{key:'choice',type:'choice',choices,expected}];p.steps=[explanation];p.question=q||prompt;}
   else throw Error('This topic/mode/task type has no portable adapter yet.');
   p.initial??=blank;p.fields??=[];p.steps??=[];p.cfg=cfg;p.portableProblem=clone(d);return p;
  }
  function encode(ctx,withStudent){const problem=makeProblem(ctx);let prefix='Q2P1:',payload=problem;if(withStudent){prefix='Q2S1:';payload={version:1,problem,student:{state:clone(ctx.s),history:clone(ctx.history),future:clone(ctx.future),submitted:!!ctx.submitted,completed:!!ctx.solved,checked:!!ctx.submitted}};}return prefix+stringify(payload,2);}
 function hasWork(ctx){return JSON.stringify(ctx.s)!==JSON.stringify(ctx.p?.initial)||ctx.history.length>0;}
  function createFallback(root,mode,ctx,status){let panel=root.querySelector('.q2-seed-fallback');if(panel){panel.hidden=false;return;}panel=document.createElement('div');panel.className='q2-seed-fallback';const input=document.createElement('textarea');input.rows=3;input.placeholder='Paste a Q2P1: or Q2S1: code';input.setAttribute('aria-label','Paste challenge code');const load=document.createElement('button');load.type='button';load.textContent='Load';load.onclick=()=>{if(importText(ctx,input.value,status)===false)setStatus(status,'Invalid Seed','error');};panel.append(input,load);mode.after(panel);input.focus({preventScroll:true});}
 function importText(current,text,status){
   if(typeof text!=='string'||text.length>maxChars)return false;const m=text.trim().match(/^(Q2P1|Q2S1):([\s\S]+)$/);if(!m)return false;let data;try{data=parse(m[2]);}catch{return false;}
     const isSnapshot=m[1]==='Q2S1';if(isSnapshot&&(!data||data.version!==1||!data.student||typeof data.student!=='object'||Array.isArray(data.student)||Object.keys(data.student).some(k=>!['state','history','future','submitted','completed','checked'].includes(k))||typeof data.student.submitted!=='boolean'||typeof data.student.completed!=='boolean'||typeof data.student.checked!=='boolean'))return false;const problem=isSnapshot?data.problem:data;if(!problem||!validate(problem))return false;
     const nextCtx=LabKit.contexts[problem.topic];let instance;try{instance=buildPortable(problem);}catch{return false;}const initial=clone(instance.initial),upgrade=state=>problem.topic==='dijkstra'&&problem.mode==='table'&&state&&typeof state==='object'&&!Array.isArray(state)&&!Array.isArray(state.rows)&&Array.isArray(state.dist)?{...clone(initial),...clone(state),rows:clone(initial.rows)}:state;let student=isSnapshot?data.student?.state:initial;const history=Array.isArray(data.student?.history)?data.student.history.map(upgrade):data.student?.history,future=Array.isArray(data.student?.future)?data.student.future.map(upgrade):data.student?.future;if(isSnapshot)student=upgrade(student);
   if(!student||typeof student!=='object'||Array.isArray(student)||!stateShape(initial,student))return false;
     if(isSnapshot&&(!data.student||!Array.isArray(data.student.history)||!Array.isArray(data.student.future)||data.student.history.length>300||data.student.future.length>300))return false;
    try{stringify(student);stringify(data.student?.history??[]);stringify(data.student?.future??[]);}catch{return false;}
     if(isSnapshot&&[...history,...future].some(s=>!stateShape(initial,s)))return false;
   if((hasWork(current)||nextCtx!==current&&hasWork(nextCtx))&&!window.confirm('Replace the current exercise and its unsaved work with this imported challenge?'))return null;
   instance.cfg={...(instance.cfg||{}),mode:problem.mode,difficulty:problem.difficulty};
   const previous={mode:nextCtx.mode,p:nextCtx.p,s:nextCtx.s,history:nextCtx.history,future:nextCtx.future,rejected:nextCtx.rejected,revealed:nextCtx.revealed,solved:nextCtx.solved,submitted:nextCtx.submitted,lastResult:nextCtx.lastResult,snapshotCompleted:nextCtx.snapshotCompleted,difficulty:nextCtx.ui.diff.value},oldSection=document.querySelector('main>section:not([hidden])')?.id?.replace(/Section$/,'')||'home';
     try{showSection(problem.topic,true);nextCtx.mode=problem.mode;nextCtx.ui.diff.value=problem.difficulty;nextCtx.p=instance;nextCtx.s=clone(student);nextCtx.history=isSnapshot?clone(history):[];nextCtx.future=isSnapshot?clone(future):[];nextCtx.rejected=[];nextCtx.revealed=false;nextCtx.solved=false;nextCtx.submitted=!!(isSnapshot&&data.student.submitted);nextCtx.snapshotCompleted=!!(isSnapshot&&data.student.completed);nextCtx.lastResult=null;nextCtx.signatures.clear();nextCtx.ui.solution.hidden=true;nextCtx.ui.solution.open=false;nextCtx.ui.solutionBody.replaceChildren();nextCtx.render();nextCtx.msg('Challenge imported. Continue solving, then check your answer.');setStatus(status,'','');const fallback=nextCtx.ui.root?.querySelector('.q2-seed-fallback');if(fallback)fallback.hidden=true;return true;}
   catch{Object.assign(nextCtx,previous);nextCtx.ui.diff.value=previous.difficulty;showSection(oldSection,false);return false;}
 }
 async function paste(ctx,status,root,button){
  setStatus(status,'','');if(!navigator.clipboard?.readText){createFallback(root,button,ctx,status);return;}
  try{const text=await navigator.clipboard.readText();if(!text.trim()){setStatus(status,'Invalid Seed','error');return;}const result=importText(ctx,text,status);if(result===false)setStatus(status,'Invalid Seed','error');}
  catch{setStatus(status,'Clipboard unavailable; paste the code below.','error');createFallback(root,button,ctx,status);}
 }
 async function copy(ctx,status,button){
  let value;try{value=encode(ctx,true);}catch{setStatus(status,'Snapshot unavailable for this exercise mode.','error');return;}try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);setStatus(status,'Snapshot copied','success');setTimeout(()=>setStatus(status,'',''),1800);return;}}catch{}
  let field=ctx.ui.workspace.querySelector('.q2-copy-fallback');if(!field){field=document.createElement('textarea');field.className='q2-copy-fallback';field.readOnly=true;field.rows=3;field.setAttribute('aria-label','Snapshot code; select and copy');button.after(field);}field.value=value;field.focus({preventScroll:true});field.select();setStatus(status,'Clipboard unavailable; select and copy the code.','error');
 }
 function icon(kind){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');for(const [k,v]of Object.entries({viewBox:'0 0 24 24',width:18,height:18,fill:'none',stroke:'currentColor','stroke-width':2,'stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'}))svg.setAttribute(k,v);const paths=kind==='paste'?['M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2','M9 2h6a1 1 0 0 1 1 1v3H8V3a1 1 0 0 1 1-1Z','M12 11v7','m9 15 3 3 3-3']:['M8 8h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8Z','M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3'];for(const d of paths){const path=document.createElementNS(ns,'path');path.setAttribute('d',d);svg.append(path);}return svg;}
 function install(){for(const key of topics){const ctx=LabKit.contexts[key];if(!ctx||ctx.ui.exchangeInstalled)continue;ctx.ui.exchangeInstalled=true;const root=document.getElementById(key+'Section'),diff=ctx.ui.diff,settings=diff.closest('.nl-settings');if(!root||!settings)continue;ctx.ui.root=root;root.addEventListener('pointerdown',()=>root.querySelectorAll('.q2-exchange-status.error').forEach(n=>setStatus(n,'')));root.addEventListener('keydown',()=>root.querySelectorAll('.q2-exchange-status.error').forEach(n=>setStatus(n,'')));
   const paste=document.createElement('button');paste.type='button';paste.className='q2-clipboard-icon';paste.title='Paste Seed';paste.setAttribute('aria-label','Paste Seed');paste.append(icon('paste'));const pasteStatus=document.createElement('span');pasteStatus.setAttribute('aria-live','polite');pasteStatus.className='q2-exchange-status';diff.parentElement.append(paste,pasteStatus);paste.onclick=()=>pasteSeed(ctx,pasteStatus,root,paste);
   const bar=ctx.ui.workspace.querySelector('.bh-actions'),check=[...bar.children].find(b=>b.textContent.includes('Check Answer'));if(check){const copyButton=document.createElement('button');copyButton.type='button';copyButton.className='q2-clipboard-icon';copyButton.title='Copy Snapshot';copyButton.setAttribute('aria-label','Copy Snapshot');copyButton.append(icon('copy'));const status=document.createElement('span');status.className='q2-exchange-status';status.setAttribute('aria-live','polite');check.after(copyButton,status);copyButton.onclick=()=>copy(ctx,status,copyButton);}
  }}
 let pasteSeed;pasteSeed=paste;
  return{install,encode,importText,validate,makeProblem,buildPortable};
})();
const q2ExchangeStyle=document.createElement('style');q2ExchangeStyle.textContent='.q2-clipboard-icon{min-width:34px;height:32px;padding:2px 7px;border:1px solid #45564C;border-radius:7px;background:#2F2F2F;color:#A8B7AC;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;line-height:1}.q2-clipboard-icon:hover{background:#414141}.q2-clipboard-icon svg{display:block;flex:none}.q2-clipboard-icon:focus-visible{outline:3px solid #D0A65A;outline-offset:2px}.q2-exchange-status{font-size:12px;color:#A8B7AC;align-self:center}.q2-exchange-status.error{color:#D98578}.q2-exchange-status.success{color:#10A37F}.q2-seed-fallback{display:flex;gap:6px;align-items:start;margin:6px 0}.q2-seed-fallback textarea,.q2-copy-fallback{width:min(100%,680px);font:12px ui-monospace,monospace}.q2-copy-fallback{display:block;margin-top:6px}';document.head.append(q2ExchangeStyle);
const Q2Rules=(()=>{
 const labels={heap:'Leftist Heap Rules',binomial:'Binomial Tree Rules',binary:'Binary Heap Rules',dheap:'d-Heap Rules',insertion:'Insertion Sort Rules',merge:'Mergesort Rules',heapsort:'Heapsort Rules',quicksort:'Quicksort Rules',prim:'Prim Construction',topo:'Ordering and DAG Rules',dijkstra:'Dijkstra Rules',shortest:'Shortest-Path Rules',bounds:'Comparison Bound',external:'Tape Merge Rules',fundamentals:'Graph Properties',activity:'Activity Dependencies',flow:'Flow and Residual Rules',pert:'Event-Time Rules'};
 const formula=/(?:[ΘΩO]\([^)]*\)|NPL\([^)]*\)|Parent\([^)]*\)|E\([^)]*\)|L\([^)]*\)|ceil\([^)]*\)|N!|\|V\|\s*[−-]\s*1)/g;
 function item(text){const li=document.createElement('li');let last=0;for(const match of text.matchAll(formula)){li.append(document.createTextNode(text.slice(last,match.index)));const code=document.createElement('code');code.textContent=match[0];li.append(code);last=match.index+match[0].length;}li.append(document.createTextNode(text.slice(last)));return li;}
 function enhance(details){const topic=details.closest('main>section')?.id.replace(/Section$/,'');if(!topic||details.dataset.q2Structured)return;const text=[...details.children].slice(1).flatMap(node=>node.matches('ul,ol')?[...node.children].map(li=>li.textContent.trim()):node.matches('p')?node.textContent.trim().split(/(?<=\.)\s+(?=[A-Z0-9])/):[]).filter(Boolean);if(!text.length)return;const groups={algorithm:[],steps:[],complexity:[],exercise:[]};for(const line of text){const key=/\b(?:[ΘΩO]\(|complexity|\btime\b|\bspace\b|bound\b)/i.test(line)?'complexity':/\b(?:click|enter|record|undo|escape|editor|graded|grading|answer|submit|unanswered|format|question|practice|stage)\b/i.test(line)?'exercise':/^(?:Initially|Then|Finally|Repeatedly|Start|Move|Select|Choose|Merge|Exchange|Form|Reverse|BuildHeap|Insert|DeleteMin|Calculate|Relax|Enqueue|Stop|Process)\b/i.test(line)?'steps':'algorithm';groups[key].push(line);}
  const summary=details.querySelector('summary');details.replaceChildren(summary);for(const [key,heading,tag]of [['algorithm',labels[topic]||'Algorithm Rules','ul'],['steps','Algorithm Steps','ol'],['complexity','Complexity','ul'],['exercise','Using This Exercise','ul']]){if(!groups[key].length)continue;const section=document.createElement('section'),title=document.createElement('h3'),list=document.createElement(tag);section.className='q2-rule-group';title.textContent=heading;for(const line of groups[key])list.append(item(line));section.append(title,list);details.append(section);}details.dataset.q2Structured='true';}
 return{enhanceAll:()=>document.querySelectorAll('main>section details.rules').forEach(enhance)};
})();
Q2Rules.enhanceAll();
ChatGPTExchange.install();

 document.querySelectorAll('[data-section]').forEach(button=>button.onclick=()=>{showSection(button.dataset.section,true,button.dataset.sortMode);window.scrollTo({top:0,behavior:'smooth'});});
window.addEventListener('hashchange',()=>showSection(window.location.hash.slice(1),false));
showSection('home',false); // Restore the requested route after every page/controller has initialized.
ExpandedWindows.boot();
