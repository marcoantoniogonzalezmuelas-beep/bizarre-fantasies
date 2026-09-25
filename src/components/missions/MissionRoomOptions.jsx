import React from 'react';
export default function MissionRoomOptions({ isPrivate, setPrivate, password, setPassword, disabled }) {
  return <div className="mp-section">
    <label className="flex items-center gap-3"><input type="checkbox" checked={isPrivate} onChange={e => setPrivate(e.target.checked)} disabled={disabled} /> Crear sala privada con contraseña</label>
    {isPrivate && <label>Contraseña (4–64 caracteres)<input className="mission-input mt-2" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} minLength={4} maxLength={64} disabled={disabled} /></label>}
    <p className="text-sm opacity-75">La sala aparecerá aquí para todos los jugadores; {isPrivate ? 'solo podrán entrar con tu contraseña.' : 'podrán entrar con un clic, sin código.'} Caduca tras 10 minutos esperando rival.</p>
  </div>;
}