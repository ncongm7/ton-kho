@echo off
echo ===========================================
echo PUSHING CODE TO GITHUB
echo ===========================================

set GIT_PATH="C:\Program Files\Git\cmd\git.exe"

if not exist %GIT_PATH% (
    echo [ERROR] Git not found at %GIT_PATH%
    echo Please check your installation.
    pause
    exit /b
)

echo Initializing Git repository...
%GIT_PATH% init

echo Configuring Git Identity...
%GIT_PATH% config user.email "assistant@warehouse.app"
%GIT_PATH% config user.name "Warehouse Assistant"

echo Configuring Remote URL...
%GIT_PATH% remote add origin https://github.com/ncongm7/ton-kho.git
%GIT_PATH% remote set-url origin https://github.com/ncongm7/ton-kho.git

echo Adding files...
%GIT_PATH% add .

echo Committing (Fixing Secret)...
%GIT_PATH% commit --amend --no-edit

echo Pushing to GitHub...
%GIT_PATH% branch -M main
%GIT_PATH% push -u origin main --force

echo ===========================================
echo DONE!
echo ===========================================
pause
