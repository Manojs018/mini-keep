# 💡 Mini Keep

A sleek, lightweight, and professional note-taking application inspired by Google Keep. **Mini Keep** allows users to capture ideas, organize thoughts with labels, and manage their productivity with a beautiful, responsive interface.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://mini-keep.vercel.app)

---

## 🚀 Live Demo

Check out the application in action: [https://mini-keep.vercel.app](https://mini-keep.vercel.app)

---

## ✨ Features

- **🔐 User Authentication**: Secure Register and Login system using JWT (JSON Web Tokens).
- **📝 Note Management**: 
  - Create, view, edit, and delete notes.
  - **Pin** important notes to keep them at the top.
  - **Archive** notes to declutter your workspace.
  - **Trash** system to prevent accidental deletions.
- **🏷️ Labeling System**: Organize notes with custom tags/labels for quick filtering.
- **🎨 Color Customization**: Color-code your notes for better visual organization.
- **🔍 Real-time Search**: Find your notes instantly with a dynamic search bar.
- **📄 Markdown Support**: Write notes using Markdown syntax for rich text formatting.
- **📱 Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices.
- **🛡️ Secure Backend**: Password hashing with Bcrypt under the hood.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & CSS3**: Custom styles with a focus on modern UI/UX.
- **Vanilla JavaScript**: Dynamic interactions without the overhead of heavy frameworks.
- **FontAwesome**: For beautiful, scalable icons.
- **Marked.js**: For rendering Markdown content.
- **DOMPurify**: To ensure safe rendering of user-generated content.

### Backend
- **Node.js & Express**: Fast and minimalist backend framework.
- **MongoDB & Mongoose**: Flexible NoSQL database for structured data storage.
- **JWT (JSON Web Tokens)**: Secure stateless authentication.
- **BcryptJS**: Industry-standard password encryption.

### Deployment & Tools
- **Vercel**: High-performance hosting and serverless functions.
- **Nodemon**: Development utility for auto-restarting the server.

---

## 📂 Project Structure

```text
mini-keep/
├── api/                # Backend logic (Express)
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers (Auth, Notes)
│   ├── middleware/     # Auth protection, error handling
│   ├── models/         # Mongoose schemas (User, Note)
│   ├── routes/         # API endpoints
│   └── index.js        # Main entry point
├── public/             # Frontend assets (Static)
│   ├── css/            # Style sheets
│   ├── js/             # Client-side logic (Auth, App)
│   ├── pages/          # Dashboard, Register pages
│   └── index.html      # Landing/Login page
├── vercel.json         # Vercel deployment configuration
├── package.json        # Project dependencies & scripts
└── .env                # Environment variables (Local only)
```

---

## ⚙️ Installation and Setup

To run Mini Keep locally on your machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/mini-keep.git
cd mini-keep
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the `api/` directory (or use the existing one) and add the following:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Run the development server
```bash
npm run dev
```
The application will be available at `http://localhost:5000`.

---

## 📖 Usage

1. **Register/Login**: Create a new account or sign in with existing credentials.
2. **Dashboard**: Once logged in, you'll reach your main dashboard.
3. **Add a Note**: Click "Take a note...", enter a title/description, pick a color, add labels, and hit "Add".
4. **Organize**: Use the sidebar to switch between Notes, Archive, and Trash, or filter by your custom labels.
5. **Search**: Use the top bar to filter notes by title or content in real-time.

---

## 🖼️ Screenshots

| Login Page | Dashboard |
|---|---|
| ![Login Placeholder](https://via.placeholder.com/400x250?text=Login+UI) | ![Dashboard Placeholder](https://via.placeholder.com/400x250?text=Dashboard+UI) |

| Create Note | Notes Grid |
|---|---|
| ![Create Note Placeholder](https://via.placeholder.com/400x250?text=Create+Note) | ![Notes Grid Placeholder](https://via.placeholder.com/400x250?text=Notes+Grid) |

---

## 🔮 Future Improvements

- [ ] **Dark Mode**: Add a toggle for better night-time usage.
- [ ] **Image Attachments**: Allow users to upload or paste images into notes.
- [ ] **Reminders**: Set time-based or location-based alerts for notes.
- [ ] **Real-time Sync**: Use WebSockets for multi-device synchronization.

---

## 👨‍💻 Author

**Manoj S**
- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute this software.
