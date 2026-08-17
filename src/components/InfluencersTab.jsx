import { useEffect, useState } from "react";
import { ExternalLink, Globe2, Instagram, Music2, Podcast, Plus, UserPlus, X, Youtube } from "lucide-react";

const socialPlatforms = ["Instagram", "TikTok", "YouTube", "X", "Podcast", "Other/Personal Website"];

const mockCreators = [
  { id: "mock-field-notes", name: "Field Notes Archaeology", handle: "@fieldnotesarchaeology", platform: "Instagram", accounts: [{ platform: "Instagram", handle: "@fieldnotesarchaeology" }, { platform: "TikTok", handle: "@fieldnotesarchaeology" }], focus: "Field methods · Public archaeology", description: "Behind-the-scenes fieldwork, practical excavation tips, and accessible stories about how archaeologists interpret the past.", profileUrl: "https://www.instagram.com/", initials: "FN" },
  { id: "mock-past-forward", name: "Past Forward", handle: "@pastforwardhistory", platform: "YouTube", accounts: [{ platform: "YouTube", handle: "@pastforwardhistory" }, { platform: "Podcast", handle: "Past Forward" }], focus: "Material culture · Museum education", description: "Short, research-led videos exploring artifacts, museum collections, and the people whose stories they preserve.", profileUrl: "https://www.youtube.com/", initials: "PF" },
];

export default function InfluencersTab() {
  const [creators, setCreators] = useState(mockCreators);
  const [showForm, setShowForm] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [platformError, setPlatformError] = useState("");

  useEffect(() => {
    if (!selectedCreator) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedCreator(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCreator]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name"));
    const accounts = socialPlatforms
      .map((platform) => ({ platform, handle: String(data.get(`account-${platform}`) ?? "").trim() }))
      .filter((account) => account.handle);

    if (accounts.length === 0) {
      setPlatformError("Add an account name for at least one platform.");
      form.elements.namedItem(`account-${socialPlatforms[0]}`).focus();
      return;
    }

    setPlatformError("");
    const primaryAccount = accounts[0];
    const submission = {
      id: `${Date.now()}-${primaryAccount.handle}`,
      name,
      handle: primaryAccount.handle,
      platform: primaryAccount.platform,
      accounts,
      profileUrl: String(data.get("profileUrl")),
      focus: String(data.get("focus")),
      description: String(data.get("recommendation")),
      initials: name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase(),
    };
    setCreators((current) => [submission, ...current]);
    setSubmittedName(submission.name);
    setShowForm(false);
    form.reset();
  };

  return (
    <section className="influencer-panel" aria-labelledby="influencer-heading">
      <div className="influencer-heading">
        <div className="influencer-intro">
          <span className="influencer-icon" aria-hidden="true"><UserPlus size={28} /></span>
          <div>
            <p className="eyebrow">Community directory</p>
            <h2 id="influencer-heading">Social Media Creators</h2>
            <p>Discover educators, field archaeologists, museums, labs, and people who have stared at dirt a little too long.</p>
          </div>
        </div>
        {showForm ? (
          <button className="form-close" type="button" onClick={() => setShowForm(false)} aria-label="Close creator recommendation form" title="Close form">×</button>
        ) : (
          <button className="post-job-button" type="button" onClick={() => setShowForm(true)}><Plus size={18} />Recommend A Creator</button>
        )}
      </div>

      {showForm && (
        <div className="influencer-layout">
          <form className="influencer-form" onSubmit={handleSubmit}>
            <div className="form-section-heading"><h3>Creator details</h3><p>Fields marked with * are required.</p></div>
            <div className="form-grid">
              <FormField label="Name or organization *"><input name="name" type="text" required placeholder="e.g. The Archaeology Channel" /></FormField>
              <fieldset className="creator-accounts-field form-field-wide">
                <legend>Platform accounts *</legend>
                <p>Add an account name for at least one platform.</p>
                <div className="creator-account-list">
                  {socialPlatforms.map((platform) => (
                    <label className="creator-account-row" key={platform}>
                      <span><PlatformMark platform={platform} />{platform}</span>
                      <input name={`account-${platform}`} type="text" placeholder="Account name" onChange={() => platformError && setPlatformError("")} />
                    </label>
                  ))}
                </div>
                {platformError && <p className="field-error" role="alert">{platformError}</p>}
              </fieldset>
              <FormField label="Primary profile URL *" wide><input name="profileUrl" type="url" required placeholder="https://..." /></FormField>
              <FormField label="Content focus *" wide><input name="focus" type="text" required placeholder="e.g. Experimental archaeology, CRM careers, museum education" /></FormField>
              <FormField label="Channel Bio *" wide><textarea name="recommendation" required rows="5" placeholder="Account Bio" /></FormField>
              <FormField label="Contact Email *" hint="This will not be shared and will only be used if there is a problem with your account." wide><input name="email" type="email" required placeholder="you@example.com" /></FormField>
            </div>
            <label className="form-consent"><input name="confirmation" type="checkbox" required /><span>I confirm that this profile is publicly accessible and relevant to archaeology.</span></label>
            <button className="influencer-submit" type="submit"><UserPlus size={18} />Submit recommendation</button>
          </form>
          <aside className="submission-sidebar" aria-label="Submission guidance">
            <p className="eyebrow">What we’re looking for</p>
            <h3>Useful, credible archaeology voices</h3>
            <ul><li>Educational content grounded in evidence</li><li>Respect for cultural heritage and descendant communities</li><li>Active public outreach, fieldwork, research, or museum work</li><li>No promotion of looting or illicit artifact sales</li></ul>
          </aside>
        </div>
      )}

      {submittedName && <p className="submission-success" role="status">Thanks! {submittedName} was added to the creator directory for this session.</p>}
      <div className="creator-grid" aria-label="Featured social media creators">
        {creators.map((creator) => <CreatorCard creator={creator} key={creator.id} onSelect={() => setSelectedCreator(creator)} />)}
      </div>

      {selectedCreator && (
        <div className="job-detail-modal" role="presentation" onMouseDown={() => setSelectedCreator(null)}>
          <section className="detail-panel creator-detail-panel" role="dialog" aria-modal="true" aria-labelledby="creator-detail-heading" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelectedCreator(null)} aria-label="Close creator details">×</button>
            <div className="creator-detail-banner" aria-hidden="true">
              <div className="creator-avatar creator-detail-avatar">{selectedCreator.initials}</div>
            </div>
            <div className="detail-content">
              <span className="creator-platform creator-detail-platform"><PlatformMark platform={selectedCreator.platform} />{selectedCreator.platform}</span>
              <div>
                <h2 id="creator-detail-heading">{selectedCreator.name}</h2>
                <p className="creator-detail-handle">{selectedCreator.handle}</p>
              </div>
              <div className="creator-detail-section">
                <p className="eyebrow">Content focus</p>
                <strong>{selectedCreator.focus}</strong>
              </div>
              <div className="creator-detail-section">
                <p className="eyebrow">Platform accounts</p>
                <dl className="creator-account-details">
                  {(selectedCreator.accounts ?? [{ platform: selectedCreator.platform, handle: selectedCreator.handle }]).map((account) => (
                    <div key={`${account.platform}-${account.handle}`}><dt>{account.platform}</dt><dd>{account.handle}</dd></div>
                  ))}
                </dl>
              </div>
              <div className="creator-detail-section">
                <p className="eyebrow">About this creator</p>
                <p>{selectedCreator.description}</p>
              </div>
              <div className="detail-actions">
                <a className="primary-action" href={selectedCreator.profileUrl} target="_blank" rel="noreferrer"><ExternalLink size={18} />Visit creator profile</a>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function PlatformMark({ platform }) {
  const icons = { Instagram, TikTok: Music2, YouTube: Youtube, X, Podcast, Other: Globe2 };
  const PlatformIcon = icons[platform] ?? UserPlus;
  return <PlatformIcon size={16} aria-hidden="true" />;
}

function CreatorCard({ creator, onSelect }) {
  const accounts = creator.accounts ?? [{ platform: creator.platform, handle: creator.handle }];
  return (
    <article className="creator-card" role="button" tabIndex="0" onClick={onSelect} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(); } }}>
      <div className="creator-cover-placeholder" aria-label="Account cover image placeholder">
        <span>Cover image</span>
      </div>
      <div className="creator-card-name"><h3>{creator.name}</h3><p className="creator-handle">{creator.handle}</p></div>
      <div className="creator-account-buttons" aria-label={`${creator.name} accounts`}>
        {accounts.map((account) => (
          <button className="creator-account-button" type="button" key={`${account.platform}-${account.handle}`} onClick={(event) => event.stopPropagation()} title={`${account.platform} link coming soon`}>
            <PlatformMark platform={account.platform} />
            <span>{account.platform}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

function FormField({ label, hint, wide = false, children }) {
  return <label className={wide ? "form-field form-field-wide" : "form-field"}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
