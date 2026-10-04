import {
  Component,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ErrorInfo,
} from 'react';
import { useScrollLock } from './scroll-lock';
export { useScrollLock } from './scroll-lock';

export function Icon({
  name = 'arrow',
  size = 20,
}: {
  name?:
    | 'arrow'
    | 'close'
    | 'menu'
    | 'code'
    | 'flight'
    | 'plus'
    | 'check'
    | 'external'
    | 'sun'
    | 'moon';
  size?: number;
}) {
  const paths = {
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    close: 'm6 6 12 12M6 18 18 6',
    menu: 'M4 6h16M4 12h16M4 18h16',
    code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-5 2 2-16',
    flight: 'M3 6h18M12 6v4M7 19h12M9 15v4m7-4v4M3 12h4l2-2h6l4 3v3H8l-3-4',
    plus: 'M12 5v14M5 12h14',
    check: 'm5 12 4 4L19 6',
    external: 'M14 3h7v7M21 3 10 14M10 3H3v18h18v-7',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
    moon: 'M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z',
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function ThemeToggle() {
  // SSR always uses the default; the early bootstrap already colors the saved theme.
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    const sync = () => {
      setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute(
          'content',
          getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim(),
        );
    };
    const storage = (event: StorageEvent) => {
      if (event.key !== 'portfolio-theme') return;
      document.documentElement.dataset.theme = event.newValue === 'light' ? 'light' : 'dark';
      sync();
    };
    sync();
    window.addEventListener('portfolio-theme-change', sync);
    window.addEventListener('storage', storage);
    return () => {
      window.removeEventListener('portfolio-theme-change', sync);
      window.removeEventListener('storage', storage);
    };
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event('portfolio-theme-change'));
    try {
      localStorage.setItem('portfolio-theme', next);
    } catch {
      // Theme switching must work even if persistence is blocked.
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim(),
      );
  };
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name="plus" />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}

export function Dialog({
  title,
  children,
  onClose,
  className = '',
  dismissible = true,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useScrollLock(true);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`dialog ${className}`}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
    >
      <div className="dialog-top">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
          disabled={!dismissible}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Keep credentials and content out of browser logs. */
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function Image({
  src,
  alt,
  width,
  height,
  eager = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  eager?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}
