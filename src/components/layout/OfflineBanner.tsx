import { useAppStore } from '@/lib/store';

export function OfflineBanner() {
  const isOnline = useAppStore((s) => s.isOnline);
  const dict = useAppStore((s) => s.dict);

  if (isOnline) return null;

  return (
    <div className="offline-banner" role="alert">
      {dict.common.offline}
    </div>
  );
}
