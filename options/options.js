// Configuration objects
const defaultExcludeOptions = {
  rakuten: true,
  yahoo: true,
  mercari: true,
  dmm: true
};

// State management
const state = {
  excludeKeywords: [],
  exclude: { ...defaultExcludeOptions }
};

// Storage handlers
const storageHandler = {
  save() {
    chrome.storage.sync.set({
      excludeKeywords: state.excludeKeywords,
      exclude: state.exclude
    }, () => console.debug("Options saved"));
  },
  
  load() {
    chrome.storage.sync.get({
      excludeKeywords: [],
      exclude: defaultExcludeOptions
    }, data => {
      state.excludeKeywords = data.excludeKeywords;
      state.exclude = data.exclude;
      ui.renderKeywordList();
      ui.updateCheckboxes();
    });
  }
};

// Keyword operations
const keywordManager = {
  add() {
    const keywordInput = document.getElementById("keyword");
    const keyword = keywordInput.value.trim();
    
    if (keyword && !state.excludeKeywords.includes(keyword)) {
      state.excludeKeywords.push(keyword);
      ui.renderKeywordList();
      storageHandler.save();
      keywordInput.value = "";
    }
  },
  
  remove(keyword) {
    state.excludeKeywords = state.excludeKeywords.filter(k => k !== keyword);
    ui.renderKeywordList();
    storageHandler.save();
  }
};

// UI operations
const ui = {
  renderKeywordList() {
    const list = document.getElementById("keywordList");
    list.innerHTML = "";
    
    state.excludeKeywords.forEach(keyword => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      
      const span = document.createElement("span");
      span.textContent = keyword;
      li.appendChild(span);
      
      const removeButton = document.createElement("button");
      removeButton.textContent = "削除";
      removeButton.className = "btn btn-danger btn-sm";
      removeButton.onclick = () => keywordManager.remove(keyword);
      li.appendChild(removeButton);
      
      list.appendChild(li);
    });
  },
  
  updateCheckboxes() {
    document.querySelectorAll("input[name=\"exclude\"]").forEach(checkbox => {
      checkbox.checked = state.exclude[checkbox.id];
    });
  },
  
  setupTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-bs-theme", "dark");
    }
  },
  
  setupEventListeners() {
    document.getElementById("add").addEventListener("click", keywordManager.add);
    
    document.querySelectorAll("input[name=\"exclude\"]").forEach(checkbox => {
      checkbox.addEventListener("change", function() {
        state.exclude[this.id] = this.checked;
        storageHandler.save();
      });
    });
  }
};

// Initialize the application
function init() {
  ui.setupTheme();
  ui.setupEventListeners();
  storageHandler.load();
}

// Start the application
init();