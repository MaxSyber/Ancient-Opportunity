import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { conferences } from "../data/conferences";

export default function ConferencesTab() {
  return (
    <section className="conferences-panel" aria-labelledby="conferences-heading">
      <div className="conferences-heading">
        <div><p className="eyebrow">Upcoming events</p><h2 id="conferences-heading">Archaeology conferences</h2></div>
        <span className="conference-count">{conferences.length} conferences</span>
      </div>
      <div className="conference-grid">
        {conferences.map((conference) => (
          <article className="conference-card" key={conference.id}>
            <p className="conference-date"><CalendarDays size={18} /><span>{conference.dates}</span></p>
            <h3>{conference.name}{conference.abbreviation && <span> — {conference.abbreviation}</span>}</h3>
            <p className="conference-location"><MapPin size={18} /><span>{conference.location}</span></p>
            <p className="conference-description">{conference.description}</p>
            {conference.deadline && <p className="conference-deadline">{conference.deadline}</p>}
            <a className="conference-website" href={conference.website} target="_blank" rel="noreferrer" aria-label={`Visit the ${conference.name} website (opens in a new tab)`}>
              <span>{conference.websiteLabel}</span><ExternalLink size={17} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
