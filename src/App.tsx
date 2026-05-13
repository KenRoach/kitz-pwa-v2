import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { ChatPage } from '@/pages/ChatPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { QuotesPage } from '@/pages/QuotesPage';
import { MorePage } from '@/pages/MorePage';
import { LoginPage } from '@/pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

interface SessionUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
}

function OnlineListener() {
  const setOnline = useAppStore((s) => s.setOnline);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [setOnline]);

  return null;
}

function SessionLoader() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    const token = localStorage.getItem('kitz-token');
    if (token && !user) {
      api<{ session: { user: SessionUser } | null }>('/api/auth/session')
        .then((res) => {
          if (res.session?.user) setUser(res.session.user);
          else {
            localStorage.removeItem('kitz-token');
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('kitz-token');
          setUser(null);
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OnlineListener />
          <SessionLoader />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/quotes" element={<QuotesPage />} />
              <Route path="/more" element={<MorePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
