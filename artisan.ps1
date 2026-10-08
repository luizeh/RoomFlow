#!/usr/bin/env pwsh

$ErrorActionPreference = 'Stop'

docker compose run --rm --no-deps backend php artisan @args
exit $LASTEXITCODE
