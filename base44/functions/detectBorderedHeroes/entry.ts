import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import UPNG from 'npm:upng-js@2.1.0';

const IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/';
const HERO_IDS = ["kru","bos","nar","hil","tor","vor","bra","gna","vra","mor","buc","com","kre","hev","pij","pat","syl","ael","zar","ere","alf","dix","ska","syx","gor","fut","gam","ret","mal","ser","bat","nix","vex","chi","sol","man","pac","hex","rev","doc","zer","xer","aje","rol","pol"];
const HERO_NAMES = ["Krunder","Boss","Narbon","Hildra","Torax","Vorn","Bramblok","Gnarr","Vragnar","Morthex","Buck Ironclad","La Comadreja","Krunder Mec.","El Heavy","El Pijo","Patrón","Sylvara","Aelion","Zarmanda","Eredon","Alfredinho","Dixie Plasma","Skarla","Sylvex","Gorvak","El Futbolista","El Gamer","Retropoeta","Malachar","Serafis","Batu","Nixara","Vexal","Chivo","Solenne","Mantenimiento","Pacopiton","Hexara","Reverendo Sapis","Doc Radiante","Zarmandis","Xerath","El Ajedrecista","El Rolero","El Político"];
const HERO_ART_IDS = ['0a701a388','0ae86f5cf','3144fa0cc','b3befffca','b27af2a2e','49da10371','4b39462db','70e5ca186','2321b345c','7b6b1032e','3bbcf59c0','dc308d368','a53c0e073','362ea0a4b','861dbe1ad','562066537','3ec5dbfd9','e5d35394d','49c4de216','a96095ce8','dd9ae011d','d9d830676','54365cb73','b34bdb48f','a237d8ffc','99d2f7a81','dcee2560b','ed76b96e2','a1aed5117','998c3949c','3c97a29dd','5a9d97619','1bd2bdf6d','40de7f507','a6a9e3561','a291e62f4','3e72cf42e','95e8228cd','c8b5e2201','c71c525b8','0ad0be833','3aedc4e62','0b3987343','2cfe0922c','9c56aea64'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const results = [];
    for (let i = 0; i < HERO_IDS.length; i++) {
      const id = HERO_IDS[i];
      const url = IMG + HERO_ART_IDS[i] + '_generated_image.png';
      try {
        const res = await fetch(url);
        if (!res.ok) { results.push({ id, name: HERO_NAMES[i], margin: -1, error: 'fetch ' + res.status }); continue; }
        const ab = await res.arrayBuffer();
        const png = UPNG.decode(ab);
        const w = png.width, h = png.height, data = png.data;
        const isBg = (x, y) => {
          const idx = (y * w + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
          return a < 10 || (r > 232 && g > 232 && b > 232);
        };
        const midX = Math.floor(w / 2), midY = Math.floor(h / 2);
        const depth = (dir) => {
          let s = 0;
          if (dir === 't') { while (s < h && isBg(midX, s)) s++; }
          else if (dir === 'b') { while (s < h && isBg(midX, h - 1 - s)) s++; }
          else if (dir === 'l') { while (s < w && isBg(s, midY)) s++; }
          else { while (s < w && isBg(w - 1 - s, midY)) s++; }
          return s;
        };
        const margin = Math.max(depth('t') / h, depth('b') / h, depth('l') / w, depth('r') / w);
        results.push({ id, name: HERO_NAMES[i], margin: Math.round(margin * 1000) / 1000 });
      } catch (e) {
        results.push({ id, name: HERO_NAMES[i], margin: -1, error: String(e && e.message || e) });
      }
    }
    // Already-overridden (regenerated) heroes to exclude from the "to regen" list:
    const DONE = ['mor', 'ska', 'kre'];
    const bordered = results.filter(r => r.margin > 0.015 && !DONE.includes(r.id)).map(r => ({ id: r.id, name: r.name, margin: r.margin }));
    return Response.json({ total: results.length, bordered, all: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});