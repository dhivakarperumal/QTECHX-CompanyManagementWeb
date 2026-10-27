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

## Browser push notifications

Browser notifications continue to use the in-app inbox and real-time updates.
To also deliver notifications while the site is in the background or closed,
configure Web Push on the backend:

1. Generate a VAPID key pair once with `npx web-push generate-vapid-keys`.
2. Set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` in the
   backend environment. Use the generated public and private keys and a contact
   URI such as `mailto:admin@qtechx.com` for the subject. Keep the private key
   secret and use the same key pair across deployments.
3. Serve the site over HTTPS (localhost is supported for development), sign in,
   and select **Allow notifications** in the site prompt. The browser will keep
   that device subscribed until its permission or subscription is removed.

The backend creates the subscription table automatically during database
initialization. Web Push is disabled until all three VAPID variables are set.
