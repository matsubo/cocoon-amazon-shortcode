// Amazon Affiliate Link Generator for Cocoon - Content Script

/**
 * Interface for product information
 */
interface ProductInfo {
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
 * NotificationManager - Manages notification messages
 */
const NotificationManager = {
  /**
   * Show a notification message
   * @param message - The message to display
   * @param duration - Duration in milliseconds
   */
  showNotification(message: string, duration: number = 3000): void {
    // Remove any existing message divs
    this.removeExistingNotifications();
    
    // Create and style the message div
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.className = "affiliate-message";
    
    // Apply styles
    this.applyStyles(messageDiv);
    
    // Add to DOM and animate
    document.body.appendChild(messageDiv);
    this.animateNotification(messageDiv, duration);
  },
  
  /**
   * Remove existing notification elements
   */
  removeExistingNotifications(): void {
    const existingMessageDiv = document.querySelector(".affiliate-message");
    if (existingMessageDiv) {
      document.body.removeChild(existingMessageDiv);
    }
  },
  
  /**
   * Apply styles to the notification element
   * @param element - The element to style
   */
  applyStyles(element: HTMLElement): void {
    element.style.position = "fixed";
    element.style.top = "20px";
    element.style.left = "50%";
    element.style.transform = "translateX(-50%)";
    element.style.backgroundColor = "rgba(51, 51, 51, 0.5)";
    element.style.color = "#fff";
    element.style.padding = "10px 20px";
    element.style.borderRadius = "5px";
    element.style.zIndex = "1000";
    element.style.opacity = "0";
    element.style.transition = "opacity 0.5s";
  },
  
  /**
   * Animate the notification (fade in, wait, fade out)
   * @param element - The element to animate
   * @param duration - Duration to show the notification
   */
  animateNotification(element: HTMLElement, duration: number): void {
    requestAnimationFrame(() => {
      element.style.opacity = "1";
    });

    setTimeout(() => {
      document.body.removeChild(element);
    }, duration);
  },
  
  /**
   * Show an error message using browser alert
   * @param message - The error message
   */
  showError(message: string): void {
    alert(message);
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
