# Deployment

The Express server serves both the API and the React single-page app. Deploy the
repository root as the service root so the frontend build is available beside
the backend.

Configure the hosting service with:

- **Build command:** `npm run build`
- **Start command:** `npm start`

The build command installs the frontend and backend dependencies, then builds
the Vite app into `Frontend/dist`. The backend uses that directory to serve
`index.html` for client-side routes such as `/admin`; this is required for page
refreshes and direct links to work.

If the frontend build is deployed outside the repository's normal `Frontend/dist`
location, set `FRONTEND_BUILD_PATH` on the backend service to its path, relative
to the `Backend` directory or as an absolute path.
