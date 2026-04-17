import Elysia from "elysia";
import z from "zod/v4";
import { db } from "../db";
import { and, eq, ilike, or } from "drizzle-orm";
import { users, employeeProfiles, businessProfiles } from "../db/schema";
import bcrypt from "bcryptjs";
import { userService } from "./user";

const BCRYPT_ROUNDS = 12;

export const employeesRouter = new Elysia({ prefix: "/employees" })
  .use(userService)

  // ── List employees of current business ──────────────────────────────────────
  .get(
    "/",
    async ({ session, set, query }) => {
      if (!session?.user) {
        set.status = 401;
        return { code: 401, message: "Не авторизован" };
      }

      const business = await db.query.businessProfiles.findFirst({
        where: eq(businessProfiles.userId, session.user.id),
      });

      if (!business) {
        set.status = 403;
        return { code: 403, message: "Профиль бизнеса не найден" };
      }

      const search = query.search ?? "";
      const position = query.position ?? "";

      const employees = await db.query.employeeProfiles.findMany({
        where: and(
          eq(employeeProfiles.businessId, business.id),
          search
            ? or(
                ilike(employeeProfiles.firstName, `%${search}%`),
                ilike(employeeProfiles.lastName, `%${search}%`),
                ilike(employeeProfiles.specialization, `%${search}%`),
              )
            : undefined,
          position && position !== "all"
            ? eq(employeeProfiles.position, position as "Мастер" | "Администратор" | "Менеджер")
            : undefined,
        ),
        with: {
          user: { columns: { id: true, login: true, isActive: true } },
        },
      });

      return employees;
    },
    {
      query: z.object({
        search: z.string().optional(),
        position: z.string().optional(),
      }),
    },
  )

  // ── Get single employee ─────────────────────────────────────────────────────
  .get("/:id", async ({ params, session, set }) => {
    if (!session?.user) {
      set.status = 401;
      return { code: 401, message: "Не авторизован" };
    }

    const employee = await db.query.employeeProfiles.findFirst({
      where: eq(employeeProfiles.id, params.id),
      with: {
        user: { columns: { id: true, login: true, isActive: true } },
        business: true,
      },
    });

    if (!employee) {
      set.status = 404;
      return { code: 404, message: "Сотрудник не найден" };
    }

    return employee;
  })

  // ── Create employee (business only) ─────────────────────────────────────────
  .post(
    "/",
    async ({ body, session, set }) => {
      if (!session?.user || session.user.role !== "BUSINESS") {
        set.status = 403;
        return { code: 403, message: "Только владелец бизнеса может создавать сотрудников" };
      }

      const business = await db.query.businessProfiles.findFirst({
        where: eq(businessProfiles.userId, session.user.id),
      });

      if (!business) {
        set.status = 404;
        return { code: 404, message: "Профиль бизнеса не найден" };
      }

      // Check login uniqueness
      const existingLogin = await db.query.users.findFirst({
        where: eq(users.login, body.login),
      });
      if (existingLogin) {
        set.status = 400;
        return { code: 400, message: "Данный логин уже используется" };
      }

      const hashedPassword = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

      const [user] = await db
        .insert(users)
        .values({
          login: body.login,
          email: body.email || null,
          hashedPassword,
          role: "EMPLOYEE",
        })
        .returning();

      const [employee] = await db
        .insert(employeeProfiles)
        .values({
          userId: user.id,
          businessId: business.id,
          firstName: body.firstName,
          lastName: body.lastName,
          middleName: body.middleName || null,
          phone: body.phone,
          email: body.email || null,
          position: body.position as "Мастер" | "Администратор" | "Менеджер",
          specialization: body.specialization,
          workSchedule: body.workSchedule as "Полный день" | "Гибкий" | "Сменный 2/2" | undefined,
          employmentType: body.employmentType as "Штатный" | "Совместитель" | "ГПХ" | undefined,
          services: body.services || null,
        })
        .returning();

      return {
        success: true,
        employeeId: employee.id,
        login: body.login,
        password: body.password,
      };
    },
    {
      body: z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        middleName: z.string().optional(),
        phone: z.string().min(10),
        email: z.string().optional(),
        position: z.string(),
        specialization: z.string(),
        workSchedule: z.string().optional(),
        employmentType: z.string().optional(),
        services: z.string().optional(),
        login: z.string().min(4),
        password: z.string().min(8),
      }),
    },
  )

  // ── Update employee ──────────────────────────────────────────────────────────
  .patch(
    "/:id",
    async ({ params, body, session, set }) => {
      if (!session?.user || session.user.role !== "BUSINESS") {
        set.status = 403;
        return { code: 403, message: "Нет доступа" };
      }

      await db
        .update(employeeProfiles)
        .set({
          firstName: body.firstName,
          lastName: body.lastName,
          middleName: body.middleName || null,
          phone: body.phone,
          email: body.email || null,
          position: body.position as "Мастер" | "Администратор" | "Менеджер",
          specialization: body.specialization,
          services: body.services || null,
          about: body.about || null,
          paymentType: body.paymentType || null,
          workSchedule: body.workSchedule as "Полный день" | "Гибкий" | "Сменный 2/2" | undefined,
          employmentType: body.employmentType as "Штатный" | "Совместитель" | "ГПХ" | undefined,
        })
        .where(eq(employeeProfiles.id, params.id));

      return { success: true };
    },
    {
      body: z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        middleName: z.string().optional(),
        phone: z.string().min(10),
        email: z.string().optional(),
        position: z.string(),
        specialization: z.string(),
        workSchedule: z.string().optional(),
        employmentType: z.string().optional(),
        services: z.string().optional(),
        about: z.string().optional(),
        paymentType: z.string().optional(),
      }),
    },
  )

  // ── Deactivate employee ──────────────────────────────────────────────────────
  .patch("/:id/deactivate", async ({ params, session, set }) => {
    if (!session?.user || session.user.role !== "BUSINESS") {
      set.status = 403;
      return { code: 403, message: "Нет доступа" };
    }

    const employee = await db.query.employeeProfiles.findFirst({
      where: eq(employeeProfiles.id, params.id),
    });

    if (!employee) {
      set.status = 404;
      return { code: 404, message: "Сотрудник не найден" };
    }

    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, employee.userId));

    await db
      .update(employeeProfiles)
      .set({ status: "dismissed" })
      .where(eq(employeeProfiles.id, params.id));

    return { success: true };
  })

  // ── Reactivate employee ──────────────────────────────────────────────────────
  .patch("/:id/reactivate", async ({ params, session, set }) => {
    if (!session?.user || session.user.role !== "BUSINESS") {
      set.status = 403;
      return { code: 403, message: "Нет доступа" };
    }

    const employee = await db.query.employeeProfiles.findFirst({
      where: eq(employeeProfiles.id, params.id),
    });

    if (!employee) {
      set.status = 404;
      return { code: 404, message: "Сотрудник не найден" };
    }

    await db
      .update(users)
      .set({ isActive: true })
      .where(eq(users.id, employee.userId));

    await db
      .update(employeeProfiles)
      .set({ status: "active" })
      .where(eq(employeeProfiles.id, params.id));

    return { success: true };
  })

  // ── Send employee on vacation ────────────────────────────────────────────────
  .patch("/:id/vacation", async ({ params, session, set }) => {
    if (!session?.user || session.user.role !== "BUSINESS") {
      set.status = 403;
      return { code: 403, message: "Нет доступа" };
    }

    await db
      .update(employeeProfiles)
      .set({ status: "vacation" })
      .where(eq(employeeProfiles.id, params.id));

    return { success: true };
  })

  // ── Return employee from vacation ────────────────────────────────────────────
  .patch("/:id/return-vacation", async ({ params, session, set }) => {
    if (!session?.user || session.user.role !== "BUSINESS") {
      set.status = 403;
      return { code: 403, message: "Нет доступа" };
    }

    await db
      .update(employeeProfiles)
      .set({ status: "active" })
      .where(eq(employeeProfiles.id, params.id));

    return { success: true };
  });
