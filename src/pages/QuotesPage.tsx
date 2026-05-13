import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

interface Quote {
  id: string;
  title: string;
  contactName: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface QuotesResponse {
  data: Quote[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#9CA3AF',
  sent: '#3B82F6',
  accepted: '#10B981',
  rejected: '#EF4444',
};

export function QuotesPage() {
  const dict = useAppStore((s) => s.dict);
  const locale = useAppStore((s) => s.locale);
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['quotes', filter],
    queryFn: () => api<QuotesResponse>(`/api/quotes${filter !== 'all' ? `?status=${filter}` : ''}`),
  });

  const quotes = data?.data ?? [];

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      draft: dict.quotes.draft,
      sent: dict.quotes.sent,
      accepted: dict.quotes.accepted,
      rejected: dict.quotes.rejected,
    };
    return map[status] ?? status;
  };

  const money = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

  return (
    <div className="quotes-page">
      <header className="page-header">
        <h1>{dict.quotes.title}</h1>
        <button className="fab-add" type="button" aria-label={dict.quotes.create}>
          +
        </button>
      </header>

      <div className="filter-chips">
        {['all', 'draft', 'sent', 'accepted', 'rejected'].map((f) => (
          <button
            key={f}
            className={`chip${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
            type="button"
          >
            {f === 'all' ? 'All' : statusLabel(f)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="loading">{dict.common.loading}</p>
      ) : quotes.length === 0 ? (
        <div className="empty-state">
          <p>{dict.quotes.empty}</p>
          <button className="btn-primary" type="button">
            {dict.quotes.create}
          </button>
        </div>
      ) : (
        <ul className="quote-list">
          {quotes.map((q) => (
            <li key={q.id} className="quote-item">
              <div className="quote-header">
                <span className="quote-title">{q.title || `#${q.id.slice(0, 6)}`}</span>
                <span
                  className="quote-status"
                  style={{ color: STATUS_COLORS[q.status] ?? '#666' }}
                >
                  {statusLabel(q.status)}
                </span>
              </div>
              <div className="quote-meta">
                <span>{q.contactName}</span>
                <span className="quote-total">{money(q.total, q.currency)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
