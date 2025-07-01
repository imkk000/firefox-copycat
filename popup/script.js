const accordions = document.getElementsByClassName("accordion");
const codes = document.getElementById("codes");

document.getElementById("tab-acc").innerText +=
  ` (${browser.runtime.getManifest().version})`;

for (const acc of accordions) {
  acc.addEventListener("click", function() {
    this.classList.toggle("active");
    this.nextElementSibling.classList.toggle("panel-show");
  });
}

const sortButton = document.getElementById("sort");
const groupButton = document.getElementById("group");
const ungroupButton = document.getElementById("ungroup");
for (const button of [sortButton, groupButton, ungroupButton]) {
  button.addEventListener("click", async () => {
    return await browser.runtime.sendMessage({
      action: button.id,
    });
  });
}

document.getElementById("save").addEventListener("click", async () => {
  return await browser.storage.local.set({
    result: codes.value,
  });
});

document.getElementById("sync").addEventListener("click", async () => {
  const result = await browser.runtime.sendMessage({
    action: "sync",
  });
  codes.value = result;
});

document.getElementById("clear").addEventListener("click", async () => {
  codes.value = "";
  return await browser.storage.local.clear();
});

(async () => {
  const { result } = await browser.storage.local.get();
  codes.value = result || "";
})();

document
  .getElementById("export-cookies")
  .addEventListener("click", async () => {
    const cookiesTxt = await browser.runtime.sendMessage({
      action: "export_cookies",
    });
    await navigator.clipboard.writeText(cookiesTxt);
  });

const statusBar = document.getElementById("status-bar");
document.getElementById("update-ext").addEventListener("click", async () => {
  const status = await browser.runtime.sendMessage({
    action: "update_extension",
  });
  statusBar.innerText = status;
});
