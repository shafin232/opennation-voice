# OpenNation Voice

OpenNation Voice is a web application designed to enhance civic engagement and government transparency. It provides a suite of tools for citizens to report issues, track public project integrity, file Right to Information (RTI) requests, and help ensure accountability.

## ✨ Features

- **Citizen Reporting:** Submit reports on local issues, infrastructure problems, and community needs.
- **Project Integrity:** Monitor and rate the integrity of public projects to combat corruption.
- **RTI Filing:** A streamlined, user-friendly process for filing Right to Information requests.
- **Hospital Information:** Access details and rate local healthcare facilities.
- **Voting Anomaly Detection:** Tools for administrators to monitor and analyze potential voting irregularities.
- **Crisis Management:** A dedicated mode for administrators to manage and communicate during critical situations.
- **Reputation System:** Users build reputation based on the validity and community verification of their contributions.

## 🛠️ Tech Stack

This project is built with a modern and robust technology stack:

- **Frontend:**
  - [React](https://reactjs.org/): A JavaScript library for building user interfaces.
  - [Vite](https://vitejs.dev/): Next-generation frontend tooling for blazing-fast development.
  - [TypeScript](https://www.typescriptlang.org/): A typed superset of JavaScript that compiles to plain JavaScript.
  - [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapid UI development.
  - [shadcn/ui](https://ui.shadcn.com/): Re-usable components built using Radix UI and Tailwind CSS.
- **Backend & Database:**
  - [Supabase](https://supabase.io/): The open-source Firebase alternative for building a secure and scalable backend, including database, authentication, and serverless functions.
- **Testing:**
  - [Vitest](https://vitest.dev/): A blazing fast unit-test framework powered by Vite.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- You must have [Node.js](https://nodejs.org/) (v18 or newer) and [npm](https://www.npmjs.com/) installed on your machine.
- You need a Supabase account and a new project created.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shafin232/opennation-voice.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd opennation-voice
    ```

3.  **Install dependencies:**
    This project uses `npm` for package management.
    ```bash
    npm install
    ```

4.  **Set up Environment Variables:**
    Create a new file named `.env` in the root of the project. You will need to add your Supabase Project URL and Anon Key to this file. You can find these in your Supabase project's "API Settings".
    ```env
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

5.  **Set up the Supabase Backend:**
    This project uses Supabase for its backend. You need to apply the database migrations. The easiest way is to use the [Supabase CLI](https://supabase.com/docs/guides/cli). After installing the CLI and linking it to your project, run:
    ```bash
    supabase db push
    ```

6.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

## 📜 Available Scripts

In the project directory, you can run the following commands:

- `npm run dev`: Starts the development server with hot-reloading.
- `npm run build`: Compiles and bundles the app for production.
- `npm run lint`: Runs the ESLint checker to find and fix problems in the code.
- `npm run preview`: Serves the production build locally to preview before deployment.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m '''Add some AmazingFeature'''`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is distributed under the MIT License. (Note: A `LICENSE` file has not been added yet).