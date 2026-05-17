# Atomberg Performance Portal

An enterprise-grade performance management and evaluation portal built with React and TypeScript. This application streamlines the goal-setting, tracking, and review processes across different organizational roles.

##  Features

- **Role-Based Access Control (RBAC):** Dedicated user journeys and dashboards for Employees, Managers, and Admins.
- **Simulated Microsoft Entra ID (SSO):** Professional enterprise login flow simulated for demonstration purposes.
- **Demo Login:** One-click demo login system to easily switch between user roles without manual credential entry.
- **Goal Management & Weightage:** Robust validation logic for goal constraints and weightage balancing.
- **HR & Admin Tools:** Comprehensive CRUD user management and system-wide analytics.
- **Third-Party Integrations:** Support for PowerAutomate and EmailJS for automated workflow notifications.

##  Tech Stack

- **Frontend Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts & Visualizations:** Recharts

##  Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mukheshvadlamudi/Atomberg.git
   cd Atomberg
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory (you can use `.env.example` as a reference) and add your necessary integration keys.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

##  Security & Environment Variables

For production deployments, ensure sensitive integration keys (like EmailJS and PowerAutomate webhooks) are securely stored in your repository secrets or environment variables, avoiding hardcoded values in the frontend.

##  License

This project was developed as a demonstration/hackathon deliverable.
