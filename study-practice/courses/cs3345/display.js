/* Display-only repair of verified CP1252/UTF-8 mojibake plus mathematical typography. Stored data remains unchanged. */
(()=>{
 const scope=document.body;
  const literal='pre,code,script,style,textarea,input,select,option,.java-code-panel,[contenteditable]';
 const power=/\b([NVE2])\^(\([^()]+\)|[A-Za-z0-9]+)/g;
  function repairEncoding(text){return Q2Encoding.repair(text)}
 function notation(text){
  return text.replace(/\b(O|Theta|Omega)\s*\(([^()\n]*)\)/g,(_,name,inside)=>{
    const body=inside.replace(/\blog\s+squared\b/gi,'log\u00b2').replace(/\b([NVE])\s+squared\b/g,'$1\u00b2').replace(/\b([NVE])\s+cubed\b/g,'$1\u00b3');
    return (name==='Theta'?'\u0398':name==='Omega'?'\u03a9':name)+'('+body+')';
  });
 }
 function formatText(node){
  if(!node.parentElement||node.parentElement.closest(literal))return;
  const original=node.nodeValue,clean=repairEncoding(original),formatted=notation(clean);power.lastIndex=0;
  if(!power.test(formatted)){if(formatted!==original)node.nodeValue=formatted;return}
  power.lastIndex=0;const fragment=document.createDocumentFragment();let last=0,match;
  while((match=power.exec(formatted))){
   fragment.append(document.createTextNode(formatted.slice(last,match.index)+match[1]));
   const sup=document.createElement('sup');sup.textContent=match[2];fragment.append(sup);last=power.lastIndex;
  }
  fragment.append(document.createTextNode(formatted.slice(last)));node.replaceWith(fragment);
 }
 function scan(node){
  if(node.nodeType===Node.TEXT_NODE){if(node.parentElement?.closest('svg')){const clean=repairEncoding(node.nodeValue);if(clean!==node.nodeValue)node.nodeValue=clean}else formatText(node);return}
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  for(const name of ['aria-label','title','placeholder','alt']){const value=node.getAttribute(name);if(value!==null){const clean=repairEncoding(value);if(clean!==value)node.setAttribute(name,clean)}}
  if(node.matches(literal))return;
  for(const child of [...node.childNodes])scan(child);
 }
 window.q2FormatMathRoot=scan;
 scan(scope);
 new MutationObserver(changes=>{for(const change of changes){if(change.type==='characterData')scan(change.target);else for(const node of change.addedNodes)scan(node)}}).observe(scope,{subtree:true,childList:true,characterData:true});
})();
