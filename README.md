# academia-ai

Lightweight toolkit for academic content generation: video summarization, text-to-speech, quiz generation, and a React frontend for interaction.

## Contents
- `backend/` — Flask/FastAPI backend and ML model wrappers
- `frontend/` — React app (create-react-app)
- `uploads/` — user uploaded files (ignored)

## Prerequisites
- Python 3.8 or newer
- Node.js 16+ and npm/yarn
- Tesseract OCR installed (Windows path set in `backend/models/video_summarization.py`)
- Optional: Git LFS for large model files

## Backend setup
1. Create and activate a Python virtual environment:
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
2. Configure environment variables (create `.env` from an example) and set the Tesseract path if needed.
3. Run the backend:
```
python app.py
```

## Frontend setup
```
cd frontend
npm install
npm start
```
Build for production with `npm run build`.

## Working with large model files
If you store model binaries in the repo, use Git LFS:
```
git lfs install
git lfs track "*.pt" "*.pth" "*.ckpt" "*.h5"
git add .gitattributes
```

## Quick Git commands
```
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git branch -M main
git push -u origin main
```

## Notes
- Keep secrets out of source control (`.env` is ignored).
- Edit the Tesseract command in `backend/models/video_summarization.py` if installed in a non-standard location.

## Contributing
Feel free to open issues or PRs. Add a short description of the change and testing steps.

## License
Add a license file as appropriate (e.g., `MIT`).
