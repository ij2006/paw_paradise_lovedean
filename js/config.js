// ─────────────────────────────────────────────
//  Paw Paradise Lovedean - Supabase Config
//
//  Setup steps:
//  1. Go to https://supabase.com and create a free account
//  2. Create a new project (choose a region close to UK)
//  3. Once created, go to Settings → API
//  4. Copy your Project URL and anon/public key below
//  5. Go to the SQL Editor in Supabase and run the
//     SQL from /database/schema.sql to create your tables
// ─────────────────────────────────────────────

const SUPABASE_URL      = 'https://jtzuklfpkkvmhnobypjb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0enVrbGZwa2t2bWhub2J5cGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjA3NjcsImV4cCI6MjA5Mjg5Njc2N30._X8k5eRr6L7MbX-5VoS6JQFof1T3CcNF6Del7ks-U8M';


// ─────────────────────────────────────────────
//  Acuity Scheduling
//  The site no longer embeds the Acuity calendar. The booking
//  page links straight to Acuity instead (pages/booking.html):
//    All sessions:  https://app.acuityscheduling.com/schedule.php?owner=40722415
//    1-4 dogs:      ...&appointmentType=99841024
//    5-8 dogs:      ...&appointmentType=99841025
// ─────────────────────────────────────────────
