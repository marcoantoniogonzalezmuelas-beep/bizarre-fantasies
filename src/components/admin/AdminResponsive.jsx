import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Marca la página con "bf-admin" mientras se está en el backoffice (/admin…): activa la capa de estilos para móvil
// de src/index.css (solo afecta al backoffice, nunca al juego).
export default function AdminResponsive() {
  const { pathname } = useLocation();
  useEffect(() => {
    const on = pathname === '/admin' || pathname.startsWith('/admin/');
    document.body.classList.toggle('bf-admin', on);
    return () => document.body.classList.remove('bf-admin');
  }, [pathname]);
  return null;
}
