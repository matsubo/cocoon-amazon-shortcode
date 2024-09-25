let excludeKeywords = [];

function saveOptions() {
    chrome.storage.sync.set({excludeKeywords: excludeKeywords}, function() {
        console.debug('Keywords saved');
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
        removeButton.textContent = 'Remove';
        removeButton.className = 'btn btn-danger btn-sm';
        removeButton.onclick = () => removeKeyword(keyword);
        li.appendChild(removeButton);
        list.appendChild(li);
    });
}

document.getElementById('add').addEventListener('click', addKeyword);

// Load saved keywords
chrome.storage.sync.get({excludeKeywords: []}, function(data) {
    excludeKeywords = data.excludeKeywords;
    updateKeywordList();
});
