import { useEffect } from 'react';
import bindMissionPinch from '@/components/missions/bindMissionPinch';

export default function useMissionPinch(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;
    return bindMissionPinch(ref.current);
  }, [ref, active]);
}