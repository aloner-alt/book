"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Scissors,
  Users,
  Calendar,
  BarChart3,
  DollarSign,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/app/lib/client/api";

const BUSINESS_COLOR = "#4a235a";

type AnalyticsData = {
  totalAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  totalClients: number;
  totalEmployees: number;
  recentAppointments: Array<{
    id: string;
    datetime: string;
    status: string;
    client: { firstName: string; lastName: string } | null;
    service: { name: string; price: string } | null;
    employee: { firstName: string; lastName: string } | null;
  }>;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждено",
  completed: "Завершено",
  cancelled: "Отменено",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f0a000",
  confirmed: "#1a6b4a",
  completed: "#1a5fa8",
  cancelled: "#dc2626",
};

function Sidebar({ activeHref }: { activeHref: string }) {
  const navItems = [
    { icon: <Calendar className="h-4 w-4" />, label: "Расписание", href: "/cabinet/business" },
    { icon: <Users className="h-4 w-4" />, label: "Сотрудники", href: "/cabinet/business/employees" },
    { icon: <Users className="h-4 w-4" />, label: "Клиенты", href: "/cabinet/business/clients" },
    { icon: <BarChart3 className="h-4 w-4" />, label: "Аналитика", href: "/cabinet/business/analytics" },
    { icon: <DollarSign className="h-4 w-4" />, label: "Финансы", href: "/cabinet/business/finances" },
    { icon: <Settings className="h-4 w-4" />, label: "Услуги", href: "/cabinet/business/services" },
  ];

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col text-white"
      style={{ backgroundColor: BUSINESS_COLOR }}
    >
      <div className="px-4 py-4 border-b border-white/10 flex items-center gap-2">
        <Scissors className="h-5 w-5" />
        <span className="font-bold text-base">BookApp</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                borderLeft: isActive ? "3px solid #f0a000" : "3px solid transparent",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/10 rounded-lg w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>
    </aside>
  );
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnalyticsPage() {
  const pathname = usePathname();

  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await api.analytics.get();
      return res.data as unknown as AnalyticsData;
    },
  });

  const stats = data
    ? [
        {
          label: "Всего записей",
          value: data.totalAppointments,
          icon: <Calendar className="h-5 w-5" />,
          color: BUSINESS_COLOR,
        },
        {
          label: "Подтверждено",
          value: data.confirmedAppointments,
          icon: <CheckCircle className="h-5 w-5" />,
          color: "#1a6b4a",
        },
        {
          label: "Отменено",
          value: data.cancelledAppointments,
          icon: <XCircle className="h-5 w-5" />,
          color: "#dc2626",
        },
        {
          label: "Выручка",
          value: `${Number(data.totalRevenue).toLocaleString("ru-RU")} ₽`,
          icon: <TrendingUp className="h-5 w-5" />,
          color: "#f0a000",
        },
        {
          label: "Клиентов",
          value: data.totalClients,
          icon: <Users className="h-5 w-5" />,
          color: "#1a5fa8",
        },
        {
          label: "Сотрудников",
          value: data.totalEmployees,
          icon: <Users className="h-5 w-5" />,
          color: "#6b21a8",
        },
      ]
    : [];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeHref={pathname} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-4 bg-white border-b shadow-sm">
          <h1 className="font-bold text-lg flex-1">Аналитика</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
          {/* Stat cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border h-28 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-5 border shadow-sm flex items-center gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent appointments table */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-base">Последние записи</h2>
            </div>

            {isLoading ? (
              <div className="p-5 space-y-3">
                {Array(5).fill(null).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : !data || data.recentAppointments.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <Calendar className="h-10 w-10 opacity-30 mx-auto mb-2" />
                <p>Нет записей</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-muted-foreground uppercase tracking-wide">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">Время</th>
                      <th className="px-5 py-3 text-left font-medium">Клиент</th>
                      <th className="px-5 py-3 text-left font-medium">Услуга</th>
                      <th className="px-5 py-3 text-left font-medium">Сотрудник</th>
                      <th className="px-5 py-3 text-left font-medium">Статус</th>
                      <th className="px-5 py-3 text-right font-medium">Стоимость</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recentAppointments.slice(0, 10).map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                          {formatDateTime(appt.datetime)}
                        </td>
                        <td className="px-5 py-3 font-medium">
                          {appt.client
                            ? `${appt.client.firstName} ${appt.client.lastName}`
                            : "—"}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {appt.service?.name ?? "—"}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {appt.employee
                            ? `${appt.employee.firstName} ${appt.employee.lastName}`
                            : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            className="text-white text-xs"
                            style={{ backgroundColor: STATUS_COLORS[appt.status] ?? "#888" }}
                          >
                            {STATUS_LABELS[appt.status] ?? appt.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold">
                          {appt.service
                            ? `${Number(appt.service.price).toLocaleString("ru-RU")} ₽`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
