import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { EMOJI_CATEGORIES } from '@/lib/heroEmojis';
import { MessageCircle, X, Send, Smile, GripHorizontal } from 'lucide-react';
import useDragOffset from '@/hooks/useDragOffset';

// Overlay de chat entre jugadores en partidas multiplayer. Se muestra como un
// icono circular plegable en el borde derecho de la pantalla (que no se solapa
// con los elementos del juego) y al pulsarlo se despliega la ventana de chat
// con mensajes en tiempo real (suscripción a la entidad ChatMessage por sala)
// y un selector de emojis de héroes generados por IA.

export default function ChatOverlay({ mobScale = 1, pinchZ = 1 }) {
  const [status, setStatus] = useState(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojiCat, setEmojiCat] = useState(0);
  const [unread, setUnread] = useState(0);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const unsubRef = useRef(null);
  const myNickRef = useRef('');
  const openRef = useRef(false);
  const listRef = useRef(null);
  // El icono y la ventana se pueden mover libremente por la pantalla.
  const iconDrag = useDragOffset();
  const panelDrag = useDragOffset();

  useEffect(() => { openRef.current = open; }, [open]);

  // Escucha el estado multiplayer que envía el parche del iframe
  useEffect(() => {
    const onMessage = (e) => {
      if (e.data?.bfChatStatus) {
        setStatus(e.data.bfChatStatus);
        if (e.data.bfChatStatus.playerNick) myNickRef.current = e.data.bfChatStatus.playerNick;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Carga el historial y se suscribe a mensajes nuevos cuando cambia la sala
  useEffect(() => {
    if (!status?.roomCode || !status?.connOpen) {
      setMessages([]);
      if (unsubRef.current) { try { unsubRef.current(); } catch (e) {} unsubRef.current = null; }
      return;
    }
    const roomCode = status.roomCode;
    base44.entities.ChatMessage.filter({ room_code: roomCode }, 'created_date', 100)
      .then((msgs) => setMessages(msgs || []))
      .catch(() => {});
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (!event.data || event.data.room_code !== roomCode) return;
      if (event.type === 'delete') {
        setMessages((prev) => prev.filter((m) => m.id !== event.data.id));
      } else {
        setMessages((prev) => {
          if (prev.some((m) => m.id === event.data.id)) {
            return prev.map((m) => (m.id === event.data.id ? event.data : m));
          }
          return [...prev, event.data].sort((a, b) => {
            const ta = new Date(a.created_date).getTime();
            const tb = new Date(b.created_date).getTime();
            return ta - tb;
          });
        });
        if (!openRef.current && event.data.sender_nick !== myNickRef.current) {
          setUnread((u) => u + 1);
        }
      }
    });
    unsubRef.current = unsub;
    return () => { if (unsubRef.current) { try { unsubRef.current(); } catch (e) {} unsubRef.current = null; } };
  }, [status?.roomCode, status?.connOpen]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (open) setUnread(0); }, [open]);

  // Al abrir el chat siempre se ve el final de la conversación (último mensaje).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
    return () => clearTimeout(t);
  }, [open, messages.length]);

  const send = useCallback(async (text, emojiId) => {
    const trimmed = (text || '').trim();
    if (!trimmed && !emojiId) return;
    if (!status?.roomCode) return;
    setSending(true);
    try {
      await base44.entities.ChatMessage.create({
        room_code: status.roomCode,
        sender_nick: status.playerNick || 'Jugador',
        sender_is_host: !!status.isHost,
        text: trimmed,
        emoji_id: emojiId || '',
      });
      setInput('');
    } catch (e) {
      // noop
    } finally {
      setSending(false);
    }
  }, [status]);

  const onKey = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input, '');
    }
  }, [input, send]);

  if (!status?.connOpen || !status?.roomCode) return null;

  const emojiMap = {};
  EMOJI_CATEGORIES.forEach((cat) => { cat.emojis.forEach((em) => { emojiMap[em.id] = em; }); });

  const fmtTime = (d) => {
    try { return new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; }
  };

  return (
    <>
      {/* Icono plegable (borde derecho, no se solapa con retratos arriba ni mano abajo) */}
      {!open && (
        <div
          className="fixed z-40"
          style={{
            right: '6px',
            top: 'calc(50% - 22px)',
            transform: `translate(${iconDrag.offset.x}px, ${iconDrag.offset.y}px) scale(${mobScale * pinchZ})`,
            transformOrigin: 'top right',
            touchAction: 'none',
          }}
        >
        <button
          {...iconDrag.dragHandlers}
          onClick={() => { if (!iconDrag.didDrag()) setOpen(true); }}
          aria-label="Abrir chat (arrastrable)"
          className="flex items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95"
          style={{
            width: '44px',
            height: '44px',
            background: 'rgba(14, 10, 22, 0.85)',
            border: '2px solid rgba(255, 210, 74, 0.5)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5), 0 0 12px rgba(255,210,74,0.2)',
          }}
        >
          <MessageCircle size={22} style={{ color: '#FFD24A' }} />
          {unread > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[10px] font-bold"
              style={{ minWidth: '18px', height: '18px', background: '#e60b0b', color: '#fff', boxShadow: '0 0 6px rgba(230,11,11,0.7)' }}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        </div>
      )}

      {/* Panel desplegado */}
      {open && (
        <div
          className="fixed z-50 flex flex-col"
          style={{
            right: '6px',
            top: 'calc(50% - 200px)',
            width: 'min(300px, calc(100vw - 16px))',
            maxHeight: 'min(420px, calc(100vh - 24px))',
            background: 'rgba(14, 10, 22, 0.96)',
            border: '2px solid rgba(255, 210, 74, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(255,210,74,0.15)',
            backdropFilter: 'blur(12px)',
            transform: `translate(${panelDrag.offset.x}px, ${panelDrag.offset.y}px)`,
          }}
        >
          {/* Cabecera (zona de arrastre de la ventana) */}
          <div
            {...panelDrag.dragHandlers}
            className="flex items-center justify-between px-3 py-2 cursor-move select-none"
            style={{ borderBottom: '1px solid rgba(255,210,74,0.2)', background: 'linear-gradient(180deg, rgba(255,210,74,0.08), transparent)', touchAction: 'none' }}
          >
            <div className="flex items-center gap-2">
              <GripHorizontal size={14} style={{ color: '#ffe49a', opacity: 0.6 }} />
              <span className="font-heading text-sm font-bold" style={{ color: '#FFD24A' }}>Chat de sala</span>
              <span className="text-[10px] opacity-50" style={{ color: '#ffe49a' }}>{status.roomCode}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 transition-colors hover:bg-white/10"
              aria-label="Cerrar chat"
            >
              <X size={16} style={{ color: '#ffe49a' }} />
            </button>
          </div>

          {/* Mensajes */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-2 py-2 space-y-2 no-scrollbar" style={{ minHeight: '120px' }}>
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-center text-xs opacity-40 py-8" style={{ color: '#ffe49a' }}>
                No hay mensajes aún.<br />¡Saluda a tu rival!
              </div>
            )}
            {messages.map((m) => {
              const mine = m.sender_nick === myNickRef.current || (status.isHost && m.sender_is_host);
              const emoji = m.emoji_id ? emojiMap[m.emoji_id] : null;
              return (
                <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] opacity-50 mb-0.5 px-1" style={{ color: '#ffe49a' }}>
                    {mine ? 'Tú' : m.sender_nick || 'Rival'} · {fmtTime(m.created_date)}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-sm ${mine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                    style={{
                      background: mine ? 'rgba(255, 210, 74, 0.15)' : 'rgba(255, 255, 255, 0.07)',
                      border: mine ? '1px solid rgba(255,210,74,0.25)' : '1px solid rgba(255,255,255,0.08)',
                      color: '#f5ecd9',
                    }}
                  >
                    {m.text && <span style={{ wordBreak: 'break-word' }}>{m.text}</span>}
                    {emoji && (
                      <img
                        src={emoji.url}
                        alt={emoji.name}
                        className="inline-block rounded-full"
                        style={{ width: m.text ? '28px' : '56px', height: m.text ? '28px' : '56px', objectFit: 'cover', verticalAlign: 'middle', marginLeft: m.text ? '4px' : '0' }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Selector de emojis con pestañas por categoría */}
          {showEmojis && (
            <div style={{ borderTop: '1px solid rgba(255,210,74,0.15)', background: 'rgba(0,0,0,0.25)' }}>
              {/* Pestañas */}
              <div className="flex gap-1 px-2 pt-1.5 overflow-x-auto no-scrollbar">
                {EMOJI_CATEGORIES.map((cat, i) => (
                  <button
                    key={cat.id}
                    onClick={() => setEmojiCat(i)}
                    className="rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition-all"
                    style={{
                      background: emojiCat === i ? 'rgba(255,210,74,0.2)' : 'rgba(255,255,255,0.05)',
                      border: emojiCat === i ? '1px solid rgba(255,210,74,0.4)' : '1px solid transparent',
                      color: emojiCat === i ? '#FFD24A' : '#ffe49a',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {/* Grid de emojis */}
              <div className="px-2 py-2 grid grid-cols-4 gap-1.5 overflow-y-auto no-scrollbar" style={{ maxHeight: '200px' }}>
                {EMOJI_CATEGORIES[emojiCat]?.emojis.map((em) => (
                  <button
                    key={em.id}
                    onClick={() => { send(input, em.id); setShowEmojis(false); }}
                    className="flex flex-col items-center gap-0.5 rounded-lg p-1 transition-all hover:scale-110 hover:bg-white/10"
                    title={`${em.name}${em.clan ? ` (${em.clan})` : ''}${em.ability ? ` · ${em.ability}` : ''}`}
                  >
                    <img src={em.url} alt={em.name} className="rounded-full" style={{ width: '40px', height: '40px', objectFit: 'cover' }} loading="lazy" />
                    <span className="text-[8px] opacity-50 truncate w-full text-center" style={{ color: '#ffe49a', maxWidth: '52px' }}>{em.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-1 px-2 py-2" style={{ borderTop: '1px solid rgba(255,210,74,0.15)' }}>
            <button
              onClick={() => setShowEmojis((s) => !s)}
              className="rounded-full p-1.5 transition-colors hover:bg-white/10"
              aria-label="Emojis"
              style={{ background: showEmojis ? 'rgba(255,210,74,0.2)' : 'transparent' }}
            >
              <Smile size={18} style={{ color: showEmojis ? '#FFD24A' : '#ffe49a' }} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Escribe un mensaje…"
              maxLength={200}
              className="flex-1 rounded-lg px-2.5 py-1.5 text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,210,74,0.2)',
                color: '#f5ecd9',
              }}
            />
            <button
              onClick={() => send(input, '')}
              disabled={sending || (!input.trim())}
              className="rounded-full p-1.5 transition-all hover:scale-110 disabled:opacity-30 disabled:scale-100"
              aria-label="Enviar"
              style={{ background: 'rgba(255,210,74,0.2)' }}
            >
              <Send size={16} style={{ color: '#FFD24A' }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}