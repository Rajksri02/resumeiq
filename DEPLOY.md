# ResumeIQ Deployment Guide

This guide walks through deploying the ResumeIQ platform into production:
- **Backend API**: [Render](https://render.com) (Node.js Express Web Service)
- **Frontend SPA**: [Vercel](https://vercel.com) (React + Vite SPA)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)
- **AI Engine**: Google Gemini API via [Google AI Studio](https://aistudio.google.com/)

---

## 🏷️ Role Legend
- 👤 **[User Action]**: Manual steps you perform (logging into accounts, entering secret keys in dashboards, clicking deploy buttons).
- 🤖 **[Agent Action]**: Automated tasks Antigravity can execute (configuration files, code checks, build tests, git commits/push, curl verification).

---

## ⚠️ Critical CORS Configuration Rule

> [!IMPORTANT]
> The backend's `CLIENT_URL` environment variable on Render **must match your Vercel frontend URL exactly**, with **NO trailing slash**!
>
> - ✅ **Correct**: `https://resumeiq.vercel.app`
> - ✅ **Correct (multi-origin)**: `https://resumeiq.vercel.app,http://localhost:5173`
> - ❌ **Incorrect**: `https://resumeiq.vercel.app/` *(trailing slash will cause CORS preflight failures)*

---

## 📋 Pre-Deployment Checklist

Ensure you have credentials ready for the following external services:
1. 👤 **[User Action]** **MongoDB Atlas**: A MongoDB connection string (`MONGO_URI`). Ensure Network Access includes `0.0.0.0/0` (allow access from anywhere) so Render instances can connect.
2. 👤 **[User Action]** **Google AI Studio**: An active Gemini API key (`GEMINI_API_KEY`).
3. 👤 **[User Action]** **JWT Secret**: A secure 32+ character random hex string (`JWT_SECRET`). *(Generate via `openssl rand -hex 32`)*.
4. 👤 **[User Action]** **SMTP Service**: Outgoing email credentials for password resets (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Supports SendGrid, Brevo, AWS SES, or Mailtrap.

---

## Step 1: Push Repository Configuration

1. 🤖 **[Agent Action]** Antigravity creates `render.yaml`, configures the silent server warm-up in the client, verifies `client/vercel.json`, and pushes the `chore/deploy-config` branch.
2. 👤 **[User Action]** Merge the branch or push to `main` on GitHub so Render and Vercel can pull the latest configuration.

---

## Step 2: Deploy Backend on Render

You can deploy using the included Render Blueprint (`render.yaml`) or manually create a Web Service.

### Option A: Using Render Blueprint (Recommended)
1. 👤 **[User Action]** Log in to the [Render Dashboard](https://dashboard.render.com/).
2. 👤 **[User Action]** Click **New +** → **Blueprint**.
3. 👤 **[User Action]** Connect your repository (`Rajksri02/resumeiq`) and select the branch (`chore/deploy-config` or `main`).
4. 👤 **[User Action]** Render reads `render.yaml` and displays the prompt for required variables marked `sync: false`.
5. 👤 **[User Action]** Enter your secret values in the fields provided:
   - `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/resumeiq?retryWrites=true&w=majority`
   - `JWT_SECRET`: `<your-random-jwt-secret>`
   - `GEMINI_API_KEY`: `<your-google-ai-studio-api-key>`
   - `CLIENT_URL`: `http://localhost:5173` *(temporary placeholder until Vercel URL is generated in Step 3)*
   - `SMTP_HOST`: `smtp.sendgrid.net` *(or your SMTP host / Mailtrap host)*
   - `SMTP_PORT`: `587` *(or 465 / 2525)*
   - `SMTP_USER`: `<smtp-user-or-api-key>`
   - `SMTP_PASS`: `<smtp-password>`
6. 👤 **[User Action]** Click **Apply**.
7. 👤 **[User Action]** Wait for the initial build and deploy to complete. Copy your Render Web Service URL:
   - Example: `https://resumeiq-api.onrender.com`

### Option B: Manual Web Service Setup
1. 👤 **[User Action]** Click **New +** → **Web Service** in Render.
2. 👤 **[User Action]** Configure:
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
   - **Health Check Path**: `/api/health`
3. 👤 **[User Action]** Add the following Environment Variables in the Render dashboard:
   - `NODE_ENV`: `production`
   - `GEMINI_MODEL`: `gemini-3.8-flash`
   - `GEMINI_TIMEOUT_MS`: `45000`
   - `GEMINI_TOTAL_TIMEOUT_MS`: `55000`
   - `MONGO_URI`: *(your MongoDB Atlas URI)*
   - `JWT_SECRET`: *(your JWT secret)*
   - `GEMINI_API_KEY`: *(your Gemini API key)*
   - `CLIENT_URL`: `http://localhost:5173` *(temporary until Step 3)*
   - `SMTP_HOST`: *(your SMTP host)*
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: *(your SMTP username)*
   - `SMTP_PASS`: *(your SMTP password)*
4. 👤 **[User Action]** Click **Create Web Service** and note your backend URL.

---

## Step 3: Deploy Frontend on Vercel

1. 👤 **[User Action]** Log in to the [Vercel Dashboard](https://vercel.com/dashboard).
2. 👤 **[User Action]** Click **Add New...** → **Project**.
3. 👤 **[User Action]** Import your GitHub repository (`Rajksri02/resumeiq`).
4. 👤 **[User Action]** In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: click **Edit** and choose `client`
   - **Build Command**: `npm run build` *(default)*
   - **Output Directory**: `dist` *(default)*
   - **Install Command**: `npm install` *(default)*
5. 👤 **[User Action]** Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-render-backend-name>.onrender.com/api` *(replace with your real Render backend URL, including `/api`)*
6. 👤 **[User Action]** Click **Deploy**.
7. 👤 **[User Action]** Once the build completes, copy your live Vercel domain:
   - Example: `https://resumeiq-app.vercel.app`

---

## Step 4: Align CORS Configuration on Render

Now that your frontend has a live production URL, update Render's allowed origin:

1. 👤 **[User Action]** Go back to your [Render Dashboard](https://dashboard.render.com/) → Select your `resumeiq-api` service.
2. 👤 **[User Action]** Navigate to the **Environment** tab.
3. 👤 **[User Action]** Locate `CLIENT_URL` and update its value to your Vercel URL without trailing slash:
   ```env
   CLIENT_URL=https://resumeiq-app.vercel.app
   ```
   *(Or allow both production and local development simultaneously:)*
   ```env
   CLIENT_URL=https://resumeiq-app.vercel.app,http://localhost:5173
   ```
4. 👤 **[User Action]** Click **Save Changes**. Render will automatically redeploy the backend with the new CORS origin.

---

## Step 5: Verification & Sanity Checks

Once both services are deployed and you have both URLs, provide them to Antigravity to run automated verification, or verify via the following commands:

### 1. Health Check
```bash
curl -i https://<your-render-backend-name>.onrender.com/api/health
```
**Expected Response:** HTTP 200 with body `{"status":"ok"}`.

### 2. CORS Allowed Origin Check
```bash
curl -i -H "Origin: https://<your-vercel-frontend-name>.vercel.app" \
  https://<your-render-backend-name>.onrender.com/api/health
```
**Expected Response:** Headers must include:
`Access-Control-Allow-Origin: https://<your-vercel-frontend-name>.vercel.app`
`Access-Control-Allow-Credentials: true`

### 3. CORS Blocked Origin Check
```bash
curl -i -H "Origin: https://evil.example.com" \
  https://<your-render-backend-name>.onrender.com/api/health
```
**Expected Response:** HTTP 403 Forbidden with CORS rejection error.

### 4. Browser UI & Warm-Up Check
- 👤 **[User Action]** Open `https://<your-vercel-frontend-name>.vercel.app` in your browser.
- 👤 **[User Action]** Navigate to `/upload`. If the backend was sleeping, verify the warm-up banner appears:
  `"Waking the server, the first request can take up to 30 seconds."`
- Verify that inputs and dropzones remain fully interactive while the server wakes up.
