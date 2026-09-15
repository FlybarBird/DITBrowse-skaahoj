import { describe, expect, it } from "vitest";
import {
  cameraSiteRootUrl,
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

  it("builds the site root URL for leaving LPS", () => {
    expect(cameraSiteRootUrl("http://10.201.20.101/camera")).toBe("http://10.201.20.101/");
    expect(cameraSiteRootUrl("https://10.201.20.101:8443/camera?x=1")).toBe(
      "https://10.201.20.101:8443/"
    );
    expect(cameraSiteRootUrl("about:blank")).toBeNull();
  });
});
