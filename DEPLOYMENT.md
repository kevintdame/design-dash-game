# Deployment & Installation Guide

This guide shows you how to host the **Design Dash Game** online for free, and how to install it directly on your iPhone or Android phone as an app.

---

## 📱 Step 1: Install the App on your Phone (PWA)

Once the game is hosted online, you and your users can install it instantly.

### On iPhone (Safari)
1. Open the website link (e.g., your hosted link) in **Safari**.
2. Tap the **Share** button (the square with an arrow pointing up at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right.
5. The game now appears on your home screen with its custom glowing logo! It runs full-screen like a native app.

### On Android (Chrome)
1. Open the website link in **Chrome**.
2. Tap the **"Add Design Dash to Home Screen"** banner at the bottom (or tap the 3 dots in the top right and select **"Add to Home Screen"**).
3. Follow the prompt to install.
4. The app icon is now in your app drawer and home screen.

---

## 🚀 Step 2: Host the Game Online (Render - Free)

We recommend using **Render** to host the entire game (both backend brain and website frontend) for free.

### Setup Instructions
1. Push this project folder to your personal **GitHub** repository.
2. Sign in to **[Render.com](https://render.com/)** (connect with GitHub).
3. Click **"New +"** and select **"Web Service"**.
4. Connect your game repository.
5. Configure the Web Service settings:
   * **Name**: `design-dash-game`
   * **Language**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`
   * **Instance Type**: `Free`
6. Click **"Advanced"** and add your environment variables:
   * `GEMINI_API_KEY`: `YOUR_API_KEY_HERE` (the key you copied in Step 1)
7. Click **"Deploy Web Service"**.

Render will build the website, configure the server, and provide you with a live URL (e.g., `https://design-dash-game.onrender.com`) that you can open on your phone!
