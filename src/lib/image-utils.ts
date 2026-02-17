/**
 * Append Supabase Storage image transform params to reduce delivery size.
 * Falls back gracefully if transforms aren't available (free tier).
 */
export function optimizeImageUrl(url: string | null | undefined, width = 400, quality = 75): string {
  if (!url) return '/placeholder.svg';
  
  // Only transform Supabase storage URLs
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    // Use render/image endpoint for on-the-fly transforms
    const transformed = url.replace(
      '/storage/v1/object/public/',
      `/storage/v1/render/image/public/`
    );
    const separator = transformed.includes('?') ? '&' : '?';
    return `${transformed}${separator}width=${width}&quality=${quality}`;
  }
  
  return url;
}
