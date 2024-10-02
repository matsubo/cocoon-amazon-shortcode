# 変数定義
EXTENSION_NAME := amazon_affiliate_code_for_cocoon
ZIP_NAME := $(EXTENSION_NAME).zip
SOURCE_DIR := .

# デフォルトのターゲット
all: clean package

# クリーンアップ
clean:
	@echo "Cleaning up..."
	@rm -f $(ZIP_NAME)

# パッケージング
package:
	@echo "Packaging extension..."
	@zip -r $(ZIP_NAME) $(SOURCE_DIR) \
		-x "*.git*" \
		-x "*.DS_Store" \
		-x "*Thumbs.db" \
		-x "Makefile" \
		-x "node_modules/*" \
		-x "doc/*" \
		-x "*.un~" \
		-x ".*" \
		-x "package*" \
		-x "README.md" \
		-x "*.zip"
	@echo "Package created: $(ZIP_NAME)"

# 検証
verify:
	@echo "Verifying package..."
	@unzip -l $(ZIP_NAME)
	@echo "Verification complete."

# ヘルプ
help:
	@echo "Available targets:"
	@echo "  all     : Clean and package the extension (default)"
	@echo "  clean   : Remove the ZIP file"
	@echo "  package : Create the ZIP file"
	@echo "  verify  : List contents of the ZIP file"
	@echo "  help    : Show this help message"

.PHONY: all clean package verify help

