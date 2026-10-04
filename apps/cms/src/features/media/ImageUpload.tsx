import { useId, useRef, useState } from 'react';
import type { Content } from '@portfolio/types';
import { tableSchemas } from '@portfolio/validation';
import { Icon } from '@portfolio/ui';
import { repository } from '../../services/client';

type Media = Content['media_metadata'][number];

export function ImageUpload({
  description,
  onDescriptionChange,
  onUploaded,
  image,
  disabled = false,
  onBusyChange,
}: {
  description: string;
  onDescriptionChange: (description: string) => void;
  onUploaded: (media: Media) => void;
  image?: Pick<Media, 'url' | 'alt' | 'width' | 'height'>;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [previewError, setPreviewError] = useState('');
  const preview = image && tableSchemas.media_metadata.shape.url.safeParse(image.url).success;

  async function upload() {
    if (busy || disabled) return;
    setError('');
    setMessage('');
    if (!file) {
      setError('Choose an image file first.');
      input.current?.focus();
      return;
    }
    setBusy(true);
    onBusyChange?.(true);
    try {
      if (!repository) throw new Error('Connect Supabase before uploading an image.');
      const media = await repository.upload(file, description);
      onUploaded(media);
      setMessage('Image uploaded and added to Media Library.');
      setFile(null);
      if (input.current) input.current.value = '';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not upload the image. Try again.');
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return (
    <div className="image-upload">
      {preview && (
        <figure className="image-upload-preview">
          {previewError === image.url ? (
            <p className="small-text" role="status">
              The image preview could not load. Check the image URL or upload another image.
            </p>
          ) : (
            <img
              src={image.url}
              alt={image.alt}
              width={Number.isFinite(image.width) && image.width > 0 ? image.width : 1200}
              height={Number.isFinite(image.height) && image.height > 0 ? image.height : 800}
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setPreviewError(image.url)}
            />
          )}
        </figure>
      )}
      <fieldset disabled={disabled || busy}>
        <legend>Upload an image</legend>
        <p className="small-text" id={`${id}-help`}>
          PNG, JPEG, or WebP, up to 5 MB. Uploaded images are publicly accessible.
        </p>
        <div className="field">
          <label htmlFor={`${id}-file`}>Image file</label>
          <input
            ref={input}
            id={`${id}-file`}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-describedby={`${id}-help`}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setError('');
              setMessage('');
            }}
          />
        </div>
        <div className="field">
          <label htmlFor={`${id}-alt`}>Image description (alt text)</label>
          <input
            id={`${id}-alt`}
            value={description}
            maxLength={300}
            onChange={(event) => onDescriptionChange(event.target.value)}
            aria-describedby={`${id}-alt-help`}
          />
          <small id={`${id}-alt-help`}>
            Describe what the image shows. Required for uploading.
          </small>
        </div>
        <button type="button" className="button primary" onClick={() => void upload()}>
          <Icon name="upload" />
          {busy ? 'Uploading…' : 'Upload image'}
        </button>
      </fieldset>
      <p className="small-text upload-status" role="status">
        {busy ? 'Uploading your image…' : message}
      </p>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
