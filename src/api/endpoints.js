const getEnv = (key, fallback) => {
  const value = import.meta.env[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

export const API_ENDPOINTS = {
  CERTIFICATES_ME: getEnv("VITE_API_CERTIFICATES_ME", "/certificates/me"),
  CERTIFICATES_DOWNLOAD: getEnv("VITE_API_CERTIFICATES_DOWNLOAD", "/certificates/download"),
};

export const withId = (basePath, id) => `${basePath}/${encodeURIComponent(id)}`;
