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

/** True when the URL looks like an ARRI FBS Camera Web Remote page. */
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

/**
 * Detect ARRI FBS / LPS Camera Web Remote and isolate the Camera UI iframe.
 * Returns: "applied" | "watching" | "skip" | "idle"
 *
 * Runs on any loaded page; only mutates the DOM when LPS markers are found.
 * Uses a MutationObserver so late SPA mounts still get isolated.
 */
export const ARRI_LPS_ISOLATE_SCRIPT = `(() => {
  const MARK = "data-ditbrowse-arri-lps";
  const WATCH = "data-ditbrowse-arri-lps-watch";

  const findLpsIframe = () => {
    const byTitle = document.querySelector('iframe[title="Camera UI"]');
    if (byTitle instanceof HTMLIFrameElement) {
      return byTitle;
    }
    const byMain = document.querySelector("main iframe");
    if (byMain instanceof HTMLIFrameElement) {
      return byMain;
    }
    return null;
  };

  const looksLikeLpsShell = () => {
    if (findLpsIframe()) {
      return true;
    }
    if (/\\/camera(?:\\/|$|\\?|#)/i.test(location.pathname + location.search + location.hash)) {
      return true;
    }
    const nav = document.body ? document.body.innerText : "";
    return /Camera Web Remote/i.test(nav) && /CAM CH:/i.test(nav);
  };

  const isolate = (iframe) => {
    if (!(iframe instanceof HTMLIFrameElement)) {
      return false;
    }
    if (document.documentElement.getAttribute(MARK) === "1") {
      return true;
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
  };

  const tryApply = () => {
    const iframe = findLpsIframe();
    return iframe ? isolate(iframe) : false;
  };

  if (tryApply()) {
    return "applied";
  }

  if (!looksLikeLpsShell()) {
    return "skip";
  }

  if (document.documentElement.getAttribute(WATCH) === "1") {
    return "watching";
  }

  document.documentElement.setAttribute(WATCH, "1");
  const observer = new MutationObserver(() => {
    if (tryApply()) {
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 20000);
  return "watching";
})()`;
