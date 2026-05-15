(function(){try{
var sc=document.currentScript,k=sc&&sc.dataset&&sc.dataset.key;if(!k)return;
var bu=(sc.src||"").replace("/embed.js","");
var sid=sessionStorage.getItem("_of")||("owflex_"+Date.now()+"_"+Math.random().toString(36).slice(2,8));
sessionStorage.setItem("_of",sid);
var bn="Chat",pc="#0EA5E9",op=0,busy=0,started=0,lastMsg="";

fetch(bu+"/api/v1/widget-config?key="+k)
  .then(function(r){return r.json();})
  .then(function(c){bn=c.botName||bn;pc=c.primaryColor||pc;go();})
  .catch(go);

function go(){
var css=
":root{--ofp:"+pc+"}"+

/* ── Glow ring (separate z-layer, behind button) ── */
"#obg{position:fixed;bottom:14px;right:14px;width:74px;height:74px;border-radius:50%;background:var(--ofp);z-index:2147483644;opacity:.3;filter:blur(16px);pointer-events:none;animation:ofPulse 2.5s ease-in-out infinite}"+

/* ── Launch button ── */
"#ob{position:fixed;bottom:24px;right:24px;width:54px;height:54px;border-radius:50%;border:0;cursor:pointer;background:var(--ofp);z-index:2147483646;box-shadow:0 4px 20px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;overflow:hidden;animation:ofFloat 3s ease-in-out infinite;transition:transform .15s,box-shadow .15s}"+
"#ob:hover{animation:none;transform:scale(1.1);box-shadow:0 6px 28px rgba(0,0,0,.3)}"+

/* ── Button icons (swap with CSS) ── */
"#obI,.obX{position:absolute;transition:opacity .2s,transform .2s;display:flex;align-items:center;justify-content:center}"+
".obX{opacity:0;transform:rotate(-90deg) scale(.5)}"+

/* ── Chat panel ── */
"#oP{position:fixed;bottom:90px;right:20px;width:360px;max-width:calc(100vw - 24px);height:520px;max-height:calc(100vh - 110px);background:#fff;border-radius:18px;box-shadow:0 12px 48px rgba(0,0,0,.22),0 0 0 1px rgba(0,0,0,.07);display:flex;flex-direction:column;z-index:2147483645;font-family:system-ui,-apple-system,sans-serif;overflow:hidden;transform-origin:bottom right;transition:opacity .22s,transform .28s cubic-bezier(.34,1.56,.64,1)}"+
"#oP.h{opacity:0;transform:scale(0.88) translateY(16px);pointer-events:none}"+

/* ── Header ── */
"#oH{padding:14px 16px;background:var(--ofp);color:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}"+
"#oAv{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;flex-shrink:0;margin-right:10px;position:relative}"+
"#oDot{position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:#4ade80;border:2px solid var(--ofp);animation:ofBlink 2s ease-in-out infinite}"+
"#oHn{font-weight:600;font-size:14px;line-height:1.2}"+
"#oSt{font-size:11px;opacity:.8;margin-top:1px}"+
"#oC{background:0;border:0;color:rgba(255,255,255,.7);cursor:pointer;font-size:18px;padding:6px;line-height:1;border-radius:8px;transition:color .15s,background .15s;margin-left:6px;flex-shrink:0}"+
"#oC:hover{color:#fff;background:rgba(255,255,255,.18)}"+

/* ── Messages ── */
"#oM{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.1) transparent}"+

/* ── Bubbles ── */
".u,.b{max-width:82%;padding:9px 13px;border-radius:16px;font-size:13px;line-height:1.6;word-break:break-word;animation:ofIn .22s ease}"+
".u{align-self:flex-end;background:var(--ofp);color:#fff;border-bottom-right-radius:3px}"+
".b{align-self:flex-start;background:#f1f5f9;color:#1e293b;border-bottom-left-radius:3px}"+
".berr{background:#fef2f2;color:#dc2626}"+
".ok{font-size:11px;color:#10b981;text-align:center;padding:4px 0}"+

/* ── Input row ── */
"#oF{padding:10px 12px;border-top:1px solid #f0f0f0;display:flex;gap:8px;align-items:center;flex-shrink:0;background:#fafafa}"+
"#oI{flex:1;border:1.5px solid #e5e7eb;border-radius:22px;padding:9px 14px;font-size:13px;outline:0;transition:border-color .15s,box-shadow .15s;font-family:inherit;background:#fff;color:#111}"+
"#oI:focus{border-color:var(--ofp);box-shadow:0 0 0 3px rgba(0,0,0,.07)}"+
"#oI:disabled{background:#f3f4f6;color:#9ca3af}"+
"#oI::placeholder{color:#9ca3af}"+
"#oS{width:40px;height:40px;flex-shrink:0;border:0;border-radius:50%;background:var(--ofp);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s,transform .12s;box-shadow:0 2px 8px rgba(0,0,0,.15)}"+
"#oS:hover{transform:scale(1.1)}"+
"#oS:disabled{opacity:.4;cursor:default;transform:none}"+

/* ── Keyframes ── */
"@keyframes ofFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}"+
"@keyframes ofPulse{0%,100%{transform:scale(1);opacity:.28}50%{transform:scale(1.75);opacity:.1}}"+
"@keyframes ofBlink{0%,100%{opacity:1}50%{opacity:.4}}"+
"@keyframes ofIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}"+
"@keyframes ofDot{0%,80%,100%{transform:scale(.55);opacity:.35}40%{transform:scale(1);opacity:1}}"+
".od{display:inline-block;width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:ofDot 1.3s infinite ease-in-out}";

document.head.insertAdjacentHTML("beforeend","<style>"+css+"</style>");

/* Glow ring */
var glow=document.createElement("div");glow.id="obg";document.body.appendChild(glow);

/* Launch button with morphing icons */
var btn=document.createElement("button");btn.id="ob";btn.setAttribute("aria-label","Open chat");
btn.innerHTML=
  '<span id="obI">'+
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'+
  '</span>'+
  '<span class="obX" id="obX">'+
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'+
  '</span>';
document.body.appendChild(btn);

/* Chat panel */
var pnl=document.createElement("div");pnl.id="oP";pnl.className="h";pnl.setAttribute("role","dialog");
var initial=esc(bn).charAt(0).toUpperCase()||"?";
pnl.innerHTML=
  '<div id="oH">'+
    '<div style="display:flex;align-items:center;flex:1;min-width:0">'+
      '<div id="oAv">'+initial+'<span id="oDot"></span></div>'+
      '<div style="min-width:0">'+
        '<div id="oHn">'+esc(bn)+'</div>'+
        '<div id="oSt">Online</div>'+
      '</div>'+
    '</div>'+
    '<button id="oC" aria-label="Close chat">&#x2715;</button>'+
  '</div>'+
  '<div id="oM" role="log" aria-live="polite"></div>'+
  '<div id="oF">'+
    '<input id="oI" type="text" placeholder="Type a message…" autocomplete="off" aria-label="Message input">'+
    '<button id="oS" aria-label="Send message">'+
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'+
    '</button>'+
  '</div>';
document.body.appendChild(pnl);

var ms=document.getElementById("oM"),
    inp=document.getElementById("oI"),
    sb=document.getElementById("oS"),
    stEl=document.getElementById("oSt"),
    dotEl=document.getElementById("oDot"),
    icChat=document.getElementById("obI"),
    icX=document.getElementById("obX");

function setStatus(text,thinking){
  stEl.textContent=text;
  dotEl.style.background=thinking?"#f59e0b":"#4ade80";
}

function openPanel(){
  op=1;
  pnl.classList.remove("h");
  /* Morphing: show X, hide chat icon */
  icChat.style.cssText="opacity:0;transform:rotate(90deg) scale(.5)";
  icX.style.cssText="opacity:1;transform:none";
  /* Pause float + hide glow */
  btn.style.animation="none";
  glow.style.animationPlayState="paused";glow.style.opacity="0";
  if(!started){started=1;addBot("Hi! How can I help you today?");}
  setTimeout(function(){inp.focus();},60);
}

function closePanel(){
  op=0;
  pnl.classList.add("h");
  /* Morphing: show chat icon, hide X */
  icChat.style.cssText="opacity:1;transform:none";
  icX.style.cssText="opacity:0;transform:rotate(-90deg) scale(.5)";
  /* Resume float + glow */
  btn.style.animation="ofFloat 3s ease-in-out infinite";
  glow.style.animationPlayState="";glow.style.opacity="";
}

btn.onclick=function(){op?closePanel():openPanel();};
document.getElementById("oC").onclick=closePanel;

function addMsg(t,u){
  var d=document.createElement("div");d.className=u?"u":"b";
  d.textContent=t;ms.appendChild(d);
  ms.scrollTop=ms.scrollHeight;
  return d;
}
function addBot(t){return addMsg(t,0);}

function showTyping(){
  var d=document.createElement("div");d.id="oT";d.className="b";
  d.style.padding="11px 14px";
  d.innerHTML='<span style="display:inline-flex;gap:4px;align-items:center">'+
    '<span class="od"></span>'+
    '<span class="od" style="animation-delay:.22s"></span>'+
    '<span class="od" style="animation-delay:.44s"></span>'+
  '</span>';
  ms.appendChild(d);ms.scrollTop=ms.scrollHeight;
}
function hideTyping(){var t=document.getElementById("oT");if(t)t.remove();}

function lock(v){
  busy=v;sb.disabled=inp.disabled=v;
  setStatus(v?"Thinking…":"Online",v);
}

function captureLead(text){
  var m=text.match(/\[LEAD:(\{[\s\S]*?\})\]/);
  if(!m)return text;
  var cleaned=text.replace(/\n?\[LEAD:[\s\S]*?\]/,"").trim();
  try{
    var d=JSON.parse(m[1]);
    if(d.name||d.email||d.phone){
      fetch(bu+"/api/v1/leads",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({embedKey:k,sessionId:sid,name:d.name||null,email:d.email||null,phone:d.phone||null,notes:d.notes||null})})
      .then(function(r){
        var el=document.createElement("div");el.className="ok";
        if(r.ok){el.textContent="✓ Details saved";}
        else{
          r.json().then(function(j){console.error("[owflex:leads]",r.status,j);}).catch(function(){});
          el.textContent="⚠ Could not save your details ("+r.status+")";el.style.color="#ef4444";
        }
        ms.appendChild(el);ms.scrollTop=ms.scrollHeight;
      })
      .catch(function(e){
        console.error("[owflex:leads] fetch failed:",e);
        var el=document.createElement("div");el.className="ok";el.style.color="#ef4444";
        el.textContent="⚠ Could not save your details (network error)";
        ms.appendChild(el);ms.scrollTop=ms.scrollHeight;
      });
    }
  }catch(e){}
  return cleaned;
}

function showErr(){
  hideTyping();
  var wrap=document.createElement("div");wrap.className="b berr";
  var txt=document.createTextNode("Something went wrong. ");
  var rbtn=document.createElement("button");
  rbtn.textContent="↻ Retry";
  rbtn.style.cssText="color:var(--ofp);background:none;border:none;cursor:pointer;font-size:12px;padding:0;font-weight:600";
  rbtn.onclick=function(){wrap.remove();if(lastMsg)sendMsg(lastMsg);};
  wrap.appendChild(txt);wrap.appendChild(rbtn);
  ms.appendChild(wrap);ms.scrollTop=ms.scrollHeight;
  lock(0);inp.focus();
}

function sendMsg(t){
  lastMsg=t;lock(1);showTyping();
  fetch(bu+"/api/v1/chat",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({embedKey:k,sessionId:sid,message:t,pageUrl:location.href})})
  .then(function(r){return r.json();})
  .then(function(d){hideTyping();if(d.reply)addBot(captureLead(d.reply));lock(0);inp.focus();})
  .catch(showErr);
}

function send(){
  if(busy)return;
  var t=inp.value.trim();if(!t)return;
  inp.value="";addMsg(t,1);sendMsg(t);
}
sb.onclick=send;
inp.onkeydown=function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};
}

window.addEventListener("owflex:lead",function(e){
  try{fetch(bu+"/api/v1/leads",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(Object.assign({embedKey:k,sessionId:sid},e.detail||{}))});}catch(e){}
});
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
}catch(e){}})();
