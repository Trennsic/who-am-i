const RANDOM = "__random", CUSTOM = "__custom";

// seeded RNG
function hash(str){let h1=1779033703,h2=3144134277,h3=1013904242,h4=2773480762;for(let i=0;i<str.length;i++){const k=str.charCodeAt(i);h1=h2^Math.imul(h1^k,597399067);h2=h3^Math.imul(h2^k,2869860233);h3=h4^Math.imul(h3^k,951274213);h4=h1^Math.imul(h4^k,2716044179);}h1=Math.imul(h3^(h1>>>18),597399067);return (h1^h2^h3^h4)>>>0;}
function rng(seed){let a=seed;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function deal(game, round){
  const r = rng(hash(game.s + "|" + round));
  const keys = Object.keys(CATS);
  let cat, pool;
  if(game.c === CUSTOM){ cat = game.cn; pool = game.cl.slice(); }
  else { cat = game.c === RANDOM ? keys[Math.floor(r()*keys.length)] : game.c; pool = CATS[cat].slice(); }
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return {cat, chars: game.n.map((_,i)=>pool[i])};
}

function encode(obj){return "WAI-"+btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/=+$/,"");}
function decode(code){
  code = code.trim().replace(/\s+/g,"");
  if(!code.startsWith("WAI-")) throw new Error("That doesn't look like a game code. It should start with WAI-.");
  let b = code.slice(4); while(b.length%4) b+="=";
  const o = JSON.parse(decodeURIComponent(escape(atob(b))));
  if(!o || !Array.isArray(o.n) || o.n.length<2 || !o.s) throw new Error("This code is incomplete. Copy the whole thing again.");
  if(o.c===CUSTOM){ if(!o.cn || !Array.isArray(o.cl) || o.cl.length<o.n.length) throw new Error("This custom category needs more characters than players."); }
  else if(o.c!==RANDOM && !CATS[o.c]) throw new Error("This code uses a category this page doesn't have.");
  return o;
}

const $ = id => document.getElementById(id);
// category select
const sel = $("catpick");
sel.add(new Option("Surprise us (random each round)", RANDOM));
Object.keys(CATS).forEach(k=>sel.add(new Option(k,k)));
sel.add(new Option("Custom — type your own…", CUSTOM));
sel.addEventListener("change",()=>{$("custom-wrap").hidden = sel.value!==CUSTOM;});

// tabs
function showTab(which){
  $("tab-host").setAttribute("aria-selected", which==="host");
  $("tab-join").setAttribute("aria-selected", which==="join");
  $("host-pane").hidden = which!=="host";
  $("join-pane").hidden = which!=="join";
}
$("tab-host").onclick=()=>showTab("host");
$("tab-join").onclick=()=>showTab("join");

// host
$("make").onclick=()=>{
  const names=["n1","n2","n3","n4"].map(id=>$(id).value.trim()).filter(Boolean);
  const err=$("host-err");
  const lower=names.map(n=>n.toLowerCase());
  if(names.length<2){err.textContent="Add at least two players.";err.hidden=false;return;}
  if(new Set(lower).size!==names.length){err.textContent="Two players have the same name. Make each name different.";err.hidden=false;return;}
  const g={s:Math.random().toString(36).slice(2,8),n:names,c:sel.value};
  if(sel.value===CUSTOM){
    const cn=$("cust-name").value.trim();
    const cl=[...new Set($("cust-list").value.split("\n").map(x=>x.trim()).filter(Boolean))];
    if(!cn){err.textContent="Give your custom category a name.";err.hidden=false;return;}
    if(cl.length<names.length){err.textContent="Add at least "+names.length+" different characters to your custom list.";err.hidden=false;return;}
    g.cn=cn; g.cl=cl;
  }
  err.hidden=true;
  const code=encode(g);
  $("code-text").value=code; $("code-out").hidden=false;
  $("code-in").value=code; onCodeInput();
};
$("copy").onclick=()=>{
  const t=$("code-text");
  const done=()=>{$("copy").textContent="Copied";setTimeout(()=>$("copy").textContent="Copy",1500);};
  try{navigator.clipboard.writeText(t.value).then(done,()=>{t.select();});}catch(e){t.select();}
};

// join
let game=null;
function onCodeInput(){
  const v=$("code-in").value, err=$("join-err"), me=$("me");
  if(!v.trim()){err.hidden=true;$("me-wrap").hidden=true;$("join").disabled=true;game=null;return;}
  try{
    game=decode(v); err.hidden=true;
    me.innerHTML=""; me.add(new Option("Pick your name","")); game.n.forEach((n,i)=>me.add(new Option(n,i)));
    $("me-wrap").hidden=false; $("join").disabled=true;
  }catch(e){game=null;err.textContent=e.message||"That code couldn't be read. Copy the whole thing again.";err.hidden=false;$("me-wrap").hidden=true;$("join").disabled=true;}
}
$("code-in").addEventListener("input",onCodeInput);
$("me").addEventListener("change",()=>{$("join").disabled=$("me").value==="";});

let state={round:1,me:0,revealed:false};
$("join").onclick=()=>{
  state={round:1,me:+$("me").value,revealed:false};
  $("setup").hidden=true; $("table").hidden=false; render();
};

function render(){
  const {cat,chars}=deal(game,state.round);
  $("cat-name").textContent=cat;
  $("round-label").textContent="Round "+state.round;
  const wrap=$("cards"); wrap.innerHTML="";
  game.n.forEach((name,i)=>{
    const isMe=i===state.me;
    const d=document.createElement("div");
    d.className="pc"+(isMe?" me":"")+(isMe&&state.revealed?" revealed":"");
    const who=document.createElement("div"); who.className="who"; who.textContent=isMe?name+" (you)":name;
    const ch=document.createElement("div"); ch.className="char"; ch.textContent=isMe&&!state.revealed?"?":chars[i];
    d.append(who,ch); wrap.append(d);
  });
  resetReveal();
}
function resetReveal(){
  const box=$("reveal-box"); box.innerHTML="";
  if(state.revealed) return;
  const b=document.createElement("button"); b.className="ghost"; b.textContent="Reveal mine";
  b.onclick=()=>{
    box.innerHTML="";
    const s=document.createElement("span"); s.textContent="Done guessing?";
    const y=document.createElement("button"); y.textContent="Yes, show me";
    const n=document.createElement("button"); n.className="ghost"; n.textContent="Cancel";
    y.onclick=()=>{state.revealed=true;render();};
    n.onclick=resetReveal;
    box.append(s,y,n);
  };
  box.append(b);
}
$("next").onclick=()=>{state.round++;state.revealed=false;render();};
$("leave").onclick=()=>{$("table").hidden=true;$("setup").hidden=false;showTab("join");};
