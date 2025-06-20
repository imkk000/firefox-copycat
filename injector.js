console.debug("[INJECTION] Content script loaded...");

const injectCSS = (css) => {
  const style = document.createElement("style");
  style.textContent = css;
  document.body.appendChild(style);
};

const injectJS = (js) => {
  const script = document.createElement("script");
  script.textContent = js;
  document.body.appendChild(script);
};

const isInjected = ({ domain, prefix, regex }) => {
  const url = window.location.href;
  const hostname = window.location.hostname;

  return (
    (domain && domain === "*") ||
    (domain && domain === hostname) ||
    (prefix && url.startsWith(prefix)) ||
    (regex && new RegExp(regex).test(url))
  );
};

(async () => {
  const { result } = await browser.storage.local.get("result");
  if (!result) return;

  const sections = JSON.parse(result);
  if (!sections || !sections.length) return;

  for (const section of sections) {
    const { css, js } = section;
    if (!isInjected(section)) continue;
    if (css) injectCSS(css);
    if (js) injectJS(js);
  }
})();
