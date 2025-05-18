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
    const headers = req.requestHeaders.map(({ name, value }) => {
      switch (name.toLowerCase()) {
        case "cache-control":
          value = "no-cache";
      }
      return { name, value };
    });
    console.log(headers);
    return { requestHeaders: headers };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"],
);

browser.runtime.onInstalled.addListener(async () => {
  console.log("Tabs extension installed");
});
