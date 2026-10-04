import type { Content, Project } from '@portfolio/types';
import { Image, Icon } from '@portfolio/ui';
import { projectTechnologies } from './ProjectCard';
import { ProjectCaseStudy } from './ProjectCaseStudy';

export function ProjectPage({ project, content }: { project: Project; content: Content }) {
  const mediaIds = content.project_media
    .filter((link) => link.project_id === project.id)
    .map((link) => link.media_id);
  const gallery = content.media_metadata.filter((media) => mediaIds.includes(media.id));
  const technologies = projectTechnologies(content, project.id);
  const nextProject =
    content.projects.length > 1
      ? content.projects[
          (content.projects.findIndex((item) => item.id === project.id) + 1) %
            content.projects.length
        ]
      : undefined;
  const chapters = [
    ['Overview', 'overview'],
    ['Problem', 'case-problem'],
    ...(project.engineering_approach ? [['Engineering approach', 'case-approach']] : []),
    ...(project.key_features.length ? [['Key features', 'case-features']] : []),
    ...(project.technical_challenges.length ? [['Technical challenges', 'case-challenges']] : []),
    ['Solution', 'case-solution'],
    ...(gallery.length ? [['Screenshots', 'screenshots']] : []),
    ...(project.outcome ? [['Outcome', 'outcome']] : []),
  ];
  return (
    <main id="main" className="container project-detail">
      <a href="/#projects" className="text-link detail-back">
        ← All projects
      </a>
      <header className="project-hero">
        <span className="eyebrow detail-eyebrow">
          Case study / {project.role || 'Software engineering'}
        </span>
        <h1 aria-label={project.title}>{project.title}</h1>
        <p className="detail-summary text-block">{project.summary}</p>
        <div className="actions detail-actions">
          {project.live_url && (
            <a
              className="button primary"
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open live project <Icon name="external" />
            </a>
          )}
          {project.repository_url && (
            <a
              className="button"
              href={project.repository_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View source code <Icon name="code" />
            </a>
          )}
        </div>
      </header>
      {project.image_url ? (
        <div className="detail-cover">
          <Image
            src={project.image_url}
            alt={project.image_alt}
            width={project.image_width}
            height={project.image_height}
            eager
          />
        </div>
      ) : (
        <div className="detail-cover detail-cover-placeholder">
          <Icon name="code" size={64} />
          <span>Project image not added yet</span>
        </div>
      )}
      <div className="case-study-layout">
        <aside className="case-study-index">
          <span className="eyebrow">In this project</span>
          <nav aria-label="Case study contents">
            {chapters.map(([label, id], index) => (
              <a key={id} href={`#${id}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="case-study-body">
          <section id="overview" className="detail-section">
            <span className="eyebrow">The project</span>
            <h2>Overview</h2>
            <p className="text-block">
              {project.description || 'A full project description has not been added yet.'}
            </p>
            {project.responsibilities.length > 0 && (
              <>
                <h3>My contribution</h3>
                <ul>
                  {project.responsibilities.map((value, index) => (
                    <li key={index}>{value}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
          <dl className="project-facts">
            <div>
              <dt>My role</dt>
              <dd>{project.role || 'Role not added yet'}</dd>
            </div>
            <div>
              <dt>Timeline</dt>
              <dd>
                {project.start_date ? (
                  <>
                    <time dateTime={project.start_date}>{project.start_date}</time> —{' '}
                    {project.end_date ? (
                      <time dateTime={project.end_date}>{project.end_date}</time>
                    ) : (
                      'Ongoing'
                    )}
                  </>
                ) : (
                  'Timeline not added yet'
                )}
              </dd>
            </div>
            <div>
              <dt>Tools used</dt>
              <dd>
                {technologies.length ? (
                  <div className="tag-row">
                    {technologies.map((technology) => (
                      <span className="badge" key={technology.id}>
                        {technology.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  'Tools not listed yet'
                )}
              </dd>
            </div>
          </dl>
          <ProjectCaseStudy project={project} headingLevel={2} full />
        </div>
      </div>
      {gallery.length > 0 && (
        <section id="screenshots" className="detail-gallery">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A closer look</span>
              <h2>
                Project screenshots<span className="accent-dot">.</span>
              </h2>
            </div>
          </div>
          <div className="project-gallery">
            {gallery.map((media) => (
              <figure key={media.id}>
                <Image src={media.url} alt={media.alt} width={media.width} height={media.height} />
                <figcaption>{media.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      {project.outcome && (
        <section id="outcome" className="detail-section detail-outcome">
          <span className="eyebrow">The result</span>
          <h2>Outcome</h2>
          <p className="text-block">{project.outcome}</p>
        </section>
      )}
      <section className="next-project">
        <span className="eyebrow">{nextProject ? 'Next project' : 'Continue exploring'}</span>
        <h2>
          <a href={nextProject ? `/projects/${nextProject.slug}` : '/#projects'}>
            {nextProject?.title ?? 'All projects'}
            <Icon name="arrow" size={48} />
          </a>
        </h2>
      </section>
    </main>
  );
}
