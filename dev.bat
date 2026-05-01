@echo off
REM All env vars are loaded from .env at the repo root by the API server.
REM Never commit .env. See .env.example for the required keys.

echo Starting API server on port 8080...
cd artifacts\api-server
start "API Server" cmd /k "node --enable-source-maps ./dist/index.mjs"
cd ..\..

echo Waiting for API server...
timeout /t 3 /nobreak >nul

echo Starting frontend on port 5000...
cd artifacts\boxing-club
start "Frontend" cmd /k "set API_PORT=8080 && set PORT=5000 && set BASE_PATH=/ && pnpm run dev"
cd ..\..

echo Both servers starting. Open http://localhost:5000
