chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("amazon.co.jp")) {
    chrome.tabs.sendMessage(tab.id, {action: "generateAffiliateLink"});
  } else {
    alert("This extension only works on Amazon product pages.");
  }
});
chrome.commands.onCommand.addListener((command) => {
  if (command === "activate_extension") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      if (tab.url.includes("amazon.co.jp")) {
        chrome.tabs.sendMessage(tab.id, {action: "generateAffiliateLink"});
      } else {
        alert("This extension only works on Amazon product pages.");
      }
    });
  }
});