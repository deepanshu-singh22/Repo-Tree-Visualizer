🌳 Repo Tree Visualizer

Repo Tree Visualizer is a full-stack web application that allows users to visualize the directory structure (tree) of a GitHub repository in a clean and interactive way.

This project is built using React (frontend) and Node.js + Express (backend).

🚀 Features

Visualize repository folder structure

Clean separation of frontend and backend

REST API based backend

Scalable project structure

🛠️ Tech Stack
Frontend

React.js

HTML, CSS, JavaScript

Backend

Node.js

Express.js

📂 Project Structure
Repo-Tree-Visualizer/
│
├── client/                # Frontend (React)
│   ├── public/
│   ├── src/
│   ├── README.md
│   ├── package.json
│   └── .gitignore
│
├── server/                # Backend (Node + Express)
│   ├── index.js
│   ├── README.md
│   ├── package.json
│   └── .gitignore
│
├── .gitignore
└── README.md              # Root documentation

⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/deepanshu-singh22/Repo-Tree-Visualizer.git
cd Repo-Tree-Visualizer

2️⃣ Backend Setup
cd server
npm install
node index.js


Backend will start on:

http://localhost:5000


(or the port defined in your code)

3️⃣ Frontend Setup

Open a new terminal:

cd client
npm install
npm start


Frontend will run on:

http://localhost:3000

🔗 Client–Server Flow

Frontend sends requests to backend APIs

Backend processes repository data

Response is visualized as a tree on the frontend

📌 Future Improvements

GitHub authentication

Interactive tree (expand/collapse)

Repository search by username & repo name

Better UI/UX animations

👨‍💻 Author

Deepanshu Singh
B.Tech CSE (Dual Degree)
GitHub: deepanshu-singh22