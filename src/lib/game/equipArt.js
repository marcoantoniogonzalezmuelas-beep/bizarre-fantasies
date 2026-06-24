// Resuelve la ilustración de cualquier objeto de equipamiento por su id.
import { MELEE_ART, RANGED_ART, ARMOR_ART, SPELL_ART, OBJECT_ART } from '@/lib/artUrls';
import { MELEE_WEAPONS, RANGED_WEAPONS, ARMORS, SPELLS, OBJECTS } from '@/lib/game/gameData';

function buildMap(list, arts) {
  const m = {};
  (list || []).forEach((it, i) => { if (it && it.id) m[it.id] = arts[i]; });
  return m;
}

const ART_BY_ID = {
  ...buildMap(MELEE_WEAPONS, MELEE_ART),
  ...buildMap(RANGED_WEAPONS, RANGED_ART),
  ...buildMap(ARMORS, ARMOR_ART),
  ...buildMap(SPELLS, SPELL_ART),
  ...buildMap(OBJECTS, OBJECT_ART),
};

export const equipArt = (id) => ART_BY_ID[id] || '';