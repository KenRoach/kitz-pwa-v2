import { NavLink } from 'react-router-dom';
import { useAppStore } from '@/lib/store';

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

const TAB_ICONS = {
  '/chat': ChatIcon,
  '/contacts': ContactsIcon,
  '/activity': ActivityIcon,
} as const;

export function BottomNav() {
  const dict = useAppStore((s) => s.dict);

  const tabs = [
    { to: '/chat' as const, label: dict.nav.chat },
    { to: '/contacts' as const, label: dict.nav.contacts },
    { to: '/activity' as const, label: dict.nav.activity },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => {
        const Icon = TAB_ICONS[tab.to];
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `bottom-nav-tab${isActive ? ' active' : ''}`}
          >
            <span className="bottom-nav-icon"><Icon /></span>
            <span className="bottom-nav-label">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
