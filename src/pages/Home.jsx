import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MATCH_MODE_PATCH } from '@/lib/matchModePatch';

const ORACLE_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab6da3724_generated_image.png';
const EXPECTED_PATCH_VERSION = 'bf-2026-06-30-races-v136';
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
      var defY = Math.round(window.innerHeight * 0.42);
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
  bidStyle.textContent = '.hcard-bid-zone>div:first-child{align-items:center!important;flex-wrap:wrap!important}.bf-mobile-bid-stepper{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;border:1.5px solid rgba(255,210,74,.7);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600;font-size:24px;font-weight:1000;line-height:1;box-shadow:0 3px 10px rgba(0,0,0,.4);padding:0;flex:0 0 38px;cursor:pointer;user-select:none}.bf-mobile-bid-stepper:active{transform:scale(.92)}.bid-mini-input{min-width:54px!important;text-align:center!important}';
  document.head.appendChild(bidStyle);
  patchMobileBidSteppers();
  new MutationObserver(patchMobileBidSteppers).observe(document.documentElement, { childList:true, subtree:true });
})();
</script>
`;

const IS_MOBILE = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

export default function Home() {
  const iframeRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState('');
  const [srcDoc, setSrcDoc] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbCount, setDbCount] = useState(107);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.entities.Card.list('number', 200).then(cards => {
      if (cards?.length) setDbCount(cards.length);
    });
    base44.auth.me().then(user => setIsAdmin(user?.role === 'admin')).catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    let createdUrl = '';

    const loadGame = async (attempt = 1) => {
      try {
        if (cancelled) return;
        setError(false);
        setLoading(true);

        const res = await base44.functions.invoke('gameHtml', {
          version: EXPECTED_PATCH_VERSION,
          t: Date.now(),
          r: Math.random().toString(36).slice(2),
          attempt,
        });

        if (cancelled) return;
        const data = typeof res.data === 'string' ? res.data : String(res.data);
        if (!data || data.length < 1000) throw new Error('empty');

        // The game HTML is ~480KB. Injecting it through srcDoc (a giant HTML
        // attribute) hangs on production/mobile. A Blob URL loads large HTML
        // reliably across browsers and devices.
        const INJECT = DRAGGABLE_GUIDE_PATCH + MATCH_MODE_PATCH;
        let patchedData = data.includes('</body>')
          ? data.replace('</body>', INJECT + '</body>')
          : data + INJECT;
        if (IS_MOBILE) {
          // En móvil queremos la MISMA vista que en ordenador: fijamos un ancho
          // de escritorio y permitimos zoom/scroll con los dedos, en vez de la
          // versión responsive estrecha. Sustituimos el meta viewport del juego.
          patchedData = patchedData.replace(
            /<meta\s+name=["']viewport["'][^>]*>/i,
            '<meta name="viewport" content="width=1200, user-scalable=yes, initial-scale=0.3, minimum-scale=0.1, maximum-scale=3">'
          );
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
        setLoading(false);
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
        No se pudo cargar el juego. Recarga la página para intentarlo de nuevo.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0e0a16]">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0e0a16] pointer-events-none">
          <div className="w-9 h-9 border-4 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin" />
        </div>
      )}
      {/* Oráculo Bizarro — acceso al catálogo */}
      <Link to="/cards" className="absolute bottom-5 right-4 z-20 flex items-center gap-2 group" style={{ filter: 'drop-shadow(0 0 14px rgba(192,91,255,0.55))' }}>
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#c06bff] shadow-[0_0_22px_rgba(192,91,255,0.55)] transition-transform group-hover:scale-110">
          <img src={ORACLE_IMG} alt="Oráculo" className="w-full h-full object-cover" />
        </div>
        <div className="bg-[#120a1e] border border-[#c06bff]/60 rounded-xl px-3 py-1.5 backdrop-blur-sm shadow-lg">
          <div className="font-heading font-black text-[13px] text-[#e2b0ff] leading-none tracking-wide">Oráculo Bizarro</div>
          <div className="text-[9px] text-[#b06cff] mt-0.5 font-bold tracking-wider">{dbCount} cartas · Base Set</div>
        </div>
      </Link>

      {(blobUrl || srcDoc) && (
        <iframe
          ref={iframeRef}
          title="Bizarre Fantasies v5"
          {...(srcDoc ? { srcDoc } : { src: blobUrl })}
          onLoad={() => setLoading(false)}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; clipboard-read; clipboard-write"
        />
      )}
    </div>
  );
}