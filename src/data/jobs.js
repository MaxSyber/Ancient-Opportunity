export const jobSources = ["All sources", "USAJOBS", "ShovelBums"];

export const jobLevels = ["Any level", "Entry", "Mid", "Senior"];

export const jobTypes = ["Any type", "Full-time", "Contract", "Seasonal", "Part-time", "Temporary"];

export const jobs = [
  {
    id: "shovelbums-framing-our-community-archaeological-technician-bitterroot-2026-07-17",
    source: {
      name: "ShovelBums",
      externalId: "framing-our-community-2026-07-17",
      url: "https://groups.io/g/shovelbums",
    },
    title: "Archaeological Technician",
    employer: {
      name: "Framing Our Community, Inc.",
      type: "Nonprofit / cultural resources contractor",
    },
    location: {
      display: "Bitterroot National Forest, MT",
      city: null,
      state: "MT",
      country: "US",
      isRemote: false,
    },
    workplace: "Field-based",
    employmentType: "Temporary",
    experienceLevel: "Mid",
    compensation: {
      display: "$20.17-24.18/hr",
      minAmount: 20.17,
      maxAmount: 24.18,
      currency: "USD",
      interval: "hourly",
    },
    dates: {
      postedLabel: "Received today",
      postedDate: "2026-07-09",
      closingDate: "2026-07-17",
      importedAt: "2026-07-09",
    },
    schedule: "Variable field schedule; may include compressed tours",
    tags: ["USFS", "Survey", "Excavation", "Remote fieldwork", "Montana"],
    description: {
      summary:
        "Archaeological technician role supporting cultural resource projects primarily on the Bitterroot National Forest. Work may include survey, shovel testing, excavation, artifact processing, background research, site recording, mapping, and occasional remote travel or camping under Forest Service Heritage staff supervision.",
      attribution: "Imported from ShovelBums email listing; summarized for this app.",
    },
    urls: {
      sourcePosting: "https://groups.io/g/shovelbums",
      apply: "mailto:ellen@framingourcommunity.org",
    },
    savedByDefault: false,
  },  {
    id: "shovelbums-swca-cultural-resources-technician-phoenix-15917",
    source: {
      name: "ShovelBums",
      externalId: "15917",
      url: "https://groups.io/g/shovelbums",
    },
    title: "Cultural Resources Technician",
    employer: {
      name: "SWCA Environmental Consultants",
      type: "Private environmental consulting firm",
    },
    location: {
      display: "Phoenix, AZ",
      city: "Phoenix",
      state: "AZ",
      country: "US",
      isRemote: false,
    },
    workplace: "Field-based",
    employmentType: "Temporary",
    experienceLevel: "Entry",
    compensation: {
      display: "$19.31-25.49/hr",
      minAmount: 19.31,
      maxAmount: 25.49,
      currency: "USD",
      interval: "hourly",
    },
    dates: {
      postedLabel: "Received today",
      postedDate: "2026-07-09",
      closingDate: null,
      importedAt: "2026-07-09",
    },
    schedule: "Variable hours; anticipated six-month assignment",
    tags: ["CRM", "Fieldwork", "Survey", "Monitoring", "Arizona"],
    description: {
      summary:
        "Temporary field-based archaeology technician role supporting SWCA's Phoenix office on cultural resources management projects across Arizona. Work may include survey, site recording, monitoring, excavation support, records searches, lab tasks, and extended field travel.",
      attribution: "Imported from ShovelBums message #15917; summarized for this app.",
    },
    urls: {
      sourcePosting: "https://groups.io/g/shovelbums/message/15917",
      apply: "https://www.swca.com/careers",
    },
    savedByDefault: true,
  },
  {
    id: "usajobs-archaeological-technician-001",
    source: {
      name: "USAJOBS",
      externalId: "mock-usajobs-001",
      url: "https://www.usajobs.gov/",
    },
    title: "Archaeological Technician",
    employer: {
      name: "National Park Service",
      type: "Federal agency",
    },
    location: {
      display: "Mesa Verde, CO",
      city: "Mesa Verde",
      state: "CO",
      country: "US",
      isRemote: false,
    },
    workplace: "On-site",
    employmentType: "Seasonal",
    experienceLevel: "Entry",
    compensation: {
      display: "$21.42-27.88/hr",
      minAmount: 21.42,
      maxAmount: 27.88,
      currency: "USD",
      interval: "hourly",
    },
    dates: {
      postedLabel: "Today",
      postedDate: "2026-07-09",
      closingDate: "2026-07-23",
      importedAt: "2026-07-09",
    },
    schedule: "Full-time",
    tags: ["Federal", "Collections", "Field"],
    description: {
      summary:
        "Assist with cultural resource monitoring, artifact cataloging, and condition assessments across park-managed sites.",
      attribution: "Mock USAJOBS-style listing for frontend testing.",
    },
    urls: {
      sourcePosting: "https://www.usajobs.gov/",
      apply: "https://www.usajobs.gov/",
    },
    savedByDefault: false,
  },
  {
    id: "shovelbums-principal-investigator-001",
    source: {
      name: "ShovelBums",
      externalId: "mock-shovelbums-002",
      url: "https://www.shovelbums.org/",
    },
    title: "Principal Investigator",
    employer: {
      name: "Sagebrush Heritage Group",
      type: "Private CRM firm",
    },
    location: {
      display: "Reno, NV",
      city: "Reno",
      state: "NV",
      country: "US",
      isRemote: false,
    },
    workplace: "On-site",
    employmentType: "Full-time",
    experienceLevel: "Senior",
    compensation: {
      display: "$86k-110k",
      minAmount: 86000,
      maxAmount: 110000,
      currency: "USD",
      interval: "yearly",
    },
    dates: {
      postedLabel: "3 days ago",
      postedDate: "2026-07-06",
      closingDate: null,
      importedAt: "2026-07-09",
    },
    schedule: "Full-time",
    tags: ["PI Qualified", "CRM", "Budgeting"],
    description: {
      summary:
        "Oversee field strategy, client communication, staff mentoring, and final deliverables for western U.S. compliance projects.",
      attribution: "Mock ShovelBums-style listing for frontend testing.",
    },
    urls: {
      sourcePosting: "https://www.shovelbums.org/",
      apply: "https://www.shovelbums.org/",
    },
    savedByDefault: false,
  },
  {
    id: "usajobs-cultural-resource-specialist-001",
    source: {
      name: "USAJOBS",
      externalId: "mock-usajobs-002",
      url: "https://www.usajobs.gov/",
    },
    title: "Cultural Resource Specialist",
    employer: {
      name: "Bureau of Land Management",
      type: "Federal agency",
    },
    location: {
      display: "Remote, US",
      city: null,
      state: null,
      country: "US",
      isRemote: true,
    },
    workplace: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Mid",
    compensation: {
      display: "$68k-88k",
      minAmount: 68000,
      maxAmount: 88000,
      currency: "USD",
      interval: "yearly",
    },
    dates: {
      postedLabel: "Yesterday",
      postedDate: "2026-07-08",
      closingDate: "2026-07-29",
      importedAt: "2026-07-09",
    },
    schedule: "Remote",
    tags: ["Federal", "Section 106", "GIS"],
    description: {
      summary:
        "Coordinate cultural resource review, spatial records, and consultation documentation for public lands projects.",
      attribution: "Mock USAJOBS-style listing for frontend testing.",
    },
    urls: {
      sourcePosting: "https://www.usajobs.gov/",
      apply: "https://www.usajobs.gov/",
    },
    savedByDefault: true,
  },
];