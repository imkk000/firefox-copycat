export const groupTabs = async () => {
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

export const updateTitleGroups = async () => {
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

export const ungroupTabs = async () => {
  const tabs = await browser.tabs.query({ currentWindow: true });
  await browser.tabs.ungroup(
    tabs.map(({ id }) => {
      return id;
    }),
  );
};
