📁 server/README.md (Backend)
# RepoVisualizer – Backend

This is the backend service for **RepoVisualizer**, built using **Node.js** and **Express.js**.  
It provides APIs that support the frontend application.

---

## 🚀 Tech Stack

- Node.js
- Express.js
- JavaScript
- npm
- dotenv

---

## 📂 Folder Structure



server/
│
├── index.js # Entry point of the backend server
├── package.json # Backend dependencies and scripts
├── package-lock.json
├── .env # Environment variables (NOT pushed to GitHub)


---

## ⚙️ Prerequisites

Make sure you have the following installed:

- **Node.js** (v16 or above recommended)
- **npm**

Check versions:
```bash
node -v
npm -v

📦 Installation

Navigate to the backend folder:

cd server


Install dependencies:

npm install

🔐 Environment Variables

Create a .env file inside the server/ folder:

PORT=5000


⚠️ .env file is ignored by Git and should never be pushed to GitHub.

▶️ Running the Backend Server

Start the server using:

node index.js


or (if you use nodemon):

npx nodemon index.js


Server will start on:

http://localhost:5000

📡 API Testing

You can test APIs using:

Browser

Postman

Thunder Client (VS Code extension)

Example:

GET http://localhost:5000/

🛑 Common Issues
❌ Port already in use

Change the port number in .env file.

❌ node_modules missing

Run:

npm install

📌 Notes

node_modules is not pushed to GitHub

.env is ignored for security reasons

This backend is designed to work with the frontend located in the client/ folder

👨‍💻 Author

Deepanshu Singh
B.Tech CSE Student
GitHub: https://github.com/deepanshu-singh22