import { useMemo, useState } from "react";
import { Bookmark, Moon, Sun } from "lucide-react";
import JobsTab from "./components/JobsTab";
import FieldSchoolsTab from "./components/FieldSchoolsTab";
import ConferencesTab from "./components/ConferencesTab";
import InfluencersTab from "./components/InfluencersTab";
import FieldEquipmentStoresTab from "./components/FieldEquipmentStoresTab";
import { jobs } from "./data/jobs";

const tabs = ["Jobs", "Field Schools", "Conferences", "Social Media Influencers", "Field Equipment Stores"];

export default function App() {
  const [jobListings, setJobListings] = useState(jobs);
  const [query, setQuery] = useState("");
  const [datePosted, setDatePosted] = useState("Any date");
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);
  const [type, setType] = useState("Any type");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("Jobs");
  const [selectedId, setSelectedId] = useState(jobs[0].id);
  const [savedIds, setSavedIds] = useState(() => new Set(jobs.filter((job) => job.savedByDefault).map((job) => job.id)));

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return jobListings.filter((job) => {
      const matchesQuery = !normalizedQuery || [job.title, job.employer.name, job.location.display, job.description.summary, job.source.name, ...job.tags].join(" ").toLowerCase().includes(normalizedQuery);
      const postedAt = new Date(`${job.dates.postedDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ageInMs = today.getTime() - postedAt.getTime();
      const dateRanges = {
        "Past 24 hrs": 24 * 60 * 60 * 1000,
        "Past 3 days": 3 * 24 * 60 * 60 * 1000,
        "Past week": 7 * 24 * 60 * 60 * 1000,
        "Past month": 30 * 24 * 60 * 60 * 1000,
      };
      const matchesDate = datePosted === "Any date" || ageInMs <= dateRanges[datePosted];
      const matchesJobTitle = selectedJobTitles.length === 0 || selectedJobTitles.some((jobTitle) => job.jobTitles.includes(jobTitle));
      const matchesType = type === "Any type" || job.employmentType === type;
      return matchesQuery && matchesDate && matchesJobTitle && matchesType;
    });
  }, [jobListings, query, datePosted, selectedJobTitles, type]);

  const selectedJob = filteredJobs.find((job) => job.id === selectedId) || filteredJobs[0] || jobListings[0];
  const toggleSaved = (jobId) => {
    setSavedIds((current) => {
      const next = new Set(current);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const addJob = (job) => {
    setJobListings((current) => [job, ...current]);
    setSelectedId(job.id);
    setDatePosted("Any date");
    setSelectedJobTitles([]);
    setType("Any type");
    setQuery("");
  };

  return (
    <main className={darkMode ? "app-shell dark-mode" : "app-shell"}>
      <section className="top-band">
        <div className="hero-panel">
          <div className="brand-lockup"><div><p className="eyebrow">Ancient Opportunity</p><h1>Ancient Opportunity</h1></div></div>
          <div className="nav-actions">
            <button className="icon-button" type="button" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={darkMode} onClick={() => setDarkMode((current) => !current)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-button" type="button" aria-label="Open saved jobs"><Bookmark size={20} /><span>{savedIds.size}</span></button>
          </div>
        </div>
      </section>

      <nav className="tabs-band" aria-label="Ancient Opportunity sections">
        <div className="topbar-tabs">
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
      </nav>

      {activeTab === "Jobs" && <JobsTab filteredJobs={filteredJobs} selectedJob={selectedJob} selectedId={selectedId} setSelectedId={setSelectedId} savedIds={savedIds} toggleSaved={toggleSaved} query={query} setQuery={setQuery} datePosted={datePosted} setDatePosted={setDatePosted} selectedJobTitles={selectedJobTitles} setSelectedJobTitles={setSelectedJobTitles} type={type} setType={setType} addJob={addJob} />}
      {activeTab === "Field Schools" && <FieldSchoolsTab />}
      {activeTab === "Conferences" && <ConferencesTab />}
      {activeTab === "Social Media Influencers" && <InfluencersTab />}
      {activeTab === "Field Equipment Stores" && <FieldEquipmentStoresTab />}
    </main>
  );
}
