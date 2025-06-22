export const sortTabs = async () => {
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
