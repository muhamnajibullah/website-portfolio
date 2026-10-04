import type { Project } from '@portfolio/types';

export function ProjectCaseStudy({
  project,
  compact = false,
  headingLevel = 3,
}: {
  project: Project;
  compact?: boolean;
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <div className={`project-case-study${compact ? ' compact' : ''}`}>
      {(
        [
          ['Problem', project.challenges],
          ['Solution', project.solutions],
        ] as const
      ).map(([label, values]) => (
        <section key={label}>
          <Heading>{label}</Heading>
          {values.length ? (
            <ul>
              {(compact ? values.slice(0, 1) : values).map((value, index) => (
                <li key={index}>{value}</li>
              ))}
            </ul>
          ) : (
            <p className="small-text">{label} details are not available yet.</p>
          )}
        </section>
      ))}
    </div>
  );
}
