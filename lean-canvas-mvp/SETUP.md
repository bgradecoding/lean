# Setup Guide

This guide will help you set up the Lean Canvas MVP application from scratch.

## Step 1: Install Dependencies

```bash
cd lean-canvas-mvp
npm install
```

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
createdb lean_canvas
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql
sudo service postgresql start
sudo -u postgres createdb lean_canvas
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Option B: Docker

```bash
docker run --name lean-canvas-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=lean_canvas \
  -p 5432:5432 \
  -d postgres:14
```

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Generate a secret for NextAuth:
```bash
openssl rand -base64 32
```

3. Update `.env.local` with your values:
```bash
# Database - Update with your actual credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432/lean_canvas"

# NextAuth - Paste the generated secret here
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 4: Initialize Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database tables (User, Canvas)
- Generate Prisma Client

## Step 5: (Optional) Seed the Database

To add sample data for testing:

```bash
npx prisma db seed
```

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Create Your First Account

1. Click "Register"
2. Enter your email and password
3. Create your first Lean Canvas!

## Common Issues

### Database Connection Error

**Error:** `Can't reach database server at localhost:5432`

**Solution:**
- Make sure PostgreSQL is running
- Check your DATABASE_URL in `.env.local`
- Verify the port (default is 5432)

### Prisma Client Error

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npx prisma generate
```

### Build Errors

**Error:** TypeScript or ESLint errors

**Solution:**
```bash
npm run build
```
Check the output for specific errors and fix them.

## Useful Commands

```bash
# View your database in Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Check database status
npx prisma db pull

# Format Prisma schema
npx prisma format
```

## Next Steps

- Customize the canvas blocks in `types/index.ts`
- Add more features (see PRD.md)
- Deploy to Vercel (see README.md)

## Getting Help

- Check the [Next.js Documentation](https://nextjs.org/docs)
- Read the [Prisma Documentation](https://www.prisma.io/docs)
- Review the [NextAuth.js Documentation](https://next-auth.js.org/)
