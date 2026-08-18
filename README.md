# Ancient Opportunity

Ancient Opportunity is a React and Vite project for sharing archaeology-related opportunities and resources, including jobs, field schools, conferences, equipment stores, and influencers.

## Project Status

This project is a work in progress. I am currently learning Supabase and writing my first PostgreSQL code as I build the project's backend and data features.

## TODO

- [X] Create a Supabase project
- [x] Create the jobs category
- [x] Link Supabase to the project
- [x] Display Supabase data on the page
- [x] Implement the create-job function to add a new row to Supabase

- [x] Create the field schools category
- [x] Import Real data for a few field schools
- [x] Display Supabase data on the page
- [x] Implement the create-feild school function to add a new row to Supabase

- [x] Create the Social influencers category
- [x] Import Real data influencers
- [x] Display Supabase data on the page
- [x] Implement the recomend an influencer school function to add a new row to Supabase

- [] Add company logos to jobs page
company logo renders at 76x76px codex recomends preping 304*304 or 512*512 jpg formates for crisp images.
- [x] Add alpha tag
- [] Create company email and have each submit send a "new posting" message the the main email
- [] Purchase website url
- [] Deploy Live Alpha version

## Development

Install the dependencies and start the development server:

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```


React Employer Form
        │
        │ supabase.rpc('submit_job')
        ▼
┌─────────────────────────────┐
│ PostgreSQL submit_job()     │
│                             │
│ 1. Clean inputs             │
│ 2. Validate inputs          │
│ 3. Insert public job        │
│ 4. Get generated ID         │
│ 5. Insert private contact   │
└──────────────┬──────────────┘
               │
       ┌───────┴─────────┐
       ▼                 ▼
 job_listings       job_contacts
 PUBLIC DATA        PRIVATE DATA