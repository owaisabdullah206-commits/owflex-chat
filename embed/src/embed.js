(function(){try{
var sc=document.currentScript,k=sc&&sc.dataset&&sc.dataset.key;if(!k)return;
var bu=(sc.src||"").replace("/embed.js","");
var sid=sessionStorage.getItem("_of")||("owflex_"+Date.now()+"_"+Math.random().toString(36).slice(2,8));
sessionStorage.setItem("_of",sid);
var bn="Chat",pc="#0EA5E9",op=0;
fetch(bu+"/api/v1/widget-config?key="+k).then(function(r){return r.json();}).then(function(c){bn=c.botName||bn;pc=c.primaryColor||pc;go();}).catch(go);
function go(){
document.head.insertAdjacentHTML("beforeend","<style>:root{--ofp:"+pc+"}#ob{position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;border:0;cursor:pointer;background:var(--ofp);z-index:2147483646;box-shadow:0 4px 12px rgba(0,0,0,.3)}#oP{position:fixed;bottom:88px;right:24px;width:320px;height:480px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.18);display:flex;flex-direction:column;z-index:2147483645;font-family:system-ui,sans-serif;overflow:hidden}#oP.h{display:none}#oH{padding:12px 16px;background:var(--ofp);color:#fff;display:flex;align-items:center;justify-content:space-between;font-weight:600;font-size:14px}#oC{background:0;border:0;color:#fff;cursor:pointer;font-size:20px;padding:0}#oM{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}#oF{padding:8px 10px;border-top:1px solid #e2e8f0;display:flex;gap:8px}#oI{flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:13px;outline:0}#oS{border:0;border-radius:8px;background:var(--ofp);color:#fff;cursor:pointer;font-size:13px;padding:0 14px;font-weight:500}#oS:disabled{opacity:.5}.u,.b{max-width:80%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.5;word-break:break-word}.u{align-self:flex-end;background:var(--ofp);color:#fff}.b{align-self:flex-start;background:#f1f5f9;color:#1e293b}</style>");
var btn=document.createElement("button");btn.id="ob";btn.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
document.body.appendChild(btn);
var pnl=document.createElement("div");pnl.id="oP";pnl.className="h";
pnl.innerHTML='<div id="oH">'+esc(bn)+'<button id="oC">&#x2715;</button></div><div id="oM"></div><div id="oF"><input id="oI" type="text" placeholder="Type a message…" autocomplete="off"><button id="oS">Send</button></div>';
document.body.appendChild(pnl);
var ms=document.getElementById("oM"),inp=document.getElementById("oI"),sb=document.getElementById("oS");
btn.onclick=function(){op=!op;pnl.classList.toggle("h",!op);if(op)inp.focus();};
document.getElementById("oC").onclick=function(){op=0;pnl.classList.add("h");};
function add(t,u){var d=document.createElement("div");d.className=u?"u":"b";d.textContent=t;ms.appendChild(d);ms.scrollTop=ms.scrollHeight;}
function snd(){var t=inp.value.trim();if(!t)return;inp.value="";sb.disabled=1;add(t,1);fetch(bu+"/api/v1/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({embedKey:k,sessionId:sid,message:t,pageUrl:location.href})}).then(function(r){return r.json();}).then(function(d){if(d.reply)add(d.reply,0);}).catch(function(){add("Sorry, something went wrong.",0);}).finally(function(){sb.disabled=0;inp.focus();});}
sb.onclick=snd;inp.onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();snd();}};
}
window.addEventListener("owflex:lead",function(e){try{fetch(bu+"/api/v1/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({embedKey:k,sessionId:sid},e.detail||{}))});}catch(e){}});
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
}catch(e){}})();
