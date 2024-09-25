chrome.browserAction.onClicked.addListener((tab) => {
  if (tab.url.includes("amazon.co.jp")) {
    chrome.tabs.sendMessage(tab.id, {action: "generateAffiliateLink"});
  } else {
    alert("This extension only works on Amazon product pages.");
  }
});
