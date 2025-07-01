const syncURL = "https://extensions.xcx.sh/downloads?file=config.json";

export const syncConfig = async () => {
  const response = await fetch(syncURL);
  if (response.status !== 200) {
    return {};
  }
  const result = await response.text();
  await browser.storage.local.set({ result });
  return result;
};
