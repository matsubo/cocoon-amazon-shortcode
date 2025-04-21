# 変数定義
EXTENSION_NAME := amazon_affiliate_code_for_cocoon
ZIP_NAME := $(EXTENSION_NAME).zip
SOURCE_DIR := .

# デフォルトのターゲット
all: build package

# クリーンアップ
clean:
	@echo "Cleaning up..."
	@rm -f $(ZIP_NAME)
	@rm -rf dist

# TypeScript ビルド
build:
	@echo "Installing dependencies if needed..."
	@[ -d "node_modules" ] || npm install
	@echo "Building TypeScript files..."
	@npm run build
	@echo "Build completed successfully!"

# パッケージング
package: build
	@echo "Packaging extension..."
	@zip -r $(ZIP_NAME) \
		dist \
		icon.png \
		manifest.json \
		options/index.html \
		node_modules/bootswatch/dist/flatly/bootstrap.min.css \
		LICENSE
	@echo "Package created: $(ZIP_NAME)"

# 開発用ビルド (ウォッチモード)
dev:
	@echo "Starting development build in watch mode..."
	@npm run watch

# 検証
verify:
	@echo "Verifying package..."
	@unzip -l $(ZIP_NAME)
	@echo "Verification complete."

# ヘルプ
help:
	@echo "Available targets:"
	@echo "  all     : Build and package the extension (default)"
	@echo "  build   : Compile TypeScript files"
	@echo "  clean   : Remove the ZIP file and dist directory"
	@echo "  dev     : Start TypeScript compiler in watch mode"
	@echo "  package : Create the ZIP file (runs build first)"
	@echo "  verify  : List contents of the ZIP file"
	@echo "  help    : Show this help message"

.PHONY: all clean build package dev verify help
