import { Actor } from 'base44:runtime/actors';

const VALID_SIDES = new Set(['p', 'g']);

export default class GameRelayRoom extends Actor {
  members = new Map();

  async handleStart() {
    const saved = await this.storage.get('members');
    if (saved) this.members = new Map(saved);
    const live = new Set(this.getConnections().map((conn) => conn.id));
    for (const id of this.members.keys()) if (!live.has(id)) this.members.delete(id);
  }

  async handleConnect(conn) {
    conn.send({ type: 'connected' });
  }

  async handleMessage(conn, msg) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'hello' && VALID_SIDES.has(msg.side)) {
      this.members.set(conn.id, { side: msg.side });
      await this.storage.put('members', [...this.members.entries()]);
      conn.send({ type: 'ready', side: msg.side });
      this.broadcast({ type: 'presence', side: msg.side, connected: true });
      return;
    }
    const member = this.members.get(conn.id);
    if (!member || msg.type !== 'send_batch') return;
    const batchId = String(msg.batch_id || '');
    const messages = msg.messages;
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(batchId) || !Array.isArray(messages) || !messages.length || messages.length > 50) return;
    if (messages.some((item) => !item || typeof item !== 'object' || typeof item.t !== 'string')) return;
    if (member.side !== 'p' && messages.some((item) => item.t === 'snap' || item.t === 'bfFullSync')) return;
    this.broadcast({
      type: 'deliveries',
      side: member.side,
      deliveries: messages.map((data, index) => ({ id: batchId + '_' + index, data })),
    });
  }

  async handleClose(conn) {
    const member = this.members.get(conn.id);
    if (!member) return;
    this.members.delete(conn.id);
    await this.storage.put('members', [...this.members.entries()]);
    this.broadcast({ type: 'presence', side: member.side, connected: false });
  }
}