import type { Content } from '@portfolio/types';
import { EmptyState, Icon, Image } from '@portfolio/ui';
import { ProjectCard } from '../projects/ProjectCard';
import { Technologies } from '../technologies/Technologies';
import { ExperienceTimeline } from '../experiences/ExperienceTimeline';
import { Contact } from '../contact/Contact';

export function PortfolioPage({ content, onExplore }: { content: Content; onExplore: () => void }) {
  const profile = content.profiles[0];
  const featured = content.projects.filter((project) => project.featured);
  return (
    <main id="main">
      <section className="container hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            <span className="status-dot" />{' '}
            {profile?.availability || 'Personal portfolio / In preparation'}
          </span>
          <h1 id="hero-heading">
            <span className="hero-role">Software Engineer</span>Good software.
            <br />
            <span className="hero-muted">Thoughtfully built.</span>
          </h1>
          <p className="hero-intro">
            {profile?.intro ||
              'This is your space to introduce yourself, your approach to engineering, and the problems you enjoy solving. Add your introduction in the CMS.'}
          </p>
          {!profile && <span className="placeholder-label">Profile content placeholder</span>}
          <div className="actions hero-actions">
            <a className="button primary" href="#projects">
              View projects <Icon />
            </a>
            <button id="world-entry" className="button ghost" onClick={onExplore}>
              <Icon name="flight" /> Explore interactive world
            </button>
          </div>
          <div className="hero-note">
            <span className="tiny-line" /> Clear thinking. Considered details. Useful outcomes.
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
              aria-label="Personal photograph placeholder. Add your own photo in the CMS."
            >
              <div className="portrait-grid" />
              <span className="portrait-cross top">+</span>
              <span className="portrait-cross bottom">+</span>
              <div className="portrait-silhouette">
                <div className="silhouette-head" />
                <div className="silhouette-body" />
              </div>
              <span className="photo-label">YOUR PHOTO HERE</span>
            </div>
          )}
          <div className="portrait-caption">
            <span>
              {profile?.name ?? 'Your name'}
              <small>{profile?.location || 'Location to be added'}</small>
            </span>
            <span className="caption-symbol">↗</span>
          </div>
          <span className="portrait-index">01 / THE PERSON BEHIND THE CODE</span>
        </div>
      </section>
      <div className="container section-divider">
        <span>Engineering with purpose</span>
        <span>Scroll to explore ↓</span>
      </div>
      <section id="about" className="container section about-section">
        <div>
          <SectionLabel number="01" label="A little about me" />
          <h2>
            Behind the
            <br />
            {' '}implementation.
          </h2>
        </div>
        <div>
          <p className="about-lead text-block">
            {profile?.about ||
              'Your story belongs here. Share your background, how you work, and what matters to you as a software engineer.'}
          </p>
          {!profile && (
            <p className="small-text">
              Waiting for your authentic profile. Manage this section from Profile in the CMS.
            </p>
          )}
          <a href="#contact" className="text-link">
            Start a conversation <Icon size={18} />
          </a>
        </div>
      </section>
      <section id="projects" className="container section">
        <div className="section-heading">
          <div>
            <SectionLabel number="02" label="Selected work" />
            <h2>Projects with a purpose.</h2>
          </div>
          <span className="section-aside">From an idea to a working product.</span>
        </div>
        {featured.length ? (
          <div className="project-grid">
            {featured.map((project, index) => (
              <ProjectCard key={project.id} project={project} content={content} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState title="Your selected work goes here">
            Publish a project and mark it as featured in the CMS. Real project details and images
            will appear here.
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
            <SectionLabel number="03" label="My toolkit" />
            <h2>The right tools for the job.</h2>
          </div>
          <span className="section-aside">A toolkit, always evolving.</span>
        </div>
        <Technologies content={content} />
      </section>
      <section id="experience" className="container section">
        <div className="section-heading">
          <div>
            <SectionLabel number="04" label="Along the way" />
            <h2>Experience & contributions.</h2>
          </div>
        </div>
        <ExperienceTimeline content={content} />
      </section>
      <section className="container section">
        <div className="interactive-cta">
          <div className="cta-copy">
            <span className="eyebrow">A different perspective</span>
            <h2>
              A small world.
              <br />A little curiosity.
            </h2>
            <p>
              Take the scenic route through my portfolio. Fly a helicopter, find a project, and
              explore at your own pace.
            </p>
            <button className="button primary" onClick={onExplore}>
              Explore the interactive world <Icon name="flight" />
            </button>
            <span className="small-text">Optional exploration · Same portfolio · Your pace</span>
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
        <path d="m45 230 175-90 175 90-175 85z" fill="#dbe5e4" />
        <path d="m45 230 175 85v-17L45 213z" fill="#becfcd" />
        <path d="m220 315 175-85v-17l-175 85z" fill="#ccd9d6" />
        <path d="m85 230 135-68 135 68-135 68z" stroke="#afc4c5" strokeDasharray="4 7" />
        <path d="m157 247 57-30 61 30-58 30z" fill="#f8faf8" />
        <path d="m191 244 25-12 27 13-25 12z" stroke="#9cb0b1" />
        <path d="m124 207 26-13v-50l-26 13z" fill="#9cb0b1" />
        <path d="m150 194 25 13v-50l-25-13z" fill="#b7c9c9" />
        <path d="m124 157 26-13 25 13-25 13z" fill="#eef2ef" />
        <path d="m285 231 27-13v-66l-27 13z" fill="#bccbd6" />
        <path d="m312 218 24 12v-65l-24-13z" fill="#95acbf" />
        <path d="m285 165 27-13 24 13-25 13z" fill="#e1eaf1" />
        <path
          d="M216 129v-17m-62-9 130 15"
          stroke="#405c85"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="m159 136 33 6 15-15 32 6 26 23-10 9-50-6-15-10-31-5z" fill="#405c85" />
        <path d="m233 137 16 18-22-3-9-18z" fill="#c3d9e7" />
        <path
          d="m205 159-4 12m43-6-4 12m-46-8 61 10"
          stroke="#536c83"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="150" cy="130" r="5" fill="#405c85" />
        <circle cx="312" cy="138" r="5" fill="#405c85" />
        <path d="M150 123v-18m162 26v-18" stroke="#7b96b5" strokeDasharray="3 4" />
      </svg>
      <span className="illustration-caption">
        A helicopter. A handful of ideas. Room to explore.
      </span>
    </div>
  );
}
