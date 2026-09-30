const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name+'.js'),'utf8');
const factory=vm.runInNewContext(read('abilityCinematicQueue').replace('export function','function')+'\ncreateAbilityCinematicQueue');
const source=read('abilityAnimPatch').replace(/^import .*;$/gm,'').replace('export const','const');
const patch=vm.runInNewContext(source+'\nABILITY_ANIM_PATCH',{createAbilityCinematicQueue:factory,ALL_MOTION_CSS:'',MOTIONS_MIN_JSON:'[{anim:"fly",keywords:[]}]'}).replace(/<\/?script>/g,'');
module.exports=function(mode='ai'){
 let clock=10000,serial=0,sid='s-battle',blocked=false;const timers=new Map(),listeners={},overlays=[],mounted=new Map();
 const schedule=(fn,ms,repeat=0)=>{const id=++serial;timers.set(id,{fn,at:clock+ms,repeat});return id;};
 const tick=ms=>{const end=clock+ms;let budget=20000;while(budget--){let next;for(const t of timers)if(t[1].at<=end&&(!next||t[1].at<next[1].at))next=t;if(!next)break;const[id,t]=next;clock=t.at;if(t.repeat)t.at+=t.repeat;else timers.delete(id);t.fn();}clock=end;if(budget<=0)throw Error('Timer loop');};
 const node=()=>({style:{setProperty(){}},classList:{add(){},remove(){}},querySelector:()=>({classList:{remove(){}},src:'',style:{}})});
 const body={appendChild(el){el.parentNode=body;mounted.set(el.id,el);if(el.id==='bf-abil-anim')overlays.push(el.innerHTML);},removeChild(el){mounted.delete(el.id);el.parentNode=null;}};
 const c={Date:{now:()=>clock},Math,console,parent:{postMessage(){}},G:{mode,team:{p:[],o:[]}},NET:{role:mode==='host'||mode==='client'?mode:'local'},
  document:{head:{appendChild(){}},body,createElement:node,getElementById:id=>id==='bf-fx-layer'?{children:blocked?[{}]:[]}:null,
   querySelector:s=>s==='.screen.active'?{id:sid}:s.includes('#bf-abil-anim')?mounted.get('bf-abil-anim')||null:null},
  addEventListener:(ev,fn)=>{(listeners[ev]??=[]).push(fn);},requestIdleCallback(){},
  setTimeout:(fn,ms)=>schedule(fn,ms),setInterval:(fn,ms)=>schedule(fn,ms,ms),clearTimeout:id=>timers.delete(id),clearInterval:id=>timers.delete(id),useAbility(side,h){h.abilityUsed=true;}};
 c.window=c;vm.createContext(c);vm.runInContext(patch,c);
 const assets=map=>listeners.message.forEach(fn=>fn({data:{bfAbilityAnim:map}}));
 const hero=(id='bagslord',elite=false)=>({id,name:id,eliteMode:elite,ability:'Normal '+id,eAbility:'Elite '+id,abilityUsed:false});
 return {c,tick,overlays,assets,hero,block:v=>blocked=v,screen:v=>sid=v};
};