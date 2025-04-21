// Amazon Affiliate Link Generator for Cocoon - Background Script

/**
 * Interface for notification message
 */
interface NotificationMessage {
  action: string;
  title: string;
  message: string;
  type: string;
}

/**
 * Check if a tab is on an Amazon product page and generate affiliate link
 * @param tab - The browser tab to check
 */
function processAmazonTab(tab: chrome.tabs.Tab): void {
  if (!tab) {
    console.error("No active tab found");
    return;
  }

  if (tab.url && tab.url.includes("amazon.co.jp")) {
    chrome.tabs.sendMessage(tab.id as number, { action: "generateAffiliateLink" })
      .catch(error => {
        console.error("Error sending message to tab:", error);
      });
  } else {
    showChromeNotification("エラー", "This extension only works on Amazon product pages.", "error");
  }
}

/**
 * Show a Chrome notification
 * @param title - The notification title
 * @param message - The notification message
 * @param type - The notification type (basic or error)
 */
function showChromeNotification(title: string, message: string, type: string): void {
  const iconUrl = chrome.runtime.getURL("icon.png");
  const notificationId = `amazon-affiliate-${Date.now()}`;
  
  console.log("Creating direct notification with:", {
    title: title,
    message: message,
    type: type,
    iconUrl: iconUrl
  });
  
  chrome.notifications.create(notificationId, {
    type: "basic",
    iconUrl: iconUrl,
    title: title,
    message: message,
    priority: type === "error" ? 2 : 0
  }, (notificationId) => {
    console.log("Direct notification created with ID:", notificationId);
    if (chrome.runtime.lastError) {
      console.error("Direct notification error:", chrome.runtime.lastError);
    }
  });
}

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  processAmazonTab(tab);
});

// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener((command: string) => {
  if (command === "activate_extension") {
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(tabs => {
        processAmazonTab(tabs[0]);
      })
      .catch(error => {
        console.error("Error querying tabs:", error);
        showChromeNotification("エラー", "Failed to activate extension. Please try again.", "error");
      });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message: NotificationMessage, sender, sendResponse) => {
  console.log("Background script received message:", message);
  
  if (message.action === "showNotification") {
    try {
      // Use a more reliable path to the icon
      const iconUrl = chrome.runtime.getURL("icon.png");
      
      console.log("Creating notification with:", {
        title: message.title,
        message: message.message,
        type: message.type,
        iconUrl: iconUrl
      });
      
      chrome.notifications.create({
        type: "basic",
        iconUrl: iconUrl,
        title: message.title,
        message: message.message,
        priority: message.type === "error" ? 2 : 0
      }, (notificationId) => {
        console.log("Notification created with ID:", notificationId);
        if (chrome.runtime.lastError) {
          console.error("Notification error:", chrome.runtime.lastError);
        }
        
        // Send response back to content script
        sendResponse({ success: true, notificationId: notificationId });
      });
      
      // Return true to indicate we'll send a response asynchronously
      return true;
    } catch (error) {
      console.error("Error creating notification:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      sendResponse({ success: false, error: errorMessage });
      return true;
    }
  }
  
  return false;
});

// Log when the background script loads
console.log("Amazon Affiliate Link Generator background script loaded");
