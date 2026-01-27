# 🏠 Hostel Issue Tracking System

A full-stack web application for managing hostel issues, announcements, and lost & found items.

## 🚀 Features

### For Students
- 📝 Report issues with photo/video uploads
- 📊 Track issue status in real-time
- 💬 Comment on public issues
- 👍 Upvote issues to show support
- 📢 View hostel announcements
- 🔍 Report and claim lost items

### For Staff
- ✅ View assigned issues
- 🔄 Update issue status
- 📝 Add remarks and updates

### For Management
- 👀 View all issues across hostels
- 👤 Assign issues to staff
- 📢 Create announcements
- 📊 Analytics dashboard with charts
- ✅ Approve/reject lost item claims

## 🛠️ Tech Stack

**Frontend:**
- React.js with Vite
- React Router DOM
- Tailwind CSS
- Recharts
- Axios

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary (file storage)
- bcryptjs (password hashing)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/HostelCare.git
cd HostelCare
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your credentials:
# - MongoDB URI from MongoDB Atlas
# - JWT Secret (any random string)
# - Cloudinary credentials from cloudinary.com
```

**Start backend server:**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
```

**Start frontend:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🎯 Usage

1. **Register**: Create an account (Student/Staff/Management)
2. **Login**: Use your credentials
3. **Explore**: Start using the features based on your role



## 🏗️ Project Structure
```
hostel-tracker/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🌐 Deployment

### Backend (Render.com)
1. Create new Web Service
2. Connect GitHub repository
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`
5. Add environment variables

### Frontend (Vercel)
1. Import GitHub repository
2. Framework: Vite
3. Root directory: `frontend`
4. Deploy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for learning purposes.

---

⭐ Star this repo if you found it helpful!
