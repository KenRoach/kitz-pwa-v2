import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
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

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OnlineListener />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/more" element={<MorePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
