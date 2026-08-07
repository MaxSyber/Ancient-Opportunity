import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  MapPin,
  Plus,
  Search,
  Star,
} from "lucide-react";
import { jobTitles, jobTypes } from "../data/jobs";

export default function JobsTab({
  filteredJobs,
  selectedJob,
  selectedId,
  setSelectedId,
  savedIds,
  toggleSaved,
  query,
  setQuery,
  datePosted,
  setDatePosted,
  selectedJobTitles,
  setSelectedJobTitles,
  type,
  setType,
  addJob,
}) {
  const [showJobForm, setShowJobForm] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);

  useEffect(() => {
    if (!showJobDetails) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setShowJobDetails(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showJobDetails]);

  const handleAddJob = (job) => {
    addJob(job);
    setShowJobForm(false);
  };

  return (
    <>
      <section className="controls-band" aria-label="Search and filters">
        <div className="search-box">
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, site type, agency, GIS, collections..."
            aria-label="Search archaeology jobs"
          />
        </div>
        <SelectControl
          icon={<CalendarDays size={18} />}
          label="Date posted"
          value={datePosted}
          onChange={setDatePosted}
          options={["Any date", "Past 24 hrs", "Past 3 days", "Past week", "Past month"]}
        />
        <MultiSelectControl
          icon={<Star size={18} />}
          label="Job Titles"
          values={selectedJobTitles}
          onChange={setSelectedJobTitles}
          options={jobTitles.slice(1)}
        />
        <SelectControl icon={<BriefcaseBusiness size={18} />} label="Type" value={type} onChange={setType} options={jobTypes} />
      </section>

      {showJobForm && <JobPostingForm onSubmit={handleAddJob} onCancel={() => setShowJobForm(false)} />}

      <section className="dashboard-grid">
        <section className="jobs-column" aria-label="Job listings">
          <div className="list-heading">
            <div>
              <p className="eyebrow">Open roles</p>
              <h2>{filteredJobs.length} listings found</h2>
            </div>
            <div className="list-actions">
              <button
                className="post-job-button"
                type="button"
                onClick={() => setShowJobForm(true)}
                title="Jobs posted directly on Ancient Opportunity will appear above listings gathered from external sources."
                aria-describedby="post-job-tooltip"
              >
                <Plus size={18} />
                <span>Post a job</span>
              </button>
              <span className="sr-only" id="post-job-tooltip">
                Jobs posted directly on Ancient Opportunity will appear above listings gathered from external sources.
              </span>
            </div>
          </div>

          <div className="job-list">
            {filteredJobs.map((job) => (
              <article
                className={selectedJob.id === job.id ? "job-card selected" : "job-card"}
                key={job.id}
                role="button"
                tabIndex="0"
                onClick={() => {
                  setSelectedId(job.id);
                  setShowJobDetails(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(job.id);
                    setShowJobDetails(true);
                  }
                }}
              >
                <div className="company-logo-placeholder" aria-label={`${job.employer.name} logo placeholder`}>
                  <Building2 size={30} aria-hidden="true" />
                </div>
                <div className="job-card-content">
                  <div className="job-card-top">
                    <div>
                      <span className="job-card-label">Title</span>
                      <h3>{job.title}</h3>
                    </div>
                    <span className="source-badge">{job.source.name}</span>
                  </div>
                  <p className="company-line"><Building2 size={16} />{job.employer.name}</p>
                  <div className="job-card-facts">
                    <div>
                      <span className="job-card-label">Job title</span>
                      <strong>{job.jobTitles.join(" · ")}</strong>
                    </div>
                    <div>
                      <span className="job-card-label">Location</span>
                      <strong><MapPin size={16} />{job.location.display}</strong>
                    </div>
                    <div>
                      <span className="job-card-label">Pay</span>
                      <strong>{job.compensation.display}</strong>
                    </div>
                    <div>
                      <span className="job-card-label">Posted</span>
                      <strong>{job.dates.postedLabel}</strong>
                    </div>
                  </div>
                </div>
                <div className="job-card-save">
                  <button
                    className={savedIds.has(job.id) ? "save-button saved" : "save-button"}
                    type="button"
                    aria-label={savedIds.has(job.id) ? "Unsave job" : "Save job"}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSaved(job.id);
                    }}
                  >
                    <Bookmark size={17} />
                  </button>
                </div>
              </article>
            ))}

            {filteredJobs.length === 0 && (
              <div className="empty-state">
                <Search size={28} />
                <h3>No mock listings match those filters.</h3>
                <p>Try widening the date, job title, or search text.</p>
              </div>
            )}
          </div>
        </section>

      </section>

      {showJobDetails && (
        <div className="job-detail-modal" role="presentation" onMouseDown={() => setShowJobDetails(false)}>
          <section
            className="detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-detail-heading"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={() => setShowJobDetails(false)} aria-label="Close job details">×</button>
            <div className="detail-image" aria-hidden="true" />
            <div className="detail-content">
              <span className="source-badge">{selectedJob.source.name}</span>
              <h2 id="job-detail-heading">{selectedJob.title}</h2>
              {selectedJob.description.html ? (
                <div className="job-description-rich" dangerouslySetInnerHTML={{ __html: selectedJob.description.html }} />
              ) : (
                <p className="job-description-plain">{selectedJob.description.summary}</p>
              )}
              <dl className="detail-list">
                <div><dt>Organization</dt><dd>{selectedJob.employer.name}</dd></div>
                <div><dt>Location</dt><dd>{selectedJob.location.display}</dd></div>
                <div><dt>Compensation</dt><dd>{selectedJob.compensation.display}</dd></div>
                <div><dt>Schedule</dt><dd>{selectedJob.schedule}</dd></div>
              </dl>
              <div className="detail-actions">
                <a
                  className="primary-action"
                  href={selectedJob.urls.sourcePosting}
                  target="_blank"
                  rel="noreferrer"
                  title="See Original Post"
                  aria-describedby="view-posting-tooltip"
                >
                  <ExternalLink size={18} />View posting
                </a>
                <span className="sr-only" id="view-posting-tooltip">See Original Post</span>
                <button className={savedIds.has(selectedJob.id) ? "secondary-action saved" : "secondary-action"} type="button" onClick={() => toggleSaved(selectedJob.id)}><Bookmark size={18} />{savedIds.has(selectedJob.id) ? "Saved" : "Save"}</button>
              </div>
              <div className="freshness-note"><CalendarDays size={17} /><span>Posted {selectedJob.dates.postedLabel}; {selectedJob.description.attribution}</span></div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function JobPostingForm({ onSubmit, onCancel }) {
  const [jobTitleError, setJobTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const descriptionRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selectedTitles = data.getAll("jobTitles");
    if (selectedTitles.length === 0) {
      setJobTitleError("Select at least one job title.");
      return;
    }
    const descriptionText = descriptionRef.current?.innerText.trim() || "";
    if (!descriptionText) {
      setDescriptionError("Enter a job description.");
      descriptionRef.current?.focus();
      return;
    }
    const descriptionHtml = sanitizeRichText(descriptionRef.current.innerHTML);
    const location = data.get("location").trim();
    const postingUrl = data.get("postingUrl");
    const today = new Date().toISOString().slice(0, 10);
    onSubmit({
      id: `community-${Date.now()}`,
      source: { name: "Community", externalId: null, url: postingUrl },
      title: data.get("title").trim(),
      employer: { name: data.get("organization").trim(), type: "Community submitted" },
      location: { display: location, city: null, state: null, country: "US", isRemote: /remote/i.test(location) },
      workplace: /remote/i.test(location) ? "Remote" : "On-site / field-based",
      employmentType: data.get("employmentType") || "Not specified",
      jobTitles: selectedTitles,
      compensation: { display: data.get("compensation").trim(), minAmount: null, maxAmount: null, currency: "USD", interval: null },
      dates: { postedLabel: "Just posted", postedDate: today, closingDate: null, importedAt: today },
      schedule: data.get("employmentType") || "Not specified",
      tags: selectedTitles,
      description: { summary: descriptionText, html: descriptionHtml, attribution: "Community-submitted listing; review pending." },
      urls: { sourcePosting: postingUrl, apply: postingUrl },
      savedByDefault: false,
    });
  };

  return (
    <section className="job-form-panel" aria-labelledby="post-job-heading">
      <div className="job-form-heading">
        <div><p className="eyebrow">Community listing</p><h2 id="post-job-heading">Post an archaeology job</h2><p>Share a role with archaeology and cultural-resource professionals.</p></div>
        <button className="form-close" type="button" onClick={onCancel} aria-label="Close job form">×</button>
      </div>
      <form className="job-posting-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <FormField label="Job title *"><input name="title" required placeholder="e.g. Archaeological Field Technician" /></FormField>
          <FormField label="Organization *"><input name="organization" required placeholder="Company, agency, or nonprofit" /></FormField>
          <fieldset className="job-title-field form-field-wide">
            <legend>Job Titles * <small>Select all that apply</small></legend>
            <div className="job-title-options">
              {jobTitles.slice(1).map((jobTitle) => (
                <label key={jobTitle}><input name="jobTitles" type="checkbox" value={jobTitle} onChange={() => setJobTitleError("")} /><span>{jobTitle}</span></label>
              ))}
            </div>
            {jobTitleError && <p className="field-error" role="alert">{jobTitleError}</p>}
          </fieldset>
          <FormField label="Employment type (optional)"><select name="employmentType" defaultValue=""><option value="">Not specified</option>{jobTypes.slice(1).map((jobType) => <option key={jobType}>{jobType}</option>)}</select></FormField>
          <FormField label="Location *"><input name="location" required placeholder="City, State or Remote" /></FormField>
          <FormField label="Compensation *"><input name="compensation" required placeholder="$22–28/hr or $60,000/year" /></FormField>
          <div className="form-field form-field-wide">
            <span>Job description *</span>
            <div className="rich-text-editor">
              <div className="rich-text-toolbar" aria-label="Description formatting">
                <button type="button" onMouseDown={(event) => { event.preventDefault(); document.execCommand("bold"); }} aria-label="Bold selected text"><strong>B</strong></button>
                <button type="button" onMouseDown={(event) => { event.preventDefault(); document.execCommand("italic"); }} aria-label="Italicize selected text"><em>I</em></button>
                <button type="button" onMouseDown={(event) => { event.preventDefault(); document.execCommand("insertUnorderedList"); }} aria-label="Create bulleted list">• List</button>
              </div>
              <div
                ref={descriptionRef}
                className="rich-text-input"
                contentEditable
                role="textbox"
                aria-multiline="true"
                aria-label="Job description"
                aria-describedby={descriptionError ? "description-error" : undefined}
                data-placeholder="Paste or enter the role, responsibilities, and qualifications. Formatting and paragraph spacing will be preserved."
                onInput={() => setDescriptionError("")}
                suppressContentEditableWarning
              />
            </div>
            {descriptionError && <p className="field-error" id="description-error" role="alert">{descriptionError}</p>}
            <small>Paragraphs, blank lines, bold, italics, lists, and pasted font styles are preserved.</small>
          </div>
          <FormField label="Job posting URL *" wide><input name="postingUrl" type="url" required placeholder="https://..." /></FormField>
          <FormField label="Contact email (optional)" wide hint="Used for moderation or questions about the listing."><input name="contactEmail" type="email" placeholder="hiring@example.com" /></FormField>
        </div>
        <div className="job-form-actions">
          <button className="secondary-action" type="button" onClick={onCancel}>Cancel</button>
          <button className="influencer-submit" type="submit"><Plus size={18} />Publish listing</button>
        </div>
      </form>
    </section>
  );
}

function sanitizeRichText(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const allowedTags = new Set(["P", "DIV", "BR", "STRONG", "B", "EM", "I", "U", "UL", "OL", "LI", "H1", "H2", "H3", "H4", "SPAN"]);

  [...template.content.querySelectorAll("*")].forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const fontFamily = element.style.fontFamily;
    const fontSize = element.style.fontSize;
    const fontWeight = element.style.fontWeight;
    const fontStyle = element.style.fontStyle;
    const textDecoration = element.style.textDecoration;
    [...element.attributes].forEach((attribute) => element.removeAttribute(attribute.name));

    if (fontFamily) element.style.fontFamily = fontFamily;
    if (fontSize) element.style.fontSize = fontSize;
    if (fontWeight) element.style.fontWeight = fontWeight;
    if (fontStyle) element.style.fontStyle = fontStyle;
    if (textDecoration) element.style.textDecoration = textDecoration;
  });

  return template.innerHTML;
}

function FormField({ label, hint, wide = false, children }) {
  return <label className={wide ? "form-field form-field-wide" : "form-field"}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function SelectControl({ icon, label, value, onChange, options }) {
  return (
    <label className="select-control">
      <span className="select-label">{icon}{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function MultiSelectControl({ icon, label, values, onChange, options }) {
  const toggleValue = (option) => {
    onChange(values.includes(option)
      ? values.filter((value) => value !== option)
      : [...values, option]);
  };

  const summary = values.length === 0
    ? "Any job title"
    : values.length === 1
      ? values[0]
      : `${values.length} job titles selected`;

  return (
    <details className="multi-select-control">
      <summary>
        <span className="select-label">{icon}{label}</span>
        <strong>{summary}</strong>
      </summary>
      <div className="multi-select-menu">
        <button type="button" className="multi-select-clear" onClick={() => onChange([])} disabled={values.length === 0}>
          Any job title
        </button>
        {options.map((option) => (
          <label key={option}>
            <input type="checkbox" checked={values.includes(option)} onChange={() => toggleValue(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </details>
  );
}
