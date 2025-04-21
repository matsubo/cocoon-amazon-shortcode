// Amazon Affiliate Link Generator for Cocoon - Background Script

/**
 * Check if a tab is on an Amazon product page and generate affiliate link
 * @param {Object} tab - The browser tab to check
 */
function processAmazonTab(tab) {
  if (!tab) {
    console.error("No active tab found");
    return;
  }

  if (tab.url && tab.url.includes("amazon.co.jp")) {
    chrome.tabs.sendMessage(tab.id, { action: "generateAffiliateLink" })
      .catch(error => {
        console.error("Error sending message to tab:", error);
      });
  } else {
    alert("This extension only works on Amazon product pages.");
  }
}

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  processAmazonTab(tab);
});

// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "activate_extension") {
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(tabs => {
        processAmazonTab(tabs[0]);
      })
      .catch(error => {
        console.error("Error querying tabs:", error);
        alert("Failed to activate extension. Please try again.");
      });
  }
});
