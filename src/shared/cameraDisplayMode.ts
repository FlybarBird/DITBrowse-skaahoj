/** Per-camera guest-page display modes for camera tiles. */
export type CameraDisplayMode = "default" | "arriLps";

export const DEFAULT_CAMERA_DISPLAY_MODE: CameraDisplayMode = "default";

export const CAMERA_DISPLAY_MODE_OPTIONS: ReadonlyArray<{
  value: CameraDisplayMode;
  label: string;
}> = [
  { value: "default", label: "Default" },
  { value: "arriLps", label: "Arri LPS" }
];

export function normalizeCameraDisplayMode(value: unknown): CameraDisplayMode {
  return value === "arriLps" ? "arriLps" : DEFAULT_CAMERA_DISPLAY_MODE;
}

export function isArriLpsCameraPath(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      /\/camera\/?$/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

/**
 * Isolates the ARRI FBS / Camera Web Remote LPS iframe and hides the shell chrome.
 * Prefer title="Camera UI"; fall back to main iframe.
 */
export const ARRI_LPS_ISOLATE_SCRIPT = `(() => {
  const MARK = "data-ditbrowse-arri-lps";
  if (document.documentElement.getAttribute(MARK) === "1") {
    const existing =
      document.querySelector('iframe[title="Camera UI"]') ||
      document.querySelector("main iframe") ||
      document.querySelector("iframe");
    return Boolean(existing);
  }

  const iframe =
    document.querySelector('iframe[title="Camera UI"]') ||
    document.querySelector("main iframe") ||
    document.querySelector("iframe");
  if (!(iframe instanceof HTMLIFrameElement)) {
    return false;
  }

  document.documentElement.setAttribute(MARK, "1");
  document.documentElement.style.cssText =
    "height:100%!important;width:100%!important;overflow:hidden!important;background:#000!important;";
  document.body.style.cssText =
    "margin:0!important;padding:0!important;height:100%!important;width:100%!important;overflow:hidden!important;background:#000!important;";

  for (const el of Array.from(document.body.children)) {
    if (el instanceof HTMLElement && !el.contains(iframe)) {
      el.style.setProperty("display", "none", "important");
    }
  }

  let node = iframe.parentElement;
  while (node && node !== document.body) {
    node.style.cssText =
      "display:block!important;position:static!important;margin:0!important;padding:0!important;border:0!important;width:100%!important;height:100%!important;max-width:none!important;min-width:0!important;min-height:0!important;overflow:hidden!important;background:#000!important;";
    for (const sibling of Array.from(node.parentElement?.children || [])) {
      if (
        sibling instanceof HTMLElement &&
        sibling !== node &&
        !sibling.contains(iframe)
      ) {
        sibling.style.setProperty("display", "none", "important");
      }
    }
    node = node.parentElement;
  }

  iframe.style.cssText =
    "position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;min-width:0!important;min-height:0!important;border:0!important;border-radius:0!important;margin:0!important;padding:0!important;background:#000!important;z-index:2147483647!important;";
  return true;
})()`;
