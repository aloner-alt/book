/**
 * Seed script — creates test accounts for all roles.
 * Run: bun run db:seed
 *
 * Accounts created:
 *   BUSINESS   login: boss        password: test1234
 *   EMPLOYEE   login: master1     password: test1234
 *   EMPLOYEE   login: master2     password: test1234
 *   CLIENT     login: client1     password: test1234
 *   FREELANCER login: freelancer1 password: test1234
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

const conn = postgres(process.env.DATABASE_URL!);
const db = drizzle(conn, { schema });

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱  Seeding database...\n");

  const password = "test1234";

  // ── Business owner ──────────────────────────────────────────────────────────
  const [businessUser] = await db
    .insert(schema.users)
    .values({
      login: "boss",
      hashedPassword: await hash(password),
      role: "BUSINESS",
    })
    .onConflictDoNothing()
    .returning();

  let businessId: string | undefined;

  if (businessUser) {
    const [business] = await db
      .insert(schema.businessProfiles)
      .values({
        userId: businessUser.id,
        fullName: "Иванов Иван Иванович",
        phone: "+7 (999) 100-00-01",
        companyName: "Красота & Стиль",
        ownershipType: "ИП",
        inn: "123456789012",
        category: "Барбершоп / Парикмахерская",
        city: "Москва",
        companyPhone: "+7 (495) 000-00-01",
      })
      .onConflictDoNothing()
      .returning();
    businessId = business?.id;
    console.log("✓  Business  →  login: boss         password: test1234");
  } else {
    // Already exists — fetch id
    const bossUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.login, "boss"),
    });
    if (bossUser) {
      const existing = await db.query.businessProfiles.findFirst({
        where: (t, { eq }) => eq(t.userId, bossUser.id),
      });
      businessId = existing?.id;
    }
    console.log("·  Business already exists, skipping");
  }

  // ── Services for the business ────────────────────────────────────────────────
  let serviceIds: string[] = [];
  if (businessId) {
    const svcs = await db
      .insert(schema.services)
      .values([
        {
          businessId,
          name: "Мужская стрижка",
          price: "1500",
          durationMinutes: 60,
          description: "Классическая мужская стрижка с укладкой",
        },
        {
          businessId,
          name: "Стрижка + борода",
          price: "2200",
          durationMinutes: 90,
          description: "Стрижка и оформление бороды",
        },
        {
          businessId,
          name: "Детская стрижка",
          price: "900",
          durationMinutes: 45,
        },
      ])
      .onConflictDoNothing()
      .returning();
    serviceIds = svcs.map((s) => s.id);
    if (svcs.length) console.log(`✓  Services created: ${svcs.length}`);
  }

  // ── Employee 1 ───────────────────────────────────────────────────────────────
  let emp1ProfileId: string | undefined;
  if (businessId) {
    const [emp1User] = await db
      .insert(schema.users)
      .values({
        login: "master1",
        hashedPassword: await hash(password),
        role: "EMPLOYEE",
      })
      .onConflictDoNothing()
      .returning();

    if (emp1User) {
      const [emp1] = await db
        .insert(schema.employeeProfiles)
        .values({
          userId: emp1User.id,
          businessId,
          firstName: "Алексей",
          lastName: "Петров",
          middleName: "Сергеевич",
          phone: "+7 (999) 200-00-01",
          position: "Мастер",
          specialization: "Барбер",
          workSchedule: "Полный день",
          employmentType: "Штатный",
          services: "Мужская стрижка, Стрижка + борода, Детская стрижка",
          about: "Барбер с 5-летним опытом. Специализируюсь на fade и классике.",
          paymentType: "Оклад + % от выручки",
          rating: "4.9",
          totalAppointments: 312,
          attendanceRate: 97,
        })
        .onConflictDoNothing()
        .returning();
      emp1ProfileId = emp1?.id;
      console.log("✓  Employee1  →  login: master1     password: test1234");
    } else {
      console.log("·  Employee1 already exists, skipping");
    }

    // ── Employee 2 ─────────────────────────────────────────────────────────────
    const [emp2User] = await db
      .insert(schema.users)
      .values({
        login: "master2",
        hashedPassword: await hash(password),
        role: "EMPLOYEE",
      })
      .onConflictDoNothing()
      .returning();

    if (emp2User) {
      await db
        .insert(schema.employeeProfiles)
        .values({
          userId: emp2User.id,
          businessId,
          firstName: "Дмитрий",
          lastName: "Козлов",
          phone: "+7 (999) 200-00-02",
          position: "Мастер",
          specialization: "Стилист",
          workSchedule: "Сменный 2/2",
          employmentType: "Штатный",
          services: "Мужская стрижка, Детская стрижка",
          about: "Стилист. Работаю с любым типом волос.",
          paymentType: "% от выручки",
          rating: "4.7",
          totalAppointments: 189,
          attendanceRate: 94,
        })
        .onConflictDoNothing();
      console.log("✓  Employee2  →  login: master2     password: test1234");
    } else {
      console.log("·  Employee2 already exists, skipping");
    }
  }

  // ── Client ───────────────────────────────────────────────────────────────────
  const [clientUser] = await db
    .insert(schema.users)
    .values({
      login: "client1",
      hashedPassword: await hash(password),
      role: "CLIENT",
    })
    .onConflictDoNothing()
    .returning();

  let clientProfileId: string | undefined;
  if (clientUser) {
    const [clientProfile] = await db
      .insert(schema.clientProfiles)
      .values({
        userId: clientUser.id,
        firstName: "Михаил",
        lastName: "Смирнов",
        phone: "+7 (999) 300-00-01",
        email: "client@example.com",
        city: "Москва",
        gender: "male",
      })
      .onConflictDoNothing()
      .returning();
    clientProfileId = clientProfile?.id;
    console.log("✓  Client     →  login: client1     password: test1234");
  } else {
    console.log("·  Client already exists, skipping");
  }

  // ── Freelancer ───────────────────────────────────────────────────────────────
  const [flUser] = await db
    .insert(schema.users)
    .values({
      login: "freelancer1",
      hashedPassword: await hash(password),
      role: "FREELANCER",
    })
    .onConflictDoNothing()
    .returning();

  let flProfileId: string | undefined;
  if (flUser) {
    const [flProfile] = await db
      .insert(schema.freelancerProfiles)
      .values({
        userId: flUser.id,
        fullName: "Анна Волкова",
        inn: "987654321098",
        phone: "+7 (999) 400-00-01",
        email: "anna@example.com",
        specialization: "Мастер ногтевого сервиса",
        city: "Москва",
        experience: 4,
        about: "Самозанятый мастер маникюра и педикюра. Выезд на дом.",
        rating: "5.0",
        totalClients: 87,
      })
      .onConflictDoNothing()
      .returning();
    flProfileId = flProfile?.id;

    // Services for freelancer
    if (flProfileId) {
      await db
        .insert(schema.services)
        .values([
          {
            freelancerId: flProfileId,
            name: "Маникюр классический",
            price: "1200",
            durationMinutes: 60,
          },
          {
            freelancerId: flProfileId,
            name: "Педикюр",
            price: "1800",
            durationMinutes: 90,
          },
          {
            freelancerId: flProfileId,
            name: "Маникюр + покрытие гель-лак",
            price: "2000",
            durationMinutes: 90,
          },
        ])
        .onConflictDoNothing();
    }

    console.log("✓  Freelancer →  login: freelancer1 password: test1234");
  } else {
    console.log("·  Freelancer already exists, skipping");
  }

  // ── Sample appointments (today) ──────────────────────────────────────────────
  if (clientProfileId && emp1ProfileId && serviceIds.length) {
    const today = new Date();

    await db
      .insert(schema.appointments)
      .values([
        {
          clientId: clientProfileId,
          employeeId: emp1ProfileId,
          serviceId: serviceIds[0],
          datetime: new Date(today.setHours(11, 0, 0, 0)),
          durationMinutes: 60,
          status: "confirmed",
          notes: "Просьба позвонить за 30 минут",
        },
        {
          clientId: clientProfileId,
          employeeId: emp1ProfileId,
          serviceId: serviceIds[1],
          datetime: new Date(today.setHours(14, 0, 0, 0)),
          durationMinutes: 90,
          status: "pending",
        },
      ])
      .onConflictDoNothing();

    console.log("✓  Sample appointments created for today");
  }

  console.log("\n✅  Done!\n");
  console.log("┌─────────────────────────────────────────────────┐");
  console.log("│  Role        Login         Password             │");
  console.log("├─────────────────────────────────────────────────┤");
  console.log("│  Бизнес      boss          test1234             │");
  console.log("│  Сотрудник   master1       test1234             │");
  console.log("│  Сотрудник   master2       test1234             │");
  console.log("│  Клиент      client1       test1234             │");
  console.log("│  Самозанятый freelancer1   test1234             │");
  console.log("└─────────────────────────────────────────────────┘\n");

  await conn.end();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
