#!/bin/bash
set -euo pipefail

VITE_VERSIONS=("5.4.11" "6.0.0" "7.0.0" "8.0.0")
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FIXTURE_DIR="$ROOT_DIR/__tests__/fixtures/vite-app"
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/vite-plugin-singlefile-XXXXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Building package tarball..."
npm run build >/dev/null
PACKAGE_FILE="$(npm pack --pack-destination "$TMP_DIR" | tail -n 1)"
PACKAGE_TGZ="$TMP_DIR/$PACKAGE_FILE"

echo "Testing against multiple Vite versions..."

for version in "${VITE_VERSIONS[@]}"; do
	echo ""
	echo "=========================================="
	echo "Testing with Vite $version..."
	echo "=========================================="

	APP_DIR="$TMP_DIR/app-$version"
	mkdir -p "$APP_DIR"
	cp -R "$FIXTURE_DIR"/. "$APP_DIR"/

	cat > "$APP_DIR/package.json" <<'EOF'
{
	"name": "vite-plugin-singlefile-matrix",
	"private": true,
	"type": "module"
}
EOF

	cat > "$APP_DIR/vite.config.ts" <<'EOF'
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
	plugins: [viteSingleFile()],
})
EOF

	pushd "$APP_DIR" >/dev/null
	npm install "vite@$version" "$PACKAGE_TGZ" --silent
	BUILD_OUTPUT="$(node ./node_modules/vite/bin/vite.js build 2>&1)"
	echo "$BUILD_OUTPUT"

	if [ ! -f dist/index.html ]; then
		echo "dist/index.html was not generated for Vite $version"
		exit 1
	fi

	if find dist -mindepth 1 ! -name "index.html" | grep -q .; then
		echo "Additional dist files were generated for Vite $version"
		find dist -mindepth 1 ! -name "index.html"
		exit 1
	fi

	if ! grep -q "<style" dist/index.html; then
		echo "CSS was not inlined for Vite $version"
		exit 1
	fi

	if grep -q '<script[^>]*src=' dist/index.html; then
		echo "JavaScript was not inlined for Vite $version"
		exit 1
	fi

	if ! grep -q "lazy-loaded" dist/index.html; then
		echo "Dynamic imports were not bundled into the single file for Vite $version"
		exit 1
	fi

	if [[ "$version" == 8.* ]] && grep -q "inlineDynamicImports option is deprecated" <<<"$BUILD_OUTPUT"; then
		echo "Vite 8 deprecation warning is still present"
		exit 1
	fi

	popd >/dev/null
done

echo ""
echo "=========================================="
echo "All tests passed for all Vite versions!"
echo "=========================================="
