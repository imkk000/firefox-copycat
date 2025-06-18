const buttons = document.getElementsByTagName("p");
const spans = document.getElementsByTagName("span");
const accordions = document.getElementsByClassName("accordion");
const config = document.getElementById("config");
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
      const { token, url } = JSON.parse(config.value);
      return await browser.storage.local.set({
        token,
        url,
        result: codes.value,
      });
    }
    if (span.id === "clear") {
      config.value = "";
      codes.value = "";
      return await browser.storage.local.clear();
    }
  });
}

(async () => {
  const { token, url, result } = await browser.storage.local.get();
  config.value = JSON.stringify({ token, url }, null, 2) || "{}";
  codes.value = result || "";
})();
