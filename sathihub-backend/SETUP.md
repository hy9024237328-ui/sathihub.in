# SathiHub Backend — Setup Guide

## Step 1: Create database tables
Already done if you ran `database_schema.sql` earlier.

## Step 2: Install & run
```bash
npm install
npm start
```

## Step 3: Create your Admin account

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO users (email, password_hash, role, is_active, is_email_verified)
VALUES (
  'admin@sathihub.in',
  '$2a$10$TGvhH3a0e7MF/qPq/UQRieFwnLD4mrV9.Z0OE35RzvveMk73RT4k.',
  'admin',
  true,
  true
);
```

Login credentials:
- **Email:** admin@sathihub.in
- **Password:** Admin@123

Go to `http://localhost:3000/admin-login` to access the Admin Panel.

## Admin Panel Features
- Dashboard stats (total users, sathis, clients, bookings)
- Add Sathi — full profile with photo, services, rate, bio in one form
- Manage Sathis — view all, delete any
- Each created Sathi gets login credentials you can share with them

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Create new account |
| POST | /api/v1/auth/login | Login |
| GET | /api/v1/user/me | Get current user |
| POST | /api/v1/bookings | Create booking |
| GET | /api/v1/bookings | List bookings |
| PATCH | /api/v1/bookings/:id/status | Confirm/reject booking |
| GET | /api/v1/search/sathis | Browse sathis |
| POST | /api/v1/upload/profile-photo | Upload profile photo |
| POST | /api/v1/admin/login | Admin login |
| POST | /api/v1/admin/create-sathi | Admin creates a sathi |
| GET | /api/v1/admin/sathis | List all sathis (admin) |
| GET | /api/v1/admin/stats | Dashboard stats |
