import type { MouseEvent } from 'react';
import { Icon } from '@portfolio/ui';

const navigationItems = [
  ['Projects', 'projects'],
  ['Experience', 'experience'],
  ['About', 'about'],
] as const;

export function NavigationLinks({
  active,
  onNavigate,
  onExplore,
}: {
  active: string;
  onNavigate: (id: string) => void;
  onExplore: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <>
      {navigationItems.map(([label, id], index) => (
        <a
          key={id}
          href={`/#${id}`}
          aria-current={active === id ? 'location' : undefined}
          onClick={() => onNavigate(id)}
        >
          <span className="nav-number" aria-hidden="true">
            0{index + 1}
          </span>
          {label}
        </a>
      ))}
      <button className="nav-game" onClick={onExplore}>
        Mini game <Icon name="arrow" size={16} />
      </button>
    </>
  );
}
