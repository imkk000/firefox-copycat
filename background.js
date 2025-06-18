const updateCountTabs = async () => {
  const tabsCount = await browser.tabs.query({ currentWindow: true });
  browser.browserAction.setBadgeText({ text: tabsCount.length.toString() });
  browser.browserAction.setBadgeBackgroundColor({ color: "#FF9800" });
};

const ungroupTabs = async () => {
  const tabs = await browser.tabs.query({ currentWindow: true });
  await browser.tabs.ungroup(
    tabs.map(({ id }) => {
      return id;
    }),
  );
};

const updateTitleGroups = async () => {
  const { id } = await browser.windows.getCurrent();
  const tabGroups = await browser.tabGroups.query({ windowId: id });
  if (tabGroups.length === 0) return;
  tabGroups.forEach(async ({ id, title }) => {
    const q = await browser.tabs.query({ groupId: id });
    await browser.tabGroups.update(id, {
      title: title.replace(/\(\d+\)/, `(${q.length})`),
    });
  });
};

const sortTabs = async () => {
  const tabs = await browser.tabs.query({ currentWindow: true });
  const result = tabs
    .map(({ id, url }) => {
      let { hostname, pathname, protocol } = new URL(url);
      if (hostname.length === 0) hostname = protocol;
      hostname = hostname.replace(/^www.|/g, "");
      hostname = hostname.replace(/\.[^.]+$/, "");

      return { id, hostname, pathname };
    })
    .sort((a, b) => {
      if (a.hostname !== b.hostname) {
        return a.hostname < b.hostname;
      }
      if (a.pathname !== b.pathname) {
        return a.pathname < b.pathname;
      }
      return a.id < b.id;
    })
    .forEach(async ({ id, pathname }) => {
      if (pathname == "newtab") {
        await browser.tabs.remove(id);
        return;
      }
      await browser.tabs.move(id, { index: -1 });
    });
};

const groupTabs = async () => {
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
    if (len < 2) {
      tabGroup["other"] = tabGroup["other"] || [];
      tabGroup["other"].push(...g);
      hostnames.add("other");
      hostnames.delete(hostname);
      delete tabGroup[hostname];
    }
  });

  // ordering
  const sortedHostnames = [...hostnames];
  // TODO: using storage
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

const updateWithCountTabs = async () => {
  updateCountTabs();
  updateTitleGroups();
};

const syncConfig = async () => {
  const { token, url } = await browser.storage.local.get();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.raw+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const result = await response.text();
  await browser.storage.local.set({ result });
  return result;
};

browser.tabs.onCreated.addListener(updateWithCountTabs);
browser.tabs.onRemoved.addListener(updateWithCountTabs);
browser.tabs.onUpdated.addListener(updateTitleGroups);
browser.tabs.onMoved.addListener(updateTitleGroups);

browser.tabGroups.onMoved.addListener(updateTitleGroups);
browser.tabGroups.onUpdated.addListener(updateTitleGroups);

browser.runtime.onStartup.addListener(updateCountTabs);
browser.runtime.onInstalled.addListener(updateCountTabs);
browser.runtime.onMessage.addListener(async (message, _) => {
  const { action } = message;
  switch (action) {
    case "sort":
      return await sortTabs();
    case "group":
      return await groupTabs();
    case "ungroup":
      return await ungroupTabs();
    case "sync":
      return await syncConfig();
  }
  return {};
});

browser.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "sort_tabs":
      return await sortTabs();
  }
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
