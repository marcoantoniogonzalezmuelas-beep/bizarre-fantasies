import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Save, Plus, Trash2, RefreshCw, Code2, FileText, ToggleLeft } from 'lucide-react';

const CURRENT_VERSION = 'bf-2026-06-28-punkito-v79';

const TYPE_ICONS = {
  text: <FileText size={14} />,
  html: <Code2 size={14} />,
  toggle: <ToggleLeft size={14} />,
  number: '#',
};

export default function Backoffice() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [editingHtml, setEditingHtml] = useState(null); // id of expanded html editor
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('text');
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.GameConfig.list('-updated_date', 100);
      setConfigs(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = (id, field, val) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const save = async (cfg) => {
    setSaving(s => ({ ...s, [cfg.id]: true }));
    try {
      await base44.entities.GameConfig.update(cfg.id, {
        label: cfg.label,
        value: cfg.value,
        value_long: cfg.value_long,
        type: cfg.type,
        notes: cfg.notes,
        active: cfg.active,
      });
      showToast(`✓ Guardado: ${cfg.label}`);
    } finally {
      setSaving(s => ({ ...s, [cfg.id]: false }));
    }
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar esta entrada?')) return;
    await base44.entities.GameConfig.delete(id);
    setConfigs(prev => prev.filter(c => c.id !== id));
    showToast('Entrada eliminada');
  };

  const addNew = async () => {
    if (!newKey.trim() || !newLabel.trim()) return;
    const created = await base44.entities.GameConfig.create({
      key: newKey.trim(),
      label: newLabel.trim(),
      type: newType,
      active: true,
      value: '',
    });
    setConfigs(prev => [created, ...prev]);
    setNewKey(''); setNewLabel(''); setNewType('text'); setAddOpen(false);
    showToast('Entrada creada');
  };

  const seedVersion = async () => {
    const exists = configs.find(c => c.key === 'patch_version');
    if (exists) {
      await base44.entities.GameConfig.update(exists.id, { value: CURRENT_VERSION });
      setConfigs(prev => prev.map(c => c.id === exists.id ? { ...c, value: CURRENT_VERSION } : c));
    } else {
      const created = await base44.entities.GameConfig.create({
        key: 'patch_version', label: 'Versión del parche', type: 'text',
        value: CURRENT_VERSION, active: true, notes: 'Usada para validar el HTML del juego en caché',
      });
      setConfigs(prev => [created, ...prev]);
    }
    showToast('Versión actualizada a ' + CURRENT_VERSION);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#0d0a14,#0a0810)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-[#3c3158]" style={{ background: 'linear-gradient(180deg,#1a1430ee,#120e1cee)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-[#a89fbb] hover:text-[#FFD24A] transition-colors"><ArrowLeft size={20} /></Link>
          <h1 className="font-heading font-extrabold text-xl text-[#FFD24A] tracking-wider">BACKOFFICE</h1>
          <span className="text-xs text-[#a89fbb] hidden md:inline">Configuración del juego</span>
          <div className="ml-auto flex gap-2">
            <button onClick={load} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-[#3c3158] text-[#a89fbb] hover:border-[#b8902a] hover:text-[#FFD24A] transition-all">
              <RefreshCw size={13} /> Recargar
            </button>
            <button onClick={() => setAddOpen(o => !o)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-[#b8902a] text-[#FFD24A] bg-[#FFD24A11] hover:bg-[#FFD24A22] transition-all">
              <Plus size={13} /> Nueva entrada
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* Quick actions */}
        <div className="rounded-2xl border border-[#3c3158] bg-[#130e1e] p-4">
          <div className="text-xs font-bold text-[#a89fbb] uppercase tracking-wider mb-3">Acciones rápidas</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={seedVersion} className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border border-[#FFD24A] text-[#FFD24A] bg-[#FFD24A0d] hover:bg-[#FFD24A22] transition-all">
              <Code2 size={15} /> Fijar versión → {CURRENT_VERSION}
            </button>
          </div>
          <div className="mt-3 text-xs text-[#7a6f8a]">La versión del parche se usa en el frontend para invalidar la caché del HTML del juego. Actualízala cada vez que publiques una nueva versión.</div>
        </div>

        {/* Add new */}
        {addOpen && (
          <div className="rounded-2xl border border-[#FFD24A44] bg-[#1a1430] p-4 space-y-3">
            <div className="text-sm font-bold text-[#FFD24A] mb-1">Nueva entrada de configuración</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#a89fbb] mb-1">Clave (key)</label>
                <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="ej: patch_version" className="w-full px-3 py-2 text-sm bg-[#09060f] border border-[#3c3158] rounded-lg text-[#efe9dc] focus:outline-none focus:border-[#FFD24A]" />
              </div>
              <div>
                <label className="block text-xs text-[#a89fbb] mb-1">Etiqueta</label>
                <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Nombre visible" className="w-full px-3 py-2 text-sm bg-[#09060f] border border-[#3c3158] rounded-lg text-[#efe9dc] focus:outline-none focus:border-[#FFD24A]" />
              </div>
              <div>
                <label className="block text-xs text-[#a89fbb] mb-1">Tipo</label>
                <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-3 py-2 text-sm bg-[#09060f] border border-[#3c3158] rounded-lg text-[#efe9dc] focus:outline-none focus:border-[#FFD24A]">
                  <option value="text">Texto</option>
                  <option value="html">HTML</option>
                  <option value="number">Número</option>
                  <option value="toggle">Toggle</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addNew} className="px-4 py-2 text-sm font-bold rounded-xl text-[#3a2600] bg-gradient-to-b from-[#ffe27a] via-[#FFD24A] to-[#c8901f] hover:brightness-110 transition-all">Crear</button>
              <button onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm font-bold rounded-xl border border-[#3c3158] text-[#a89fbb] hover:border-[#b8902a] transition-all">Cancelar</button>
            </div>
          </div>
        )}

        {/* Config list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#3c3158] border-t-[#FFD24A] rounded-full animate-spin" />
          </div>
        ) : configs.length === 0 ? (
          <div className="text-center py-16 text-[#a89fbb]">No hay entradas. Usa «Nueva entrada» o «Fijar versión» para empezar.</div>
        ) : (
          <div className="space-y-3">
            {configs.map(cfg => (
              <div key={cfg.id} className="rounded-2xl border border-[#3c3158] bg-[#130e1e] p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FFD24A]">{TYPE_ICONS[cfg.type] || <FileText size={14} />}</span>
                      <span className="font-bold text-[#efe9dc]">{cfg.label}</span>
                      <span className="text-xs text-[#7a6f8a] font-mono bg-[#09060f] px-2 py-0.5 rounded-full border border-[#3c3158]">{cfg.key}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.active ? 'text-[#54e876] bg-[#54e87611]' : 'text-[#a89fbb] bg-[#3c3158]'}`}>{cfg.active ? 'activo' : 'inactivo'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => save(cfg)} disabled={saving[cfg.id]} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#FFD24A] text-[#FFD24A] bg-[#FFD24A0d] hover:bg-[#FFD24A22] transition-all disabled:opacity-50">
                      <Save size={12} /> {saving[cfg.id] ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button onClick={() => remove(cfg.id)} className="flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg border border-[#3c3158] text-[#a89fbb] hover:border-red-500 hover:text-red-400 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Value field */}
                  {cfg.type === 'toggle' ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!cfg.active} onChange={e => update(cfg.id, 'active', e.target.checked)} className="w-4 h-4 accent-[#FFD24A]" />
                      <span className="text-sm text-[#efe9dc]">Habilitado</span>
                    </label>
                  ) : cfg.type === 'html' ? (
                    <div>
                      <button onClick={() => setEditingHtml(editingHtml === cfg.id ? null : cfg.id)} className="text-xs text-[#b06cff] hover:text-[#d4a6ff] font-bold mb-1 transition-colors">
                        {editingHtml === cfg.id ? '▲ Colapsar editor HTML' : '▼ Expandir editor HTML'}
                      </button>
                      {editingHtml === cfg.id && (
                        <textarea
                          value={cfg.value_long || ''}
                          onChange={e => update(cfg.id, 'value_long', e.target.value)}
                          rows={18}
                          className="w-full px-3 py-2 text-xs font-mono bg-[#09060f] border border-[#3c3158] rounded-lg text-[#efe9dc] focus:outline-none focus:border-[#b06cff] resize-y"
                          placeholder="Pega aquí el HTML completo del juego..."
                        />
                      )}
                      {!editingHtml || editingHtml !== cfg.id ? (
                        <div className="text-xs text-[#7a6f8a]">{cfg.value_long ? `${cfg.value_long.length.toLocaleString()} caracteres guardados` : 'Sin contenido'}</div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={cfg.value || ''}
                        onChange={e => update(cfg.id, 'value', e.target.value)}
                        type={cfg.type === 'number' ? 'number' : 'text'}
                        className="flex-1 px-3 py-2 text-sm bg-[#09060f] border border-[#3c3158] rounded-lg text-[#efe9dc] focus:outline-none focus:border-[#FFD24A] font-mono"
                        placeholder="Valor..."
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <input
                    value={cfg.notes || ''}
                    onChange={e => update(cfg.id, 'notes', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-transparent border-0 border-b border-[#3c3158] text-[#7a6f8a] focus:outline-none focus:border-[#b8902a] placeholder-[#4a4158]"
                    placeholder="Notas internas (opcional)..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-bold text-[#3a2600] bg-gradient-to-r from-[#ffe27a] via-[#FFD24A] to-[#c8901f] shadow-[0_4px_20px_rgba(255,210,74,.4)]">
          {toast}
        </div>
      )}
    </div>
  );
}