import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
}

interface ContactsResponse {
  data: Contact[];
}

export function ContactsPage() {
  const dict = useAppStore((s) => s.dict);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', search],
    queryFn: () => api<ContactsResponse>(`/api/contacts?q=${encodeURIComponent(search)}`),
  });

  const contacts = data?.data ?? [];

  return (
    <div className="contacts-page">
      <header className="page-header">
        <h1>{dict.contacts.title}</h1>
        <button className="fab-add" type="button" aria-label={dict.contacts.add}>
          +
        </button>
      </header>

      <div className="search-bar">
        <input
          type="search"
          placeholder={dict.contacts.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {isLoading ? (
        <p className="loading">{dict.common.loading}</p>
      ) : contacts.length === 0 ? (
        <div className="empty-state">
          <p>{dict.contacts.empty}</p>
          <button className="btn-primary" type="button">
            {dict.contacts.add}
          </button>
        </div>
      ) : (
        <ul className="contact-list">
          {contacts.map((c) => (
            <li key={c.id} className="contact-item">
              <div className="contact-avatar">{c.name.charAt(0).toUpperCase()}</div>
              <div className="contact-info">
                <span className="contact-name">{c.name}</span>
                {c.company && <span className="contact-company">{c.company}</span>}
              </div>
              <div className="contact-actions">
                {c.phone && (
                  <>
                    <a href={`tel:${c.phone}`} className="action-btn" aria-label={dict.contacts.call}>
                      📞
                    </a>
                    <a
                      href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                      className="action-btn"
                      aria-label={dict.contacts.whatsapp}
                    >
                      💬
                    </a>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
