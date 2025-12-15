# Simple Drive

Simple Drive is a modern, full-stack file storage application built with Next.js 16, designed to provide a seamless and secure Google Drive-like experience. It leverages the power of serverless technologies and type-safe RPC for robust performance and scalability.

![Dashboard Screenshot](public/screenshot.png)

## 🚀 Features

- **Secure Authentication**: robust authentication system powered by `better-auth`.
- **File Management**: Upload, organize, rename, and delete files with ease. Support for various file types including images, videos, audio, and documents.
- **Folder Organization**: Create nestable folders to keep your files structured.
- **Storage Management**: Real-time storage usage tracking via AWS S3 integration.
- **Efficient Data Handling**: Type-safe RPC with `@orpc` for seamless client-server communication.
- **Modern UI/UX**: Built with `shadcn/ui` and `Tailwind CSS` for a beautiful, responsive, and accessible interface.
- **Dark Mode**: Fully supports light and dark themes.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon Database](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: [AWS S3](https://aws.amazon.com/s3/)
- **API layer**: [ORPC](https://orpc.unnoq.com/) (Open RPC)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- PostgreSQL database (Neon recommended)
- AWS S3 Bucket or compatible storage

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/simple-drive.git
    cd simple-drive
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Environment Setup**

    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Database
    DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

    # Authentication
    BETTER_AUTH_SECRET="your_auth_secret"
    BETTER_AUTH_URL="http://localhost:3000"

    # AWS S3
    AWS_ACCESS_KEY_ID="your_aws_key"
    AWS_SECRET_ACCESS_KEY="your_aws_secret"
    AWS_REGION="us-east-1"
    AWS_BUCKET_NAME="your_bucket_name"
    ```

4.  **Database Setup**

    Push the database schema to your PostgreSQL instance:

    ```bash
    pnpm db:push
    ```

5.  **Run the development server**

    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Scripts

- `pnpm dev`: Starts the development server with Turbopack.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Runs ESLint.
- `pnpm db:generate`: Generates SQL migrations based on your schema.
- `pnpm db:push`: Pushes schema changes directly to the database.
- `pnpm db:studio`: Opens Drizzle Studio to manage your database data.

## 📂 Project Structure

```
├── app/                # Next.js App Router pages and layouts
├── components/         # Reusable React components
│   ├── ui/             # Shadcn UI primitives
│   └── files/          # File-related components
├── db/                 # Database schema and configuration
├── lib/                # Utility functions
├── orpc/               # RPC router and client definition
├── public/             # Static assets like images and icons
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
