import { Actor } from 'base44:runtime/actors';

const VALID_SIDES = new Set(['p', 'g']);

export default class GameRelayRoom extends Actor {
  members = new Map();
  relay = { seen: [], p: [], g: [] };
  serial = Promise.resolve();

  async handleStart() {
    const saved = await this.storage.get('members');
    if (saved) this.members = new Map(saved);
    this.relay = await this.storage.get('relay') || { seen: [], p: [], g: [] };
    const live = new Set(this.getConnections().map((conn) => conn.id));
    for (const id of this.members.keys()) if (!live.has(id)) this.members.delete(id);
  }

  async handleConnect(conn) {
    conn.send({ type: 'connected' });
  }

  handleMessage(conn, msg) {
    const operation = this.serial.then(() => this.processMessage(conn, msg));
    this.serial = operation.catch(() => {});
    return operation;
  }

  // El asiento solo se concede con el token secreto de la sala (owner/relay para
  // el anfitrión, guest para el invitado), comprobado contra la sala en la BD.
  async tokenValid(side, token) {
    const t = typeof token === 'string' ? token : '';
    if (!t || t.length > 80) return false;
    try {
      const rows = await this.client.asServiceRole.entities.GameRoom.filter({ room_code: this.instanceId }, '-updated_date', 1);
      const state = rows && rows[0] && rows[0].state;
      if (!state) return false;
      const valid = side === 'p' ? [state.owner_token, state.relay_host_token] : [state.guest_token];
      return valid.some(v => typeof v === 'string' && v.length > 0 && v === t);
    } catch (e) { return false; }
  }

  replay(conn, side) {
    conn.send({ type: 'ready', side, peers: [...this.members.values()].map(m => m.side) });
    const other = side === 'p' ? 'g' : 'p';
    for (let i = 0; i < this.relay[other].length; i += 50) conn.send({ type: 'deliveries', side: other, deliveries: this.relay[other].slice(i, i + 50) });
  }

  async processMessage(conn, msg) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'hello' && VALID_SIDES.has(msg.side)) {
      const prev = this.members.get(conn.id);
      if (prev && prev.side === msg.side) return; // hello repetido: sin nueva consulta a la BD
      if (!(await this.tokenValid(msg.side, msg.token))) { conn.send({ type: 'unauthorized' }); return; }
      this.members.set(conn.id, { side: msg.side });
      await this.storage.put('members', [...this.members.entries()]);
      this.replay(conn, msg.side);
      this.broadcast({ type: 'presence', side: msg.side, connected: true });
      return;
    }
    const member = this.members.get(conn.id);
    if (!member) return;
    if (msg.type === 'sync') { this.replay(conn, member.side); return; }
    if (msg.type === 'ack_deliveries') {
      const ids = new Set(Array.isArray(msg.ids) ? msg.ids.filter(id => typeof id === 'string').slice(0, 100) : []);
      const other = member.side === 'p' ? 'g' : 'p';
      const next = { ...this.relay, [other]: this.relay[other].filter(m => !ids.has(m.id)) };
      await this.storage.put('relay', next);
      this.relay = next;
      return;
    }
    if (msg.type !== 'send_batch') return;
    const batchId = String(msg.batch_id || '');
    const messages = msg.messages;
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(batchId) || !Array.isArray(messages) || !messages.length || messages.length > 50) return;
    if (messages.some((item) => !item || typeof item !== 'object' || typeof item.t !== 'string')) return;
    if (member.side !== 'p' && messages.some((item) => item.t === 'snap' || item.t === 'bfFullSync')) return;
    const key = member.side + ':' + batchId;
    const deliveries = messages.map((data, index) => ({ id: batchId + '_' + index, data }));
    if (!this.relay.seen.includes(key)) {
      if (this.relay[member.side].length + deliveries.length > 2000) { conn.send({ type: 'backpressure' }); return; }
      const next = { ...this.relay, [member.side]: [...this.relay[member.side], ...deliveries], seen: [...this.relay.seen, key].slice(-1024) };
      await this.storage.put('relay', next);
      this.relay = next;
    }
    this.broadcast({ type: 'deliveries', side: member.side, deliveries });
    conn.send({ type: 'batch_ack', batch_id: batchId });
  }

  async handleClose(conn) {
    const member = this.members.get(conn.id);
    if (!member) return;
    this.members.delete(conn.id);
    await this.storage.put('members', [...this.members.entries()]);
    this.broadcast({ type: 'presence', side: member.side, connected: false });
  }
}