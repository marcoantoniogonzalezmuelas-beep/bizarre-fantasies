import React, { useState, useLayoutEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Carta anotada: renderiza una carta (children) dentro de un contenedor y
// superpone un pin señalizado sobre cada marcador real de la carta. Las
// posiciones se MIDEN del DOM (atributo data-bf-marker="<key>") en vez de
// usar porcentajes fijos, así cada pin coincide exactamente con su marcador
// (coste de oro, HP, CC, AD, HE, maná, habilidad…). Al pasar el ratón o tocar
// un pin o un elemento de la lista, se resalta la zona y aparece su etiqueta.
//
// parts: [{ k, i, n, d, c, note? }]  — k coincide con data-bf-marker; si un
// part no tiene marcador en la carta (p.ej. maná en un héroe) se muestra solo
// su nota al activarlo.
export default function AnnotatedCard({ parts, children, width, height, hint, aboveCard }) {
  const wrapRef = useRef(null);
  const [rects, setRects] = useState({});
  const [active, setActive] = useState(null);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wr = wrap.getBoundingClientRect();
    const next = {};
    parts.forEach(p => {
      const el = wrap.querySelector(`[data-bf-marker="${p.k}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      next[p.k] = {
        x: r.left - wr.left,
        y: r.top - wr.top,
        w: r.width,
        h: r.height,
        cx: r.left - wr.left + r.width / 2,
        cy: r.top - wr.top + r.height / 2,
      };
    });
    setRects(next);
  }, [parts]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (wrapRef.current) ro.observe(wrapRef.current);
    const t1 = setTimeout(measure, 350);
    const t2 = setTimeout(measure, 1000);
    return () => { ro.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  }, [measure]);

  const activePart = parts.find(p => p.k === active);
  const hover = (k) => setActive(k);
  const leave = (k) => setActive(a => (a === k ? null : a));

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="flex flex-col items-center">
        {aboveCard}
        <div ref={wrapRef} className="relative" style={{ width, height }}>
          {children}

          {parts.map(p => {
            const rc = rects[p.k];
            if (!rc) return null;
            const isActive = active === p.k;
            const labelAbove = rc.cy > height * 0.2;
            return (
              <div key={p.k}>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.16 }}
                    className="absolute rounded-lg pointer-events-none z-30"
                    style={{
                      top: rc.y - 3, left: rc.x - 3, width: rc.w + 6, height: rc.h + 6,
                      border: `2.5px solid ${p.c}`,
                      boxShadow: `0 0 18px 3px ${p.c}cc, inset 0 0 14px ${p.c}44`,
                      background: `${p.c}12`,
                    }}
                  />
                )}
                <button
                  type="button"
                  onMouseEnter={() => hover(p.k)}
                  onMouseLeave={() => leave(p.k)}
                  onClick={() => setActive(a => (a === p.k ? null : p.k))}
                  onFocus={() => hover(p.k)}
                  onBlur={() => leave(p.k)}
                  aria-label={p.n}
                  className="absolute z-30 rounded-full flex items-center justify-center"
                  style={{
                    top: rc.cy - 12, left: rc.cx - 12, width: 24, height: 24,
                    background: p.c, color: '#140a00', border: '2px solid #08050f',
                    boxShadow: `0 0 10px ${p.c}dd`, fontSize: 12, lineHeight: 1,
                    transform: isActive ? 'scale(1.2)' : 'scale(1)', transition: 'transform .15s', cursor: 'pointer',
                  }}
                >
                  {p.i}
                </button>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute z-40 -translate-x-1/2 rounded-full px-2.5 py-1 text-[11px] font-black text-center"
                      style={{
                        top: labelAbove ? rc.cy - 42 : rc.cy + 16, left: rc.cx,
                        background: p.c, color: '#140a00', textShadow: 'none',
                        boxShadow: '0 6px 16px rgba(0,0,0,.65)', whiteSpace: 'nowrap',
                      }}
                    >
                      {p.n}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Nota para marcadores que no están en esta carta (maná en héroe, etc.) */}
          <AnimatePresence>
            {activePart && activePart.note && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.16 }}
                className="absolute z-40 left-1/2 w-[220px] rounded-xl px-3 py-2 text-[11px] font-bold text-center text-[#efe9dc]"
                style={{ bottom: -10, transform: 'translateX(-50%) translateY(100%)', background: '#0b0712ee', border: `1.5px solid ${activePart.c}99` }}
              >
                {activePart.note}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {hint && <p className="mt-4 text-center text-[11px] text-[#a89fbb]">{hint}</p>}
      </div>

      {/* Lista anotada */}
      <div className="grid sm:grid-cols-2 gap-2.5">
        {parts.map(p => {
          const isActive = active === p.k;
          return (
            <div
              key={p.k}
              onMouseEnter={() => hover(p.k)}
              onMouseLeave={() => leave(p.k)}
              onClick={() => setActive(a => (a === p.k ? null : p.k))}
              className="flex items-start gap-2.5 rounded-xl bg-black/40 border px-3 py-2.5 cursor-pointer transition-colors"
              style={{ borderColor: isActive ? p.c : '#3c315866', boxShadow: isActive ? `0 0 14px ${p.c}55` : 'none' }}
            >
              <span
                className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-[14px]"
                style={{ background: `${p.c}22`, border: `1.5px solid ${p.c}`, color: p.c, transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform .15s' }}
              >
                {p.i}
              </span>
              <div>
                <div className="font-heading font-bold text-[13px] text-[#ffe9a8] leading-tight">{p.n}</div>
                <div className="text-[12px] text-[#d8d0e4] leading-snug">{p.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}