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
  const featured = content.projects.filter((project) => project.featured);
  return (
    <main id="main">
      <section className="container hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            <span className="status-dot" /> {profile?.availability || 'Portfolio in progress'}
          </span>
          <h1 id="hero-heading">
            <span className="hero-role">Software Engineer</span>Building software.
            <br />
            <span className="hero-muted">Solving problems.</span>
          </h1>
          <p className="hero-intro">
            {profile?.intro || 'Profile information has not been added yet.'}
          </p>
          {!profile && <span className="placeholder-label">Profile not added yet</span>}
          <div className="actions hero-actions">
            <a className="button primary" href="#projects">
              View projects <Icon />
            </a>
            <button id="world-entry" className="button ghost" onClick={onExplore}>
              <Icon name="flight" /> Explore in 3D
            </button>
          </div>
          <div className="hero-note">
            <span className="tiny-line" /> Projects, tools, and work experience.
          </div>
        </div>
        <div className="portrait-wrap">
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
              <div className="portrait-grid" />
              <span className="portrait-cross top">+</span>
              <span className="portrait-cross bottom">+</span>
              <div className="portrait-silhouette">
                <div className="silhouette-head" />
                <div className="silhouette-body" />
              </div>
              <span className="photo-label">PHOTO NOT ADDED YET</span>
            </div>
          )}
          <div className="portrait-caption">
            <span>
              {profile?.name ?? 'Your name'}
              <small>{profile?.location || 'Location not added yet'}</small>
            </span>
            <span className="caption-symbol">↗</span>
          </div>
          <span className="portrait-index">01 / PROFILE</span>
        </div>
      </section>
      <div className="container section-divider">
        <span>Software Engineer portfolio</span>
        <span>Scroll to explore ↓</span>
      </div>
      <section id="about" className="container section about-section">
        <div>
          <SectionLabel number="01" label="About me" />
          <h2>
            About
            <br /> me.
          </h2>
        </div>
        <div>
          <p className="about-lead text-block">
            {profile?.about || 'Background and approach to software engineering will appear here.'}
          </p>
          {!profile && (
            <p className="small-text">This section is waiting for profile information.</p>
          )}
          <a href="#contact" className="text-link">
            Get in touch <Icon size={18} />
          </a>
        </div>
      </section>
      <section id="projects" className="container section">
        <div className="section-heading">
          <div>
            <SectionLabel number="02" label="Selected work" />
            <h2>Selected projects</h2>
          </div>
          <span className="section-aside">The problem, the solution, and the tools used.</span>
        </div>
        {featured.length ? (
          <div className="project-grid">
            {featured.map((project, index) => (
              <ProjectCard key={project.id} project={project} content={content} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState title="No featured projects yet">
            Featured projects will appear here once published.
          </EmptyState>
        )}
        {content.projects.some((project) => !project.featured) && (
          <div className="other-projects">
            <h3>More projects</h3>
            <div className="project-grid">
              {content.projects
                .filter((project) => !project.featured)
                .map((project, index) => (
                  <ProjectCard key={project.id} project={project} content={content} index={index} />
                ))}
            </div>
          </div>
        )}
      </section>
      <section id="tools" className="container section">
        <div className="section-heading">
          <div>
            <SectionLabel number="03" label="Tools" />
            <h2>Tools and technologies</h2>
          </div>
          <span className="section-aside">Technologies used across projects and work.</span>
        </div>
        <Technologies content={content} />
      </section>
      <section id="experience" className="container section">
        <div className="section-heading">
          <div>
            <SectionLabel number="04" label="Experience" />
            <h2>Work experience</h2>
          </div>
        </div>
        <ExperienceTimeline content={content} />
      </section>
      <section className="container section">
        <div className="interactive-cta">
          <div className="cta-copy">
            <span className="eyebrow">Optional 3D tour</span>
            <h2>
              Explore the portfolio
              <br />
              in 3D.
            </h2>
            <p>
              Fly a helicopter to discover projects and work experience. Return to the regular
              portfolio at any time.
            </p>
            <button className="button primary" onClick={onExplore}>
              Start the 3D tour <Icon name="flight" />
            </button>
            <span className="small-text">The same portfolio, with helicopter controls.</span>
          </div>
          <WorldIllustration />
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
function WorldIllustration() {
  return (
    <div className="world-illustration" aria-hidden="true">
      <svg viewBox="0 0 440 320" fill="none">
        <path d="m45 230 175-90 175 90-175 85z" fill="var(--color-surface-elevated)" />
        <path d="m45 230 175 85v-17L45 213z" fill="var(--color-border)" />
        <path d="m220 315 175-85v-17l-175 85z" fill="var(--color-border)" />
        <path
          d="m85 230 135-68 135 68-135 68z"
          stroke="var(--color-primary)"
          strokeDasharray="4 7"
        />
        <path d="m157 247 57-30 61 30-58 30z" fill="var(--color-surface-elevated)" />
        <path d="m191 244 25-12 27 13-25 12z" stroke="var(--color-border)" />
        <path d="m124 207 26-13v-50l-26 13z" fill="var(--color-border)" />
        <path d="m150 194 25 13v-50l-25-13z" fill="var(--color-primary)" />
        <path d="m124 157 26-13 25 13-25 13z" fill="var(--color-surface-elevated)" />
        <path d="m285 231 27-13v-66l-27 13z" fill="var(--color-primary)" />
        <path d="m312 218 24 12v-65l-24-13z" fill="var(--color-primary)" />
        <path d="m285 165 27-13 24 13-25 13z" fill="var(--color-surface-elevated)" />
        <path
          d="M216 129v-17m-62-9 130 15"
          stroke="var(--color-primary)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="m159 136 33 6 15-15 32 6 26 23-10 9-50-6-15-10-31-5z"
          fill="var(--color-primary)"
        />
        <path d="m233 137 16 18-22-3-9-18z" fill="var(--color-text)" />
        <path
          d="m205 159-4 12m43-6-4 12m-46-8 61 10"
          stroke="var(--color-text-secondary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="150" cy="130" r="5" fill="var(--color-primary)" />
        <circle cx="312" cy="138" r="5" fill="var(--color-primary)" />
        <path
          d="M150 123v-18m162 26v-18"
          stroke="var(--color-text-secondary)"
          strokeDasharray="3 4"
        />
      </svg>
      <span className="illustration-caption">
        Fly toward a marker to view a project or work experience.
      </span>
    </div>
  );
}
