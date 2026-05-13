import { NavLink } from 'react-router-dom';
import { useAppStore } from '@/lib/store';

export function BottomNav() {
  const dict = useAppStore((s) => s.dict);

  const tabs = [
    { to: '/chat', label: dict.nav.chat, icon: '💬' },
    { to: '/contacts', label: dict.nav.contacts, icon: '👤' },
    { to: '/quotes', label: dict.nav.quotes, icon: '📄' },
    { to: '/more', label: dict.nav.more, icon: '☰' },
  ] as const;

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `bottom-nav-tab${isActive ? ' active' : ''}`}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
