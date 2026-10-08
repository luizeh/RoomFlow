#!/usr/bin/env pwsh

$ErrorActionPreference = 'Stop'

docker compose run --rm --no-deps backend composer @args
exit $LASTEXITCODE
