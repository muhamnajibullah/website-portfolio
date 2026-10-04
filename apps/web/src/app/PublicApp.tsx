import { lazy, Suspense, useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Content } from '@portfolio/types';
import { Dialog, ErrorBoundary, Icon, ThemeToggle, useScrollLock } from '@portfolio/ui';
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
  const entry = useRef<{ button: HTMLButtonElement; x: number; y: number } | null>(null);
  useScrollLock(mode === 'world');
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
  const openIntro = (event: MouseEvent<HTMLButtonElement>) => {
    entry.current = { button: event.currentTarget, x: window.scrollX, y: window.scrollY };
    setMode('intro');
  };
  const exit = useCallback(() => {
    setMode('normal');
    requestAnimationFrame(() => {
      const previous = entry.current;
      previous?.button.focus({ preventScroll: true });
      if (previous) window.scrollTo({ left: previous.x, top: previous.y, behavior: 'instant' });
    });
  }, []);
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
          <div className="header-actions">
            <ThemeToggle />
            <button
              className="icon-button mobile-menu"
              aria-label="Toggle navigation"
              aria-expanded={menu}
              aria-controls="navigation"
              onClick={() => setMenu(!menu)}
            >
              <Icon name={menu ? 'close' : 'menu'} />
            </button>
          </div>
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
          Could not load the latest content. Showing the last available version.{' '}
          <button className="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}
      <span className="sr-only" role="status">
        {refreshing ? 'Updating portfolio content' : ''}
      </span>
      {missing ? (
        <main id="main" className="container recovery">
          <span className="eyebrow">404 / Not found</span>
          <h1>Page not found</h1>
          <p>This page may have moved, or the project is no longer published.</p>
          <a className="button primary" href="/">
            Return to portfolio <Icon />
          </a>
        </main>
      ) : project ? (
        <ProjectPage project={project} content={content} />
      ) : (
        <PortfolioPage content={content} onExplore={openIntro} />
      )}
      <footer className="container site-footer">
        <a className="brand" href="/">
          <span className="brand-icon">
            <Icon name="code" size={16} />
          </span>
          {name}.
        </a>
        <p>Software Engineer · Portfolio</p>
        <a href="#main">Back to top ↑</a>
      </footer>
      {mode === 'intro' && (
        <Dialog title="Explore the portfolio in 3D" onClose={exit}>
          <div className="intro-icon">
            <Icon name="flight" size={38} />
          </div>
          <p>
            Fly toward a marker to find a project or work experience. Move closer, then press E or
            choose Open details.
          </p>
          <div className="control-guide">
            <div>
              <kbd>W A S D</kbd>
              <span>Move and turn</span>
            </div>
            <div>
              <kbd>Drag</kbd>
              <span>Look around</span>
            </div>
            <div>
              <kbd>↑ / ↓</kbd>
              <span>Fly up or down</span>
            </div>
            <div>
              <kbd>E</kbd>
              <span>View a nearby destination</span>
            </div>
          </div>
          <p className="small-text">
            On mobile and tablet, use the on-screen controls. The 3D models are temporary. You can
            also view every project in the regular portfolio.
          </p>
          <div className="actions">
            <button className="button primary" onClick={() => setMode('world')}>
              Enter world <Icon name="flight" />
            </button>
            <button className="button" onClick={exit}>
              Stay on the portfolio
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
                  <span className="eyebrow">Starting the 3D tour</span>
                  <h2>Loading the 3D world…</h2>
                  <progress aria-label="Loading the 3D tour" />
                  <button className="button" onClick={exit}>
                    Back to portfolio
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
      <h2>The 3D tour could not load.</h2>
      <p>You can still view all projects in the regular portfolio.</p>
      <button className="button primary" onClick={exit}>
        Back to portfolio
      </button>
    </div>
  );
}
