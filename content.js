chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateAffiliateLink") {
    const asin = getASIN();
    const title = getProductTitle();
    
    if (asin && title) {
      chrome.storage.sync.get({excludeKeywords: []}, function(data) {
        const cleanTitle = removeExcludedKeywords(title, data.excludeKeywords);
        const affiliateCode = `[amazon asin="${asin}" kw="${cleanTitle}"]`;
        copyToClipboard(affiliateCode);
        alert("クリップボードにコピーされました");
      });
    } else {
      alert("Could not generate affiliate link. Make sure you're on a product page.");
    }
  }
});

function getASIN() {
  const asinElement = document.getElementById("ASIN");
  return asinElement ? asinElement.value : null;
}

function getProductTitle() {
  const titleElement = document.getElementById("productTitle");
  return titleElement ? titleElement.textContent.trim() : null;
}

function removeExcludedKeywords(title, excludeKeywords) {
  let cleanTitle = title;
  excludeKeywords.forEach(keyword => {
    cleanTitle = cleanTitle.replace(keyword, '').trim();
  });
  return cleanTitle;
}

function copyToClipboard(text) {
  const textarea = document.createElement("textarea");
  textarea.textContent = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
