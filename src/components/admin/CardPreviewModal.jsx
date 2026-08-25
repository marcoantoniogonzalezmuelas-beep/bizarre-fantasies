import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import HeroCardFace from '@/components/cards/HeroCardFace';
import EquipCard from '@/components/cards/EquipCard';

const EQUIP_TYPE_BY_CATEGORY = {
  spell: 'spell', melee_weapon: 'melee', ranged_weapon: 'ranged', armor: 'armor', object: 'object', bonus: 'bonus',
};

function formToHero(form) {
  return {
    name: form.name, title: form.title, clan: form.clan, type: form.type, cost: Number(form.cost) || 0,
    cc: Number(form.cc) || 0, ad: Number(form.ad) || 0, he: Number(form.he) || 0, hp: Number(form.hp) || 0,
    eCc: Number(form.elite_cc) || 0, eAd: Number(form.elite_ad) || 0, eHe: Number(form.elite_he) || 0, eHp: Number(form.elite_hp) || 0,
    ability: form.ability_name, abilityTxt: form.ability_text, eAbility: form.elite_ability_name, eTxt: form.elite_ability_text,
    velocidad: form.velocidad, elite_velocidad: form.elite_velocidad,
    art: form.art_url, eliteArt: form.elite_art_url, num: form.number, foil: form.foil, gold_border: form.gold_border, rainbow_border: form.rainbow_border,
  };
}

function formToEquipItem(form) {
  return {
    name: form.name, txt: form.description, cost: Number(form.cost) || undefined, tag: form.tag, element: form.type,
    mana: Number(form.mana) || undefined, cc: Number(form.cc) || undefined, power: Number(form.power) || undefined,
    hp: Number(form.hp) || undefined, num: form.number, art_url: form.art_url, foil: form.foil, gold_border: form.gold_border, rainbow_border: form.rainbow_border,
  };
}

// Shows the card exactly as it will look inside the game frame, before saving.
export default function CardPreviewModal({ form, onClose }) {
  const [elite, setElite] = useState(false);
  const isHero = ['hero', 'bizarro'].includes(form.category);
  const equipType = EQUIP_TYPE_BY_CATEGORY[form.category];

  // Se monta en el body (fuera del zoom/transformación de la página) para que
  // la carta salga centrada y nítida, sin necesidad de hacer scroll.
  return createPortal(
    <div
      className="fixed inset-0 z-[100001] flex flex-col items-center justify-center gap-4 p-5 bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[100010] h-12 px-4 rounded-full flex items-center gap-2 justify-center bg-black/90 border-2 border-[#ffd24a] text-[#ffe49a] hover:bg-black hover:text-white active:scale-95 transition-all shadow-[0_0_24px_rgba(255,210,74,.65)] font-black text-sm"
      >
        <X size={22} /> Cerrar
      </button>
      <div className="relative w-full max-w-[420px]" style={{ aspectRatio: '7 / 10', maxHeight: '78vh' }} onClick={(e) => e.stopPropagation()}>
        {isHero ? (
          <HeroCardFace hero={formToHero(form)} elite={elite} />
        ) : equipType ? (
          <EquipCard item={formToEquipItem(form)} type={equipType} zoomable={false} fill />
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-[#ffd24a44] bg-[#140d24] text-center text-sm text-[#cfc6dd]">Vista previa no disponible para razas.</div>
        )}
      </div>
      {isHero && (
        <button onClick={(e) => { e.stopPropagation(); setElite(!elite); }} className="rounded-xl bg-[#ffd24a] px-5 py-2 text-sm font-black text-[#3a2600]">
          {elite ? 'Ver versión Normal' : 'Ver versión Élite'}
        </button>
      )}
    </div>,
    document.body
  );
}