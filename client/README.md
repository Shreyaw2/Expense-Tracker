
# Expense Tracker

A full-stack expense management application built using the MERN stack.

## Features

- User registration and login
- JWT authentication
- Add, edit and delete transactions
- Income and expense tracking
- Dashboard with financial summaries
- Monthly income vs expense charts
- Expense category breakdown
- Search and filter transactions
- MongoDB data persistence

## Tech Stack

**Frontend:** React, Vite, CSS, Axios, Recharts, Lucide React

**Backend:** Node.js, Express.js

**Database:** MongoDB Atlas, Mongoose

**Authentication:** JWT, bcryptjs

## Project Structure

Expense_Tracker/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── server/
    ├── config/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── .env
    └── server.js

## Installation

### 1. Clone repository

git clone https://github.com/Shreyaw2/Expense-Tracker.git

### 2. Backend setup

cd Expense-Tracker/server
npm install

Create a .env file with:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173

Start backend:

npm run dev

### 3. Frontend setup

Open another terminal:

cd Expense-Tracker/client
npm install

Create a .env file:

VITE_API_URL=http://localhost:5000/api

Start frontend:

npm run dev

## Author

Shreya Wankhede
