import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Filter,
  Globe2,
  MapPin,
  Moon,
  Search,
  SlidersHorizontal,
  Star,
  Sun,
} from "lucide-react";
import { jobs, jobLevels, jobSources, jobTypes } from "./data/jobs";
import "./styles.css";

const tabs = ["Jobs", "Field Schools", "Conferences", "Social Media Influencers"];

function App() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("All sources");
  const [level, setLevel] = useState("Any level");
  const [type, setType] = useState("Any type");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("Jobs");
  const [selectedId, setSelectedId] = useState(jobs[0].id);
  const [savedIds, setSavedIds] = useState(
    () => new Set(jobs.filter((job) => job.savedByDefault).map((job) => job.id)),
  );

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        !normalizedQuery ||
        [job.title, job.employer.name, job.location.display, job.description.summary, job.source.name, ...job.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesSource = source === "All sources" || job.source.name === source;
      const matchesLevel = level === "Any level" || job.experienceLevel === level;
      const matchesType = type === "Any type" || job.employmentType === type;
      return matchesQuery && matchesSource && matchesLevel && matchesType;
    });
  }, [query, source, level, type]);

  const selectedJob =
    filteredJobs.find((job) => job.id === selectedId) || filteredJobs[0] || jobs[0];

  const sourceCounts = jobs.reduce((counts, job) => {
    counts[job.source.name] = (counts[job.source.name] || 0) + 1;
    return counts;
  }, {});

  const toggleSaved = (jobId) => {
    setSavedIds((current) => {
      const next = new Set(current);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  return (
    <main className={darkMode ? "app-shell dark-mode" : "app-shell"}>
      <section className="top-band">
        <nav className="nav-bar" aria-label="Main navigation">
          <div className="brand-lockup">
            <div>
              <p className="eyebrow">Ancient Opportunity</p>
              <h1>Ancient Opportunity</h1>
            </div>
          </div>
          <div className="topbar-tabs" aria-label="Ancient Opportunity sections">
            {tabs.map((tab) => (
              <button
                className={activeTab === tab ? "section-tab active" : "section-tab"}
                key={tab}
                type="button"
                aria-pressed={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="nav-actions">
            <button
              className="icon-button"
              type="button"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={darkMode}
              onClick={() => setDarkMode((current) => !current)}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-button" type="button" aria-label="Open saved jobs">
              <Bookmark size={20} />
              <span>{savedIds.size}</span>
            </button>
          </div>
        </nav>

        <div className="hero-panel">
          <div className="hero-copy">
            <p className="source-line">
              Mocking normalized feeds from USAJOBS and ShovelBums
            </p>
            <div className="metric-row" aria-label="Job board summary">
              <Metric value={jobs.length} label="mock listings" />
              <Metric value={jobSources.length - 1} label="source queues" />
              <Metric value={savedIds.size} label="saved roles" />
            </div>
          </div>
        </div>
      </section>

      {activeTab === "Jobs" ? (
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

            <SelectControl icon={<Globe2 size={18} />} label="Source" value={source} onChange={setSource} options={jobSources} />
            <SelectControl icon={<Star size={18} />} label="Level" value={level} onChange={setLevel} options={jobLevels} />
            <SelectControl icon={<BriefcaseBusiness size={18} />} label="Type" value={type} onChange={setType} options={jobTypes} />
          </section>

          <section className="dashboard-grid">
        <aside className="source-rail" aria-label="Source coverage">
          <div className="rail-heading">
            <Filter size={18} />
            <span>Source queues</span>
          </div>
          {Object.entries(sourceCounts).map(([sourceName, count]) => (
            <button
              className={source === sourceName ? "source-chip active" : "source-chip"}
              key={sourceName}
              type="button"
              onClick={() => setSource(sourceName)}
            >
              <span>{sourceName}</span>
              <strong>{count}</strong>
            </button>
          ))}
          <button className="source-chip clear" type="button" onClick={() => setSource("All sources")}>
            <span>All sources</span>
            <strong>{jobs.length}</strong>
          </button>
        </aside>

        <section className="jobs-column" aria-label="Job listings">
          <div className="list-heading">
            <div>
              <p className="eyebrow">Open roles</p>
              <h2>{filteredJobs.length} listings found</h2>
            </div>
            <button className="tool-button" type="button">
              <SlidersHorizontal size={18} />
              <span>Newest</span>
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="job-list">
            {filteredJobs.map((job) => (
              <article
                className={selectedJob.id === job.id ? "job-card selected" : "job-card"}
                key={job.id}
                onClick={() => setSelectedId(job.id)}
              >
                <div className="job-card-top">
                  <span className="source-badge">{job.source.name}</span>
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
                <h3>{job.title}</h3>
                <p className="company-line">
                  <Building2 size={16} />
                  {job.employer.name}
                </p>
                <p className="location-line">
                  <MapPin size={16} />
                  {job.location.display}
                </p>
                <div className="tag-row">
                  {job.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="card-footer">
                  <strong>{job.compensation.display}</strong>
                  <span>{job.dates.postedLabel}</span>
                </div>
              </article>
            ))}

            {filteredJobs.length === 0 && (
              <div className="empty-state">
                <Search size={28} />
                <h3>No mock listings match those filters.</h3>
                <p>Try widening the source, level, or search text.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="detail-panel" aria-label="Selected job details">
          <div className="detail-image" aria-hidden="true" />
          <div className="detail-content">
            <span className="source-badge">{selectedJob.source.name}</span>
            <h2>{selectedJob.title}</h2>
            <p>{selectedJob.description.summary}</p>
            <dl className="detail-list">
              <div>
                <dt>Organization</dt>
                <dd>{selectedJob.employer.name}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{selectedJob.location.display}</dd>
              </div>
              <div>
                <dt>Compensation</dt>
                <dd>{selectedJob.compensation.display}</dd>
              </div>
              <div>
                <dt>Schedule</dt>
                <dd>{selectedJob.schedule}</dd>
              </div>
            </dl>
            <div className="detail-actions">
              <button className="primary-action" type="button">
                <ExternalLink size={18} />
                View posting
              </button>
              <button
                className={savedIds.has(selectedJob.id) ? "secondary-action saved" : "secondary-action"}
                type="button"
                onClick={() => toggleSaved(selectedJob.id)}
              >
                <Bookmark size={18} />
                {savedIds.has(selectedJob.id) ? "Saved" : "Save"}
              </button>
            </div>
            <div className="freshness-note">
              <CalendarDays size={17} />
              <span>Posted {selectedJob.dates.postedLabel}; {selectedJob.description.attribution}</span>
            </div>
          </div>
        </aside>
          </section>
        </>
      ) : (
        <ComingSoonPanel activeTab={activeTab} />
      )}
    </main>
  );
}

function ComingSoonPanel({ activeTab }) {
  const messages = {
    "Field Schools": "Track archaeology field schools, application deadlines, credits, costs, and field methods.",
    Conferences: "Collect conference dates, calls for papers, registration links, and archaeology networking events.",
    "Social Media Influencers": "Build a directory of archaeology educators, creators, labs, museums, and public outreach accounts.",
  };

  return (
    <section className="placeholder-panel" aria-label={`${activeTab} section`}>
      <p className="eyebrow">Coming soon</p>
      <h2>{activeTab}</h2>
      <p>{messages[activeTab]}</p>
    </section>
  );
}

function Metric({ value, label }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SelectControl({ icon, label, value, onChange, options }) {
  return (
    <label className="select-control">
      <span className="select-label">
        {icon}
        {label}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

createRoot(document.getElementById("root")).render(<App />);
