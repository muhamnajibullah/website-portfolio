import { useState, type FormEvent } from 'react';
import { repository } from '../../services/client';
export function MediaUpload({ onUploaded }: { onUploaded: () => Promise<void> }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    const form = event.currentTarget,
      data = new FormData(form),
      file = data.get('image');
    try {
      if (!(file instanceof File) || !file.size)
        throw new Error('Select an image before uploading.');
      const url = await repository!.upload(file, String(data.get('alt') ?? ''));
      setMessage(`Image uploaded. Copy this URL to use it in your profile or project: ${url}`);
      form.reset();
      await onUploaded();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Could not upload the image. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="upload-card" onSubmit={upload}>
      <h2>Upload an image</h2>
      <p className="small-text">
        Choose a PNG, JPEG, or WebP image up to 5 MB. Anyone with the image link can view it, even
        while the library item is a draft.
      </p>
      <div className="field">
        <label htmlFor="image">Image</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="alt">Image description (alt text)</label>
        <input id="alt" name="alt" required maxLength={300} />
      </div>
      <button className="button primary" disabled={busy}>
        {busy ? 'Uploading…' : 'Upload image'}
      </button>
      {message && (
        <p className="notice text-block" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
