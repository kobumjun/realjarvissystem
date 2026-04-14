import type { SupabaseClient } from "@supabase/supabase-js";

const PER_PAGE = 1000;
const MAX_PAGES = 100;

/**
 * Resolves `auth.users.id` for a checkout email using the Auth Admin API (service role).
 * Paginates until a case-insensitive email match or pages are exhausted.
 */
export async function findAuthUserIdByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error || !data?.users?.length) {
      return null;
    }

    const match = data.users.find((u) => u.email?.trim().toLowerCase() === target);
    if (match?.id) {
      return match.id;
    }

    if (data.users.length < PER_PAGE) {
      break;
    }
  }

  return null;
}
