import type { Content, Project } from '@portfolio/types';
import { Image, Icon } from '@portfolio/ui';
import { projectTechnologies } from './ProjectCard';
import { ProjectCaseStudy } from './ProjectCaseStudy';
export function ProjectPage({ project, content }: { project: Project; content: Content }) {
  const mediaIds = content.project_media
    .filter((link) => link.project_id === project.id)
    .map((link) => link.media_id);
  const gallery = content.media_metadata.filter((media) => mediaIds.includes(media.id));
  return (
    <main id="main" className="container project-detail">
      <a href="/#projects" className="text-link">
        ← All projects
      </a>
      <span className="eyebrow detail-eyebrow">
        Project / {project.role || 'Software engineering'}
      </span>
      <h1>{project.title}</h1>
      <p className="detail-summary">{project.summary}</p>
      <div className="tag-row">
        {projectTechnologies(content, project.id).map((technology) => (
          <span className="badge" key={technology.id}>
            {technology.name}
          </span>
        ))}
      </div>
      <div className="actions detail-actions">
        {project.live_url && (
          <a
            className="button primary"
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit live project <Icon name="external" />
          </a>
        )}
        {project.repository_url && (
          <a
            className="button"
            href={project.repository_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View repository <Icon name="code" />
          </a>
        )}
      </div>
      {project.image_url && (
        <div className="detail-cover">
          <Image
            src={project.image_url}
            alt={project.image_alt}
            width={project.image_width}
            height={project.image_height}
            eager
          />
        </div>
      )}
      <section className="detail-section">
        <h2>Overview</h2>
        <p className="text-block">
          {project.description || 'Detailed project information will be added soon.'}
        </p>
      </section>
      {project.role && (
        <section className="detail-section">
          <h2>My role</h2>
          <p>{project.role}</p>
          {project.start_date && (
            <p>
              {project.start_date} — {project.end_date || 'Ongoing'}
            </p>
          )}
        </section>
      )}
      {project.responsibilities.length > 0 && (
        <section className="detail-section">
          <h2>Responsibilities</h2>
          <ul>
            {project.responsibilities.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
        </section>
      )}
      <ProjectCaseStudy project={project} headingLevel={2} />
      {gallery.length > 0 && (
        <section className="detail-section">
          <h2>Project gallery</h2>
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
    </main>
  );
}
