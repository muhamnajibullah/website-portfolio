import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Content, ContentRecord, TableName } from '@portfolio/types';
import { emptyContent } from '@portfolio/validation';
import { Dialog, EmptyState, Icon, ThemeToggle } from '@portfolio/ui';
import { repository } from '../../services/client';
import { RecordEditor, defaultRecord, recordLabel } from '../content/RecordEditor';
import { MediaUpload } from '../media/MediaUpload';
import { MfaSettings } from '../auth/MfaSettings';

const sections: { table: TableName; label: string }[] = [
  { table: 'profiles', label: 'Profile' },
  { table: 'projects', label: 'Projects' },
  { table: 'work_experiences', label: 'Work experiences' },
  { table: 'technology_categories', label: 'Tool categories' },
  { table: 'technologies', label: 'Tools and technologies' },
  { table: 'interactive_points', label: '3D destinations' },
  { table: 'media_metadata', label: 'Media Library' },
  { table: 'project_media', label: 'Project galleries' },
  { table: 'project_technologies', label: 'Project tools' },
  { table: 'experience_technologies', label: 'Experience tools' },
  { table: 'social_links', label: 'Social links' },
  { table: 'site_settings', label: 'Website settings' },
];
export function Dashboard() {
  const [active, setActive] = useState<TableName | 'dashboard'>('dashboard');
  const [record, setRecord] = useState<Record<string, unknown> | null>(null),
    [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [deletion, setDeletion] = useState<{ table: TableName; item: ContentRecord } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-content'],
    queryFn: () => repository!.load(false),
    retry: 1,
  });
  const data: Content = query.data ?? emptyContent;
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-content'] });
  };
  const save = useMutation({
    mutationFn: (input: unknown) => repository!.save(active as TableName, input),
    onSuccess: async () => {
      setRecord(null);
      await refresh();
    },
  });
  const action = async (table: TableName, item: ContentRecord, status: ContentRecord['status']) => {
    setError('');
    try {
      await repository!.save(table, { ...item, status });
      await refresh();
    } catch {
      setError('Could not update this item. Check your access and linked items, then try again.');
    }
  };
  const remove = async (table: TableName, item: ContentRecord) => {
    setDeleteError('');
    setDeleting(true);
    try {
      await repository!.remove(table, item.id);
      setDeletion(null);
      await refresh();
    } catch {
      setDeleteError(
        'Could not delete this item. Check your access and any links to it, then try again.',
      );
    } finally {
      setDeleting(false);
    }
  };
  const records =
    active === 'dashboard'
      ? []
      : data[active].filter((item) => filter === 'all' || item.status === filter);
  return (
    <div className="cms-layout">
      <aside className="cms-sidebar">
        <a href="/" className="brand">
          <span className="brand-icon">
            <Icon name="code" />
          </span>
          Portfolio CMS
        </a>
        <span className="eyebrow sidebar-label">Your workspace</span>
        <nav aria-label="CMS sections">
          <button
            className={active === 'dashboard' ? 'selected' : ''}
            onClick={() => setActive('dashboard')}
          >
            Dashboard
          </button>
          {sections.map((section) => (
            <button
              key={section.table}
              className={active === section.table ? 'selected' : ''}
              onClick={() => {
                setActive(section.table);
                setFilter('all');
                setError('');
              }}
            >
              {section.label}
              <span>{data[section.table].length}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a
            className="button"
            href={import.meta.env.VITE_SITE_URL || 'http://localhost:5173'}
            target="_blank"
            rel="noopener noreferrer"
          >
            View portfolio <Icon name="external" size={16} />
          </a>
          <button
            className="button ghost"
            onClick={async () => {
              await repository!.client.auth.signOut();
              queryClient.clear();
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="cms-main">
        <header className="cms-top">
          <span className="eyebrow">Content management</span>
          <div className="actions cms-top-actions">
            <span className="badge accent">Administrator</span>
            <ThemeToggle />
          </div>
        </header>
        <div className="cms-heading">
          <div>
            <span className="eyebrow">Software Engineer portfolio</span>
            <h1>
              {active === 'dashboard'
                ? 'Manage your portfolio.'
                : sections.find((section) => section.table === active)?.label}
            </h1>
            <p>
              {active === 'dashboard'
                ? 'Add your profile, projects, work experience, and images from this dashboard.'
                : 'Add or edit items here. Choose Publish when they are ready to appear on your portfolio.'}
            </p>
          </div>
          {active !== 'dashboard' && active !== 'media_metadata' && (
            <button className="button primary" onClick={() => setRecord(defaultRecord(active))}>
              Add item <Icon name="plus" />
            </button>
          )}
        </div>
        {query.isPending ? (
          <p className="notice" role="status">
            Loading your content…
          </p>
        ) : query.isError ? (
          <div className="notice error" role="alert">
            Unable to load content.{' '}
            <button className="button" onClick={() => void query.refetch()}>
              Try again
            </button>
          </div>
        ) : active === 'dashboard' ? (
          <>
            <div className="dashboard-grid">
              {(['projects', 'work_experiences', 'technologies', 'media_metadata'] as const).map(
                (table) => (
                  <button className="dashboard-stat" key={table} onClick={() => setActive(table)}>
                    <span>{sections.find((section) => section.table === table)?.label}</span>
                    <strong>{data[table].length}</strong>
                    <small>
                      {data[table].filter((item) => item.status === 'published').length} published
                    </small>
                    <Icon />
                  </button>
                ),
              )}
            </div>
            <div className="notice">
              Published changes appear on the portfolio after it refreshes. Redeploy the portfolio
              after adding a new project so its page and search-engine information are updated too.
            </div>
            <div className="dashboard-next">
              <h2>Set up your portfolio</h2>
              <p>
                1. Add your profile and photo.
                <br />
                2. Add your tools and their categories.
                <br />
                3. Publish your projects and experiences.
                <br />
                4. Link tools and gallery images to each project. Add 3D destinations if needed.
                <br />
                5. Add contact links and website settings.
              </p>
              <button className="button primary" onClick={() => setActive('profiles')}>
                Start with your profile <Icon />
              </button>
            </div>
          </>
        ) : (
          <>
            {active === 'media_metadata' && <MediaUpload onUploaded={refresh} />}
            <div className="record-toolbar">
              <label htmlFor="publication-filter">Status</label>
              <select
                id="publication-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                {['all', 'draft', 'published', 'archived'].map((value) => (
                  <option key={value} value={value}>
                    {value === 'all' ? 'All items' : value[0]!.toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </select>
              <span>{records.length} items</span>
            </div>
            {records.length ? (
              <div className="record-list">
                {records.map((item) => (
                  <article className="record-row" key={item.id}>
                    <div>
                      <span className={`badge ${item.status === 'published' ? 'accent' : ''}`}>
                        {item.status}
                      </span>
                      <h2>{recordLabel(item)}</h2>
                      <p className="small-text">
                        Display order: {item.sort_order} ·{' '}
                        <span className="record-id">{item.id}</span>
                      </p>
                      {active === 'media_metadata' && 'url' in item && (
                        <a
                          href={String(item.url)}
                          className="link small-text"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open image
                        </a>
                      )}
                    </div>
                    <div className="actions">
                      <button className="button" onClick={() => setRecord({ ...item })}>
                        Edit item
                      </button>
                      <button
                        className="button"
                        onClick={() =>
                          void action(
                            active,
                            item,
                            item.status === 'published' ? 'draft' : 'published',
                          )
                        }
                      >
                        {item.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      {item.status !== 'archived' && (
                        <button
                          className="button"
                          onClick={() => void action(active, item, 'archived')}
                        >
                          Archive
                        </button>
                      )}
                      <button
                        className="button danger"
                        onClick={() => {
                          setDeleteError('');
                          setDeletion({ table: active, item });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="No items to show">
                This section is empty, or no items match the selected status.
              </EmptyState>
            )}
          </>
        )}
        {active === 'dashboard' && <MfaSettings />}
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
      </main>
      {record && active !== 'dashboard' && (
        <RecordEditor
          key={record.id as string}
          table={active}
          record={record}
          content={data}
          busy={save.isPending}
          onSave={(input) => save.mutateAsync(input)}
          onClose={() => setRecord(null)}
          onMediaUploaded={refresh}
        />
      )}
      {deletion && (
        <Dialog title="Delete this item?" dismissible={!deleting} onClose={() => setDeletion(null)}>
          <p>
            Delete <strong>{recordLabel(deletion.item)}</strong>? This cannot be undone. Uploaded
            image files are kept.
          </p>
          {deleteError && (
            <p className="notice error" role="alert">
              {deleteError}
            </p>
          )}
          <div className="actions">
            <button className="button" disabled={deleting} onClick={() => setDeletion(null)}>
              Cancel
            </button>
            <button
              className="button danger"
              disabled={deleting}
              onClick={() => void remove(deletion.table, deletion.item)}
            >
              {deleting ? 'Deleting…' : 'Delete item'}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
