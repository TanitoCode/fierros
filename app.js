(function(){
  "use strict";

  /* ---------------- storage ---------------- */
  var KEY="fierros.v1";
  var DB={routines:[],sessions:[],body:[],customExercises:[]};
  function load(){
    try{var raw=localStorage.getItem(KEY); if(raw){var d=JSON.parse(raw); DB.routines=d.routines||[]; DB.sessions=d.sessions||[]; DB.body=d.body||[]; DB.customExercises=d.customExercises||[];}}
    catch(e){}
    if(!DB.routines.length && !DB.sessions.length && !DB.body.length) seed();
  }
  function save(){ try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){} }
  function seed(){
    DB.routines=[
      {id:uid(),name:"Empuje (Push)",day:"Lun",exercises:[
        {name:"Press banca",sets:4,reps:8},{name:"Press militar",sets:3,reps:10},
        {name:"Fondos",sets:3,reps:12},{name:"Extensión tríceps",sets:3,reps:15}]},
      {id:uid(),name:"Tirón (Pull)",day:"Mié",exercises:[
        {name:"Dominadas",sets:4,reps:8},{name:"Remo con barra",sets:4,reps:10},
        {name:"Curl bíceps",sets:3,reps:12}]},
      {id:uid(),name:"Pierna (Legs)",day:"Vie",exercises:[
        {name:"Sentadilla",sets:4,reps:8},{name:"Peso muerto",sets:3,reps:6},
        {name:"Prensa",sets:3,reps:12},{name:"Gemelos",sets:4,reps:15}]}
    ];
  }

  /* ---------------- helpers ---------------- */
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
  function todayISO(){var d=new Date();return d.toISOString().slice(0,10);}
  function parseISO(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
  var MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  var DIAS=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  function fmtLong(iso){var d=parseISO(iso);return DIAS[d.getDay()]+", "+d.getDate()+" "+MES[d.getMonth()];}
  function fmtShort(iso){var d=parseISO(iso);return d.getDate()+" "+MES[d.getMonth()];}
  function epley(w,r){return r>0? Math.round(w*(1+r/30)) : Math.round(w);}
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function el(id){return document.getElementById(id);}

  function toast(msg){var t=el("toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove("show");},1900);}
  function norm(s){return String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}

  /* ---------------- catálogo de ejercicios por grupo muscular ---------------- */
  var MUSCLES=["Pecho","Espalda","Hombros","Bíceps","Tríceps","Cuádriceps","Femorales","Glúteos","Pantorrillas","Abdominales","Antebrazos","Trapecio"];
  var CATALOG=[
    ["Press de banca","Pecho"],["Press inclinado con barra","Pecho"],["Press inclinado con mancuernas","Pecho"],["Press plano con mancuernas","Pecho"],["Press declinado","Pecho"],["Aperturas con mancuernas","Pecho"],["Cruces en polea","Pecho"],["Pec deck (contractora)","Pecho"],["Fondos en paralelas","Pecho"],["Flexiones de brazos","Pecho"],["Press de pecho en máquina","Pecho"],["Pullover con mancuerna","Pecho"],
    ["Dominadas","Espalda"],["Jalón al pecho","Espalda"],["Jalón agarre cerrado","Espalda"],["Remo con barra","Espalda"],["Remo con mancuerna","Espalda"],["Remo en T (T-bar)","Espalda"],["Remo en polea baja","Espalda"],["Remo en máquina","Espalda"],["Pull-over en polea","Espalda"],["Peso muerto","Espalda"],["Hiperextensiones (lumbares)","Espalda"],["Remo invertido","Espalda"],
    ["Press militar con barra","Hombros"],["Press militar con mancuernas","Hombros"],["Press Arnold","Hombros"],["Elevaciones laterales","Hombros"],["Elevaciones frontales","Hombros"],["Elevaciones posteriores (pájaros)","Hombros"],["Face pull","Hombros"],["Remo al mentón","Hombros"],["Press de hombros en máquina","Hombros"],
    ["Curl con barra","Bíceps"],["Curl con mancuernas","Bíceps"],["Curl martillo","Bíceps"],["Curl predicador (Scott)","Bíceps"],["Curl inclinado","Bíceps"],["Curl concentrado","Bíceps"],["Curl en polea","Bíceps"],["Curl araña","Bíceps"],
    ["Extensión en polea (soga)","Tríceps"],["Extensión en polea (barra)","Tríceps"],["Press francés","Tríceps"],["Patada de tríceps","Tríceps"],["Fondos en banco","Tríceps"],["Press cerrado","Tríceps"],["Extensión sobre la cabeza","Tríceps"],
    ["Sentadilla","Cuádriceps"],["Sentadilla frontal","Cuádriceps"],["Prensa de piernas","Cuádriceps"],["Extensión de cuádriceps","Cuádriceps"],["Zancadas","Cuádriceps"],["Sentadilla búlgara","Cuádriceps"],["Hack squat","Cuádriceps"],["Sentadilla goblet","Cuádriceps"],
    ["Peso muerto rumano","Femorales"],["Curl femoral tumbado","Femorales"],["Curl femoral sentado","Femorales"],["Peso muerto piernas rígidas","Femorales"],["Buenos días (good morning)","Femorales"],
    ["Hip thrust (empuje de cadera)","Glúteos"],["Puente de glúteos","Glúteos"],["Patada de glúteo en polea","Glúteos"],["Abductores en máquina","Glúteos"],
    ["Elevación de talones de pie","Pantorrillas"],["Elevación de talones sentado","Pantorrillas"],["Elevación de talones en prensa","Pantorrillas"],
    ["Crunch abdominal","Abdominales"],["Elevación de piernas","Abdominales"],["Plancha","Abdominales"],["Rueda abdominal","Abdominales"],["Crunch en polea","Abdominales"],["Russian twist","Abdominales"],["Elevación de rodillas colgado","Abdominales"],
    ["Curl de muñeca","Antebrazos"],["Curl de muñeca invertido","Antebrazos"],["Caminata del granjero","Antebrazos"],
    ["Encogimientos con barra","Trapecio"],["Encogimientos con mancuernas","Trapecio"]
  ].map(function(x){return {n:x[0],m:x[1]};});

  /* ---------------- ayuda visual: ¿qué ejercicio es? ---------------- */
  var DEMO_RULES=[
    [/talon|pantorrilla|gemelo|encogimiento|trapecio/,"lift","Subí controlado apretando arriba, y bajá despacio sin rebotar."],
    [/abdominal|plancha|crunch|rueda abdominal|russian twist|elevacion de pierna|rodillas colgado/,"core","Contraé el abdomen y curvá el torso de a poco, sin tirar del cuello."],
    [/peso muerto|buenos dias|hip thrust|puente de gluteo|patada de gluteo|hiperextension/,"hinge","Empujá la cadera hacia atrás con la espalda neutra, después extendé cadera para volver arriba."],
    [/sentadilla|prensa|zancada|squat|goblet/,"squat","Bajá flexionando cadera y rodilla con el pecho arriba, después empujá el piso para subir."],
    [/elevaciones? later|elevaciones? frontal|abductor/,"raise","Elevá el brazo o la pierna hasta la altura indicada, sin impulso, y bajá controlado."],
    [/dominada|jalon|pull-?over|pull over/,"pullv","Tirá llevando el pecho hacia la barra o la polea, y controlá la bajada."],
    [/remo|face pull|posterior|pajaro/,"pullh","Tirá el peso hacia el torso apretando los omóplatos, y volvé controlado."],
    [/press militar|press arnold|press de hombros|press hombros/,"pushv","Empujá el peso por encima de la cabeza sin arquear la espalda, y bajá controlado."],
    [/curl|extension|press frances|patada de triceps/,"elbow","Movimiento controlado de flexión y extensión en la articulación, sin usar impulso."],
    [/press|fondos|flexion|pec deck|cruces? en polea|apertura/,"pushh","Empujá el peso alejándolo del cuerpo y controlá la vuelta sin bloquear de golpe."]
  ];
  function detectDemo(name){
    var n=norm(name);
    for(var i=0;i<DEMO_RULES.length;i++) if(DEMO_RULES[i][0].test(n)) return {pattern:DEMO_RULES[i][1],cue:DEMO_RULES[i][2]};
    return {pattern:"generic",cue:"Todavía no tenemos una animación para este ejercicio — buscá una referencia en video."};
  }
  function demoSvg(pattern){
    var B='stroke="var(--muted)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    var A='stroke="var(--accent)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    var inner;
    if(pattern==="pushh"){ // press banca: figura acostada, barra baja/sube sobre el pecho
      inner='<line x1="8" y1="70" x2="72" y2="70" stroke="var(--faint)" stroke-width="4" stroke-linecap="round"/>'
        +'<circle cx="20" cy="61" r="7" '+B+'/>'
        +'<path d="M27 63 L58 66" '+B+'/>'
        +'<path d="M58 66 L52 90 M58 66 L70 88" '+B+'/>'
        +'<g class="demo-anim" style="--from:14px;--to:0px;animation-name:demoSlideV">'
        +'<line x1="26" y1="26" x2="58" y2="26" '+A+' stroke-width="6.5"/>'
        +'<circle cx="26" cy="26" r="5" fill="var(--accent)"/><circle cx="58" cy="26" r="5" fill="var(--accent)"/>'
        +'</g>';
    } else if(pattern==="pushv"){ // press militar: de pie, barra sube por encima de la cabeza
      inner='<circle cx="50" cy="20" r="7" '+B+'/>'
        +'<path d="M50 27 L50 58" '+B+'/>'
        +'<path d="M50 58 L40 90 M50 58 L60 90" '+B+'/>'
        +'<g class="demo-anim" style="--from:22px;--to:0px;animation-name:demoSlideV">'
        +'<line x1="37" y1="10" x2="63" y2="10" '+A+'/>'
        +'<circle cx="37" cy="10" r="5" fill="var(--accent)"/><circle cx="63" cy="10" r="5" fill="var(--accent)"/>'
        +'</g>';
    } else if(pattern==="pullh"){ // remo: torso inclinado hacia adelante, tira una manija hacia el torso
      inner='<circle cx="26" cy="38" r="7" '+B+'/>'
        +'<path d="M30 44 L58 74" '+B+'/>'
        +'<path d="M58 74 L50 94 M58 74 L66 92" '+B+'/>'
        +'<path d="M30 44 L34 58" '+B+'/>'
        +'<line x1="34" y1="58" x2="58" y2="58" stroke="var(--border-strong)" stroke-width="2.5" stroke-dasharray="1 7"/>'
        +'<g class="demo-anim" style="--from:24px;--to:0px;animation-name:demoSlideH">'
        +'<circle cx="34" cy="58" r="7" fill="var(--accent)"/></g>';
    } else if(pattern==="pullv"){ // dominadas/jalón: colgado de una barra, el cuerpo sube y baja
      inner='<line x1="30" y1="14" x2="70" y2="14" stroke="var(--faint)" stroke-width="4" stroke-linecap="round"/>'
        +'<path d="M34 14 L44 24 M66 14 L56 24" '+B+'/>'
        +'<g class="demo-anim" style="--from:12px;--to:0px;animation-name:demoSlideV">'
        +'<circle cx="50" cy="26" r="7" '+B+'/>'
        +'<path d="M50 33 L50 56" '+B+'/>'
        +'<path d="M50 56 L42 86 M50 56 L58 86" '+B+'/>'
        +'</g>';
    } else if(pattern==="squat"){ // sentadilla: la figura entera baja y sube contra el piso
      inner='<line x1="12" y1="95" x2="88" y2="95" stroke="var(--border-strong)" stroke-width="2.5" stroke-dasharray="1 7"/>'
        +'<g class="demo-anim" style="--from:10px;--to:0px;animation-name:demoSlideV">'
        +'<circle cx="50" cy="18" r="7" '+B+'/>'
        +'<path d="M50 25 L50 52" '+B+'/>'
        +'<path d="M50 52 L40 60 L42 82" '+B+'/>'
        +'<path d="M50 52 L60 60 L58 82" '+B+'/>'
        +'</g>';
    } else if(pattern==="hinge"){ // peso muerto: cadera fija, el torso se inclina hacia adelante
      inner='<path d="M50 58 L40 90 M50 58 L60 90" '+B+'/>'
        +'<g class="demo-anim" style="--from:0deg;--to:40deg;animation-name:demoRotate" transform-origin="50 58">'
        +'<line x1="50" y1="58" x2="50" y2="30" '+A+'/>'
        +'<circle cx="50" cy="26" r="7" fill="var(--accent)"/>'
        +'</g>';
    } else if(pattern==="elbow"){ // curl/extensión: de perfil, el antebrazo gira desde el codo
      inner='<circle cx="34" cy="18" r="7" '+B+'/>'
        +'<path d="M34 25 L34 55" '+B+'/>'
        +'<path d="M34 55 L28 90" '+B+'/>'
        +'<path d="M34 30 L34 50" '+B+'/>'
        +'<g class="demo-anim" style="--from:0deg;--to:-125deg;animation-name:demoRotate" transform-origin="34 50">'
        +'<line x1="34" y1="50" x2="34" y2="72" '+A+'/>'
        +'<circle cx="34" cy="72" r="6" fill="var(--accent)"/>'
        +'</g>';
    } else if(pattern==="raise"){ // elevaciones: de frente, el brazo sube hacia el costado
      inner='<circle cx="50" cy="18" r="7" '+B+'/>'
        +'<path d="M50 25 L50 55" '+B+'/>'
        +'<path d="M50 55 L42 90 M50 55 L58 90" '+B+'/>'
        +'<path d="M50 30 L54 52" '+B+'/>'
        +'<g class="demo-anim" style="--from:0deg;--to:-80deg;animation-name:demoRotate" transform-origin="38 30">'
        +'<line x1="38" y1="30" x2="38" y2="54" '+A+'/>'
        +'<circle cx="38" cy="54" r="6" fill="var(--accent)"/>'
        +'</g>';
    } else if(pattern==="core"){ // abdominales: acostado, rodillas flexionadas, el torso se curva hacia arriba
      inner='<path d="M40 70 L60 56" '+B+'/>'
        +'<path d="M60 56 L56 84" '+B+'/>'
        +'<g class="demo-anim" style="--from:0deg;--to:35deg;animation-name:demoRotate" transform-origin="40 70">'
        +'<line x1="40" y1="70" x2="14" y2="74" '+A+'/>'
        +'<circle cx="9" cy="74" r="7" fill="var(--accent)"/>'
        +'</g>';
    } else if(pattern==="lift"){ // gemelos/encogimientos: la figura entera hace un pulso corto hacia arriba
      inner='<line x1="20" y1="92" x2="80" y2="92" stroke="var(--border-strong)" stroke-width="2.5" stroke-dasharray="1 7"/>'
        +'<g class="demo-anim" style="--from:0px;--to:-6px;animation-name:demoSlideV">'
        +'<circle cx="50" cy="20" r="7" '+B+'/>'
        +'<path d="M50 27 L50 58" '+B+'/>'
        +'<path d="M50 58 L42 88 M50 58 L58 88" '+B+'/>'
        +'<path d="M40 88 L44 88 M56 88 L60 88" stroke="var(--accent)" stroke-width="5.5" stroke-linecap="round"/>'
        +'</g>';
    } else {
      return '<svg viewBox="0 0 24 24" fill="none">'
        +'<g class="demo-anim-pulse" transform-origin="12 12">'
        +'<path d="M4 9v6M7 5v14M17 5v14M20 9v6M7 12h10" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round"/></g></svg>';
    }
    return '<svg viewBox="0 0 100 100" fill="none">'+inner+'</svg>';
  }
  function openExerciseDemo(name){
    var demo=detectDemo(name);
    var q=encodeURIComponent(name+" tecnica ejercicio");
    var html='<div class="grab"></div><h3>'+esc(name)+'</h3>';
    html+='<div class="muted" style="margin-top:-8px;margin-bottom:2px;font-size:13px">'+esc(findMuscle(name))+'</div>';
    html+='<div class="demo-wrap">'+demoSvg(demo.pattern)+'</div>';
    html+='<div class="demo-cue"><b>Cómo hacerlo</b>'+esc(demo.cue)+'</div>';
    html+='<a class="demo-video" href="https://www.youtube.com/results?search_query='+q+'" target="_blank" rel="noopener noreferrer">'
      +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>'
      +'Buscar video de referencia</a>';
    openModal(html);
  }

  function allExercises(){
    var map={};
    CATALOG.forEach(function(x){map[norm(x.n)]={n:x.n,m:x.m};});
    (DB.customExercises||[]).forEach(function(x){var n=x.n||x.name; if(n)map[norm(n)]={n:n,m:x.m||"Otro"};});
    return Object.keys(map).map(function(k){return map[k];});
  }
  function findMuscle(name){
    var k=norm(name),all=allExercises();
    for(var i=0;i<all.length;i++) if(norm(all[i].n)===k) return all[i].m;
    return "Otro";
  }

  /* ---------------- draft (active workout) ---------------- */
  var draft=null; // {name, date, exercises:[{name, sets:[{w,r,done}]}]}
  try{var dr=localStorage.getItem(KEY+".draft"); if(dr) draft=JSON.parse(dr);}catch(e){}
  function saveDraft(){ try{ draft? localStorage.setItem(KEY+".draft",JSON.stringify(draft)) : localStorage.removeItem(KEY+".draft"); }catch(e){} }

  /* ---------------- rest timer ---------------- */
  var REST_SECONDS_KEY=KEY+".restSeconds", REST_TIMER_KEY=KEY+".restTimer";
  var restDuration=90;
  try{var rds=localStorage.getItem(REST_SECONDS_KEY); if(rds) restDuration=Math.max(5,Math.min(600,+rds||90));}catch(e){}
  function saveRestDuration(){ try{localStorage.setItem(REST_SECONDS_KEY,String(restDuration));}catch(e){} }

  var restTimer=null; // {endsAt, duration, state:"running"|"done"}
  try{var rt=localStorage.getItem(REST_TIMER_KEY); if(rt){var o=JSON.parse(rt); if(o&&o.state==="running"&&o.endsAt>Date.now()) restTimer=o;}}catch(e){}
  function saveRestTimer(){ try{ restTimer? localStorage.setItem(REST_TIMER_KEY,JSON.stringify(restTimer)) : localStorage.removeItem(REST_TIMER_KEY); }catch(e){} }

  function startRest(sec){ restTimer={endsAt:Date.now()+sec*1000,duration:sec,state:"running"}; saveRestTimer(); renderRestBar(); }
  function clearRest(){ if(!restTimer)return; restTimer=null; saveRestTimer(); renderRestBar(); }
  function skipRest(){ clearRest(); }
  function bumpRest(delta){
    if(!restTimer)return;
    restTimer.endsAt+=delta*1000;
    if(restTimer.endsAt<=Date.now()) restTimer.endsAt=Date.now()+1000;
    restTimer.state="running";
    saveRestTimer(); renderRestBar();
  }
  function beep(){
    try{
      var Ctx=window.AudioContext||window.webkitAudioContext; if(!Ctx)return;
      var ctx=new Ctx();
      [0,1].forEach(function(i){
        var o=ctx.createOscillator(),g=ctx.createGain();
        o.type="sine"; o.frequency.value=880;
        o.connect(g); g.connect(ctx.destination);
        var t=ctx.currentTime+i*0.22;
        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.22,t+.02); g.gain.linearRampToValueAtTime(0,t+.18);
        o.start(t); o.stop(t+.2);
      });
      setTimeout(function(){ctx.close();},700);
    }catch(e){}
  }
  function renderRestBar(){
    var bar=el("restBar"); if(!bar)return;
    if(!restTimer){ bar.classList.remove("show","done"); return; }
    var nav=document.querySelector("nav.tabs");
    bar.style.bottom=(nav?nav.offsetHeight:64)+"px";
    var remaining=Math.max(0,Math.ceil((restTimer.endsAt-Date.now())/1000));
    if(restTimer.state==="running" && remaining<=0){
      restTimer.state="done"; saveRestTimer();
      beep();
      if(navigator.vibrate) try{navigator.vibrate([160,80,160]);}catch(e){}
      toast("¡Descanso terminado! 💪");
      setTimeout(function(){ if(restTimer && restTimer.state==="done") clearRest(); },5000);
    }
    bar.classList.add("show");
    bar.classList.toggle("done",restTimer.state==="done");
    var mm=Math.floor(remaining/60),ss=remaining%60;
    el("restTime").textContent = restTimer.state==="done" ? "¡Listo!" : (mm+":"+(ss<10?"0":"")+ss);
    var pct = restTimer.state==="done" ? 0 : Math.max(0,Math.min(100, remaining/restTimer.duration*100));
    el("restCard").style.setProperty("--rest-pct",pct+"%");
  }
  setInterval(function(){ if(restTimer) renderRestBar(); },500);

  /* ---------------- navigation ---------------- */
  var current="hoy";
  function go(tab){
    current=tab;
    document.querySelectorAll(".tab").forEach(function(b){b.classList.toggle("active",b.dataset.tab===tab);});
    document.querySelectorAll(".view").forEach(function(v){v.classList.remove("active");});
    el("view-"+tab).classList.add("active");
    render();
    document.querySelector("main").scrollTop=0; window.scrollTo(0,0);
  }
  document.querySelectorAll(".tab").forEach(function(b){b.addEventListener("click",function(){go(b.dataset.tab);});});

  function render(){
    if(current==="hoy") renderHoy();
    else if(current==="rutinas") renderRutinas();
    else if(current==="progreso") renderProgreso();
    else if(current==="cuerpo") renderCuerpo();
  }

  /* ============================================================
     HOY
     ============================================================ */
  function renderHoy(){
    var v=el("view-hoy");
    if(draft){ renderActive(v); return; }
    var html="";
    html+='<div class="eyebrow">Hoy</div>';
    html+='<div class="h-date">'+fmtLong(todayISO())+'</div>';

    html+='<div class="section-title">Empezar entrenamiento</div>';
    if(DB.routines.length){
      html+='<div class="row wrap" style="gap:10px">';
      DB.routines.forEach(function(r){
        html+='<button class="chip" data-start-routine="'+r.id+'">'+esc(r.name)+'</button>';
      });
      html+='</div>';
    }
    html+='<button class="btn primary" data-start-free style="margin-top:12px">＋ Entrenamiento libre</button>';

    // history
    var s=DB.sessions.slice().sort(function(a,b){return a.date<b.date?1:-1;});
    html+='<div class="section-title">Historial <span class="count">'+s.length+'</span></div>';
    if(!s.length){
      html+='<div class="empty"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9v6M7 5v14M17 5v14M20 9v6M7 12h10"/></svg><div>Todavía no registraste entrenamientos.<br>Arrancá con una rutina o libre.</div></div>';
    }else{
      html+='<div class="card">';
      s.slice(0,12).forEach(function(x){
        var nSets=0,vol=0; (x.exercises||[]).forEach(function(e){(e.sets||[]).forEach(function(st){nSets++;vol+=(+st.w||0)*(+st.r||0);});});
        var d=parseISO(x.date);
        html+='<div class="hist" data-open-session="'+x.id+'">'
          +'<div class="d"><b class="tnum">'+d.getDate()+'</b><span>'+MES[d.getMonth()]+'</span></div>'
          +'<div class="meta"><b>'+esc(x.name)+'</b><span>'+(x.exercises||[]).length+' ej · '+nSets+' series · '+Math.round(vol).toLocaleString("es")+' kg vol</span></div>'
          +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="muted"><path d="M9 6l6 6-6 6"/></svg>'
          +'</div>';
      });
      html+='</div>';
    }
    v.innerHTML=html;

    v.querySelectorAll("[data-start-routine]").forEach(function(b){b.onclick=function(){startFromRoutine(b.dataset.startRoutine);};});
    v.querySelector("[data-start-free]").onclick=startFree;
    v.querySelectorAll("[data-open-session]").forEach(function(b){b.onclick=function(){openSession(b.dataset.openSession);};});
  }

  function startFree(){
    draft={name:"Entrenamiento libre",date:todayISO(),exercises:[]};
    saveDraft(); clearRest(); addExercisePrompt();
  }
  function startFromRoutine(id){
    var r=DB.routines.find(function(x){return x.id===id;}); if(!r)return;
    draft={name:r.name,date:todayISO(),exercises:r.exercises.map(function(e){
      var sets=[]; for(var i=0;i<(e.sets||1);i++) sets.push({w:"",r:e.reps||"",done:false});
      return {name:e.name,sets:sets};
    })};
    saveDraft(); clearRest(); renderHoy();
  }

  function renderActive(v){
    var html="";
    html+='<div class="row" style="align-items:center;justify-content:space-between">';
    html+='<div><div class="eyebrow">En curso</div><div class="h-date" style="font-size:23px">'+esc(draft.name)+'</div></div>';
    html+='<button class="btn ghost sm" data-rename>✎</button>';
    html+='</div>';

    var totalVol=0,doneSets=0,allSets=0;
    draft.exercises.forEach(function(e){e.sets.forEach(function(s){allSets++; if(s.done){doneSets++; totalVol+=(+s.w||0)*(+s.r||0);}});});
    html+='<div class="row" style="gap:8px;margin-top:12px">';
    html+='<span class="pill accent">'+doneSets+'/'+allSets+' series</span>';
    html+='<span class="pill">'+Math.round(totalVol).toLocaleString("es")+' kg volumen</span>';
    html+='<button class="pill" data-rest-cfg>⏱ '+restDuration+'s descanso</button>';
    html+='</div>';

    draft.exercises.forEach(function(e,ei){
      html+='<div class="exercise">';
      html+='<header><div style="flex:1;min-width:0"><span class="name">'+esc(e.name)+'</span>'
        +'<button class="ex-help" data-exhelp="'+ei+'">¿No sabés qué ejercicio es?</button></div>'
        +'<button class="del-x" data-delex="'+ei+'">✕</button></header>';
      html+='<div class="sets">';
      html+='<div class="set-head"><div>#</div><div>KG</div><div>REPS</div><div></div><div></div></div>';
      e.sets.forEach(function(s,si){
        html+='<div class="set-row'+(s.done?' done':'')+'" data-ei="'+ei+'" data-si="'+si+'">'
          +'<div class="idx">'+(si+1)+'</div>'
          +'<input type="number" inputmode="decimal" class="in-w" value="'+esc(s.w)+'" placeholder="—">'
          +'<input type="number" inputmode="numeric" class="in-r" value="'+esc(s.r)+'" placeholder="—">'
          +'<button class="chk'+(s.done?' on':'')+'" data-toggle aria-label="Serie hecha">'
          +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'
          +'</button>'
          +'<button class="x-set" data-delset aria-label="Eliminar serie">✕</button>'
          +'</div>';
      });
      html+='<button class="btn ghost sm" data-addset="'+ei+'" style="margin-top:8px">＋ Serie</button>';
      html+='</div></div>';
    });

    html+='<button class="btn ghost" data-addex style="margin-top:14px">＋ Agregar ejercicio</button>';
    html+='<div class="row" style="margin-top:18px">';
    html+='<button class="btn danger" data-discard>Descartar</button>';
    html+='<button class="btn primary" data-finish>Guardar sesión</button>';
    html+='</div>';
    v.innerHTML=html;

    // wire inputs
    v.querySelectorAll(".set-row").forEach(function(row){
      var ei=+row.dataset.ei, si=+row.dataset.si;
      row.querySelector(".in-w").addEventListener("input",function(){draft.exercises[ei].sets[si].w=this.value;saveDraft();});
      row.querySelector(".in-r").addEventListener("input",function(){draft.exercises[ei].sets[si].r=this.value;saveDraft();});
      row.querySelector("[data-toggle]").addEventListener("click",function(){
        var st=draft.exercises[ei].sets[si]; st.done=!st.done; saveDraft();
        if(st.done) startRest(restDuration);
        renderHoy();
      });
      row.querySelector("[data-delset]").addEventListener("click",function(){
        var st=draft.exercises[ei].sets[si];
        var hasData=st.done||(st.w!==""&&st.w!=null)||(st.r!==""&&st.r!=null);
        function drop(){ draft.exercises[ei].sets.splice(si,1); saveDraft(); renderHoy(); }
        if(hasData){
          confirmModal("¿Eliminar la serie "+(si+1)+"?","Se perderán los datos cargados.",drop);
        }else{
          drop();
        }
      });
    });
    v.querySelectorAll("[data-addset]").forEach(function(b){b.onclick=function(){
      var ei=+b.dataset.addset; var last=draft.exercises[ei].sets.slice(-1)[0];
      draft.exercises[ei].sets.push({w:last?last.w:"",r:last?last.r:"",done:false}); saveDraft(); renderHoy();
    };});
    v.querySelectorAll("[data-delex]").forEach(function(b){b.onclick=function(){
      draft.exercises.splice(+b.dataset.delex,1); saveDraft(); renderHoy();
    };});
    v.querySelectorAll("[data-exhelp]").forEach(function(b){b.onclick=function(){
      openExerciseDemo(draft.exercises[+b.dataset.exhelp].name);
    };});
    v.querySelector("[data-addex]").onclick=addExercisePrompt;
    v.querySelector("[data-rest-cfg]").onclick=function(){
      modalInput("Descanso entre series (segundos)",String(restDuration),function(val){
        var n=parseInt(val,10);
        if(n>0){ restDuration=Math.max(5,Math.min(600,n)); saveRestDuration(); }
        renderHoy();
      });
    };
    v.querySelector("[data-rename]").onclick=function(){
      modalInput("Nombre del entrenamiento",draft.name,function(val){draft.name=val||draft.name;saveDraft();renderHoy();});
    };
    v.querySelector("[data-discard]").onclick=function(){
      confirmModal("¿Descartar este entrenamiento?","Se perderá lo que cargaste.",function(){draft=null;saveDraft();clearRest();renderHoy();});
    };
    v.querySelector("[data-finish]").onclick=finishSession;
  }

  function addExercise(name){
    name=String(name==null?"":name).trim(); if(!name)return;
    if(!draft){draft={name:"Entrenamiento libre",date:todayISO(),exercises:[]};}
    draft.exercises.push({name:name,sets:[{w:"",r:"",done:false},{w:"",r:"",done:false},{w:"",r:"",done:false}]});
    saveDraft(); closeModal(); renderHoy();
  }

  function addExercisePrompt(){
    var query="",activeMuscle=null;
    var freq={}; DB.sessions.forEach(function(s){(s.exercises||[]).forEach(function(e){freq[e.name]=(freq[e.name]||0)+1;});});

    var html='<div class="grab"></div><h3>Agregar ejercicio</h3>';
    html+='<div class="ex-top">';
    html+='<input type="text" id="exSearch" placeholder="Buscá músculo o nombre (ej: pecho, press...)" autocomplete="off" autocapitalize="none">';
    html+='<div class="row wrap" id="muscleChips" style="gap:7px;margin:12px 0 4px"></div>';
    html+='</div>';
    html+='<div id="exResults"></div>';
    openModal(html);

    function renderChips(){
      var c=el("muscleChips");
      var h='<button class="chip'+(!activeMuscle?' on':'')+'" data-m="">Todos</button>';
      MUSCLES.forEach(function(m){h+='<button class="chip'+(activeMuscle===m?' on':'')+'" data-m="'+esc(m)+'">'+esc(m)+'</button>';});
      c.innerHTML=h;
      c.querySelectorAll("[data-m]").forEach(function(b){b.onclick=function(){activeMuscle=b.dataset.m||null;renderChips();renderResults();};});
    }

    function chipRow(items){
      var h='<div class="row wrap" style="gap:8px;margin-bottom:10px">';
      items.forEach(function(n){h+='<button class="chip" data-add="'+esc(n)+'">'+esc(n)+'</button>';});
      return h+'</div>';
    }

    function renderResults(){
      var q=norm(query),all=allExercises(),out="";
      if(!q && !activeMuscle){
        var top=Object.keys(freq).sort(function(a,b){return freq[b]-freq[a];}).slice(0,10);
        if(top.length){ out+='<div class="cat-h">Frecuentes</div>'+chipRow(top); }
        out+='<div class="empty" style="margin-top:4px;font-size:13px">Tocá un grupo muscular arriba, o escribí para buscar (ej: <b>pecho</b>, <b>espalda</b>, <b>press</b>).</div>';
      }else{
        var matches=all.filter(function(x){
          if(activeMuscle && x.m!==activeMuscle) return false;
          if(!q) return true;
          return norm(x.n).indexOf(q)>=0 || norm(x.m).indexOf(q)>=0;
        });
        var groups={}; matches.forEach(function(x){(groups[x.m]=groups[x.m]||[]).push(x);});
        MUSCLES.concat(["Otro"]).forEach(function(m){
          var g=groups[m]; if(!g||!g.length) return;
          g.sort(function(a,b){return a.n<b.n?-1:1;});
          out+='<div class="cat-h">'+esc(m)+' <span class="muted" style="font-weight:500">'+g.length+'</span></div>'+chipRow(g.map(function(x){return x.n;}));
        });
        if(!matches.length) out+='<div class="empty" style="margin-top:6px;font-size:13px">Sin resultados en el catálogo.</div>';
        var exact=q && all.some(function(x){return norm(x.n)===q;});
        if(query.trim() && !exact){
          out+='<div class="cat-h">Agregar nuevo</div>';
          out+='<p class="muted" style="font-size:13px;margin:0 0 8px">Elegí el músculo para "<b>'+esc(query.trim())+'</b>":</p>';
          out+='<div class="row wrap" style="gap:7px">';
          MUSCLES.concat(["Otro"]).forEach(function(m){out+='<button class="chip" data-new="'+esc(m)+'">'+esc(m)+'</button>';});
          out+='</div>';
        }
      }
      var box=el("exResults"); box.innerHTML=out;
      box.querySelectorAll("[data-add]").forEach(function(b){b.onclick=function(){addExercise(b.dataset.add);};});
      box.querySelectorAll("[data-new]").forEach(function(b){b.onclick=function(){
        var name=query.trim(); if(!name)return;
        if(!allExercises().some(function(x){return norm(x.n)===norm(name);})){ DB.customExercises.push({n:name,m:b.dataset.new}); save(); }
        addExercise(name);
      };});
    }

    var input=el("exSearch"); setTimeout(function(){input.focus();},80);
    input.addEventListener("input",function(){query=this.value;renderResults();});
    input.addEventListener("keydown",function(e){
      if(e.key!=="Enter")return;
      var q=norm(query),all=allExercises();
      var hit=all.filter(function(x){return norm(x.n)===q;})[0] ||
              all.filter(function(x){return q&&(norm(x.n).indexOf(q)>=0||norm(x.m).indexOf(q)>=0)&&(!activeMuscle||x.m===activeMuscle);})[0];
      if(hit) addExercise(hit.n);
    });
    renderChips(); renderResults();
  }

  function finishSession(){
    // keep only sets that have weight or reps; mark done sets as the record
    var ex=draft.exercises.map(function(e){
      return {name:e.name,sets:e.sets.filter(function(s){return (s.w!==""&&s.w!=null)||(s.r!==""&&s.r!=null);}).map(function(s){return {w:+s.w||0,r:+s.r||0};})};
    }).filter(function(e){return e.sets.length;});
    if(!ex.length){toast("Cargá al menos una serie");return;}
    DB.sessions.push({id:uid(),name:draft.name,date:draft.date,exercises:ex});
    save(); draft=null; saveDraft(); clearRest();
    toast("¡Sesión guardada! 💪"); go("hoy");
  }

  function openSession(id){
    var s=DB.sessions.find(function(x){return x.id===id;}); if(!s)return;
    var html='<div class="grab"></div><h3>'+esc(s.name)+'</h3>';
    html+='<div class="muted" style="margin-top:-8px;margin-bottom:14px">'+fmtLong(s.date)+'</div>';
    s.exercises.forEach(function(e){
      var best=0; e.sets.forEach(function(st){if((+st.w||0)>best)best=+st.w;});
      html+='<div class="exercise"><header><span class="name">'+esc(e.name)+'</span><span class="pill accent">'+best+' kg</span></header><div class="sets">';
      html+='<div class="set-head"><div>#</div><div>KG</div><div>REPS</div><div>1RM</div></div>';
      e.sets.forEach(function(st,i){
        html+='<div class="set-row"><div class="idx">'+(i+1)+'</div><div class="tnum" style="text-align:center;padding:9px 0">'+st.w+'</div><div class="tnum" style="text-align:center;padding:9px 0">'+st.r+'</div><div class="tnum muted" style="text-align:center;padding:9px 0">'+epley(st.w,st.r)+'</div></div>';
      });
      html+='</div></div>';
    });
    html+='<button class="btn danger" id="delSess" style="margin-top:16px">Eliminar entrenamiento</button>';
    openModal(html);
    el("delSess").onclick=function(){
      DB.sessions=DB.sessions.filter(function(x){return x.id!==id;}); save(); closeModal(); renderHoy();
      toast("Entrenamiento eliminado");
    };
  }

  /* ============================================================
     RUTINAS
     ============================================================ */
  function renderRutinas(){
    var v=el("view-rutinas");
    var html='<div class="eyebrow">Tus rutinas</div><div class="h-date" style="font-size:24px">Plan de entrenamiento</div>';
    if(!DB.routines.length){
      html+='<div class="empty" style="margin-top:16px">Sin rutinas todavía. Creá tu primer día de entreno.</div>';
    }
    DB.routines.forEach(function(r){
      html+='<div class="card" style="margin-top:12px" data-routine="'+r.id+'">';
      html+='<div class="row" style="align-items:center;justify-content:space-between">';
      html+='<div style="display:flex;align-items:center;gap:10px"><span class="pill accent">'+esc(r.day||"—")+'</span><b style="font-family:Oswald;text-transform:uppercase;letter-spacing:.03em;font-size:17px">'+esc(r.name)+'</b></div>';
      html+='<button class="del-x" data-delroutine="'+r.id+'">✕</button></div>';
      html+='<div class="muted" style="font-size:13px;margin:8px 0 4px">'+r.exercises.length+' ejercicios · '+r.exercises.reduce(function(a,e){return a+(e.sets||0);},0)+' series objetivo</div>';
      r.exercises.forEach(function(e){
        html+='<div class="list-line"><div class="ln"><b>'+esc(e.name)+'</b></div><span class="tnum muted">'+(e.sets||0)+'×'+(e.reps||0)+'</span></div>';
      });
      html+='<div class="row" style="margin-top:12px"><button class="btn ghost sm" data-editroutine="'+r.id+'">Editar</button><button class="btn primary sm" data-startroutine="'+r.id+'" style="flex:1">Empezar hoy</button></div>';
      html+='</div>';
    });
    html+='<button class="btn ghost" id="newRoutine" style="margin-top:14px">＋ Nueva rutina</button>';
    v.innerHTML=html;

    v.querySelector("#newRoutine").onclick=function(){editRoutine(null);};
    v.querySelectorAll("[data-editroutine]").forEach(function(b){b.onclick=function(){editRoutine(b.dataset.editroutine);};});
    v.querySelectorAll("[data-delroutine]").forEach(function(b){b.onclick=function(){
      confirmModal("¿Eliminar rutina?","",function(){DB.routines=DB.routines.filter(function(x){return x.id!==b.dataset.delroutine;});save();renderRutinas();});
    };});
    v.querySelectorAll("[data-startroutine]").forEach(function(b){b.onclick=function(){startFromRoutine(b.dataset.startroutine);go("hoy");};});
  }

  var DAYS=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
  function editRoutine(id){
    var r=id? JSON.parse(JSON.stringify(DB.routines.find(function(x){return x.id===id;}))) : {id:uid(),name:"",day:"Lun",exercises:[]};
    function draw(){
      var html='<div class="grab"></div><h3>'+(id?"Editar rutina":"Nueva rutina")+'</h3>';
      html+='<label class="field"><span>Nombre</span><input type="text" id="rName" value="'+esc(r.name)+'" placeholder="Ej: Empuje (Push)"></label>';
      html+='<label class="field"><span>Día</span><div class="row wrap" style="gap:7px" id="dayRow">';
      DAYS.forEach(function(d){html+='<button class="chip'+(r.day===d?' on':'')+'" data-day="'+d+'">'+d+'</button>';});
      html+='</div></label>';
      html+='<div class="muted" style="font-size:12px;margin:6px 0 8px;font-weight:600">EJERCICIOS</div>';
      r.exercises.forEach(function(e,i){
        html+='<div class="list-line"><div class="ln"><b>'+esc(e.name||"—")+'</b></div>'
          +'<input type="number" class="tnum" style="width:52px;text-align:center" value="'+(e.sets||"")+'" data-rs="'+i+'" aria-label="series">'
          +'<span class="muted">×</span>'
          +'<input type="number" class="tnum" style="width:52px;text-align:center" value="'+(e.reps||"")+'" data-rr="'+i+'" aria-label="reps">'
          +'<button class="del-x" data-delre="'+i+'">✕</button></div>';
      });
      html+='<button class="btn ghost sm" id="addRe" style="margin-top:10px">＋ Ejercicio</button>';
      html+='<button class="btn primary" id="saveRoutine" style="margin-top:16px">Guardar rutina</button>';
      el("modal").innerHTML=html;

      el("rName").addEventListener("input",function(){r.name=this.value;});
      el("dayRow").querySelectorAll("[data-day]").forEach(function(b){b.onclick=function(){r.day=b.dataset.day;draw();};});
      el("modal").querySelectorAll("[data-rs]").forEach(function(inp){inp.addEventListener("input",function(){r.exercises[+inp.dataset.rs].sets=+inp.value||0;});});
      el("modal").querySelectorAll("[data-rr]").forEach(function(inp){inp.addEventListener("input",function(){r.exercises[+inp.dataset.rr].reps=+inp.value||0;});});
      el("modal").querySelectorAll("[data-delre]").forEach(function(b){b.onclick=function(){r.exercises.splice(+b.dataset.delre,1);draw();};});
      el("addRe").onclick=function(){
        modalInput("Nombre del ejercicio","",function(val){if(val){r.exercises.push({name:val,sets:3,reps:10});draw();}});
      };
      el("saveRoutine").onclick=function(){
        if(!r.name.trim()){toast("Poné un nombre");return;}
        var i=DB.routines.findIndex(function(x){return x.id===r.id;});
        if(i>=0)DB.routines[i]=r; else DB.routines.push(r);
        save(); closeModal(); renderRutinas(); toast("Rutina guardada");
      };
    }
    openModal("<div></div>"); draw();
  }

  /* ============================================================
     PROGRESO
     ============================================================ */
  var progEx=null;
  function exerciseNames(){
    var m={}; DB.sessions.forEach(function(s){(s.exercises||[]).forEach(function(e){m[e.name]=1;});});
    return Object.keys(m).sort();
  }
  function renderProgreso(){
    var v=el("view-progreso");
    var names=exerciseNames();
    var html='<div class="eyebrow">Progreso</div><div class="h-date" style="font-size:24px">Tu evolución</div>';
    if(!names.length){
      html+='<div class="empty" style="margin-top:16px"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6"/></svg><div>Registrá entrenamientos y acá vas a ver tus gráficas y récords por ejercicio.</div></div>';
      v.innerHTML=html; return;
    }
    if(!progEx||names.indexOf(progEx)<0) progEx=names[0];
    html+='<label class="field" style="margin-top:14px"><span>Ejercicio</span><select id="exSel">';
    names.forEach(function(n){html+='<option'+(n===progEx?' selected':'')+'>'+esc(n)+'</option>';});
    html+='</select></label>';

    // gather data points per session date: best weight, best est1RM, volume
    var pts=[];
    DB.sessions.slice().sort(function(a,b){return a.date<b.date?-1:1;}).forEach(function(s){
      var e=(s.exercises||[]).find(function(x){return x.name===progEx;}); if(!e)return;
      var bw=0,b1=0,vol=0;
      e.sets.forEach(function(st){ if(st.w>bw)bw=st.w; var o=epley(st.w,st.r); if(o>b1)b1=o; vol+=st.w*st.r;});
      pts.push({date:s.date,w:bw,rm:b1,vol:Math.round(vol)});
    });

    // PR cards
    var prW=0,pr1=0,prV=0,prWd="",pr1d="";
    pts.forEach(function(p){if(p.w>prW){prW=p.w;prWd=p.date;} if(p.rm>pr1){pr1=p.rm;pr1d=p.date;} if(p.vol>prV)prV=p.vol;});
    html+='<div class="section-title">Récords (PRs)</div>';
    html+='<div class="stat-grid">';
    html+='<div class="stat"><div class="k">Máx peso</div><div class="v tnum">'+prW+'<small>kg</small></div><div class="sub">'+(prWd?fmtShort(prWd):"")+'</div></div>';
    html+='<div class="stat"><div class="k">1RM estimado</div><div class="v tnum">'+pr1+'<small>kg</small></div><div class="sub">'+(pr1d?fmtShort(pr1d):"")+'</div></div>';
    html+='<div class="stat"><div class="k">Máx volumen</div><div class="v tnum">'+prV.toLocaleString("es")+'<small>kg</small></div><div class="sub">en una sesión</div></div>';
    html+='<div class="stat"><div class="k">Sesiones</div><div class="v tnum">'+pts.length+'</div><div class="sub">con este ejercicio</div></div>';
    html+='</div>';

    html+='<div class="section-title">Peso máximo por sesión</div>';
    html+='<div class="card chart-wrap" id="chartW"></div>';
    html+='<div class="section-title">1RM estimado</div>';
    html+='<div class="card chart-wrap" id="chart1"></div>';

    v.innerHTML=html;
    el("exSel").onchange=function(){progEx=this.value;renderProgreso();};
    drawChart(el("chartW"),pts.map(function(p){return {x:p.date,y:p.w};}),"kg");
    drawChart(el("chart1"),pts.map(function(p){return {x:p.date,y:p.rm};}),"kg");
  }

  /* ============================================================
     CUERPO
     ============================================================ */
  var MEASURES=["Cuello","Pecho","Brazo","Cintura","Cadera","Muslo","Pantorrilla"];
  function renderCuerpo(){
    var v=el("view-cuerpo");
    var b=DB.body.slice().sort(function(a,b){return a.date<b.date?-1:1;});
    var last=b.length?b[b.length-1]:null;
    var first=b.length?b[0]:null;
    var html='<div class="eyebrow">Cuerpo</div><div class="h-date" style="font-size:24px">Progreso corporal</div>';

    html+='<div class="stat-grid" style="margin-top:14px">';
    var cur=last&&last.weight?last.weight:"—";
    var diff=(last&&first&&last.weight&&first.weight)?(last.weight-first.weight):null;
    html+='<div class="stat"><div class="k">Peso actual</div><div class="v tnum">'+cur+(cur!=="—"?'<small>kg</small>':'')+'</div><div class="sub">'+(last?fmtShort(last.date):"sin datos")+'</div></div>';
    html+='<div class="stat"><div class="k">Variación total</div><div class="v tnum" style="color:'+(diff==null?'var(--text)':(diff<0?'var(--good)':'var(--accent)'))+'">'+(diff==null?"—":(diff>0?"+":"")+diff.toFixed(1)+"<small>kg</small>")+'</div><div class="sub">'+(b.length>1?"desde "+fmtShort(first.date):"cargá 2+ registros")+'</div></div>';
    html+='</div>';

    html+='<button class="btn primary" id="addBody" style="margin-top:14px">＋ Registrar medición</button>';

    if(b.length){
      html+='<div class="section-title">Peso corporal</div><div class="card chart-wrap" id="bChart"></div>';
      html+='<div class="section-title">Historial <span class="count">'+b.length+'</span></div><div class="card">';
      b.slice().reverse().forEach(function(x){
        var ms=MEASURES.filter(function(m){return x.measures&&x.measures[m];}).map(function(m){return m.slice(0,3)+" "+x.measures[m];}).join(" · ");
        html+='<div class="hist" data-editbody="'+x.id+'"><div class="d"><b class="tnum">'+parseISO(x.date).getDate()+'</b><span>'+MES[parseISO(x.date).getMonth()]+'</span></div>'
          +'<div class="meta"><b class="tnum">'+(x.weight||"—")+' kg</b><span>'+(ms||"sin medidas")+'</span></div>'
          +'<button class="del-x" data-delbody="'+x.id+'">✕</button></div>';
      });
      html+='</div>';
    }else{
      html+='<div class="empty" style="margin-top:16px">Registrá tu peso y medidas para ver la evolución.</div>';
    }
    v.innerHTML=html;
    el("addBody").onclick=function(){editBody(null);};
    v.querySelectorAll("[data-editbody]").forEach(function(b2){b2.onclick=function(e){ if(e.target.closest("[data-delbody]"))return; editBody(b2.dataset.editbody);};});
    v.querySelectorAll("[data-delbody]").forEach(function(b2){b2.onclick=function(e){e.stopPropagation();
      DB.body=DB.body.filter(function(x){return x.id!==b2.dataset.delbody;});save();renderCuerpo();toast("Registro eliminado");};});
    if(b.length) drawChart(el("bChart"),b.map(function(x){return {x:x.date,y:x.weight};}).filter(function(p){return p.y;}),"kg");
  }

  function editBody(id){
    var rec=id? JSON.parse(JSON.stringify(DB.body.find(function(x){return x.id===id;}))) : {id:uid(),date:todayISO(),weight:"",measures:{}};
    if(!rec.measures)rec.measures={};
    var html='<div class="grab"></div><h3>'+(id?"Editar medición":"Nueva medición")+'</h3>';
    html+='<div class="row"><label class="field" style="flex:1"><span>Fecha</span><input type="date" id="bDate" value="'+esc(rec.date)+'"></label>';
    html+='<label class="field" style="flex:1"><span>Peso (kg)</span><input type="number" inputmode="decimal" id="bW" value="'+esc(rec.weight)+'" placeholder="—"></label></div>';
    html+='<div class="muted" style="font-size:12px;margin:2px 0 8px;font-weight:600">MEDIDAS (cm) · opcional</div>';
    html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
    MEASURES.forEach(function(m){
      html+='<label class="field" style="margin-bottom:2px"><span>'+m+'</span><input type="number" inputmode="decimal" data-m="'+m+'" value="'+esc(rec.measures[m]||"")+'" placeholder="—"></label>';
    });
    html+='</div>';
    html+='<button class="btn primary" id="saveBody" style="margin-top:16px">Guardar</button>';
    openModal(html);
    el("saveBody").onclick=function(){
      rec.date=el("bDate").value||todayISO();
      rec.weight=el("bW").value?+el("bW").value:"";
      rec.measures={};
      el("modal").querySelectorAll("[data-m]").forEach(function(inp){if(inp.value)rec.measures[inp.dataset.m]=+inp.value;});
      if(!rec.weight && !Object.keys(rec.measures).length){toast("Cargá al menos el peso");return;}
      var i=DB.body.findIndex(function(x){return x.id===rec.id;});
      if(i>=0)DB.body[i]=rec; else DB.body.push(rec);
      save(); closeModal(); renderCuerpo(); toast("Medición guardada");
    };
  }

  /* ============================================================
     CHART (inline SVG line, theme-aware via CSS vars)
     ============================================================ */
  function drawChart(container,data,unit){
    data=data.filter(function(d){return d.y!=null&&d.y!==""&&!isNaN(d.y);});
    if(data.length<1){container.innerHTML='<div class="muted" style="padding:20px 4px;text-align:center;font-size:13px">Sin datos suficientes todavía.</div>';return;}
    var W=440,H=170,pL=34,pR=12,pT=14,pB=26;
    var ys=data.map(function(d){return +d.y;});
    var min=Math.min.apply(null,ys),max=Math.max.apply(null,ys);
    if(min===max){min=min-Math.max(1,min*0.05);max=max+Math.max(1,max*0.05);}
    var pad=(max-min)*0.15; min-=pad; max+=pad;
    var n=data.length;
    function X(i){return n===1? (pL+(W-pL-pR)/2) : pL+i*(W-pL-pR)/(n-1);}
    function Y(v){return pT+(H-pT-pB)*(1-(v-min)/(max-min));}

    var grid="",labels="";
    for(var g=0;g<=3;g++){
      var gy=pT+(H-pT-pB)*g/3; var gv=max-(max-min)*g/3;
      grid+='<line class="grid" x1="'+pL+'" y1="'+gy.toFixed(1)+'" x2="'+(W-pR)+'" y2="'+gy.toFixed(1)+'"/>';
      labels+='<text class="axis" x="'+(pL-6)+'" y="'+(gy+3).toFixed(1)+'" text-anchor="end">'+Math.round(gv)+'</text>';
    }
    var dpath="",area="";
    data.forEach(function(d,i){var x=X(i).toFixed(1),y=Y(+d.y).toFixed(1);dpath+=(i?"L":"M")+x+" "+y+" ";});
    area="M"+X(0).toFixed(1)+" "+Y(+data[0].y).toFixed(1)+" "+dpath.replace(/^M[^L]*/,"").replace(/^/,"")+"L"+X(n-1).toFixed(1)+" "+(H-pB)+" L"+X(0).toFixed(1)+" "+(H-pB)+" Z";
    // rebuild area cleanly
    area="M"+X(0).toFixed(1)+" "+(H-pB);
    data.forEach(function(d,i){area+=" L"+X(i).toFixed(1)+" "+Y(+d.y).toFixed(1);});
    area+=" L"+X(n-1).toFixed(1)+" "+(H-pB)+" Z";

    var dots="";
    data.forEach(function(d,i){
      var last=i===n-1;
      dots+='<circle class="'+(last?'dot-end':'dot')+'" cx="'+X(i).toFixed(1)+'" cy="'+Y(+d.y).toFixed(1)+'" r="'+(last?4.5:3.2)+'"/>';
    });
    // x labels: first, middle, last
    var xl="";
    var idxs=n===1?[0]:(n===2?[0,1]:[0,Math.floor((n-1)/2),n-1]);
    idxs.forEach(function(i){xl+='<text class="axis" x="'+X(i).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+fmtShort(data[i].x)+'</text>';});

    var endLabel='<text x="'+(X(n-1)-6).toFixed(1)+'" y="'+(Y(+data[n-1].y)-9).toFixed(1)+'" text-anchor="end" style="fill:var(--accent);font-weight:700;font-size:12px;font-family:Oswald">'+data[n-1].y+' '+unit+'</text>';

    container.innerHTML='<svg class="chart" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img">'
      +grid+labels
      +'<path class="area" d="'+area+'"/>'
      +'<path class="line" d="'+dpath.trim()+'"/>'
      +dots+xl+endLabel+'</svg>';
  }

  /* ============================================================
     MODAL / small dialogs
     ============================================================ */
  function openModal(html){el("modal").innerHTML=html;el("modalBg").classList.add("open");}
  function closeModal(){el("modalBg").classList.remove("open");}
  el("modalBg").addEventListener("click",function(e){if(e.target===el("modalBg"))closeModal();});

  function modalInput(title,val,cb){
    openModal('<div class="grab"></div><h3>'+esc(title)+'</h3><label class="field"><input type="text" id="miVal" value="'+esc(val)+'"></label><button class="btn primary" id="miOk">Guardar</button>');
    var i=el("miVal");setTimeout(function(){i.focus();i.select();},80);
    function ok(){closeModal();cb(i.value.trim());}
    el("miOk").onclick=ok; i.addEventListener("keydown",function(e){if(e.key==="Enter")ok();});
  }
  function confirmModal(title,msg,cb){
    openModal('<div class="grab"></div><h3>'+esc(title)+'</h3>'+(msg?'<p class="muted" style="margin-top:-6px">'+esc(msg)+'</p>':'')+'<div class="row" style="margin-top:16px"><button class="btn ghost" id="cNo">Cancelar</button><button class="btn primary" id="cYes">Confirmar</button></div>');
    el("cNo").onclick=closeModal; el("cYes").onclick=function(){closeModal();cb();};
  }

  /* ============================================================
     THEME
     ============================================================ */
  var themeChoice=null;
  try{themeChoice=localStorage.getItem(KEY+".theme");}catch(e){}
  if(themeChoice) document.documentElement.setAttribute("data-theme",themeChoice);
  el("themeBtn").onclick=function(){
    var cur=document.documentElement.getAttribute("data-theme");
    var isDark = cur? cur==="dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    var next=isDark?"light":"dark";
    document.documentElement.setAttribute("data-theme",next);
    try{localStorage.setItem(KEY+".theme",next);}catch(e){}
  };

  /* ============================================================
     BACKUP (export via downloads capability / import via file)
     ============================================================ */
  el("backupBtn").onclick=function(){
    var stats=DB.sessions.length+" entrenamientos · "+DB.routines.length+" rutinas · "+DB.body.length+" mediciones";
    var html='<div class="grab"></div><h3>Respaldo de datos</h3>';
    html+='<p class="muted" style="margin-top:-6px">Tus datos se guardan en este dispositivo. Exportá un archivo para tener copia o pasarlos a otro teléfono/compu.</p>';
    html+='<div class="card" style="margin:14px 0"><div class="tnum" style="font-weight:600">'+stats+'</div></div>';
    html+='<button class="btn primary" id="expBtn">⬇ Exportar copia (.json)</button>';
    html+='<button class="btn ghost" id="impBtn" style="margin-top:10px">⬆ Importar copia</button>';
    html+='<input type="file" id="impFile" accept="application/json,.json" style="display:none">';
    openModal(html);
    el("expBtn").onclick=exportData;
    el("impBtn").onclick=function(){el("impFile").click();};
    el("impFile").onchange=function(e){
      var f=e.target.files[0]; if(!f)return;
      var rd=new FileReader();
      rd.onload=function(){
        try{
          var d=JSON.parse(rd.result);
          if(!d||typeof d!=="object")throw 0;
          DB.routines=d.routines||[];DB.sessions=d.sessions||[];DB.body=d.body||[];
          save();closeModal();go("hoy");toast("Datos importados ✓");
        }catch(err){toast("Archivo no válido");}
      };
      rd.readAsText(f);
    };
  };

  async function exportData(){
    var payload=JSON.stringify({app:"fierros",version:1,exported:new Date().toISOString(),routines:DB.routines,sessions:DB.sessions,body:DB.body},null,2);
    var fname="fierros-respaldo-"+todayISO()+".json";
    var cap=null;
    try{ cap = window.claude && claude.use ? await claude.use("downloads") : null; }catch(e){ cap=null; }
    if(cap){
      try{ await cap.save({filename:fname,data:payload}); toast("Copia exportada ✓"); return; }
      catch(err){ if(err&&err.code==="declined"){return;} /* fall through */ }
    }
    // fallback (works outside the viewer sandbox / desktop browsers)
    try{
      var blob=new Blob([payload],{type:"application/json"});
      var url=URL.createObjectURL(blob);var a=document.createElement("a");
      a.href=url;a.download=fname;document.body.appendChild(a);a.click();
      setTimeout(function(){URL.revokeObjectURL(url);a.remove();},100);
      toast("Copia exportada ✓");
    }catch(e){ toast("No se pudo exportar acá"); }
  }

  /* ---------------- boot ---------------- */
  el("restSkip").onclick=skipRest;
  el("restMinus").onclick=function(){bumpRest(-15);};
  el("restPlus").onclick=function(){bumpRest(15);};
  renderRestBar();

  load();
  render();
})();

/* ---- Registro del service worker (PWA instalable + offline) ---- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  });
}
