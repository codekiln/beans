export const withBase = (path: string) => {
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") {
    return path;
  }
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const suffix = path.startsWith("/") ? path : "/" + path;
  return normalizedBase + suffix;
};
