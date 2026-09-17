// Patch native targeting only; never broaden humanCtl or wrap the auction router.
export function patchAbilityTargetingHtml(html) {
  const replacements = [
    ["if(humanCtl(side)){ if(k==='revive')", "if(window.bfAbilityHuman(side)){ if(k==='revive')"],
    ["'silence','debuff'].includes(k);}", "'silence','debuff','drain'].includes(k);}"],
    ['B.pending={prompt,validSide,cb,allowDead:!!opts.allowDead}', 'B.pending={prompt,validSide,cb,allowDead:!!opts.allowDead,requestId:crypto.randomUUID(),allowedIds:opts.allowedIds||null,noCancel:!!opts.noCancel}'],
    ['allowDead:B.pending.allowDead}:null', 'allowDead:B.pending.allowDead,requestId:B.pending.requestId,allowedIds:B.pending.allowedIds,noCancel:B.pending.noCancel}:null'],
    ['if(!B.pending||B.pending.validSide!==side)return;', 'if(!B.pending||B.pending.validSide!==side)return; if(B.pending.allowedIds&&B.pending.allowedIds.indexOf(id)<0)return;'],
    ["sendIntent('target',{side,id})", "sendIntent('target',{side,id,requestId:B.pending.requestId})"],
    ["function cancelPending(){ if(NET.role==='client'){ sendIntent('cancel',{}); return;} B.pending=null; renderBattle(); netSync('s-battle'); }", "function cancelPending(){ if(!B||!B.pending)return; if(B.pending.noCancel){notif('Completa la selección de objetivo para terminar la habilidad.');return;} if(NET.role==='client'){ sendIntent('cancel',{requestId:B.pending.requestId}); return;} B.pending=null; if(window.bfReleaseAbility)window.bfReleaseAbility(); renderBattle(); netSync('s-battle'); }"],
    ["if(op==='target'){ if(B&&B.pending) pickTarget(msg.side,msg.id); return; }", "if(op==='target'){ if(window.bfValidTargetIntent(msg)) pickTarget(msg.side,msg.id); return; }"],
    ["if(op==='cancel'){ if(B&&B.pending) cancelPending(); return; }", "if(op==='cancel'){ if(window.bfValidTargetIntent(msg)) cancelPending(); return; }"]
  ];
  for (const [from, to] of replacements) html = html.replace(from, to);
  return html;
}