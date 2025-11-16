# Lean Canvas MVP

A minimal viable product for creating and managing Lean Canvas business models.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory with the following:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lean_canvas"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secret for NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

3. Set up the database:

```bash
# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

4. Generate Prisma Client:

```bash
npx prisma generate
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- User authentication (email/password)
- Create and manage multiple Lean Canvases
- Edit 9 canvas blocks with auto-save
- Share canvases via public URLs
- Search and filter canvases
- Responsive design

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Prisma** (ORM)
- **PostgreSQL**
- **NextAuth.js** (Authentication)

## Project Structure

```
lean-canvas-mvp/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth routes (login, register)
│   ├── api/               # API routes
│   ├── canvas/            # Canvas pages
│   └── page.tsx           # Home/dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── canvas/           # Canvas-specific components
│   └── dashboard/        # Dashboard components
├── lib/                   # Utility functions
├── prisma/               # Database schema
├── types/                # TypeScript types
└── hooks/                # Custom React hooks
```

## Database Setup

If you don't have PostgreSQL installed:

### macOS (using Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
createdb lean_canvas
```

### Using Docker:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
docker exec -it postgres createdb -U postgres lean_canvas
```

Then update your `.env.local` with the correct DATABASE_URL.

## Deployment

Deploy to Vercel:

1. Push your code to GitHub
2. Import project to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

Remember to set up a production PostgreSQL database (Vercel Postgres, Supabase, etc.)

## License

MIT
