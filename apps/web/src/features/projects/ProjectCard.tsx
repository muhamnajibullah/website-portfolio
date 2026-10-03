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
      <a
        href={`/projects/${project.slug}`}
        className="project-image"
        tabIndex={-1}
        aria-hidden="true"
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
            <Icon name="code" size={44} />
            <span>Project image to be added</span>
          </div>
        )}
      </a>
      <div className="project-content">
        <div className="project-top">
          <span className="eyebrow">
            {String(index + 1).padStart(2, '0')} / {project.role || 'Project'}
          </span>
          <Icon name="arrow" />
        </div>
        <h3>
          <a href={`/projects/${project.slug}`}>{project.title}</a>
        </h3>
        <p>{project.summary}</p>
        <ProjectCaseStudy project={project} compact headingLevel={4} />
        <h4 className="project-tools-heading">Tools used</h4>
        <div className="tag-row">
          {technologies.map((technology) => (
            <span className="badge" key={technology.id}>
              {technology.name}
            </span>
          ))}
        </div>
        {technologies.length === 0 && <p className="small-text">Tools to be added.</p>}
        <a className="text-link" href={`/projects/${project.slug}`}>
          Read project details <Icon name="arrow" size={16} />
        </a>
      </div>
    </article>
  );
}
