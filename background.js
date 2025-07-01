import { groupTabs, ungroupTabs, updateTitleGroups } from "./tabGroups.js";
import { syncConfig } from "./config.js";
import { sortTabs } from "./tabs.js";
import { exportCookies } from "./cookies.js";
import { updateExtension } from "./updater.js";

const updateCountTabs = async () => {
  const tabsCount = await browser.tabs.query({ currentWindow: true });
  browser.browserAction.setBadgeText({ text: tabsCount.length.toString() });
  browser.browserAction.setBadgeBackgroundColor({ color: "#FF9800" });
};

const updateWithCountTabs = async () => {
  updateCountTabs();
  updateTitleGroups();
};

const onStartup = async () => {
  await syncConfig();
  await updateCountTabs();
};

browser.tabs.onCreated.addListener(updateWithCountTabs);
browser.tabs.onRemoved.addListener(updateWithCountTabs);
browser.tabs.onUpdated.addListener(updateTitleGroups);
browser.tabs.onMoved.addListener(updateTitleGroups);

browser.tabGroups.onMoved.addListener(updateTitleGroups);
browser.tabGroups.onUpdated.addListener(updateTitleGroups);

browser.runtime.onStartup.addListener(onStartup);
browser.runtime.onInstalled.addListener(onStartup);
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
    case "export_cookies":
      return await exportCookies();
    case "update_extension":
      return await updateExtension();
  }
  return {};
});

browser.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "sort_tabs":
      return await sortTabs();
  }
});
