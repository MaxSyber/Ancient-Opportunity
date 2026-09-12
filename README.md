# Ancient Opportunity

Ancient Opportunity is an archaeology-focused opportunity board for jobs, field schools, conferences, professional creators, and field resources.

The project is preparing for its public **Open Beta** launch.

## What the site offers

### Archaeology jobs

- Search by job title, employer, location, description, or source.
- Filter by posting date, archaeology specialty, and employment type.
- Browse results in pages of 25 listings.
- Open complete job details without leaving the listing page.
- Follow separate company-website and application links when provided.
- Save jobs during the current browser session.
- Display automatically matched company logos with a fallback icon.
- Give recent direct employer posts a ranking advantage.

Direct employer posts receive a 14-day ranking advantage during their first 30 days. After 30 days, they return to normal posted-date ordering.

### Field schools

- Browse active archaeology field-school programs.
- Review dates, costs, methods, locations, and program details.
- Submit a field school for review.

### Conferences

- Browse a curated collection of upcoming archaeology and anthropology conferences.
- Follow links to official conference websites.

### Social media creators

- Browse moderator-approved archaeology creators and their platforms.
- Recommend an archaeology creator for review.

### Field equipment stores

The field-equipment directory is present as a coming-soon section and will eventually collect trusted archaeology tool makers and suppliers.

### Interface

- Responsive layouts for desktop and mobile devices.
- Light and dark themes.
- Keyboard-accessible cards, dialogs, forms, and pagination controls.
- Clear loading, error, empty, validation, and submission states.

## Technology

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/)
- [Supabase](https://supabase.com/) for PostgreSQL data, row-level security, RPC functions, and the submission-notification Edge Function
- [Resend](https://resend.com/) for administrator submission emails
- [Lucide React](https://lucide.dev/) for interface icons
- [Vercel](https://vercel.com/) for the production frontend

## Application flow

```text
Browser
  ├── reads jobs, field schools, and approved creator listings from Supabase
  ├── reads conference information from local project data
  └── submits public forms through restricted Supabase RPC functions
                              │
                              ▼
                    PostgreSQL submission RPC
                      ├── validates the input
                      ├── creates the public listing
                      ├── stores contact details privately
                      └── creates a notification event
                                      │
                                      ▼
                           Supabase Edge Function
                                      │
                                      ▼
                           Resend administrator email
```

Vercel hosts the compiled frontend. Supabase continues to host the database, RPC functions, private contact records, and notification function.

## Local development

### Requirements

- Node.js and npm
- Access to the Ancient Opportunity Supabase project

### Installation

```bash
git clone <repository-url>
cd AncientOppertunity
npm install
```

Create a local `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Start the Vite development server:

```bash
npm run dev
```

Vite exposes variables prefixed with `VITE_` to browser code. Only use the Supabase publishable key in the frontend—never place a service-role key or another private secret in a `VITE_` variable. See the [Vite environment-variable documentation](https://vite.dev/guide/env-and-mode).

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |

Before deploying, verify the production build:

```bash
npm run build
```

## Project structure

```text
.
├── public/
│   └── Images/
│       ├── Company_Logos/       # Job-listing company logos
│       └── Social_Media/        # Creator images
├── src/
│   ├── assets/                   # Bundled interface imagery
│   ├── components/               # Feature tabs, forms, cards, and dialogs
│   ├── data/                     # Normalizers and local curated datasets
│   ├── App.jsx                   # Main application state and navigation
│   ├── styles.css                # Shared responsive and theme styling
│   └── supabaseClient.js         # Browser Supabase client
└── supabase/
    ├── functions/                # Supabase Edge Functions
    ├── migrations/               # Database migrations
    └── schemas/                  # Versioned database definitions
```

## Company logos

Store square PNG logos in:

```text
public/Images/Company_Logos
```

The frontend derives the image filename from the Supabase `company` value. It:

1. Converts the company name to lowercase.
2. Converts `&` to `and`.
3. Removes apostrophes and accents.
4. Replaces spaces and remaining punctuation with hyphens.
5. Adds the `.png` extension.

Examples:

| Supabase company value | Logo filename |
| --- | --- |
| `WSP` | `wsp.png` |
| `Weller & Associates, Inc.` | `weller-and-associates-inc.png` |
| `R. Christopher Goodwin & Associates, Inc.` | `r-christopher-goodwin-and-associates-inc.png` |
| `UW-Milwaukee Cultural Resource Management` | `uw-milwaukee-cultural-resource-management.png` |

Use 512×512 PNG images when possible. Transparent logos are displayed on a white base in both light and dark themes. If no matching file exists, the interface displays a building icon instead.

File paths and filenames are case-sensitive after deployment.

## Content and database maintenance

### Jobs

Jobs are read through `get_ranked_jobs()`. If that RPC is unavailable, the frontend falls back to reading `job_listings` in descending posted-date order.

When adding a job manually in the Supabase SQL editor:

- Keep the `company` spelling consistent with its logo filename.
- Set `apply_url` when an Apply button should appear.
- Set `company_website` when a View Company Website button should appear.
- Use `is_direct_post = true` only for direct employer submissions that should receive the ranking advantage.
- Provide a valid `posted_date` so date filters and ranking work correctly.

### Conferences

Conference listings are maintained in `src/data/conferences.js` and are bundled into the frontend during deployment.

### Public submissions

Job, field-school, and creator forms call restricted database functions instead of inserting directly into public tables. Contact emails are stored in separate private contact tables. Submission events are recorded in `submission_email_events` and sent to the administrator by `supabase/functions/notify-submission`.

The Edge Function uses these Supabase secrets:

```text
RESEND_API_KEY
SUBMISSION_NOTIFICATION_TO
SUBMISSION_NOTIFICATION_FROM
SUBMISSION_WEBHOOK_SECRET
```

These are backend secrets and must not be added to Vercel as `VITE_` variables or committed to the repository.

## Deploying to Vercel

### Dashboard deployment

1. Push the current project to its Git repository.
2. In Vercel, create a new project and import the repository.
3. Confirm that Vercel detects the project as **Vite**.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. Add the following variables under **Project Settings → Environment Variables**:

   ```text
   VITE_SUPABASE_URL
   VITE_SUPABASE_PUBLISHABLE_KEY
   ```

7. Enable the variables for both Preview and Production deployments.
8. Deploy a Preview build and test it before promoting or deploying to Production.
9. Connect the purchased domain after the production deployment is healthy.

Vercel supports Vite projects directly. Environment-variable changes only affect new deployments, so redeploy after adding or changing either Supabase variable. See [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) and [Vercel environment variables](https://vercel.com/docs/environment-variables).

### Optional CLI deployment

```bash
vercel link
vercel deploy
vercel deploy --prod
```

The first deployment without `--prod` creates a Preview deployment. The production command deploys to the Production environment. See Vercel's [CLI deployment guide](https://vercel.com/docs/projects/deploy-from-cli).

## Launch checklist

- [ ] Run `npm run build` successfully.
- [ ] Confirm the Supabase URL and publishable key are configured in Vercel Preview and Production.
- [ ] Verify that jobs load and all filters work.
- [ ] Test pagination with more than 25 matching jobs.
- [ ] Open job details and test company and application links.
- [ ] Check company logos in light and dark modes.
- [ ] Submit a test job, field school, and creator recommendation.
- [ ] Confirm administrator notification emails arrive.
- [ ] Confirm pending job submissions remain hidden until an administrator approves them.
- [ ] Test the site on desktop and mobile screen sizes.
- [ ] Verify all conference links.
- [ ] Confirm the custom domain and HTTPS certificate.
- [ ] Review the browser console and Supabase logs for errors.

## Current roadmap

- Launch and monitor the public Open Beta release.
- Populate the field-equipment store directory.
- Continue expanding job, field-school, conference, and creator coverage.
- Add persistent user accounts and saved listings if the project grows beyond session-based saving.

## Status

Ancient Opportunity is an independent Open Beta project. Features and database structures may change as the beta is tested and refined.

