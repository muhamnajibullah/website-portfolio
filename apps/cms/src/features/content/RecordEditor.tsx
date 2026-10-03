import { useState, type FormEvent } from 'react';
import type { Content, ContentRecord, TableName } from '@portfolio/types';
import { tableSchemas } from '@portfolio/validation';
import { Dialog, Icon } from '@portfolio/ui';
import { pageMetadata } from '@portfolio/seo';

export function recordLabel(record: ContentRecord | Record<string, unknown>) {
  for (const key of ['name', 'title', 'organization', 'label', 'site_name', 'alt', 'path']) {
    if (key in record && typeof record[key as keyof typeof record] === 'string')
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
]);
const humanize = (key: string) =>
  key.replace(/_/g, ' ').replace(/^./, (value) => value.toUpperCase());

export function RecordEditor({
  table,
  record,
  content,
  onSave,
  onClose,
  busy,
}: {
  table: TableName;
  record: Record<string, unknown>;
  content: Content;
  onSave: (value: unknown) => Promise<void>;
  onClose: () => void;
  busy: boolean;
}) {
  const [value, setValue] = useState(record),
    [error, setError] = useState(''),
    [preview, setPreview] = useState(false);
  const change = (key: string, data: unknown) =>
    setValue((current) => ({ ...current, [key]: data }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const result = tableSchemas[table].safeParse(value);
    if (!result.success) {
      setError(
        result.error.issues
          .map((issue) => `${issue.path.join('.') || 'Record'}: ${issue.message}`)
          .join(' · '),
      );
      return;
    }
    try {
      await onSave(result.data);
    } catch {
      setError('Save failed. Check the linked records and your permissions, then try again.');
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
    <Dialog title={recordLabel(value) || 'New record'} onClose={onClose} className="editor-dialog">
      <div className="editor-tabs">
        <button
          className={`button ${!preview ? 'primary' : ''}`}
          type="button"
          onClick={() => setPreview(false)}
        >
          Edit content
        </button>
        <button
          className={`button ${preview ? 'primary' : ''}`}
          type="button"
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
                typeof data === 'string' &&
                Boolean(data),
            )
            .map(([key, data]) => (
              <div key={key}>
                <h4>{humanize(key)}</h4>
                <p className="text-block">{String(data)}</p>
              </div>
            ))}
          <p className="small-text">
            Preview reflects unsaved form values. Drafts remain protected by database policies.
          </p>
        </article>
      ) : (
        <form onSubmit={submit}>
          <div className="editor-fields">
            {Object.entries(value)
              .filter(([key]) => key !== 'id')
              .map(([key, data]) => {
                const id = `field-${key}`,
                  reference = referenceTables[key];
                return (
                  <div className={`field ${multiline.has(key) ? 'wide' : ''}`} key={key}>
                    <label htmlFor={id}>{humanize(key)}</label>
                    {key === 'status' ? (
                      <select
                        id={id}
                        value={String(data)}
                        onChange={(event) => change(key, event.target.value)}
                      >
                        {['draft', 'published', 'archived'].map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    ) : key === 'marker_type' ? (
                      <select
                        id={id}
                        value={String(data)}
                        onChange={(event) => change(key, event.target.value)}
                      >
                        <option>project</option>
                        <option>experience</option>
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
                        <option value="">Choose a record</option>
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
                    {key === 'sort_order' && <small>Lower values appear first.</small>}
                    {key === 'image_url' && (
                      <small>
                        Use a public image URL from Media Library. Provide descriptive image alt
                        text.
                      </small>
                    )}
                    {key === 'status' && (
                      <small>
                        Published records are public. Linked parent records must also be published.
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
            <button className="button primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
              <Icon name="check" />
            </button>
            <button type="button" className="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
