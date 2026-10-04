import type { Content } from '@portfolio/types';
import type { MouseEvent } from 'react';
import { EmptyState, Icon, Image } from '@portfolio/ui';
import { ProjectCard } from '../projects/ProjectCard';
import { Technologies } from '../technologies/Technologies';
import { ExperienceTimeline } from '../experiences/ExperienceTimeline';
import { Contact } from '../contact/Contact';

export function PortfolioPage({
  content,
  onExplore,
}: {
  content: Content;
  onExplore: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const profile = content.profiles[0];
  const projects = [
    ...content.projects.filter((project) => project.featured),
    ...content.projects.filter((project) => !project.featured),
  ];
  return (
    <main id="main">
      <section className="container hero" aria-labelledby="hero-heading">
        <div className="hero-topline">
          <span className="eyebrow hero-eyebrow">
            <span className="status-dot" />
            {profile?.availability || 'Portfolio in progress'}
          </span>
          <span className="hero-edition">Selected work / Personal portfolio</span>
        </div>
        <div className="hero-copy">
          <h1 id="hero-heading" aria-label="Software Engineer">
            <span>Software</span>
            <span>
              Engineer
              <span className="hero-heading-mark" aria-hidden="true">
                ↗
              </span>
            </span>
          </h1>
          <p className="hero-name">
            {profile?.name ?? 'Your name'}
            <span aria-hidden="true">.</span>
          </p>
          <p className="hero-intro text-block">
            {profile?.intro || 'Profile information has not been added yet.'}
          </p>
          {!profile && <span className="placeholder-label">Profile not added yet</span>}
          <div className="actions hero-actions">
            <a className="button primary" href="#projects">
              View projects <Icon />
            </a>
            <button id="world-entry" className="button ghost" onClick={onExplore}>
              Explore in 3D <Icon name="flight" />
            </button>
          </div>
          <a className="hero-scroll text-link" href="#about">
            Scroll to explore <span aria-hidden="true">↓</span>
          </a>
        </div>
        <figure className="portrait-wrap">
          <div className="portrait-frame">
            {profile?.image_url ? (
              <Image
                src={profile.image_url}
                alt={profile.image_alt}
                width={profile.image_width}
                height={profile.image_height}
                eager
              />
            ) : (
              <div
                className="portrait-placeholder"
                role="img"
                aria-label="Profile photo placeholder. No photo has been added yet."
              >
                <span className="portrait-cross top" aria-hidden="true">
                  +
                </span>
                <span className="portrait-placeholder-index" aria-hidden="true">
                  01
                </span>
                <span className="photo-label">
                  Portrait
                  <br />
                  <small>Photo not added yet</small>
                </span>
                <span className="portrait-cross bottom" aria-hidden="true">
                  +
                </span>
              </div>
            )}
          </div>
          <figcaption className="portrait-caption">
            <span>01 / The person behind the work</span>
            <span aria-hidden="true">↗</span>
          </figcaption>
        </figure>
      </section>
      <div className="container section-divider">
        <span>Engineering / Projects / Experience</span>
        <span>Software Engineer portfolio</span>
      </div>
      <section id="about" className="container section about-section">
        <div>
          <SectionLabel number="01" label="Introduction" />
          <h2>
            About
            <br />
            me<span className="accent-dot">.</span>
          </h2>
        </div>
        <div className="about-copy">
          <p className="about-lead text-block">
            {profile?.about || 'Background and approach to software engineering will appear here.'}
          </p>
          {!profile && (
            <p className="small-text">This section is waiting for profile information.</p>
          )}
          <dl className="about-metadata">
            <div>
              <dt>What I do</dt>
              <dd>Software Engineer</dd>
            </div>
            {profile?.location && (
              <div>
                <dt>Based in</dt>
                <dd>{profile.location}</dd>
              </div>
            )}
          </dl>
          <a href="#contact" className="text-link">
            Get in touch <Icon />
          </a>
        </div>
      </section>
      <section id="projects" className="container section projects-section">
        <div className="section-heading">
          <div>
            <SectionLabel number="02" label="Selected work" />
            <h2>
              Selected
              <br />
              projects<span className="accent-dot">.</span>
            </h2>
          </div>
          <p className="section-aside">
            The problem, the solution,
            <br />
            and the tools behind the work.
          </p>
        </div>
        {projects.length ? (
          <div className="project-list project-showcase">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} content={content} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState title="No projects published yet">
            Projects will appear here once published.
          </EmptyState>
        )}
      </section>
      <section id="experience" className="container section experience-section">
        <div className="section-heading">
          <div>
            <SectionLabel number="03" label="Experience" />
            <h2>
              Where I’ve
              <br />
              contributed<span className="accent-dot">.</span>
            </h2>
          </div>
          <p className="section-aside">
            Work experience.
            <br />
            Roles, teams, and contributions.
          </p>
        </div>
        <ExperienceTimeline content={content} />
      </section>
      <section id="tools" className="container section tools-section">
        <div className="section-heading">
          <div>
            <SectionLabel number="04" label="The toolkit" />
            <h2>
              Tools &amp;
              <br />
              technologies<span className="accent-dot">.</span>
            </h2>
          </div>
          <p className="section-aside">
            Technologies used across
            <br />
            projects and work.
          </p>
        </div>
        <Technologies content={content} />
      </section>
      <section id="mini-game" className="interactive-section" aria-labelledby="interactive-heading">
        <div className="container interactive-cta">
          <div className="cta-copy">
            <span className="eyebrow">05 / Want to explore differently?</span>
            <h2 id="interactive-heading">
              Enter the
              <br />
              interactive
              <br />
              world<span aria-hidden="true"> ↗</span>
            </h2>
            <p>
              Fly a helicopter through projects and work experience. Return to the regular portfolio
              at any time.
            </p>
            <button className="button primary" onClick={onExplore}>
              Start the 3D tour <Icon name="flight" />
            </button>
            <span className="small-text">
              Optional 3D tour · The same portfolio, a different perspective.
            </span>
          </div>
          <div className="interactive-mark" aria-hidden="true">
            <Icon name="flight" size={220} />
            <span>Explore / Discover / Read</span>
          </div>
        </div>
      </section>
      <Contact content={content} />
    </main>
  );
}

export function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}
