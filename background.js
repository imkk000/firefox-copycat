const sortTabs = async () => {
  const tabsCount = new Map()
  const hostnames = new Set()
  const tabs = await browser.tabs.query({ currentWindow: true })
  const sortedTabs = tabs
    .map(tab => {
      const { id, groupId } = tab
      const { hostname, pathname } = new URL(tab.url)
      tabsCount[hostname] = tabsCount[hostname] || 0
      tabsCount[hostname]++
      hostnames.add(hostname)
      return { id, groupId, hostname, pathname }
    })
    .sort((a, b) => {
      if (tabsCount[a.hostname] !== tabsCount[b.hostname]) {
        return tabsCount[a.hostname] < tabsCount[b.hostname]
      }
      if (a.hostname !== b.hostname) {
        return a.hostname < b.hostname
      }
      return a.pathname < b.pathname
    })

  sortedTabs.forEach((tab, i) => {
    browser.tabs.move(tab.id, { index: i })
  })

  for (const hostname of hostnames) {
    if (tabsCount[hostname] <= 5 || hostname.length === 0) {
      continue
    }
    const ids = sortedTabs
      .filter(tab => tab.hostname === hostname)
      .map(tab => tab.id)
    const groupId = await browser.tabs.group({ tabIds: ids })
    await browser.tabGroups.update(groupId, { title: hostname, collapsed: false })
  }
}

browser.browserAction.onClicked.addListener(async () => {
  await sortTabs();
})

browser.webRequest.onBeforeSendHeaders.addListener(req => {
  const headers = req.requestHeaders.filter(({ name }, i) => {
    name = name.toLowerCase()
    return name !== "user-agent" && name !== "referer" && name !== "origin"
  })
  headers.push({ name: "User-Agent", value: "Mozilla/5.0" })
  return { requestHeaders: headers }
}, { urls: ["<all_urls>"] }, ["requestHeaders"])

browser.runtime.onInstalled.addListener(async () => {
  console.log("Tabs extension installed");
})

