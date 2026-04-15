# User Frontend

Student-facing portal to login and download certificates mapped to the logged-in email.

## Setup

1. Install packages:
   npm install
2. Create environment file:
   copy .env.example .env
3. Open Firebase Console and enable these sign-in providers in Authentication > Sign-in method:
   - Email/Password
   - Google
4. Fill Firebase keys in `.env`.
5. Run app:
   npm run dev

For analytics, also enable Google Analytics in your Firebase project and add measurement ID.

The app expects user backend at `http://localhost:6001`.

## Firebase Env Keys

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```
