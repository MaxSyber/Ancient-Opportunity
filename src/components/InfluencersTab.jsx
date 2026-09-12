import { useEffect, useState } from "react";
import { ExternalLink, Globe2, Instagram, Music2, Podcast, Plus, UserPlus, X, Youtube } from "lucide-react";
import { createSocialListing, getSocialListings, SOCIAL_PLATFORMS } from "../data/socialListings";

export default function InfluencersTab() {
  const [creators, setCreators] = useState([]);
  const [creatorsLoading, setCreatorsLoading] = useState(true);
  const [creatorsError, setCreatorsError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [platformError, setPlatformError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadCreators() {
      setCreatorsLoading(true);
      setCreatorsError("");
      try {
        const listings = await getSocialListings();
        if (isCurrent) setCreators(listings);
      } catch (error) {
        console.error("Error fetching social listings:", error);
        if (isCurrent) setCreatorsError(error.message);
      } finally {
        if (isCurrent) setCreatorsLoading(false);
      }
    }

    loadCreators();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCreator) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedCreator(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCreator]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const platformUrls = Object.fromEntries(SOCIAL_PLATFORMS.map(({ field }) => [field, optionalText(data.get(field))]));
    const primaryProfileUrl = String(data.get("profileUrl") ?? "").trim();
    const contactEmail = String(data.get("email") ?? "").trim();
    setPlatformError("");
    setSubmissionError("");
    setSubmittedName("");

    if (!Object.values(platformUrls).some(Boolean)) {
      setPlatformError("Add a profile URL for at least one platform.");
      form.elements.namedItem(SOCIAL_PLATFORMS[0].field).focus();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (![primaryProfileUrl, ...Object.values(platformUrls).filter(Boolean)].every(isValidHttpUrl)) {
      setSubmissionError("Profile links must be complete http or https URLs.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSocialListing({
        name,
        ...platformUrls,
        primary_profile_url: primaryProfileUrl,
        content_focus: String(data.get("focus") ?? "").trim(),
        channel_bio: String(data.get("recommendation") ?? "").trim(),
        contact_email: contactEmail,
      });
      form.reset();
      setSubmittedName(name);
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting social recommendation:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      setSubmissionError("We couldn't submit this recommendation. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <button className="post-job-button" type="button" onClick={() => { setShowForm(true); setSubmittedName(""); setSubmissionError(""); }}><Plus size={18} />Recommend A Creator</button>
        )}
      </div>

      {showForm && (
        <div className="influencer-layout">
          <form className="influencer-form" onSubmit={handleSubmit}>
            <div className="form-section-heading"><h3>Creator details</h3><p>Fields marked with * are required.</p></div>
            <div className="form-grid">
              <FormField label="Name or Organization *"><input name="name" type="text" required placeholder="e.g. The Archaeology Channel" /></FormField>
              <fieldset className="creator-accounts-field form-field-wide">
                <legend>Platform Accounts *</legend>
                <p>Add a complete profile URL for at least one platform.</p>
                <div className="creator-account-list">
                  {SOCIAL_PLATFORMS.map(({ label, field }) => (
                    <label className="creator-account-row" key={field}>
                      <span><PlatformMark platform={label} />{label}</span>
                      <input name={field} type="url" placeholder="https://..." onChange={() => platformError && setPlatformError("")} />
                    </label>
                  ))}
                </div>
                {platformError && <p className="field-error" role="alert">{platformError}</p>}
              </fieldset>
              <FormField label="Primary Profile URL *" wide><input name="profileUrl" type="url" required placeholder="https://..." /></FormField>
              <FormField label="Content Focus *" wide><input name="focus" type="text" required placeholder="e.g. Experimental archaeology, CRM careers, museum education" /></FormField>
              <FormField label="Channel Bio *" wide><textarea name="recommendation" required rows="5" placeholder="Account Bio" /></FormField>
              <FormField label="Contact Email *" hint="This will not be shared and will only be used to contact you if there is a problem with your account." wide><input name="email" type="email" required placeholder="you@example.com" /></FormField>
            </div>
            <label className="form-consent"><input name="confirmation" type="checkbox" required /><span>I confirm that this profile is publicly accessible and relevant to archaeology.</span></label>
            <button className="influencer-submit" type="submit" disabled={isSubmitting}><UserPlus size={18} />{isSubmitting ? "Submitting..." : "Submit Recommendation"}</button>
            {submissionError && <p className="field-error" role="alert">{submissionError}</p>}
          </form>
          <aside className="submission-sidebar" aria-label="Submission guidance">
            <p className="eyebrow">What we’re looking for</p>
            <h3>Useful, credible archaeology voices</h3>
            <ul><li>Educational content grounded in evidence</li><li>Respect for cultural heritage and descendant communities</li><li>Active public outreach, fieldwork, research, or museum work</li><li>No promotion of looting or illicit artifact sales</li></ul>
          </aside>
        </div>
      )}

      {submittedName && <p className="submission-success" role="status">Thanks! {submittedName} was submitted successfully and will appear after it has been reviewed.</p>}
      <div className="creator-grid" aria-label="Featured social media creators">
        {creators.map((creator) => <CreatorCard creator={creator} key={creator.id} onSelect={() => setSelectedCreator(creator)} />)}
        {creatorsLoading && <div className="empty-state" role="status"><UserPlus size={28} /><h3>Loading creators…</h3><p>Connecting to the social directory.</p></div>}
        {!creatorsLoading && creatorsError && <div className="empty-state" role="alert"><UserPlus size={28} /><h3>Could not load creators.</h3><p>{creatorsError}</p></div>}
        {!creatorsLoading && !creatorsError && creators.length === 0 && <div className="empty-state"><UserPlus size={28} /><h3>No creators are currently listed.</h3><p>Recommend an archaeology creator to help build the directory.</p></div>}
      </div>

      {selectedCreator && (
        <div className="job-detail-modal" role="presentation" onMouseDown={() => setSelectedCreator(null)}>
          <section className="detail-panel creator-detail-panel" role="dialog" aria-modal="true" aria-labelledby="creator-detail-heading" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelectedCreator(null)} aria-label="Close creator details">×</button>
            <div className="creator-detail-banner" aria-hidden="true">
              <img className="creator-detail-cover-image" src={selectedCreator.coverImage} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
            </div>
            <div className="detail-content">
              <div>
                <h2 id="creator-detail-heading">{selectedCreator.name}</h2>
              </div>
              <div className="creator-detail-section">
                <p className="eyebrow">Content focus</p>
                <strong>{selectedCreator.focus}</strong>
              </div>
              <div className="creator-detail-section">
                <p className="eyebrow">Platform accounts</p>
                <CreatorAccountButtons creator={selectedCreator} detail />
              </div>
              <div className="creator-detail-section">
                <p className="eyebrow">About this creator</p>
                <p>{selectedCreator.description}</p>
              </div>
              <div className="detail-actions">
                <a className="primary-action" href={selectedCreator.profileUrl} target="_blank" rel="noreferrer"><ExternalLink size={18} />Visit Creator's Main Page</a>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function PlatformMark({ platform }) {
  const icons = { Instagram, TikTok: Music2, YouTube: Youtube, X, Podcast, "Other/Personal Website": Globe2, Website: Globe2 };
  const PlatformIcon = icons[platform] ?? UserPlus;
  return <PlatformIcon size={16} aria-hidden="true" />;
}

function CreatorCard({ creator, onSelect }) {
  const focusTags = getContentFocusTags(creator.focus);
  return (
    <article className="creator-card">
      <button className="card-open-button" type="button" aria-label={`View details for ${creator.name}`} onClick={onSelect} />
      <div className="creator-cover-placeholder">
        <img src={creator.coverImage} alt={`${creator.name}, archaeology creator`} onError={(event) => { event.currentTarget.hidden = true; }} />
        <span>Cover image</span>
      </div>
      <div className="creator-card-name"><h3>{creator.name}</h3></div>
      <CreatorAccountButtons creator={creator} />
      <p className="creator-description creator-bio-preview">{getBioPreview(creator.description)}</p>
      {focusTags.length > 0 && (
        <div className="tag-row creator-focus-tags" aria-label="Content focus">
          {focusTags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      )}
    </article>
  );
}

function CreatorAccountButtons({ creator, detail = false }) {
  const accounts = creator.accounts ?? [{
    platform: creator.platform,
    handle: creator.handle,
    url: creator.profileUrl,
    isPrimary: true,
  }];

  return (
    <div className={detail ? "creator-account-buttons creator-detail-account-buttons" : "creator-account-buttons"} aria-label={`${creator.name} accounts`}>
      {accounts.map((account) => (
        <a
          className={account.isPrimary ? "creator-account-button creator-account-button-primary" : "creator-account-button"}
          href={account.url ?? creator.profileUrl}
          target="_blank"
          rel="noreferrer"
          key={`${account.platform}-${account.handle}`}
          onClick={(event) => event.stopPropagation()}
          aria-label={`${account.platform}${account.isPrimary ? " (primary account)" : ""}`}
        >
          <PlatformMark platform={account.platform} />
          <span>{account.platform}</span>
        </a>
      ))}
    </div>
  );
}

function FormField({ label, hint, wide = false, children }) {
  return <label className={wide ? "form-field form-field-wide" : "form-field"}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function optionalText(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getBioPreview(value) {
  const bio = String(value ?? "").trim();
  if (!bio) return "";
  const firstSentence = bio.match(/^[\s\S]*?[.!?](?=\s|$)/)?.[0];
  const previewLength = Math.min(bio.length, (firstSentence?.length ?? 0) + 60);
  let preview = bio.slice(0, previewLength).trim();

  if (previewLength < bio.length && preview.includes(" ")) {
    preview = preview.slice(0, preview.lastIndexOf(" "));
  }

  return `${preview.replace(/[.!?]+$/, "")}...`;
}

function getContentFocusTags(value) {
  return String(value ?? "").split(",").map((tag) => tag.trim()).filter(Boolean);
}
