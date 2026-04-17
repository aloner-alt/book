import Elysia from "elysia";
import z from "zod/v4";
import { db } from "../db";
import { eq } from "drizzle-orm";
import {
  businessProfiles,
  employeeProfiles,
  freelancerProfiles,
  clientProfiles,
} from "../db/schema";
import { userService } from "./user";

export const profileRouter = new Elysia({ prefix: "/profile" })
  .use(userService)

  // ── Get profile for current user ─────────────────────────────────────────────
  .get("/", async ({ session, set }) => {
    if (!session?.user) {
      set.status = 401;
      return { code: 401, message: "Не авторизован" };
    }

    const { id: userId, role } = session.user;

    if (role === "BUSINESS") {
      const profile = await db.query.businessProfiles.findFirst({
        where: eq(businessProfiles.userId, userId),
      });
      if (!profile) {
        set.status = 404;
        return { code: 404, message: "Профиль бизнеса не найден" };
      }
      return profile;
    }

    if (role === "EMPLOYEE") {
      const profile = await db.query.employeeProfiles.findFirst({
        where: eq(employeeProfiles.userId, userId),
        with: { business: true },
      });
      if (!profile) {
        set.status = 404;
        return { code: 404, message: "Профиль сотрудника не найден" };
      }
      return profile;
    }

    if (role === "FREELANCER") {
      const profile = await db.query.freelancerProfiles.findFirst({
        where: eq(freelancerProfiles.userId, userId),
      });
      if (!profile) {
        set.status = 404;
        return { code: 404, message: "Профиль самозанятого не найден" };
      }
      return profile;
    }

    if (role === "CLIENT") {
      const profile = await db.query.clientProfiles.findFirst({
        where: eq(clientProfiles.userId, userId),
      });
      if (!profile) {
        set.status = 404;
        return { code: 404, message: "Профиль клиента не найден" };
      }
      return profile;
    }

    set.status = 400;
    return { code: 400, message: "Неизвестная роль пользователя" };
  })

  // ── Update profile for current user ──────────────────────────────────────────
  .patch(
    "/",
    async ({ body, session, set }) => {
      if (!session?.user) {
        set.status = 401;
        return { code: 401, message: "Не авторизован" };
      }

      const { id: userId, role } = session.user;

      if (role === "BUSINESS") {
        const profile = await db.query.businessProfiles.findFirst({
          where: eq(businessProfiles.userId, userId),
        });
        if (!profile) {
          set.status = 404;
          return { code: 404, message: "Профиль бизнеса не найден" };
        }

        await db
          .update(businessProfiles)
          .set({
            ...(body.fullName !== undefined && { fullName: body.fullName }),
            ...(body.phone !== undefined && { phone: body.phone }),
            ...(body.city !== undefined && { city: body.city }),
          })
          .where(eq(businessProfiles.userId, userId));

        return { success: true };
      }

      if (role === "EMPLOYEE") {
        const profile = await db.query.employeeProfiles.findFirst({
          where: eq(employeeProfiles.userId, userId),
        });
        if (!profile) {
          set.status = 404;
          return { code: 404, message: "Профиль сотрудника не найден" };
        }

        await db
          .update(employeeProfiles)
          .set({
            ...(body.firstName !== undefined && { firstName: body.firstName }),
            ...(body.lastName !== undefined && { lastName: body.lastName }),
            ...(body.phone !== undefined && { phone: body.phone }),
            ...(body.email !== undefined && { email: body.email }),
            ...(body.about !== undefined && { about: body.about }),
            ...(body.specialization !== undefined && { specialization: body.specialization }),
            ...(body.services !== undefined && { services: body.services }),
          })
          .where(eq(employeeProfiles.userId, userId));

        return { success: true };
      }

      if (role === "FREELANCER") {
        const profile = await db.query.freelancerProfiles.findFirst({
          where: eq(freelancerProfiles.userId, userId),
        });
        if (!profile) {
          set.status = 404;
          return { code: 404, message: "Профиль самозанятого не найден" };
        }

        await db
          .update(freelancerProfiles)
          .set({
            ...(body.fullName !== undefined && { fullName: body.fullName }),
            ...(body.phone !== undefined && { phone: body.phone }),
            ...(body.email !== undefined && { email: body.email }),
            ...(body.city !== undefined && { city: body.city }),
            ...(body.about !== undefined && { about: body.about }),
            ...(body.specialization !== undefined && { specialization: body.specialization }),
          })
          .where(eq(freelancerProfiles.userId, userId));

        return { success: true };
      }

      if (role === "CLIENT") {
        const profile = await db.query.clientProfiles.findFirst({
          where: eq(clientProfiles.userId, userId),
        });
        if (!profile) {
          set.status = 404;
          return { code: 404, message: "Профиль клиента не найден" };
        }

        await db
          .update(clientProfiles)
          .set({
            ...(body.firstName !== undefined && { firstName: body.firstName }),
            ...(body.lastName !== undefined && { lastName: body.lastName }),
            ...(body.phone !== undefined && { phone: body.phone }),
            ...(body.email !== undefined && { email: body.email }),
            ...(body.city !== undefined && { city: body.city }),
          })
          .where(eq(clientProfiles.userId, userId));

        return { success: true };
      }

      set.status = 400;
      return { code: 400, message: "Неизвестная роль пользователя" };
    },
    {
      body: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        city: z.string().optional(),
        about: z.string().optional(),
        specialization: z.string().optional(),
        services: z.string().optional(),
      }),
    },
  );
