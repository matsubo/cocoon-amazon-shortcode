chrome.runtime.onMessage.addListener((request) => {
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

        // Remove any existing message divs
        const existingMessageDiv = document.querySelector(".affiliate-message");
        if (existingMessageDiv) {
          document.body.removeChild(existingMessageDiv);
        }

        const messageDiv = document.createElement("div");
        messageDiv.textContent = "クリップボードにコピーされました\n\n" + affiliateCode;
        messageDiv.className = "affiliate-message";
        messageDiv.style.position = "fixed";
        messageDiv.style.top = "20px";
        messageDiv.style.left = "50%";
        messageDiv.style.transform = "translateX(-50%)";
        messageDiv.style.backgroundColor = "rgba(51, 51, 51, 0.5)";
        messageDiv.style.color = "#fff";
        messageDiv.style.padding = "10px 20px";
        messageDiv.style.borderRadius = "5px";
        messageDiv.style.zIndex = "1000";
        messageDiv.style.opacity = "0";
        messageDiv.style.transition = "opacity 0.5s";
        document.body.appendChild(messageDiv);
        requestAnimationFrame(() => {
          messageDiv.style.opacity = "1";
        });

        setTimeout(() => {
          document.body.removeChild(messageDiv);
        }, 3000);
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
