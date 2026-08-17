import { supabase } from "../supabaseClient";

export const SOCIAL_TABLES = {
  listings: "social_listings",
  contacts: "social_contacts",
};

/**
 * Fetches public creator records without coupling the UI to a fixed column list.
 * Add an explicit select list here once the final table schema is settled.
 */
export async function getSocialListings() {
  const { data, error } = await supabase
    .from(SOCIAL_TABLES.listings)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Creates a public listing and its private contact record.
 *
 * The caller supplies objects shaped to the final database schema. Keeping the
 * contact insert here prevents contact information from leaking into the public
 * listing query. `social_listing_id` is the expected foreign-key column.
 *
 * Before using this in production, prefer moving both inserts into a Supabase
 * RPC so they run atomically and the contact table never needs direct INSERT
 * permission from the browser.
 */
export async function createSocialListing({ listing, contact }) {
  const { data: createdListing, error: listingError } = await supabase
    .from(SOCIAL_TABLES.listings)
    .insert(listing)
    .select("id")
    .single();

  if (listingError) throw listingError;

  const { error: contactError } = await supabase
    .from(SOCIAL_TABLES.contacts)
    .insert({ ...contact, social_listing_id: createdListing.id });

  if (contactError) {
    const error = new Error("The creator listing was saved, but its contact record could not be saved.");
    error.cause = contactError;
    error.listingId = createdListing.id;
    throw error;
  }

  return createdListing.id;
}
