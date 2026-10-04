import React from 'react';
import GameDataSyncButton from '@/components/admin/GameDataSyncButton';
import EquipShopCheckButton from '@/components/admin/EquipShopCheckButton';
import OrphanSpecsButton from '@/components/admin/OrphanSpecsButton';
import BackupCardsButton from '@/components/admin/BackupCardsButton';

// Panel plegable con las herramientas de mantenimiento (antes, sueltas en la cabecera).
export default function MaintenancePanel({ cards }) {
  return (
    <details className="mb-6 rounded-2xl border border-[#ffd24a22] bg-[#140d24]/70 p-3">
      <summary className="cursor-pointer select-none text-sm font-black text-[#ffe49a]">🛠️ Mantenimiento</summary>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div><div className="mb-1 text-[10px] font-black uppercase tracking-wider text-[#8f86a3]">Tras cada actualización</div><GameDataSyncButton /></div>
        <div><div className="mb-1 text-[10px] font-black uppercase tracking-wider text-[#8f86a3]">Comprobar</div><EquipShopCheckButton /></div>
        <div><div className="mb-1 text-[10px] font-black uppercase tracking-wider text-[#8f86a3]">Limpieza</div><OrphanSpecsButton /></div>
        <div><div className="mb-1 text-[10px] font-black uppercase tracking-wider text-[#8f86a3]">Copia de seguridad</div><BackupCardsButton cards={cards} /></div>
      </div>
    </details>
  );
}
