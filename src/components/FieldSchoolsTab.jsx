import { useEffect, useState } from "react";
import { CalendarDays, ExternalLink, GraduationCap, MapPin, Plus } from "lucide-react";
import { fieldSchools as initialFieldSchools } from "../data/fieldSchools";
import { supabase } from "../supabaseClient";

async function getFieldSchools() {
  const { data, error } = await supabase
    .from("field_schools")
    .select("*");

  if (error) {
    console.error("Error fetching field schools:", error);
    return;
  }

  console.log("Field schools:", data);
}

export default function FieldSchoolsTab() {
  const [fieldSchools, setFieldSchools] = useState(initialFieldSchools);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getFieldSchools();
  }, []);

  const addFieldSchool = (fieldSchool) => {
    setFieldSchools((current) => [fieldSchool, ...current]);
    setShowForm(false);
  };

  return (
    <section className="field-schools-panel" aria-labelledby="field-schools-heading">
      <div className="field-schools-heading">
        <div>
          <p className="eyebrow">Training opportunities</p>
          <h2 id="field-schools-heading">Archaeology field schools</h2>
          <p>All field schools are listed for free on Ancient Opportunity to help inspire and support the next generation of archaeologists.</p>
          <p className="section-progress-notice" role="status">This section is still in progress.</p>
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
            List a field school
          </button>
        )}
      </div>

      {showForm && <FieldSchoolForm onSubmit={addFieldSchool} onCancel={() => setShowForm(false)} />}

      <div className="field-school-grid">
        {fieldSchools.map((fieldSchool) => (
          <article className="field-school-card" key={fieldSchool.id}>
            <div className="field-school-card-top">
              <span className={fieldSchool.isMock ? "source-badge mock-badge" : "source-badge"}>
                {fieldSchool.isMock ? "Mock field school" : "Community submitted"}
              </span>
              <GraduationCap size={22} aria-hidden="true" />
            </div>
            <h3>{fieldSchool.name}</h3>
            <strong className="field-school-organization">{fieldSchool.organization}</strong>
            <p className="field-school-meta"><MapPin size={17} /><span>{fieldSchool.location}</span></p>
            <p className="field-school-meta"><CalendarDays size={17} /><span>{fieldSchool.dates}</span></p>
            <dl className="field-school-details">
              <div><dt>Apply by</dt><dd>{fieldSchool.applicationDeadline}</dd></div>
              <div><dt>Cost</dt><dd>{fieldSchool.cost}</dd></div>
              <div><dt>Format</dt><dd>{fieldSchool.format}</dd></div>
            </dl>
            <p className="field-school-description">{fieldSchool.description}</p>
            <div className="tag-row">{fieldSchool.methods.map((method) => <span key={method}>{method}</span>)}</div>
            <a className="conference-website" href={fieldSchool.website} target="_blank" rel="noreferrer">
              <span>Visit program website</span><ExternalLink size={17} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function FieldSchoolForm({ onSubmit, onCancel }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const methods = data.get("methods").split(",").map((method) => method.trim()).filter(Boolean);
    onSubmit({
      id: `community-field-school-${Date.now()}`,
      name: data.get("name").trim(),
      organization: data.get("organization").trim(),
      location: data.get("location").trim(),
      dates: `${formatDate(data.get("startDate"))}–${formatDate(data.get("endDate"))}`,
      applicationDeadline: data.get("applicationDeadline") ? formatDate(data.get("applicationDeadline")) : "Not specified",
      cost: data.get("cost").trim() || "Not specified",
      format: data.get("format").trim() || "Not specified",
      methods: methods.length ? methods : ["Field methods"],
      description: data.get("description").trim(),
      website: data.get("website"),
      isMock: false,
    });
  };

  return (
    <form className="field-school-form" onSubmit={handleSubmit}>
      <div className="form-section-heading"><h3>Field school details</h3><p>Fields marked with * are required.</p></div>
      <div className="form-grid">
        <FormField label="Program name *"><input name="name" required placeholder="Field school name" /></FormField>
        <FormField label="Organization *"><input name="organization" required placeholder="University, museum, or organization" /></FormField>
        <FormField label="Location *" wide><input name="location" required placeholder="City, State or Country" /></FormField>
        <FormField label="Start date *"><input name="startDate" type="date" required /></FormField>
        <FormField label="End date *"><input name="endDate" type="date" required /></FormField>
        <FormField label="Application deadline"><input name="applicationDeadline" type="date" /></FormField>
        <FormField label="Cost"><input name="cost" placeholder="$2,500, free, or funded" /></FormField>
        <FormField label="Format / credits" wide><input name="format" placeholder="4 weeks · 6 credits" /></FormField>
        <FormField label="Methods taught" wide hint="Separate methods with commas."><input name="methods" placeholder="Survey, excavation, GIS, artifact analysis" /></FormField>
        <FormField label="Program description *" wide><textarea name="description" required rows="5" placeholder="Describe the site, training, eligibility, housing, and learning goals." /></FormField>
        <FormField label="Program website *" wide><input name="website" type="url" required placeholder="https://..." /></FormField>
        <FormField label="Contact email (optional)" wide><input name="contactEmail" type="email" placeholder="fieldschool@example.edu" /></FormField>
      </div>
      <div className="job-form-actions">
        <button className="secondary-action" type="button" onClick={onCancel}>Cancel</button>
        <button className="influencer-submit" type="submit"><Plus size={18} />Submit field school</button>
      </div>
    </form>
  );
}

function FormField({ label, hint, wide = false, children }) {
  return <label className={wide ? "form-field form-field-wide" : "form-field"}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}
