export const withBase = (path: string) => {
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") {
    return path;
  }
  return `${base.replace(/\\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
};
