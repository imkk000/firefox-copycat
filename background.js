const sortTabs = async () => {
  const tabsCount = new Map();
  const hostnames = new Set();
  const tabs = await browser.tabs.query({ currentWindow: true });
  const sortedTabs = tabs
    .map((tab) => {
      const { id, groupId } = tab;
      const { hostname, pathname } = new URL(tab.url);
      tabsCount[hostname] = tabsCount[hostname] || 0;
      tabsCount[hostname]++;
      hostnames.add(hostname);
      return { id, groupId, hostname, pathname };
    })
    .sort((a, b) => {
      if (tabsCount[a.hostname] !== tabsCount[b.hostname]) {
        return tabsCount[a.hostname] < tabsCount[b.hostname];
      }
      if (a.hostname !== b.hostname) {
        return a.hostname < b.hostname;
      }
      return a.pathname < b.pathname;
    });

  sortedTabs.forEach((tab, i) => {
    browser.tabs.move(tab.id, { index: i });
  });
};

browser.browserAction.onClicked.addListener(async () => {
  await sortTabs();
});

browser.webRequest.onBeforeSendHeaders.addListener(
  (req) => {
    const headers = req.requestHeaders.filter(({ name }) => {
      switch (name.toLowerCase()) {
        case "user-agent":
        case "referer":
        case "cache-control":
          return false;
      }
      return true;
    });
    headers.push({ name: "User-Agent", value: "Mozilla/5.0 (Linux) Gecko/20100101 Firefox/139.0" });
    headers.push({ name: "Cache-Control", value: "no-cache" });
    return { requestHeaders: headers };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"],
);

browser.runtime.onInstalled.addListener(async () => {
  console.log("Tabs extension installed");
});
