import { base } from "astro:config";

export const withBase = (path: string) => {
  if (!base || base === "/") {
    return path;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};
