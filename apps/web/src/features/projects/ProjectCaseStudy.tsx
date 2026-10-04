import type { Project } from '@portfolio/types';

export function ProjectCaseStudy({
  project,
  compact = false,
  headingLevel = 3,
  full = false,
}: {
  project: Project;
  compact?: boolean;
  headingLevel?: 2 | 3 | 4;
  full?: boolean;
}) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const sections: { label: string; id: string; values: string[]; prose?: boolean }[] = [
    { label: 'Problem', id: 'problem', values: project.challenges },
    ...(full && project.engineering_approach
      ? [
          {
            label: 'Engineering approach',
            id: 'approach',
            values: [project.engineering_approach],
            prose: true,
          },
        ]
      : []),
    ...(full && project.key_features.length
      ? [{ label: 'Key features', id: 'features', values: project.key_features }]
      : []),
    ...(full && project.technical_challenges.length
      ? [{ label: 'Technical challenges', id: 'challenges', values: project.technical_challenges }]
      : []),
    { label: 'Solution', id: 'solution', values: project.solutions },
  ];
  return (
    <div className={`project-case-study${compact ? ' compact' : ''}${full ? ' full' : ''}`}>
      {sections.map(({ label, id, values, prose }) => (
        <section key={id} id={full ? `case-${id}` : undefined}>
          <Heading>{label}</Heading>
          {values.length ? (
            prose ? (
              <p className="text-block">{values[0]}</p>
            ) : (
              <ul>
                {(compact ? values.slice(0, 1) : values).map((value, index) => (
                  <li key={index}>{value}</li>
                ))}
              </ul>
            )
          ) : (
            <p className="small-text">{label} details are not available yet.</p>
          )}
        </section>
      ))}
    </div>
  );
}
