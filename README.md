# Bolinjcha Vighnaharta Sarvajanik Utsav Mandal

A full responsive web application for managing Ganpati Mandal operations — members, collections, expenses, donators, and more.

## Features

- **Dual Login**: Admin and User roles with different access levels
- **Members CRUD**: Name, designation, DOB, mobile, address, profile pic, documents
- **Mandal Documents**: Upload and view important documents
- **Sponsors CRUD**: Sponsor name, address, mobile
- **Societies CRUD**: Building names, address, secretary, chairman, total flats
- **Donators CRUD**: Name, mobile, society (searchable dropdown), referred by
- **Collection Entries**: Donator search, amount, date, full/pending payment with balance tracking
- **Balance Visibility**: View all pending balances at a glance
- **Donator Exceptions**: Record exceptions from donators
- **Expense Module**: Track expenses with total expense and available fund summary
- **Year-by-Year Management**: Fresh entries each year, previous year data preserved

## Getting Started

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Seed default users
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@mandal.com   | admin123  |
| User  | user@mandal.com    | user123   |

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + SQLite
- **JWT Authentication**

## Suggested Future Additions

- Event calendar (Aarti, Visarjan, cultural programs)
- Volunteer duty roster and shift management
- SMS/WhatsApp notifications for pending balances
- Receipt/invoice PDF generation for collections
- Photo gallery for Utsav events
- Budget planning and approval workflow
- Audit log for all admin actions
- Multi-language support (Marathi/Hindi/English)
- Export reports to Excel/PDF
- QR code based donation collection
