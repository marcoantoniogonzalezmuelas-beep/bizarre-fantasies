import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MATCH_MODE_PATCH } from '@/lib/matchModePatch';
import { COACH_PUNKITO_PATCH } from '@/lib/coachPunkitoPatch';
import { NARRATOR_ACTION_PATCH } from '@/lib/narratorActionPatch';
import { BATTLE_UI_PATCH } from '@/lib/battleUiPatch';
import { BATTLE_PORTRAIT_PATCH } from '@/lib/battlePortraitPatch';
import { FX_ROOT_PATCH } from '@/lib/fxRootPatch';
import { SPELL_FX_PATCH } from '@/lib/spellFxPatch';
import { ATTACK_FX_PATCH } from '@/lib/attackFxPatch';
import { SHIELD_FX_PATCH } from '@/lib/shieldFxPatch';
import { HEAL_NUMBER_PATCH } from '@/lib/healNumberPatch';
import { DAMAGE_NUMBER_PATCH } from '@/lib/damageNumberPatch';
import { STAT_NUMBER_PATCH } from '@/lib/statNumberPatch';
import { CARD_ART_MAP_PATCH } from '@/lib/cardArtMapPatch';
import { PERF_BOOST_PATCH } from '@/lib/perfBoostPatch';
import { MOBILE_PINCH_PATCH } from '@/lib/mobilePinchZoomPatch';
import { MOBILE_ANTIFLICKER_PATCH } from '@/lib/mobileAntiFlickerPatch';
import { BATTLE_FOCUS_ZOOM_PATCH } from '@/lib/battleFocusZoomPatch';
import { MODAL_FOCUS_PATCH } from '@/lib/modalFocusPatch';
import { NO_FLICKER_PATCH } from '@/lib/noFlickerPatch';
import { PINCH_FREEZE_PATCH } from '@/lib/pinchFreezePatch';
import { PINCH_ANIM_FREEZE_PATCH } from '@/lib/pinchAnimFreezePatch';
import { WHITE_FLASH_FIX_PATCH } from '@/lib/whiteFlashFixPatch';
import { CRITICAL_HEAD_CSS } from '@/lib/criticalHeadCss';
import { MP_EQUIP_PATCH } from '@/lib/mpEquipPatch';
import { AUCTION_NODUP_PATCH } from '@/lib/auctionNoDupPatch';
import { AI_AUCTION_PATCH } from '@/lib/aiAuctionPatch';
import { HAND_UNDER_ACTION_PATCH } from '@/lib/handUnderActionPatch';
import { LOBBY_GUARD_PATCH } from '@/lib/lobbyGuardPatch';
import { EQUIP_DRAG_PATCH } from '@/lib/equipDragPatch';
import { RIVAL_HAND_BACK_PATCH } from '@/lib/rivalHandBackPatch';
import { SHOP_SPELL_ART_PATCH } from '@/lib/shopSpellArtPatch';
import { CARD_MAGNIFIER_PATCH } from '@/lib/cardMagnifierPatch';
import { HAND_DIRECT_PLAY_PATCH } from '@/lib/handDirectPlayPatch';
import { DISCARD_PILE_PATCH } from '@/lib/discardPilePatch';
import { RECOVER_SPELL_PATCH } from '@/lib/recoverSpellPatch';
import { MP_FX_SYNC_PATCH } from '@/lib/mpFxSyncPatch';
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
import { MATCH_SCORE_PATCH } from '@/lib/matchScorePatch';
import { RANKING_BUTTON_PATCH } from '@/lib/rankingButtonPatch';
import { RULES_BUTTON_PATCH } from '@/lib/rulesButtonPatch';
import { ABILITY_FX_PATCH } from '@/lib/abilityFxPatch';
import { EPIC_ABILITY_FX_PATCH } from '@/lib/epicAbilityFxPatch';
import { RAINBOW_BORDER_PATCH } from '@/lib/rainbowBorderPatch';
import { ACTION_FOCUS_PATCH } from '@/lib/actionFocusPatch';
import { OBJECT_FX_PATCH } from '@/lib/objectFxPatch';
import { HAND_PICK_HIGHLIGHT_PATCH } from '@/lib/handPickHighlightPatch';
import { CARD_PLAY_REVEAL_PATCH } from '@/lib/cardPlayRevealPatch';
import { CARD_REVEAL_LOCK_PATCH } from '@/lib/cardRevealLockPatch';
import { ABILITY_USED_MEMORY_PATCH } from '@/lib/abilityUsedMemoryPatch';
import { GUIDE_HELP_BADGE_PATCH } from '@/lib/guideHelpBadgePatch';
import { SPECIAL_CARD_CINEMATIC_PATCH } from '@/lib/specialCardCinematicPatch';
import { MATCH_RECOVERY_PATCH } from '@/lib/matchRecoveryPatch';
import { BATTLE_RULES_PATCH } from '@/lib/battleRulesPatch';
import { buildLangEnPatch } from '@/lib/langEnPatch';
import { getLang, setLang, t } from '@/lib/i18n';
import { buildLangSelectorPatch } from '@/lib/langSelectorPatch';
import { NICK_REQUIRED_PATCH } from '@/lib/nickRequiredPatch';
import { NICK_MEMORY_PATCH } from '@/lib/nickMemoryPatch';
import { NICK_PASSWORD_PATCH } from '@/lib/nickPasswordPatch';
import { buildQuitContactPatch } from '@/lib/quitContactPatch';
import { HOW_TO_PLAY_PATCH } from '@/lib/howToPlayPatch';
import { DEMO_TIPS_PATCH } from '@/lib/demoTipsPatch';
import { MODE_ICON_PATCH } from '@/lib/modeIconPatch';
import { DEMO_FLOW_PATCH } from '@/lib/demoFlowPatch';
import { TYPE_MEDAL_PATCH } from '@/lib/typeMedalPatch';
import { ACTION_PANEL_STABLE_PATCH } from '@/lib/actionPanelStablePatch';
import { AI_STRATEGY_PATCH } from '@/lib/aiStrategyPatch';
import { AVATAR_PATCH } from '@/lib/avatarPatch';
import { AI_LEVEL_PATCH } from '@/lib/aiLevelPatch';
import { END_GAME_FIX_PATCH } from '@/lib/endGameFixPatch';
import { END_HEROES_PATCH } from '@/lib/endHeroesPatch';
import { REMATCH_PATCH } from '@/lib/rematchPatch';
import { VS_TEXT_PATCH } from '@/lib/vsTextPatch';
import { buildFumbleRollPatch } from '@/lib/fumbleRollPatch';

import { buildHomeTextsPatch } from '@/lib/homeTextsPatch';
import { AUCTION_THUMB_PATCH } from '@/lib/auctionThumbPatch';
import { AUCTION_CONTROL_PATCH } from '@/lib/auctionControlPatch';
import { NARBON_ELITE_PATCH } from '@/lib/narbonElitePatch';
import { TOKEN_ABILITIES_PATCH } from '@/lib/tokenAbilitiesPatch';
import { CRANE_SUMMON_PATCH } from '@/lib/craneSummonPatch';
import { DAIDOJI_BLADE_PATCH } from '@/lib/daidojiBladePatch';
import { ABILITY_IMPL_PATCH } from '@/lib/abilityImplPatch';
import { NIXARA_ABILITY_PATCH } from '@/lib/nixaraAbilityPatch';
import { JUNIANA_ABILITY_PATCH } from '@/lib/junianaAbilityPatch';
import { FAITHFUL_ABILITIES_PATCH } from '@/lib/faithfulAbilitiesPatch';
import { PASSIVE_MARKER_PATCH } from '@/lib/passiveMarkerPatch';
import { ABILITY_ANIM_PATCH } from '@/lib/abilityAnimPatch';
import { TABLE_MAT_PATCH } from '@/lib/tableMatPatch';
import { EQ_HERO_SCENE_BG_PATCH } from '@/lib/eqHeroSceneBgPatch';
import { BATTLE_SCENE_BG_PATCH } from '@/lib/battleSceneBgPatch';
import { TURN_UNSTICK_PATCH } from '@/lib/turnUnstickPatch';
import { AI_WAIT_CINE_PATCH } from '@/lib/aiWaitCinePatch';
import { KILL_ACTOR_PATCH } from '@/lib/killActorPatch';
import { FINAL_ACTION_RECAP_PATCH } from '@/lib/finalActionRecapPatch';
import { MP_ABILITY_CINE_PATCH } from '@/lib/mpAbilityCinePatch';
import { CINE_TOGGLE_PATCH } from '@/lib/cineTogglePatch';
import { BIZARRE_ROOM_PATCH } from '@/lib/bizarreRoomPatch';
import { BIZARRE_RETURN_PATCH } from '@/lib/bizarreReturnPatch';
import { CHAT_STATUS_PATCH } from '@/lib/chatStatusPatch';
import { GAME_LOG_PATCH } from '@/lib/gameLogPatch';
import { SPEED_GAUGE_PATCH } from '@/lib/speedGaugePatch';
import { BATTLE_LOG_ORDER_PATCH } from '@/lib/battleLogOrderPatch';
import { HOME_MENU_PATCH } from '@/lib/homeMenuPatch';
import FlashNewsMarquee from '@/components/home/FlashNewsMarquee';
import HomeSecondaryLinks from '@/components/home/HomeSecondaryLinks';
import ChatOverlay from '@/components/chat/ChatOverlay';
import IntroCinematic from '@/components/cinematic/IntroCinematic';

const ORACLE_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab6da3724_generated_image.png';
const EXPECTED_PATCH_VERSION = 'bf-2026-07-31-abil-anim-v204';
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
  setInterval(notifyActiveScreen, 1000);
  notifyActiveScreen();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchAllGuideDrag);
  else patchAllGuideDrag();
  var _bfGd=0; new MutationObserver(function(){ var n=Date.now(); if(n-_bfGd<500)return; _bfGd=n; patchAllGuideDrag(); }).observe(document.documentElement, { childList:true, subtree:true });

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
  var _bfBs=0; new MutationObserver(function(){ var n=Date.now(); if(n-_bfBs<500)return; _bfBs=n; patchMobileBidSteppers(); }).observe(document.documentElement, { childList:true, subtree:true });
})();
</script>
`;

// Avisa a la página padre justo antes de que el iframe se recargue (botón
// "Salir" / "Volver al inicio" → el juego recarga el iframe). Así el padre
// puede tapar el iframe y evitar el flash de "iconos enormes" (el HTML del
// juego recién cargado, antes de que inyecte su CSS de layout).
const RELOAD_COVER_PATCH = `<script>window.addEventListener('pagehide',function(){try{parent.postMessage({bfReloading:true},'*')}catch(e){}});</script>`;
// Empuja el botón "Contacta con los Bizarros" hacia abajo para dejar sitio
// al cartel de Actualidad (flash news) entre el menú y el botón de contacto.
const CONTACT_REPOSITION_PATCH = `<style>#s-title #bf-contact{margin-top:68px!important}</style>`;

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

  // Al volver de "Conocer las cartas" tras salir desde la demo: si el flag
  // sigue en sessionStorage, arrancamos la demo automáticamente cuando el
  // juego termine de cargar (bfScreen 's-title').
  useEffect(() => {
    try {
      if (sessionStorage.getItem('bfDemoReturn') === '1') {
        sessionStorage.removeItem('bfDemoReturn');
        autoDemoRef.current = true;
      }
    } catch (e) {}
    // También acepta ?demo=1 desde la URL (más fiable que sessionStorage:
    // lo usa el menú "Volver a la partida demo" de la guía de cartas).
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') {
        autoDemoRef.current = true;
        window.history.replaceState({}, '', '/');
      }
    } catch (e) {}
  }, []);

  const iframeRef = useRef(null);
  const loadTimerRef = useRef(null);
  const battleArtRef = useRef(null);
  const abilityAnimRef = useRef(null);
  const avatarListRef = useRef(null);
  const cardArtRef = useRef(null);
  const passiveMarkersRef = useRef(null);
  const avatarCatalogRef = useRef(null);
  const playerAvatarsRef = useRef(null);
  const nickCredsRef = useRef({});
  const aiWinsRef = useRef({});
  // Cuando la cinemática de intro se abrió desde "Aprender a jugar" (demo),
  // al cerrarla/saltarla arrancamos automáticamente la demo en el iframe.
  const introAutoDemoRef = useRef(false);
  // Reanudar la demo al volver de "Conocer las cartas": si el flag está en
  // sessionStorage, al cargar Home arrancamos la demo automáticamente.
  const autoDemoRef = useRef(false);
  const [blobUrl, setBlobUrl] = useState('');
  const [srcDoc, setSrcDoc] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbCount, setDbCount] = useState(107);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOracle, setShowOracle] = useState(true);
  // El modal de "Aprender a jugar" (demo) se abre sobre la portada: mientras
  // esté visible, ocultamos el cartel de flash news para que no tape el modal.
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  // Zoom de pellizco (móvil/tablet): el juego lo aplica dentro del iframe y nos
  // avía por postMessage para que el cartel de actualidad se amplíe igual.
  const pinchRafRef = useRef(null);
  const [pinch, setPinch] = useState({ z: 1, tx: 0, ty: 0 });
  const aiStrategyRef = useRef(null);
  const aiLevelStratRef = useRef(null);
  // Habilidades implementadas desde el editor (entidad AbilityImpl): el motor
  // genérico del juego las ejecuta en batalla.
  const abilitySpecsRef = useRef(null);
  // Control de subastas (backoffice /admin/subastas): qué héroes pueden salir.
  const auctionCfgRef = useRef(null);
  // Marcador general histórico entre parejas de nicks (entidad HeadToHead).
  const scoreDbRef = useRef(null);

  useEffect(() => {
    if (!base44.entities?.HeadToHead) return;
    base44.entities.HeadToHead.list('-updated_date', 1000).then(rows => {
      const map = {};
      (rows || []).forEach(r => {
        if (!r.pair_key || !r.nick) return;
        const pair = (map[r.pair_key] = map[r.pair_key] || {});
        pair[r.nick] = Math.max(pair[r.nick] || 0, r.wins || 0);
      });
      scoreDbRef.current = map;
      try { iframeRef.current?.contentWindow?.postMessage({ bfScoreDb: map }, '*'); } catch (e) {}
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!base44.entities?.AuctionConfig) return;
    base44.entities.AuctionConfig.list('-updated_date', 1).then(rows => {
      const cfg = rows && rows.length ? rows[0] : null;
      auctionCfgRef.current = cfg;
      try { iframeRef.current?.contentWindow?.postMessage({ bfAuctionConfig: cfg }, '*'); } catch (e) {}
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!base44.entities?.AbilityImpl) return;
    base44.entities.AbilityImpl.list('-updated_date', 500).then(list => {
      abilitySpecsRef.current = (list || []).map(s => ({ card_id: s.card_id, elite: !!s.elite, status: s.status, effect_type: s.effect_type, params: s.params || {}, ability_name: s.ability_name }));
      try { iframeRef.current?.contentWindow?.postMessage({ bfAbilitySpecs: abilitySpecsRef.current }, '*'); } catch (e) {}
    }).catch(() => {});
  }, []);

  useEffect(() => bindGameLobbyBridge(iframeRef), []);

  // Estrategia de la IA: analiza los logs de partidas guardados y genera
  // parámetros para que la IA juegue mejor. Se cachea 6 h en localStorage
  // para no llamar al LLM en cada carga. La estrategia se envía al iframe
  // para que el parche la aplique.
  useEffect(() => {
    const CACHE_KEY = 'bfAiStrategyCache';
    const TTL = 6 * 60 * 60 * 1000; // 6 horas
    let cancelled = false;

    const sendToStrat = (strat) => {
      try { iframeRef.current?.contentWindow?.postMessage({ bfAiStrategy: strat }, '*'); } catch (e) {}
    };

    // Estrategias APRENDIDAS por nivel de IA (gestión de aprendizaje del admin):
    // se cargan de la BD y se envían al iframe para que cada nivel juegue con
    // lo que ha aprendido de las partidas leídas.
    try {
      base44.entities.AiLevelStrategy.list('-updated_date', 20).then(list => {
        const m = {};
        (list || []).forEach(r => { if (r.level_id && r.strategy) m[r.level_id] = r.strategy; });
        aiLevelStratRef.current = m;
        try { iframeRef.current?.contentWindow?.postMessage({ bfAiLevelStrategies: m }, '*'); } catch (e) {}
      }).catch(() => {});
    } catch (e) {}

    const fetchAndCache = async () => {
      try {
        const res = await base44.functions.invoke('getAiStrategy', {});
        if (cancelled) return;
        const strat = res.data?.strategy;
        if (strat) {
          aiStrategyRef.current = strat;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ strat, ts: Date.now() })); } catch (e) {}
          sendToStrat(strat);
        }
      } catch (e) {}
    };

    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && cached.strat && (Date.now() - cached.ts < TTL)) {
        aiStrategyRef.current = cached.strat;
        sendToStrat(cached.strat);
      } else {
        fetchAndCache();
      }
    } catch (e) {
      fetchAndCache();
    }
  }, []);

  // Móvil: el juego se renderiza a ancho de escritorio (1200px) dentro del
  // iframe y se escala para caber en la pantalla. El zoom táctil (pellizcar)
  // lo gestiona el navegador sobre la página, habilitado en el viewport.
  // IMPORTANTE: se usa el ancho del VIEWPORT DE MAQUETACIÓN
  // (document.documentElement.clientWidth), no window.innerWidth: al pellizcar,
  // el navegador móvil reduce innerWidth y el juego se quedaba encogido y
  // descuadrado en una esquina. clientWidth no cambia con el zoom.
  // TABLET: el juego se pintaba casi a tamaño real (escala ~0.7-0.9), así que
  // la textura de la pantalla es enorme y cada animación de batalla obliga a la
  // GPU a repintarla → parpadeo. En el móvil no pasa porque la escala es ~0.3 y
  // el área pintada es pequeña. Se limita la escala del tablet al mismo
  // presupuesto de pintado del móvil (el jugador amplía con el pellizco, igual
  // que en móvil), y así el parpadeo desaparece.
  // TABLET: el juego se pintaba casi a tamaño real (escala ~0,7-1), así que la
  // textura de la pantalla es enorme y cada repintado (zoom de pellizco,
  // animaciones) obliga a la GPU a rehacerla → parpadeo. En móvil no ocurre
  // porque la escala es ~0,3 y el área pintada es pequeña. Se limita la escala
  // de la tablet al mismo presupuesto de pintado del móvil: el jugador amplía
  // con el pellizco, igual que en móvil.
  const MAX_SCALE = IS_TABLET ? 0.55 : 1;
  const layoutW = () => Math.max(320, document.documentElement.clientWidth || window.innerWidth);
  const layoutH = () => Math.max(320, document.documentElement.clientHeight || window.innerHeight);
  const [mobScale, setMobScale] = useState(() =>
    IS_MOBILE && typeof window !== 'undefined' ? Math.min(MAX_SCALE, layoutW() / 1200) : 1
  );

  useEffect(() => {
    if (!IS_MOBILE) return;
    const update = () => setMobScale(Math.min(MAX_SCALE, layoutW() / 1200));
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
        if (abilityAnimRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfAbilityAnim: abilityAnimRef.current }, '*');
        }
        if (avatarListRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfAvatarMap: avatarListRef.current }, '*');
        }
        if (avatarCatalogRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfAvatarCatalog: avatarCatalogRef.current }, '*');
        }
        if (playerAvatarsRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfPlayerAvatars: playerAvatarsRef.current }, '*');
        }
        if (nickCredsRef.current && Object.keys(nickCredsRef.current).length) {
          iframeRef.current?.contentWindow?.postMessage({ bfNickCreds: Object.keys(nickCredsRef.current) }, '*');
        }
        if (aiWinsRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfAiWins: aiWinsRef.current }, '*');
        }
        if (abilitySpecsRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfAbilitySpecs: abilitySpecsRef.current }, '*');
        }
        if (auctionCfgRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfAuctionConfig: auctionCfgRef.current }, '*');
        }
        if (scoreDbRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfScoreDb: scoreDbRef.current }, '*');
        }
        if (cardArtRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfCardArt: cardArtRef.current }, '*');
        }
        if (passiveMarkersRef.current) {
          iframeRef.current?.contentWindow?.postMessage({ bfPassiveMarkers: passiveMarkersRef.current }, '*');
        }
        // Reanudar la demo: el juego acaba de cargar y señaló su pantalla
        // inicial. Si volvíamos de "Conocer las cartas", arrancamos la demo.
        if (autoDemoRef.current && e.data.bfScreen === 's-title') {
          autoDemoRef.current = false;
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage({ bfStartDemo: true }, '*');
          }, 700);
        }
        // Reenvía la estrategia de la IA al iframe cuando este señala que está
        // listo, por si el primer envío llegó antes de que el patch estuviera instalado.
        if (aiStrategyRef.current) {
          try { iframeRef.current?.contentWindow?.postMessage({ bfAiStrategy: aiStrategyRef.current }, '*'); } catch (e) {}
        }
        if (aiLevelStratRef.current) {
          try { iframeRef.current?.contentWindow?.postMessage({ bfAiLevelStrategies: aiLevelStratRef.current }, '*'); } catch (e) {}
        }
      }
      if (e.data && e.data.bfReloading) {
        // El iframe se va a recargar (Salir / Volver al inicio): tapamos para
        // evitar el flash de iconos enormes antes de que el CSS del juego aplique.
        setLoading(true);
      }
      if (e.data && e.data.bfPinch) {
        // El juego amplió su contenido con el pellizco: refleja el mismo zoom
        // en el cartel de actualidad (throttle por rAF para no saturar).
        const p = e.data.bfPinch;
        if (pinchRafRef.current) cancelAnimationFrame(pinchRafRef.current);
        pinchRafRef.current = requestAnimationFrame(() => setPinch({ z: p.z, tx: p.tx, ty: p.ty }));
      }
      // Botón "Intro" de la portada del juego: abre la cinemática de intro.
      // Si viene con bfAutoDemo (desde "Aprender a jugar"), al cerrarla arranca
      // la demo automáticamente dentro del iframe.
      if (e.data && e.data.bfOpenIntro) {
        introAutoDemoRef.current = !!e.data.bfAutoDemo;
        setShowIntro(true);
      }
      if (e.data && typeof e.data.bfDemoModalOpen === 'boolean') {
        setDemoModalOpen(e.data.bfDemoModalOpen);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const navigate = useNavigate();

  // Guarda el resultado de cada partida y atiende la navegación pedida por el
  // botón "Top Ranking" del menú del juego.
  useEffect(() => {
    // Persiste en la BD las victorias del jugador contra cada nivel de IA,
    // asociadas a su nick (para subir de nivel entre dispositivos).
    const upsertAiWin = async (nick, levelId) => {
      if (!base44.entities || !base44.entities.PlayerAiProgress) return;
      try {
        const existing = await base44.entities.PlayerAiProgress.filter({ nick, level_id: levelId }, '-created_date', 1);
        if (existing && existing.length) {
          await base44.entities.PlayerAiProgress.update(existing[0].id, { wins: (existing[0].wins || 0) + 1 });
        } else {
          await base44.entities.PlayerAiProgress.create({ nick, level_id: levelId, wins: 1 });
        }
        const m = { ...(aiWinsRef.current || {}) };
        (m[nick] = m[nick] || {})[levelId] = ((m[nick] && m[nick][levelId]) || 0) + 1;
        aiWinsRef.current = m;
        try { iframeRef.current?.contentWindow?.postMessage({ bfAiWins: m }, '*'); } catch (e) {}
      } catch (e) {}
    };
    // Hash SHA-256 de la contraseña (no se guarda en claro en la BD).
    const sha256Hex = async (text) => {
      try {
        const buf = new TextEncoder().encode(String(text || ''));
        const hash = await crypto.subtle.digest('SHA-256', buf);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) { return String(text || ''); }
    };
    const onResult = (e) => {
      if (e.data && e.data.bfCheckNick) {
        // El iframe pide verificar/crear la contraseña de un nick.
        const { nick, password, requestId } = e.data.bfCheckNick;
        const key = String(nick || '').toLowerCase();
        const respond = (payload) => {
          try { iframeRef.current?.contentWindow?.postMessage({ bfNickCredentialResult: { ...payload, requestId } }, '*'); } catch (e2) {}
        };
        (async () => {
          if (!base44.entities?.NickCredential) { respond({ ok: false, error: 'db_error' }); return; }
          const existing = nickCredsRef.current[key];
          if (existing && existing.password) {
            // El nick ya está protegido: verificar la contraseña.
            const hash = await sha256Hex(password);
            if (hash === existing.password) { respond({ ok: true, mode: 'verified' }); }
            else { respond({ ok: false, error: 'wrong_password' }); }
            return;
          }
          // Nick nuevo o sin proteger aún: crear la contraseña.
          if (!password || String(password).length < 3) { respond({ ok: false, error: 'too_short' }); return; }
          if (!nick || !String(nick).trim()) { respond({ ok: false, error: 'empty' }); return; }
          const hash = await sha256Hex(password);
          try {
            if (existing) {
              await base44.entities.NickCredential.update(existing.id, { password: hash });
            } else {
              const rec = await base44.entities.NickCredential.create({ nick: key, password: hash });
              nickCredsRef.current[key] = rec;
            }
            respond({ ok: true, mode: 'set' });
          } catch (e2) { respond({ ok: false, error: 'db_error' }); }
        })();
      }
      if (e.data && e.data.bfMatchResult) {
        const r = e.data.bfMatchResult;
        base44.entities.MatchResult.create(r).catch(() => {});
        // Asocia el avatar al nick en la BD (PlayerAvatar) para que el ranking
        // lo muestre siempre, independientemente del dispositivo o partida.
        if (r.winner_avatar) base44.entities.PlayerAvatar.create({ nick: r.winner_nick, avatar_url: r.winner_avatar }).catch(() => {});
        if (r.loser_avatar) base44.entities.PlayerAvatar.create({ nick: r.loser_nick, avatar_url: r.loser_avatar }).catch(() => {});
        if (r.mode === 'ia' && !r.winner_is_ai && r.ai_level && r.winner_nick) upsertAiWin(r.winner_nick, r.ai_level);
      }

      // Marcador general: guarda la victoria en la BD asociada a la pareja de
      // nicks para que nunca se resetee al volver con el mismo nick.
      if (e.data && e.data.bfScoreWin && base44.entities?.HeadToHead) {
        const { pair_key, nick, wins } = e.data.bfScoreWin;
        base44.entities.HeadToHead.filter({ pair_key, nick }, '-created_date', 1).then(rows => {
          // Los dos jugadores guardan la misma victoria: se queda el valor más
          // alto para que ninguno de los dos dispositivos pise al otro.
          if (rows && rows.length) {
            const best = Math.max(rows[0].wins || 0, wins);
            return best === (rows[0].wins || 0) ? null : base44.entities.HeadToHead.update(rows[0].id, { wins: best });
          }
          return base44.entities.HeadToHead.create({ pair_key, nick, wins });
        }).then(() => {
          const m = { ...(scoreDbRef.current || {}) };
          const pair = { ...(m[pair_key] || {}) };
          pair[nick] = Math.max(pair[nick] || 0, wins);
          m[pair_key] = pair;
          scoreDbRef.current = m;
        }).catch(() => {});
      }

      if (e.data && e.data.bfGameLog) {
        base44.entities.GameLog.create(e.data.bfGameLog).catch(() => {});
      }
      if (e.data && typeof e.data.bfNavigate === 'string') {
        // Si venimos de la partida demo (botón "Conocer las cartas"), marcamos
        // que al volver a Home hay que reanudar la demo automáticamente.
        if (e.data.fromDemo) { try { sessionStorage.setItem('bfDemoReturn', '1'); } catch (e) {} }
        navigate(e.data.bfNavigate);
      }
      if (e.data && e.data.bfSaveAvatar) {
        const { nick, avatar_url } = e.data.bfSaveAvatar;
        if (nick && avatar_url && base44.entities?.PlayerAvatar) {
          base44.entities.PlayerAvatar.filter({ nick }, '-created_date', 1).then(existing => {
            if (existing && existing.length) {
              base44.entities.PlayerAvatar.update(existing[0].id, { avatar_url }).catch(() => {});
            } else {
              base44.entities.PlayerAvatar.create({ nick, avatar_url }).catch(() => {});
            }
          }).catch(() => {});
          // Actualiza el caché en memoria para que el auto-relleno funcione al instante.
          const m = { ...(playerAvatarsRef.current || {}) };
          m[nick] = avatar_url;
          playerAvatarsRef.current = m;
        }
      }
      if (e.data && typeof e.data.bfSetLang === 'string') setLang(e.data.bfSetLang);
      // El juego pide el arte de hechizos/objetos para la carta revelada al
      // jugarse: se responde con un mapa nombre → imagen desde la base de datos.
      // Con el idioma en inglés se añade además un diccionario texto ES → EN de
      // todas las cartas para que el parche de traducción lo aplique en vivo.
      if (e.data && e.data.bfArtMapRequest) {
        base44.entities.Card.list('number', 300).then(cards => {
          const isEn = getLang() === 'en';
          const ITEM_CATS = ['spell', 'object', 'ranged_weapon', 'melee_weapon', 'armor'];
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
            if (isItem) {
              info[c.name] = {
                text,
                mana: c.mana != null ? c.mana : null,
                category: c.category,
                number: c.number,
                cost: c.cost,
                cc: c.cc, ad: c.ad, he: c.he, hp: c.hp, power: c.power,
                ability: c.ability_name,
              };
            }
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
    base44.entities.Card.list('number', 300).then(cards => {
      const map = {};
      (cards || []).forEach(c => {
        if (c.card_id && c.battle_art_url) {
          map[c.card_id] = { base: c.battle_art_url, elite: c.elite_battle_art_url || c.battle_art_url };
        }
      });
      battleArtRef.current = map;
      const anim = {};
      (cards || []).forEach(c => {
        if (c.card_id && (c.ability_anim_url || c.elite_ability_anim_url)) {
          anim[c.card_id] = { base: c.ability_anim_url, elite: c.elite_ability_anim_url || c.ability_anim_url, desc: c.ability_anim_desc, eliteDesc: c.elite_ability_anim_desc, motion: c.ability_anim_motion, eliteMotion: c.elite_ability_anim_motion || c.ability_anim_motion, name: c.name, text: c.ability_text || c.description || '', eliteText: c.elite_ability_text || c.ability_text || c.description || '', textEn: (c.en && (c.en.ability_text || c.en.description)) || c.ability_text || c.description || '', eliteTextEn: (c.en && (c.en.elite_ability_text || c.en.ability_text || c.en.description)) || c.elite_ability_text || c.ability_text || c.description || '' };
        }
      });
      abilityAnimRef.current = anim;
      // Lista de avatares de héroes (art_url) para el selector de avatar del
      // jugador junto al nick.
      const avatars = [];
      (cards || []).forEach(c => {
        if (c.category === 'hero' && c.art_url) {
          avatars.push({ id: c.card_id || String(c.number), name: c.name, url: c.art_url, clan: c.clan || '' });
        }
      });
      avatarListRef.current = avatars;
      // Arte de carta por card_id y por nombre (héroes, bizarros y tokens como
      // la Grulla) para la franja de vencedores/caídos del final de partida.
      const cardArt = {};
      (cards || []).forEach(c => {
        if (!c.art_url || !['hero', 'bizarro'].includes(c.category)) return;
        const entry = { base: c.art_url, elite: c.elite_art_url || c.art_url };
        if (c.card_id) cardArt[c.card_id] = entry;
        if (c.name) cardArt[c.name] = entry;
      });
      cardArtRef.current = cardArt;
      // Marcadores de habilidades pasivas configurados desde el editor
      const passiveMarkers = {};
      (cards || []).forEach(c => {
        if (c.card_id && c.passive_marker && c.passive_marker.flag) {
          passiveMarkers[c.card_id] = c.passive_marker;
        }
      });
      passiveMarkersRef.current = passiveMarkers;
      try { iframeRef.current?.contentWindow?.postMessage({ bfCardArt: cardArt }, '*'); } catch (e) {}
      try { iframeRef.current?.contentWindow?.postMessage({ bfPassiveMarkers: passiveMarkers }, '*'); } catch (e) {}
      // Catálogo de avatares generados por IA para el selector del jugador.
      base44.entities.AvatarCatalog.list('name', 300).then(cat => {
        avatarCatalogRef.current = (cat || []).map(a => ({ name: a.name, url: a.url }));
        try { iframeRef.current?.contentWindow?.postMessage({ bfAvatarCatalog: avatarCatalogRef.current }, '*'); } catch (e) {}
      }).catch(() => {});
      // Avatares asociados a nicks (PlayerAvatar): el más reciente por nick,
      // para que el selector auto-muestre el avatar al escribir el nick.
      base44.entities.PlayerAvatar.list('-created_date', 500).then(pas => {
        const m = {};
        (pas || []).forEach(a => { if (a.nick && a.avatar_url && !m[a.nick]) m[a.nick] = a.avatar_url; });
        playerAvatarsRef.current = m;
        try { iframeRef.current?.contentWindow?.postMessage({ bfPlayerAvatars: m }, '*'); } catch (e) {}
      }).catch(() => {});
      // Credenciales de nick (NickCredential): nicks que ya tienen contraseña
      // guardada. Se envían al iframe para que el campo muestre "escribir" vs
      // "crear" y para que la verificación se haga contra la BD.
      if (base44.entities?.NickCredential) {
        base44.entities.NickCredential.list('nick', 1000).then(rows => {
          const m = {};
          (rows || []).forEach(r => { if (r.nick) m[String(r.nick).toLowerCase()] = r; });
          nickCredsRef.current = m;
          try { iframeRef.current?.contentWindow?.postMessage({ bfNickCreds: Object.keys(m) }, '*'); } catch (e) {}
        }).catch(() => {});
      }
      // Progreso de niveles de IA por nick (BD): victorias contra cada nivel,
      // para que los desbloqueos funcionen entre dispositivos.
      try {
        if (base44.entities.PlayerAiProgress) {
          base44.entities.PlayerAiProgress.list('nick', 500).then(progs => {
            const m = {};
            (progs || []).forEach(p => { if (p.nick && p.level_id) { (m[p.nick] = m[p.nick] || {})[p.level_id] = p.wins || 0; } });
            aiWinsRef.current = m;
            try { iframeRef.current?.contentWindow?.postMessage({ bfAiWins: m }, '*'); } catch (e) {}
          }).catch(() => {});
        }
      } catch (e) {}
      // Envía los mapas al iframe inmediatamente tras cargar los datos de la
      // BD, sin esperar al siguiente cambio de pantalla del juego. Así los
      // héroes que usen su habilidad justo al empezar la batalla ya tienen
      // el mapa de animaciones 3D disponible (evita que se pierdan las nuevas).
      try {
        const iw = iframeRef.current?.contentWindow;
        if (iw) {
          if (battleArtRef.current) iw.postMessage({ bfBattleArt: battleArtRef.current }, '*');
          if (abilityAnimRef.current) iw.postMessage({ bfAbilityAnim: abilityAnimRef.current }, '*');
          if (avatarListRef.current) iw.postMessage({ bfAvatarMap: avatarListRef.current }, '*');
          if (avatarCatalogRef.current) iw.postMessage({ bfAvatarCatalog: avatarCatalogRef.current }, '*');
          if (playerAvatarsRef.current) iw.postMessage({ bfPlayerAvatars: playerAvatarsRef.current }, '*');
          if (nickCredsRef.current && Object.keys(nickCredsRef.current).length) iw.postMessage({ bfNickCreds: Object.keys(nickCredsRef.current) }, '*');
          if (passiveMarkersRef.current) iw.postMessage({ bfPassiveMarkers: passiveMarkersRef.current }, '*');
        }
      } catch (e) {}
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

        const textList = await base44.entities.HomeText.list('key', 50).catch(() => []);
        const homeTexts = { punkitoEs: '', punkitoEn: '', contactLabel: '', contactLabelEn: '', contactBody: '', contactBodyEn: '' };
        (textList || []).forEach((t) => {
          if (t.key === 'punkito') { homeTexts.punkitoEs = t.value || ''; homeTexts.punkitoEn = t.value_en || ''; }
          if (t.key === 'contact_label') { homeTexts.contactLabel = t.value || ''; homeTexts.contactLabelEn = t.value_en || ''; }
          if (t.key === 'contact_body') { homeTexts.contactBody = t.value || ''; homeTexts.contactBodyEn = t.value_en || ''; }
        });

        // The game HTML is ~480KB. Injecting it through srcDoc (a giant HTML
        // attribute) hangs on production/mobile. A Blob URL loads large HTML
        // reliably across browsers and devices.
        const INJECT = PERF_BOOST_PATCH + CONTACT_REPOSITION_PATCH + DRAGGABLE_GUIDE_PATCH + RELOAD_COVER_PATCH + MATCH_MODE_PATCH + COACH_PUNKITO_PATCH + NARRATOR_ACTION_PATCH + BATTLE_UI_PATCH + BATTLE_PORTRAIT_PATCH + FX_ROOT_PATCH + SPELL_FX_PATCH + ATTACK_FX_PATCH + SHIELD_FX_PATCH + HEAL_NUMBER_PATCH + DAMAGE_NUMBER_PATCH + STAT_NUMBER_PATCH + CARD_ART_MAP_PATCH + MP_FX_SYNC_PATCH + MP_EQUIP_PATCH + AUCTION_NODUP_PATCH + AI_AUCTION_PATCH + HAND_UNDER_ACTION_PATCH + LOBBY_GUARD_PATCH + EQUIP_DRAG_PATCH + RIVAL_HAND_BACK_PATCH + SHOP_SPELL_ART_PATCH + CARD_MAGNIFIER_PATCH + HAND_DIRECT_PLAY_PATCH + DISCARD_PILE_PATCH + buildNetResilientPatch(turnIceServers) + CENTRAL_LOBBY_PATCH + NET_RECONNECT_PATCH + FINAL_CINEMATIC_PATCH + STATUS_AURA_PATCH + HERO_NAME_SIGIL_PATCH + BATTLE_ANIME_PATCH + HERO_BLOOD_FX_PATCH + MATCH_RESULT_PATCH + MATCH_SCORE_PATCH + RANKING_BUTTON_PATCH + RULES_BUTTON_PATCH + HOME_MENU_PATCH + ABILITY_FX_PATCH + EPIC_ABILITY_FX_PATCH + RAINBOW_BORDER_PATCH + ACTION_FOCUS_PATCH + OBJECT_FX_PATCH + HAND_PICK_HIGHLIGHT_PATCH + CARD_PLAY_REVEAL_PATCH + GUIDE_HELP_BADGE_PATCH + SPECIAL_CARD_CINEMATIC_PATCH + MATCH_RECOVERY_PATCH + BATTLE_RULES_PATCH + NICK_MEMORY_PATCH + NICK_PASSWORD_PATCH + NICK_REQUIRED_PATCH + buildQuitContactPatch(homeTexts) + HOW_TO_PLAY_PATCH + buildHomeTextsPatch(homeTexts) + AUCTION_THUMB_PATCH + AUCTION_CONTROL_PATCH + NARBON_ELITE_PATCH + TOKEN_ABILITIES_PATCH + CRANE_SUMMON_PATCH + DAIDOJI_BLADE_PATCH + ABILITY_IMPL_PATCH + NIXARA_ABILITY_PATCH + JUNIANA_ABILITY_PATCH + FAITHFUL_ABILITIES_PATCH + ABILITY_ANIM_PATCH + PASSIVE_MARKER_PATCH + TABLE_MAT_PATCH + EQ_HERO_SCENE_BG_PATCH + BATTLE_SCENE_BG_PATCH + TURN_UNSTICK_PATCH + AI_WAIT_CINE_PATCH + KILL_ACTOR_PATCH + FINAL_ACTION_RECAP_PATCH + MP_ABILITY_CINE_PATCH + CINE_TOGGLE_PATCH + BIZARRE_ROOM_PATCH + BIZARRE_RETURN_PATCH + DEMO_FLOW_PATCH + buildLangEnPatch(getLang()) + DEMO_TIPS_PATCH + MODE_ICON_PATCH + buildLangSelectorPatch(getLang()) + RECOVER_SPELL_PATCH + CHAT_STATUS_PATCH + GAME_LOG_PATCH + BATTLE_LOG_ORDER_PATCH + SPEED_GAUGE_PATCH + TYPE_MEDAL_PATCH + ACTION_PANEL_STABLE_PATCH + AI_LEVEL_PATCH + AI_STRATEGY_PATCH + AVATAR_PATCH + END_GAME_FIX_PATCH + END_HEROES_PATCH + REMATCH_PATCH + VS_TEXT_PATCH + WHITE_FLASH_FIX_PATCH + CARD_REVEAL_LOCK_PATCH + ABILITY_USED_MEMORY_PATCH + buildFumbleRollPatch(getLang()) + (IS_MOBILE ? MOBILE_PINCH_PATCH + PINCH_FREEZE_PATCH + PINCH_ANIM_FREEZE_PATCH + NO_FLICKER_PATCH + MOBILE_ANTIFLICKER_PATCH + BATTLE_FOCUS_ZOOM_PATCH + MODAL_FOCUS_PATCH : '');
        // Portada: "EDICIÓN V5" → "Base Set".
        let baseData = data.replace(/EDICI[ÓO]N&nbsp;V5/g, 'Base Set').replace(/Doc Radiante/g, 'Clint Tripud').replace(/Krunder(?![kK]| Mec)/g, 'Xabierus').replace(/Despertar/g, 'Sanar').replace(/despertar/g, 'sanar');
        // Botón "Hechizo" del panel de acciones: en vez del multiplicador de HE,
        // muestra el maná que le queda al héroe para lanzar hechizos.
        baseData = baseData.split("hasSpell?('×'+(stat(h,'he')/HE_REF).toFixed(1)):'—'").join("h.maxMana>0?('🔵 '+h.mana):'—'");
        let patchedData = baseData.includes('</body>')
          ? baseData.replace('</body>', INJECT + '</body>')
          : baseData + INJECT;
        // CSS crítico en el <head>: se aplica en el primer pintado y evita ver
        // la portada a medio estilar (emojis + imágenes gigantes) mientras el
        // navegador termina de leer los 566 KB del documento.
        if (patchedData.includes('</head>')) {
          patchedData = patchedData.replace('</head>', CRITICAL_HEAD_CSS + '</head>');
        }
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

  const iframeH = IS_MOBILE ? Math.ceil((typeof window !== 'undefined' ? layoutH() : 800) / mobScale) : 800;

  return (
    <div className="fixed inset-0 bg-[#0e0a16]">
      {!IS_MOBILE && showOracle && !demoModalOpen && <FlashNewsMarquee mobScale={1} isMobile={false} pinchZ={pinch.z} pinchTx={pinch.tx} pinchTy={pinch.ty} />}
      {showIntro && <IntroCinematic onClose={() => {
        setShowIntro(false);
        if (introAutoDemoRef.current) {
          introAutoDemoRef.current = false;
          iframeRef.current?.contentWindow?.postMessage({ bfStartDemo: true }, '*');
        }
      }} />}
      <div
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
        style={{ opacity: loading ? 1 : 0, transition: loading ? 'none' : 'opacity 300ms ease-out', background: '#0e0a16' }}
      >
        <div className="w-9 h-9 border-4 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin" />
      </div>
      {/* Oráculo Bizarro — acceso al catálogo, solo en la portada inicial (escritorio) */}
      {!IS_MOBILE && showOracle && (
        <Link to="/cards" className="absolute bottom-5 right-4 z-20 flex items-center gap-2 group" style={{ filter: 'drop-shadow(0 0 14px rgba(192,91,255,0.55))', transform: `scale(${pinch.z})`, transformOrigin: 'bottom right' }}>
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#c06bff] shadow-[0_0_22px_rgba(192,91,255,0.55)] transition-transform group-hover:scale-110">
            <img src={ORACLE_IMG} alt="Oráculo" className="w-full h-full object-cover" />
          </div>
          <div className="bg-[#120a1e] border border-[#c06bff]/60 rounded-xl px-3 py-1.5 backdrop-blur-sm shadow-lg">
            <div className="font-heading font-black text-[13px] text-[#e2b0ff] leading-none tracking-wide">{t('Oráculo Bizarro')}</div>
            <div className="text-[9px] text-[#b06cff] mt-0.5 font-bold tracking-wider">{dbCount} {t('cartas · Base Set')}</div>
          </div>
        </Link>
      )}
      {!IS_MOBILE && showOracle && <HomeSecondaryLinks style={{ bottom: 88, right: 16 }} />}
      {/* Móvil/tablet: el Oráculo y el cartel de Actualidad viven DENTRO de un
        contenedor que replica exactamente el transform del iframe (escala móvil
        + pellizco con desplazamiento), así que zoom y pellizco les afectan
        igual que al resto del juego (icono de contactar, menús…). */}
      {IS_MOBILE && showOracle && (
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: iframeH, transform: `scale(${mobScale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: iframeH, transform: `translate(${pinch.tx}px, ${pinch.ty}px) scale(${pinch.z})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
              <Link to="/cards" className="absolute flex items-center gap-2 group pointer-events-auto" style={{ bottom: 20, right: 16, filter: 'drop-shadow(0 0 14px rgba(192,91,255,0.55))', textDecoration: 'none' }}>
                <div className="relative rounded-full overflow-hidden border-2 border-[#c06bff] shadow-[0_0_22px_rgba(192,91,255,0.55)] transition-transform group-hover:scale-110" style={{ width: 48, height: 48 }}>
                  <img src={ORACLE_IMG} alt="Oráculo" className="w-full h-full object-cover" />
                </div>
                <div className="bg-[#120a1e] border border-[#c06bff]/60 rounded-xl px-3 py-1.5 backdrop-blur-sm shadow-lg">
                  <div className="font-heading font-black text-[13px] text-[#e2b0ff] leading-none tracking-wide">{t('Oráculo Bizarro')}</div>
                  <div className="text-[9px] text-[#b06cff] mt-0.5 font-bold tracking-wider">{dbCount} {t('cartas · Base Set')}</div>
                </div>
              </Link>
              <HomeSecondaryLinks style={{ bottom: 82, right: 16 }} />
              {!demoModalOpen && <FlashNewsMarquee inGameSpace mobScale={1} isMobile pinchZ={pinch.z} pinchTx={pinch.tx} pinchTy={pinch.ty} />}
            </div>
          </div>
        </div>
      )}

      {/* Móvil/tablet: la escala del juego se aplica en un CONTENEDOR aparte,
        nunca en el propio iframe. Con el transform en el iframe, cualquier
        repintado interno (animaciones de batalla) obliga al navegador a
        re-rasterizar el documento entero a escala fraccionaria — en tablet
        (escala ~0,7) eso es una textura enorme y se ve como parpadeo. Con el
        transform en el contenedor promovido a capa (will-change), el iframe se
        rasteriza a su tamaño real y el compositor solo reescala esa textura. */}
      {(blobUrl || srcDoc) && IS_MOBILE ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: iframeH,
            transform: `scale(${mobScale})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            ref={iframeRef}
            title="Bizarre Fantasies v5"
            {...(srcDoc ? { srcDoc } : { src: blobUrl })}
            onLoad={() => {
              if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
              loadTimerRef.current = setTimeout(() => setLoading(false), 3500);
            }}
            className="border-0"
            style={{ width: 1200, height: iframeH, display: 'block' }}
            allow="autoplay; fullscreen; clipboard-read; clipboard-write"
          />
        </div>
      ) : null}
      {(blobUrl || srcDoc) && !IS_MOBILE && (
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
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; clipboard-read; clipboard-write"
        />
      )}
      <ChatOverlay mobScale={IS_MOBILE ? mobScale : 1} pinchZ={pinch.z} />
    </div>
  );
}