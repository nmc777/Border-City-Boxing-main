// Seed static weekly schedule. Idempotent: clears classes (and dependent bookings) first.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Pool } = require("C:/Users/n_mc/Documents/Boxing Club/node_modules/.pnpm/pg@8.20.0/node_modules/pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// dayOfWeek: 0=Sunday, 1=Monday, ... 6=Saturday
const schedule = [
  // MONDAY
  { day: 1, start: "12:00", end: "13:00", name: "Rec Boxing (All Levels)", category: "recreation", instructor: "Coach Mike", description: "Open boxing class for adults, all levels welcome.", capacity: 20 },
  { day: 1, start: "17:15", end: "18:00", name: "Youth Rec Cubs A+C (4-7yrs)", category: "kids", instructor: "Coach Sara", description: "Fun introductory class for our youngest athletes.", capacity: 15 },
  { day: 1, start: "18:00", end: "19:00", name: "Youth Rec Martial Arts (8-16yrs)", category: "kids", instructor: "Coach Sara", description: "Youth martial arts for ages 8-16.", capacity: 18 },
  { day: 1, start: "19:00", end: "20:00", name: "Rec Kickboxing (All Levels)", category: "recreation", instructor: "Coach Mike", description: "High energy kickboxing class.", capacity: 20 },
  { day: 1, start: "20:00", end: "21:00", name: "Rock Steady Boxing", category: "rock_steady", instructor: "Coach Dan", description: "Rock Steady program for Parkinson's fighters.", capacity: 16 },

  // TUESDAY
  { day: 2, start: "10:30", end: "12:00", name: "Rec BJJ No-Gi (All Levels)", category: "recreation", instructor: "Coach Lou", description: "No-Gi Brazilian Jiu Jitsu, all levels.", capacity: 20 },
  { day: 2, start: "16:00", end: "17:00", name: "Competitive Boxing (14yrs+)", category: "recreation", instructor: "Coach Mike", description: "For competitive boxers 14 and up.", capacity: 14 },
  { day: 2, start: "17:15", end: "18:00", name: "Youth Rec Cubs B+C (4-7yrs)", category: "kids", instructor: "Coach Sara", description: "Cubs program for ages 4-7.", capacity: 15 },
  { day: 2, start: "18:00", end: "19:00", name: "Youth Rec Jiu Jitsu (8-16yrs)", category: "kids", instructor: "Coach Lou", description: "BJJ for kids 8-16.", capacity: 18 },
  { day: 2, start: "19:00", end: "20:00", name: "Rec BJJ Gi (Fundamentals)", category: "recreation", instructor: "Coach Lou", description: "Gi BJJ fundamentals for all levels.", capacity: 20 },
  { day: 2, start: "20:00", end: "21:00", name: "Rec BJJ (Advanced Blue Belt+)", category: "recreation", instructor: "Coach Lou", description: "Advanced BJJ for blue belt and above.", capacity: 16 },

  // WEDNESDAY
  { day: 3, start: "12:00", end: "13:00", name: "Rec Boxing (All Levels)", category: "recreation", instructor: "Coach Mike", description: "Midweek open boxing class.", capacity: 20 },
  { day: 3, start: "17:15", end: "18:00", name: "Youth Rec Cubs A+C (4-7yrs)", category: "kids", instructor: "Coach Sara", description: "Cubs program A+C.", capacity: 15 },
  { day: 3, start: "18:00", end: "19:00", name: "Youth Rec Martial Arts (8-16yrs)", category: "kids", instructor: "Coach Sara", description: "Youth martial arts.", capacity: 18 },
  { day: 3, start: "19:00", end: "20:00", name: "Rec Kickboxing (All Levels)", category: "recreation", instructor: "Coach Mike", description: "Kickboxing class.", capacity: 20 },
  { day: 3, start: "20:00", end: "21:00", name: "Rock Steady Boxing", category: "rock_steady", instructor: "Coach Dan", description: "Rock Steady program.", capacity: 16 },

  // THURSDAY
  { day: 4, start: "10:30", end: "12:00", name: "Rec BJJ No-Gi (All Levels)", category: "recreation", instructor: "Coach Lou", description: "No-Gi BJJ.", capacity: 20 },
  { day: 4, start: "16:00", end: "17:00", name: "Competitive Boxing (14yrs+)", category: "recreation", instructor: "Coach Mike", description: "Competitive program.", capacity: 14 },
  { day: 4, start: "17:15", end: "18:00", name: "Youth Rec Cubs B+C (4-7yrs)", category: "kids", instructor: "Coach Sara", description: "Cubs B+C.", capacity: 15 },
  { day: 4, start: "18:00", end: "19:00", name: "Youth Rec Jiu Jitsu (8-16yrs)", category: "kids", instructor: "Coach Lou", description: "Youth BJJ.", capacity: 18 },
  { day: 4, start: "19:00", end: "20:00", name: "Rec BJJ Gi (Fundamentals)", category: "recreation", instructor: "Coach Lou", description: "Gi BJJ fundamentals.", capacity: 20 },

  // FRIDAY
  { day: 5, start: "12:00", end: "13:00", name: "Rec Boxing (All Levels)", category: "recreation", instructor: "Coach Mike", description: "Friday open boxing.", capacity: 20 },
  { day: 5, start: "17:15", end: "18:00", name: "Youth Rec Cubs A+C (4-7yrs)", category: "kids", instructor: "Coach Sara", description: "Cubs A+C.", capacity: 15 },
  { day: 5, start: "18:00", end: "19:00", name: "Youth Rec Martial Arts (8-16yrs)", category: "kids", instructor: "Coach Sara", description: "Youth martial arts.", capacity: 18 },
  { day: 5, start: "19:00", end: "20:00", name: "Rec Open Mat", category: "recreation", instructor: "Various", description: "Open mat — sparring, drilling, rolling.", capacity: 24 },

  // SATURDAY
  { day: 6, start: "10:00", end: "11:30", name: "Rec BJJ No-Gi (All Levels)", category: "recreation", instructor: "Coach Lou", description: "Saturday No-Gi BJJ.", capacity: 22 },
  { day: 6, start: "11:30", end: "12:30", name: "Youth Rec Saturday Special", category: "kids", instructor: "Coach Sara", description: "Saturday morning kids class.", capacity: 18 },
  { day: 6, start: "13:00", end: "14:00", name: "Rec Boxing Sparring", category: "recreation", instructor: "Coach Mike", description: "Controlled sparring session.", capacity: 14 },

  // SUNDAY
  { day: 0, start: "10:00", end: "11:00", name: "Rock Steady Boxing", category: "rock_steady", instructor: "Coach Dan", description: "Sunday Rock Steady.", capacity: 16 },
  { day: 0, start: "11:00", end: "12:30", name: "Rec Open Mat", category: "recreation", instructor: "Various", description: "Sunday open mat.", capacity: 24 },
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM bookings");
    await client.query("DELETE FROM attendance");
    await client.query("DELETE FROM coach_class_signins");
    await client.query("DELETE FROM classes");
    for (const c of schedule) {
      const duration = (() => {
        const [sh, sm] = c.start.split(":").map(Number);
        const [eh, em] = c.end.split(":").map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
      })();
      const scheduleText = `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][c.day]} ${c.start}-${c.end}`;
      await client.query(
        `INSERT INTO classes (name, category, instructor, description, schedule, duration, capacity, day_of_week, start_time, end_time)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [c.name, c.category, c.instructor, c.description, scheduleText, duration, c.capacity, c.day, c.start, c.end]
      );
    }
    await client.query("COMMIT");
    console.log(`Seeded ${schedule.length} classes.`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
