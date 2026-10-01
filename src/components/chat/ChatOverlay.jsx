import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { EMOJI_CATEGORIES } from '@/lib/heroEmojis';
import { MessageCircle, X, Send, Smile, GripHorizontal } from 'lucide-react';
import useDragOffset from '@/hooks/useDragOffset';
import { isChatMessageBlocked } from '@/lib/chatModeration';
import { mergeChatMessage } from '@/lib/chatMessages';
import { recordGame, isRejection } from '@/lib/gameRecordClient';
import { getRelayToken } from '@/lib/relayTokens';
import { t, getLang } from '@/lib/i18n';
import { onViewportChange } from '@/lib/viewportEvents';
import { chatIconAnchor } from '@/lib/chatIconAnchor';

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
  const [moderationError, setModerationError] = useState('');
  const [managedEmojis, setManagedEmojis] = useState([]);
  const messagesEndRef = useRef(null);
  const unsubRef = useRef(null);
  const myNickRef = useRef('');
  const openRef = useRef(false);
  const listRef = useRef(null);
  // El icono y la ventana se pueden mover libremente por la pantalla.
  const iconDrag = useDragOffset();
  const panelDrag = useDragOffset();

  // Catálogo administrado: se comparte entre multiplayer y Habitación Bizarra.
  useEffect(() => {
    base44.entities.ChatEmoji.filter({ active: true }, 'sort_order', 500).then(setManagedEmojis).catch(() => {});
  }, []);

  const categories = useMemo(() => {
    if (!managedEmojis.length) return EMOJI_CATEGORIES;
    const groups = {};
    managedEmojis.forEach((emoji) => {
      const label = emoji.category || 'Cartas';
      (groups[label] = groups[label] || []).push({ id: emoji.source_card_id, name: emoji.name, url: emoji.url });
    });
    return Object.entries(groups).map(([label, emojis]) => ({ id: label, label, emojis }));
  }, [managedEmojis]);

  useEffect(() => { openRef.current = open; }, [open]);

  // Se coloca pegado al botón de animaciones del juego (arriba a la izquierda),
  // sin solaparlo; si no está visible, queda en la esquina superior izquierda.
  const [anchor, setAnchor] = useState({ left: 10, top: 10, height: 28, scale: 1 });
  useEffect(() => {
    if (!status?.connOpen) return undefined;
    const measure = () => {
      if (document.hidden) return;
      let next = chatIconAnchor(null);
      try {
        const frame = document.querySelector('iframe');
        const btn = frame?.contentDocument?.getElementById('bf-cine-toggle');
        if (btn && btn.offsetParent !== null) {
          next = chatIconAnchor({
            frameRect: frame.getBoundingClientRect(),
            innerWidth: frame.contentWindow?.innerWidth,
            btnRect: btn.getBoundingClientRect(),
          });
        }
      } catch (e) {}
      setAnchor((a) => (a.left === next.left && a.top === next.top && a.height === next.height && a.scale === next.scale ? a : next));
    };
    measure();
    const timer = setInterval(measure, 1000);
    const offViewport = onViewportChange(measure);
    return () => { clearInterval(timer); offViewport(); };
  }, [status?.connOpen]);

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
      .then((msgs) => setMessages((msgs || []).slice(-200)))
      .catch(() => {});
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (!event.data || event.data.room_code !== roomCode) return;
      if (event.type === 'delete') {
        setMessages((prev) => prev.filter((m) => m.id !== event.data.id));
      } else {
        setMessages((prev) => mergeChatMessage(prev, event.data));
        if (!openRef.current && event.data.sender_nick !== myNickRef.current) {
          setUnread((u) => u + 1);
        }
      }
    });
    unsubRef.current = unsub;
    return () => { if (unsubRef.current) { try { unsubRef.current(); } catch (e) {} unsubRef.current = null; } };
  }, [status?.roomCode, status?.connOpen]);

  useEffect(() => { if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);
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
    if (trimmed && isChatMessageBlocked(trimmed)) {
      setModerationError(t('Mensaje no permitido: evita insultos, contenido sexual y palabras ofensivas.'));
      return;
    }
    setModerationError('');
    setSending(true);
    try {
      let created;
      try {
        // El servidor decide quién habla (por el token de la sala o de la Habitación
        // Bizarra) y aplica la moderación: el nick que envíe el cliente no se usa.
        const side = status.isHost ? 'p' : 'g';
        const res = await recordGame('chat', {
          room_code: status.roomCode, side, token: getRelayToken(status.roomCode, side),
          session_token: status.sessionToken || '', text: trimmed, emoji_id: emojiId || '',
        });
        created = res.message;
      } catch (err) {
        if (err.code === 'blocked') { setModerationError(t('Mensaje no permitido: evita insultos, contenido sexual y palabras ofensivas.')); return; }
        if (err.code === 'rate_limited') { setModerationError(t('Vas muy rápido. Espera un momento.')); return; }
        if (isRejection(err)) throw err;
        // Reserva (función no disponible): escritura directa antigua.
        created = await base44.entities.ChatMessage.create({
          room_code: status.roomCode,
          sender_nick: status.playerNick || 'Jugador',
          sender_is_host: !!status.isHost,
          text: trimmed,
          emoji_id: emojiId || '',
        });
      }
      setMessages((prev) => (prev.some((m) => m.id === created.id) ? prev : mergeChatMessage(prev, created)));
      setInput('');
    } catch (e) {
      // Antes fallaba en silencio: el jugador no sabía si el mensaje salió.
      setModerationError(t('No se pudo enviar el mensaje. Inténtalo de nuevo.'));
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

  // El icono se escala con el juego (misma escala que el resto de elementos de la pantalla):
  // antes se dibujaba a tamaño real de pantalla y en el móvil quedaba siempre enorme.

  const emojiMap = {};
  categories.forEach((cat) => { cat.emojis.forEach((em) => { emojiMap[em.id] = em; }); });

  const fmtTime = (d) => {
    try { return new Date(d).toLocaleTimeString(getLang() === 'en' ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; }
  };

  return (
    <>
      {/* Icono plegable (borde derecho, no se solapa con retratos arriba ni mano abajo) */}
      {!open && (
        <div
          className="fixed"
          style={{
            // Arriba a la izquierda, justo al lado del botón de animaciones.
            zIndex: 100500,
            left: `${anchor.left}px`,
            top: `${anchor.top}px`,
            transform: `translate(${iconDrag.offset.x}px, ${iconDrag.offset.y}px)`,
            touchAction: 'none',
          }}
        >
        <button
          {...iconDrag.dragHandlers}
          onClick={() => { if (!iconDrag.didDrag()) setOpen(true); }}
          aria-label={t('Abrir chat (arrastrable)')}
          className="relative flex items-center gap-1.5 rounded-full backdrop-blur-md transition-all hover:scale-105 active:scale-95 font-bold"
          style={{
            height: `${anchor.height}px`,
            transform: `scale(${anchor.scale})`,
            transformOrigin: 'left top',
            padding: '0 12px',
            fontSize: '12px',
            color: '#3a2600',
            background: 'linear-gradient(180deg, rgba(255,226,122,.95), rgba(200,144,31,.95))',
            border: '1px solid rgba(255,240,180,.8)',
            boxShadow: '0 3px 12px rgba(0,0,0,0.55), 0 0 14px rgba(255,210,74,0.45)',
            whiteSpace: 'nowrap',
          }}
        >
          <MessageCircle size={16} style={{ color: '#3a2600' }} />
          <span>Chat</span>
          {unread > 0 && (
            <span
              className="absolute flex items-center justify-center rounded-full font-bold"
              style={{
                top: '-6px',
                right: '-6px',
                fontSize: '10px',
                minWidth: '18px',
                height: '18px',
                background: '#e60b0b',
                color: '#fff',
                boxShadow: '0 0 8px rgba(230,11,11,0.8)',
              }}
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
          className="fixed flex flex-col"
          style={{
            zIndex: 100501,
            left: '8px',
            top: `${anchor.top + anchor.height + 8}px`,
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
              <span className="font-heading text-sm font-bold" style={{ color: '#FFD24A' }}>{t('Chat de sala')}</span>
              <span className="text-[10px] opacity-50" style={{ color: '#ffe49a' }}>{status.roomCode}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded-full p-1 transition-colors hover:bg-white/10"
              aria-label={t('Cerrar chat')}
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
                    {mine ? t('Tú') : m.sender_nick || t('Rival')} · {fmtTime(m.created_date)}
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
                {categories.map((cat, i) => (
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
                {categories[emojiCat]?.emojis.map((em) => (
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
          {moderationError && (
            <div role="alert" className="px-3 pt-2 text-[11px] font-semibold" style={{ color: '#ff8f8f', borderTop: '1px solid rgba(255,90,90,0.25)' }}>
              {moderationError}
            </div>
          )}
          <div className="flex items-center gap-1 px-2 py-2" style={{ borderTop: moderationError ? 'none' : '1px solid rgba(255,210,74,0.15)' }}>
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
              onChange={(e) => { setInput(e.target.value); if (moderationError) setModerationError(''); }}
              onKeyDown={onKey}
              placeholder={t('Escribe un mensaje…')}
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
              aria-label={t('Enviar')}
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