import React from 'react';
import { Link } from 'react-router-dom';
import HomeSecondaryLinks from '@/components/home/HomeSecondaryLinks';
import FlashNewsMarquee from '@/components/home/FlashNewsMarquee';
import { t } from '@/lib/i18n';

const ORACLE_IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab6da3724_generated_image.png';

// Móvil/tablet: el Oráculo, Reglas, Razas y el cartel de Actualidad viven en el
// MISMO espacio de coordenadas que el juego (1200 px de ancho), de modo que se
// comportan igual que los botones "Comenzar"/"Aprende a jugar" del juego:
// quedan fijos en su sitio y crecen en proporción al hacer zoom con el pellizco.
//
// Durante el gesto se usa `transform: scale` (idéntico al del iframe, así se
// mueven perfectamente sincronizados con el juego) y, al soltar los dedos, se
// cambia a `zoom` para que el navegador los REDIBUJE nítidos en vez de dejar
// una textura ampliada y borrosa. El tamaño y la posición en pantalla son los
// mismos con las dos técnicas, por lo que el cambio es invisible.
export default function GameSpaceOverlay({ width, height, mobScale, pinch, settled, dbCount, demoModalOpen }) {
  const z = pinch.z || 1;
  const base = { position: 'absolute', top: 0, left: 0, width, height, transformOrigin: 'top left', pointerEvents: 'none' };
  const zoomStyle = settled
    ? { ...base, zoom: mobScale * z, transform: `translate(${pinch.tx / z}px, ${pinch.ty / z}px)` }
    : { ...base, transform: `scale(${mobScale}) translate(${pinch.tx}px, ${pinch.ty}px) scale(${z})` };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none" style={{ overflow: 'hidden' }}>
      <div style={zoomStyle}>
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
        {!demoModalOpen && <FlashNewsMarquee inGameSpace mobScale={1} isMobile pinchZ={z} />}
      </div>
    </div>
  );
}