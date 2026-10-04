import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { checkEquipShop, checkServerGame, CAT_LABEL } from '@/lib/equipShopCheck';
import { GAME_HTML_VERSION } from '@/lib/gameHtmlLoader';

// Backoffice: comprueba qué cartas de equipo saldrán en la tienda del juego y cuáles no (y por qué).
export default function EquipShopCheckButton() {
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  async function run() {
    setBusy(true); setRes(null);
    try {
      const cards = await base44.entities.Card.list('number', 1000);
      let impls = [];
      try { impls = await base44.entities.AbilityImpl.filter({ effect_type: 'equipment' }, 'card_id', 1000); } catch (e) { impls = []; }
      const local = checkEquipShop(cards, impls);
      // Además se pregunta al servidor del juego qué lleva de verdad (versión y cartas en sus datos).
      let server = null;
      try {
        const r = await base44.functions.invoke('gameHtml', { version: GAME_HTML_VERSION, t: Date.now(), r: Math.random().toString(36).slice(2) });
        const html = typeof r.data === 'string' ? r.data : String(r.data || '');
        const hv = r.headers ? (r.headers['x-bf-patch-version'] || '') : '';
        server = checkServerGame(html, hv, GAME_HTML_VERSION, cards);
      } catch (e) { server = { error: String(e && e.message || e) }; }
      setRes({ ...local, server });
    } catch (e) { setRes({ error: String(e && e.message || e) }); }
    setBusy(false);
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={busy}
        className="rounded-xl border border-[#7ec97e66] px-4 py-2 text-sm font-black text-[#9fe39f] hover:bg-[#7ec97e] hover:text-[#0d1a0d] disabled:opacity-50">
        {busy ? 'Comprobando…' : '🔎 Comprobar tienda de equipo'}
      </button>
      {res && res.error ? <span className="text-[11px] text-red-300">No se pudo comprobar: {res.error}</span> : null}
      {res && !res.error ? (
        <div className="max-w-md text-[11px] text-[#d8d0e4]">
          {res.server ? (res.server.error ? <div className="mb-1 text-red-300">No se pudo consultar el servidor del juego: {res.server.error}</div> : (
            <div className="mb-1 rounded-lg border border-white/10 bg-black/30 p-2">
              <div className="font-bold">Servidor del juego</div>
              <div className={res.server.upToDate ? 'text-[#9fe39f]' : 'text-[#ffb3a8]'}>Versión: {res.server.serverVersion || 'desconocida'} {res.server.upToDate ? '✓ al día' : `✗ la app espera ${res.server.expectedVersion}: vuelve a publicar en Base44`}</div>
              <div className={res.server.notInGame.length ? 'text-[#ffb3a8]' : 'text-[#9fe39f]'}>Cartas de equipo dentro del juego: {res.server.inGame} de {res.server.total}</div>
              {res.server.params ? (
                <div className={res.server.params.count ? 'text-[#9fe39f]' : 'text-[#ffcf8a]'}>
                  Parámetros de equipo que lee el servidor: {res.server.params.count}
                  {res.server.params.count ? '' : ' (el juego los completa con los que manda la página)'}
                  {res.server.params.error ? <span className="text-[#ffb3a8]"> · Aviso del servidor: {res.server.params.error}</span> : null}
                </div>
              ) : null}
              {res.server.notInGame.length ? <div className="text-[#ffb3a8]">Faltan en el juego: {res.server.notInGame.map((c) => `Nº ${c.number} ${c.name}`).join(', ')}. Si la versión está al día, recarga el juego con Ctrl+F5.</div> : null}
            </div>
          )) : null}
          <div className="font-bold text-[#9fe39f]">{res.ok.length} cartas saldrán en la tienda.</div>
          {res.missing.length ? (
            <div className="mt-1 text-[#ffb3a8]">
              <div className="font-bold">{res.missing.length} NO saldrán:</div>
              {res.missing.map((m) => <div key={m.card_id}>• Nº {m.number} {m.name} ({CAT_LABEL[m.category] || m.category}): {m.why}.</div>)}
            </div>
          ) : <div className="text-[#9fe39f]">Todas las cartas de equipo están listas.</div>}
        </div>
      ) : null}
    </div>
  );
}
