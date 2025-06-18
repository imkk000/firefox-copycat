console.debug("[INJECTION] Content script loaded...");

const injectCSS = (css) => {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
};

(async () => {
  const { result } = await browser.storage.local.get("result");
  if (!result) return;

  const { sections } = JSON.parse(result);
  if (!sections || !sections.length) return;

  const url = window.location.href;
  const hostname = window.location.hostname;
  for (const { code, domain, prefix, regex } of sections) {
    if (domain && domain === hostname) return injectCSS(code);
    if (prefix && url.startsWith(prefix)) return injectCSS(code);
    if (regex) {
      const regex = new RegExp(regex);
      if (regex.test(url)) return injectCSS(code);
    }
  }
})();
