// Invocaciones: criaturas que NO son héroes bizarros sorpresa, sino followers
// que aparecen por la habilidad de un héroe (Patitos de Goma de KillerDucks,
// Grulla de Daidoji Esva, Unicornio Kamikaze y Pegaso de Chuchinjo Tokatus).
// Se listan aparte en el Oráculo y en el backoffice.
export const SUMMON_IDS = ['tk_patito_goma', 'tk_grulla', 'tk_unicornio', 'tk_pegaso'];

export const isSummonCard = (card) => SUMMON_IDS.includes(String(card?.card_id || card?.id || ''));