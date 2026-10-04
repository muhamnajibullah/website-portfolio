import { useState, type FormEvent } from 'react';
import type { Content, ContentRecord, TableName } from '@portfolio/types';
import { tableSchemas } from '@portfolio/validation';
import { Dialog, Icon } from '@portfolio/ui';
import { pageMetadata } from '@portfolio/seo';
import { ImageUpload } from '../media/ImageUpload';

export function recordLabel(record: ContentRecord | Record<string, unknown>) {
  for (const key of ['name', 'title', 'organization', 'label', 'site_name', 'alt', 'path']) {
    if (
      key in record &&
      typeof record[key as keyof typeof record] === 'string' &&
      String(record[key as keyof typeof record]).trim()
    )
      return String(record[key as keyof typeof record]);
  }
  return record.id as string;
}
export function defaultRecord(table: TableName): Record<string, unknown> {
  const required: Record<string, unknown> = {
    id: crypto.randomUUID(),
    name: '',
    title: table === 'profiles' ? 'Software Engineer' : '',
    slug: '',
    organization: '',
    position: '',
    category_id: '',
    label: '',
    url: '',
    site_name: '',
    x: 0,
    z: 0,
    path: '',
    alt: '',
    width: 1200,
    height: 800,
    mime_type: 'image/webp',
    size_bytes: 1,
    project_id: '',
    technology_id: '',
    experience_id: '',
    media_id: '',
  };
  const output: Record<string, unknown> = {};
  for (const [key, schema] of Object.entries(tableSchemas[table].shape)) {
    const result = schema.safeParse(undefined);
    output[key] = result.success ? result.data : (required[key] ?? '');
  }
  return output;
}
const referenceTables: Record<string, TableName> = {
  category_id: 'technology_categories',
  project_id: 'projects',
  experience_id: 'work_experiences',
  technology_id: 'technologies',
  media_id: 'media_metadata',
};
const multiline = new Set([
  'description',
  'about',
  'intro',
  'summary',
  'contact_text',
  'responsibilities',
  'challenges',
  'solutions',
  'engineering_approach',
  'key_features',
  'technical_challenges',
  'outcome',
]);
const fieldLabels: Record<string, string> = {
  slug: 'Project URL name',
  summary: 'Short description',
  description: 'Full description',
  intro: 'Short introduction',
  about: 'About you',
  challenges: 'Project problems',
  solutions: 'Solutions provided',
  engineering_approach: 'Engineering approach',
  key_features: 'Key features',
  technical_challenges: 'Technical challenges',
  outcome: 'Project outcome',
  image_url: 'Image URL',
  image_alt: 'Image description (alt text)',
  image_width: 'Image width (pixels)',
  image_height: 'Image height (pixels)',
  live_url: 'Live project URL',
  repository_url: 'Source code URL',
  sort_order: 'Display order',
  featured: 'Show in featured projects',
  project_id: 'Project',
  experience_id: 'Work experience',
  category_id: 'Tool category',
  technology_id: 'Tool',
  media_id: 'Gallery image',
  related_project_ids: 'Related projects',
  alt: 'Image description (alt text)',
  width: 'Image width (pixels)',
  height: 'Image height (pixels)',
  url: 'URL',
  path: 'Image storage path',
  mime_type: 'Image file type',
  size_bytes: 'File size (bytes)',
  marker_type: 'Destination type',
  x: 'Horizontal position (X)',
  y: 'Height in the 3D world (Y)',
  z: 'Depth position (Z)',
  discovery_radius: 'Marker visibility distance',
  focus_radius: 'Preview distance',
  interaction_radius: 'Open details distance',
  github_url: 'GitHub URL',
  linkedin_url: 'LinkedIn URL',
  site_url: 'Portfolio website URL',
  og_image_url: 'Social sharing image URL',
  contact_heading: 'Contact section heading',
  contact_text: 'Contact section text',
};
const humanize = (key: string) =>
  fieldLabels[key] ?? key.replace(/_/g, ' ').replace(/^./, (value) => value.toUpperCase());

export function RecordEditor({
  table,
  record,
  content,
  onSave,
  onClose,
  onMediaUploaded,
  busy,
}: {
  table: TableName;
  record: Record<string, unknown>;
  content: Content;
  onSave: (value: unknown) => Promise<void>;
  onClose: () => void;
  onMediaUploaded: () => Promise<void>;
  busy: boolean;
}) {
  const [value, setValue] = useState(record),
    [error, setError] = useState(''),
    [preview, setPreview] = useState(false),
    [uploading, setUploading] = useState(false),
    [sharingImageDescription, setSharingImageDescription] = useState('');
  const imageField =
    'image_url' in value ? 'image_url' : 'og_image_url' in value ? 'og_image_url' : null;
  const change = (key: string, data: unknown) =>
    setValue((current) => ({ ...current, [key]: data }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || uploading) return;
    setError('');
    const result = tableSchemas[table].safeParse(value);
    if (!result.success) {
      setError(
        result.error.issues
          .map((issue) => {
            const key = String(issue.path[0] ?? 'Item');
            let message = issue.message;
            if (referenceTables[key]) message = 'Choose an item from the list.';
            else if (key === 'slug')
              message = 'Use lowercase letters, numbers, and hyphens (up to 120 characters).';
            else if (key.includes('url'))
              message = 'Enter a full URL starting with https:// or http://.';
            else if (issue.code === 'too_small' && issue.origin === 'string')
              message = 'This field is required.';
            else if (issue.code === 'too_small' && issue.origin === 'number')
              message = `Enter a number of at least ${issue.minimum}.`;
            else if (issue.code === 'too_big')
              message =
                issue.origin === 'number'
                  ? `Enter a number no greater than ${issue.maximum}.`
                  : `Use no more than ${issue.maximum} ${issue.origin === 'string' ? 'characters' : 'entries'}.`;
            else if (issue.code === 'invalid_type') message = 'Enter a valid value.';
            return `${humanize(key)}: ${message}`;
          })
          .join(' · '),
      );
      return;
    }
    try {
      await onSave(result.data);
    } catch {
      setError('Could not save this item. Check the linked items and your access, then try again.');
    }
  }
  const previewTitle =
    table === 'projects'
      ? pageMetadata(
          content,
          tableSchemas.projects.safeParse(value).success
            ? tableSchemas.projects.parse(value)
            : undefined,
        ).title
      : String(
          value.title || value.name || value.organization || value.site_name || 'Content preview',
        );
  return (
    <Dialog
      title={recordLabel(value) === value.id ? 'Add item' : recordLabel(value)}
      onClose={onClose}
      dismissible={!busy && !uploading}
      className="editor-dialog"
    >
      <div className="editor-tabs">
        <button
          className={`button ${!preview ? 'primary' : ''}`}
          type="button"
          disabled={busy || uploading}
          onClick={() => setPreview(false)}
        >
          Edit content
        </button>
        <button
          className={`button ${preview ? 'primary' : ''}`}
          type="button"
          disabled={busy || uploading}
          onClick={() => setPreview(true)}
        >
          Preview draft
        </button>
      </div>
      {preview ? (
        <article className="draft-preview">
          <span className="badge">ADMIN PREVIEW · {String(value.status)}</span>
          <h3>{previewTitle}</h3>
          {Object.entries(value)
            .filter(
              ([key, data]) =>
                !['id', 'status', 'sort_order', 'title'].includes(key) &&
                ((typeof data === 'string' && Boolean(data)) ||
                  (Array.isArray(data) && data.length > 0)),
            )
            .map(([key, data]) => (
              <div key={key}>
                <h4>{humanize(key)}</h4>
                {Array.isArray(data) ? (
                  <ul>
                    {data.map((entry, index) => (
                      <li key={index}>{String(entry)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-block">{String(data)}</p>
                )}
              </div>
            ))}
          <p className="small-text">
            This preview includes unsaved changes. Only administrators can view drafts.
          </p>
        </article>
      ) : (
        <form onSubmit={submit}>
          <div className="editor-fields">
            {Object.entries(value)
              .filter(
                ([key]) => key !== 'id' && !(imageField === 'image_url' && key === 'image_alt'),
              )
              .map(([key, data]) => {
                const id = `field-${key}`,
                  reference = referenceTables[key];
                return (
                  <div
                    className={`field ${multiline.has(key) || key === imageField ? 'wide' : ''}`}
                    key={key}
                  >
                    <label htmlFor={id}>{humanize(key)}</label>
                    {key === 'status' ? (
                      <select
                        id={id}
                        value={String(data)}
                        onChange={(event) => change(key, event.target.value)}
                      >
                        {['draft', 'published', 'archived'].map((status) => (
                          <option key={status} value={status}>
                            {humanize(status)}
                          </option>
                        ))}
                      </select>
                    ) : key === 'marker_type' ? (
                      <select
                        id={id}
                        value={String(data)}
                        onChange={(event) => change(key, event.target.value)}
                      >
                        <option value="project">Project</option>
                        <option value="experience">Work experience</option>
                      </select>
                    ) : reference ? (
                      <select
                        id={id}
                        value={String(data ?? '')}
                        onChange={(event) =>
                          change(
                            key,
                            event.target.value || (table === 'interactive_points' ? null : ''),
                          )
                        }
                      >
                        <option value="">Choose an item</option>
                        {content[reference].map((item) => (
                          <option key={item.id} value={item.id}>
                            {recordLabel(item)} ({item.status})
                          </option>
                        ))}
                      </select>
                    ) : key === 'related_project_ids' ? (
                      <select
                        id={id}
                        multiple
                        value={data as string[]}
                        onChange={(event) =>
                          change(
                            key,
                            Array.from(event.target.selectedOptions).map((option) => option.value),
                          )
                        }
                      >
                        {content.projects.map((project) => (
                          <option value={project.id} key={project.id}>
                            {project.title}
                          </option>
                        ))}
                      </select>
                    ) : typeof data === 'boolean' ? (
                      <input
                        id={id}
                        type="checkbox"
                        checked={data}
                        onChange={(event) => change(key, event.target.checked)}
                      />
                    ) : typeof data === 'number' ? (
                      <input
                        id={id}
                        type="number"
                        value={Number.isNaN(data) ? '' : data}
                        step={
                          [
                            'x',
                            'y',
                            'z',
                            'rotation',
                            'discovery_radius',
                            'focus_radius',
                            'interaction_radius',
                          ].includes(key)
                            ? '.1'
                            : '1'
                        }
                        onChange={(event) =>
                          change(key, event.target.value === '' ? NaN : Number(event.target.value))
                        }
                      />
                    ) : Array.isArray(data) || multiline.has(key) ? (
                      <textarea
                        id={id}
                        value={Array.isArray(data) ? data.join('\n') : String(data ?? '')}
                        maxLength={20000}
                        onChange={(event) =>
                          change(
                            key,
                            Array.isArray(data)
                              ? event.target.value.split('\n').filter(Boolean)
                              : event.target.value,
                          )
                        }
                      />
                    ) : (
                      <input
                        id={id}
                        value={String(data ?? '')}
                        type={key.endsWith('_date') ? 'date' : key === 'email' ? 'email' : 'text'}
                        readOnly={
                          (table === 'profiles' && key === 'title') ||
                          (table === 'media_metadata' &&
                            ['path', 'mime_type', 'size_bytes', 'width', 'height', 'url'].includes(
                              key,
                            ))
                        }
                        maxLength={key.includes('url') ? 2048 : 5000}
                        onChange={(event) => change(key, event.target.value)}
                      />
                    )}
                    {Array.isArray(data) && key !== 'related_project_ids' && (
                      <small>One entry per line.</small>
                    )}
                    {key === 'sort_order' && (
                      <small>Smaller numbers appear first on the portfolio.</small>
                    )}
                    {key === 'slug' && (
                      <small>
                        Use lowercase letters, numbers, and hyphens, for example: my-project.
                      </small>
                    )}
                    {key === 'related_project_ids' && (
                      <small>
                        Hold Ctrl on Windows or Command on Mac to select more than one project.
                      </small>
                    )}
                    {key === imageField && (
                      <>
                        <small>
                          Upload below to fill this URL automatically, or paste an existing image
                          URL. Save changes to attach the image.
                        </small>
                        <ImageUpload
                          image={{
                            url: String(data ?? ''),
                            alt:
                              imageField === 'image_url'
                                ? String(value.image_alt ?? '')
                                : sharingImageDescription,
                            width: Number(value.image_width ?? 1200),
                            height: Number(value.image_height ?? 630),
                          }}
                          description={
                            imageField === 'image_url'
                              ? String(value.image_alt ?? '')
                              : sharingImageDescription
                          }
                          onDescriptionChange={(description) =>
                            imageField === 'image_url'
                              ? change('image_alt', description)
                              : setSharingImageDescription(description)
                          }
                          disabled={busy}
                          onBusyChange={setUploading}
                          onUploaded={(media) => {
                            setValue((current) => ({
                              ...current,
                              [imageField]: media.url,
                              ...(imageField === 'image_url'
                                ? {
                                    image_alt: media.alt,
                                    image_width: media.width,
                                    image_height: media.height,
                                  }
                                : {}),
                            }));
                            void onMediaUploaded();
                          }}
                        />
                      </>
                    )}
                    {key === 'status' && (
                      <small>
                        Published items appear on the portfolio. For a linked item, publish its
                        project, category, or experience too.
                      </small>
                    )}
                  </div>
                );
              })}
          </div>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <div className="editor-save">
            <button className="button primary" disabled={busy || uploading}>
              {busy ? 'Saving…' : 'Save changes'}
              <Icon name="check" />
            </button>
            <button type="button" className="button" onClick={onClose} disabled={busy || uploading}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
