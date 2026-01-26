export const withBase = (path: string) => {
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") {
    return path;
  }
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\\/$/, "")}${suffix}`;
};
