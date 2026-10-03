import type { Content } from '@portfolio/types';
import { EmptyState, Image } from '@portfolio/ui';
export function ExperienceTimeline({ content }: { content: Content }) {
  if (!content.work_experiences.length)
    return (
      <EmptyState title="Your journey, honestly told">
        Publish your work experience, contributions and impact from the CMS.
      </EmptyState>
    );
  return (
    <div className="timeline">
      {content.work_experiences.map((experience) => {
        const ids = content.experience_technologies
          .filter((link) => link.experience_id === experience.id)
          .map((link) => link.technology_id);
        return (
          <article className="experience" key={experience.id}>
            <div className="experience-period">
              {experience.start_date || 'Date to be added'}
              <span>— {experience.end_date || 'Present'}</span>
            </div>
            <div>
              <div className="experience-heading">
                {experience.image_url && (
                  <Image
                    src={experience.image_url}
                    alt={experience.image_alt}
                    width={experience.image_width}
                    height={experience.image_height}
                  />
                )}
                <div>
                  <h3>{experience.position}</h3>
                  <span className="organization">{experience.organization}</span>
                </div>
              </div>
              <p className="text-block">{experience.description}</p>
              <ul>
                {experience.responsibilities.map((value, index) => (
                  <li key={index}>{value}</li>
                ))}
              </ul>
              <div className="tag-row">
                {content.technologies
                  .filter((technology) => ids.includes(technology.id))
                  .map((technology) => (
                    <span className="badge" key={technology.id}>
                      {technology.name}
                    </span>
                  ))}
              </div>
              <div className="experience-projects">
                {content.projects
                  .filter((project) => experience.related_project_ids.includes(project.id))
                  .map((project) => (
                    <a className="text-link" key={project.id} href={`/projects/${project.slug}`}>
                      {project.title} ↗
                    </a>
                  ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
