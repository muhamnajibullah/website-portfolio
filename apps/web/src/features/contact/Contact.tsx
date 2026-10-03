import type { Content } from '@portfolio/types';
import { Icon } from '@portfolio/ui';
export function Contact({ content }: { content: Content }) {
  const profile = content.profiles[0],
    settings = content.site_settings[0];
  return (
    <section id="contact" className="container section contact-section">
      <div>
        <span className="eyebrow">Let’s connect</span>
        <h2>{settings?.contact_heading || 'Let’s build something thoughtful.'}</h2>
        <p>
          {settings?.contact_text ||
            'Add your contact details and social links in the CMS to make it easy for people to reach you.'}
        </p>
        {profile?.email ? (
          <a className="contact-email" href={`mailto:${profile.email}`}>
            {profile.email} <Icon name="arrow" size={26} />
          </a>
        ) : (
          <span className="placeholder-label">Contact details to be added</span>
        )}
      </div>
      <div className="social-links">
        {content.social_links.map((link) => (
          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}
            <Icon name="external" size={18} />
          </a>
        ))}
      </div>
    </section>
  );
}
