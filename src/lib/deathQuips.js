// Serialized into the iframe. Cycle a shuffled bag per clan: no repeats until exhausted.
export function createDeathQuipPicker() {
  var lines = {
    guerreros: [['¡Mi armadura estaba en garantía!', '¡Que alguien recoja mi honor del suelo!', 'Era una retirada táctica… demasiado vertical.', '¡Exijo revancha después de la siesta!'], ['My armour was under warranty!', 'Someone pick my honour off the floor!', 'A tactical retreat… straight down.', 'Rematch after my nap!']],
    druidas: [['¡Me habéis podado demasiado!', 'Vuelvo al bosque… en formato abono.', '¡Regad mis raíces mientras no estoy!', 'Esto no era lo que entendía por echar raíces.'], ['You pruned me too far!', 'Back to the forest… as compost.', 'Water my roots while I am gone!', 'Not how I meant to put down roots.']],
    nomuertos: [['¿Otra vez? ¡Acababa de resucitar!', '¡Guardadme el sitio en la cripta!', 'Esto ya empieza a ser una costumbre.', '¡Ni muerto me dejáis descansar!'], ['Again? I just came back!', 'Save my spot in the crypt!', 'This is becoming a habit.', 'You will not even let me rest in peace!']],
    vaqueros: [['Este duelo no venía en el contrato.', '¡Decidle a mi nave que la quise!', 'Me voy al gran saloon de las estrellas.', '¡Maldita sea, llevaba el láser en seguro!'], ['This duel was not in my contract.', 'Tell my spaceship I loved her!', 'Off to the great saloon in the stars.', 'Blast! My laser safety was on!']],
    cotidianos: [['¡Y mañana tenía que madrugar!', 'Esto no lo cubre mi seguro.', '¡Pausa, que no había guardado partida!', '¡Decidle a mi jefe que hoy no llego!'], ['And I had an early start tomorrow!', 'My insurance does not cover this.', 'Pause! I forgot to save!', 'Tell my boss I will not make it today!']],
    elfos: [['¡Mi arco no estaba calibrado!', '¡Que el bosque no se entere de esto!', 'He vivido mil años para tropezar aquí.', '¡Al menos no me despeinéis las orejas!'], ['My bow was not calibrated!', 'Do not tell the forest about this!', 'A thousand years, just to trip here.', 'At least leave my ears looking elegant!']],
    magos: [['¡Eso no estaba en el grimorio!', 'Creo que conjuré mi propia derrota.', '¡Necesito un hechizo de garantía!', 'Me faltó maná… y me sobró confianza.'], ['That was not in the spellbook!', 'I think I summoned my own defeat.', 'I need a warranty spell!', 'Too little mana… too much confidence.']],
    epicas: [['¡Esto no estaba en mi profecía!', 'Toda leyenda merece una segunda parte.', '¡Mi caída tendrá edición coleccionista!', 'No es el final… es el tráiler.'], ['This was not in my prophecy!', 'Every legend deserves a sequel.', 'My downfall gets a collector edition!', 'Not the ending… just the trailer.']],
    bizarros: [['¡Devolvedme al sobre, por favor!', 'Mi invocador va a oír hablar de esto.', '¡Yo solo venía a hacer un cameo!', '¡La próxima vez invocad a otro!'], ['Put me back in the booster, please!', 'My summoner will hear about this.', 'I was only here for a cameo!', 'Summon someone else next time!']],
    other: [['¡Esto no entraba en mis planes!', 'Me tumbo un momento… por estrategia.', '¡Que conste que casi lo tenía!', 'Volveré… cuando deje de doler.'], ['This was not the plan!', 'Lying down… strategically.', 'For the record, I nearly had it!', 'I will be back… when it stops hurting.']]
  }, bags = {}, last = {};
  return function(clan, english) {
    var key = String(clan || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
    if (!lines[key]) key = 'other';
    if (!bags[key] || !bags[key].length) {
      var bag = [0, 1, 2, 3];
      for (var i = bag.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), v = bag[i]; bag[i] = bag[j]; bag[j] = v; }
      if (bag[0] === last[key]) { var first = bag[0]; bag[0] = bag[1]; bag[1] = first; }
      bags[key] = bag;
    }
    var index = bags[key].shift(); last[key] = index;
    return lines[key][english ? 1 : 0][index];
  };
}