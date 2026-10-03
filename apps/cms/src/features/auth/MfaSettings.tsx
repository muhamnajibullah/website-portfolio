import { useState, type FormEvent } from 'react';
import { Dialog } from '@portfolio/ui';
import { repository } from '../../services/client';
export function MfaSettings() {
  const [enrollment, setEnrollment] = useState<{ id: string; qr: string; secret: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function enroll() {
    setBusy(true);
    setError('');
    try {
      const { data: factors, error: listError } = await repository!.client.auth.mfa.listFactors();
      if (listError) throw listError;
      if (factors.totp.some((factor) => factor.status === 'verified')) {
        setError('An authenticator is already enabled on your account.');
        return;
      }
      // Clean unfinished enrollment before creating another factor for this account.
      for (const factor of factors.all.filter((factor) => factor.status === 'unverified'))
        await repository!.client.auth.mfa.unenroll({ factorId: factor.id });
      const { data, error } = await repository!.client.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Portfolio CMS',
        friendlyName: 'Portfolio CMS authenticator',
      });
      if (error) throw error;
      setEnrollment({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    } catch {
      setError('Authenticator setup could not be started. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollment) return;
    setBusy(true);
    setError('');
    try {
      const { error } = await repository!.client.auth.mfa.challengeAndVerify({
        factorId: enrollment.id,
        code: String(new FormData(event.currentTarget).get('code')),
      });
      if (error) throw error;
      setEnrollment(null);
    } catch {
      setError('Unable to verify. Check your authenticator code.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mfa-card">
      <div>
        <h2>Protect your content.</h2>
        <p className="small-text">
          Enable an authenticator for a second layer of protection. Database policies require a
          verified MFA session once a factor is enrolled.
        </p>
      </div>
      <button className="button" onClick={() => void enroll()} disabled={busy}>
        Set up authenticator
      </button>
      {error && !enrollment && (
        <p className="notice" role="status">
          {error}
        </p>
      )}
      {enrollment && (
        <Dialog title="Set up your authenticator" onClose={() => setEnrollment(null)}>
          <p>Scan this code in your authenticator app, then enter its six-digit code.</p>
          <img
            className="mfa-qr"
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(enrollment.qr)}`}
            width={240}
            height={240}
            alt="Authenticator enrollment QR code"
          />
          <details>
            <summary>Can’t scan the QR code?</summary>
            <p className="text-block">Setup key: {enrollment.secret}</p>
          </details>
          <form onSubmit={verify}>
            <div className="field">
              <label htmlFor="enrollment-code">Authenticator code</label>
              <input
                id="enrollment-code"
                name="code"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
              />
            </div>
            {error && (
              <p className="notice error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary" disabled={busy}>
              {busy ? 'Verifying…' : 'Enable authenticator'}
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
