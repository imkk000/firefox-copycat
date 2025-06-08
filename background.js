const deleteTabGroups = async () => {
  const tabs = await browser.tabs.query({ currentWindow: true });
  await browser.tabs.ungroup(
    tabs.map(({ id }) => {
      return id;
    }),
  );
};

const updateTitleTabGroups = async () => {
  const { id } = await browser.windows.getCurrent();
  const tabGroups = await browser.tabGroups.query({ windowId: id });
  tabGroups.forEach(async ({ id, title }) => {
    const q = await browser.tabs.query({ groupId: id });
    await browser.tabGroups.update(id, {
      title: title.replace(/\(\d+\)/, `(${q.length})`),
    });
  });
};

const sortTabs = async () => {
  const tabGroup = {};
  const hostnames = new Set();
  const tabs = await browser.tabs.query({ currentWindow: true });

  // manipulate
  await tabs.forEach(async ({ id, url }) => {
    let { hostname, pathname } = new URL(url);
    if (hostname.length === 0) {
      if (pathname == "newtab") return;
      hostname = "browser";
    }
    hostname = hostname.replace(/^(www\.)/, "");
    tabGroup[hostname] = tabGroup[hostname] || [];
    tabGroup[hostname].push(id);
    hostnames.add(hostname);
  });

  // grouping
  hostnames.forEach(async (hostname) => {
    const g = tabGroup[hostname];
    const len = g.length;
    if (len <= 2) {
      tabGroup["other"] = tabGroup["other"] || [];
      tabGroup["other"].push(...g);
      hostnames.add("other");
      hostnames.delete(hostname);
      delete tabGroup[hostname];
    }
  });

  // ordering
  const sortedHostnames = [...hostnames];
  const priority = {
    "github.com": -1,
    "go.dev": 99,
    other: 100,
    browser: 101,
  };
  sortedHostnames.sort((a, b) => {
    const pa = priority[a] || 0;
    const pb = priority[b] || 0;
    if (pa != pb) {
      return pa > pb;
    }
    return tabGroup[a].length > tabGroup[b].length;
  });

  // process
  sortedHostnames.forEach(async (hostname) => {
    const g = tabGroup[hostname];
    const gid = await browser.tabs.group({ tabIds: g });
    await browser.tabGroups.update(gid, {
      title: `${hostname} (${g.length})`,
      collapsed: true,
      color: "blue",
    });
  });
};

browser.tabs.onCreated.addListener(updateTitleTabGroups);
browser.tabs.onRemoved.addListener(updateTitleTabGroups);
browser.tabs.onUpdated.addListener(updateTitleTabGroups);
browser.tabs.onMoved.addListener(updateTitleTabGroups);

browser.tabGroups.onMoved.addListener(updateTitleTabGroups);
browser.tabGroups.onUpdated.addListener(updateTitleTabGroups);

browser.runtime.onInstalled.addListener(async () => { });
browser.runtime.onMessage.addListener(async (message, _) => {
  const { action } = message;
  switch (action) {
    case "delete":
      await deleteTabGroups();
      break;
    default:
      await sortTabs();
  }
  return {};
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
    return { requestHeaders: headers };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"],
);
