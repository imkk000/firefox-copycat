#!/usr/bin/env fish

set manifest_version (cat manifest.json | jq .version | rg -o -e '(\d+\.){2}\d+' | head -n 1)
set config_version (cat config.js | rg -e 'const currentVersion' | rg -o -e '(\d+\.){2}\d+' | head -n 1)

if test "$manifest_version" != "$config_version"
    echo "Manifest version ($manifest_version) does not match config version ($config_version)."
    exit 1
end

if test -f "dist.zip"
    rm dist.zip
end

zip -0 -r dist.zip manifest.json *.js icon.png popup
