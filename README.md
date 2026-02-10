# Manal LMS - Student Frontend

A production-ready Student Frontend for the Manal LMS marketplace.

## Features
- **Public Catalog**: Browse universities, majors, subjects, and courses with cascading filters.
- **Authentication**: Secure login/register flow with JWT refresh token handling.
- **Student Dashboard**: Track course progress, resume learning, and view certificates.
- **Learning Player**: 
    - **Video**: Signed Bunny Stream iframe with dynamic watermark overlay.
    - **PDF**: Secure PDF viewer for lesson attachments.
    - **Quiz**: Interactive quiz engine with immediate feedback.
- **Payments**: Stripe Elements integration for paid course enrollments.
- **i18n**: Full RTL support for Arabic (default) and English.
- **Rich UI**: High-end glassmorphism design, rounded-3xl aesthetics, and smooth animations.

## Tech Stack
- Next.js 14/15 (App Router)
- TypeScript (Strict)
- Tailwind CSS 4
- next-intl
- TanStack Query
- Axios
- Stripe Elements

## Environment Variables
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_NAME="Manal LMS"
NEXT_PUBLIC_DEFAULT_LOCALE=ar
```

## Getting Started
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

## Routes Map
- `/`: Home Page
- `/courses`: Course Catalog
- `/courses/[id]`: Course Details
- `/login` / `/register`: Auth Pages
- `/dashboard`: Student Dashboard
- `/learn/[id]`: Course Player
- `/profile`: User Profile
- `/settings`: Account Settings

## API Endpoints Used
### Catalog
- `GET /catalog/universities`
- `GET /catalog/courses`
- `GET /catalog/courses/:id`
- `GET /courses/:id/content`
### Auth
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
### Learning & Progress
- `GET /students/me/courses`
- `GET /progress/course/:id`
- `GET /courses/assets/:id/play`
- `GET /courses/assets/:id/quiz`
- `POST /courses/assets/:id/quiz/submit`
- `GET /lessons/:id/pdf`
- `GET /students/me/certificates`
### Enrollment
- `POST /enrollments/:id`
