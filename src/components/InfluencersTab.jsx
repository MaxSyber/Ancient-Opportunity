import { useState } from "react";
import { UserPlus } from "lucide-react";

const socialPlatforms = ["Instagram", "TikTok", "YouTube", "Facebook", "X / Twitter", "LinkedIn", "Bluesky", "Threads", "Twitch", "Podcast", "Other"];

export default function InfluencersTab() {
  const [submissions, setSubmissions] = useState([]);
  const [submittedName, setSubmittedName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const submission = {
      id: `${Date.now()}-${data.get("handle")}`,
      name: data.get("name"),
      handle: data.get("handle"),
      platform: data.get("platform"),
      profileUrl: data.get("profileUrl"),
    };
    setSubmissions((current) => [submission, ...current]);
    setSubmittedName(submission.name);
    form.reset();
  };

  return (
    <section className="influencer-panel" aria-labelledby="influencer-heading">
      <div className="influencer-intro">
        <span className="influencer-icon" aria-hidden="true"><UserPlus size={28} /></span>
        <div>
          <p className="eyebrow">Community directory</p>
          <h2 id="influencer-heading">Recommend an archaeology creator</h2>
          <p>Help us discover educators, field archaeologists, museums, labs, and public-history creators sharing reliable archaeology content online.</p>
        </div>
      </div>
      <div className="influencer-layout">
        <form className="influencer-form" onSubmit={handleSubmit}>
          <div className="form-section-heading"><h3>Influencer details</h3><p>Fields marked with * are required.</p></div>
          <div className="form-grid">
            <FormField label="Name or organization *"><input name="name" type="text" required placeholder="e.g. The Archaeology Channel" /></FormField>
            <FormField label="Platform *"><select name="platform" required defaultValue=""><option value="" disabled>Select a platform</option>{socialPlatforms.map((platform) => <option value={platform} key={platform}>{platform}</option>)}</select></FormField>
            <FormField label="Handle or channel name *"><input name="handle" type="text" required placeholder="@creatorname" /></FormField>
            <FormField label="Profile URL *"><input name="profileUrl" type="url" required placeholder="https://..." /></FormField>
            <FormField label="Content focus *" wide><input name="focus" type="text" required placeholder="e.g. Experimental archaeology, CRM careers, museum education" /></FormField>
            <FormField label="Why should we feature them? *" wide><textarea name="recommendation" required rows="5" placeholder="Tell us what makes their content useful, engaging, or trustworthy." /></FormField>
            <FormField label="Your email (optional)" hint="Only used if we need to follow up about this recommendation." wide><input name="email" type="email" placeholder="you@example.com" /></FormField>
          </div>
          <label className="form-consent"><input name="confirmation" type="checkbox" required /><span>I confirm that this profile is publicly accessible and relevant to archaeology.</span></label>
          <button className="influencer-submit" type="submit"><UserPlus size={18} />Submit recommendation</button>
          {submittedName && <p className="submission-success" role="status">Thanks! {submittedName} was added to the review queue for this session.</p>}
        </form>
        <aside className="submission-sidebar" aria-label="Submission guidance">
          <p className="eyebrow">What we’re looking for</p>
          <h3>Useful, credible archaeology voices</h3>
          <ul>
            <li>Educational content grounded in evidence</li>
            <li>Clear respect for cultural heritage and descendant communities</li>
            <li>Active public outreach, fieldwork, research, or museum work</li>
            <li>No promotion of looting or illicit artifact sales</li>
          </ul>
          <div className="platform-list"><strong>Platforms welcomed</strong><p>{socialPlatforms.slice(0, -1).join(" · ")}</p></div>
          {submissions.length > 0 && (
            <div className="session-queue">
              <strong>Submitted this session ({submissions.length})</strong>
              {submissions.map((submission) => (
                <a href={submission.profileUrl} target="_blank" rel="noreferrer" key={submission.id}><span>{submission.name}</span><small>{submission.platform} · {submission.handle}</small></a>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function FormField({ label, hint, wide = false, children }) {
  return <label className={wide ? "form-field form-field-wide" : "form-field"}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
