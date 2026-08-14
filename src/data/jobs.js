export const jobTitles = [
  "Any job title",
  "Archaeological Field Technician",
  "Senior Field Technician",
  "Archaeological Monitor",
  "Laboratory Technician",
  "Crew Chief",
  "Field Director",
  "Staff Archaeologist",
  "GIS Specialist",
  "Project Archaeologist",
  "Principal Investigator",
  "Project Manager",
];

export const jobTypes = ["Any type", "Full-Time", "Temporary Full-Time", "Part-Time", "Temporary", "On-Call"];

export function normalizeJobRow(row) {
  const source = objectValue(row.source);
  const employer = objectValue(row.employer);
  const location = objectValue(row.location);
  const compensation = objectValue(row.compensation);
  const dates = objectValue(row.dates);
  const description = objectValue(row.description);
  const urls = objectValue(row.urls);
  const postedDate = dates.postedDate ?? row.posted_date ?? row.created_at?.slice(0, 10) ?? null;
  const sourcePosting = urls.sourcePosting ?? row.source_posting_url ?? row.posting_url ?? row.apply_url ?? row.url ?? "";
  const locationDisplay = location.display
    ?? row.location_display
    ?? (typeof row.location === "string" ? row.location : null)
    ?? formatLocation(row);
  const compensationDisplay = compensation.display
    ?? row.compensation_display
    ?? row.pay
    ?? formatCompensation(row);

  return {
    id: String(row.id),
    source: {
      name: row.is_direct_post === true
        ? "Posted by Employer"
        : row.is_direct_post === false
          ? "Posted by Ancient Opportunity"
          : (source.name ?? row.source_name ?? "Ancient Opportunity"),
      externalId: source.externalId ?? row.external_id ?? null,
      url: source.url ?? row.source_url ?? sourcePosting,
      isDirectPost: row.is_direct_post === true,
    },
    title: row.posting_title ?? row.title ?? "Untitled archaeology position",
    employer: {
      name: employer.name ?? row.employer_name ?? row.organization ?? row.company ?? "Organization not listed",
      type: employer.type ?? row.employer_type ?? "Unknown",
      website: employer.website ?? row.company_website ?? "",
    },
    location: {
      display: locationDisplay,
      city: location.city ?? row.city ?? null,
      state: location.state ?? row.state ?? null,
      country: location.country ?? row.country ?? null,
      isRemote: location.isRemote ?? row.is_remote ?? false,
    },
    workplace: row.workplace ?? row.workplace_type ?? "Unknown",
    employmentType: formatEmploymentType(row.employmentType ?? row.employment_type),
    jobTitles: arrayValue(row.jobTitles ?? row.job_titles, row.title),
    compensation: {
      display: compensationDisplay,
      minAmount: compensation.minAmount ?? row.min_amount ?? row.salary_min ?? null,
      maxAmount: compensation.maxAmount ?? row.max_amount ?? row.salary_max ?? null,
      currency: compensation.currency ?? row.currency ?? "USD",
      interval: compensation.interval ?? row.pay_interval ?? row.salary_unit ?? "unknown",
    },
    dates: {
      postedLabel: dates.postedLabel ?? row.posted_label ?? formatPostedDate(postedDate),
      postedDate,
      closingDate: dates.closingDate ?? row.closing_date ?? null,
      importedAt: dates.importedAt ?? row.imported_at ?? row.created_at ?? null,
    },
    schedule: capitalizeFirst(row.schedule ?? row.employment_type ?? "Not specified"),
    tags: arrayValue(row.tags),
    description: {
      summary: description.summary ?? (typeof row.description === "string" ? row.description : null) ?? row.summary ?? "No description provided.",
      html: description.html ?? null,
      attribution: description.attribution ?? row.attribution ?? "Listing imported from Supabase.",
    },
    urls: {
      sourcePosting,
      apply: urls.apply ?? row.apply_url ?? sourcePosting,
    },
    savedByDefault: row.savedByDefault ?? row.saved_by_default ?? false,
  };
}

function objectValue(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function arrayValue(value, fallback) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return value.split(",").map((item) => item.trim()).filter(Boolean);
  return fallback ? [fallback] : [];
}

function formatLocation(row) {
  if (row.is_remote) return "Remote";
  const parts = [row.city, row.state, row.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location not listed";
}

function formatEmploymentType(value) {
  if (!value) return "Unknown";
  const normalized = String(value).trim().toLowerCase().replace(/[\s_-]+/g, "");
  const knownTypes = {
    fulltime: "Full-Time",
    temporaryfulltime: "Temporary Full-Time",
    parttime: "Part-Time",
    temporary: "Temporary",
    oncall: "On-Call",
  };
  return knownTypes[normalized] ?? String(value).trim().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCompensation(row) {
  const minimum = numberValue(row.salary_min);
  const maximum = numberValue(row.salary_max);
  if (minimum === null && maximum === null) return "Compensation not listed";

  const currency = row.currency ?? "USD";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(minimum ?? maximum) ? 0 : 2,
  });
  const range = minimum !== null && maximum !== null
    ? `${formatter.format(minimum)}–${formatter.format(maximum)}`
    : formatter.format(minimum ?? maximum);
  const units = { yearly: "year", monthly: "month", weekly: "week", daily: "day", hourly: "hour" };
  const salaryUnit = String(row.salary_unit ?? "").toLowerCase();
  const unit = salaryUnit ? `/${units[salaryUnit] ?? salaryUnit}` : "";
  return `${range}${unit}`;
}

function numberValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function capitalizeFirst(value) {
  const text = String(value).trim();
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "Not specified";
}

function formatPostedDate(value) {
  if (!value) return "Date not listed";
  const dateOnlyMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
