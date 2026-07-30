import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MATCH_MODE_PATCH } from '@/lib/matchModePatch';
import { COACH_PUNKITO_PATCH } from '@/lib/coachPunkitoPatch';
import { NARRATOR_ACTION_PATCH } from '@/lib/narratorActionPatch';
import { BATTLE_UI_PATCH } from '@/lib/battleUiPatch';
import { BATTLE_PORTRAIT_PATCH } from '@/lib/battlePortraitPatch';
import { SPELL_FX_PATCH } from '@/lib/spellFxPatch';
import { ATTACK_FX_PATCH } from '@/lib/attackFxPatch';
import { SHIELD_FX_PATCH } from '@/lib/shieldFxPatch';
import { MOBILE_PINCH_PATCH } from '@/lib/mobilePinchZoomPatch';
import { MP_EQUIP_PATCH } from '@/lib/mpEquipPatch';
import { AUCTION_NODUP_PATCH } from '@/lib/auctionNoDupPatch';
import { AI_AUCTION_PATCH } from '@/lib/aiAuctionPatch';
import { HAND_UNDER_ACTION_PATCH } from '@/lib/handUnderActionPatch';
import { LOBBY_GUARD_PATCH } from '@/lib/lobbyGuardPatch';
import { EQUIP_DRAG_PATCH } from '@/lib/equipDragPatch';
import { RIVAL_HAND_BACK_PATCH } from '@/lib/rivalHandBackPatch';
import { CARD_MAGNIFIER_PATCH } from '@/lib/cardMagnifierPatch';
import { buildNetResilientPatch } from '@/lib/netResilientPatch';
import { CENTRAL_LOBBY_PATCH } from '@/lib/centralLobbyPatch';
import { NET_RECONNECT_PATCH } from '@/lib/netReconnectPatch';
import { bindGameLobbyBridge } from '@/lib/gameLobbyBridge';
import { FINAL_CINEMATIC_PATCH } from '@/lib/finalCinematicPatch';
import { STATUS_AURA_PATCH } from '@/lib/statusAuraPatch';
import { HERO_NAME_SIGIL_PATCH } from '@/lib/heroNameSigilPatch';
import { BATTLE_ANIME_PATCH } from '@/lib/battleAnimePatch';
import { HERO_BLOOD_FX_PATCH } from '@/lib/heroBloodFxPatch';
import { MATCH_RESULT_PATCH } from '@/lib/matchResultPatch';
import { RANKING_BUTTON_PATCH } from '@/lib/rankingButtonPatch';
import { ABILITY_FX_PATCH } from '@/lib/abilityFxPatch';
import { EPIC_ABILITY_FX_PATCH } from '@/lib/epicAbilityFxPatch';
import { RAINBOW_BORDER_PATCH } from '@/lib/rainbowBorderPatch';
import { ACTION_FOCUS_PATCH } from '@/lib/actionFocusPatch';
import { OBJECT_FX_PATCH } from '@/lib/objectFxPatch';
import { HAND_PICK_HIGHLIGHT_PATCH } from '@/lib/handPickHighlightPatch';
import { CARD_PLAY_REVEAL_PATCH } from '@/lib/cardPlayRevealPatch';
import { GUIDE_HELP_BADGE_PATCH } from '@/lib/guideHelpBadgePatch';
import { SPECIAL_CARD_CINEMATIC_PATCH } from '@/lib/specialCardCinematicPatch';
import { MATCH_RECOVERY_PATCH } from '@/lib/matchRecoveryPatch';
import { buildLangEnPatch } from '@/lib/langEnPatch';
import { getLang, setLang, t } from '@/lib/i18n';
import { buildLangSelectorPatch } from '@/lib/langSelectorPatch';
import { NICK_REQUIRED_PATCH } from '@/lib/nickRequiredPatch';
import { NICK_MEMORY_PATCH } from '@/lib/nickMemoryPatch';
import { QUIT_CONTACT_PATCH } from '@/lib/quitContactPatch';
import { HOW_TO_PLAY_PATCH } from '@/lib/howToPlayPatch';
import { DEMO_TIPS_PATCH } from '@/lib/demoTipsPatch';
import { DEMO_FLOW_PATCH } from '@/lib/demoFlowPatch';
import { HOME_TEXTS_PATCH } from '@/lib/homeTextsPatch';
import { AUCTION_THUMB_PATCH } from '@/lib/auctionThumbPatch';
import { NARBON_ELITE_PATCH } from '@/lib/narbonElitePatch';

const ORACLE_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab6da3724_generated_image.png';
const EXPECTED_PATCH_VERSION = 'bf-2026-07-30-mp-reconnect-v202';
const MAX_LOAD_ATTEMPTS = 6;

const DRAGGABLE_GUIDE_PATCH = `
<script>
(function(){
  if (window.__bfGuideDragHomePatch) return;
  window.__bfGuideDragHomePatch = true;

  function patchGuideDrag(){
    var wrap = document.getElementById('bf-guide');
    if (!wrap || wrap.dataset.bfHomeDrag === '1') return;
    wrap.dataset.bfHomeDrag = '1';
    wrap.style.pointerEvents = 'auto';
    wrap.style.touchAction = 'none';
    wrap.style.cursor = 'grab';

    function clamp(x, y){
      var maxX = Math.max(0, window.innerWidth - (wrap.offsetWidth || 260) - 8);
      var maxY = Math.max(0, window.innerHeight - (wrap.offsetHeight || 100) - 8);
      wrap.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
      wrap.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
    }

    function loadPos(){
      try {
        var pos = JSON.parse(sessionStorage.getItem('bfGuidePos') || 'null');
        if (pos) { clamp(Number(pos.x || 8), Number(pos.y || 8)); return; }
      } catch (e) {}
      // Posición inicial: centrado horizontalmente y bajo los botones del
      // menú (Aprender a jugar / Cómo se juega / Razas), no pegado al borde.
      var w = wrap.offsetWidth || 260;
      var defX = Math.round((window.innerWidth - w) / 2);
      var defY = Math.round(window.innerHeight * 0.62);
      clamp(defX, defY);
    }

    function savePos(){
      try { sessionStorage.setItem('bfGuidePos', JSON.stringify({ x: wrap.offsetLeft, y: wrap.offsetTop })); } catch (e) {}
    }

    function point(e){ return e.touches && e.touches[0] ? e.touches[0] : e; }
    var drag = null;

    function start(e){
      if (e.target && e.target.closest && e.target.closest('.bf-guide-x')) return;
      var p = point(e);
      drag = { sx: p.clientX - wrap.offsetLeft, sy: p.clientY - wrap.offsetTop };
      wrap.style.transition = 'none';
      wrap.style.cursor = 'grabbing';
      e.preventDefault();
      e.stopPropagation();
    }

    function move(e){
      if (!drag) return;
      var p = point(e);
      clamp(p.clientX - drag.sx, p.clientY - drag.sy);
      e.preventDefault();
    }

    function end(){
      if (!drag) return;
      drag = null;
      wrap.style.transition = '';
      wrap.style.cursor = 'grab';
      savePos();
    }

    loadPos();
    var char = wrap.querySelector('.bf-guide-char');
    wrap.addEventListener('mousedown', start);
    wrap.addEventListener('touchstart', start, { passive:false });
    if (char) {
      char.addEventListener('mousedown', start);
      char.addEventListener('touchstart', start, { passive:false });
    }
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, { passive:false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
  }

  // The collapsed circular button (#bf-guide-show) should also be draggable.
  // We must keep its click-to-reopen working, so we only treat a gesture as a
  // drag once the pointer moves past a small threshold; a plain tap still opens.
  function patchShowDrag(){
    var btn = document.getElementById('bf-guide-show');
    if (!btn || btn.dataset.bfHomeDrag === '1') return;
    btn.dataset.bfHomeDrag = '1';
    btn.style.touchAction = 'none';

    function clampS(x, y){
      var maxX = Math.max(0, window.innerWidth - (btn.offsetWidth || 64) - 4);
      var maxY = Math.max(0, window.innerHeight - (btn.offsetHeight || 64) - 4);
      btn.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
      btn.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
    }

    function loadPosS(){
      try {
        var pos = JSON.parse(sessionStorage.getItem('bfGuideShowPos') || 'null');
        if (pos) clampS(Number(pos.x), Number(pos.y));
      } catch (e) {}
    }

    function pointS(e){ return e.touches && e.touches[0] ? e.touches[0] : e; }
    var st = null;

    function startS(e){
      var p = pointS(e);
      st = { sx: p.clientX - btn.offsetLeft, sy: p.clientY - btn.offsetTop, ox: p.clientX, oy: p.clientY, moved: false };
      btn.style.transition = 'none';
    }
    function moveS(e){
      if (!st) return;
      var p = pointS(e);
      if (!st.moved && Math.abs(p.clientX - st.ox) + Math.abs(p.clientY - st.oy) < 6) return;
      st.moved = true;
      clampS(p.clientX - st.sx, p.clientY - st.sy);
      e.preventDefault();
    }
    function endS(){
      if (!st) return;
      btn.style.transition = '';
      if (st.moved) { try { sessionStorage.setItem('bfGuideShowPos', JSON.stringify({ x: btn.offsetLeft, y: btn.offsetTop })); } catch (e) {} btn.dataset.bfDragged = '1'; setTimeout(function(){ btn.dataset.bfDragged = ''; }, 50); }
      st = null;
    }

    loadPosS();
    btn.addEventListener('mousedown', startS);
    btn.addEventListener('touchstart', startS, { passive:false });
    document.addEventListener('mousemove', moveS);
    document.addEventListener('touchmove', moveS, { passive:false });
    document.addEventListener('mouseup', endS);
    document.addEventListener('touchend', endS);
    // Swallow the click that follows a real drag so it doesn't reopen the bubble.
    btn.addEventListener('click', function(e){ if (btn.dataset.bfDragged === '1') { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  function patchAllGuideDrag(){ patchGuideDrag(); patchShowDrag(); }

  var style = document.createElement('style');
  style.textContent = '.bf-guide{pointer-events:auto!important;touch-action:none!important;cursor:grab!important}.bf-guide-char,.bf-guide-bubble{pointer-events:auto!important}.bf-guide-x{cursor:pointer!important}.bf-guide-show{cursor:grab!important;touch-action:none!important}.bf-guide-show:active{cursor:grabbing!important}';
  document.head.appendChild(style);

  // Avisa a la página padre de qué pantalla del juego está activa, para que
  // pueda mostrar/ocultar el botón del Oráculo Bizarro (solo en la portada).
  function notifyActiveScreen(){
    var active = document.querySelector('.screen.active');
    // No avisamos hasta que el juego tenga SU pantalla activa real: antes de
    // eso el CSS/layout del juego no se ha aplicado y avisar antes provocaría
    // el flash de iconos enormes (HTML sin estilizar).
    if (!active) return;
    var id = active.id || 's-title';
    if (window.__bfLastScreenId === id) return;
    window.__bfLastScreenId = id;
    // Doble requestAnimationFrame: garantiza que el navegador ya PINTÓ la
    // pantalla del juego con su CSS aplicado antes de avisar al padre para
    // que quite el overlay. Sin esto, el padre oculta el overlay cuando el
    // DOM del juego ya existe pero el CSS aún no se ha pintado (flash).
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        try { window.parent.postMessage({ bfScreen: id }, '*'); } catch (e) {}
      });
    });
  }
  setInterval(notifyActiveScreen, 300);
  notifyActiveScreen();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchAllGuideDrag);
  else patchAllGuideDrag();
  new MutationObserver(patchAllGuideDrag).observe(document.documentElement, { childList:true, subtree:true });

  function patchMobileBidSteppers(){
    document.querySelectorAll('input.bid-mini-input[id^="bid_"]').forEach(function(input){
      if (input.dataset.bfMobileStepper === '1') return;
      input.dataset.bfMobileStepper = '1';
      input.inputMode = 'numeric';
      input.step = input.step || '1';
      var row = input.parentElement;
      if (!row) return;
      function change(delta){
        var min = Number(input.min || 0);
        var max = Number(input.max || 9999);
        var value = Number(input.value || min);
        input.value = String(Math.max(min, Math.min(max, value + delta)));
        input.dataset.bfTouched = '1';
        input.dispatchEvent(new Event('input', { bubbles:true }));
      }
      var minus = document.createElement('button');
      minus.type = 'button';
      minus.className = 'bf-mobile-bid-stepper bf-mobile-bid-minus';
      minus.textContent = '−';
      minus.setAttribute('aria-label', 'Bajar puja');
      minus.onclick = function(e){ e.preventDefault(); e.stopPropagation(); change(-1); };
      var plus = document.createElement('button');
      plus.type = 'button';
      plus.className = 'bf-mobile-bid-stepper bf-mobile-bid-plus';
      plus.textContent = '+';
      plus.setAttribute('aria-label', 'Subir puja');
      plus.onclick = function(e){ e.preventDefault(); e.stopPropagation(); change(1); };
      row.insertBefore(minus, input);
      row.insertBefore(plus, input.nextSibling);
    });
  }

  var bidStyle = document.createElement('style');
  bidStyle.textContent = '.hcard-bid-zone>div:first-child{align-items:center!important;flex-wrap:wrap!important}.bf-mobile-bid-stepper{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;border:1.5px solid rgba(255,210,74,.7);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600;font-size:24px;font-weight:1000;line-height:1;box-shadow:0 3px 10px rgba(0,0,0,.4);padding:0;flex:0 0 38px;cursor:pointer;user-select:none}.bf-mobile-bid-stepper:active{transform:scale(.92)}.bid-mini-input{min-width:54px!important;text-align:center!important}.bid-mini-input::-webkit-outer-spin-button,.bid-mini-input::-webkit-inner-spin-button{-webkit-appearance:none!important;margin:0!important}.bid-mini-input{-moz-appearance:textfield!important;appearance:textfield!important}';
  document.head.appendChild(bidStyle);
  patchMobileBidSteppers();
  new MutationObserver(patchMobileBidSteppers).observe(document.documentElement, { childList:true, subtree:true });
})();
</script>
`;

// Avisa a la página padre justo antes de que el iframe se recargue (botón
// "Salir" / "Volver al inicio" → el juego recarga el iframe). Así el padre
// puede tapar el iframe y evitar el flash de "iconos enormes" (el HTML del
// juego recién cargado, antes de que inyecte su CSS de layout).
const RELOAD_COVER_PATCH = `<script>window.addEventListener('pagehide',function(){try{parent.postMessage({bfReloading:true},'*')}catch(e){}});</script>`;

const UA = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
// Tablets (iPad, Android sin "Mobile", Mac con pantalla táctil) usan el mismo
// modo que el móvil: vista de escritorio (1200px) escalada + zoom de pellizco.
const IS_TABLET = /iPad/i.test(UA) || (/Macintosh|Mac OS/i.test(UA) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1) || (/Android/i.test(UA) && !/Mobile/i.test(UA));
const IS_MOBILE = IS_TABLET || /Android|iPhone|iPod|Mobile/i.test(UA);

export default function Home() {
  useEffect(() => {
    const blockContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', blockContextMenu);
    return () => document.removeEventListener('contextmenu', blockContextMenu);
  }, []);

  const iframeRef = useRef(null);
  const loadTimerRef = useRef(null);
  const battleArtRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState('');
  const [srcDoc, setSrcDoc] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbCount, setDbCount] = useState(107);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOracle, setShowOracle] = useState(true);

  useEffect(() => bindGameLobbyBridge(iframeRef), []);

  // Móvil: el juego se renderiza a ancho de escritorio (1200px) dentro del
  // iframe y se escala para caber en la pantalla. El zoom táctil (pellizcar)
  // lo gestiona el navegador sobre la página, habilitado en el viewport.
  const [mobScale, setMobScale] = useState(() =>
    IS_MOBILE && typeof window !== 'undefined' ? Math.min(1, window.innerWidth / 1200) : 1
  );

  useEffect(() => {
    if (!IS_MOBILE) return;
    const update = () => setMobScale(Math.min(1, window.innerWidth / 1200));
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', () => setTimeout(update, 300));
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.data && typeof e.data.bfScreen === 'string') {
        setShowOracle(e.data.bfScreen === 's-title');
        // El juego ya inicializó su CSS/layout: se puede quitar el spinner
        // (evita el flash de iconos enormes tras recargar el iframe).
        // Pequeño retardo antes de ocultar el overlay: da tiempo al juego a
        // aplicar su CSS/layout para que no se vea el flash de iconos enormes.
        if (loadTimerRef.current) { clearTimeout(loadTimerRef.current); loadTimerRef.current = null; }
        loadTimerRef.current = setTimeout(() => setLoading(false), 400);
        // Envía el mapa de escenas de batalla al iframe (lo reenvía en cada
        // cambio de pantalla para asegurar que arrive aunque el iframe recargue).
        if (battleArtRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfBattleArt: battleArtRef.current }, '*');
        }
      }
      if (e.data && e.data.bfReloading) {
        // El iframe se va a recargar (Salir / Volver al inicio): tapamos para
        // evitar el flash de iconos enormes antes de que el CSS del juego aplique.
        setLoading(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const navigate = useNavigate();

  // Guarda el resultado de cada partida y atiende la navegación pedida por el
  // botón "Top Ranking" del menú del juego.
  useEffect(() => {
    const onResult = (e) => {
      if (e.data && e.data.bfMatchResult) {
        base44.entities.MatchResult.create(e.data.bfMatchResult).catch(() => {});
      }
      if (e.data && typeof e.data.bfNavigate === 'string') navigate(e.data.bfNavigate);
      if (e.data && typeof e.data.bfSetLang === 'string') setLang(e.data.bfSetLang);
      // El juego pide el arte de hechizos/objetos para la carta revelada al
      // jugarse: se responde con un mapa nombre → imagen desde la base de datos.
      // Con el idioma en inglés se añade además un diccionario texto ES → EN de
      // todas las cartas para que el parche de traducción lo aplique en vivo.
      if (e.data && e.data.bfArtMapRequest) {
        base44.entities.Card.list('number', 300).then(cards => {
          const isEn = getLang() === 'en';
          const ITEM_CATS = ['spell', 'object', 'ranged_weapon', 'melee_weapon'];
          const map = {};
          const info = {};
          const dict = {};
          (cards || []).forEach(c => {
            if (!c.name) return;
            const en = isEn ? (c.en || {}) : {};
            const isItem = ITEM_CATS.includes(c.category);
            if (isItem && c.art_url) map[c.name] = c.art_url;
            // Texto del Oráculo + coste de maná, para la carta revelada al jugarse.
            const text = en.description || en.ability_text || c.description || c.ability_text || '';
            if (isItem && (text || c.mana != null)) info[c.name] = { text, mana: c.mana != null ? c.mana : null, category: c.category };
            if (isEn && c.en) {
              ['title', 'ability_name', 'ability_text', 'elite_ability_name', 'elite_ability_text', 'description'].forEach(f => {
                if (c[f] && c.en[f] && c[f] !== c.en[f]) dict[c[f]] = c.en[f];
              });
            }
          });
          iframeRef.current?.contentWindow?.postMessage({ bfArtMap: map, bfCardInfo: info, bfCardDict: dict }, '*');
        }).catch(() => {});
      }
    };
    window.addEventListener('message', onResult);
    return () => window.removeEventListener('message', onResult);
  }, [navigate]);

  useEffect(() => {
    base44.entities.Card.list('number', 200).then(cards => {
      if (cards?.length) setDbCount(cards.length);
    });
    base44.auth.me().then(user => setIsAdmin(user?.role === 'admin')).catch(() => setIsAdmin(false));
  }, []);

  // Carga las escenas de batalla de los héroes (base + élite) y las envía al
  // iframe para que el rectángulo de batalla muestre el arte de combate en vez
  // del retrato, cambiando a la versión élite cuando el héroe entra en modo élite.
  useEffect(() => {
    base44.entities.Card.filter({ category: 'hero' }, 'number', 300).then(cards => {
      const map = {};
      (cards || []).forEach(c => {
        if (c.card_id && c.battle_art_url) {
          map[c.card_id] = { base: c.battle_art_url, elite: c.elite_battle_art_url || c.battle_art_url };
        }
      });
      battleArtRef.current = map;
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    let createdUrl = '';

    const loadGame = async (attempt = 1) => {
      try {
        if (cancelled) return;
        setError(false);
        setLoading(true);

        const [res, turnRes] = await Promise.all([
          base44.functions.invoke('gameHtml', {
            version: EXPECTED_PATCH_VERSION,
            t: Date.now(),
            r: Math.random().toString(36).slice(2),
            attempt,
          }),
          base44.functions.invoke('getTurnCredentials', {}),
        ]);

        if (cancelled) return;
        const data = typeof res.data === 'string' ? res.data : String(res.data);
        const turnIceServers = Array.isArray(turnRes.data?.iceServers) ? turnRes.data.iceServers : [];
        if (!data || data.length < 1000) throw new Error('empty');

        // The game HTML is ~480KB. Injecting it through srcDoc (a giant HTML
        // attribute) hangs on production/mobile. A Blob URL loads large HTML
        // reliably across browsers and devices.
        const INJECT = DRAGGABLE_GUIDE_PATCH + RELOAD_COVER_PATCH + MATCH_MODE_PATCH + COACH_PUNKITO_PATCH + NARRATOR_ACTION_PATCH + BATTLE_UI_PATCH + BATTLE_PORTRAIT_PATCH + SPELL_FX_PATCH + ATTACK_FX_PATCH + SHIELD_FX_PATCH + MP_EQUIP_PATCH + AUCTION_NODUP_PATCH + AI_AUCTION_PATCH + HAND_UNDER_ACTION_PATCH + LOBBY_GUARD_PATCH + EQUIP_DRAG_PATCH + RIVAL_HAND_BACK_PATCH + CARD_MAGNIFIER_PATCH + buildNetResilientPatch(turnIceServers) + CENTRAL_LOBBY_PATCH + NET_RECONNECT_PATCH + FINAL_CINEMATIC_PATCH + STATUS_AURA_PATCH + HERO_NAME_SIGIL_PATCH + BATTLE_ANIME_PATCH + HERO_BLOOD_FX_PATCH + MATCH_RESULT_PATCH + RANKING_BUTTON_PATCH + ABILITY_FX_PATCH + EPIC_ABILITY_FX_PATCH + RAINBOW_BORDER_PATCH + ACTION_FOCUS_PATCH + OBJECT_FX_PATCH + HAND_PICK_HIGHLIGHT_PATCH + CARD_PLAY_REVEAL_PATCH + GUIDE_HELP_BADGE_PATCH + SPECIAL_CARD_CINEMATIC_PATCH + MATCH_RECOVERY_PATCH + NICK_MEMORY_PATCH + NICK_REQUIRED_PATCH + QUIT_CONTACT_PATCH + HOW_TO_PLAY_PATCH + HOME_TEXTS_PATCH + AUCTION_THUMB_PATCH + NARBON_ELITE_PATCH + DEMO_FLOW_PATCH + buildLangEnPatch(getLang()) + DEMO_TIPS_PATCH + buildLangSelectorPatch(getLang()) + (IS_MOBILE ? MOBILE_PINCH_PATCH : '');
        // Portada: "EDICIÓN V5" → "Base Set".
        let baseData = data.replace(/EDICI[ÓO]N&nbsp;V5/g, 'Base Set').replace(/Doc Radiante/g, 'Clint Tripud').replace(/Krunder(?![kK]| Mec)/g, 'Xabierus');
        // Botón "Hechizo" del panel de acciones: en vez del multiplicador de HE,
        // muestra el maná que le queda al héroe para lanzar hechizos.
        baseData = baseData.split("hasSpell?('×'+(stat(h,'he')/HE_REF).toFixed(1)):'—'").join("h.maxMana>0?('🔵 '+h.mana):'—'");
        let patchedData = baseData.includes('</body>')
          ? baseData.replace('</body>', INJECT + '</body>')
          : baseData + INJECT;
        if (IS_MOBILE) {
          // En móvil los iframes con blob: URL grandes a veces no renderizan.
          // srcDoc carga el HTML de forma fiable en navegadores móviles.
          setSrcDoc(patchedData);
        } else {
          // En escritorio el Blob URL evita el cuelgue del srcDoc gigante.
          createdUrl = URL.createObjectURL(new Blob([patchedData], { type: 'text/html' }));
          setBlobUrl(createdUrl);
        }
        // No quitamos el loading aquí: el iframe todavía no ha renderizado su
        // contenido. Se oculta en el onLoad del iframe para evitar el flash de
        // iconos grandes/sin estilo mientras el juego termina de montarse.
      } catch {
        if (cancelled) return;
        if (attempt < MAX_LOAD_ATTEMPTS) {
          setTimeout(() => loadGame(attempt + 1), 400 * attempt);
          return;
        }
        setError(true);
      }
    };

    loadGame();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0e0a16] text-[#efe9dc] p-6 text-center">
        {t('No se pudo cargar el juego. Recarga la página para intentarlo de nuevo.')}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0e0a16]">
      <div
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
        style={{ opacity: loading ? 1 : 0, transition: loading ? 'none' : 'opacity 300ms ease-out', background: '#0e0a16' }}
      >
        <div className="w-9 h-9 border-4 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin" />
      </div>
      {/* Oráculo Bizarro — acceso al catálogo, solo en la portada inicial */}
      {showOracle && (
        <Link to="/cards" className="absolute bottom-5 right-4 z-20 flex items-center gap-2 group" style={{ filter: 'drop-shadow(0 0 14px rgba(192,91,255,0.55))' }}>
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#c06bff] shadow-[0_0_22px_rgba(192,91,255,0.55)] transition-transform group-hover:scale-110">
            <img src={ORACLE_IMG} alt="Oráculo" className="w-full h-full object-cover" />
          </div>
          <div className="bg-[#120a1e] border border-[#c06bff]/60 rounded-xl px-3 py-1.5 backdrop-blur-sm shadow-lg">
            <div className="font-heading font-black text-[13px] text-[#e2b0ff] leading-none tracking-wide">{t('Oráculo Bizarro')}</div>
            <div className="text-[9px] text-[#b06cff] mt-0.5 font-bold tracking-wider">{dbCount} {t('cartas · Base Set')}</div>
          </div>
        </Link>
      )}

      {(blobUrl || srcDoc) && (
        <iframe
          ref={iframeRef}
          title="Bizarre Fantasies v5"
          {...(srcDoc ? { srcDoc } : { src: blobUrl })}
          onLoad={() => {
            // No ocultamos el spinner en el onLoad: el iframe acaba de cargar su
            // HTML pero el juego aún no inyecta el CSS/layout (flash de iconos
            // enormes). Se oculta al recibir la primera pantalla lista (bfScreen)
            // o, si no llega, tras un seguro de 3.5s.
            if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
            loadTimerRef.current = setTimeout(() => setLoading(false), 3500);
          }}
          className={IS_MOBILE ? 'border-0' : 'w-full h-full border-0'}
          style={IS_MOBILE ? {
            width: 1200,
            height: Math.ceil(window.innerHeight / mobScale),
            transform: `scale(${mobScale})`,
            transformOrigin: 'top left',
          } : undefined}
          allow="autoplay; fullscreen; clipboard-read; clipboard-write"
        />
      )}
    </div>
  );
}