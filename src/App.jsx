import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import JobsTab from "./components/JobsTab";
import FieldSchoolsTab from "./components/FieldSchoolsTab";
import ConferencesTab from "./components/ConferencesTab";
import InfluencersTab from "./components/InfluencersTab";
import FieldEquipmentStoresTab from "./components/FieldEquipmentStoresTab";
import { normalizeJobRow } from "./data/jobs";
import { supabase } from "./supabaseClient";

const tabs = ["Jobs", "Field Schools", "Conferences", "Social Media Influencers", "Field Equipment Stores"];
const tabLabels = {
  Jobs: "Archaeology Jobs",
  "Field Schools": "Archaeology Field Schools",
  Conferences: "Archaeology Conferences",
  "Social Media Influencers": "Archaeology Creators",
  "Field Equipment Stores": "Archaeology Field Equipment Stores",
};

export default function App() {
  const [jobListings, setJobListings] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [query, setQuery] = useState("");
  const [datePosted, setDatePosted] = useState("Any date");
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);
  const [type, setType] = useState("Any type");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("Jobs");
  const [selectedId, setSelectedId] = useState(null);
  const [savedIds, setSavedIds] = useState(() => new Set());

  useEffect(() => {
    let isCurrent = true;

    async function getJobs() {
      setJobsLoading(true);
      setJobsError("");

      let { data, error } = await supabase.rpc("get_ranked_jobs");

      if (error) {
        console.warn("Ranked jobs query unavailable; falling back to posted date ordering:", {
          message: error.message,
          code: error.code,
        });
        ({ data, error } = await supabase
          .from("job_listings")
          .select("*")
          .order("posted_date", { ascending: false, nullsFirst: false }));
      }

      if (!isCurrent) return;

      if (error) {
        console.error("Error fetching jobs:", error);
        setJobsError(error.message);
        setJobsLoading(false);
        return;
      }

      const normalizedJobs = (data ?? []).map(normalizeJobRow);
      setJobListings(normalizedJobs);
      setSelectedId(normalizedJobs[0]?.id ?? null);
      setSavedIds(new Set(normalizedJobs.filter((job) => job.savedByDefault).map((job) => job.id)));
      setJobsLoading(false);
    }

    getJobs();
    return () => {
      isCurrent = false;
    };
  }, []);

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

  const openSection = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={darkMode ? "app-shell dark-mode" : "app-shell"}>
      <header className="top-band">
        <div className="hero-panel">
          <div className="brand-lockup"><h1>Ancient Opportunity<span className="sr-only"> — Archaeology Jobs and Field Schools</span></h1><span className="alpha-badge">Beta</span></div>
          <div className="nav-actions">
            <button className="icon-button" type="button" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={darkMode} onClick={() => setDarkMode((current) => !current)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
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
                  {tabLabels[tab]}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main>
        {activeTab === "Jobs" && <JobsTab filteredJobs={filteredJobs} selectedJob={selectedJob} setSelectedId={setSelectedId} savedIds={savedIds} toggleSaved={toggleSaved} query={query} setQuery={setQuery} datePosted={datePosted} setDatePosted={setDatePosted} selectedJobTitles={selectedJobTitles} setSelectedJobTitles={setSelectedJobTitles} type={type} setType={setType} addJob={addJob} jobsLoading={jobsLoading} jobsError={jobsError} />}
        {activeTab === "Field Schools" && <FieldSchoolsTab />}
        {activeTab === "Conferences" && <ConferencesTab />}
        {activeTab === "Social Media Influencers" && <InfluencersTab />}
        {activeTab === "Field Equipment Stores" && <FieldEquipmentStoresTab />}
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-brand-heading">
              <h2>Ancient Opportunity</h2>
              <span className="footer-alpha-badge">Beta</span>
            </div>
            <p>Connecting archaeology professionals, students, organizations, and creators with opportunities across the field.</p>
          </div>

          <nav className="footer-navigation" aria-label="Footer navigation">
            <h3>Explore</h3>
            <div>
              {tabs.map((tab) => (
                <button type="button" key={tab} onClick={() => openSection(tab)}>
                  {tabLabels[tab]}
                </button>
              ))}
            </div>
          </nav>

          <div className="footer-purpose">
            <h3>Our purpose</h3>
            <p>Making archaeology opportunities easier to discover and share in one community-focused place.</p>
            <p className="footer-contact">
              Questions or comments? Email us at{" "}
              <a href="mailto:ancientopportunity@gmail.com">ancientopportunity@gmail.com</a>
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Ancient Opportunity</p>
          <p>Always verify listing details with the original organization before applying.</p>
        </div>
      </footer>
    </div>
  );
}
