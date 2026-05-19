# FinTrack - Smart Personal Finance & Budget Planning

FinTrack is a premium, modern full-stack web application designed for students and young professionals to track their income, expenses, set monthly budgets, manage savings goals, and gain AI-powered financial insights.

## Features
- **Authentication System:** Secure JWT-based login/signup with bcrypt hashing.
- **FinTech Dashboard:** Premium UI with Recharts visualizations, summary cards, and recent transactions.
- **Expense & Income Management:** Easily categorize, add, edit, or delete transactions.
- **Budget Planner:** Set monthly budgets and track spending limits.
- **Savings Goals:** Create specific savings funds (e.g., Vacation, Laptop) and monitor your progress.
- **Transaction History:** Searchable and filterable transaction table with CSV export.
- **Responsive UI:** Dark-mode tailored, glassmorphism design, mobile responsive, and fully animated via Framer Motion.

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS (v4), Framer Motion, React Router, Recharts, Lucide React.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB with Mongoose.
- **Authentication:** JSON Web Tokens (JWT), bcryptjs.

## Installation Steps

### 1. Clone the Repository
```bash
git clone YOUR_GITHUB_REPO_LINK
cd fintrack
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory based on `.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

## Deployment Guide

### MongoDB Atlas Setup
1. Create a cluster on MongoDB Atlas.
2. Under "Database Access", create a new database user.
3. Under "Network Access", allow access from anywhere (`0.0.0.0/0`).
4. Click "Connect" on your cluster, choose "Connect your application", and copy the connection string. Replace `<password>` with the password of the database user.

### Backend Deployment (Render)
1. Push your code to GitHub.
2. Sign up on [Render.com](https://render.com/).
3. Click "New" > "Web Service".
4. Connect your GitHub repository.
5. Set the Root Directory to `backend`.
6. Build Command: `npm install`
7. Start Command: `node server.js`
8. Add Environment Variables: `MONGO_URI`, `JWT_SECRET`, `PORT`.
9. Deploy.

### Frontend Deployment (Vercel)
1. Sign up on [Vercel.com](https://vercel.com/).
2. Click "Add New..." > "Project".
3. Import your GitHub repository.
4. Set the Framework Preset to "Vite".
5. Set Root Directory to `frontend`.
6. Add Environment Variable: `VITE_API_URL` (set it to your deployed backend URL, e.g., `https://fintrack-api.onrender.com/api`).
7. Deploy.

## API Setup
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- **Expenses:** `GET /api/expenses`, `POST /api/expenses`, `DELETE /api/expenses/:id`
- **Income:** `GET /api/income`, `POST /api/income`, `DELETE /api/income/:id`
- **Budgets:** `GET /api/budget`, `POST /api/budget`
- **Goals:** `GET /api/goals`, `POST /api/goals`, `DELETE /api/goals/:id`

## Future Improvements
- Implement real AI processing via OpenAI API for the insights section.
- Multi-currency support.
- User-uploaded avatars using AWS S3.
- Advanced PDF report generation.
