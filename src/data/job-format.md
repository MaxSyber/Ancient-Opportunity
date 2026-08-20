# Normalized Job Format

Every importer should convert its source data into this shape before the listing reaches the UI.

```js
{
  id: "stable-source-specific-id",
  source: {
    name: "USAJOBS" | "ShovelBums",
    externalId: "original-source-id-if-available",
    url: "source-homepage-url"
  },
  title: "Job title",
  employer: {
    name: "Hiring organization",
    type: "Federal agency | Private CRM firm | University | Museum | Unknown",
    website: "https://company.example",
    logoUrl: "/Images/Company_Logos/hiring-organization.png"
  },
  location: {
    display: "Human-readable location",
    city: "City or null",
    state: "State or null",
    country: "Country code or null",
    isRemote: true | false
  },
  workplace: "Remote | Hybrid | On-site | Field-based | Unknown",
  employmentType: "Full-time | Part-time | Contract | Seasonal | Internship | Unknown",
  jobTitles: ["Archaeological Field Technician", "GIS Specialist"],
  compensation: {
    display: "Human-readable pay range",
    minAmount: 0,
    maxAmount: 0,
    currency: "USD",
    interval: "hourly | yearly | daily | unknown"
  },
  dates: {
    postedLabel: "Today / 2 days ago / source text",
    postedDate: "YYYY-MM-DD or null",
    closingDate: "YYYY-MM-DD or null",
    importedAt: "YYYY-MM-DD"
  },
  schedule: "Display schedule",
  tags: ["CRM", "Federal", "GIS"],
  description: {
    summary: "Short app-owned summary or permitted source excerpt",
    html: "Optional sanitized rich-text HTML for directly submitted listings",
    attribution: "Where/how the listing came from"
  },
  urls: {
    sourcePosting: "canonical source listing URL",
    apply: "application URL"
  },
  savedByDefault: false
}
```

Importer notes:

- USAJOBS can map cleanly from its official API fields into this structure.
- ShovelBums should use source URLs and short summaries unless explicit reuse rights are clear.
- Keep full raw source payloads out of the frontend. If needed later, store them separately on the backend for debugging/import audits.
- The frontend should only depend on this normalized shape, not on USAJOBS or ShovelBums field names.
- Store local company logos as PNG files in `public/Images/Company_Logos`. The frontend derives each filename from the company name, using lowercase letters and hyphens in place of spaces or punctuation.
