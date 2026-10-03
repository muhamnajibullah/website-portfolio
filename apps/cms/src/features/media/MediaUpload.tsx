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
      if (!(file instanceof File) || !file.size) throw new Error('Choose an image first.');
      const url = await repository!.upload(file, String(data.get('alt') ?? ''));
      setMessage(`Uploaded. Public URL: ${url}`);
      form.reset();
      await onUploaded();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="upload-card" onSubmit={upload}>
      <h2>Upload public media</h2>
      <p className="small-text">
        PNG, JPEG or WebP · Maximum 5 MB · Public assets only. Uploaded images are publicly
        accessible even when their metadata is a draft.
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
        <label htmlFor="alt">Image description</label>
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
