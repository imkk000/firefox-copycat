const buttons = document.getElementsByTagName("p");

for (const button of buttons) {
  button.addEventListener("click", async () => {
    await browser.runtime.sendMessage({
      action: button.id,
    });
  });
}
