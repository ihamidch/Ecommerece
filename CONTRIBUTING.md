# Contributing

Thanks for your interest in improving this project.

## Workflow

1. Fork the repository and create a feature branch from `main`.
2. Make focused changes with clear commit messages (for example: `feat: ...`, `fix: ...`, `docs: ...`).
3. Run checks locally:
   - `cd frontend && npm run lint && npm run build`
   - `cd backend && node -e "require('./src/app')"`
4. Open a pull request describing **what** changed and **why**.

## Scope

Please avoid drive-by refactors unrelated to your change. Prefer small, reviewable PRs.

## Security

Never commit secrets. Use `.env` locally and follow `backend/.env.example` and `frontend/.env.example`.
