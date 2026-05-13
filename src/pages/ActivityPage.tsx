import { useAppStore } from '@/lib/store';

interface ActivityItem {
  id: string;
  type: 'quote_viewed' | 'task_due' | 'wa_message';
  title: string;
  detail: string;
  time: string;
}

const MOCK_ITEMS: ActivityItem[] = [
  {
    id: '1',
    type: 'quote_viewed',
    title: '#47',
    detail: 'Juan Perez',
    time: '10:32 AM',
  },
  {
    id: '2',
    type: 'task_due',
    title: 'Llamar a proveedor',
    detail: '',
    time: '2:00 PM',
  },
  {
    id: '3',
    type: 'wa_message',
    title: 'Maria Lopez',
    detail: 'Necesito una cotización nueva',
    time: '9:15 AM',
  },
];

const TYPE_ICONS: Record<ActivityItem['type'], string> = {
  quote_viewed: '\u{1F4C4}',
  task_due: '\u2705',
  wa_message: '\u{1F4F1}',
};

function activityLabel(
  type: ActivityItem['type'],
  dict: ReturnType<typeof useAppStore.getState>['dict'],
): string {
  const map: Record<ActivityItem['type'], string> = {
    quote_viewed: dict.activity.quoteViewed,
    task_due: dict.activity.taskDue,
    wa_message: dict.activity.waMessage,
  };
  return map[type];
}

export function ActivityPage() {
  const dict = useAppStore((s) => s.dict);
  const items = MOCK_ITEMS;

  return (
    <div className="activity-page">
      <header className="page-header">
        <h1>{dict.activity.title}</h1>
      </header>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>{dict.activity.empty}</p>
        </div>
      ) : (
        <>
          <div className="activity-section-header">
            <span className="activity-section-label">{dict.activity.today}</span>
          </div>
          <ul className="activity-list">
            {items.map((item) => (
              <li key={item.id} className="activity-item">
                <span className="activity-icon">{TYPE_ICONS[item.type]}</span>
                <div className="activity-content">
                  <span className="activity-type-label">
                    {activityLabel(item.type, dict)}
                  </span>
                  <span className="activity-title">
                    {item.title}
                    {item.detail ? ` — ${item.detail}` : ''}
                  </span>
                </div>
                <span className="activity-time">{item.time}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
