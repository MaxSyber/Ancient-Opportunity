import { supabase } from "../supabaseClient";

export const SOCIAL_PLATFORMS = [
  { label: "Instagram", field: "instagram_url" },
  { label: "TikTok", field: "tiktok_url" },
  { label: "YouTube", field: "youtube_url" },
  { label: "X", field: "x_url" },
  { label: "Podcast", field: "podcast_url" },
  { label: "Other/Personal Website", field: "website_url" },
];

/** Fetches moderator-approved creator profiles through the read-only public RPC. */
export async function getSocialListings() {
  const { data, error } = await supabase.rpc("get_approved_social_listings");

  if (error) throw error;
  return (data ?? []).map(normalizeSocialListing);
}

/**
 * Atomically creates a pending creator listing and its private contact record.
 * Direct browser access to both tables remains disabled by the SQL policy script.
 */
export async function createSocialListing(listing) {
  const { data, error } = await supabase.rpc("submit_social_listing", {
    p_name: listing.name,
    p_instagram_url: listing.instagram_url,
    p_tiktok_url: listing.tiktok_url,
    p_youtube_url: listing.youtube_url,
    p_x_url: listing.x_url,
    p_podcast_url: listing.podcast_url,
    p_website_url: listing.website_url,
    p_primary_profile_url: listing.primary_profile_url,
    p_content_focus: listing.content_focus,
    p_channel_bio: listing.channel_bio,
    p_contact_email: listing.contact_email,
  });

  if (error) throw error;
  return data;
}

export function normalizeSocialListing(row) {
  const accounts = SOCIAL_PLATFORMS
    .map(({ label, field }) => ({
      platform: label,
      url: row[field],
      handle: formatAccountLabel(row[field], label),
    }))
    .filter((account) => account.url);
  const primaryAccountIndex = accounts.findIndex((account) => urlsMatch(account.url, row.primary_profile_url));
  const accountsWithPrimary = accounts.map((account, index) => ({
    ...account,
    isPrimary: index === primaryAccountIndex,
  }));
  const primaryAccount = accountsWithPrimary[primaryAccountIndex] ?? accountsWithPrimary[0];
  const orderedAccounts = primaryAccountIndex > 0
    ? [accountsWithPrimary[primaryAccountIndex], ...accountsWithPrimary.filter((_, index) => index !== primaryAccountIndex)]
    : accountsWithPrimary;
  const name = row.name?.trim() || "Unnamed creator";

  return {
    id: String(row.id),
    name,
    handle: primaryAccount?.handle ?? formatAccountLabel(row.primary_profile_url, "Website"),
    platform: primaryAccount?.platform ?? "Other/Personal Website",
    accounts: orderedAccounts,
    profileUrl: row.primary_profile_url,
    coverImage: `/Images/Social_Media/creator-${row.id}.jpg`,
    focus: row.content_focus,
    description: row.channel_bio,
  };
}

function urlsMatch(firstValue, secondValue) {
  try {
    const normalize = (value) => {
      const url = new URL(value);
      return `${url.protocol}//${url.hostname.toLowerCase()}${url.pathname.replace(/\/+$/, "")}${url.search}`;
    };
    return normalize(firstValue) === normalize(secondValue);
  } catch {
    return firstValue === secondValue;
  }
}

function formatAccountLabel(value, platform) {
  if (!value) return "";

  try {
    const url = new URL(value);
    const path = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, "");
    if (path && !["Podcast", "Other/Personal Website", "Website"].includes(platform)) {
      return `@${path.split("/").filter(Boolean).at(-1).replace(/^@/, "")}`;
    }
    return url.hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}
