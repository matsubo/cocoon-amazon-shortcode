chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateAffiliateLink") {
    const asin = getASIN();
    const title = getProductTitle();
    
    if (asin && title) {
      chrome.storage.sync.get({excludeKeywords: [], exclude: {}}, function(data) {

        const cleanTitle = removeExcludedKeywords(title, data.excludeKeywords);

        let attributes = [];

        attributes.push(`asin="${asin}"`)
        attributes.push(`kw="${cleanTitle}"`)

        const exclude = data.exclude;

        console.info(exclude['rakuten']);
        if (exclude['rakuten'] == true) {
          attributes.push("rakuten=0");
        }
        if (exclude['yahoo'] == true) {
          attributes.push("yahoo=0");
        }
        if (exclude['mercari'] == true) {
          attributes.push("mercari=0");
        }
        if (exclude['dmm'] == true) {
          attributes.push("dmm=0");
        }

        let attributes_string = attributes.join(" ");
        const affiliateCode = `[amazon ${attributes_string}]`;

        copyToClipboard(affiliateCode);
        alert("クリップボードにコピーされました\n\n" + affiliateCode);
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
