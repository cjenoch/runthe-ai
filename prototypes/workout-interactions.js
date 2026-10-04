(() => {
  const root = document.getElementById('dl-workout-concepts');
  const photo = root.dataset.machinePhoto;
  delete root.dataset.machinePhoto;
  const clone = value => JSON.parse(JSON.stringify(value));
  const seed = [ ['Chest press',70,65], ['Seated row',90,85], ['Leg press',180,170] ];
  const prefs = {history:true,notes:true,rir:'program',sound:false,visual:'pulse',duration:90};
  let exercises = seed.map(([name,weight,previous],e)=>({name,previous,photo:e===0,note:e===0?'Seat 4. Smooth reps.':'',sets:Array.from({length:5},(_,s)=>({weight,reps:5,rir:null,done:e===0&&s<2}))}));
  let programRir=false, program=clone(exercises), revision=0, guidedExercise=0;
  let restEnd=0, restFinished=false, message='', draft=null, undo=null, audio=null, audioStatus='';
  const phones = [...root.querySelectorAll('.dl-phone')];
  const icon = name=>`<i data-lucide="${name}" aria-hidden="true"></i>`;
  const esc = value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const completed = ()=>exercises.flatMap(e=>e.sets).filter(s=>s.done).length;
  const count = ()=>exercises.reduce((n,e)=>n+e.sets.length,0);
  const showRir = ()=>prefs.rir==='show'||prefs.rir==='program'&&programRir;
  const next = e=>exercises[e].sets.findIndex(s=>!s.done);
  const seconds = ()=>restEnd?Math.max(0,Math.ceil((restEnd-Date.now())/1000)):restFinished?0:prefs.duration;
  const clock = ()=>`${Math.floor(seconds()/60)}:${String(seconds()%60).padStart(2,'0')}`;
  const validExercises = value=>Array.isArray(value)&&value.length>0&&value.length<=8&&value.every(e=>typeof e.name==='string'&&e.name.length<=60&&typeof e.note==='string'&&e.note.length<=200&&Array.isArray(e.sets)&&e.sets.length>0&&e.sets.length<=12&&e.sets.every(s=>Number.isFinite(s.weight)&&s.weight>=0&&s.weight<=2000&&Number.isInteger(s.reps)&&s.reps>=0&&s.reps<=100&&(s.rir===null||Number.isFinite(s.rir)&&s.rir>=0&&s.rir<=10)&&typeof s.done==='boolean'));
  function restore(saved) {
    const p=saved?.privateContent;
    if(p?.schema!==2||!validExercises(p.exercises))return;
    exercises=clone(p.exercises); program=validExercises(p.program)?clone(p.program):clone(exercises);
    programRir=p.programRir===true; revision=Number(p.revision)||0;
    for(const key of ['history','notes','sound'])if(typeof p.prefs?.[key]==='boolean')prefs[key]=p.prefs[key];
    if(['program','show','hide'].includes(p.prefs?.rir))prefs.rir=p.prefs.rir;
    if(['pulse','shake','none'].includes(p.prefs?.visual))prefs.visual=p.prefs.visual;
    if([5,30,60,90,120,180].includes(p.prefs?.duration))prefs.duration=p.prefs.duration;
    guidedExercise=Math.min(guidedExercise,exercises.length-1);
  }
  restore(window.openai?.widgetState);
  function remember() {
    revision=Math.max(Date.now(),revision+1);
    window.openai?.setWidgetState?.({modelContent:{prototype:'DocLifts workout views',preferences:{...prefs},completedSampleSets:completed()},privateContent:{schema:2,exercises:clone(exercises),program:clone(program),programRir,prefs:{...prefs},revision}}).catch(()=>{});
  }
  const options=(items,current)=>items.map(([value,label])=>`<option value="${value}" ${String(value)===String(current)?'selected':''}>${label}</option>`).join('');
  function header() {return `<div class="dl-top"><span class="dl-brand">DocLifts</span><button class="dl-icon" data-action="settings" aria-label="Customize this view">${icon('sliders-horizontal')}</button></div><div class="dl-heading"><h2>Full body A</h2><div class="dl-row"><p class="dl-sub">Sunrise Center</p><button class="dl-text-button" data-action="workout">${icon('pencil')} Edit workout</button></div></div>`;}
  function footer() {return `<div class="dl-footer"><div class="dl-row"><div class="dl-rest"><button class="dl-icon" data-action="timer" aria-label="Timer settings">${icon('timer')}</button><strong data-clock>${clock()}</strong><button class="dl-text-button" data-action="rest">${restEnd?'Skip':'Start'}</button></div><button class="dl-secondary" data-action="finish">Finish</button></div><p class="dl-sub">${completed()} of ${count()} sets recorded</p><div class="dl-feedback" role="status" aria-live="polite">${esc(message)}</div>${undo?'<button class="dl-text-button" data-action="undo-workout">Undo workout edit</button>':''}</div>`;}
  const closeButton = label=>`<button class="dl-icon" data-action="close" aria-label="${label}">${icon('x')}</button>`;
  function sheets() {return `<section class="dl-sheet" data-sheet="settings" aria-label="Workout view settings" hidden><div class="dl-row"><h3>Your workout view</h3>${closeButton('Close customization')}</div><label class="dl-setting">Previous performance<input type="checkbox" data-pref="history" ${prefs.history?'checked':''}></label><label class="dl-setting">Notes<input type="checkbox" data-pref="notes" ${prefs.notes?'checked':''}></label><label class="dl-setting">RIR field<select data-pref="rir">${options([['program','Follow program'],['show','Always show'],['hide','Hide']],prefs.rir)}</select></label><p class="dl-sub" style="margin-top:14px">Reps in reserve: how many more reps you could have done. Hiding this field keeps your entries.</p><p class="dl-sub" style="margin-top:14px" data-program-summary>This program ${programRir?'asks for RIR':'does not ask for RIR'}. Change that in Edit workout.</p><button class="dl-primary" style="margin-top:24px" data-action="close">Done</button></section><section class="dl-sheet" data-sheet="timer" aria-label="Timer settings" hidden><div class="dl-row"><h3>Rest timer</h3>${closeButton('Close timer settings')}</div><label class="dl-setting">Rest duration<select data-pref="duration">${options([[5,'5 sec · test'],[30,'30 seconds'],[60,'1 minute'],[90,'1 min 30 sec'],[120,'2 minutes'],[180,'3 minutes']],prefs.duration)}</select></label><label class="dl-setting">Play a chime<input type="checkbox" data-pref="sound" ${prefs.sound?'checked':''}></label><label class="dl-setting">Visual alert<select data-pref="visual">${options([['pulse','Timer pulse'],['shake','Small screen shake'],['none','Text only']],prefs.visual)}</select></label><p class="dl-sub" style="margin-top:16px">Sound is optional. Keep this page open for reliable alerts; a locked phone or background tab may silence or delay them. Reduced-motion preferences disable animations.</p><p class="dl-feedback" data-audio-status role="status">${esc(audioStatus)}</p><div class="dl-editor-actions"><button class="dl-secondary" data-action="test-alert">Try alert</button><button class="dl-primary" data-action="close">Done</button></div></section><section class="dl-sheet" data-sheet="edit" aria-label="Edit set" hidden></section><section class="dl-sheet" data-sheet="workout" aria-label="Edit workout" hidden></section>`;}
  function rirField(e,s,prefix='') {const r=exercises[e].sets[s];return `<label class="dl-rir">${prefix?esc(prefix)+' · ':''}RIR<input type="number" min="0" max="10" step=".5" inputmode="decimal" placeholder="—" aria-label="${esc(exercises[e].name)} set ${s+1} RIR" value="${r.rir??''}" data-e="${e}" data-s="${s}" data-field="rir"><span>reps left</span></label>`;}
  function fields(e,s,prefix) {const r=exercises[e].sets[s];return `<div class="dl-fields"><label>Weight · lb<input aria-label="${prefix} weight" type="number" min="0" max="2000" step=".5" value="${r.weight}" data-e="${e}" data-s="${s}" data-field="weight"></label><label>Reps<input aria-label="${prefix} reps" type="number" min="0" max="100" value="${r.reps}" data-e="${e}" data-s="${s}" data-field="reps"></label></div>${rirField(e,s)}`;}
  const note = e=>`<input class="dl-note-input dl-note-option" aria-label="${esc(exercises[e].name)} note" data-note="${e}" value="${esc(exercises[e].note)}" placeholder="Add a note" maxlength="200">`;
  function guided() {
    const e=guidedExercise,ex=exercises[e],s=next(e),finished=s<0;
    const media=ex.photo?`<img class="dl-photo" src="${photo}" alt="Illustrative seated chest press machine"><div class="dl-caption">Illustrative machine photo</div>`:`<div class="dl-empty-photo">${icon('camera')}<span>No machine photo yet</span></div>`;
    return `<div class="dl-body"><div class="dl-eyebrow">Exercise ${e+1} of ${exercises.length}</div>${media}<div class="dl-guided-title"><h3>${esc(ex.name)}</h3></div><p class="dl-sub">${ex.sets.length} sets · ${ex.sets[0].reps} reps</p><div class="dl-step"><strong>${finished?'Exercise complete':`Set ${s+1} of ${ex.sets.length}`}</strong><span class="dl-dots" aria-label="${ex.sets.filter(r=>r.done).length} sets recorded">${ex.sets.map(r=>`<span class="dl-dot ${r.done?'done':''}"></span>`).join('')}</span></div>${finished?`<button class="dl-primary" data-action="next-exercise">Next exercise ${icon('arrow-right')}</button>`:fields(e,s,'Current set')+`<button class="dl-primary" data-action="save" data-e="${e}" data-s="${s}">${icon('check')} Record this set</button>`}<details class="dl-help"><summary>Setup & notes</summary><p>Follow the instructions on this machine’s placard. Save your seat setting for next time.</p>${note(e)}</details></div>`;
  }
  function table(e) {const ex=exercises[e];return `<table class="dl-table"><thead><tr><th>Set</th><th>Previous</th><th>lb</th><th>Reps</th><th><span aria-label="Record set">✓</span></th></tr></thead><tbody>${ex.sets.map((r,s)=>`<tr class="${r.done?'complete':''}"><td>${s+1}</td><td class="dl-previous">${ex.previous===null?'—':`${ex.previous} × 5`}</td><td><input type="number" min="0" max="2000" step=".5" aria-label="${esc(ex.name)} set ${s+1} weight" value="${r.weight}" data-e="${e}" data-s="${s}" data-field="weight"></td><td><input type="number" min="0" max="100" aria-label="${esc(ex.name)} set ${s+1} reps" value="${r.reps}" data-e="${e}" data-s="${s}" data-field="reps"></td><td><button class="dl-check" aria-label="${r.done?'Undo':'Record'} ${esc(ex.name)} set ${s+1}" data-action="toggle" data-e="${e}" data-s="${s}" aria-pressed="${r.done}">${icon(r.done?'check':'plus')}</button></td></tr><tr class="dl-rir-row ${r.done?'complete':''}" ${showRir()?'':'hidden'}><td colspan="5">${rirField(e,s,`Set ${s+1}`)}</td></tr>`).join('')}</tbody></table>`;}
  function tableView() {return `<div class="dl-body">${exercises.map((ex,e)=>e===0?`<h3>${esc(ex.name)}</h3><div class="dl-sub">${ex.sets.length} sets · ${ex.sets[0].reps} reps</div>${table(e)}${note(e)}`:`<details class="dl-collapsed" data-expand="${e}"><summary>${esc(ex.name)}<small>${ex.sets[0].weight} lb · ${ex.sets.length} sets · ${ex.sets.filter(s=>s.done).length}/${ex.sets.length} done</small></summary>${table(e)}${note(e)}</details>`).join('')}</div>`;}
  function notebook() {const e=exercises.findIndex(ex=>ex.sets.some(s=>!s.done)),s=e>=0?next(e):-1;return `<div class="dl-body"><div class="dl-notebook">${exercises.map((ex,i)=>`<section class="dl-note-group"><h3>${String(i+1).padStart(2,'0')} ${esc(ex.name.toUpperCase())}</h3><div class="dl-note-line"><span class="dl-note-label">PLAN</span><span class="dl-note-value">${ex.sets[0].weight} lb × ${ex.sets[0].reps} × ${ex.sets.length} sets</span></div><div class="dl-note-line dl-history"><span class="dl-note-label">LAST</span><span class="dl-note-value">${ex.previous===null?'—':`${ex.previous} × 5/5/5/5/5`}</span></div><div class="dl-note-line"><span class="dl-note-label">TODAY</span><span class="dl-note-value">${ex.sets.map(r=>r.done?`${r.weight}×${r.reps}${showRir()&&r.rir!==null?` @${r.rir} RIR`:''}`:'—').join(' · ')}</span></div>${note(i)}</section>`).join('')}</div>${e>=0?`<div class="dl-inline-log"><span class="dl-sub">${esc(exercises[e].name)} · set ${s+1}</span><div class="dl-entry"><input type="number" min="0" max="2000" step=".5" aria-label="Notebook weight" value="${exercises[e].sets[s].weight}" data-e="${e}" data-s="${s}" data-field="weight"><span>×</span><input type="number" min="0" max="100" aria-label="Notebook reps" value="${exercises[e].sets[s].reps}" data-e="${e}" data-s="${s}" data-field="reps"><button class="dl-primary" data-action="save" data-e="${e}" data-s="${s}">Log</button></div>${rirField(e,s)}</div>`:'<p>All sets recorded.</p>'}</div>`;}
  function taps() {return `<div class="dl-body">${exercises.map((ex,e)=>`<section class="dl-tap-group"><h3>${esc(ex.name)}</h3><button class="dl-load-button" data-action="load" data-e="${e}" aria-label="Change ${esc(ex.name)} weight">${ex.sets[Math.max(0,next(e))].weight} lb <span class="dl-sub">· ${ex.sets[Math.max(0,next(e))].reps} reps</span>${icon('pencil')}</button><div class="dl-set-buttons">${ex.sets.map((r,s)=>`<button class="dl-set-button ${r.done?'complete':s===next(e)?'next':''}" data-action="tap" data-e="${e}" data-s="${s}" aria-label="${r.done?'Edit':'Record'} ${esc(ex.name)} set ${s+1}, ${r.reps} reps" aria-pressed="${r.done}">${r.reps}</button>`).join('')}</div><span class="dl-tap-note">${ex.sets.filter(s=>s.done).length}/${ex.sets.length} recorded</span>${next(e)>=0?rirField(e,next(e),`Set ${next(e)+1}`):''}</section>`).join('')}<p class="dl-sub">Tap a set to record its reps. Tap it again to edit.</p></div>`;}
  function render() {
    phones.forEach(p=>{const expanded=[...p.querySelectorAll('details[open][data-expand]')].map(d=>d.dataset.expand);p.dataset.history=prefs.history;p.dataset.notes=prefs.notes;p.dataset.rir=showRir();p.innerHTML=header()+({guided,table:tableView,notebook,tap:taps}[p.dataset.view])()+footer()+sheets();expanded.forEach(e=>{const d=p.querySelector(`[data-expand="${e}"]`);if(d)d.open=true;});});
    if(globalThis.lucide)lucide.createIcons();
  }
  function openSheet(p,name) {p.querySelectorAll('[data-sheet]').forEach(s=>s.hidden=s.dataset.sheet!==name);p.querySelector(`[data-sheet="${name}"] button`)?.focus();}
  function closeSheets(p) {draft=null;render();p.querySelector('[data-action="workout"]')?.focus();}
  function audioReady() {
    if(!prefs.sound)return Promise.resolve(false);
    try {const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error();audio??=new Audio();return audio.resume().then(()=>audio.state==='running').catch(()=>false);}catch{return Promise.resolve(false);}
  }
  async function chime() {
    if(!prefs.sound)return;
    if(!await audioReady()){audioStatus='Sound unavailable. The visual alert still works.';root.querySelectorAll('[data-audio-status]').forEach(n=>n.textContent=audioStatus);return;}
    try {for(const [offset,hz] of [[0,660],[.19,880]]){const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+offset;osc.type='sine';osc.frequency.value=hz;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.12,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+.23);osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.25);osc.onended=()=>{osc.disconnect();gain.disconnect();};}audioStatus='Chime played. Check your phone’s volume if you did not hear it.';}catch{audioStatus='Sound unavailable. The visual alert still works.';}
    root.querySelectorAll('[data-audio-status]').forEach(n=>n.textContent=audioStatus);
  }
  function alertTimer() {void chime();phones.forEach(p=>{p.classList.remove('dl-alert-pulse','dl-alert-shake');void p.offsetWidth;if(prefs.visual!=='none')p.classList.add(`dl-alert-${prefs.visual}`);});}
  function startRest() {void audioReady();restFinished=false;restEnd=Date.now()+prefs.duration*1000;}
  function save(e,s) {undo=null;exercises[e].sets[s].done=true;startRest();message=`${exercises[e].name} · set ${s+1} recorded`;remember();render();}
  function edit(p,e,s,weightOnly=false) {const ex=exercises[e],sheet=p.querySelector('[data-sheet="edit"]');sheet.innerHTML=`<div class="dl-row"><h3>${weightOnly?'Change weight':`Edit set ${s+1}`}</h3>${closeButton('Close editor')}</div><p class="dl-sub">${esc(ex.name)}</p>${fields(e,s,'Edit set')}<button class="dl-primary" data-action="edit-save" data-e="${e}" data-s="${s}" data-load-all="${weightOnly}">${weightOnly?'Use for remaining sets':'Save changes'}</button>${ex.sets[s].done&&!weightOnly?`<button class="dl-text-button" data-action="undo-set" data-e="${e}" data-s="${s}">Mark set unfinished</button>`:''}`;openSheet(p,'edit');if(globalThis.lucide)lucide.createIcons();}
  function workoutEditor(p) {
    const sheet=p.querySelector('[data-sheet="workout"]');
    sheet.innerHTML=`<div class="dl-row"><h3>Edit workout</h3>${closeButton('Cancel workout edits')}</div><p class="dl-sub">Make your changes here, then apply them to your workout.</p>${draft.exercises.map((ex,e)=>`<section class="dl-editor-ex"><input class="dl-editor-name" aria-label="Exercise ${e+1} name" maxlength="60" data-draft-name="${e}" value="${esc(ex.name)}"><div class="dl-row"><div class="dl-stepper"><button class="dl-secondary" data-action="remove-set" data-e="${e}" aria-label="Remove last set from ${esc(ex.name)}" ${ex.sets.length<=1?'disabled':''}>−</button><span>${ex.sets.length} sets</span><button class="dl-secondary" data-action="add-set" data-e="${e}" aria-label="Add set to ${esc(ex.name)}" ${ex.sets.length>=12?'disabled':''}>+</button></div><button class="dl-text-button" data-action="remove-exercise" data-e="${e}" ${draft.exercises.length<=1?'disabled':''}>Remove exercise</button></div><p class="dl-sub">${ex.sets.filter(s=>s.done).length} recorded</p></section>`).join('')}<button class="dl-text-button" data-action="add-exercise" ${draft.exercises.length>=8?'disabled':''}>${icon('plus')} Add exercise</button><label class="dl-setting">Program asks for RIR<input type="checkbox" data-draft-rir ${draft.programRir?'checked':''}></label><p class="dl-sub">Your personal Show / Hide preference takes priority. Limits for this prototype: 8 exercises, 12 sets each.</p><div class="dl-editor-actions"><button class="dl-primary" data-action="apply-workout" data-scope="today">Apply · just today</button><button class="dl-secondary" data-action="apply-workout" data-scope="program">Apply · from now on</button><button class="dl-text-button" data-action="close">Cancel changes</button></div>`;
    openSheet(p,'workout');if(globalThis.lucide)lucide.createIcons();
  }
  root.addEventListener('input',event=>{
    const t=event.target;
    if(t.dataset.field||t.dataset.note!==undefined){undo=null;root.querySelectorAll('[data-action="undo-workout"]').forEach(b=>b.remove());}
    if(t.dataset.field){const key=t.dataset.field,row=exercises[Number(t.dataset.e)]?.sets[Number(t.dataset.s)],n=Number(t.value);if(!row)return;if(key==='rir'&&t.value==='')row.rir=null;else if(t.value!==''&&Number.isFinite(n)&&n>=0&&(key==='weight'&&n<=2000||key==='reps'&&Number.isInteger(n)&&n<=100||key==='rir'&&n<=10))row[key]=n;}
    if(t.dataset.note!==undefined)exercises[Number(t.dataset.note)].note=t.value.slice(0,200);
    if(t.dataset.draftName!==undefined&&draft)draft.exercises[Number(t.dataset.draftName)].name=t.value.slice(0,60);
  });
  root.addEventListener('change',event=>{
    const t=event.target,p=t.closest('.dl-phone');
    if(t.dataset.field){undo=null;t.value=exercises[Number(t.dataset.e)].sets[Number(t.dataset.s)][t.dataset.field]??'';remember();}
    if(t.dataset.note!==undefined){undo=null;remember();}
    if(t.hasAttribute('data-draft-rir')&&draft)draft.programRir=t.checked;
    if(t.dataset.pref){const key=t.dataset.pref,open=p.querySelector('[data-sheet]:not([hidden])')?.dataset.sheet;prefs[key]=t.type==='checkbox'?t.checked:key==='duration'?Number(t.value):t.value;if(key==='sound'&&t.checked)void audioReady();if(key==='duration'&&restEnd)startRest();remember();render();if(open)openSheet(p,open);}
  });
  root.addEventListener('click',event=>{
    const b=event.target.closest('button[data-action]');if(!b)return;const p=b.closest('.dl-phone'),e=Number(b.dataset.e),s=Number(b.dataset.s);
    switch(b.dataset.action){
      case 'settings':openSheet(p,'settings');break;
      case 'timer':openSheet(p,'timer');break;
      case 'close':closeSheets(p);break;
      case 'save':save(e,s);break;
      case 'toggle':undo=null;if(exercises[e].sets[s].done){exercises[e].sets[s].done=false;remember();render();}else save(e,s);break;
      case 'tap':if(exercises[e].sets[s].done)edit(p,e,s);else save(e,s);break;
      case 'load':edit(p,e,Math.max(0,next(e)),true);break;
      case 'edit-save':if(b.dataset.loadAll==='true'){const weight=exercises[e].sets[s].weight;exercises[e].sets.forEach(r=>{if(!r.done)r.weight=weight;});}message='Changes saved';remember();render();break;
      case 'undo-set':undo=null;exercises[e].sets[s].done=false;message='Set marked unfinished';remember();render();break;
      case 'next-exercise':guidedExercise=(guidedExercise+1)%exercises.length;render();break;
      case 'rest':if(restEnd){restEnd=0;restFinished=false;}else startRest();render();break;
      case 'finish':message=`${completed()===count()?'Workout complete':'Workout saved'} · ${completed()} sets recorded`;render();break;
      case 'test-alert':audioStatus=prefs.sound?'Trying chime…':'Sound is off';message='Rest finished · alert preview';render();alertTimer();break;
      case 'workout':draft={exercises:clone(exercises),programRir};workoutEditor(p);break;
      case 'add-exercise':if(draft.exercises.length<8)draft.exercises.push({name:'New exercise',previous:null,photo:false,note:'',sets:Array.from({length:3},()=>({weight:0,reps:8,rir:null,done:false}))});workoutEditor(p);break;
      case 'remove-exercise':if(draft.exercises.length>1)draft.exercises.splice(e,1);workoutEditor(p);break;
      case 'add-set':if(draft.exercises[e].sets.length<12){const last=draft.exercises[e].sets.at(-1);draft.exercises[e].sets.push({...last,rir:null,done:false});}workoutEditor(p);break;
      case 'remove-set':if(draft.exercises[e].sets.length>1)draft.exercises[e].sets.pop();workoutEditor(p);break;
      case 'apply-workout':
        draft.exercises.forEach((ex,i)=>ex.name=ex.name.trim()||`Exercise ${i+1}`);
        undo={exercises:clone(exercises),program:clone(program),programRir};exercises=draft.exercises;programRir=draft.programRir;draft=null;
        if(b.dataset.scope==='program')program=exercises.map(ex=>({...clone(ex),note:'',sets:ex.sets.map(r=>({...r,rir:null,done:false}))}));
        guidedExercise=Math.min(guidedExercise,exercises.length-1);message=b.dataset.scope==='program'?'Workout and sample program updated':'Changes applied to this workout';remember();render();break;
      case 'undo-workout':if(undo){exercises=undo.exercises;program=undo.program;programRir=undo.programRir;undo=null;guidedExercise=Math.min(guidedExercise,exercises.length-1);message='Workout edit undone';remember();render();}break;
    }
  });
  root.addEventListener('keydown',event=>{if(event.key==='Escape'){const p=event.target.closest('.dl-phone');if(p)closeSheets(p);}});
  function tick(){
    if(!restEnd)return;
    if(seconds()===0){
      restEnd=0;restFinished=true;message='Rest finished · ready for your next set';
      root.querySelectorAll('[data-clock]').forEach(n=>n.textContent=clock());
      root.querySelectorAll('[data-action="rest"]').forEach(n=>n.textContent='Start');
      root.querySelectorAll('.dl-footer .dl-feedback').forEach(n=>n.textContent=message);
      alertTimer();
    }else root.querySelectorAll('[data-clock]').forEach(n=>n.textContent=clock());
  }
  setInterval(tick,250);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
  window.addEventListener('openai:set_globals',event=>{const state=event.detail?.globals?.widgetState;if(state&&Number(state.privateContent?.revision)>revision){restore(state);render();}});
  render();
})();
