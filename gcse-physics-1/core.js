/* GCSE Physics walkthroughs — shared engine */
const PH={e:1.60e-19,me:9.11e-31,mp:1.673e-27,mn:1.675e-27,h:6.63e-34,c:3.00e8,MeV:1.60e-13};
const $=id=>document.getElementById(id);
const ov=s=>`<span class="ov">${s}</span>`;
function sci(x,sf=3){if(x===0||!isFinite(x))return String(x);const e=Math.floor(Math.log10(Math.abs(x))+1e-12);let m=x/10**e;let ms=m.toFixed(sf-1);if(Math.abs(parseFloat(ms))>=10){return sci(x*1.0000001,sf)}return e===0?ms:`${ms} × 10<sup>${e}</sup>`;}
function fmt(x,sf=3){if(!isFinite(x))return String(x);const a=Math.abs(x);if(a===0)return '0';if(a>=1e-3&&a<1e7){let t=Number(x.toPrecision(sf));return t.toLocaleString('en-GB',{maximumFractionDigits:6})}return sci(x,sf)}
const nz=(A,Z,s)=>`<span class="nz"><span class="az"><span>${A}</span><span>${Z}</span></span>${s}</span>`;
function wave(x1,y1,x2,y2,n=5,amp=6){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),px=-dy/L,py=dx/L;let d=`M${x1} ${y1}`;for(let i=1;i<=90;i++){const t=i/90,o=Math.sin(t*n*2*Math.PI)*amp;d+=` L${(x1+dx*t+px*o).toFixed(1)} ${(y1+dy*t+py*o).toFixed(1)}`}return d}
function parseNum(s){if(s==null)return NaN;s=String(s).trim().replace(/−|–/g,'-').replace(/\s+/g,'').replace(/,/g,'');
 s=s.replace(/(×|x|X|\*)10\^?/,'e').replace(/^10\^/,'1e');return s===''?NaN:Number(s);}
const EL="n,H,He,Li,Be,B,C,N,O,F,Ne,Na,Mg,Al,Si,P,S,Cl,Ar,K,Ca,Sc,Ti,V,Cr,Mn,Fe,Co,Ni,Cu,Zn,Ga,Ge,As,Se,Br,Kr,Rb,Sr,Y,Zr,Nb,Mo,Tc,Ru,Rh,Pd,Ag,Cd,In,Sn,Sb,Te,I,Xe,Cs,Ba,La,Ce,Pr,Nd,Pm,Sm,Eu,Gd,Tb,Dy,Ho,Er,Tm,Yb,Lu,Hf,Ta,W,Re,Os,Ir,Pt,Au,Hg,Tl,Pb,Bi,Po,At,Rn,Fr,Ra,Ac,Th,Pa,U,Np,Pu,Am,Cm".split(',');

/* ---------- progress / scoring ---------- */
const LS={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const SCORE={checks:0,right:0,exam:0,examTot:0,lesson:null,parts:{},
 reg(){this.checks++;this.upd()},
 hit(){this.right++;this.upd()},
 upd(){const c=$('scorechip');if(c)c.innerHTML=`✓ ${this.right}/${this.checks} checks${this.examTot?` · exam ${this.exam}/${this.examTot}`:''}`;this.save()},
 save(){if(!this.lesson)return;const k='gp1_L'+this.lesson;const o=LS.get(k)||{};o.right=this.right;o.checks=this.checks;o.exam=this.exam;o.examTot=this.examTot;o.seen=Math.max(o.seen||0,LESSON.seen.size);o.sections=LESSON.secs.length;LS.set(k,o)}};

/* ---------- lesson shell ---------- */
const LESSON={secs:[],cur:0,seen:new Set(),onShow:{}};
function initLesson(){
 const b=document.body;SCORE.lesson=b.dataset.lesson;
 LESSON.secs=[...document.querySelectorAll('main>section')];
 const nav=document.createElement('nav');nav.className='tabs';
 nav.innerHTML=LESSON.secs.map((s,i)=>`<button data-i="${i}">${i+1} · ${s.dataset.title}</button>`).join('')+'<span class="chip" id="scorechip"></span>';
 const pbar=document.createElement('div');pbar.className='pbar';pbar.innerHTML='<i id="pbari"></i>';
 document.querySelector('header.top').after(nav);nav.after(pbar);
 LESSON.secs.forEach((s,i)=>{const h=s.querySelector('h2');if(h&&s.dataset.mins)h.insertAdjacentHTML('beforeend',`<span class="time">⏱ ~${s.dataset.mins} min</span>`)});
 const foot=document.createElement('div');foot.className='foot';
 foot.innerHTML=`<button class="btn" id="prevS">◀ Previous</button><span class="mid" id="footmid"></span><span id="nextWrap"><button class="btn pri" id="nextS">Next section ▶</button></span>`;
 document.body.appendChild(foot);
 nav.onclick=e=>{const t=e.target.closest('button[data-i]');if(t)go(+t.dataset.i)};
 $('prevS').onclick=()=>go(LESSON.cur-1);$('nextS').onclick=()=>go(LESSON.cur+1);
 let start=0;const h=location.hash.replace('#','');const m=h.match(/^s(\d+)$/);if(m)start=Math.min(LESSON.secs.length-1,+m[1]-1);
 go(start,true);SCORE.upd();
}
function go(i,first){const n=LESSON.secs.length;i=Math.max(0,Math.min(n-1,i));LESSON.cur=i;LESSON.seen.add(i);
 LESSON.secs.forEach((s,j)=>s.classList.toggle('on',j===i));
 document.querySelectorAll('nav.tabs button[data-i]').forEach((b,j)=>{b.classList.toggle('on',j===i);b.classList.toggle('seen',LESSON.seen.has(j))});
 $('prevS').disabled=i===0;
 const nx=document.body.dataset.next;
 if(i===n-1){$('nextWrap').innerHTML=nx?`<a class="btn pri" style="text-decoration:none" href="${nx}">Next lesson ▶</a>`:`<a class="btn pri" style="text-decoration:none" href="index.html">All lessons</a>`}
 else $('nextWrap').innerHTML='<button class="btn pri" id="nextS">Next section ▶</button>',$('nextS').onclick=()=>go(LESSON.cur+1);
 $('footmid').textContent=`Section ${i+1} of ${n}`;
 $('pbari').style.width=((LESSON.seen.size)/n*100)+'%';
 try{history.replaceState(null,'','#s'+(i+1))}catch(e){}
 if(!first)window.scrollTo({top:0,behavior:'smooth'});
 const sec=LESSON.secs[i];if(LESSON.onShow[sec.id])LESSON.onShow[sec.id]();
 SCORE.save();}

/* ---------- quick check: multiple choice ---------- */
function MCQ(el,{q,opts,a,why,wrong}){el=typeof el==='string'?$(el):el;SCORE.reg();
 el.classList.add('qc');const L='ABCDEFG';
 el.innerHTML=`<div class="qh">QUICK CHECK</div><div class="qq">${q}</div>`+opts.map((o,j)=>`<button class="opt" data-j="${j}"><b>${L[j]}</b><span>${o}</span></button>`).join('')+`<div class="fb"></div>`;
 let tried=false,done=false;
 el.onclick=e=>{const o=e.target.closest('.opt');if(!o||done)return;const j=+o.dataset.j;const fb=el.querySelector('.fb');
  if(j===a){o.classList.add('r');done=true;if(!tried)SCORE.hit();fb.className='fb show y';fb.innerHTML=(tried?'✓ Got there. ':'✓ Correct! ')+(why||'');}
  else{o.classList.add('w');tried=true;fb.className='fb show n';fb.innerHTML='✗ '+((wrong&&wrong[j])||'Not quite — have another go.');}};}

/* ---------- quick check: numerical ---------- */
function NumQ(el,{q,ans,tol=0.02,unit='',steps=[],hint='',sfNote=''}){el=typeof el==='string'?$(el):el;SCORE.reg();el.classList.add('qc');
 el.innerHTML=`<div class="qh">QUICK CHECK · CALCULATION</div><div class="qq">${q}</div>
 <div class="row"><input class="num" inputmode="decimal" placeholder="your answer"> <span>${unit}</span><button class="btn pri chk">Check</button>${steps.length?'<button class="btn stp">Show a step</button>':''}</div>
 <div class="hint">Give your answer as a number. Powers of ten can be typed as 3e5 or 3x10^5.${hint?' '+hint:''}</div><div class="fb"></div><div class="steps"></div>`;
 let tried=false,done=false,si=0;const inp=el.querySelector('input'),fb=el.querySelector('.fb');
 const check=()=>{if(done)return;const v=parseNum(inp.value);if(isNaN(v)){fb.className='fb show m';fb.textContent='Enter a number first.';return}
  const r=v/ans;
  if(Math.abs(r-1)<=tol){done=true;inp.classList.add('ok');inp.classList.remove('bad');if(!tried&&si===0)SCORE.hit();fb.className='fb show y';fb.innerHTML=`✓ Correct: ${fmt(ans,3)} ${unit}${sfNote?'. '+sfNote:''}`;while(si<steps.length)showStep();return}
  tried=true;inp.classList.add('bad');
  const lr=Math.log10(Math.abs(r));
  if(r<0&&Math.abs(Math.abs(r)-1)<=tol){fb.className='fb show m';fb.textContent='Right size — check the sign.'}
  else if(r>0&&Math.abs(lr-Math.round(lr))<0.01&&Math.round(lr)!==0){fb.className='fb show m';fb.textContent=`Very close — but out by a factor of 10^${Math.round(lr)}. Check your powers of ten / unit prefixes.`}
  else{fb.className='fb show n';fb.textContent=steps.length?'Not quite. Try again, or reveal a step.':'Not quite — try again.'}};
 const showStep=()=>{if(si<steps.length){el.querySelector('.steps').insertAdjacentHTML('beforeend',`<div>${steps[si]}</div>`);si++;}const b=el.querySelector('.stp');if(b&&si>=steps.length)b.disabled=true};
 el.querySelector('.chk').onclick=check;inp.onkeydown=e=>{if(e.key==='Enter')check()};
 const sb=el.querySelector('.stp');if(sb)sb.onclick=showStep;}

/* ---------- quick check: fill boxes (exact answers) ---------- */
function FillQ(el,{q,tpl,ans,why}){el=typeof el==='string'?$(el):el;SCORE.reg();el.classList.add('qc');
 let k=0;const body=tpl.replace(/\{\}/g,()=>`<input class="num sm" data-k="${k++}">`);
 el.innerHTML=`<div class="qh">QUICK CHECK</div><div class="qq">${q}</div><div class="eqn" style="font-size:1.2rem">${body}</div><div class="row" style="margin-top:8px"><button class="btn pri chk">Check</button><button class="btn rv">Reveal</button></div><div class="fb"></div>`;
 let tried=false,done=false;const fb=el.querySelector('.fb');
 el.querySelector('.chk').onclick=()=>{if(done)return;let ok=true;el.querySelectorAll('input').forEach(i=>{const v=String(i.value).trim().replace(/−/g,'-'),t=String(ans[+i.dataset.k]);const good=(v!==''&&!isNaN(parseNum(v))&&!isNaN(Number(t)))?parseNum(v)===Number(t):v.toLowerCase()===t.toLowerCase();i.classList.toggle('ok',good);i.classList.toggle('bad',!good);if(!good)ok=false});
  if(ok){done=true;if(!tried)SCORE.hit();fb.className='fb show y';fb.innerHTML='✓ Correct! '+(why||'')}else{tried=true;fb.className='fb show n';fb.textContent='Some boxes are wrong (red). Check top numbers and bottom numbers balance.'}};
 el.querySelector('.rv').onclick=()=>{tried=true;el.querySelectorAll('input').forEach(i=>{i.value=ans[+i.dataset.k];i.classList.add('ok')});done=true;fb.className='fb show m';fb.innerHTML=why||''};}

/* ---------- sort activity ---------- */
function Sort(el,{q,bins,items,why}){el=typeof el==='string'?$(el):el;SCORE.reg();el.classList.add('qc');
 el.innerHTML=`<div class="qh">QUICK CHECK · SORT</div><div class="qq">${q}</div><div class="hint" style="margin-bottom:8px">Tap an item, then tap the box it belongs in. Tap an item in a box to send it back.</div>
 <div class="sortpool"></div><div class="sortbins" style="grid-template-columns:repeat(${Math.min(bins.length,4)},1fr)">${bins.map((b,i)=>`<div class="bin" data-b="${i}"><div class="bl">${b}</div></div>`).join('')}</div>
 <div class="row" style="margin-top:10px"><button class="btn pri chk">Check</button><button class="btn rst">Reset</button></div><div class="fb"></div>`;
 const pool=el.querySelector('.sortpool');let sel=null,tried=false,done=false;
 const mk=()=>{pool.innerHTML='';el.querySelectorAll('.bin .it').forEach(x=>x.remove());items.map((it,i)=>[it,i]).sort(()=>Math.random()-.5).forEach(([it,i])=>pool.insertAdjacentHTML('beforeend',`<button class="it" data-i="${i}">${it.t}</button>`))};
 mk();
 el.onclick=e=>{if(done)return;const it=e.target.closest('.it');const bin=e.target.closest('.bin');
  if(it){if(it.closest('.bin')){pool.appendChild(it);it.classList.remove('r','w');return}el.querySelectorAll('.it').forEach(x=>x.classList.remove('sel'));sel=it;it.classList.add('sel');el.querySelectorAll('.bin').forEach(b=>b.classList.add('hot'));return}
  if(bin&&sel){sel.classList.remove('sel');bin.appendChild(sel);sel=null;el.querySelectorAll('.bin').forEach(b=>b.classList.remove('hot'))}};
 el.querySelector('.rst').onclick=e=>{e.stopPropagation();if(done)return;mk();el.querySelector('.fb').className='fb'};
 el.querySelector('.chk').onclick=e=>{e.stopPropagation();if(done)return;const fb=el.querySelector('.fb');
  if(pool.querySelector('.it')){fb.className='fb show m';fb.textContent='Place every item first.';return}
  let ok=true;el.querySelectorAll('.bin .it').forEach(x=>{const good=items[+x.dataset.i].b===+x.closest('.bin').dataset.b;x.classList.toggle('r',good);x.classList.toggle('w',!good);if(!good)ok=false});
  if(ok){done=true;if(!tried)SCORE.hit();fb.className='fb show y';fb.innerHTML='✓ All correct! '+(why||'')}else{tried=true;fb.className='fb show n';fb.textContent='The red ones are in the wrong box — tap them to send them back and try again.'}};}

/* ---------- exam question with self-marking ---------- */
function ExamQ(el,{title,stem='',parts}){el=typeof el==='string'?$(el):el;el.classList.add('exam');
 const tot=parts.reduce((a,p)=>a+p.marks,0);SCORE.examTot+=tot;
 el.innerHTML=`<div class="eh"><span>${title}</span><span>${tot} mark${tot>1?'s':''}</span></div><div class="eb">${stem}`+parts.map((p,i)=>`<div class="part" data-i="${i}"><span class="mk">[${p.marks} mark${p.marks>1?'s':''}]</span><span class="pl">${p.label}</span>${p.q}
 ${p.opts?`<div style="margin-top:6px">${p.opts.map((o,j)=>`<label style="display:flex;gap:8px;margin:4px 0;cursor:pointer"><input type="radio" name="${el.id}_${i}" value="${j}"> <b>${'ABCD'[j]}</b> ${o}</label>`).join('')}</div>`:`<textarea placeholder="Write your answer here, then check it against the mark scheme."></textarea>`}
 <div class="row" style="margin-top:6px"><button class="btn showms">Show mark scheme</button></div>
 <div class="ms"><div style="font-weight:700;margin-bottom:4px">Mark scheme — tick each point you got:</div>${p.ms.map(m=>`<label><input type="checkbox"><span>${m}</span></label>`).join('')}${p.guide?`<div class="g">${p.guide}</div>`:''}<div class="tot"></div></div></div>`).join('')+`</div>`;
 el.querySelectorAll('.part').forEach(pe=>{const p=parts[+pe.dataset.i];let got=0;
  pe.querySelector('.showms').onclick=()=>{pe.querySelector('.ms').classList.add('show');if(p.opts){const r=pe.querySelector('input[type=radio]:checked');const cb=pe.querySelector('.ms input');if(r&&+r.value===p.a&&!cb.checked){cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}))}}};
  pe.querySelector('.ms').addEventListener('change',()=>{const n=Math.min(p.marks,pe.querySelectorAll('.ms input:checked').length);SCORE.exam+=n-got;got=n;pe.querySelector('.tot').textContent=`${n} / ${p.marks}`;SCORE.upd()})});
 SCORE.upd();}

/* ---------- generic stepper ---------- */
function Stepper(el,{n,render,auto=2300}){el=typeof el==='string'?$(el):el;let s=0,timer=null;
 el.innerHTML=`<div class="dots"></div><div class="row"><button class="btn sb">◀ Back</button><button class="btn pri sn">Next ▶</button><button class="btn sp">▶ Play</button><button class="btn sr">↺</button></div>`;
 const draw=()=>{el.querySelector('.dots').innerHTML=Array.from({length:n},(_,i)=>`<i class="${i<=s?'on':''}"></i>`).join('');render(s)};
 const stop=()=>{clearInterval(timer);timer=null;el.querySelector('.sp').textContent='▶ Play'};
 el.querySelector('.sn').onclick=()=>{stop();s=Math.min(n-1,s+1);draw()};
 el.querySelector('.sb').onclick=()=>{stop();s=Math.max(0,s-1);draw()};
 el.querySelector('.sr').onclick=()=>{stop();s=0;draw()};
 el.querySelector('.sp').onclick=()=>{if(timer){stop();return}if(s>=n-1)s=0;draw();el.querySelector('.sp').textContent='❚❚ Pause';timer=setInterval(()=>{if(s>=n-1){stop();return}s++;draw()},auto)};
 draw();return{set(k){stop();s=k;draw()},get n(){return n},reset(){stop();s=0;draw()}};}

/* ---------- animation helper ---------- */
function animate(ms,fn,done){const t0=performance.now();let id;const st=now=>{const t=Math.min(1,(now-t0)/ms);fn(t);if(t<1)id=requestAnimationFrame(st);else if(done)done()};id=requestAnimationFrame(st);return()=>cancelAnimationFrame(id)}

document.addEventListener('DOMContentLoaded',()=>{if(document.body.dataset.lesson)initLesson()});

/* ---------- energy store bars ---------- */
const STORE_COL={kinetic:'#e4572e',gravitational:'#2e86de',elastic:'#17a589',thermal:'#d35400',chemical:'#8e44ad',nuclear:'#16a085',magnetic:'#7f8c8d',electrostatic:'#d4a106',dissipated:'#95a5a6'};
function bars(el,items,max){el=typeof el==='string'?$(el):el;max=max||Math.max(1,...items.map(i=>i.v));
 el.innerHTML=`<div class="bars">${items.map(i=>`<div class="bar1"><div class="bt"><i style="height:${Math.max(0,Math.min(100,i.v/max*100))}%;background:${i.c||STORE_COL[i.k]||'#888'}"></i></div><div class="bv">${i.txt??fmt(i.v,3)}</div><div class="bl">${i.l}</div></div>`).join('')}</div>`;}
