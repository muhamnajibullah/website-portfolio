import { lazy, Suspense, useEffect, useState } from 'react';
import type { Content } from '@portfolio/types';
import { Dialog, ErrorBoundary, Icon } from '@portfolio/ui';
import { pageMetadata } from '@portfolio/seo';
import { PortfolioPage } from '../features/profile/PortfolioPage';
import { ProjectPage } from '../features/projects/ProjectPage';

const InteractiveWorld = lazy(() => import('../features/interactive-world/InteractiveWorld'));
export function PublicApp({
  content,
  path = '/',
  error = false,
  refreshing = false,
  retry,
}: {
  content: Content;
  path?: string;
  error?: boolean;
  refreshing?: boolean;
  retry?: () => void;
}) {
  const [mode, setMode] = useState<'normal' | 'intro' | 'world'>('normal');
  const [menu, setMenu] = useState(false);
  const slug = path.startsWith('/projects/') ? path.split('/')[2] : undefined;
  const project = content.projects.find((item) => item.slug === slug);
  const missing = path !== '/' && !(slug && project);
  const profile = content.profiles[0];
  const name = profile?.name ?? 'Your name';
  useEffect(() => {
    const metadata = pageMetadata(content, project);
    document.title = missing ? 'Page not found · Software Engineer Portfolio' : metadata.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', metadata.description);
  }, [content, project, missing]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (mode === 'world') document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);
  const exit = () => {
    setMode('normal');
    requestAnimationFrame(() => document.getElementById('world-entry')?.focus());
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="/" aria-label={`${name} — home`}>
            <span className="brand-icon">
              <Icon name="code" size={18} />
            </span>
            <span>
              {name}
              <span className="brand-dot">.</span>
            </span>
          </a>
          <button
            className="icon-button mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            aria-controls="navigation"
            onClick={() => setMenu(!menu)}
          >
            <Icon name={menu ? 'close' : 'menu'} />
          </button>
          <nav
            id="navigation"
            className={menu ? 'navigation open' : 'navigation'}
            aria-label="Main navigation"
          >
            {[
              ['About', 'about'],
              ['Projects', 'projects'],
              ['Experience', 'experience'],
            ].map(([label, id]) => (
              <a key={id} href={`/#${id}`} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
            <a href="/#contact" className="nav-contact" onClick={() => setMenu(false)}>
              Let’s talk <Icon name="arrow" size={16} />
            </a>
          </nav>
        </div>
      </header>
      {error && (
        <div className="container notice error" role="alert">
          Live content could not be refreshed. Showing the last published snapshot.{' '}
          <button className="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}
      <span className="sr-only" role="status">
        {refreshing ? 'Refreshing published content' : ''}
      </span>
      {missing ? (
        <main id="main" className="container recovery">
          <span className="eyebrow">404 / Not found</span>
          <h1>This page isn’t here.</h1>
          <p>The project may have been unpublished, or the link may have changed.</p>
          <a className="button primary" href="/">
            Return to portfolio <Icon />
          </a>
        </main>
      ) : project ? (
        <ProjectPage project={project} content={content} />
      ) : (
        <PortfolioPage content={content} onExplore={() => setMode('intro')} />
      )}
      <footer className="container site-footer">
        <a className="brand" href="/">
          <span className="brand-icon">
            <Icon name="code" size={16} />
          </span>
          {name}.
        </a>
        <p>Software Engineer · Built with intention.</p>
        <a href="#main">Back to top ↑</a>
      </footer>
      {mode === 'intro' && (
        <Dialog title="Explore my interactive portfolio" onClose={exit}>
          <div className="intro-icon">
            <Icon name="flight" size={38} />
          </div>
          <p>
            A quieter way to explore. Pilot a helicopter around a small world and discover projects
            and experience at your own pace.
          </p>
          <div className="control-guide">
            <div>
              <kbd>W A S D</kbd>
              <span>Move & turn</span>
            </div>
            <div>
              <kbd>Drag</kbd>
              <span>Look around</span>
            </div>
            <div>
              <kbd>↑ / ↓</kbd>
              <span>Adjust altitude</span>
            </div>
            <div>
              <kbd>E</kbd>
              <span>Open nearby details</span>
            </div>
          </div>
          <p className="small-text">
            Touch controls are available on mobile and tablet. The helicopter and environment use
            development placeholders. All published content is also available in Normal Mode.
          </p>
          <div className="actions">
            <button className="button primary" onClick={() => setMode('world')}>
              Enter world <Icon name="flight" />
            </button>
            <button className="button" onClick={exit}>
              Stay in Normal Mode
            </button>
          </div>
        </Dialog>
      )}
      {mode === 'world' && (
        <div
          className="world-shell"
          role="dialog"
          aria-modal="true"
          aria-label="Interactive helicopter portfolio"
        >
          <ErrorBoundary fallback={<WorldFallback exit={exit} />}>
            <Suspense
              fallback={
                <div className="world-loading">
                  <span className="eyebrow">Preparing your flight</span>
                  <h2>Loading interactive world…</h2>
                  <progress aria-label="Loading interactive module" />
                  <button className="button" onClick={exit}>
                    View Normal Portfolio
                  </button>
                </div>
              }
            >
              <InteractiveWorld content={content} onExit={exit} />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
    </>
  );
}
export function WorldFallback({ exit }: { exit: () => void }) {
  return (
    <div className="world-loading" role="alert">
      <h2>Interactive experience couldn’t be loaded.</h2>
      <p>View the normal portfolio instead.</p>
      <button className="button primary" onClick={exit}>
        View Normal Portfolio
      </button>
    </div>
  );
}
