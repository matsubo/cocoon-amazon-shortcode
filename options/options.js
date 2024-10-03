let excludeKeywords = [];
let exclude = {
    rakuten: false,
    yahoo: false,
    mercari: false,
    dmm: false
};

function saveOptions() {
    chrome.storage.sync.set({
        excludeKeywords: excludeKeywords,
        exclude: exclude
    }, function() {
        console.debug('Options saved');
    });
}

function addKeyword() {
    const keyword = document.getElementById('keyword').value.trim();
    if (keyword && !excludeKeywords.includes(keyword)) {
        excludeKeywords.push(keyword);
        updateKeywordList();
        saveOptions();
        document.getElementById('keyword').value = '';
    }
}

function removeKeyword(keyword) {
    excludeKeywords = excludeKeywords.filter(k => k !== keyword);
    updateKeywordList();
    saveOptions();
}

function updateKeywordList() {
    const list = document.getElementById('keywordList');
    list.innerHTML = '';
    excludeKeywords.forEach(keyword => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        const span = document.createElement('span');
        span.textContent = keyword;
        li.appendChild(span);
        const removeButton = document.createElement('button');
        removeButton.textContent = '削除';
        removeButton.className = 'btn btn-danger btn-sm';
        removeButton.onclick = () => removeKeyword(keyword);
        li.appendChild(removeButton);
        list.appendChild(li);
    });
}

function updateCheckboxes() {
    document.querySelectorAll('input[name="exclude"]').forEach(checkbox => {
        checkbox.checked = exclude[checkbox.id];
    });
}

document.getElementById('add').addEventListener('click', addKeyword);

document.querySelectorAll('input[name="exclude"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        exclude[this.id] = this.checked;
        saveOptions();
    });
});

// Load saved options
chrome.storage.sync.get({
    excludeKeywords: [],
    exclude: {
        rakuten: true,
        yahoo: true,
        mercari: true,
        dmm: true
    }
}, function(data) {
    excludeKeywords = data.excludeKeywords;
    exclude = data.exclude;
    updateKeywordList();
    updateCheckboxes();
});

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
}