# Module Blog for React

## ✨ Features

- 📝 Complete administration interface with rich text editor
- 🖼️ Image management with Cloudinary
- 👥 User and role management system
- 🏷️ Categories and tags management
- 🌍 Multilingual support (FR, EN, ES, DE, RU) for panel admin
- 🎨 Customizable theme

# Installation Guide for `@plugin_blog`

---

## **1. Prerequisites**
- Node.js installed (version ≥ 14.x).  
- Existing React project with a backend server (Express, etc.).  
- Basic knowledge of `npm` commands.  

---

## **2. Configure the Backend**

### **2.1. Copy the Blog Folder**
- Copy the `blog` folder from `backend` into your backend project directory.

### **2.2. Setup Environment Variables**
- Rename `.env.example` to `.env` in the backend directory.  
- Update the `.env` file with your values.

### **2.3. Update `package.json`**
- Open the `package.json` of your backend project.  
- Add the required dependencies and scripts from `blog/backend/package.json` into your existing file.
- Ensure no duplicate dependencies are added.

### **2.4. Update Your Server Entry Point**
- Copy the content of `server.js` from `blog/backend` into your existing `server.js`.  
- Merge it with your current logic if needed.

### **2.5. Install Backend Dependencies**
**if you don't use docker**
- Navigate to your backend project directory and run:  
  ```bash
  npm install
  npm run start
  ```

**if you use docker / docker-compose**
- in your dockerfile, you have all ready a command to install the dependencies
- you can look a example structure for your dockerfile in the `backend/dockerfile.example`

- Setup your docker-compose.yml file and run the command:  
  ```bash
  docker compose build (if your docker-compose contains multiple services, specify the service name)
  docker compose up (if your docker-compose contains multiple services, specify the service name)
  ```

---

## **3. Integrate the Blog Frontend**

### **3.1. Copy the Blog Folder**
- Copy the `blog` folder from `frontend/src` into the `src` directory of your frontend project.

### **3.2. Setup Environment Variables**
- Rename `.env.example` to `.env` in the frontend directory.  
- Update the `.env` file with your configuration values.

### **3.3. Update `App.js`**
- Add the following imports to `App.js`:
   ```javascript
   import BlogList from './blog/components/BlogList';
   import AdminPanel from './blog/components/AdminPanel';
   import './blog/styles/variables.css';
   import { AuthProvider } from './blog/contexts/AuthContext';
   import { LanguageProvider } from './blog/translations/LanguageContext';
   ```
- Update your `App` component to include the blog routes:  
   ```javascript
   function AppContent() {
      return (
        <div className="App">
          <main className='main-content'>
            <Routes>
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog-admin-panel" element={<AdminPanel />} />
              {/* add your routes here */}
            </Routes>
          </main>
        </div>
      );
    }

    function App() {
      return (
        <AuthProvider>
          <LanguageBlogProvider>
              <Router>
                {/* you can add your navbar here */}
                <AppContent />
                {/* you can add your footer here */}
              </Router>
          </LanguageBlogProvider>
        </AuthProvider>
      );
    }
   ```

### **3.4. Setup Nginx (optional but my plugin its tested with nginx)**
- Copy the `nginx` folder from `frontend` into the `nginx` directory of your frontend project.
- Update the `nginx.conf` file with your configuration values.

### **3.5. Install Frontend Dependencies**
**if you don't use docker**
- Navigate to your backend project directory and run:  
  ```bash
  npm install
  npm run build
  ```

**if you use docker / docker-compose**
- in your dockerfile, you have all ready a command to install the dependencies
- you can look a example structure for your dockerfile in the `backend/dockerfile.example`

- Setup your docker-compose.yml file and run the command:  
  ```bash
  docker compose build (if your docker-compose contains multiple services, specify the service name)
  docker compose up (if your docker-compose contains multiple services, specify the service name)
  ```

---

## **5. First Connection**

### **5.1. Super Admin Setup**
- On your first login, create a super admin account.

### **5.2. Customize the Blog**
- Set the language preferences in the admin panel.  
- Configure the admin panel and blog theme colors.

### **5.3. Add Content**
- Create your first blog post.  
- Add users if needed.

---

Your blog plugin is now ready! 🎉

## 🤝 Support

For any questions or issues:
- Open an issue on GitHub
- Email: contact@logandelmairedev.com
- Website: [logandelmairedev.com](https://logandelmairedev.com)

## 📄 License

MIT © Logan DELMAIRE
