import type { Content } from '@portfolio/types';
import { EmptyState, Icon } from '@portfolio/ui';
export function Technologies({ content }: { content: Content }) {
  if (!content.technologies.length)
    return (
      <EmptyState title="No tools added yet">
        Tools and technologies will appear here once added.
      </EmptyState>
    );
  return (
    <div className="technology-grid">
      {content.technology_categories.map((category) => (
        <article className="technology-category" key={category.id}>
          <span className="tool-icon">
            <Icon name="code" />
          </span>
          <h3>{category.name}</h3>
          <div className="tag-row">
            {content.technologies
              .filter((technology) => technology.category_id === category.id)
              .map((technology) => (
                <span className="badge" key={technology.id}>
                  {technology.name}
                </span>
              ))}
          </div>
        </article>
      ))}
    </div>
  );
}
