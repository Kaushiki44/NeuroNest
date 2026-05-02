# NeuroNest — Smart CMS

A full-stack MERN Content Management System for creators. Write, publish, and track your blog posts with a premium dark-themed interface.

## Features

- 🔐 **User Authentication** — Register, login with JWT-based auth
- ✍️ **Rich Text Editor** — Create posts with formatting, code blocks, lists
- 📊 **Engagement Tracking** — Views and likes per post
- 📋 **Dashboard** — Stats overview with post filtering (all/published/draft)
- 🏷️ **Tags & Excerpts** — Organize content with tags, auto-generated excerpts
- 🎨 **Premium Dark UI** — Glassmorphism, gradient accents, smooth animations

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React (Vite), React Router, Axios |
| Backend   | Node.js, Express                  |
| Database  | MongoDB, Mongoose                 |
| Auth      | JWT, bcrypt                       |
| Editor    | React Quill                       |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/neuronest.git
cd neuronest

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Running

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 3000)
cd client
npm run dev
```

Open http://localhost:3000 in your browser.

### Environment Variables

Create `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/neuronest
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=24h
```

## Project Structure

```
├── server/              # Express API
│   ├── config/          # DB connection
│   ├── middleware/       # JWT auth
│   ├── models/          # User & Post schemas
│   ├── routes/          # Auth & Post endpoints
│   └── server.js        # Entry point
│
├── client/              # React (Vite) frontend
│   └── src/
│       ├── api/         # Axios config
│       ├── components/  # Navbar, PostCard, PostForm
│       ├── context/     # AuthContext
│       └── pages/       # Landing, Login, Register, Dashboard, etc.
```

## API Endpoints

### Auth
| Method | Endpoint            | Auth | Description         |
|--------|---------------------|------|---------------------|
| POST   | `/api/auth/register`| ✗    | Create account      |
| POST   | `/api/auth/login`   | ✗    | Login, get JWT      |
| GET    | `/api/auth/me`      | ✓    | Current user        |

### Posts
| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| GET    | `/api/posts`          | ✗    | All published posts      |
| GET    | `/api/posts/my`       | ✓    | Current user's posts     |
| GET    | `/api/posts/:id`      | ✗    | Single post (+1 view)    |
| POST   | `/api/posts`          | ✓    | Create post              |
| PUT    | `/api/posts/:id`      | ✓    | Update post (owner)      |
| DELETE | `/api/posts/:id`      | ✓    | Delete post (owner)      |
| POST   | `/api/posts/:id/like` | ✓    | Toggle like              |

## License

MIT
