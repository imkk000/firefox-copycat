export const exportCookies = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const domain = url.hostname;
  const cookies = await browser.cookies.getAll({ domain: domain });
  return cookies
    .map((cookie) => {
      const domainField = cookie.domain.startsWith(".")
        ? cookie.domain
        : "." + cookie.domain;
      const flag = cookie.hostOnly ? "FALSE" : "TRUE";
      const secure = cookie.secure ? "TRUE" : "FALSE";
      const expiration = cookie.expirationDate
        ? Math.floor(cookie.expirationDate)
        : "0";

      return [
        domainField,
        flag,
        cookie.path,
        secure,
        expiration,
        cookie.name,
        cookie.value,
      ].join("\t");
    })
    .join("\n");
};
