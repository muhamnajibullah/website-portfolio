import type { Content, Project } from '@portfolio/types';
import { Icon, Image } from '@portfolio/ui';
import { ProjectCaseStudy } from './ProjectCaseStudy';
export function projectTechnologies(content: Content, id: string) {
  const ids = content.project_technologies
    .filter((link) => link.project_id === id)
    .map((link) => link.technology_id);
  return content.technologies.filter((technology) => ids.includes(technology.id));
}
export function ProjectCard({
  project,
  content,
  index,
}: {
  project: Project;
  content: Content;
  index: number;
}) {
  const technologies = projectTechnologies(content, project.id);
  return (
    <article className="project-card">
      <div className="project-heading">
        <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
        <h3 aria-label={project.title}>
          <a href={`/projects/${project.slug}`}>{project.title}</a>
        </h3>
        <span className="project-year">{project.start_date?.slice(0, 4) || 'Year not added'}</span>
        <a
          className="project-arrow icon-button"
          href={`/projects/${project.slug}`}
          aria-label={`View ${project.title} project`}
        >
          <Icon name="external" size={24} />
        </a>
      </div>
      <a
        href={`/projects/${project.slug}`}
        className="project-image"
        aria-label={`View ${project.title} images and details`}
      >
        {project.image_url ? (
          <Image
            src={project.image_url}
            alt={project.image_alt}
            width={project.image_width}
            height={project.image_height}
          />
        ) : (
          <div className="project-image-placeholder">
            <span className="project-placeholder-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>Project image not added yet</span>
          </div>
        )}
      </a>
      <div className="project-content">
        <div className="project-context">
          <span className="eyebrow">{project.role || 'Software engineering project'}</span>
          <p className="project-summary text-block">
            {project.summary || 'Project description has not been added yet.'}
          </p>
          <h4 className="project-tools-heading">Tools used</h4>
          <div className="tag-row">
            {technologies.map((technology) => (
              <span className="badge" key={technology.id}>
                {technology.name}
              </span>
            ))}
          </div>
          {technologies.length === 0 && <p className="small-text">Tools not listed yet.</p>}
          <a className="text-link" href={`/projects/${project.slug}`}>
            View project details <Icon name="arrow" size={16} />
          </a>
        </div>
        <ProjectCaseStudy project={project} compact headingLevel={4} />
      </div>
    </article>
  );
}
