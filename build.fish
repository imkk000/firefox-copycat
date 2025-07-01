#!/usr/bin/env fish

if test -f "dist.zip"
    rm dist.zip
end

zip -0 -r dist.zip manifest.json *.js icon.png popup
