function normalizeViteEnv(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;

  let normalized = value.trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized.length > 0 ? normalized : undefined;
}

export const SITE_PASSWORD = normalizeViteEnv(import.meta.env.VITE_SITE_PASSWORD);
export const TEACHER_PASSWORD = normalizeViteEnv(import.meta.env.VITE_TEACHER_PASSWORD);
