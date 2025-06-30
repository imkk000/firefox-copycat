const accordions = document.getElementsByClassName("accordion");
const codes = document.getElementById("codes");

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
