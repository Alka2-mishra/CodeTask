const isLocalhostOrigin = (origin: string) => {
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

export const isAllowedDevOrigin = (origin: string | undefined, clientOrigin: string) => {
  if (!origin) {
    return true;
  }

  return origin === clientOrigin || isLocalhostOrigin(origin);
};