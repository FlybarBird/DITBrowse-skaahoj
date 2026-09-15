/** Kept for workspace persistence compatibility; LPS is detected from the page URL. */
export type CameraDisplayMode = "default" | "arriLps";

export const DEFAULT_CAMERA_DISPLAY_MODE: CameraDisplayMode = "default";

export function normalizeCameraDisplayMode(value: unknown): CameraDisplayMode {
  return value === "arriLps" ? "arriLps" : DEFAULT_CAMERA_DISPLAY_MODE;
}

/** True when the URL looks like an ARRI FBS Camera Web Remote / LPS page. */
export function isArriLpsCameraPath(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      /\/camera(?:\/|$|\?|#)/i.test(`${parsed.pathname}${parsed.search}${parsed.hash}`)
    );
  } catch {
    return false;
  }
}

/** Site root (`http(s)://host/`) for leaving LPS Camera Web Remote. */
export function cameraSiteRootUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return `${parsed.protocol}//${parsed.host}/`;
  } catch {
    return null;
  }
}
