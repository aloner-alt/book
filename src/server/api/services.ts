import Elysia from "elysia";
import z from "zod/v4";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { services, businessProfiles, freelancerProfiles } from "../db/schema";
import { userService } from "./user";

export const servicesRouter = new Elysia({ prefix: "/services" })
  .use(userService)

  // ── Get services for current user's business/freelancer ─────────────────────
  .get("/", async ({ session, set }) => {
    if (!session?.user) {
      set.status = 401;
      return { code: 401, message: "Не авторизован" };
    }

    if (session.user.role === "BUSINESS") {
      const business = await db.query.businessProfiles.findFirst({
        where: eq(businessProfiles.userId, session.user.id),
      });
      if (!business) return [];
      return db.query.services.findMany({
        where: and(eq(services.businessId, business.id), eq(services.isActive, true)),
      });
    }

    if (session.user.role === "FREELANCER") {
      const freelancer = await db.query.freelancerProfiles.findFirst({
        where: eq(freelancerProfiles.userId, session.user.id),
      });
      if (!freelancer) return [];
      return db.query.services.findMany({
        where: and(eq(services.freelancerId, freelancer.id), eq(services.isActive, true)),
      });
    }

    return [];
  })

  // ── Create service ───────────────────────────────────────────────────────────
  .post(
    "/",
    async ({ body, session, set }) => {
      if (!session?.user) {
        set.status = 401;
        return { code: 401, message: "Не авторизован" };
      }

      let businessId: string | null = null;
      let freelancerId: string | null = null;

      if (session.user.role === "BUSINESS") {
        const business = await db.query.businessProfiles.findFirst({
          where: eq(businessProfiles.userId, session.user.id),
        });
        if (!business) {
          set.status = 404;
          return { code: 404, message: "Бизнес не найден" };
        }
        businessId = business.id;
      } else if (session.user.role === "FREELANCER") {
        const freelancer = await db.query.freelancerProfiles.findFirst({
          where: eq(freelancerProfiles.userId, session.user.id),
        });
        if (!freelancer) {
          set.status = 404;
          return { code: 404, message: "Профиль самозанятого не найден" };
        }
        freelancerId = freelancer.id;
      } else {
        set.status = 403;
        return { code: 403, message: "Нет доступа" };
      }

      const [service] = await db
        .insert(services)
        .values({
          businessId,
          freelancerId,
          name: body.name,
          price: body.price.toString(),
          durationMinutes: body.durationMinutes,
          description: body.description || null,
        })
        .returning();

      return { success: true, serviceId: service.id };
    },
    {
      body: z.object({
        name: z.string().min(2),
        price: z.number().min(0),
        durationMinutes: z.number().min(15),
        description: z.string().optional(),
      }),
    },
  )

  // ── Update service ───────────────────────────────────────────────────────────
  .patch(
    "/:id",
    async ({ params, body, session, set }) => {
      if (!session?.user) {
        set.status = 401;
        return { code: 401, message: "Не авторизован" };
      }

      await db
        .update(services)
        .set({
          name: body.name,
          price: body.price.toString(),
          durationMinutes: body.durationMinutes,
          description: body.description || null,
        })
        .where(eq(services.id, params.id));

      return { success: true };
    },
    {
      body: z.object({
        name: z.string().min(2),
        price: z.number().min(0),
        durationMinutes: z.number().min(15),
        description: z.string().optional(),
      }),
    },
  )

  // ── Delete service ───────────────────────────────────────────────────────────
  .delete("/:id", async ({ params, session, set }) => {
    if (!session?.user) {
      set.status = 401;
      return { code: 401, message: "Не авторизован" };
    }

    await db
      .update(services)
      .set({ isActive: false })
      .where(eq(services.id, params.id));

    return { success: true };
  });
