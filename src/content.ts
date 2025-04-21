// Amazon Affiliate Link Generator for Cocoon - Content Script

/**
 * Interface for product information
 */
export interface ProductInfo {
  asin: string | null;
  title: string | null;
}

/**
 * Interface for user options
 */
interface UserOptions {
  excludeKeywords: string[];
  exclude: {
    rakuten?: boolean;
    yahoo?: boolean;
    mercari?: boolean;
    dmm?: boolean;
    [key: string]: boolean | undefined;
  };
}

/**
 * AmazonProductExtractor - Extracts product information from Amazon product pages
 */
const AmazonProductExtractor = {
  /**
   * Get the ASIN of the current product
   * @returns The ASIN or null if not found
   */
  getASIN(): string | null {
    const asinElement = document.getElementById("ASIN") as HTMLInputElement | null;
    return asinElement ? asinElement.value : null;
  },

  /**
   * Get the title of the current product
   * @returns The product title or null if not found
   */
  getProductTitle(): string | null {
    const titleElement = document.getElementById("productTitle");
    return titleElement ? titleElement.textContent?.trim() || null : null;
  }
};

/**
 * ClipboardManager - Manages clipboard operations
 */
const ClipboardManager = {
  /**
   * Copy text to clipboard
   * @param text - The text to copy
   */
  copyToClipboard(text: string): void {
    const textarea = document.createElement("textarea");
    textarea.textContent = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
};

/**
 * NotificationManager - Manages notification messages using Chrome's API
 */
const NotificationManager = {
  /**
   * Show a notification message
   * @param message - The message to display
   */
  showNotification(message: string): void {
    console.log("Content script sending notification message:", message);
    
    // Send message to background script to show notification
    chrome.runtime.sendMessage({
      action: "showNotification",
      title: "Amazon Affiliate Link Generator",
      message: message,
      type: "basic"
    }, (response) => {
      console.log("Notification response from background:", response);
      if (chrome.runtime.lastError) {
        console.error("Error sending notification message:", chrome.runtime.lastError);
        this.showFallbackNotification(message);
      }
    });
  },
  
  /**
   * Show an error message
   * @param message - The error message
   */
  showError(message: string): void {
    console.log("Content script sending error notification:", message);
    
    // Send message to background script to show error notification
    chrome.runtime.sendMessage({
      action: "showNotification",
      title: "エラー",
      message: message,
      type: "error"
    }, (response) => {
      console.log("Error notification response from background:", response);
      if (chrome.runtime.lastError) {
        console.error("Error sending error notification:", chrome.runtime.lastError);
        this.showFallbackNotification(message, true);
      }
    });
  },
  
  /**
   * Fallback notification method if Chrome API fails
   * @param message - The message to display
   * @param isError - Whether this is an error message
   */
  showFallbackNotification(message: string, isError: boolean = false): void {
    console.log("Using fallback notification:", message, isError);
    
    // Create a simple alert as fallback
    alert(isError ? `エラー: ${message}` : message);
  }
};

/**
 * ShortcodeGenerator - Generates affiliate shortcodes
 */
const ShortcodeGenerator = {
  /**
   * Remove excluded keywords from the title
   * @param title - The original title
   * @param excludeKeywords - Keywords to exclude
   * @returns The cleaned title
   */
  removeExcludedKeywords(title: string, excludeKeywords: string[]): string {
    let cleanTitle = title;
    excludeKeywords.forEach(keyword => {
      cleanTitle = cleanTitle.replace(keyword, "").trim();
    });
    return cleanTitle;
  },
  
  /**
   * Generate attributes for the shortcode
   * @param asin - The product ASIN
   * @param title - The product title
   * @param options - Options for shortcode generation
   * @returns The generated shortcode
   */
  generateShortcode(asin: string, title: string, options: UserOptions): string {
    const { excludeKeywords = [], exclude = {} } = options;
    
    // Clean the title
    const cleanTitle = this.removeExcludedKeywords(title, excludeKeywords);
    
    // Build attributes array
    const attributes = [
      `asin="${asin}"`,
      `kw="${cleanTitle}"`
    ];
    
    // Add exclusion attributes
    if (exclude.rakuten === true) {
      attributes.push("rakuten=0");
    }
    if (exclude.yahoo === true) {
      attributes.push("yahoo=0");
    }
    if (exclude.mercari === true) {
      attributes.push("mercari=0");
    }
    if (exclude.dmm === true) {
      attributes.push("dmm=0");
    }
    
    // Join attributes and create the shortcode
    const attributesString = attributes.join(" ");
    return `[amazon ${attributesString}]`;
  }
};

/**
 * Interface for message request
 */
interface MessageRequest {
  action: string;
}

/**
 * MessageHandler - Handles extension messages
 */
const MessageHandler = {
  /**
   * Initialize the message handler
   */
  init(): void {
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  },
  
  /**
   * Handle incoming messages
   * @param request - The message request
   */
  handleMessage(request: MessageRequest): void {
    if (request.action === "generateAffiliateLink") {
      this.handleGenerateAffiliateLink();
    }
  },
  
  /**
   * Handle the generate affiliate link action
   */
  handleGenerateAffiliateLink(): void {
    // Get product information
    const asin = AmazonProductExtractor.getASIN();
    const title = AmazonProductExtractor.getProductTitle();
    
    if (asin && title) {
      // Get user options from storage
      chrome.storage.sync.get(
        { excludeKeywords: [], exclude: {} },
        (data) => this.processProductData(asin, title, data as UserOptions)
      );
    } else {
      NotificationManager.showError(
        "アフィリエイトリンクを生成できませんでした。商品ページにいることを確認してください。"
      );
    }
  },
  
  /**
   * Process product data and generate the shortcode
   * @param asin - The product ASIN
   * @param title - The product title
   * @param options - User options from storage
   */
  processProductData(asin: string, title: string, options: UserOptions): void {
    // Generate the shortcode
    const affiliateCode = ShortcodeGenerator.generateShortcode(
      asin,
      title,
      options
    );
    
    // Copy to clipboard
    ClipboardManager.copyToClipboard(affiliateCode);
    
    // Show notification
    NotificationManager.showNotification(
      "クリップボードにコピーされました\n\n" + affiliateCode
    );
  }
};

// Initialize the message handler when the content script loads
MessageHandler.init();
