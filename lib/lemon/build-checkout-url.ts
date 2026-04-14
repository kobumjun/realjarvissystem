/**
 * Append Lemon Squeezy prefill + custom data to a checkout URL.
 * @see https://docs.lemonsqueezy.com/help/checkout/prefilled-checkout-fields
 * @see https://docs.lemonsqueezy.com/help/checkout/passing-custom-data
 */
export function buildLemonCheckoutUrl(
  baseUrl: string,
  params: { email: string; userId: string },
): string {
  const email = params.email.trim();
  const userId = params.userId.trim();
  if (!email && !userId) {
    return baseUrl;
  }

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return baseUrl;
  }

  if (email) {
    url.searchParams.set("checkout[email]", email);
  }
  if (userId) {
    url.searchParams.set("checkout[custom][user_id]", userId);
  }

  return url.toString();
}
