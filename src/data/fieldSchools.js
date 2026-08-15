export function normalizeFieldSchoolRow(row) {
  return {
    id: String(row.id),
    name: row.program_name,
    organization: row.organization || "Organization not listed",
    location: row.location || "Location not listed",
    dates: formatDateRange(row.start_date, row.end_date),
    seasonYear: row.season_year || "Not specified",
    applicationDeadline: formatDate(row.application_deadline),
    cost: formatCost(row.cost),
    format: row.format || "Not specified",
    methods: splitMethods(row.methods_taught),
    description: row.program_description || "No program description provided.",
    website: row.website_url || "",
  };
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "Dates not specified";
  if (!startDate) return `Ends ${formatDate(endDate)}`;
  if (!endDate) return `Starts ${formatDate(startDate)}`;
  return `${formatDate(startDate)}–${formatDate(endDate)}`;
}

function formatDate(value) {
  if (!value) return "Not specified";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCost(value) {
  if (value === null || value === undefined || value === "") return "Not specified";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

function splitMethods(value) {
  if (!value?.trim()) return [];
  return value.split(/[,;\n]/).map((method) => method.trim()).filter(Boolean);
}
