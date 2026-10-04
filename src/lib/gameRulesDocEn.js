// Complete English rules used by the bilingual PDF.
export const GAME_RULES_DOC_EN = [
 [
  "Objective",
  "Build a team of 3 heroes, equip them and defeat all 3 rival heroes in turn-based combat."
 ],
 [
  "Phase 1 · Auction",
  "The auction has 3 phases: melee (CC), ranged (AD) and magic (HE). Six heroes appear in each phase, one per race. Both players place sealed bids; the highest bidder recruits the hero and pays the bid. Ties on the same hero open a new bidding round. Each round also brings a unique booster. Epic cards cost 20 extra coins and only appear through specific boosters."
 ],
 [
  "Coins",
  "You start with 100 auction coins and 100 equipment coins. You may transfer equipment coins to the auction 10 at a time. After all auction phases, leftover auction coins and positive equipment boosters are added to your equipment budget. If you reach the last phase without enough auction coins, you recruit on debt and the difference is deducted from equipment."
 ],
 [
  "Phase 2 · Equipment",
  "Each hero can carry 1 weapon (melee or ranged) and 1 armor. Spells are unique cards, cost mana and go to your hand; items allow up to 3 copies and also go to your hand. Removing a purchase refunds its coins."
 ],
 [
  "Phase 3 · Combat",
  "Turn bands resolve ranged, then magic, then melee; speed breaks ties within a band. Available actions are melee, shot, spell, hero ability, item, defend or tank. Every action spends the turn. Mana is a fixed reserve and can only be restored by specific cards."
 ],
 [
  "Speed",
  "Every hero shows a lightning marker and base speed. Faster heroes act first inside the same action band. Heroes with speed 21 or more display the FAST badge. Equipment can raise speed; Frozen reduces it, while Asleep and Paralyzed skip the turn."
 ],
 [
  "Armor",
  "Armor reduces melee, ranged and spell damage. Elemental armor fully negates its opposing element (water-fire, lightning-water, ice-lightning, fire-ice). Arcane Barrier protects against magical damage."
 ],
 [
  "Combat states",
  "Asleep and Paralyzed lose the next turn. Frozen reduces speed. Cursed lowers stats; Blessed raises them. Tanking intercepts attacks aimed at allies. Confused may lose actions; Drunk takes damage, loses stats and may fail; Dizzy loses stats. Disoriented redirects the next attack using a three-sided die: rival, ally or self. Invisible cannot be targeted or damaged by rivals for its duration and is cleansed of negative states."
 ],
 [
  "Elite Form",
  "The first time a hero falls, it returns in Elite form with restored health and race-based improved stats. It returns without negative states, weapon or armor; discarded gear goes to the discard pile. A second fall is permanent unless a revival card is used."
 ],
 [
  "Golden rule of abilities",
  "A hero may use its normal ability once and its Elite ability once per battle. They are tracked separately, and reviving does not restore an ability already spent."
 ],
 [
  "d30 roll · Fumble and Epic Failure",
  "Before any action is resolved (melee hit, shot, spell, item or ability) a d30 is rolled and written in the battle log:\n\n• 2-19 and 21-30 → the action resolves normally.\n• 20 (≈3.3%) → FUMBLE: the action fails with no effect; the turn is still spent.\n• 1 → a d6 confirmation is rolled. A 1 (≈0.5% overall) is an EPIC FAILURE: the action fails and backfires on its author. If the d6 does not confirm it, the action resolves normally.\n\nOnly ONE die per action, even if it goes through several steps, and failures never come almost back to back: if one follows right after another, the roll is repeated once.\n\nSpecial cases:\n• Abilities with their own die (Monkgeta, Llorilomo, El Rolero, Doji Conpuri, Faseve…) do not roll the d30 as well.\n• Summons: a fumble summons nothing; an epic failure sends the creatures to the rival army.\n• An ability that changes nothing at that moment is NOT a fumble: it is only noted in the log.\n\nIn online games the host resolves the roll and syncs it with the rival."
 ],
 [
  "Hero dice and CRITICAL hits",
  "Some abilities roll their own die in addition to the d30. El Rolero uses a d20 to multiply HE; its Elite die is always 20. A CRITICAL is produced only by specific cards and pierces shield and/or armor. Every roll, multiplier and critical result is written to the battle log and synchronized online."
 ],
 [
  "Discard pile",
  "When a hero falls, its weapon and armor enter that player’s discard pile. Consumed items also go there. The battle interface shows the pile with its card count."
 ],
 [
  "Arcane Reanimation",
  "Arcane Reanimation (card 117, 12 mana) returns one random discarded card to your hand. Items become usable again; weapons and armor are equipped for free when played from the hand, replacing and discarding old gear of the same type."
 ],
 [
  "Game types",
  "Bizarre Fantasies has these game types:\n\n• Against the AI: auction, equipment and combat against one of the 5 AI levels (see «AI levels»).\n• Private online room: you create a password-protected room and share the code with your rival.\n• Public online room: no password; anyone with the code can join.\n• Bizarre Room: pairs you at random with another visitor.\n• Missions (single player): 5-level campaigns without auction (see «Missions»).\n• Multiplayer missions: the mission against another player, with packs or with 100 coins (see «Multiplayer missions»).\n\nIn online games, if someone loses the connection the match can be resumed for 30 minutes by entering the room again. If your rival disappears, the game warns you and keeps waiting."
 ],
 [
  "Bizarre Room",
  "Join the public lobby with your protected nickname, see visitors and press the Panic Button to be paired at random. At least 3 visitors are required. The shared roulette selects the rival, the match starts automatically and its hidden password allows reconnection."
 ],
 [
  "Missions",
  "Missions are single-player campaigns of 5 progressive levels, without hero auction. There are three campaigns: Club, Legends (L5R) and All Heroes (Epics included).\n\nDepending on the level you buy your three heroes with a budget or open a random pack. Then you always get 150 equipment coins for weapons, armor, spells and items. The rival uses three heroes different from yours and an AI that gets tougher every level.\n\nWins are saved by nick, add up and unlock the next level; every completed level has its own celebration and the mission shows up in the missions ranking."
 ],
 [
  "Mission levels",
  "• Level 1 · Initiation: buy 3 heroes with 100 coins, no Epics. AI Novice. 1 win.\n• Level 2 · The surprise pack: three random heroes from a pack, up to one Epic. AI Novice. 1 win.\n• Level 3 · Challenge: 75 coins, no Epics; stronger rival with up to one Epic. AI Strategist. 2 wins.\n• Level 4 · Mastery: 50 coins, demanding rival. AI Nemesis. 3 wins.\n• Level 5 · The epic seal: pack with a guaranteed Epic; rival with one Epic and more value. AI Nemesis. 3 wins.\n\nEvery level gives 150 equipment coins."
 ],
 [
  "Multiplayer missions",
  "A mission can also be played against another player (Club, Legends or All Heroes) in its own room, in two modes:\n\n• Pack: each player opens their exclusive packs and picks 3 heroes; at most one Epic per army.\n• 100 coins: each player buys 3 heroes with 100 coins.\n\nIn both, each player then has 150 equipment coins. A rematch can be requested at the end and the result counts for the missions ranking."
 ],
 [
  "AI levels",
  "There are 5 AI levels, unlocked by winning:\n\n• AI Novice: low bids, few abilities. 2 wins unlock the next one.\n• AI Berserker: maximum aggression. 3 wins.\n• AI Strategist: balanced and tactical (recommended). 5 wins.\n• AI Nemesis: steals your heroes and plays almost perfectly. 5 wins.\n• Bizarre AI: chaos made AI. Beat it 10 times to complete the game.\n\nWins are saved by nick and every level beaten has its own celebration."
 ],
 [
  "Bizarros and Summons",
  "Bizarros are surprise full heroes with normal and Elite abilities. Summons are also full combat units created by specific hero abilities: Rubber Ducklings, Crane, Kamikaze Unicorn and Pegasus. Summons can use their implemented abilities and may switch to the rival army on an Epic Fail during summoning."
 ],
 [
  "Strategic synergies",
  "Mark plus multi-hit or area damage increases repeated pressure; tanking plus shields and healing protects fragile damage dealers; stat penalties enable executions and focused attacks; speed equipment changes turn order; piercing and critical damage counter armor; mana recovery sustains spell teams; discard recovery reuses valuable gear and items; summons add targets, damage and defensive pressure."
 ],
 [
  "Mobile and tablet hands",
  "During battle, both hands are collapsed below the action panel. Their gold and blue headers show card counts and expand or collapse independently. Their state is remembered during the match; desktop hands remain open."
 ],
 [
  "Tank absorption",
  "A tanking hero, or Rubber Ducklings blocking through Peck, intercepts attacks aimed at allies. Each interception displays an ABSORBED marker and is written to the battle log."
 ],
 [
  "Player chat",
  "Online matches include real-time chat and AI-generated hero emojis. Inappropriate content is blocked before sending. Lobby messages are deleted when leaving the Bizarre Room."
 ],
 [
  "Current card catalogue",
  "The card index that follows is generated from the live database at download time. It includes all current heroes, Bizarros, summons, races, spells, weapons, armor, items and boosters with Spanish and English texts whenever translations are available."
 ]
];
