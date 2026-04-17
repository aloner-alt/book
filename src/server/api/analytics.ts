import Elysia from "elysia";
import { db } from "../db";
import { eq } from "drizzle-orm";
import {
  businessProfiles,
  employeeProfiles,
  appointments,
} from "../db/schema";
import { userService } from "./user";

export const analyticsRouter = new Elysia({ prefix: "/analytics" })
  .use(userService)

  // ── Business analytics dashboard ─────────────────────────────────────────────
  .get("/", async ({ session, set }) => {
    if (!session?.user) {
      set.status = 401;
      return { code: 401, message: "Не авторизован" };
    }

    if (session.user.role !== "BUSINESS") {
      set.status = 403;
      return { code: 403, message: "Доступ только для владельцев бизнеса" };
    }

    const business = await db.query.businessProfiles.findFirst({
      where: eq(businessProfiles.userId, session.user.id),
    });

    if (!business) {
      set.status = 404;
      return { code: 404, message: "Профиль бизнеса не найден" };
    }

    // Get all employees of this business
    const employees = await db.query.employeeProfiles.findMany({
      where: eq(employeeProfiles.businessId, business.id),
      columns: { id: true, status: true },
    });

    const employeeIds = employees.map((e) => e.id);
    const totalEmployees = employees.filter((e) => e.status === "active").length;

    if (employeeIds.length === 0) {
      return {
        totalAppointments: 0,
        confirmedAppointments: 0,
        cancelledAppointments: 0,
        totalRevenue: 0,
        totalClients: 0,
        totalEmployees,
        recentAppointments: [],
      };
    }

    // Fetch all appointments for these employees with service pricing
    const allAppointments = await db.query.appointments.findMany({
      with: {
        service: { columns: { price: true } },
        client: { columns: { id: true } },
      },
    });

    // Filter to only this business's employees
    const businessAppointments = allAppointments.filter(
      (a) => a.employeeId && employeeIds.includes(a.employeeId),
    );

    const totalAppointments = businessAppointments.length;

    const confirmedAppointments = businessAppointments.filter(
      (a) => a.status === "confirmed" || a.status === "completed",
    ).length;

    const cancelledAppointments = businessAppointments.filter(
      (a) => a.status === "cancelled",
    ).length;

    // Revenue: sum prices for confirmed/completed appointments
    const totalRevenue = businessAppointments
      .filter((a) => a.status === "confirmed" || a.status === "completed")
      .reduce((sum, a) => {
        const price = a.service?.price ? parseFloat(a.service.price) : 0;
        return sum + price;
      }, 0);

    // Unique clients
    const uniqueClientIds = new Set(
      businessAppointments.map((a) => a.clientId),
    );
    const totalClients = uniqueClientIds.size;

    // Last 10 appointments (most recent first)
    const recentAppointments = await db.query.appointments.findMany({
      with: {
        client: true,
        employee: true,
        service: true,
      },
      orderBy: (a, { desc }) => [desc(a.datetime)],
    });

    const recentBusinessAppointments = recentAppointments
      .filter((a) => a.employeeId && employeeIds.includes(a.employeeId))
      .slice(0, 10);

    return {
      totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      totalRevenue,
      totalClients,
      totalEmployees,
      recentAppointments: recentBusinessAppointments,
    };
  });
