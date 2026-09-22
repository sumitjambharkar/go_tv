const { withAndroidManifest, withDangerousMod, AndroidConfig } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const LEANBACK_LAUNCHER = "android.intent.category.LEANBACK_LAUNCHER";

function ensureUsesFeature(manifest, name, required) {
  manifest.manifest["uses-feature"] = manifest.manifest["uses-feature"] || [];
  const usesFeature = manifest.manifest["uses-feature"];
  const exists = usesFeature.some((item) => item.$["android:name"] === name);
  if (!exists) {
    usesFeature.push({ $: { "android:name": name, "android:required": String(required) } });
  }
}

function withTvManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(manifest);

    // A TV app must not require a touchscreen, and should declare leanback (TV UI) support.
    ensureUsesFeature(manifest, "android.hardware.touchscreen", false);
    ensureUsesFeature(manifest, "android.software.leanback", false);

    // The Android TV home screen only lists activities whose launcher intent-filter
    // also carries the LEANBACK_LAUNCHER category, which is why the app was invisible there.
    const intentFilters = mainActivity["intent-filter"] || [];
    for (const filter of intentFilters) {
      const actions = filter.action || [];
      const isMainIntent = actions.some((action) => action.$["android:name"] === "android.intent.action.MAIN");
      if (!isMainIntent) continue;
      filter.category = filter.category || [];
      const hasLeanback = filter.category.some((category) => category.$["android:name"] === LEANBACK_LAUNCHER);
      if (!hasLeanback) {
        filter.category.push({ $: { "android:name": LEANBACK_LAUNCHER } });
      }
    }

    // The TV launcher tile shown for the app.
    mainApplication.$["android:banner"] = "@drawable/tv_banner";

    return config;
  });
}

function withTvBanner(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const source = path.join(config.modRequest.projectRoot, "assets", "images", "tv-banner.png");
      const destDir = path.join(config.modRequest.platformProjectRoot, "app", "src", "main", "res", "drawable-xhdpi");
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(source, path.join(destDir, "tv_banner.png"));
      return config;
    },
  ]);
}

module.exports = function withAndroidTv(config) {
  config = withTvManifest(config);
  config = withTvBanner(config);
  return config;
};
