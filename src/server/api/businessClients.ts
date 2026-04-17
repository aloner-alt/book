import Elysia from "elysia";
import z from "zod/v4";
import { db } from "../db";
import { eq } from "drizzle-orm";
import {
  businessProfiles,
  employeeProfiles,
  appointments,
  clientProfiles,
} from "../db/schema";
import { userService } from "./user";

export const businessClientsRouter = new Elysia({ prefix: "/business-clients" })
  .use(userService)

  // ── List unique clients for the current business ──────────────────────────────
  .get(
    "/",
    async ({ session, set, query }) => {
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

      // Get all employee IDs for this business
      const employees = await db.query.employeeProfiles.findMany({
        where: eq(employeeProfiles.businessId, business.id),
        columns: { id: true },
      });

      const employeeIds = employees.map((e) => e.id);

      if (employeeIds.length === 0) {
        return [];
      }

      // Fetch all appointments for business employees
      const allAppointments = await db.query.appointments.findMany({
        columns: {
          clientId: true,
          employeeId: true,
          datetime: true,
        },
      });

      // Filter to this business's employees
      const businessAppointments = allAppointments.filter(
        (a) => a.employeeId && employeeIds.includes(a.employeeId),
      );

      // Group by clientId to count visits and find last visit
      const clientMap = new Map<
        string,
        { totalVisits: number; lastVisit: Date }
      >();

      for (const appt of businessAppointments) {
        const existing = clientMap.get(appt.clientId);
        if (!existing) {
          clientMap.set(appt.clientId, {
            totalVisits: 1,
            lastVisit: appt.datetime,
          });
        } else {
          existing.totalVisits += 1;
          if (appt.datetime > existing.lastVisit) {
            existing.lastVisit = appt.datetime;
          }
        }
      }

      if (clientMap.size === 0) {
        return [];
      }

      // Fetch client profiles for the unique clients
      const clientIds = Array.from(clientMap.keys());

      const clientProfilesList = await db.query.clientProfiles.findMany();

      // Filter to only clients in our set
      const relevantClients = clientProfilesList.filter((cp) =>
        clientIds.includes(cp.id),
      );

      const search = query.search ?? "";

      const result = relevantClients
        .map((cp) => {
          const stats = clientMap.get(cp.id)!;
          return {
            id: cp.id,
            firstName: cp.firstName,
            lastName: cp.lastName,
            phone: cp.phone,
            totalVisits: stats.totalVisits,
            lastVisit: stats.lastVisit,
          };
        })
        .filter((c) => {
          if (!search) return true;
          const lower = search.toLowerCase();
          return (
            c.firstName.toLowerCase().includes(lower) ||
            c.lastName.toLowerCase().includes(lower) ||
            c.phone.includes(search)
          );
        })
        // Sort by last visit descending
        .sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());

      return result;
    },
    {
      query: z.object({
        search: z.string().optional(),
      }),
    },
  );
