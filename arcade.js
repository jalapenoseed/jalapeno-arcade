'use strict';
const games = [
 ['penny-pusher','Penny Pusher Wars','native','Online duel','Time the drop and shove the shared pile over the edge.'],
 ['boso86',"BŌSŌ ’86",'share','Motorcycle brawler','Ride through neon streets in Kamikaze Run.'],
 ['drifters-quest','Drifter’s Quest 2.5D','native','Shared-world RPG','Create a drifter, explore the world and meet other players.'],
 ['backfire','Backfire','share','Wildfire action','Face a moving fire front from behind the fire crew.'],
 ['zero-day',"ZERO//DAY ’95",'share','Hacker-skater','Grind rails and hack terminals in a pixel city.'],
 ['last-cell','Last Cell Standing','share','Side-scrolling shooter','Guide Neil the Neuron through four boss-infested brain lobes.']
];
const $ = id => document.getElementById(id);
const [slug,room] = location.hash.slice(1).split('/');
const game = games.find(g=>g[0]===slug);
window.addEventListener('hashchange',()=>location.reload());
function status(message){$('notice').hidden=!message;$('notice').textContent=message}
function catalog(filter){
 $('rack').replaceChildren();
 for(const [id,title,mode,genre,desc] of games){
  if(filter!=='all' && filter!==mode)continue;
  const card=document.createElement('a');
  card.className='card';card.href='#'+id;
  card.innerHTML='<img alt="" src="covers/'+id+'.jpg"><div class="details"><small class="mode">'+genre+'</small><h2>'+title+'</h2><p>'+desc+'</p></div>';
  $('rack').append(card);
 }
}
for(const btn of document.querySelectorAll('[data-filter]'))btn.onclick=()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(btn===b)));
 catalog(btn.dataset.filter);
};
if(!game){catalog('all')}else{
 $('lobby').hidden=true;$('player').hidden=false;$('title').textContent=game[1];document.title=game[1]+' · Seed Arcade';
 $('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('player').requestFullscreen()}catch{status('Fullscreen is unavailable in this browser.')}};
 const guest=game[2]==='share' && !!room;
 if(!guest){
  const frame=document.createElement('iframe');frame.id='game';frame.title=game[1];frame.allow='autoplay; fullscreen; gamepad';frame.src='games/'+slug+'/';frame.onload=()=>frame.focus();$('stage').append(frame);
 }
 if(game[2]==='share'){
  const script=document.createElement('script');script.src='vendor/peerjs.min.js';
  script.onload=()=>setupRoom(guest);script.onerror=()=>status('Cabinet sharing could not load.');document.head.append(script);
 }
}
function setupRoom(guest){
 let peer,link,stream,call,granted=false,timer;
 const pressed=new Map(),keys=/^(Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|Space|Enter|Backspace|Escape|Shift(Left|Right)|Control(Left|Right)|Tab)$/;
 const canvas=()=>document.querySelector('iframe')?.contentDocument?.querySelector('canvas');
 function dispatch(type,code,key){
  const target=canvas();if(!target)return;
  target.dispatchEvent(new target.ownerDocument.defaultView.KeyboardEvent(type,{code,key,bubbles:true,cancelable:true}));
 }
 function release(){for(const [code,key] of pressed)dispatch('keyup',code,key);pressed.clear()}
 function reset(msg){
  clearTimeout(timer);release();granted=false;
  const old=peer;peer=null;link=null;
  if(old&&!old.destroyed)old.destroy();
  if(stream)stream.getTracks().forEach(t=>t.stop());
  $('invite').hidden=$('copy').hidden=$('control').hidden=true;$('control').textContent='Pass controls';$('host').hidden=guest;status(msg);
 }
 function start(){
  $('host').hidden=true;status(guest?'Joining the cabinet…':'Opening an invitation…');
  const current=new Peer();peer=current;
  timer=setTimeout(()=>{if(peer===current)reset('Connection timed out. The host can create a fresh invite. Some networks block direct connections.')},30000);
  current.on('error',e=>{if(peer===current)reset('Cabinet connection failed ('+e.type+'). Start a new invite and try again.')});
  current.on('open',id=>{
   if(guest){attach(current.connect(room,{reliable:true,metadata:{slug}}));return}
   clearTimeout(timer);const invite=new URL(location.href);invite.hash=slug+'/'+id;
   $('invite').value=invite.href;$('copy').hidden=false;status('Invite ready. Your friend can watch, then you can pass keyboard controls.');
   $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(invite.href);status('Invite copied. Keep this cabinet open.')}catch{$('invite').hidden=false;$('invite').select()}};
  });
  current.on('connection',c=>{if(guest||link||c.metadata?.slug!==slug){c.close();return}attach(c)});
  current.on('call',incoming=>{
   if(!guest||incoming.peer!==room){incoming.close();return}
   call=incoming;incoming.answer();incoming.on('stream',s=>{const video=$('viewer');video.srcObject=s;video.play().catch(()=>status('Tap the video to start viewing.'))});
  });
  function attach(c){
   link=c;c.on('open',()=>{
    clearTimeout(timer);
    if(guest){status('Connected. Watching the host’s cabinet.');return}
    try{stream=canvas().captureStream(25);call=current.call(c.peer,stream)}catch{reset('This browser cannot broadcast its game canvas.');return}
    $('control').hidden=false;status('Friend connected. You have the controls.');
   });
   c.on('close',()=>{if(link===c)reset('Your friend disconnected.')});
   c.on('data',data=>{
    if(!data||link!==c)return;
    if(guest && data.type==='control'){granted=data.enabled===true;status(granted?'Your turn. Use your keyboard to play.':'Watching the host’s turn.');return}
    if(!guest && granted && data.type==='release'){release();return}
    if(!guest && granted && keys.test(data.code) && typeof data.key==='string' && data.key.length<=16 && ['keydown','keyup'].includes(data.type)){
     if(data.type==='keydown')pressed.set(data.code,data.key);else pressed.delete(data.code);
     dispatch(data.type,data.code,data.key);
    }
   });
  }
 }
 if(guest){
  if(!/^[a-zA-Z0-9_-]{1,100}$/.test(room)){status('Invalid cabinet invite.');return}
  const v=document.createElement('video');v.id='viewer';v.autoplay=true;v.playsInline=true;v.muted=true;v.onclick=()=>v.play();$('stage').append(v);
  for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{if(granted&&link?.open&&keys.test(e.code)&&!e.metaKey&&!e.altKey){e.preventDefault();link.send({type,code:e.code,key:e.key})}});
  window.addEventListener('blur',()=>{if(link?.open)link.send({type:'release'})});start();
 }else{
  $('host').hidden=false;$('host').onclick=start;
  $('control').onclick=()=>{if(!link?.open)return;release();granted=!granted;link.send({type:'control',enabled:granted});$('control').textContent=granted?'Take controls back':'Pass controls';status(granted?'Your friend has keyboard control.':'You have the controls.');if(!granted)$('game').focus()};
 }
 window.addEventListener('pagehide',()=>{peer?.destroy();stream?.getTracks().forEach(t=>t.stop())});
}