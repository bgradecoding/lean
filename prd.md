# PRD: Lean Canvas Layer MVP

## 1. Executive Summary

Build a minimal viable product (MVP) for a Lean Canvas-based project management layer. This is the foundation for an AI-powered product development collaboration tool that helps teams track hypotheses, validate assumptions, and learn fast.

**Goal:** Ship a working Lean Canvas interface in 2 weeks that teams can use to map business models and track validation status.

**Success Metrics:**

- User can create/edit a Lean Canvas in < 5 minutes
- All 9 canvas blocks are editable and persistent
- Canvas can be shared via URL
- System is deployable to production

---

## 2. Tech Stack (Intentionally Simple)

### Frontend

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (styling)
- **shadcn/ui** (pre-built components)
- **React Hook Form** (form management)
- **Zustand** (state management - lightweight)

### Backend

- **Next.js API Routes** (no separate backend server)
- **Prisma** (ORM)
- **PostgreSQL** (database via Vercel Postgres or local)

### Deployment

- **Vercel** (one-click deploy)
- **Vercel Postgres** (managed database)

### Why This Stack?

- ✅ Single codebase (no frontend/backend split)
- ✅ TypeScript end-to-end (type safety)
- ✅ Fast iteration (no Docker/complex setup)
- ✅ Free hosting (Vercel free tier)
- ✅ Easy to extend later

---

## 3. Core Features (MVP Only)

### 3.1 Lean Canvas Board

**9 Canvas Blocks:**

1. Problem (top 3 problems)
2. Solution (top 3 features)
3. Unique Value Proposition
4. Unfair Advantage
5. Customer Segments
6. Key Metrics
7. Channels
8. Cost Structure
9. Revenue Streams

**Requirements:**

- Each block is a text area (markdown support optional for MVP)
- Click to edit inline
- Auto-save on blur (debounced, 500ms)
- Visual grid layout (responsive)
- Color-coded blocks (based on Lean Canvas standard)

### 3.2 Canvas Management

**Create Canvas:**

- Simple form: Canvas Name + Description
- Auto-generates unique URL slug (e.g., `/canvas/startup-idea-xyz`)

**List Canvases:**

- Dashboard showing all canvases (card view)
- Sort by: Last Updated, Created Date
- Search by canvas name

**Share Canvas:**

- Every canvas has a shareable link
- No auth required for viewing (read-only)
- Auth required for editing (future: add collaborators)

### 3.3 Basic Authentication

**MVP Auth (Simplest):**

- Email + Password (via NextAuth.js)
- No social login for MVP
- No email verification for MVP
- Session-based auth

**User Model:**

- id, email, password (hashed), name, created_at

---

## 4. Data Model

```prisma
// schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String?
  canvases  Canvas[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Canvas {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String?

  // 9 Lean Canvas Blocks (JSON fields for MVP simplicity)
  problem             String? @db.Text
  solution            String? @db.Text
  uniqueValueProp     String? @db.Text
  unfairAdvantage     String? @db.Text
  customerSegments    String? @db.Text
  keyMetrics          String? @db.Text
  channels            String? @db.Text
  costStructure       String? @db.Text
  revenueStreams      String? @db.Text

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

---

## 5. API Endpoints

### Canvas CRUD

```
POST   /api/canvas          - Create new canvas
GET    /api/canvas          - List all user's canvases
GET    /api/canvas/[slug]   - Get canvas by slug
PATCH  /api/canvas/[slug]   - Update canvas block(s)
DELETE /api/canvas/[slug]   - Delete canvas
```

### Auth

```
POST   /api/auth/register   - Register new user
POST   /api/auth/login      - Login (NextAuth handles)
POST   /api/auth/logout     - Logout
GET    /api/auth/session    - Get current session
```

---

## 6. UI/UX Specifications

### Layout

```
┌─────────────────────────────────────────────┐
│  Header: Logo | Canvas Name | Save Status  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │  Problem     │  │  Solution    │       │
│  │              │  │              │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  ┌──────────────────────────────┐          │
│  │  Unique Value Proposition    │          │
│  └──────────────────────────────┘          │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │  Unfair      │  │  Customer    │       │
│  │  Advantage   │  │  Segments    │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  ┌──────────────────────────────┐          │
│  │  Key Metrics                 │          │
│  └──────────────────────────────┘          │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │  Channels    │  │  Cost        │       │
│  │              │  │  Structure   │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  ┌──────────────────────────────┐          │
│  │  Revenue Streams             │          │
│  └──────────────────────────────┘          │
└─────────────────────────────────────────────┘
```

### Colors (Lean Canvas Standard)

- Problem: `bg-red-50 border-red-200`
- Solution: `bg-blue-50 border-blue-200`
- Unique Value Prop: `bg-purple-50 border-purple-200`
- Unfair Advantage: `bg-orange-50 border-orange-200`
- Customer Segments: `bg-green-50 border-green-200`
- Key Metrics: `bg-yellow-50 border-yellow-200`
- Channels: `bg-teal-50 border-teal-200`
- Cost Structure: `bg-gray-50 border-gray-200`
- Revenue Streams: `bg-emerald-50 border-emerald-200`

### Interactions

- **Hover**: Border becomes darker
- **Click to edit**: Shows textarea with larger font
- **Auto-save**: "Saving..." indicator → "Saved ✓"
- **Empty state**: Placeholder text with hints

---

## 7. Development Phases

### Phase 1: Foundation (Days 1-3)

- [ ] Setup Next.js 14 + TypeScript + Tailwind
- [ ] Install shadcn/ui components
- [ ] Setup Prisma + PostgreSQL
- [ ] Create database schema
- [ ] Implement NextAuth.js basic email/password

### Phase 2: Core Canvas (Days 4-7)

- [ ] Build Canvas grid layout component
- [ ] Implement inline editing for each block
- [ ] Add auto-save with optimistic updates
- [ ] Create Canvas CRUD API routes
- [ ] Add loading/error states

### Phase 3: Dashboard & Navigation (Days 8-10)

- [ ] Build canvas list dashboard
- [ ] Add create new canvas flow
- [ ] Implement canvas search
- [ ] Add canvas delete with confirmation

### Phase 4: Sharing & Polish (Days 11-14)

- [ ] Public canvas view (read-only)
- [ ] Copy share link button
- [ ] Responsive mobile layout
- [ ] Add keyboard shortcuts (Cmd+S to save manually)
- [ ] Error handling & validation
- [ ] Deploy to Vercel

---

## 8. File Structure

```
lean-canvas-mvp/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── page.tsx              # Canvas list
│   ├── canvas/
│   │   └── [slug]/
│   │       ├── page.tsx          # Canvas editor
│   │       └── loading.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── canvas/
│   │       ├── route.ts          # List/Create
│   │       └── [slug]/
│   │           └── route.ts      # Get/Update/Delete
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # shadcn components
│   ├── canvas/
│   │   ├── canvas-grid.tsx       # Main grid layout
│   │   ├── canvas-block.tsx      # Editable block
│   │   └── canvas-header.tsx
│   ├── dashboard/
│   │   ├── canvas-card.tsx
│   │   └── canvas-list.tsx
│   └── layout/
│       ├── header.tsx
│       └── sidebar.tsx
├── lib/
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # NextAuth config
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── types/
│   └── index.ts                  # TypeScript types
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 9. Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lean_canvas"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional: For production
VERCEL_URL=""
```

---

## 10. Installation & Setup Commands

```bash
# Create Next.js app
npx create-next-app@latest lean-canvas-mvp --typescript --tailwind --app

cd lean-canvas-mvp

# Install dependencies
npm install prisma @prisma/client
npm install next-auth bcryptjs
npm install zustand react-hook-form
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react class-variance-authority clsx tailwind-merge

# Install dev dependencies
npm install -D @types/bcryptjs

# Initialize Prisma
npx prisma init

# Setup shadcn/ui
npx shadcn-ui@latest init

# Add shadcn components (install as needed)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu

# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Run dev server
npm run dev
```

---

## 11. Key Implementation Details

### Auto-Save Logic

```typescript
// Use debounced save
import { useDebounce } from "@/hooks/use-debounce";

const [content, setContent] = useState(block.content);
const debouncedContent = useDebounce(content, 500);

useEffect(() => {
  if (debouncedContent !== block.content) {
    saveBlock(block.id, debouncedContent);
  }
}, [debouncedContent]);
```

### Optimistic Updates

```typescript
// Update UI immediately, rollback on error
const updateBlock = async (blockId: string, content: string) => {
  const previousContent = blocks[blockId];

  // Optimistic update
  setBlocks((prev) => ({ ...prev, [blockId]: content }));

  try {
    await fetch(`/api/canvas/${slug}`, {
      method: "PATCH",
      body: JSON.stringify({ [blockId]: content }),
    });
  } catch (error) {
    // Rollback on error
    setBlocks((prev) => ({ ...prev, [blockId]: previousContent }));
    toast.error("Failed to save");
  }
};
```

### Canvas Slug Generation

```typescript
// lib/utils.ts
export function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Math.random().toString(36).substr(2, 6)
  );
}
```

---

## 12. Non-Goals (For MVP)

❌ User collaboration (multi-user editing)
❌ Version history / Time travel
❌ Comments or annotations
❌ AI features (save for Phase 2)
❌ Export to PDF/Image
❌ Templates library
❌ Mobile app
❌ Real-time sync (WebSockets)
❌ Advanced permissions (owner/editor/viewer roles)

---

## 13. Success Criteria

**MVP is complete when:**

1. ✅ User can register and login
2. ✅ User can create a new canvas
3. ✅ User can edit all 9 canvas blocks
4. ✅ Changes auto-save within 500ms
5. ✅ User can view all their canvases in dashboard
6. ✅ Canvas has shareable public URL
7. ✅ Responsive on desktop and tablet
8. ✅ Deployed to production (Vercel)
9. ✅ No major bugs in core flow

**Definition of "Working":**

- Zero-to-canvas in under 2 minutes
- No data loss
- Usable on Chrome/Firefox/Safari

---

## 14. Future Enhancements (Post-MVP)

After MVP ships, consider adding:

1. **AI Feedback Layer** (Priority 1)

   - AI analyzes each canvas block
   - Suggests improvements
   - Identifies gaps or contradictions

2. **Validation Tracking** (Priority 2)

   - Add validation status to each block (Not Started / In Progress / Validated / Invalidated)
   - Track experiments linked to hypotheses
   - Learning log timeline

3. **Collaboration** (Priority 3)

   - Invite team members
   - Real-time multi-cursor editing
   - Comments and discussions per block

4. **Templates** (Priority 4)
   - Pre-filled canvas examples (SaaS, Marketplace, etc.)
   - Import/Export functionality

---

## 15. Development Guidelines

### Code Style

- Use TypeScript strict mode
- Prefer functional components + hooks
- Use `async/await` over promises
- Keep components under 200 lines
- Extract reusable logic into custom hooks

### Error Handling

- Always wrap API calls in try/catch
- Show user-friendly error messages
- Log errors to console in development

### Performance

- Use React.memo for expensive components
- Implement virtual scrolling if canvas list > 100 items
- Lazy load canvas editor components

### Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation works (Tab, Enter, Esc)
- Color contrast meets WCAG AA standards

---

## 16. Testing Strategy (Minimal for MVP)

**Manual Testing Checklist:**

- [ ] Create canvas flow
- [ ] Edit each block and verify save
- [ ] Refresh page and verify data persists
- [ ] Delete canvas and verify it's gone
- [ ] Share link and verify read-only access works
- [ ] Login/logout flow
- [ ] Mobile responsive check

**No automated tests required for MVP** (add in Phase 2)

---

## 17. Deployment Checklist

Before deploying to Vercel:

- [ ] Set all environment variables in Vercel dashboard
- [ ] Run `npx prisma generate` in build command
- [ ] Run database migrations in production
- [ ] Test login flow in production
- [ ] Test canvas creation in production
- [ ] Verify public share links work
- [ ] Set up custom domain (optional)

---

## 18. Timeline & Milestones

**Week 1:**

- Day 1-2: Project setup, auth, database
- Day 3-4: Canvas grid layout + inline editing
- Day 5-6: Auto-save + API routes
- Day 7: Dashboard UI

**Week 2:**

- Day 8-9: Polish interactions, error handling
- Day 10-11: Responsive design, mobile layout
- Day 12-13: Share functionality, final testing
- Day 14: Deploy to production + documentation

**Target Ship Date:** 14 days from start

---

## 19. FAQ for Claude Code

**Q: Should I use Server Components or Client Components?**
A: Use Server Components for static content (layout, navigation) and Client Components for interactive parts (canvas blocks, forms). Canvas editor should be Client Component.

**Q: How do I handle authentication in Server Components?**
A: Use `getServerSession` from NextAuth in Server Components, `useSession` hook in Client Components.

**Q: What about form validation?**
A: Use React Hook Form with zod schema validation. Keep it simple for MVP.

**Q: Database migrations in production?**
A: Run `npx prisma migrate deploy` in Vercel build settings, or run manually after first deploy.

**Q: Should I use Server Actions?**
A: Optional. API routes are fine for MVP. Server Actions can be added later for better DX.

**Q: How to handle canvas slug conflicts?**
A: Add random suffix to slug (e.g., `-a3b5f2`). Check uniqueness before insert, retry if collision.

**Q: What about rate limiting?**
A: Not needed for MVP. Add in Phase 2 using middleware.

**Q: Should I add loading skeletons?**
A: Yes, use shadcn/ui Skeleton component for better UX during data fetching.

---

## 20. Resources

**Documentation:**

- Next.js 14 App Router: https://nextjs.org/docs/app
- Prisma: https://www.prisma.io/docs
- NextAuth.js: https://next-auth.js.org/
- shadcn/ui: https://ui.shadcn.com/
- Tailwind CSS: https://tailwindcss.com/docs

**Lean Canvas Reference:**

- Official Lean Canvas: https://leanstack.com/lean-canvas
- Blog post by Ash Maurya: https://blog.leanstack.com/

**Inspiration:**

- Miro Lean Canvas template
- Strategyzer Business Model Canvas

---

## 21. Acceptance Criteria

**User Story:**

> As a startup founder, I want to map out my business model using a Lean Canvas so that I can identify assumptions that need validation.

**Acceptance Tests:**

1. **Create Canvas**

   - User clicks "New Canvas"
   - Enters canvas name
   - Canvas is created with empty blocks
   - User is redirected to canvas editor

2. **Edit Canvas Block**

   - User clicks on "Problem" block
   - Types "Users struggle with X"
   - Clicks outside block
   - Text is saved automatically
   - "Saved ✓" indicator appears

3. **View Canvas List**

   - User navigates to dashboard
   - Sees all their canvases as cards
   - Can search by name
   - Can click to open canvas

4. **Share Canvas**
   - User clicks "Share" button
   - Gets public URL
   - Opens URL in incognito window
   - Sees read-only canvas
   - Cannot edit blocks

---

## 22. Done Definition

**This MVP is DONE when:**

A new user can:

1. Sign up with email/password
2. Create a Lean Canvas
3. Fill in all 9 blocks
4. See their changes save automatically
5. Share canvas URL with a colleague
6. Colleague can view (but not edit) the canvas

All in under 5 minutes, without bugs or confusion.

---

## APPENDIX A: Database Seed Data (Optional)

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("demo123", 10);

  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      password,
      name: "Demo User",
      canvases: {
        create: {
          name: "Example SaaS Startup",
          slug: "example-saas-startup-demo",
          description: "A sample Lean Canvas for a SaaS product",
          problem:
            "1. Manual data entry is time-consuming\n2. Errors in reports cost money\n3. No real-time collaboration",
          solution:
            "1. Automated data import\n2. AI-powered error detection\n3. Real-time multiplayer editing",
          uniqueValueProp:
            "The fastest way to turn messy data into beautiful reports",
          customerSegments:
            "1. Small business owners\n2. Operations managers\n3. Data analysts at SMBs",
          keyMetrics:
            "1. Weekly Active Users\n2. Reports generated per week\n3. Time saved per report\n4. Net Promoter Score",
        },
      },
    },
  });

  console.log("Seed user created:", user.email);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

---

## APPENDIX B: Example Component Structure

```typescript
// components/canvas/canvas-block.tsx
"use client";

interface CanvasBlockProps {
  id: string;
  title: string;
  content: string;
  placeholder: string;
  color: string; // e.g., 'red', 'blue'
  onSave: (content: string) => Promise<void>;
}

export function CanvasBlock({
  id,
  title,
  content,
  placeholder,
  color,
  onSave,
}: CanvasBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    if (debouncedValue !== content && isEditing) {
      handleSave(debouncedValue);
    }
  }, [debouncedValue]);

  const handleSave = async (newContent: string) => {
    setIsSaving(true);
    await onSave(newContent);
    setIsSaving(false);
  };

  return (
    <div
      className={`
        border-2 rounded-lg p-4 transition-all
        bg-${color}-50 border-${color}-200
        hover:border-${color}-300
        ${isEditing ? "ring-2 ring-${color}-400" : ""}
      `}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {isEditing ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setIsEditing(false)}
          placeholder={placeholder}
          className="w-full min-h-[100px] p-2 border-0 bg-transparent resize-none focus:outline-none"
          autoFocus
        />
      ) : (
        <p className="text-gray-600 whitespace-pre-wrap">
          {value || <span className="text-gray-400">{placeholder}</span>}
        </p>
      )}
    </div>
  );
}
```

---

**END OF PRD**

This PRD is ready for Claude Code to execute. Start with Phase 1 and ship incrementally.
