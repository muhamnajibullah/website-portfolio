import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Icon, ThemeToggle } from '@portfolio/ui';
import { repository } from '../../services/client';

export function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'signed-out' | 'denied' | 'mfa' | 'admin'>(
    'loading',
  );
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const [factorId, setFactorId] = useState('');
  useEffect(() => {
    if (!repository) return;
    let active = true,
      generation = 0;
    const check = async () => {
      const current = ++generation;
      try {
        const {
          data: { session },
        } = await repository!.client.auth.getSession();
        if (!session) {
          if (active && generation === current) setState('signed-out');
          return;
        }
        const { data: assurance, error: assuranceError } =
          await repository!.client.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assuranceError) throw assuranceError;
        if (assurance?.nextLevel === 'aal2' && assurance.currentLevel !== 'aal2') {
          const { data } = await repository!.client.auth.mfa.listFactors();
          if (active && generation === current) {
            setFactorId(data?.totp[0]?.id ?? '');
            setState('mfa');
          }
          return;
        }
        const admin = await repository!.isAdmin();
        if (active && generation === current) setState(admin ? 'admin' : 'denied');
      } catch {
        if (active && generation === current) {
          setState('denied');
          setError('Authorization could not be verified. Please sign in again.');
        }
      }
    };
    void check();
    const {
      data: { subscription },
    } = repository.client.auth.onAuthStateChange(() => {
      // Supabase auth callbacks must not await another auth operation inside its lock.
      setTimeout(() => {
        if (active) {
          setState('loading');
          void check();
        }
      }, 0);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const { error } = await repository!.client.auth.signInWithPassword({
        email: String(form.get('email')),
        password: String(form.get('password')),
      });
      if (error) setError('Unable to sign in. Check your credentials and try again.');
    } catch {
      setError('Unable to sign in. Please try again later.');
    } finally {
      setBusy(false);
    }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const code = String(new FormData(event.currentTarget).get('code'));
    try {
      const { error } = await repository!.client.auth.mfa.challengeAndVerify({ factorId, code });
      if (error) setError('Unable to verify this code. Please try again.');
    } catch {
      setError('Verification is unavailable. Please try again later.');
    } finally {
      setBusy(false);
    }
  }
  if (repository && state === 'admin') return children;
  return (
    <main className="auth-page">
      <header className="auth-header">
        <a className="brand" href="/">
          <span className="brand-icon">
            <Icon name="code" />
          </span>
          Portfolio CMS<span className="badge">ADMIN</span>
        </a>
        <ThemeToggle />
      </header>
      <div className="auth-card">
        {!repository ? (
          <>
            <span className="eyebrow">Setup required</span>
            <h1>Your content workspace.</h1>
            <p>
              The CMS is ready to connect to Supabase. Add your public configuration and apply the
              migrations to enable secure sign-in.
            </p>
            <div className="notice">
              Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in apps/cms/.env.local. Setup
              steps are in README.md.
            </div>
            <a
              className="button primary"
              href={import.meta.env.VITE_SITE_URL || 'http://localhost:5173'}
            >
              View portfolio <Icon />
            </a>
          </>
        ) : state === 'loading' ? (
          <>
            <h1>Checking your session…</h1>
            <p role="status">Verifying administrator access.</p>
          </>
        ) : state === 'denied' ? (
          <>
            <h1>Administrator access required.</h1>
            <p>
              This account does not have access to the CMS. Administrator permissions must be
              granted from a trusted database session.
            </p>
            <button className="button" onClick={() => void repository!.client.auth.signOut()}>
              Sign out
            </button>
          </>
        ) : state === 'mfa' ? (
          <>
            <h1>Verify your identity.</h1>
            <p>Enter the code from your authenticator app.</p>
            <form onSubmit={verify}>
              <div className="field">
                <label htmlFor="code">Verification code</label>
                <input
                  id="code"
                  name="code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                />
              </div>
              <button className="button primary" disabled={busy || !factorId}>
                {busy ? 'Verifying…' : 'Verify code'}
              </button>
            </form>
            <button className="button" onClick={() => void repository!.client.auth.signOut()}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <span className="eyebrow">A space for your story</span>
            <h1>Welcome back.</h1>
            <p>Sign in to manage your portfolio.</p>
            <form onSubmit={signIn}>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  maxLength={254}
                />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  maxLength={256}
                />
              </div>
              <button className="button primary" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
                <Icon />
              </button>
            </form>
            <p className="small-text">
              Only authorized administrators can access published and draft content.
            </p>
          </>
        )}
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
      </div>
      <p className="auth-footer">Software Engineer portfolio · Content management</p>
    </main>
  );
}
