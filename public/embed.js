(function(){try{
var sc=document.currentScript,k=sc&&sc.dataset&&sc.dataset.key;if(!k)return;
var bu=sc.src?new URL(sc.src).origin:"";
var sid=sessionStorage.getItem("_of")||("octively_"+Date.now()+"_"+Math.random().toString(36).slice(2,8));
sessionStorage.setItem("_of",sid);
var bn="Chat",pc="#0EA5E9",wm="Hi! How can I help you today?",lc=true,pos="bottom-right";
var ti="message-circle",br=16,te=false,tms=[];
var be=false,bt="Powered by Octively",burl="https://octively.com";
var clb=false;
var op=0,busy=0,started=0,lastMsg="";

/* ── Icon SVG paths (exact Lucide v1.16.0) ── */
var ICONS={
  "message-circle":'<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
  "bot":'<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  "help-circle":'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  "headphones":'<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  "sparkles":'<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  "zap":'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  "message-square":'<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
  "smile":'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
};
function iconSvg(id,size,sw){
  var p=ICONS[id]||ICONS["message-circle"];
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
}

fetch(bu+"/api/v1/widget-config?key="+k)
  .then(function(r){return r.json();})
  .then(function(c){
    bn=c.botName||bn;pc=c.primaryColor||pc;
    wm=c.welcomeMessage||wm;lc=c.leadCaptureEnabled!==false;clb=c.collectLeadBefore===true;
    pos=c.position||pos;
    ti=c.triggerIcon||ti;
    br=typeof c.borderRadius==="number"?c.borderRadius:br;
    te=c.tooltipEnabled===true;
    tms=Array.isArray(c.tooltipMessages)&&c.tooltipMessages.length?c.tooltipMessages:tms;
    be=c.brandingEnabled===true;
    if(c.brandingText)bt=c.brandingText;
    if(c.brandingUrl)burl=c.brandingUrl;
    go();
  })
  .catch(go);

function go(){
if(!document.body){document.addEventListener("DOMContentLoaded",go);return;}
var isLeft=pos==="bottom-left";
var side=isLeft?"left":"right";
var opp=isLeft?"right":"left";
var msgBr=Math.max(4,br)+"px";
var css=
":root{--ofp:"+pc+"}"+

/* ── Glow ring ── */
"#obg{position:fixed;bottom:14px;"+side+":14px;"+opp+":auto;width:74px;height:74px;border-radius:50%;background:var(--ofp);z-index:2147483644;opacity:.3;filter:blur(16px);pointer-events:none;animation:ofPulse 2.5s ease-in-out infinite}"+

/* ── Launch button ── */
"#ob{position:fixed;bottom:24px;"+side+":24px;"+opp+":auto;width:54px;height:54px;border-radius:50%;border:0;cursor:pointer;background:var(--ofp);z-index:2147483646;box-shadow:0 4px 20px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;overflow:hidden;animation:ofFloat 3s ease-in-out infinite;transition:transform .15s,box-shadow .15s}"+
"#ob:hover{animation:none;transform:scale(1.1);box-shadow:0 6px 28px rgba(0,0,0,.3)}"+

/* ── Button icons ── */
"#obI,.obX{position:absolute;transition:opacity .2s,transform .2s;display:flex;align-items:center;justify-content:center}"+
".obX{opacity:0;transform:rotate(-90deg) scale(.5)}"+

/* ── Chat panel ── */
"#oP{position:fixed;bottom:90px;"+side+":20px;"+opp+":auto;width:360px;max-width:calc(100vw - 24px);height:520px;max-height:calc(100vh - 110px);background:#fff;border-radius:"+br+"px;box-shadow:0 12px 48px rgba(0,0,0,.22),0 0 0 1px rgba(0,0,0,.07);display:flex;flex-direction:column;z-index:2147483645;font-family:system-ui,-apple-system,sans-serif;overflow:hidden;transform-origin:bottom "+side+";transition:opacity .22s,transform .28s cubic-bezier(.34,1.56,.64,1)}"+
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
".u,.b{max-width:82%;padding:9px 13px;border-radius:"+msgBr+";font-size:13px;line-height:1.6;word-break:break-word;animation:ofIn .22s ease}"+
".u{align-self:flex-end;background:var(--ofp);color:#fff;border-bottom-right-radius:3px}"+
".b{align-self:flex-start;background:#f1f5f9;color:#1e293b;border-bottom-left-radius:3px}"+
".berr{background:#fef2f2;color:#dc2626}"+
".ok{font-size:11px;color:#10b981;text-align:center;padding:4px 0}"+

/* ── Input row ── */
"#oF{padding:10px 12px;border-top:1px solid #f0f0f0;display:flex!important;flex-direction:row!important;gap:8px;align-items:center!important;flex-shrink:0;background:#fafafa;flex-wrap:nowrap!important}"+
"#oI{flex:1!important;border:1.5px solid #e5e7eb!important;border-radius:"+Math.max(4,br)+"px;height:40px!important;min-height:40px!important;max-height:40px!important;padding:0 14px!important;font-size:13px;outline:0!important;transition:border-color .15s,box-shadow .15s;font-family:inherit;background:#fff!important;color:#111!important;box-sizing:border-box!important;display:block!important;vertical-align:middle!important;margin:0!important;line-height:normal!important}"+
"#oI:focus{border-color:var(--ofp)!important;box-shadow:0 0 0 3px rgba(14,165,233,.15)!important}"+
"#oI:disabled{background:#f3f4f6!important;color:#9ca3af!important}"+
"#oI::placeholder{color:#9ca3af}"+
"#oS{width:40px!important;height:40px!important;flex-shrink:0!important;border:0!important;border-radius:50%!important;background:var(--ofp)!important;color:#fff!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;transition:opacity .15s,transform .12s;box-shadow:0 2px 8px rgba(0,0,0,.15);padding:0!important;margin:0!important;vertical-align:middle!important;line-height:1!important;font-size:0!important}"+
"#oS:hover{transform:scale(1.1)}"+
"#oS:disabled{opacity:.4!important;cursor:default!important;transform:none!important}"+

/* ── Branding — stylesheet base layer ── */
"#oB{display:flex!important;align-items:center!important;justify-content:center!important;padding:4px 0!important;font-size:10px!important;border-top:1px solid #f0f0f0!important;background:#fafafa!important;flex-shrink:0!important;opacity:0.5!important;visibility:visible!important;height:auto!important;max-height:none!important;overflow:visible!important;clip:auto!important;clip-path:none!important;transform:none!important;filter:none!important;position:relative!important;z-index:0!important;color:inherit!important;letter-spacing:normal!important;text-indent:0!important;margin:0!important;pointer-events:auto!important;content-visibility:visible!important}"+
"#oB a{color:inherit!important;text-decoration:none!important;pointer-events:auto!important;visibility:visible!important;opacity:1!important}"+

/* ── Tooltip ── */
(te?"#oTip{position:fixed;bottom:32px;"+side+":88px;"+opp+":auto;background:#fff;color:#1e293b;border:1px solid #e5e7eb;padding:8px 13px;border-radius:20px;font-size:12px;line-height:1.4;box-shadow:0 2px 12px rgba(0,0,0,.12);max-width:220px;white-space:nowrap;z-index:2147483645;animation:ofIn .3s ease;pointer-events:none}":"")+

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
  '<span id="obI">'+iconSvg(ti,22,2.3)+'</span>'+
  '<span class="obX" id="obX">'+
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'+
  '</span>';
document.body.appendChild(btn);

/* Tooltip */
var tipEl=null,tipIdx=0;
if(te&&tms.length){
  tipEl=document.createElement("div");tipEl.id="oTip";
  tipEl.textContent=tms[0];
  document.body.appendChild(tipEl);
  if(tms.length>1){
    setInterval(function(){
      tipIdx=(tipIdx+1)%tms.length;
      tipEl.textContent=tms[tipIdx];
    },4000);
  }
}

/* Chat panel */
var pnl=document.createElement("div");pnl.id="oP";pnl.className="h";pnl.setAttribute("role","dialog");
pnl.innerHTML=
  '<div id="oH">'+
    '<div style="display:flex;align-items:center;flex:1;min-width:0">'+
      '<div id="oAv">'+iconSvg(ti,18,2)+'<span id="oDot"></span></div>'+
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
  '</div>'+
  (be?'<div id="oB"><a href="'+esc(burl)+'" target="_blank" rel="noopener">'+esc(bt)+'</a></div>':'');
document.body.appendChild(pnl);

/* ── Branding protection: exhaustive inline !important + MutationObserver ──
   Covers every CSS technique that can hide an element:
   display · visibility · opacity · transform · filter · clip · clip-path ·
   height · max-height · font-size · color · text-indent · letter-spacing ·
   position offset · z-index · content-visibility + hidden HTML attribute */
if(be){
  var brandEl=document.getElementById("oB");
  if(brandEl){
    var BS=
      "display:flex!important;"+
      "visibility:visible!important;"+
      "opacity:0.5!important;"+
      "height:auto!important;"+
      "min-height:0!important;"+
      "max-height:none!important;"+
      "width:auto!important;"+
      "max-width:100%!important;"+
      "overflow:visible!important;"+
      "clip:auto!important;"+
      "clip-path:none!important;"+
      "transform:none!important;"+
      "filter:none!important;"+
      "position:relative!important;"+
      "top:auto!important;"+
      "left:auto!important;"+
      "right:auto!important;"+
      "bottom:auto!important;"+
      "z-index:0!important;"+
      "font-size:10px!important;"+
      "line-height:1.4!important;"+
      "letter-spacing:normal!important;"+
      "text-indent:0!important;"+
      "color:inherit!important;"+
      "background:#fafafa!important;"+
      "border-top:1px solid #f0f0f0!important;"+
      "padding:4px 0!important;"+
      "margin:0!important;"+
      "flex-shrink:0!important;"+
      "align-items:center!important;"+
      "justify-content:center!important;"+
      "pointer-events:auto!important;"+
      "content-visibility:visible!important";
    var BLS=
      "display:inline-flex!important;"+
      "align-items:center!important;"+
      "gap:4px!important;"+
      "visibility:visible!important;"+
      "opacity:1!important;"+
      "color:inherit!important;"+
      "text-decoration:none!important;"+
      "font-size:inherit!important;"+
      "line-height:inherit!important;"+
      "letter-spacing:normal!important;"+
      "text-indent:0!important;"+
      "transform:none!important;"+
      "filter:none!important;"+
      "clip:auto!important;"+
      "clip-path:none!important;"+
      "height:auto!important;"+
      "overflow:visible!important;"+
      "pointer-events:auto!important;"+
      "position:static!important";
    function applyBS(){
      if(brandEl.hidden)brandEl.hidden=false;
      brandEl.setAttribute("style",BS);
      var lnk=brandEl.querySelector("a");
      if(lnk)lnk.setAttribute("style",BLS);
    }
    applyBS();
    new MutationObserver(function(muts){
      for(var i=0;i<muts.length;i++){
        var m=muts[i];
        if(m.type==="childList"){
          for(var j=0;j<m.removedNodes.length;j++){
            if(m.removedNodes[j]===brandEl){
              pnl.appendChild(brandEl);
              applyBS();
              break;
            }
          }
        }
        if(m.type==="attributes"&&m.target===brandEl){applyBS();}
      }
    }).observe(pnl,{childList:true,subtree:false,attributes:true,attributeFilter:["style","class","hidden","data-v"]});
  }
}

var ms=document.getElementById("oM"),
    inp=document.getElementById("oI"),
    sb=document.getElementById("oS"),
    stEl=document.getElementById("oSt"),
    dotEl=document.getElementById("oDot"),
    icChat=document.getElementById("obI"),
    icX=document.getElementById("obX");

// Hide input row + disable controls while lead form is pending
// Must use setProperty("important") to beat display:flex!important in the stylesheet
if(clb&&!sessionStorage.getItem("_ofl")){
  var _oFEl=document.getElementById("oF");
  if(_oFEl)_oFEl.style.setProperty("display","none","important");
  if(inp)inp.disabled=true;
  if(sb)sb.disabled=true;
}

function setStatus(text,thinking){
  stEl.textContent=text;
  dotEl.style.background=thinking?"#f59e0b":"#4ade80";
}

function showLeadForm(){
  var oFEl=document.getElementById("oF");
  if(oFEl)oFEl.style.setProperty("display","none","important");
  if(document.getElementById("oLF"))return;
  var frm=document.createElement("div");frm.id="oLF";
  frm.style.cssText="padding:16px;display:flex;flex-direction:column;gap:12px;overflow-y:auto";
  var iSt="border:1.5px solid #e5e7eb;border-radius:8px;height:38px;padding:0 12px;font-size:13px;outline:none;font-family:inherit;color:#111;background:#fff;box-sizing:border-box;width:100%;transition:border-color .15s";
  frm.innerHTML=
    '<p style="font-size:13px;color:#374151;font-weight:600;margin:0">Before we start</p>'+
    '<p style="font-size:12px;color:#6b7280;margin:0">Share your details so we can follow up if needed.</p>'+
    '<div style="display:flex;flex-direction:column;gap:4px">'+
      '<label style="font-size:11px;color:#6b7280;font-weight:500">Name <span style="color:#ef4444">*</span></label>'+
      '<input id="oLFn" type="text" placeholder="Your name" style="'+iSt+'">'+
    '</div>'+
    '<div style="display:flex;flex-direction:column;gap:4px">'+
      '<label style="font-size:11px;color:#6b7280;font-weight:500">Email <span style="color:#ef4444">*</span></label>'+
      '<input id="oLFe" type="email" placeholder="you@example.com" style="'+iSt+'">'+
    '</div>'+
    '<div style="display:flex;flex-direction:column;gap:4px">'+
      '<label style="font-size:11px;color:#6b7280;font-weight:500">Phone <span style="color:#6b7280;font-size:10px">(optional)</span></label>'+
      '<input id="oLFp" type="tel" placeholder="+1 (555) 000-0000" style="'+iSt+'">'+
    '</div>'+
    '<div id="oLFerr" style="display:none;font-size:11px;color:#ef4444"></div>'+
    '<button id="oLFs" style="height:40px;background:var(--ofp);color:#fff;border:0;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Start chatting →</button>';
  ms.appendChild(frm);
  var nI=document.getElementById("oLFn"),eI=document.getElementById("oLFe"),phI=document.getElementById("oLFp");
  var errEl=document.getElementById("oLFerr"),sb2=document.getElementById("oLFs");
  sb2.onclick=function(){
    var nm=nI.value.trim(),em=eI.value.trim(),ph=phI.value.trim();
    if(!nm){errEl.textContent="Name is required.";errEl.style.display="block";nI.focus();return;}
    if(!em||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){errEl.textContent="A valid email is required.";errEl.style.display="block";eI.focus();return;}
    errEl.style.display="none";sb2.disabled=true;sb2.style.opacity="0.6";sb2.textContent="Submitting…";
    var pl={embedKey:k,sessionId:sid,name:nm,email:em};if(ph)pl.phone=ph;
    fetch(bu+"/api/v1/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pl)})
    .then(function(r){
      if(r.ok){
        sessionStorage.setItem("_ofl","1");
        frm.remove();
        var oFEl2=document.getElementById("oF");if(oFEl2)oFEl2.style.removeProperty("display");
        inp.disabled=false;sb.disabled=false;
        if(!started){started=1;addBot(wm);}
        setTimeout(function(){inp.focus();},60);
      }else{
        r.json().then(function(j){errEl.textContent=j.error||"Something went wrong.";errEl.style.display="block";}).catch(function(){errEl.textContent="Something went wrong.";errEl.style.display="block";});
        sb2.disabled=false;sb2.style.opacity="1";sb2.textContent="Start chatting →";
      }
    })
    .catch(function(){errEl.textContent="Network error. Please try again.";errEl.style.display="block";sb2.disabled=false;sb2.style.opacity="1";sb2.textContent="Start chatting →";});
  };
}

function openPanel(){
  op=1;
  pnl.classList.remove("h");
  icChat.style.cssText="opacity:0;transform:rotate(90deg) scale(.5)";
  icX.style.cssText="opacity:1;transform:none";
  btn.style.animation="none";
  glow.style.animationPlayState="paused";glow.style.opacity="0";
  if(tipEl)tipEl.style.display="none";
  if(clb&&!sessionStorage.getItem("_ofl")){
    showLeadForm();
  }else{
    if(!started){started=1;addBot(wm);}
    setTimeout(function(){inp.focus();},60);
  }
}

function closePanel(){
  op=0;
  pnl.classList.add("h");
  icChat.style.cssText="opacity:1;transform:none";
  icX.style.cssText="opacity:0;transform:rotate(-90deg) scale(.5)";
  btn.style.animation="ofFloat 3s ease-in-out infinite";
  glow.style.animationPlayState="";glow.style.opacity="";
  if(tipEl)tipEl.style.display="";
}

btn.onclick=function(){op?closePanel():openPanel();};
document.getElementById("oC").onclick=closePanel;

function renderMd(raw){
  var s=esc(raw);
  s=s.replace(/`([^`\n]+)`/g,'<code style="background:#e2e8f0;border-radius:3px;padding:1px 5px;font-size:11px;font-family:monospace">$1</code>');
  s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/\*(.+?)\*/g,'<em>$1</em>');
  s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" style="color:var(--ofp);text-decoration:underline">$1</a>');
  s=s.replace(/(^|[\s])(https?:\/\/[^\s<"]+)/g,'$1<a href="$2" target="_blank" rel="noopener" style="color:var(--ofp);text-decoration:underline">$2</a>');
  var lines=s.split('\n'),out=[],ul=false,ol=false;
  for(var i=0;i<lines.length;i++){
    var l=lines[i];
    var um=/^[ \t]*[-*]\s+(.+)/.exec(l);
    var om=/^[ \t]*\d+[.)]\s+(.+)/.exec(l);
    if(um){
      if(ol){out.push('</ol>');ol=false;}
      if(!ul){out.push('<ul style="margin:4px 0;padding-left:18px">');ul=true;}
      out.push('<li style="margin:2px 0">'+um[1]+'</li>');
    }else if(om){
      if(ul){out.push('</ul>');ul=false;}
      if(!ol){out.push('<ol style="margin:4px 0;padding-left:18px">');ol=true;}
      out.push('<li style="margin:2px 0">'+om[1]+'</li>');
    }else{
      if(ul){out.push('</ul>');ul=false;}
      if(ol){out.push('</ol>');ol=false;}
      out.push(l===''?'<br>':l+'<br>');
    }
  }
  if(ul)out.push('</ul>');
  if(ol)out.push('</ol>');
  return out.join('').replace(/<br>$/,'');
}

function addMsg(t,u){
  var d=document.createElement("div");d.className=u?"u":"b";
  if(u){d.textContent=t;}else{d.innerHTML=renderMd(t);}
  ms.appendChild(d);
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
      var lp={embedKey:k,sessionId:sid};
      if(d.name)lp.name=d.name;if(d.email)lp.email=d.email;
      if(d.phone)lp.phone=d.phone;if(d.notes)lp.notes=d.notes;
      fetch(bu+"/api/v1/leads",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify(lp)})
      .then(function(r){
        var el=document.createElement("div");el.className="ok";
        if(r.ok){el.textContent="✓ Details saved";}
        else{
          r.json().then(function(j){console.error("[octively:leads]",r.status,j);}).catch(function(){});
          el.textContent="⚠ Could not save your details ("+r.status+")";el.style.color="#ef4444";
        }
        ms.appendChild(el);ms.scrollTop=ms.scrollHeight;
      })
      .catch(function(e){
        console.error("[octively:leads] fetch failed:",e);
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
  .then(function(r){
    if(!r.ok){showErr();return null;}
    return r.json();
  })
  .then(function(d){
    if(!d)return;
    hideTyping();
    if(d.reply)addBot(lc?captureLead(d.reply):d.reply);
    lock(0);inp.focus();
  })
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

window.addEventListener("octively:lead",function(e){
  try{fetch(bu+"/api/v1/leads",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(Object.assign({embedKey:k,sessionId:sid},e.detail||{}))});}catch(e){}
});
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
}catch(e){}})();
