(function(){try{
var sc=document.currentScript,k=sc&&sc.dataset&&sc.dataset.key;if(!k)return;
var bu=(sc.src||"").replace("/embed.js","");
var sid=sessionStorage.getItem("_of")||("owflex_"+Date.now()+"_"+Math.random().toString(36).slice(2,8));
sessionStorage.setItem("_of",sid);
var bn="Chat",pc="#0EA5E9",op=0,busy=0,started=0;
fetch(bu+"/api/v1/widget-config?key="+k).then(function(r){return r.json();}).then(function(c){bn=c.botName||bn;pc=c.primaryColor||pc;go();}).catch(go);
function go(){
var css=
":root{--ofp:"+pc+"}"+
"#ob{position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;border:0;cursor:pointer;background:var(--ofp);z-index:2147483646;box-shadow:0 4px 16px rgba(0,0,0,.28);transition:transform .15s,box-shadow .15s}"+
"#ob:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(0,0,0,.32)}"+
"#oP{position:fixed;bottom:88px;right:24px;width:340px;max-width:calc(100vw - 32px);height:500px;max-height:calc(100vh - 112px);background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.18);display:flex;flex-direction:column;z-index:2147483645;font-family:system-ui,-apple-system,sans-serif;overflow:hidden}"+
"#oP.h{display:none}"+
"#oH{padding:12px 16px;background:var(--ofp);color:#fff;display:flex;align-items:center;justify-content:space-between;font-weight:600;font-size:14px;flex-shrink:0}"+
"#oC{background:0;border:0;color:rgba(255,255,255,.8);cursor:pointer;font-size:20px;padding:0;line-height:1;transition:color .1s}"+
"#oC:hover{color:#fff}"+
"#oM{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;scroll-behavior:smooth}"+
"#oF{padding:8px 10px;border-top:1px solid #e2e8f0;display:flex;gap:8px;align-items:center;flex-shrink:0}"+
"#oI{flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:13px;outline:0;transition:border-color .15s;font-family:inherit}"+
"#oI:focus{border-color:var(--ofp)}"+
"#oI:disabled{background:#f8fafc;color:#94a3b8}"+
"#oS{border:0;border-radius:8px;background:var(--ofp);color:#fff;cursor:pointer;font-size:13px;padding:0 14px;height:36px;font-weight:500;white-space:nowrap;transition:opacity .15s}"+
"#oS:disabled{opacity:.4;cursor:default}"+
".u,.b{max-width:82%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.55;word-break:break-word;animation:ofa .18s ease}"+
".u{align-self:flex-end;background:var(--ofp);color:#fff;border-bottom-right-radius:3px}"+
".b{align-self:flex-start;background:#f1f5f9;color:#1e293b;border-bottom-left-radius:3px}"+
".ok{font-size:11px;color:#10b981;text-align:center;padding:3px 0;opacity:.85}"+
"@keyframes ofa{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}"+
"@keyframes ofb{0%,80%,100%{transform:scale(.55);opacity:.35}40%{transform:scale(1);opacity:1}}"+
".od{display:inline-block;width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:ofb 1.3s infinite ease-in-out}";
document.head.insertAdjacentHTML("beforeend","<style>"+css+"</style>");

var btn=document.createElement("button");btn.id="ob";btn.setAttribute("aria-label","Open chat");
btn.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
document.body.appendChild(btn);

var pnl=document.createElement("div");pnl.id="oP";pnl.className="h";pnl.setAttribute("role","dialog");pnl.setAttribute("aria-label",esc(bn)+" chat");
pnl.innerHTML='<div id="oH"><span>'+esc(bn)+'</span><button id="oC" aria-label="Close chat">&#x2715;</button></div><div id="oM" role="log" aria-live="polite"></div><div id="oF"><input id="oI" type="text" placeholder="Type a message…" autocomplete="off" aria-label="Message input"><button id="oS">Send</button></div>';
document.body.appendChild(pnl);

var ms=document.getElementById("oM"),inp=document.getElementById("oI"),sb=document.getElementById("oS");

btn.onclick=function(){
  op=!op;pnl.classList.toggle("h",!op);
  if(op){if(!started){started=1;addMsg("Hi! How can I help you today?",0);}inp.focus();}
};
document.getElementById("oC").onclick=function(){op=0;pnl.classList.add("h");};

function addMsg(t,u){
  var d=document.createElement("div");d.className=u?"u":"b";d.textContent=t;
  ms.appendChild(d);ms.scrollTop=ms.scrollHeight;return d;
}

function showTyping(){
  var d=document.createElement("div");d.id="oT";d.className="b";
  d.style.cssText="padding:10px 14px";
  d.innerHTML='<span style="display:inline-flex;gap:4px;align-items:center"><span class="od"></span><span class="od" style="animation-delay:.22s"></span><span class="od" style="animation-delay:.44s"></span></span>';
  ms.appendChild(d);ms.scrollTop=ms.scrollHeight;
}
function hideTyping(){var t=document.getElementById("oT");if(t)t.remove();}
function lock(v){busy=v;sb.disabled=inp.disabled=v;}

function captureLead(text){
  var m=text.match(/\[LEAD:(\{[\s\S]*?\})\]/);
  if(!m)return text;
  try{
    var d=JSON.parse(m[1]);
    if(d.name||d.email||d.phone){
      fetch(bu+"/api/v1/leads",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({embedKey:k,sessionId:sid,name:d.name||null,email:d.email||null,phone:d.phone||null,notes:d.notes||null})
      });
      var ok=document.createElement("div");ok.className="ok";ok.textContent="✓ Details saved";ms.appendChild(ok);
      ms.scrollTop=ms.scrollHeight;
    }
  }catch(e){}
  return text.replace(/\n?\[LEAD:[\s\S]*?\]/,"").trim();
}

function send(){
  if(busy)return;
  var t=inp.value.trim();if(!t)return;
  inp.value="";lock(1);addMsg(t,1);showTyping();
  fetch(bu+"/api/v1/chat",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({embedKey:k,sessionId:sid,message:t,pageUrl:location.href})
  })
  .then(function(r){return r.json();})
  .then(function(d){hideTyping();if(d.reply)addMsg(captureLead(d.reply),0);})
  .catch(function(){hideTyping();addMsg("Sorry, something went wrong. Please try again.",0);})
  .finally(function(){lock(0);inp.focus();});
}
sb.onclick=send;
inp.onkeydown=function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};
}
window.addEventListener("owflex:lead",function(e){
  try{fetch(bu+"/api/v1/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({embedKey:k,sessionId:sid},e.detail||{}))});}catch(e){}
});
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
}catch(e){}})();
