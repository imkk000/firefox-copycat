const buttons = document.getElementsByTagName("p");
const spans = document.getElementsByTagName("span");
const accordions = document.getElementsByClassName("accordion");
const configURL = document.getElementById("config-url");
const codes = document.getElementById("codes");

for (const acc of accordions) {
  acc.addEventListener("click", function() {
    this.classList.toggle("active");
    this.nextElementSibling.classList.toggle("panel-show");
  });
}

for (const button of buttons) {
  button.addEventListener("click", async () => {
    return await browser.runtime.sendMessage({
      action: button.id,
    });
  });
}

for (const span of spans) {
  span.addEventListener("click", async () => {
    if (span.id === "sync") {
      const result = await browser.runtime.sendMessage({
        action: span.id,
      });
      codes.value = result;
    }
    if (span.id === "save") {
      return await browser.storage.local.set({
        url: configURL.value || "",
        result: codes.value,
      });
    }
    if (span.id === "clear") {
      configURL.value = "";
      codes.value = "";
      return await browser.storage.local.clear();
    }
  });
}

(async () => {
  const { url, result } = await browser.storage.local.get();
  configURL.value = url || "";
  codes.value = result || "";
})();
