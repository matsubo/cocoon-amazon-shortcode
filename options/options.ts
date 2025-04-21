// Amazon Affiliate Link Generator for Cocoon - Options Script

/**
 * Interface for exclude options
 */
interface ExcludeOptions {
  rakuten: boolean;
  yahoo: boolean;
  mercari: boolean;
  dmm: boolean;
  [key: string]: boolean;
}

/**
 * Interface for application state
 */
interface AppState {
  excludeKeywords: string[];
  exclude: ExcludeOptions;
}

/**
 * Default configuration values
 */
const defaultExcludeOptions: ExcludeOptions = {
  rakuten: true,
  yahoo: true,
  mercari: true,
  dmm: true
};

/**
 * Application state
 */
const state: AppState = {
  excludeKeywords: [],
  exclude: { ...defaultExcludeOptions }
};

/**
 * Storage handler - Manages saving and loading options
 */
const storageHandler = {
  /**
   * Save current state to Chrome storage
   * @returns Promise that resolves when save is complete
   */
  save(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({
        excludeKeywords: state.excludeKeywords,
        exclude: state.exclude
      }, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          console.error("Error saving options:", error);
          reject(error);
        } else {
          console.debug("Options saved successfully");
          resolve();
        }
      });
    });
  },
  
  /**
   * Load options from Chrome storage
   * @returns Promise that resolves when load is complete
   */
  load(): Promise<AppState> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get({
        excludeKeywords: [],
        exclude: defaultExcludeOptions
      }, (data) => {
        const error = chrome.runtime.lastError;
        if (error) {
          console.error("Error loading options:", error);
          reject(error);
        } else {
          state.excludeKeywords = data.excludeKeywords;
          state.exclude = data.exclude;
          resolve(data as AppState);
        }
      });
    });
  }
};

/**
 * Keyword manager - Handles adding and removing keywords
 */
const keywordManager = {
  /**
   * Add a new keyword to the exclude list
   */
  add(): void {
    const keywordInput = document.getElementById("keyword") as HTMLInputElement;
    const keyword = keywordInput.value.trim();
    
    if (!keyword) {
      return; // Empty input, do nothing
    }
    
    if (state.excludeKeywords.includes(keyword)) {
      // Keyword already exists, show feedback (could be enhanced with visual feedback)
      console.debug(`Keyword "${keyword}" already exists`);
      return;
    }
    
    // Add keyword and update UI
    state.excludeKeywords.push(keyword);
    ui.renderKeywordList();
    
    // Save changes and clear input
    storageHandler.save()
      .then(() => {
        keywordInput.value = "";
      })
      .catch(error => {
        console.error("Failed to save keyword:", error);
        // Revert the change if save failed
        state.excludeKeywords.pop();
        ui.renderKeywordList();
      });
  },
  
  /**
   * Remove a keyword from the exclude list
   * @param keyword - The keyword to remove
   */
  remove(keyword: string): void {
    // Store original keywords for potential rollback
    const originalKeywords = [...state.excludeKeywords];
    
    // Update state
    state.excludeKeywords = state.excludeKeywords.filter(k => k !== keyword);
    ui.renderKeywordList();
    
    // Save changes
    storageHandler.save()
      .catch(error => {
        console.error("Failed to remove keyword:", error);
        // Revert the change if save failed
        state.excludeKeywords = originalKeywords;
        ui.renderKeywordList();
      });
  },
  
  /**
   * Handle keyboard events for the keyword input
   * @param event - The keyboard event
   */
  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      this.add();
    }
  }
};

/**
 * UI manager - Handles UI rendering and interactions
 */
const ui = {
  /**
   * Render the list of excluded keywords
   */
  renderKeywordList(): void {
    const list = document.getElementById("keywordList") as HTMLUListElement;
    list.innerHTML = "";
    
    if (state.excludeKeywords.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.className = "list-group-item text-muted";
      emptyMessage.textContent = "除外キーワードはありません";
      list.appendChild(emptyMessage);
      return;
    }
    
    state.excludeKeywords.forEach(keyword => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      
      const span = document.createElement("span");
      span.textContent = keyword;
      li.appendChild(span);
      
      const removeButton = document.createElement("button");
      removeButton.textContent = "削除";
      removeButton.className = "btn btn-danger btn-sm";
      removeButton.addEventListener("click", () => keywordManager.remove(keyword));
      li.appendChild(removeButton);
      
      list.appendChild(li);
    });
  },
  
  /**
   * Update checkbox states based on current options
   */
  updateCheckboxes(): void {
    document.querySelectorAll<HTMLInputElement>("input[name=\"exclude\"]").forEach(checkbox => {
      checkbox.checked = state.exclude[checkbox.id] === true;
    });
  },
  
  /**
   * Set up dark/light theme based on system preference
   */
  setupTheme(): void {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-bs-theme", "dark");
    }
  },
  
  /**
   * Handle checkbox change events
   * @param event - The change event
   */
  handleCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    state.exclude[checkbox.id] = checkbox.checked;
    
    storageHandler.save()
      .catch(error => {
        console.error("Failed to save checkbox state:", error);
        // Revert the change if save failed
        checkbox.checked = !checkbox.checked;
        state.exclude[checkbox.id] = checkbox.checked;
      });
  },
  
  /**
   * Set up all event listeners
   */
  setupEventListeners(): void {
    // Add button click
    const addButton = document.getElementById("add");
    if (addButton) {
      addButton.addEventListener("click", () => keywordManager.add());
    }
    
    // Keyword input enter key
    const keywordInput = document.getElementById("keyword");
    if (keywordInput) {
      keywordInput.addEventListener("keypress", (event) => keywordManager.handleKeyPress(event as KeyboardEvent));
    }
    
    // Exclude checkboxes
    document.querySelectorAll<HTMLInputElement>("input[name=\"exclude\"]").forEach(checkbox => {
      checkbox.addEventListener("change", (event) => this.handleCheckboxChange(event));
    });
  },
  
  /**
   * Show error message to the user
   * @param message - The error message to display
   */
  showError(message: string): void {
    console.error(message);
    // Could be enhanced with a visual error message
    alert(`エラーが発生しました: ${message}`);
  }
};

/**
 * Application initialization
 */
const app = {
  /**
   * Initialize the application
   */
  init(): void {
    try {
      ui.setupTheme();
      ui.setupEventListeners();
      
      storageHandler.load()
        .then(() => {
          ui.renderKeywordList();
          ui.updateCheckboxes();
        })
        .catch(error => {
          console.error("Failed to load settings:", error);
          ui.showError("設定の読み込みに失敗しました");
        });
    } catch (error) {
      console.error("Initialization error:", error);
      ui.showError("初期化中にエラーが発生しました");
    }
  }
};

// Start the application
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
