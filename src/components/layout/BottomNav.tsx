import { NavLink } from 'react-router-dom';
import { useAppStore } from '@/lib/store';

export function BottomNav() {
  const dict = useAppStore((s) => s.dict);

  const tabs = [
    { to: '/chat', label: dict.nav.chat, icon: '\u{1F4AC}' },
    { to: '/contacts', label: dict.nav.contacts, icon: '\u{1F464}' },
    { to: '/activity', label: dict.nav.activity, icon: '\u{1F4CB}' },
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
