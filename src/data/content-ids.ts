const CONTENT_EXTENSION_PATTERN = /\.(md|mdx)$/i;

export const getContentSlug = (id: string) => id.replace(CONTENT_EXTENSION_PATTERN, "");

export const getContentPathSegments = (id: string) => getContentSlug(id).split("/").filter(Boolean);
