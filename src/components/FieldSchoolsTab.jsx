import { useEffect, useState } from "react";
import { ExternalLink, GraduationCap, Plus } from "lucide-react";
import { normalizeFieldSchoolRow } from "../data/fieldSchools";
import { supabase } from "../supabaseClient";

export default function FieldSchoolsTab() {
  const [fieldSchools, setFieldSchools] = useState([]);
  const [fieldSchoolsLoading, setFieldSchoolsLoading] = useState(true);
  const [fieldSchoolsError, setFieldSchoolsError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedFieldSchool, setSelectedFieldSchool] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    async function getFieldSchools() {
      setFieldSchoolsLoading(true);
      setFieldSchoolsError("");

      const { data, error } = await supabase
        .from("field_schools")
        .select("id, program_name, location, website_url, start_date, end_date, application_deadline, cost, season_year, organization, format, methods_taught, program_description, is_active")
        .order("start_date", { ascending: true, nullsFirst: false });

      if (!isCurrent) return;

      if (error) {
        console.error("Error fetching field schools:", error);
        setFieldSchoolsError(error.message);
        setFieldSchoolsLoading(false);
        return;
      }

      setFieldSchools((data ?? []).filter((row) => row.is_active !== false).map(normalizeFieldSchoolRow));
      setFieldSchoolsLoading(false);
    }

    getFieldSchools();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedFieldSchool) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedFieldSchool(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFieldSchool]);

  return (
    <section className="field-schools-panel" aria-labelledby="field-schools-heading">
      <div className="field-schools-heading">
        <div>
          <p className="eyebrow">Training opportunities</p>
          <h2 id="field-schools-heading">Archaeology Field Schools</h2>
          <p>All field schools are listed for free on Ancient Opportunity to help inspire and support the next generation of archaeologists.</p>
        </div>
        {showForm ? (
          <button
            className="form-close"
            type="button"
            onClick={() => setShowForm(false)}
            aria-label="Close field school form"
            title="Close form"
          >
            ×
          </button>
        ) : (
          <button className="post-job-button" type="button" onClick={() => setShowForm(true)}>
            <Plus size={18} />
            List A Field School
          </button>
        )}
      </div>

      {showForm && <FieldSchoolForm onCancel={() => setShowForm(false)} />}

      <div className="field-school-grid">
        {fieldSchools.map((fieldSchool) => (
          <article
            className="field-school-card"
            key={fieldSchool.id}
          >
            <button
              className="card-open-button"
              type="button"
              aria-label={`View details for ${fieldSchool.name}`}
              onClick={() => setSelectedFieldSchool(fieldSchool)}
            />
            <div className="field-school-card-top">
              <span className="source-badge">Field School</span>
              <GraduationCap size={22} aria-hidden="true" />
            </div>
            <h3>{fieldSchool.name}</h3>
            <strong className="field-school-organization">{fieldSchool.organization}</strong>
            <dl className="field-school-details">
              <div><dt>Location</dt><dd>{fieldSchool.location}</dd></div>
              <div><dt>Dates</dt><dd>{fieldSchool.dates}</dd></div>
              <div><dt>Season / year</dt><dd>{fieldSchool.seasonYear ?? "Not specified"}</dd></div>
              <div><dt>Apply by</dt><dd>{fieldSchool.applicationDeadline}</dd></div>
              <div><dt>Cost</dt><dd>{fieldSchool.cost}</dd></div>
              <div><dt>Format</dt><dd>{fieldSchool.format}</dd></div>
            </dl>
            <p className="field-school-description field-school-card-description">
              {getDescriptionPreview(fieldSchool.description)}
            </p>
            <div className="tag-row">{fieldSchool.methods.map((method) => <span key={method}>{method}</span>)}</div>
            {fieldSchool.website && (
              <a className="conference-website" href={fieldSchool.website} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                <span>Visit program website</span><ExternalLink size={17} />
              </a>
            )}
          </article>
        ))}

        {fieldSchoolsLoading && (
          <div className="empty-state" role="status">
            <GraduationCap size={28} />
            <h3>Loading field schools…</h3>
            <p>Connecting to the Supabase field schools table.</p>
          </div>
        )}

        {!fieldSchoolsLoading && fieldSchoolsError && (
          <div className="empty-state" role="alert">
            <GraduationCap size={28} />
            <h3>Could not load field schools.</h3>
            <p>{fieldSchoolsError}</p>
          </div>
        )}

        {!fieldSchoolsLoading && !fieldSchoolsError && fieldSchools.length === 0 && (
          <div className="empty-state">
            <GraduationCap size={28} />
            <h3>No field schools are currently listed.</h3>
            <p>Check back soon for new training opportunities.</p>
          </div>
        )}
      </div>

      {selectedFieldSchool && (
        <div className="job-detail-modal" role="presentation" onMouseDown={() => setSelectedFieldSchool(null)}>
          <section
            className="detail-panel field-school-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="field-school-detail-heading"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={() => setSelectedFieldSchool(null)} aria-label="Close field school details">×</button>
            <div className="detail-image" aria-hidden="true" />
            <div className="detail-content">
              <div className="detail-company-heading">
                <div className="company-logo-placeholder detail-company-logo" aria-hidden="true">
                  <GraduationCap size={24} />
                </div>
                <span className="source-badge">Field school</span>
              </div>
              <h2 id="field-school-detail-heading">{selectedFieldSchool.name}</h2>
              <strong className="field-school-organization">{selectedFieldSchool.organization}</strong>
              <p className="field-school-description">{selectedFieldSchool.description}</p>
              <dl className="detail-list">
                <div><dt>Location</dt><dd>{selectedFieldSchool.location}</dd></div>
                <div><dt>Program dates</dt><dd>{selectedFieldSchool.dates}</dd></div>
                <div><dt>Season / year</dt><dd>{selectedFieldSchool.seasonYear ?? "Not specified"}</dd></div>
                <div><dt>Apply by</dt><dd>{selectedFieldSchool.applicationDeadline}</dd></div>
                <div><dt>Cost</dt><dd>{selectedFieldSchool.cost}</dd></div>
                <div><dt>Format</dt><dd>{selectedFieldSchool.format}</dd></div>
              </dl>
              <div className="tag-row">{selectedFieldSchool.methods.map((method) => <span key={method}>{method}</span>)}</div>
              {selectedFieldSchool.website && (
                <div className="detail-actions">
                  <a className="primary-action" href={selectedFieldSchool.website} target="_blank" rel="noreferrer">
                    <ExternalLink size={18} />Visit program website
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function FieldSchoolForm({ onCancel }) {
  const [seasonError, setSeasonError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const seasons = data.getAll("seasonYear");
    const contactEmail = String(data.get("contactEmail") ?? "").trim();
    const emailInput = form.elements.namedItem("contactEmail");
    setSeasonError("");
    setEmailError("");
    setSubmissionError("");
    setSubmissionSuccess("");

    if (contactEmail && !isValidEmail(contactEmail)) {
      const message = "Enter a valid email address, such as name@example.com.";
      setEmailError(message);
      emailInput.setCustomValidity(message);
      emailInput.reportValidity();
      emailInput.focus();
      return;
    }

    emailInput.setCustomValidity("");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (seasons.length === 0) {
      setSeasonError("Select at least one season.");
      return;
    }

    const startDate = String(data.get("startDate") ?? "");
    const endDate = String(data.get("endDate") ?? "");
    if (endDate < startDate) {
      setSubmissionError("The end date cannot be earlier than the start date.");
      return;
    }

    const costInput = String(data.get("cost") ?? "").trim();
    const listing = {
      program_name: String(data.get("name") ?? "").trim(),
      organization: String(data.get("organization") ?? "").trim(),
      location: String(data.get("location") ?? "").trim(),
      website_url: String(data.get("website") ?? "").trim(),
      start_date: startDate,
      end_date: endDate,
      application_deadline: optionalText(data.get("applicationDeadline")),
      cost: costInput ? Number(costInput) : null,
      season_year: seasons.join(", "),
      format: optionalText(data.get("format")),
      methods_taught: optionalText(data.get("methods")),
      program_description: String(data.get("description") ?? "").trim(),
      is_active: false,
    };

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc("submit_field_school", {
        p_program_name: listing.program_name,
        p_location: listing.location,
        p_website_url: listing.website_url,
        p_start_date: listing.start_date,
        p_end_date: listing.end_date,
        p_application_deadline: listing.application_deadline,
        p_cost: listing.cost,
        p_season_year: listing.season_year,
        p_organization: listing.organization,
        p_format: listing.format,
        p_methods_taught: listing.methods_taught,
        p_program_description: listing.program_description,
        p_contact_email: contactEmail,
      });

      if (error) {
        console.error("Error submitting field school:", {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        setSubmissionError("We couldn't submit the field school. Please try again.");
        return;
      }

      form.reset();
      setSubmissionSuccess("Your field school was submitted successfully and will appear on Ancient Opportunity after it has been reviewed.");
    } catch (error) {
      console.error("Unexpected error submitting field school:", error);
      setSubmissionError("We couldn't submit the field school. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="field-school-form" onSubmit={handleSubmit} noValidate>
      <div className="form-section-heading"><h3>Field school details</h3><p>Fields marked with * are required.</p></div>
      <div className="form-grid">
        <FormField label="Program name *"><input name="name" required placeholder="Field school name" /></FormField>
        <FormField label="Organization *"><input name="organization" required placeholder="University, museum, or organization" /></FormField>
        <FormField label="Location *"><input name="location" required placeholder="City, State or Country" /></FormField>
        <FormField label="Cost (USD)"><input name="cost" type="number" inputMode="decimal" min="0" step="0.01" placeholder="2500" /></FormField>
        <div className="field-school-date-fields form-field-wide">
          <FormField label="Start Date *"><input name="startDate" type="date" required /></FormField>
          <FormField label="End Date *"><input name="endDate" type="date" required /></FormField>
          <FormField label="Application deadline"><input name="applicationDeadline" type="date" /></FormField>
        </div>
        <fieldset className="job-title-field form-field-wide">
          <legend>Season / year * <small>Select all that apply</small></legend>
          <div className="job-title-options">
            {["Fall 2026", "Winter 2026", "Spring 2027", "Summer 2027", "Fall 2027", "Winter 2027"].map((season) => (
              <label key={season}>
                <input name="seasonYear" type="checkbox" value={season} onChange={() => setSeasonError("")} />
                <span>{season}</span>
              </label>
            ))}
          </div>
          {seasonError && <p className="field-error" role="alert">{seasonError}</p>}
        </fieldset>
        <FormField label="Format / Credits"><input name="format" placeholder="4 weeks · 6 credits" /></FormField>
        <FormField label="Methods Taught" hint="Separate methods with commas."><input name="methods" placeholder="Survey, excavation, GIS, artifact analysis" /></FormField>
        <FormField label="Program Description *" wide><textarea name="description" required rows="5" placeholder="Describe the site, training, eligibility, housing, and learning goals." /></FormField>
        <FormField
          label="Program Website *"
          wide
          hint="Include the full website address. Example: https://www.example.com/field-school — not: www.example.com/field-school"
        >
          <input name="website" type="url" required placeholder="https://www.example.com/field-school" />
        </FormField>
        <FormField
          label="Contact Email *"
          wide
          hint="This email will not be shared publicly and will only be used to contact you if there is an issue with your field school posting."
        >
          <input
            name="contactEmail"
            type="email"
            required
            placeholder="fieldschool@example.edu"
            aria-describedby={emailError ? "field-school-email-error" : undefined}
            aria-invalid={Boolean(emailError)}
            onBlur={(event) => {
              const email = event.target.value.trim();
              const message = email && !isValidEmail(email) ? "Enter a valid email address, such as name@example.com." : "";
              event.target.setCustomValidity(message);
              setEmailError(message);
            }}
            onChange={(event) => {
              if (isValidEmail(event.target.value.trim())) {
                event.target.setCustomValidity("");
                setEmailError("");
              }
            }}
          />
          {emailError && <small className="field-error" id="field-school-email-error" role="alert">{emailError}</small>}
        </FormField>
      </div>
      <div className="job-form-actions">
        <button className="secondary-action" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button className="influencer-submit" type="submit" disabled={isSubmitting}>
          <Plus size={18} />{isSubmitting ? "Submitting..." : "Submit Field School"}
        </button>
      </div>
      {submissionError && <p className="field-error" role="alert">{submissionError}</p>}
      {submissionSuccess && <p className="submission-success" role="status">{submissionSuccess}</p>}
    </form>
  );
}

function FormField({ label, hint, wide = false, children }) {
  return <label className={wide ? "form-field form-field-wide" : "form-field"}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function optionalText(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

function getDescriptionPreview(description) {
  const text = description.trim();
  const sentences = text.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g) ?? [text];
  const firstTwoSentences = sentences.slice(0, 2).join(" ").trim();
  const maximumLength = 180;
  let preview = firstTwoSentences;

  if (preview.length > maximumLength) {
    const shortened = preview.slice(0, maximumLength + 1);
    preview = shortened.slice(0, shortened.lastIndexOf(" ")).trim();
  }

  return preview.length < text.length ? `${preview.replace(/[.!?]+$/, "")}…` : preview;
}
