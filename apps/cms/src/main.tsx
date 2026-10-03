import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@portfolio/ui';
import { AuthGate } from './features/auth/AuthGate';
import { Dashboard } from './features/dashboard/Dashboard';
import './styles.css';
const client = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, refetchOnWindowFocus: false } },
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      fallback={
        <main className="auth-page">
          <h1>CMS unavailable</h1>
          <p>Reload the page to try again.</p>
          <a className="button" href="/">
            Reload CMS
          </a>
        </main>
      }
    >
      <QueryClientProvider client={client}>
        <AuthGate>
          <Dashboard />
        </AuthGate>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
