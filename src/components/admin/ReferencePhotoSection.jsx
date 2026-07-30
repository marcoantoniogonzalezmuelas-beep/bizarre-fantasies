import React, { useRef } from 'react';

// Sección del editor de backoffice: permite subir una foto de referencia y
// usarla (opcionalmente) como referencia en cualquiera de las generaciones
// de IA (arte de carta, escena de batalla, animación 3D de habilidad).
// El admin sube la foto y marca la casilla para que se incluya como
// existing_image_urls en la generación que quiera.
export default function ReferencePhotoSection({ referencePhoto, useReferencePhoto, onToggleUse, onUpload, onClear, uploading }) {
  const fileRef = useRef(null);

  function pick() { fileRef.current?.click(); }

  return (
    <div className="mt-2 mb-4 rounded-2xl border border-[#5ce08a33] bg-[#0d2e1a]/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-black uppercase tracking-wider text-[#7ee8a8]">📷 Foto de referencia</span>
        <span className="text-[11px] text-[#5a9a78]">Súbela y úsala en cualquier generación de IA marcando la casilla</span>
      </div>
      <div className="flex items-start gap-3">
        {referencePhoto ? (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#5ce08a44] bg-black/45">
            <img src={referencePhoto} alt="Referencia" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#5ce08a44] bg-black/45 text-center text-[10px] text-[#5a9a78]">Sin foto</div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) onUpload(f); e.target.value = ''; }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={pick}
              disabled={uploading}
              className="rounded-xl bg-gradient-to-b from-[#5ce08a] to-[#2a9a4a] px-4 py-2 text-xs font-black text-white disabled:opacity-50"
            >
              {uploading ? 'Subiendo…' : referencePhoto ? '🔄 Cambiar foto' : '📷 Subir foto'}
            </button>
            {referencePhoto && (
              <button type="button" onClick={onClear} className="rounded-xl border border-[#cc333366] px-3 py-2 text-xs font-black text-[#ff9d9d] hover:bg-[#cc333322]">
                Quitar
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 text-[12px] text-[#cfc6dd]">
            <input
              type="checkbox"
              checked={useReferencePhoto}
              onChange={(e) => onToggleUse(e.target.checked)}
              className="h-4 w-4 accent-[#5ce08a]"
            />
            Usar esta foto como referencia en las generaciones de IA
          </label>
          {useReferencePhoto && referencePhoto && (
            <p className="text-[10px] text-[#5a9a78]">Se añadirá como imagen de referencia al generar arte, escena de batalla y animación 3D.</p>
          )}
        </div>
      </div>
    </div>
  );
}