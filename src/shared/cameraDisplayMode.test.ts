import { describe, expect, it } from "vitest";
import {
  ARRI_LPS_ISOLATE_SCRIPT,
  isArriLpsCameraPath,
  normalizeCameraDisplayMode
} from "./cameraDisplayMode";

describe("cameraDisplayMode", () => {
  it("normalizes unknown values to default", () => {
    expect(normalizeCameraDisplayMode(undefined)).toBe("default");
    expect(normalizeCameraDisplayMode("nope")).toBe("default");
    expect(normalizeCameraDisplayMode("arriLps")).toBe("arriLps");
  });

  it("matches ARRI FBS /camera paths", () => {
    expect(isArriLpsCameraPath("http://10.201.20.101/camera")).toBe(true);
    expect(isArriLpsCameraPath("http://10.201.20.101/camera/")).toBe(true);
    expect(isArriLpsCameraPath("http://10.201.20.101/camera?lang=en")).toBe(true);
    expect(isArriLpsCameraPath("http://10.201.20.101/")).toBe(false);
    expect(isArriLpsCameraPath("http://10.201.20.101/video")).toBe(false);
  });

  it("exports a detect-and-isolate script for the Camera UI iframe", () => {
    expect(ARRI_LPS_ISOLATE_SCRIPT).toContain('iframe[title="Camera UI"]');
    expect(ARRI_LPS_ISOLATE_SCRIPT).toContain("MutationObserver");
    expect(ARRI_LPS_ISOLATE_SCRIPT).toContain("Camera Web Remote");
    expect(ARRI_LPS_ISOLATE_SCRIPT).toContain("position:fixed");
  });
});
