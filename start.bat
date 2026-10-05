@echo off
echo Starting AI Mood Journal...
cd /d "%~dp0"
call venv\Scripts\activate.bat
python app.py
pause

