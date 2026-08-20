import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Plus,
  Search,
  Star,
} from "lucide-react";
import { jobTitles, jobTypes } from "../data/jobs";
import { supabase } from "../supabaseClient";

const JOBS_PER_PAGE = 25;

export default function JobsTab({
  filteredJobs,
  selectedJob,
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
  jobsLoading,
  jobsError,
}) {
  const [showJobForm, setShowJobForm] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsColumnRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const pageStart = (activePage - 1) * JOBS_PER_PAGE;
  const pageJobs = filteredJobs.slice(pageStart, pageStart + JOBS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, datePosted, selectedJobTitles, type]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const changePage = (page) => {
    setCurrentPage(page);
    setShowJobDetails(false);
    window.requestAnimationFrame(() => {
      jobsColumnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  useEffect(() => {
    if (!showJobDetails) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setShowJobDetails(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showJobDetails]);

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

      {showJobForm && <JobPostingForm onCancel={() => setShowJobForm(false)} />}

      <section className="dashboard-grid">
        <section className="jobs-column" aria-label="Job listings" ref={jobsColumnRef}>
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
                <span>Post A Job</span>
              </button>
              <span className="sr-only" id="post-job-tooltip">
                Jobs posted directly on Ancient Opportunity will appear above listings gathered from external sources.
              </span>
            </div>
          </div>

          <div className="job-list">
            {pageJobs.map((job) => (
              <article
                className={selectedJob?.id === job.id ? "job-card selected" : "job-card"}
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
                <CompanyLogo job={job} iconSize={30} />
                <div className="job-card-content">
                  <div className="job-card-top">
                    <div>
                      <span className="job-card-label">Title</span>
                      <h3>{job.title}</h3>
                    </div>
                    <span className={job.source.isDirectPost ? "source-badge employer-post-badge" : "source-badge"}>{job.source.name}</span>
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
                      <span className="job-card-label">Employment type</span>
                      <strong className="employment-type">{job.employmentType}</strong>
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

            {jobsLoading && (
              <div className="empty-state">
                <Search size={28} />
                <h3>Loading job listings…</h3>
                <p>Connecting to the Supabase job listings table.</p>
              </div>
            )}

            {!jobsLoading && jobsError && (
              <div className="empty-state" role="alert">
                <BriefcaseBusiness size={28} />
                <h3>Could not load job listings.</h3>
                <p>{jobsError}</p>
              </div>
            )}

            {!jobsLoading && !jobsError && filteredJobs.length === 0 && (
              <div className="empty-state">
                <Search size={28} />
                <h3>No job listings found.</h3>
                <p>Try widening the date, job title, or search text.</p>
              </div>
            )}

            {!jobsLoading && !jobsError && totalPages > 1 && (
              <nav className="jobs-pagination" aria-label="Job listing pages">
                <button
                  className="pagination-arrow"
                  type="button"
                  aria-label="Previous page"
                  disabled={activePage === 1}
                  onClick={() => changePage(activePage - 1)}
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <p>
                  <span>Showing {pageStart + 1}–{Math.min(pageStart + JOBS_PER_PAGE, filteredJobs.length)} of {filteredJobs.length}</span>
                  <strong>Page {activePage} of {totalPages}</strong>
                </p>
                <button
                  className="pagination-arrow"
                  type="button"
                  aria-label="Next page"
                  disabled={activePage === totalPages}
                  onClick={() => changePage(activePage + 1)}
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </nav>
            )}
          </div>
        </section>

      </section>

      {showJobDetails && selectedJob && (
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
              <div className="detail-company-heading">
                <CompanyLogo job={selectedJob} iconSize={24} detail />
                <span className="source-badge">{selectedJob.employer.name}</span>
              </div>
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
                {selectedJob.employer.website && (
                  <a
                    className="primary-action"
                    href={selectedJob.employer.website}
                    target="_blank"
                    rel="noreferrer"
                    title="View company website"
                    aria-describedby="view-company-tooltip"
                  >
                    <ExternalLink size={18} />View Company Website
                  </a>
                )}
                {selectedJob.employer.website && <span className="sr-only" id="view-company-tooltip">View the hiring company website</span>}
                {selectedJob.urls.apply && (
                  <a
                    className="primary-action"
                    href={selectedJob.urls.apply}
                    target="_blank"
                    rel="noreferrer"
                    title="Open the job application"
                  >
                    <ExternalLink size={18} />Apply
                  </a>
                )}
                <button className={savedIds.has(selectedJob.id) ? "secondary-action saved" : "secondary-action"} type="button" onClick={() => toggleSaved(selectedJob.id)}><Bookmark size={18} />{savedIds.has(selectedJob.id) ? "Saved" : "Save"}</button>
              </div>
              <div className="freshness-note"><CalendarDays size={17} /><span>Posted {selectedJob.dates.postedLabel}</span></div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function CompanyLogo({ job, iconSize, detail = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoUrl = job.employer.logoUrl;

  useEffect(() => {
    setImageFailed(false);
  }, [logoUrl]);

  const hasLogo = logoUrl && !imageFailed;
  const className = [
    "company-logo-placeholder",
    detail ? "detail-company-logo" : "",
    hasLogo ? "has-logo" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={className}>
      {hasLogo ? (
        <img
          className="company-logo-image"
          src={logoUrl}
          alt={`${job.employer.name} logo`}
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Building2
          size={iconSize}
          role="img"
          aria-label={`${job.employer.name} logo unavailable`}
        />
      )}
    </div>
  );
}

function JobPostingForm({ onCancel }) {
  const [jobTitleError, setJobTitleError] = useState("");
  const [showOtherJobTitle, setShowOtherJobTitle] = useState(false);
  const [showOtherEmploymentType, setShowOtherEmploymentType] = useState(false);
  const [salaryUnit, setSalaryUnit] = useState("");
  const [salaryInputError, setSalaryInputError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSalaryKeyDown = (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length === 1 && !/[0-9.]/.test(event.key)) {
      event.preventDefault();
      setSalaryInputError("Salary fields accept numbers only.");
    }
  };

  const handleSalaryPaste = (event) => {
    if (!/^\d*\.?\d*$/.test(event.clipboardData.getData("text").trim())) {
      event.preventDefault();
      setSalaryInputError("Salary fields accept numbers only.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setJobTitleError("");
    setSalaryInputError("");
    setSubmissionError("");
    setSubmissionSuccess("");

    const selectedTitles = data.getAll("jobTitles").map((jobTitle) => (
      jobTitle === "Other" ? String(data.get("otherJobTitle") ?? "").trim() : String(jobTitle).trim()
    )).filter(Boolean);
    if (selectedTitles.length === 0 || (data.getAll("jobTitles").includes("Other") && !String(data.get("otherJobTitle") ?? "").trim())) {
      setJobTitleError(selectedTitles.length === 0 ? "Select at least one job title." : "Enter the other job title.");
      return;
    }
    const postingTitle = String(data.get("title") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const companyWebsite = optionalText(data.get("company_website"));
    const state = String(data.get("state") ?? "").trim();
    const selectedEmploymentType = String(data.get("employment_type") ?? "").trim();
    const employmentType = selectedEmploymentType === "Other"
      ? String(data.get("otherEmploymentType") ?? "").trim()
      : selectedEmploymentType;
    const salaryMin = optionalNumber(data.get("salary_min"));
    const salaryMax = optionalNumber(data.get("salary_max"));
    const salaryUnitValue = String(data.get("salary_unit") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const applyUrl = optionalText(data.get("apply_url"));
    const contactEmail = String(data.get("contact_email") ?? "").trim();

    if (![postingTitle, company, state, employmentType, description].every(Boolean)) {
      setSubmissionError("Please complete all required fields.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(contactEmail)) {
      setSubmissionError("Enter a valid contact email address.");
      return;
    }
    if (salaryMin === undefined || salaryMax === undefined) {
      setSalaryInputError("Salary minimum and maximum must be valid numbers.");
      return;
    }
    if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
      setSalaryInputError("Salary minimum cannot exceed salary maximum.");
      return;
    }
    if ((salaryMin !== null && salaryMin < 0) || (salaryMax !== null && salaryMax < 0)) {
      setSalaryInputError("Salary values cannot be negative.");
      return;
    }
    if ((companyWebsite && !isValidHttpUrl(companyWebsite)) || (applyUrl && !isValidHttpUrl(applyUrl))) {
      setSubmissionError("Company and application URLs must be valid http or https URLs.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: newJobId, error } = await supabase.rpc("submit_job", {
        p_posting_title: postingTitle,
        p_title: selectedTitles.join(", "),
        p_company: company,
        p_state: state,
        p_salary_min: salaryMin,
        p_salary_max: salaryMax,
        p_salary_unit: salaryUnitValue || null,
        p_description: description,
        p_apply_url: applyUrl,
        p_employment_type: employmentType || null,
        p_company_website: companyWebsite,
        p_contact_email: contactEmail,
      });

      if (error) {
        console.error("Error submitting job:", { message: error.message, code: error.code, details: error.details });
        setSubmissionError("We couldn't submit your job. Please try again.");
        return;
      }

      console.info("Job submitted for moderation:", newJobId);
      form.reset();
      setShowOtherJobTitle(false);
      setShowOtherEmploymentType(false);
      setSalaryUnit("");
      setSubmissionSuccess("Your job has been submitted successfully and will appear on Ancient Opportunity after it has been reviewed.");
    } catch (error) {
      console.error("Unexpected error submitting job:", error);
      setSubmissionError("We couldn't submit your job. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="job-form-panel" aria-labelledby="post-job-heading">
      <div className="job-form-heading">
        <div><h2 id="post-job-heading">Post An Archaeology Job</h2><p>Share a role with archaeology and cultural-resource professionals.</p></div>
        <button className="form-close" type="button" onClick={onCancel} aria-label="Close job form">×</button>
      </div>
      <form className="job-posting-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <FormField label="Posting title *"><input name="title" required placeholder="e.g. Archaeological Field Technician" /></FormField>
          <FormField label="Company *"><input name="company" required placeholder="Company, agency, or nonprofit" /></FormField>
          <fieldset className="job-title-field form-field-wide">
            <legend>Job Titles * <small>Select all that apply</small></legend>
            <div className="job-title-options">
              {jobTitles.slice(1).map((jobTitle) => (
                <label key={jobTitle}>
                  <input name="jobTitles" type="checkbox" value={jobTitle} onChange={() => setJobTitleError("")} />
                  <span>{jobTitle}</span>
                </label>
              ))}
              <label>
                <input
                  name="jobTitles"
                  type="checkbox"
                  value="Other"
                  checked={showOtherJobTitle}
                  onChange={(event) => {
                    setShowOtherJobTitle(event.target.checked);
                    setJobTitleError("");
                  }}
                />
                <span>Other</span>
              </label>
            </div>
            {showOtherJobTitle && (
              <FormField label="Other job title *">
                <input name="otherJobTitle" required placeholder="Enter the job title category" />
              </FormField>
            )}
            {jobTitleError && <p className="field-error" role="alert">{jobTitleError}</p>}
          </fieldset>
          <FormField label="Company Website"><input name="company_website" type="url" placeholder="https://company.example" /></FormField>
          <FormField label="State *"><input name="state" required placeholder="e.g. Arizona" /></FormField>
          <FormField label="Application URL (optional)"><input name="apply_url" type="url" placeholder="https://..." /></FormField>
          <FormField label="Employment type *">
            <select
              name="employment_type"
              required
              defaultValue=""
              onChange={(event) => setShowOtherEmploymentType(event.target.value === "Other")}
            >
              <option value="" disabled>Select employment type</option>
              {jobTypes.slice(1).map((jobType) => <option key={jobType}>{jobType}</option>)}
              <option value="Other">Other</option>
            </select>
          </FormField>
          {showOtherEmploymentType && (
            <FormField label="Other employment type *">
              <input name="otherEmploymentType" required placeholder="Enter the employment type" />
            </FormField>
          )}
          <div className="salary-fields form-field-wide">
            <FormField label="Salary Minimum"><input className="salary-input" name="salary_min" type="number" inputMode="decimal" min="0" step="0.01" placeholder={salaryUnit === "hourly" ? "22.00" : "55500"} onKeyDown={handleSalaryKeyDown} onPaste={handleSalaryPaste} onInput={() => setSalaryInputError("")} aria-describedby={salaryInputError ? "salary-input-error" : undefined} /></FormField>
            <FormField label="Salary Maximum"><input className="salary-input" name="salary_max" type="number" inputMode="decimal" min="0" step="0.01" placeholder={salaryUnit === "hourly" ? "28.00" : "60000"} onKeyDown={handleSalaryKeyDown} onPaste={handleSalaryPaste} onInput={() => setSalaryInputError("")} aria-describedby={salaryInputError ? "salary-input-error" : undefined} /></FormField>
            <FormField label="Salary Unit"><select name="salary_unit" value={salaryUnit} onChange={(event) => setSalaryUnit(event.target.value)}><option value="">Not provided</option><option value="hourly">Hourly</option><option value="yearly">Yearly</option></select></FormField>
            {salaryInputError && <p className="field-error salary-input-error" id="salary-input-error" role="alert">{salaryInputError}</p>}
          </div>
          <FormField label="Job description *" wide><textarea name="description" required rows="10" placeholder="Enter the role, responsibilities, qualifications, and other important details." /></FormField>
          <FormField
            label="Contact Email *"
            wide
            hint="This email will not be shared publicly and will only be used to contact you if there is an issue with your job posting."
          >
            <input
              name="contact_email"
              type="email"
              required
              placeholder="contact@example.com"
              title="This email will not be shared publicly and will only be used to contact you if there is an issue with your job posting."
            />
          </FormField>
        </div>
        <div className="job-form-actions">
          <button className="secondary-action" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
          <button className="influencer-submit" type="submit" disabled={isSubmitting}><Plus size={18} />{isSubmitting ? "Submitting..." : "Submit Listing"}</button>
        </div>
        {submissionError && <p className="field-error" role="alert">{submissionError}</p>}
        {submissionSuccess && <p className="submission-success" role="status">{submissionSuccess}</p>}
      </form>
    </section>
  );
}

function optionalText(value) {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

function optionalNumber(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : undefined;
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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
