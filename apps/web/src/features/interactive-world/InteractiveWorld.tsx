import { useEffect, useMemo, useRef, useState } from 'react';
import type { Content, InteractivePoint } from '@portfolio/types';
import { Dialog, Icon, Image } from '@portfolio/ui';
import { WorldFallback } from '../../app/PublicApp';
import { createFlightInput } from './systems/flightMovement';
import { nearestPoint } from './systems/proximitySystem';
import { createWorld, type WorldSettings } from './scene/createWorld';
import { TouchFlightControls } from './controls/TouchFlightControls';
import { projectTechnologies } from '../projects/ProjectCard';
import { ProjectCaseStudy } from '../projects/ProjectCaseStudy';
import './world.css';

export default function InteractiveWorld({
  content,
  onExit,
}: {
  content: Content;
  onExit: () => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    container = useRef<HTMLDivElement>(null);
  const labels = useRef(new Map<string, HTMLElement>());
  const input = useRef(createFlightInput());
  const settings = useRef<WorldSettings>({ quality: 'auto', sensitivity: 1, paused: false });
  const runtime = useRef<ReturnType<typeof createWorld> | null>(null);
  const nearRef = useRef<ReturnType<typeof nearestPoint>>(null);
  const [near, setNear] = useState<ReturnType<typeof nearestPoint>>(null);
  const [selected, setSelected] = useState<InteractivePoint | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false),
    [failed, setFailed] = useState(false);
  const [quality, setQuality] = useState<WorldSettings['quality']>('auto'),
    [sensitivity, setSensitivity] = useState(1);
  const points = useMemo(
    () =>
      content.interactive_points.filter(
        (point) =>
          point.enabled &&
          (content.projects.some((project) => project.id === point.project_id) ||
            content.work_experiences.some((experience) => experience.id === point.experience_id)),
      ),
    [content],
  );
  const interactRef = useRef(() => {});
  interactRef.current = () => {
    if (!settings.current.paused && nearRef.current?.zone === 'interaction')
      setSelected(nearRef.current.point);
  };
  settings.current.paused = Boolean(selected || settingsOpen);
  useEffect(() => {
    if (failed || !host.current) return;
    try {
      runtime.current = createWorld({
        host: host.current,
        input: input.current,
        points,
        labels: labels.current,
        settings: settings.current,
        onProximity: (value) => {
          nearRef.current = value;
          setNear(value);
        },
        interact: () => interactRef.current(),
        onFailure: () => setFailed(true),
      });
    } catch {
      setFailed(true);
    }
    return () => {
      runtime.current?.dispose();
      runtime.current = null;
    };
  }, [points, failed]);
  useEffect(() => {
    const target = container.current;
    target?.querySelector<HTMLElement>('button')?.focus();
    const siblings = document.querySelectorAll<HTMLElement>('.site-header, main, .site-footer');
    siblings.forEach((node) => {
      node.inert = true;
    });
    const key = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('dialog')) return;
      if (event.key === 'Escape') onExit();
      if (event.key === 'Tab' && target) {
        const buttons = Array.from(
          target.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select'),
        ).filter((element) => element.getClientRects().length > 0);
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      siblings.forEach((node) => {
        node.inert = false;
      });
      window.removeEventListener('keydown', key);
    };
  }, [onExit]);
  const pointTitle = (point: InteractivePoint) =>
    content.projects.find((project) => project.id === point.project_id)?.title ??
    content.work_experiences.find((experience) => experience.id === point.experience_id)
      ?.organization ??
    '';
  const project = selected
    ? content.projects.find((project) => project.id === selected.project_id)
    : undefined;
  const experience = selected
    ? content.work_experiences.find((experience) => experience.id === selected.experience_id)
    : undefined;
  const linkedIds = project
    ? content.project_technologies
        .filter((link) => link.project_id === project.id)
        .map((link) => link.technology_id)
    : experience
      ? content.experience_technologies
          .filter((link) => link.experience_id === experience.id)
          .map((link) => link.technology_id)
      : [];
  if (failed) return <WorldFallback exit={onExit} />;
  return (
    <div ref={container} className="world">
      <div ref={host} className="scene-host" />
      <div className="world-labels" aria-hidden="true">
        {points.map((point) => {
          const previewProject = content.projects.find((item) => item.id === point.project_id);
          return (
            <div
              className="point-label"
              key={point.id}
              ref={(element) => {
                if (element) labels.current.set(point.id, element);
                else labels.current.delete(point.id);
              }}
            >
              <span className="point-kind">{point.project_id ? 'Project' : 'Experience'}</span>
              <strong>{pointTitle(point)}</strong>
              {previewProject && (
                <div className="point-preview">
                  <p>{previewProject.summary}</p>
                  <div className="point-tools">
                    {projectTechnologies(content, previewProject.id).map((technology) => (
                      <span key={technology.id}>{technology.name}</span>
                    ))}
                  </div>
                  <small>Open details for problem & solution</small>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <header className="world-header">
        <div className="world-brand">
          <Icon name="flight" />
          <div>
            Interactive portfolio<small>HELICOPTER / FREE EXPLORATION</small>
          </div>
        </div>
        <div className="actions">
          <button className="button" onClick={() => setSettingsOpen(true)}>
            Settings
          </button>
          <button className="button primary" onClick={onExit}>
            Normal Mode <Icon name="close" size={16} />
          </button>
        </div>
      </header>
      <aside className="world-hint">
        <span className="eyebrow">Your pace. Your path.</span>
        <p>
          {points.length
            ? 'Fly toward a marker to discover a project or experience.'
            : 'Your world is ready. Publish projects or experiences and link interactive points in the CMS to add destinations.'}
        </p>
        <span className="placeholder-label">Development helicopter & environment</span>
      </aside>
      <div className="world-status" role="status">
        {near
          ? `${pointTitle(near.point)} · ${near.zone === 'interaction' ? 'Ready to open' : near.zone === 'focus' ? 'Almost there' : 'Discovered'}`
          : 'Free exploration'}
      </div>
      <div className="world-bottom">
        <div className="desktop-help">
          <kbd>WASD</kbd> Move & turn <span>·</span> Drag to look <span>·</span> ↑ ↓ Altitude
        </div>
        <div className="actions">
          <button
            className="button"
            onClick={() => {
              runtime.current?.reset();
              nearRef.current = null;
              setNear(null);
            }}
          >
            Reset flight <span aria-hidden="true">↺</span>
          </button>
          <button
            className="button accent"
            disabled={near?.zone !== 'interaction'}
            onClick={() => interactRef.current()}
          >
            Open details <kbd>E</kbd>
          </button>
        </div>
      </div>
      <TouchFlightControls input={input.current} />
      {selected && (
        <Dialog
          title={project?.title ?? experience?.organization ?? 'Details'}
          onClose={() => setSelected(null)}
          className="world-details"
        >
          {project?.image_url && (
            <Image
              src={project.image_url}
              alt={project.image_alt}
              width={project.image_width}
              height={project.image_height}
            />
          )}
          <span className="eyebrow">{project?.role ?? experience?.position}</span>
          {experience && (
            <p>
              {experience.start_date} — {experience.end_date || 'Present'}
            </p>
          )}
          <p className="text-block">{project?.summary ?? experience?.description}</p>
          {project && <ProjectCaseStudy project={project} />}
          {experience && (
            <ul>
              {experience.responsibilities.map((value, index) => (
                <li key={index}>{value}</li>
              ))}
            </ul>
          )}
          <h3 className="project-tools-heading">Tools used</h3>
          <div className="tag-row">
            {content.technologies
              .filter((technology) => linkedIds.includes(technology.id))
              .map((technology) => (
                <span key={technology.id} className="badge">
                  {technology.name}
                </span>
              ))}
          </div>
          {linkedIds.length === 0 && <p className="small-text">Tools to be added.</p>}
          <div className="actions">
            {project && (
              <a className="button primary" href={`/projects/${project.slug}`}>
                View full project <Icon />
              </a>
            )}
            <button className="button" onClick={() => setSelected(null)}>
              Continue exploring
            </button>
          </div>
        </Dialog>
      )}
      {settingsOpen && (
        <Dialog title="Flight settings" onClose={() => setSettingsOpen(false)}>
          <div className="field">
            <label htmlFor="quality">Graphics quality</label>
            <select
              id="quality"
              value={quality}
              onChange={(event) => {
                const value = event.target.value as WorldSettings['quality'];
                setQuality(value);
                settings.current.quality = value;
              }}
            >
              {['auto', 'low', 'medium', 'high'].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <small>Auto lowers rendering resolution when frame times increase.</small>
          </div>
          <div className="field">
            <label htmlFor="sensitivity">Camera sensitivity: {sensitivity.toFixed(1)}</label>
            <input
              id="sensitivity"
              type="range"
              min="0.3"
              max="2"
              step="0.1"
              value={sensitivity}
              onChange={(event) => {
                const value = Number(event.target.value);
                setSensitivity(value);
                settings.current.sensitivity = value;
              }}
            />
          </div>
          <p className="small-text">
            Reduced motion follows your system preference. No camera shake, motion blur, or forced
            camera movement. Use R to reset your flight.
          </p>
          <button className="button" onClick={() => setSettingsOpen(false)}>
            Continue exploring
          </button>
        </Dialog>
      )}
    </div>
  );
}
