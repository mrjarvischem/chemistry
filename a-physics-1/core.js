/* A-level Physics 3.2 walkthroughs — shared engine */
const PH={e:1.60e-19,me:9.11e-31,mp:1.673e-27,mn:1.675e-27,h:6.63e-34,c:3.00e8,MeV:1.60e-13};
const $=id=>document.getElementById(id);
const ov=s=>`<span class="ov">${s}</span>`;
function sci(x,sf=3){if(x===0||!isFinite(x))return String(x);const e=Math.floor(Math.log10(Math.abs(x))+1e-12);let m=x/10**e;let ms=m.toFixed(sf-1);if(Math.abs(parseFloat(ms))>=10){return sci(x*1.0000001,sf)}return e===0?ms:`${ms} × 10<sup>${e}</sup>`;}
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
 save(){if(!this.lesson)return;const k='ph32_L'+this.lesson;const o=LS.get(k)||{};o.right=this.right;o.checks=this.checks;o.exam=this.exam;o.examTot=this.examTot;o.seen=Math.max(o.seen||0,LESSON.seen.size);o.sections=LESSON.secs.length;LS.set(k,o)}};

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
 <div class="row"><input class="num" inputmode="decimal" placeholder="e.g. 1.6e-19"> <span>${unit}</span><button class="btn pri chk">Check</button>${steps.length?'<button class="btn stp">Show a step</button>':''}</div>
 <div class="hint">Type powers of ten as 1.6e-19 or 1.6x10^-19.${hint?' '+hint:''}</div><div class="fb"></div><div class="steps"></div>`;
 let tried=false,done=false,si=0;const inp=el.querySelector('input'),fb=el.querySelector('.fb');
 const check=()=>{if(done)return;const v=parseNum(inp.value);if(isNaN(v)){fb.className='fb show m';fb.textContent='Enter a number first.';return}
  const r=v/ans;
  if(Math.abs(r-1)<=tol){done=true;inp.classList.add('ok');inp.classList.remove('bad');if(!tried&&si===0)SCORE.hit();fb.className='fb show y';fb.innerHTML=`✓ Correct: ${sci(ans,3)} ${unit}${sfNote?'. '+sfNote:''}`;while(si<steps.length)showStep();return}
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

/* ---------- Feynman diagrams ---------- */
const sub=(s,b)=>`${s}<tspan font-size="11" dy="4">${b}</tspan>`;
const bar=s=>`<tspan style="text-decoration:overline">${s}</tspan>`;
function scat(inL,outL,inR,outR,ex,emit){const sL=emit==='L'?1:2,sR=emit==='L'?2:1;return[
 ['l',65,250,85,140,inL,40,235,0],['l',205,250,185,140,inR,215,235,0],
 ['w',85,140,185,140,ex,135,122,1],['l',85,140,65,30,outL,38,50,sL],['l',185,140,205,30,outR,212,50,sR]];}
function dec(inL,outL,W,o1,o2){return[['l',65,250,85,150,inL,40,235,0],['l',85,150,65,30,outL,38,50,1],['w',85,150,175,100,W,118,150,1],
 ['l',175,100,205,20,o1,212,30,2],['l',175,100,250,60,o2,240,92,2]];}
function drawFeyn(svg,els,step){let s=`<defs><marker id="far" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1d2433"/></marker></defs>
 <line x1="12" y1="250" x2="12" y2="40" stroke="#aab" stroke-width="2" marker-end="url(#far)"/><text x="22" y="150" font-size="12" fill="#889" transform="rotate(-90 22 150)">time</text>`;
 els.forEach(([t,x1,y1,x2,y2,lab,lx,ly,st])=>{const on=st<=step?'on':'';
  if(t==='l')s+=`<g class="f ${on}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1d2433" stroke-width="3"/><text x="${lx}" y="${ly}" font-size="17" font-weight="700" fill="#1d2433">${lab}</text></g>`;
  else s+=`<g class="f ${on}"><path d="${wave(x1,y1,x2,y2,5,6)}" fill="none" stroke="#d4a106" stroke-width="3"/><text x="${lx}" y="${ly}" font-size="15" font-weight="700" fill="#b9770e" text-anchor="middle">${lab}</text></g>`;});
 (typeof svg==='string'?$(svg):svg).innerHTML=s;}

/* ---------- particles & quarks ---------- */
const QD={u:{Q:2,S:0},d:{Q:-1,S:0},s:{Q:-1,S:-1}};
const qi=t=>{const a=t.endsWith('~'),b=QD[t[0]];return{a,Q:a?-b.Q:b.Q,S:a?-b.S:b.S,B:a?-1:1}};
const qChip=(t,x='')=>`<span class="qk ${t.endsWith('~')?'anti':''} ${x}" style="--c:var(--${t[0]})"><span>${t[0]}</span></span>`;
const fr=n=>n===0?'0':(n>0?'+':'−')+(Math.abs(n)%3===0?Math.abs(n)/3:Math.abs(n)+'/3');
const sg=n=>n===0?'0':(n>0?'+':'−')+Math.abs(n);
const P={
 p:{sym:'p',name:'proton',fam:'baryon',q:['u','u','d'],Q:1,B:1,Le:0,Lm:0,S:0,note:'The only stable baryon — all other baryons eventually decay into protons.'},
 n:{sym:'n',name:'neutron',fam:'baryon',q:['u','d','d'],Q:0,B:1,Le:0,Lm:0,S:0,note:'A free neutron decays by β⁻ decay: n → p + e⁻ + ν̄ₑ (weak interaction).'},
 pb:{sym:ov('p'),name:'antiproton',fam:'baryon',q:['u~','u~','d~'],Q:-1,B:-1,Le:0,Lm:0,S:0,note:'An antibaryon: same mass as the proton, opposite charge and baryon number.'},
 nb:{sym:ov('n'),name:'antineutron',fam:'baryon',q:['u~','d~','d~'],Q:0,B:-1,Le:0,Lm:0,S:0,note:'Neutral like the neutron, but B = −1 because it is made of antiquarks.'},
 pip:{sym:'π<sup>+</sup>',name:'positive pion',fam:'meson',q:['u','d~'],Q:1,B:0,Le:0,Lm:0,S:0,note:'Pions are the exchange particle of the strong nuclear force.'},
 pim:{sym:'π<sup>−</sup>',name:'negative pion',fam:'meson',q:['d','u~'],Q:-1,B:0,Le:0,Lm:0,S:0,note:'The antiparticle of the π⁺.'},
 pi0:{sym:'π<sup>0</sup>',name:'neutral pion',fam:'meson',q:['u','u~'],alt:'u'+ov('u')+' or d'+ov('d'),Q:0,B:0,Le:0,Lm:0,S:0,note:'The π⁰ is its own antiparticle.'},
 Kp:{sym:'K<sup>+</sup>',name:'positive kaon',fam:'meson',q:['u','s~'],Q:1,B:0,Le:0,Lm:0,S:1,note:'Kaons are strange particles: made in pairs by the strong interaction, decay by the weak interaction — often into pions.'},
 Km:{sym:'K<sup>−</sup>',name:'negative kaon',fam:'meson',q:['s','u~'],Q:-1,B:0,Le:0,Lm:0,S:-1,note:'Contains an s quark, so S = −1.'},
 K0:{sym:'K<sup>0</sup>',name:'neutral kaon',fam:'meson',q:['d','s~'],Q:0,B:0,Le:0,Lm:0,S:1,note:'Contains an anti-strange quark, so S = +1.'},
 K0b:{sym:ov('K')+'<sup>0</sup>',name:'neutral antikaon',fam:'meson',q:['s','d~'],Q:0,B:0,Le:0,Lm:0,S:-1,note:'The antiparticle of the K⁰.'},
 em:{sym:'e<sup>−</sup>',name:'electron',fam:'lepton',Q:-1,B:0,Le:1,Lm:0,S:0,note:'A fundamental particle — not made of quarks.'},
 ep:{sym:'e<sup>+</sup>',name:'positron',fam:'lepton',Q:1,B:0,Le:-1,Lm:0,S:0,note:'Antiparticle of the electron: Lₑ = −1.'},
 ve:{sym:'ν<sub>e</sub>',name:'electron neutrino',fam:'lepton',Q:0,B:0,Le:1,Lm:0,S:0,note:'Produced with a positron in β⁺ decay.'},
 veb:{sym:ov('ν')+'<sub>e</sub>',name:'electron antineutrino',fam:'lepton',Q:0,B:0,Le:-1,Lm:0,S:0,note:'Produced with an electron in β⁻ decay — balances electron lepton number.'},
 mum:{sym:'μ<sup>−</sup>',name:'muon',fam:'lepton',Q:-1,B:0,Le:0,Lm:1,S:0,note:'A “heavy electron” (about 200 × the mass) that decays into an electron: μ⁻ → e⁻ + ν̄ₑ + ν_μ.'},
 mup:{sym:'μ<sup>+</sup>',name:'antimuon',fam:'lepton',Q:1,B:0,Le:0,Lm:-1,S:0,note:'Antiparticle of the muon: L_μ = −1.'},
 vm:{sym:'ν<sub>μ</sub>',name:'muon neutrino',fam:'lepton',Q:0,B:0,Le:0,Lm:1,S:0,note:'Carries muon lepton number.'},
 vmb:{sym:ov('ν')+'<sub>μ</sub>',name:'muon antineutrino',fam:'lepton',Q:0,B:0,Le:0,Lm:-1,S:0,note:'L_μ = −1.'},
 L0:{sym:'Λ<sup>0</sup>',name:'lambda (not on spec — data given in exams)',fam:'baryon',q:['u','d','s'],Q:0,B:1,Le:0,Lm:0,S:-1,note:'Not on the spec list. Exams give data for particles like this.'},
 g:{sym:'γ',name:'photon',fam:'boson',Q:0,B:0,Le:0,Lm:0,S:0,note:'Exchange particle of the electromagnetic interaction.'}
};
const pChip=(id,cls='')=>`<button class="pc ${cls}" data-id="${id}" style="--c:var(--${P[id].fam})"><span>${P[id].sym}</span></button>`;
const ROWS=[['Charge Q','Q'],['Baryon number B','B'],['Electron lepton no. L<sub>e</sub>','Le'],['Muon lepton no. L<sub>μ</sub>','Lm'],['Strangeness S','S']];
const ptot=(l,k)=>l.reduce((a,id)=>a+P[id][k],0);
function consTable(b,a){const side=(l,k)=>{const t=ptot(l,k);return l.length>1?`${l.map(id=>sg(P[id][k])).join(' ')} = <b>${sg(t)}</b>`:`<b>${sg(t)}</b>`};
 return `<div class="tablewrap"><table class="t"><tr><th>Quantity</th><th>Before</th><th>After</th><th></th></tr>`+ROWS.map(([lab,k])=>{const ok=ptot(b,k)===ptot(a,k);return `<tr><td>${lab}</td><td style="font-family:ui-monospace,Menlo,monospace">${side(b,k)}</td><td style="font-family:ui-monospace,Menlo,monospace">${side(a,k)}</td><td style="font-weight:700;color:${ok?'var(--good)':'var(--bad)'}">${ok?'✓':'✗'}</td></tr>`}).join('')+'</table></div>';}

document.addEventListener('DOMContentLoaded',()=>{if(document.body.dataset.lesson)initLesson()});
