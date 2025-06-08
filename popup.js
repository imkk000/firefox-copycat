document.getElementById("sort").addEventListener("click", async () => {
  await browser.runtime.sendMessage({
    action: "sort",
  });
});

document.getElementById("delete").addEventListener("click", async () => {
  await browser.runtime.sendMessage({
    action: "delete",
  });
});
