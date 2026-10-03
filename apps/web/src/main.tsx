import { StrictMode, useEffect, useState } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from '@portfolio/ui';
import { PublicApp } from './app/PublicApp';
import { initialContent, loadContent } from './services/content';
import './styles.css';

const client = new QueryClient({
  defaultOptions: { queries: { staleTime: 60000, retry: 1, refetchOnWindowFocus: false } },
});
function Root() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const query = useQuery({
    queryKey: ['public-content'],
    queryFn: loadContent,
    initialData: initialContent,
    initialDataUpdatedAt: 0,
  });
  return (
    <PublicApp
      content={query.data}
      path={window.location.pathname}
      error={query.isError}
      refreshing={hydrated && query.isFetching}
      retry={() => void query.refetch()}
    />
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Application root is missing.');
const app = (
  <StrictMode>
    <ErrorBoundary
      fallback={
        <main className="container recovery">
          <h1>Portfolio unavailable</h1>
          <p>Please reload the page to try again.</p>
          <a className="button" href="/">
            Return to portfolio
          </a>
        </main>
      }
    >
      <QueryClientProvider client={client}>
        <Root />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
if (
  root.hasChildNodes() &&
  root.dataset.route === window.location.pathname.replace(/\/$/, '') &&
  window.location.pathname !== '/'
)
  hydrateRoot(root, app);
else if (root.hasChildNodes() && root.dataset.route === '/' && window.location.pathname === '/')
  hydrateRoot(root, app);
else createRoot(root).render(app);
