import type { Content, Project } from '@portfolio/types';
import { Icon, Image } from '@portfolio/ui';
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
        <div className="tag-row">
          {projectTechnologies(content, project.id).map((technology) => (
            <span className="badge" key={technology.id}>
              {technology.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
