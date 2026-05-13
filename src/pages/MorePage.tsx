import { useAppStore } from '@/lib/store';
import type { Locale } from '@/i18n/types';

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'es-PA', label: 'Español' },
  { value: 'en-US', label: 'English' },
  { value: 'pt-BR', label: 'Português' },
];

const MENU_ITEMS = [
  { icon: '📅', labelKey: 'calendar' as const, href: '/calendar' },
  { icon: '📊', labelKey: 'deals' as const, href: '/deals' },
  { icon: '📦', labelKey: 'products' as const, href: '/products' },
  { icon: '✅', labelKey: 'tasks' as const, href: '/tasks' },
  { icon: '🧠', labelKey: 'brain' as const, href: '/brain' },
  { icon: '⚙️', labelKey: 'settings' as const, href: '/settings' },
] as const;

const LABELS: Record<string, Record<Locale, string>> = {
  calendar: { 'es-PA': 'Calendario', 'en-US': 'Calendar', 'pt-BR': 'Calendário' },
  deals: { 'es-PA': 'Negocios', 'en-US': 'Deals', 'pt-BR': 'Negócios' },
  products: { 'es-PA': 'Productos', 'en-US': 'Products', 'pt-BR': 'Produtos' },
  tasks: { 'es-PA': 'Tareas', 'en-US': 'Tasks', 'pt-BR': 'Tarefas' },
  brain: { 'es-PA': 'Cerebro', 'en-US': 'Brain', 'pt-BR': 'Cérebro' },
  settings: { 'es-PA': 'Ajustes', 'en-US': 'Settings', 'pt-BR': 'Configurações' },
};

export function MorePage() {
  const locale = useAppStore((s) => s.locale);
  const dict = useAppStore((s) => s.dict);
  const setLocale = useAppStore((s) => s.setLocale);

  return (
    <div className="more-page">
      <header className="page-header">
        <h1>KitZ</h1>
      </header>

      <ul className="menu-list">
        {MENU_ITEMS.map((item) => (
          <li key={item.labelKey} className="menu-item">
            <a href={item.href} className="menu-link">
              <span className="menu-icon">{item.icon}</span>
              <span>{LABELS[item.labelKey][locale]}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="locale-switcher">
        {LOCALES.map((l) => (
          <button
            key={l.value}
            className={`locale-btn${locale === l.value ? ' active' : ''}`}
            onClick={() => setLocale(l.value)}
            type="button"
          >
            {l.label}
          </button>
        ))}
      </div>

      <button className="logout-btn" type="button">
        {dict.auth.logout}
      </button>
    </div>
  );
}
