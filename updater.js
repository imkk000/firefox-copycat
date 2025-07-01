export const updateExtension = async () => {
  const response = await fetch(
    "https://extensions.xcx.sh/downloads?file=updates.json",
  );
  const { version: latestVersion, url } = await response.json();

  const manifest = browser.runtime.getManifest();
  const currentVersion = manifest.version;

  try {
    if (latestVersion !== currentVersion) {
      await browser.tabs.create({ url, active: true });

      return `Update available: ${latestVersion}`;
    }
    return "Extension is up to date";
  } catch (error) {
    return "Update check failed: " + error.message;
  }
};
