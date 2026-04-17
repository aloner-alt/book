import Elysia from "elysia";
import z from "zod/v4";
import { db } from "../db";
import { eq, or, ilike, and } from "drizzle-orm";
import {
  employeeProfiles,
  freelancerProfiles,
  businessProfiles,
  services,
} from "../db/schema";

export const mastersRouter = new Elysia({ prefix: "/masters" })

  // ── List all available masters (public) ─────────────────────────────────────
  .get(
    "/",
    async ({ query }) => {
      const search = query.search ?? "";
      const specializationFilter = query.specialization ?? "";
      const cityFilter = query.city ?? "";

      // Fetch active employees with their business (to get city)
      const employees = await db.query.employeeProfiles.findMany({
        where: eq(employeeProfiles.status, "active"),
        with: {
          business: true,
        },
      });

      // Fetch all freelancers
      const freelancers = await db.query.freelancerProfiles.findMany();

      type MasterEntry = {
        type: "EMPLOYEE" | "FREELANCER";
        id: string;
        name: string;
        specialization: string;
        city: string | null;
        rating: string | null;
        services: string | null;
        about: string | null;
      };

      const employeeMasters: MasterEntry[] = employees.map((emp) => ({
        type: "EMPLOYEE" as const,
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        specialization: emp.specialization,
        city: emp.business?.city ?? null,
        rating: emp.rating ?? null,
        services: emp.services ?? null,
        about: emp.about ?? null,
      }));

      const freelancerMasters: MasterEntry[] = freelancers.map((fl) => ({
        type: "FREELANCER" as const,
        id: fl.id,
        name: fl.fullName,
        specialization: fl.specialization,
        city: fl.city ?? null,
        rating: fl.rating ?? null,
        services: null,
        about: fl.about ?? null,
      }));

      let combined: MasterEntry[] = [...employeeMasters, ...freelancerMasters];

      // Apply search filter (name or specialization)
      if (search) {
        const lower = search.toLowerCase();
        combined = combined.filter(
          (m) =>
            m.name.toLowerCase().includes(lower) ||
            m.specialization.toLowerCase().includes(lower),
        );
      }

      // Apply specialization filter
      if (specializationFilter) {
        const lower = specializationFilter.toLowerCase();
        combined = combined.filter((m) =>
          m.specialization.toLowerCase().includes(lower),
        );
      }

      // Apply city filter
      if (cityFilter) {
        const lower = cityFilter.toLowerCase();
        combined = combined.filter(
          (m) => m.city && m.city.toLowerCase().includes(lower),
        );
      }

      // Sort by rating descending (nulls last)
      combined.sort((a, b) => {
        const ra = a.rating ? parseFloat(a.rating) : 0;
        const rb = b.rating ? parseFloat(b.rating) : 0;
        return rb - ra;
      });

      return combined;
    },
    {
      query: z.object({
        search: z.string().optional(),
        specialization: z.string().optional(),
        city: z.string().optional(),
      }),
    },
  )

  // ── Get services for a specific master ──────────────────────────────────────
  .get(
    "/:id/services",
    async ({ params, query, set }) => {
      const { type } = query;

      if (!type) {
        set.status = 400;
        return { code: 400, message: "Параметр type обязателен (EMPLOYEE или FREELANCER)" };
      }

      if (type === "EMPLOYEE") {
        // Services for an employee are stored under their business
        const employee = await db.query.employeeProfiles.findFirst({
          where: eq(employeeProfiles.id, params.id),
          columns: { businessId: true },
        });

        if (!employee) {
          set.status = 404;
          return { code: 404, message: "Сотрудник не найден" };
        }

        return db.query.services.findMany({
          where: and(
            eq(services.businessId, employee.businessId),
            eq(services.isActive, true),
          ),
        });
      }

      if (type === "FREELANCER") {
        return db.query.services.findMany({
          where: and(
            eq(services.freelancerId, params.id),
            eq(services.isActive, true),
          ),
        });
      }

      set.status = 400;
      return { code: 400, message: "Неверный тип мастера. Ожидается EMPLOYEE или FREELANCER" };
    },
    {
      query: z.object({
        type: z.string().optional(),
      }),
    },
  );
