# MSP User Validation Tool

A secure, web-based utility for Level 1 MSP engineers to validate the identity of end-users using Microsoft Entra ID (formerly Azure AD) and Microsoft Authenticator.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎯 Problem Solved
Helpdesk engineers often need to verify who they are talking to before resetting passwords or making account changes. Traditional methods (calling a manager, checking personal details) are slow or insecure.
This tool allows an engineer to trigger a **Microsoft Authenticator** notification to the user's phone. If the user approves it, their identity is cryptographically verified.

## ✨ Features

### 1. Direct Validation (Passwordless Users)
For users with **Passwordless Phone Sign-in** enabled.
*   **Workflow**: The engineer enters the user's email.
*   **Experience**: A number appears on the engineer's screen. The engineer reads it to the user. The user enters it into their Authenticator app.
*   **Result**: Instant validation on the engineer's screen.

### 2. Remote Validation (Hybrid / Password + MFA Users)
For users who still use passwords or don't have passwordless enabled.
*   **Workflow**: The engineer generates a unique **Verification Link**.
*   **Experience**: The engineer sends the link to the user (chat/email). The user clicks it and signs in on *their own device*.
*   **Result**: The engineer's screen automatically updates to "Verified" once the user successfully logs in.

## 🚀 Getting Started

### Prerequisites
*   A Microsoft Entra ID (Azure AD) Tenant.
*   Node.js 18+ installed.

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/davidfleischmann/UserValidation.git
    cd UserValidation
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration (Azure App Registration)
1.  Register a new **Single Page Application (SPA)** in the [Microsoft Entra Admin Center](https://entra.microsoft.com/).
2.  Set the **Redirect URI** to `http://localhost:3000/` (or your production URL).
3.  Open `src/config/auth-config.ts` and update the `clientId` and `authority`:
    ```typescript
    export const msalConfig: Configuration = {
        auth: {
            clientId: "YOUR_CLIENT_ID",
            authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
            // ...
        }
    };
    ```

### Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## ☁️ Deployment (Azure)
We provide an automated script to deploy this app to **Azure App Service** in the **Australia East** region.

1.  **Prerequisites**: Install Azure CLI (`brew install azure-cli`) and login (`az login`).
2.  **Run Script**:
    ```bash
    chmod +x setup_azure.sh
    ./setup_azure.sh
    ```
    *This script will provision resources and **automatically enable Continuous Deployment** from your GitHub repository.*
3.  **Post-Deployment**: Update your App Registration Redirect URI with the URL provided by the script.

*See [deployment_guide.md](deployment_guide.md) for full details.*

## 🛠️ Tech Stack
*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Authentication**: MSAL React (`@azure/msal-react`)

## 🔒 Security Note
This application runs entirely client-side (SPA) for the Direct flow. The Remote flow uses a lightweight in-memory API to track session status. For production deployment, ensure the API state is backed by a database (Redis/Postgres) to handle server restarts and scaling.
