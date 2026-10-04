import { useState } from 'react';
import type { Content } from '@portfolio/types';
import { ImageUpload } from './ImageUpload';

export function MediaUpload({ onUploaded }: { onUploaded: () => Promise<void> }) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<Content['media_metadata'][number]>();
  return (
    <section className="upload-card" aria-labelledby="media-upload-title">
      <h2 id="media-upload-title">Add to Media Library</h2>
      <p className="small-text">
        Upload images for your portfolio and project galleries. You can also upload directly while
        editing a profile, project, work experience, or website settings.
      </p>
      <ImageUpload
        description={description}
        onDescriptionChange={setDescription}
        image={image}
        onUploaded={(media) => {
          setImage(media);
          setDescription('');
          void onUploaded();
        }}
      />
      {image && (
        <p className="notice text-block" role="status">
          Saved to Media Library as a draft. To reuse it, copy this image URL: {image.url}
        </p>
      )}
    </section>
  );
}
