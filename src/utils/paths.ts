export const withBase = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") {
    return path;
  }
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const suffix = path.startsWith("/") ? path : "/" + path;
  return normalizedBase + suffix;
};
