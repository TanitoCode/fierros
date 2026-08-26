(function(){
  "use strict";

  /* ---------------- storage ---------------- */
  var KEY="fierros.v1";
  var DB={routines:[],sessions:[],body:[]};
  function load(){
    try{var raw=localStorage.getItem(KEY); if(raw){var d=JSON.parse(raw); DB.routines=d.routines||[]; DB.sessions=d.sessions||[]; DB.body=d.body||[];}}
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

  /* ---------------- draft (active workout) ---------------- */
  var draft=null; // {name, date, exercises:[{name, sets:[{w,r,done}]}]}
  try{var dr=localStorage.getItem(KEY+".draft"); if(dr) draft=JSON.parse(dr);}catch(e){}
  function saveDraft(){ try{ draft? localStorage.setItem(KEY+".draft",JSON.stringify(draft)) : localStorage.removeItem(KEY+".draft"); }catch(e){} }

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
    saveDraft(); addExercisePrompt();
  }
  function startFromRoutine(id){
    var r=DB.routines.find(function(x){return x.id===id;}); if(!r)return;
    draft={name:r.name,date:todayISO(),exercises:r.exercises.map(function(e){
      var sets=[]; for(var i=0;i<(e.sets||1);i++) sets.push({w:"",r:e.reps||"",done:false});
      return {name:e.name,sets:sets};
    })};
    saveDraft(); renderHoy();
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
    html+='</div>';

    draft.exercises.forEach(function(e,ei){
      html+='<div class="exercise">';
      html+='<header><span class="name">'+esc(e.name)+'</span>'
        +'<button class="del-x" data-delex="'+ei+'">✕</button></header>';
      html+='<div class="sets">';
      html+='<div class="set-head"><div>#</div><div>KG</div><div>REPS</div><div></div></div>';
      e.sets.forEach(function(s,si){
        html+='<div class="set-row'+(s.done?' done':'')+'" data-ei="'+ei+'" data-si="'+si+'">'
          +'<div class="idx">'+(si+1)+'</div>'
          +'<input type="number" inputmode="decimal" class="in-w" value="'+esc(s.w)+'" placeholder="—">'
          +'<input type="number" inputmode="numeric" class="in-r" value="'+esc(s.r)+'" placeholder="—">'
          +'<button class="chk'+(s.done?' on':'')+'" data-toggle aria-label="Serie hecha">'
          +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'
          +'</button></div>';
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
        var st=draft.exercises[ei].sets[si]; st.done=!st.done; saveDraft(); renderHoy();
      });
    });
    v.querySelectorAll("[data-addset]").forEach(function(b){b.onclick=function(){
      var ei=+b.dataset.addset; var last=draft.exercises[ei].sets.slice(-1)[0];
      draft.exercises[ei].sets.push({w:last?last.w:"",r:last?last.r:"",done:false}); saveDraft(); renderHoy();
    };});
    v.querySelectorAll("[data-delex]").forEach(function(b){b.onclick=function(){
      draft.exercises.splice(+b.dataset.delex,1); saveDraft(); renderHoy();
    };});
    v.querySelector("[data-addex]").onclick=addExercisePrompt;
    v.querySelector("[data-rename]").onclick=function(){
      modalInput("Nombre del entrenamiento",draft.name,function(val){draft.name=val||draft.name;saveDraft();renderHoy();});
    };
    v.querySelector("[data-discard]").onclick=function(){
      confirmModal("¿Descartar este entrenamiento?","Se perderá lo que cargaste.",function(){draft=null;saveDraft();renderHoy();});
    };
    v.querySelector("[data-finish]").onclick=finishSession;
  }

  function addExercisePrompt(){
    // suggestions from routines + past sessions
    var names={};
    DB.routines.forEach(function(r){r.exercises.forEach(function(e){names[e.name]=1;});});
    DB.sessions.forEach(function(s){(s.exercises||[]).forEach(function(e){names[e.name]=1;});});
    var list=Object.keys(names).sort();
    var html='<div class="grab"></div><h3>Agregar ejercicio</h3>';
    html+='<label class="field"><span>Nombre</span><input type="text" id="exName" placeholder="Ej: Press banca" autocomplete="off"></label>';
    if(list.length){
      html+='<div class="muted" style="font-size:12px;margin-bottom:8px">Frecuentes</div><div class="row wrap" style="gap:8px;margin-bottom:16px">';
      list.slice(0,16).forEach(function(n){html+='<button class="chip" data-pick="'+esc(n)+'">'+esc(n)+'</button>';});
      html+='</div>';
    }
    html+='<button class="btn primary" id="exAdd">Agregar</button>';
    openModal(html);
    var input=el("exName"); setTimeout(function(){input.focus();},80);
    function add(name){
      name=(name||input.value).trim(); if(!name)return;
      if(!draft){draft={name:"Entrenamiento libre",date:todayISO(),exercises:[]};}
      draft.exercises.push({name:name,sets:[{w:"",r:"",done:false},{w:"",r:"",done:false},{w:"",r:"",done:false}]});
      saveDraft(); closeModal(); renderHoy();
    }
    el("exAdd").onclick=function(){add();};
    input.addEventListener("keydown",function(e){if(e.key==="Enter")add();});
    el("modal").querySelectorAll("[data-pick]").forEach(function(b){b.onclick=function(){add(b.dataset.pick);};});
  }

  function finishSession(){
    // keep only sets that have weight or reps; mark done sets as the record
    var ex=draft.exercises.map(function(e){
      return {name:e.name,sets:e.sets.filter(function(s){return (s.w!==""&&s.w!=null)||(s.r!==""&&s.r!=null);}).map(function(s){return {w:+s.w||0,r:+s.r||0};})};
    }).filter(function(e){return e.sets.length;});
    if(!ex.length){toast("Cargá al menos una serie");return;}
    DB.sessions.push({id:uid(),name:draft.name,date:draft.date,exercises:ex});
    save(); draft=null; saveDraft();
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
  load();
  render();
})();

/* ---- Registro del service worker (PWA instalable + offline) ---- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  });
}
