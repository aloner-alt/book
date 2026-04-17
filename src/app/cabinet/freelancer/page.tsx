"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  format,
  addDays,
  subDays,
  isToday,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ru } from "date-fns/locale";
import {
  Scissors,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Star,
  Plus,
  Pencil,
  Trash2,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/app/lib/client/api";

const FREELANCER_COLOR = "#0e7070";

type Appointment = {
  id: string;
  datetime: string;
  durationMinutes: number;
  status: string;
  notes: string | null;
  client: { firstName: string; lastName: string; phone: string } | null;
  service: { name: string; price: string } | null;
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
  cancelled: "#999",
};

type ActiveTab = "schedule" | "clients" | "finances" | "settings";

function RescheduleModal({
  appointmentId,
  onClose,
}: {
  appointmentId: string;
  onClose: () => void;
}) {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!newDate || !newTime) throw new Error("Выберите дату и время");
      const datetime = new Date(`${newDate}T${newTime}`).toISOString();
      await api.appointments({ id: appointmentId }).reschedule.patch({ datetime });
    },
    onSuccess: () => {
      toast.success("Запись перенесена");
      queryClient.invalidateQueries({ queryKey: ["freelancer-appointments"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Перенос записи</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Новая дата</Label>
            <Input
              type="date"
              value={newDate}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Новое время</Label>
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            style={{ backgroundColor: FREELANCER_COLOR }}
          >
            Перенести
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ServiceModal({
  service,
  onClose,
}: {
  service: { id: string; name: string; price: string; durationMinutes: number; description: string | null } | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(service?.name ?? "");
  const [price, setPrice] = useState(service?.price ?? "");
  const [duration, setDuration] = useState(service?.durationMinutes ?? 60);
  const [description, setDescription] = useState(service?.description ?? "");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name || !price) throw new Error("Заполните обязательные поля");
      if (service) {
        // Edit
        await api.services({ id: service.id }).patch({
          name,
          price: parseFloat(price),
          durationMinutes: duration,
          description: description || undefined,
        });
      } else {
        // Create
        await api.services.post({
          name,
          price: parseFloat(price),
          durationMinutes: duration,
          description: description || undefined,
        });
      }
    },
    onSuccess: () => {
      toast.success(service ? "Услуга обновлена" : "Услуга добавлена");
      queryClient.invalidateQueries({ queryKey: ["freelancer-services"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{service ? "Редактировать услугу" : "Новая услуга"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Название *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Маникюр классический" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Цена (₽) *</Label>
              <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1500" />
            </div>
            <div className="space-y-1.5">
              <Label>Длительность (мин)</Label>
              <Input type="number" min="15" step="15" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Описание</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Необязательно" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} style={{ backgroundColor: FREELANCER_COLOR }}>
            {service ? "Сохранить" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FreelancerCabinetPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<ActiveTab>("schedule");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [serviceModal, setServiceModal] = useState<{
    open: boolean;
    service: { id: string; name: string; price: string; durationMinutes: number; description: string | null } | null;
  }>({ open: false, service: null });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "", email: "", city: "", specialization: "", about: "" });
  const queryClient = useQueryClient();

  const from = format(startOfDay(currentDate), "yyyy-MM-dd");
  const to = format(endOfDay(currentDate), "yyyy-MM-dd");

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["freelancer-appointments", from],
    queryFn: async () => {
      const res = await api.appointments.get({ query: { from, to } });
      return (res.data ?? []) as unknown as Appointment[];
    },
  });

  // All appointments for stats
  const { data: allAppointments = [] } = useQuery({
    queryKey: ["freelancer-appointments-all"],
    queryFn: async () => {
      const res = await api.appointments.get({});
      return (res.data ?? []) as unknown as Appointment[];
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["freelancer-services"],
    queryFn: async () => {
      const res = await api.services.get();
      return (res.data ?? []) as unknown as Array<{
        id: string;
        name: string;
        price: string;
        durationMinutes: number;
        description: string | null;
      }>;
    },
  });

  const { data: sidebarProfile } = useQuery({
    queryKey: ["freelancer-profile-sidebar"],
    queryFn: async () => {
      const res = await api.profile.get();
      return (res.data ?? null) as unknown as { fullName: string; specialization: string; city: string; rating: string | null } | null;
    },
  });

  const { data: profileData } = useQuery({
    queryKey: ["freelancer-profile"],
    queryFn: async () => {
      const res = await api.profile.get();
      return (res.data ?? null) as unknown as {
        fullName: string;
        phone: string;
        email: string | null;
        city: string;
        specialization: string;
        about: string | null;
        inn: string;
        experience: number | null;
      } | null;
    },
    enabled: activeTab === "settings",
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.appointments({ id }).cancel.patch();
    },
    onSuccess: () => {
      toast.success("Запись отменена. Клиент будет уведомлён.");
      queryClient.invalidateQueries({ queryKey: ["freelancer-appointments"] });
    },
    onError: () => toast.error("Не удалось отменить запись"),
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      await (api.appointments({ id }) as unknown as { complete: { patch: () => Promise<unknown> } }).complete.patch();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["freelancer-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["freelancer-appointments-all"] });
    },
  });

  // Auto-complete overdue appointments
  const autoCompletedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const now = Date.now();
    const overdue = appointments.filter(
      (a) =>
        (a.status === "pending" || a.status === "confirmed") &&
        new Date(a.datetime).getTime() + a.durationMinutes * 60 * 1000 < now &&
        !autoCompletedRef.current.has(a.id),
    );
    for (const app of overdue) {
      autoCompletedRef.current.add(app.id);
      completeMutation.mutate(app.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments]);

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.services({ id }).delete();
    },
    onSuccess: () => {
      toast.success("Услуга удалена");
      queryClient.invalidateQueries({ queryKey: ["freelancer-services"] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await api.profile.patch({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        email: profileForm.email || undefined,
        city: profileForm.city,
        specialization: profileForm.specialization,
        about: profileForm.about || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Профиль обновлён");
      queryClient.invalidateQueries({ queryKey: ["freelancer-profile"] });
      queryClient.invalidateQueries({ queryKey: ["freelancer-profile-sidebar"] });
      setEditingProfile(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeAppointments = appointments.filter(
    (a) => a.status !== "cancelled",
  );

  const totalRevenue = allAppointments
    .filter((a) => a.status === "completed" || a.status === "confirmed")
    .reduce((sum, a) => sum + Number(a.service?.price ?? 0), 0);

  const uniqueClients = new Set(
    allAppointments
      .filter((a) => a.client)
      .map((a) => `${a.client!.firstName}${a.client!.lastName}`),
  ).size;

  const navItems: { id: ActiveTab; icon: React.ReactNode; label: string }[] = [
    { id: "schedule", icon: <Calendar className="h-4 w-4" />, label: "Расписание" },
    { id: "clients", icon: <Users className="h-4 w-4" />, label: "Клиенты" },
    { id: "finances", icon: <DollarSign className="h-4 w-4" />, label: "Финансы" },
    { id: "settings", icon: <Settings className="h-4 w-4" />, label: "Настройки" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col text-white"
        style={{ backgroundColor: FREELANCER_COLOR }}
      >
        <div className="px-4 py-4 border-b border-white/10 flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          <span className="font-bold text-base">BookApp</span>
        </div>

        {/* Profile */}
        <div className="px-4 py-5 border-b border-white/10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            {(sidebarProfile?.fullName ?? session?.user?.login)?.[0]?.toUpperCase() ?? "М"}
          </div>
          <p className="font-bold text-sm">{sidebarProfile?.fullName ?? session?.user?.login ?? "Мастер"}</p>
          <p className="text-white/70 text-xs">{sidebarProfile?.specialization ?? "Самозанятый"} · {sidebarProfile?.city ?? "Москва"}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
            <span className="text-xs text-yellow-300">4.8 · 96 отзывов</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all w-full text-left"
              style={{
                backgroundColor:
                  activeTab === item.id
                    ? "rgba(255,255,255,0.15)"
                    : undefined,
                borderLeft:
                  activeTab === item.id
                    ? "3px solid #f0a000"
                    : "3px solid transparent",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Stats bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center gap-6 flex-wrap">
          {[
            {
              value: activeAppointments.length,
              label: "Записей сегодня",
              color: FREELANCER_COLOR,
            },
            {
              value: uniqueClients,
              label: "Клиентов",
              color: "#1a5fa8",
            },
            {
              value: `${Math.round(totalRevenue / 1000) || 0}к`,
              label: "Доход/мес",
              color: "#f0a000",
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Schedule tab */}
        {activeTab === "schedule" && (
          <div className="flex-1 overflow-auto p-6">
            {/* Date nav */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setCurrentDate((d) => subDays(d, 1))}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="flex-1 text-center font-semibold text-base capitalize">
                {isToday(currentDate) ? "Сегодня, " : ""}
                {format(currentDate, "d MMMM, EEEE", { locale: ru })}
              </h2>
              <button
                onClick={() => setCurrentDate((d) => addDays(d, 1))}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Appointment list */}
            <div className="space-y-3">
              {isLoading ? (
                Array(3)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-5 border h-20 animate-pulse"
                    />
                  ))
              ) : activeAppointments.length === 0 ? (
                <div className="bg-white rounded-xl p-10 border text-center text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium mb-1">Записей нет</p>
                  <p className="text-sm">
                    На{" "}
                    {format(currentDate, "d MMMM", { locale: ru })} свободно
                  </p>
                </div>
              ) : (
                activeAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl p-5 border shadow-sm flex items-center gap-4"
                  >
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: STATUS_COLORS[app.status] ?? "#888",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">
                        {app.client
                          ? `${app.client.firstName} ${app.client.lastName[0]}.`
                          : "(Клиент)"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(app.datetime), "HH:mm")} ·{" "}
                        {app.service?.name ?? "Услуга"} ·{" "}
                        {app.durationMinutes}мин
                      </p>
                      {app.client?.phone && (
                        <p className="text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 inline mr-1" />{app.client.phone}
                        </p>
                      )}
                    </div>

                    <Badge
                      variant="outline"
                      className="text-xs flex-shrink-0"
                      style={{
                        borderColor: STATUS_COLORS[app.status],
                        color: STATUS_COLORS[app.status],
                      }}
                    >
                      {STATUS_LABELS[app.status]}
                    </Badge>

                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {(app.status === "pending" || app.status === "confirmed") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          style={{ borderColor: "#1a5fa8", color: "#1a5fa8" }}
                          onClick={() => {
                            if (confirm("Завершить запись?")) completeMutation.mutate(app.id);
                          }}
                        >
                          Завершить
                        </Button>
                      )}
                      {app.status !== "completed" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-[#f0a000] text-[#f0a000] hover:bg-orange-50"
                            onClick={() => setRescheduleId(app.id)}
                          >
                            Перенос
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-destructive text-destructive hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Отменить запись?")) {
                                cancelMutation.mutate(app.id);
                              }
                            }}
                          >
                            Отмена
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Clients tab */}
        {activeTab === "clients" && (
          <div className="flex-1 overflow-auto p-6">
            <h2 className="font-bold text-lg mb-4">База клиентов</h2>
            {allAppointments.filter((a) => a.client).length === 0 ? (
              <div className="bg-white rounded-xl p-10 border text-center text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Клиентов пока нет</p>
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from(
                  new Map(
                    allAppointments
                      .filter((a) => a.client)
                      .map((a) => [
                        `${a.client!.firstName}${a.client!.lastName}`,
                        a.client!,
                      ]),
                  ).values(),
                ).map((client) => (
                  <div
                    key={`${client.firstName}${client.lastName}`}
                    className="bg-white rounded-xl p-4 border shadow-sm flex items-center gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: FREELANCER_COLOR }}
                    >
                      {client.firstName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {client.firstName} {client.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        📞 {client.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Finances tab */}
        {activeTab === "finances" && (
          <div className="flex-1 overflow-auto p-6">
            <h2 className="font-bold text-lg mb-4">Финансы</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                {
                  label: "Общий доход",
                  value: `${totalRevenue.toLocaleString("ru-RU")} ₽`,
                  color: FREELANCER_COLOR,
                },
                {
                  label: "Завершённых записей",
                  value: allAppointments.filter(
                    (a) => a.status === "completed",
                  ).length,
                  color: "#1a5fa8",
                },
                {
                  label: "Средний чек",
                  value: allAppointments.filter(
                    (a) => a.status === "completed",
                  ).length
                    ? `${Math.round(
                        totalRevenue /
                          allAppointments.filter(
                            (a) => a.status === "completed",
                          ).length,
                      ).toLocaleString("ru-RU")} ₽`
                    : "—",
                  color: "#f0a000",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-5 border shadow-sm"
                >
                  <p
                    className="text-2xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Services list */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="font-semibold">Мои услуги</h3>
                <Button
                  size="sm"
                  className="gap-1"
                  style={{ backgroundColor: FREELANCER_COLOR }}
                  onClick={() => setServiceModal({ open: true, service: null })}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Добавить
                </Button>
              </div>
              {services.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Услуги не добавлены
                </div>
              ) : (
                <div className="divide-y">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.durationMinutes} мин
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">
                          {Number(s.price).toLocaleString("ru-RU")} ₽
                        </p>
                        <button onClick={() => setServiceModal({ open: true, service: s })} className="p-1 hover:text-[#0e7070]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => { if (confirm("Удалить услугу?")) deleteServiceMutation.mutate(s.id); }} className="p-1 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings tab */}
        {activeTab === "settings" && (
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Настройки профиля</h2>
              {!editingProfile && (
                <Button variant="outline" size="sm" onClick={() => {
                  setProfileForm({
                    fullName: profileData?.fullName ?? "",
                    phone: profileData?.phone ?? "",
                    email: profileData?.email ?? "",
                    city: profileData?.city ?? "",
                    specialization: profileData?.specialization ?? "",
                    about: profileData?.about ?? "",
                  });
                  setEditingProfile(true);
                }}>Редактировать</Button>
              )}
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
              {editingProfile ? (
                <>
                  {[
                    { label: "Полное имя", key: "fullName", placeholder: "Иванова Анна Сергеевна" },
                    { label: "Телефон", key: "phone", placeholder: "+7 (999) 000-00-00" },
                    { label: "Email", key: "email", placeholder: "email@example.com" },
                    { label: "Город", key: "city", placeholder: "Москва" },
                    { label: "Специализация", key: "specialization", placeholder: "Мастер маникюра" },
                    { label: "О себе", key: "about", placeholder: "Расскажите о себе..." },
                  ].map((f) => (
                    <div key={f.key} className="space-y-1.5">
                      <Label>{f.label}</Label>
                      <Input
                        value={profileForm[f.key as keyof typeof profileForm]}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setEditingProfile(false)}>Отмена</Button>
                    <Button className="flex-1" disabled={updateProfileMutation.isPending}
                      style={{ backgroundColor: FREELANCER_COLOR }}
                      onClick={() => updateProfileMutation.mutate()}>
                      Сохранить
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {[
                    { label: "Полное имя", value: profileData?.fullName },
                    { label: "Телефон", value: profileData?.phone },
                    { label: "Email", value: profileData?.email },
                    { label: "Город", value: profileData?.city },
                    { label: "Специализация", value: profileData?.specialization },
                    { label: "ИНН", value: profileData?.inn },
                    { label: "Стаж (лет)", value: profileData?.experience },
                    { label: "Логин", value: session?.user?.login },
                  ].map((field) => (
                    <div key={field.label} className="flex items-center justify-between py-3 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">{field.label}</span>
                      <span className="text-sm font-medium">{field.value ?? "—"}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <Button className="w-full mt-4" variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
              Выйти из аккаунта
            </Button>
          </div>
        )}
      </div>

      {rescheduleId && (
        <RescheduleModal
          appointmentId={rescheduleId}
          onClose={() => setRescheduleId(null)}
        />
      )}

      {serviceModal.open && (
        <ServiceModal service={serviceModal.service} onClose={() => setServiceModal({ open: false, service: null })} />
      )}
    </div>
  );
}
