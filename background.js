const sortTabs = async () => {
  const tabs = await browser.tabs.query({ currentWindow: true })
  tabs
    .map(tab => {
      const { id } = tab
      const { hostname, pathname } = new URL(tab.url)
      return { id, hostname, pathname }
    })
    .sort((a, b) => {
      if (a.hostname === b.hostname) {
        return a.pathname < b.pathname
      }
      return a.hostname > b.hostname
    })
    .forEach((tab, i) => {
      browser.tabs.move(tab.id, { index: i })
    });
}

browser.runtime.onInstalled.addListener(async () => {
  console.log("Tabs extension installed");
});

browser.browserAction.onClicked.addListener(async _ => {
  await sortTabs();
})

