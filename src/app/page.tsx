"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Scissors,
  Calendar,
  BarChart3,
  Users,
  CheckCircle,
  Star,
  Clock,
  Shield,
  Smartphone,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Building2,
  LogIn,
  User,
  Briefcase,
  FileText,
} from "lucide-react";

function LoginTypeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const options = [
    {
      icon: <Building2 className="h-7 w-7" />,
      title: "Я — Бизнесмен / Владелец",
      desc: "Управление бизнесом, сотрудниками",
      color: "#4a235a",
      href: "/login?role=BUSINESS",
    },
    {
      icon: <User className="h-7 w-7" />,
      title: "Я — Клиент",
      desc: "Запись к мастеру, мои визиты",
      color: "#1a5fa8",
      href: "/login?role=CLIENT",
    },
    {
      icon: <Briefcase className="h-7 w-7" />,
      title: "Я — Сотрудник",
      desc: "Мои записи и расписание",
      color: "#1a6b4a",
      href: "/login?role=EMPLOYEE",
    },
    {
      icon: <Scissors className="h-7 w-7" />,
      title: "Я — Фрилансер",
      desc: "Личное расписание, приём клиентов",
      color: "#0e7070",
      href: "/login?role=FREELANCER",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Выберите тип входа
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          {options.map((opt) => (
            <button
              key={opt.title}
              type="button"
              onClick={() => {
                onClose();
                router.push(opt.href);
              }}
              className="flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md"
              style={{ borderColor: opt.color }}
            >
              <span className="flex-shrink-0" style={{ color: opt.color }}>{opt.icon}</span>
              <div>
                <p className="font-semibold" style={{ color: opt.color }}>
                  {opt.title}
                </p>
                <p className="text-sm text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground pt-2">
          Нет аккаунта?{" "}
          <Link
            href="/register/business"
            className="font-medium underline"
            onClick={onClose}
          >
            Зарегистрироваться
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}

const FAQ_ITEMS = [
  {
    q: "Сколько стоит использование BookApp?",
    a: "Базовый план бесплатен навсегда. Расширенные функции доступны по подписке. Никаких скрытых комиссий и платы за каждую запись.",
  },
  {
    q: "Как клиенты записываются ко мне?",
    a: "У каждого мастера и бизнеса есть публичная страница. Клиент выбирает услугу, свободное время и подтверждает запись — вы сразу получаете уведомление.",
  },
  {
    q: "Могу ли я перенести существующую базу клиентов?",
    a: "Да, можно импортировать клиентов из Excel/CSV или добавить их вручную. Вся история визитов хранится в системе.",
  },
  {
    q: "Работает ли BookApp на телефоне?",
    a: "Да, приложение полностью адаптировано для смартфонов. Управляйте записями прямо с мобильного устройства в любом месте.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-0">
      <button
        className="flex items-center justify-between w-full py-4 text-left font-medium text-gray-800 hover:text-gray-900 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 ml-2 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2 text-gray-400" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-white"
        >
          <Scissors className="h-5 w-5" />
          BookApp
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#how"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Как работает
          </Link>
          <Link
            href="#about"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            О сервисе
          </Link>
          <Link
            href="/register/freelancer"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Фрилансерам
          </Link>
          <Link
            href="/register/business"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Бизнесу
          </Link>
          <Link
            href="#faq"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            FAQ
          </Link>
        </nav>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-white text-[#1a1a2e] hover:bg-white/90 font-semibold flex items-center gap-2"
        >
          <LogIn className="h-4 w-4" />Войти
        </Button>
      </header>

      {/* ── Hero ── */}
      <section
        className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-36 relative overflow-hidden"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #4a235a, transparent)" }}
        />
        <div
          className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #0e7070, transparent)" }}
        />

        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-white/50 mb-4 border border-white/10 px-3 py-1 rounded-full">
          Платформа для записи и управления
        </span>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 max-w-3xl leading-tight">
          Автоматизация записи для бизнеса и мастеров
        </h1>
        <p className="text-white/65 text-lg mb-10 max-w-xl leading-relaxed">
          Управляйте расписанием, сотрудниками и клиентами в одном месте. Без лишних звонков и бумажек.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/register/business">
            <Button
              variant="outline"
              className="border-2 bg-transparent text-white hover:bg-white/10 px-8 py-3 h-auto text-base font-semibold"
              style={{ borderColor: "#4a235a" }}
            >
              Для бизнеса
            </Button>
          </Link>
          <Link href="/register/freelancer">
            <Button
              variant="outline"
              className="border-2 bg-transparent text-white hover:bg-white/10 px-8 py-3 h-auto text-base font-semibold"
              style={{ borderColor: "#0e7070" }}
            >
              Фрилансерам
            </Button>
          </Link>
          <Button
            onClick={() => setModalOpen(true)}
            className="px-8 py-3 h-auto text-base font-semibold border border-white bg-transparent text-white hover:bg-white/10 flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />Войти
          </Button>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ backgroundColor: "#16213e" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {[
            { value: "1 200+", label: "Мастеров и бизнесов" },
            { value: "45 000+", label: "Записей обработано" },
            { value: "98%", label: "Довольных клиентов" },
            { value: "200+", label: "Городов России" },
          ].map((s) => (
            <div key={s.label} className="text-center py-6 px-4">
              <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Просто и понятно
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
            Как работает BookApp
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                color: "#4a235a",
                icon: <FileText className="h-6 w-6" />,
                title: "Регистрация за 2 минуты",
                desc: "Создайте профиль бизнеса или мастера. Добавьте свои услуги, цены и расписание. Всё интуитивно.",
              },
              {
                step: "02",
                color: "#1a5fa8",
                icon: <Calendar className="h-6 w-6" />,
                title: "Клиенты записываются сами",
                desc: "Поделитесь ссылкой на профиль. Клиенты выбирают удобное время и услугу — вы получаете уведомление.",
              },
              {
                step: "03",
                color: "#0e7070",
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Управляйте и анализируйте",
                desc: "Следите за расписанием, выручкой и клиентской базой в одном кабинете. Больше никаких таблиц.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <span
                  className="text-xs font-bold tracking-widest mb-2"
                  style={{ color: item.color }}
                >
                  ШАГ {item.step}
                </span>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section id="about" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Возможности
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
            Всё что нужно для вашего бизнеса
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Calendar className="h-7 w-7" style={{ color: "#4a235a" }} />,
                title: "Онлайн-запись 24/7",
                desc: "Клиенты записываются в любое время суток. Автоматические подтверждения и напоминания снижают количество неявок.",
                color: "#4a235a",
                bg: "#f6f0f9",
              },
              {
                icon: <BarChart3 className="h-7 w-7" style={{ color: "#1a5fa8" }} />,
                title: "Аналитика и финансы",
                desc: "Отслеживайте выручку, загрузку мастеров и популярные услуги. Принимайте решения на основе данных.",
                color: "#1a5fa8",
                bg: "#eef4fb",
              },
              {
                icon: <Users className="h-7 w-7" style={{ color: "#0e7070" }} />,
                title: "CRM клиентов",
                desc: "Полная история визитов, контакты и заметки о каждом клиенте. Строй долгосрочные отношения.",
                color: "#0e7070",
                bg: "#e8f6f6",
              },
              {
                icon: <Smartphone className="h-7 w-7" style={{ color: "#f0a000" }} />,
                title: "Мобильная версия",
                desc: "Управляйте расписанием с телефона. Приложение работает на любом устройстве без установки.",
                color: "#f0a000",
                bg: "#fdf6e7",
              },
              {
                icon: <Shield className="h-7 w-7" style={{ color: "#1a6b4a" }} />,
                title: "Безопасность данных",
                desc: "Ваши данные и данные клиентов надёжно защищены. Резервные копии каждый день.",
                color: "#1a6b4a",
                bg: "#e8f5ee",
              },
              {
                icon: <TrendingUp className="h-7 w-7" style={{ color: "#dc2626" }} />,
                title: "Рост без лишних трат",
                desc: "Сократите время на администрирование на 80%. Больше времени на работу с клиентами.",
                color: "#dc2626",
                bg: "#fef2f2",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex flex-col p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: card.bg }}
                >
                  {card.icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For business / freelancers ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          {/* Business */}
          <div className="rounded-2xl p-8 text-white relative overflow-hidden" style={{ backgroundColor: "#4a235a" }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #fff, transparent)", transform: "translate(40%, -40%)" }} />
            <Building2 className="h-8 w-8 mb-3 opacity-90" />
            <h3 className="text-2xl font-bold mb-3">Для бизнеса</h3>
            <p className="text-white/70 text-sm mb-5 leading-relaxed">
              Идеально для салонов красоты, барбершопов, студий и других сервисных бизнесов с командой.
            </p>
            <ul className="space-y-2.5 text-white/85 text-sm mb-7">
              {[
                "Расписание сотрудников на день и неделю",
                "Управление командой — роли, доступы",
                "CRM — база клиентов с историей визитов",
                "Финансовая аналитика и отчёты",
                "Онлайн-запись для всех мастеров",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-300" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register/business">
              <Button className="bg-white text-[#4a235a] hover:bg-white/90 font-semibold w-full">
                Начать бесплатно →
              </Button>
            </Link>
          </div>

          {/* Freelancer */}
          <div className="rounded-2xl p-8 text-white relative overflow-hidden" style={{ backgroundColor: "#0e7070" }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #fff, transparent)", transform: "translate(40%, -40%)" }} />
            <Scissors className="h-8 w-8 mb-3 opacity-90" />
            <h3 className="text-2xl font-bold mb-3">Для фрилансеров</h3>
            <p className="text-white/70 text-sm mb-5 leading-relaxed">
              Работаете на себя? BookApp поможет вести записи, клиентскую базу и доходы в одном месте.
            </p>
            <ul className="space-y-2.5 text-white/85 text-sm mb-7">
              {[
                "Личное расписание и приём записей онлайн",
                "Публичный профиль для клиентов",
                "Учёт доходов и статус самозанятого",
                "Управление услугами и ценами",
                "Всё бесплатно для одного мастера",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-300" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register/freelancer">
              <Button className="bg-white text-[#0e7070] hover:bg-white/90 font-semibold w-full">
                Зарегистрироваться →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Отзывы
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
            Что говорят наши пользователи
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Анна К.",
                role: "Мастер маникюра, Москва",
                text: "Раньше вела записи в блокноте. Теперь всё в BookApp — клиенты сами записываются, я вижу расписание на неделю вперёд. Экономлю 2 часа в день!",
                color: "#0e7070",
                rating: 5,
              },
              {
                name: "Дмитрий В.",
                role: "Владелец барбершопа, СПб",
                text: "Взял для своего барбершопа на 4 мастера. Аналитика по выручке, контроль расписания, база клиентов — теперь управляю всем с телефона.",
                color: "#4a235a",
                rating: 5,
              },
              {
                name: "Елена М.",
                role: "Косметолог, Казань",
                text: "Очень удобная система. Клиентам нравится, что можно записаться в любое время. Количество отмен снизилось на 40% после внедрения напоминаний.",
                color: "#1a5fa8",
                rating: 5,
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array(t.rating).fill(null).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-5">
                  «{t.text}»
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why us ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Преимущества
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
            Почему выбирают BookApp
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: <Clock className="h-5 w-5" />,
                color: "#4a235a",
                title: "Экономия времени",
                desc: "Автоматические напоминания клиентам, онлайн-запись и цифровой журнал освобождают до 3 часов в день.",
              },
              {
                icon: <MessageSquare className="h-5 w-5" />,
                color: "#0e7070",
                title: "Меньше потерянных клиентов",
                desc: "SMS и push-напоминания снижают количество неявок на 60%. Клиенты не забывают о записи.",
              },
              {
                icon: <TrendingUp className="h-5 w-5" />,
                color: "#1a5fa8",
                title: "Рост выручки",
                desc: "Встроенные инструменты аналитики помогают выявить лучшие услуги и оптимизировать прайс.",
              },
              {
                icon: <Shield className="h-5 w-5" />,
                color: "#1a6b4a",
                title: "Надёжность и поддержка",
                desc: "Работаем 24/7. Служба поддержки ответит в течение часа в рабочие дни. Данные защищены.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Вопросы и ответы
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-800">
            Часто задаваемые вопросы
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="py-20 px-4 text-center"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 max-w-2xl mx-auto">
          Готовы автоматизировать свой бизнес?
        </h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          Начните бесплатно. Никакой кредитной карты, никаких обязательств.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/register/business">
            <Button
              className="px-8 py-3 h-auto text-base font-semibold"
              style={{ backgroundColor: "#4a235a" }}
            >
              Зарегистрировать бизнес
            </Button>
          </Link>
          <Link href="/register/freelancer">
            <Button
              className="px-8 py-3 h-auto text-base font-semibold"
              style={{ backgroundColor: "#0e7070" }}
            >
              Я фрилансер
            </Button>
          </Link>
          <Button
            onClick={() => setModalOpen(true)}
            variant="outline"
            className="px-8 py-3 h-auto text-base font-semibold border-white/30 text-white bg-transparent hover:bg-white/10"
          >
            Уже есть аккаунт
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-10 text-white/50 text-sm"
        style={{ backgroundColor: "#111122" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/70 font-bold">
            <Scissors className="h-4 w-4" />
            BookApp
          </div>
          <div className="flex gap-6 text-xs">
            <Link href="#about" className="hover:text-white/80 transition-colors">О сервисе</Link>
            <Link href="#how" className="hover:text-white/80 transition-colors">Как работает</Link>
            <Link href="#faq" className="hover:text-white/80 transition-colors">FAQ</Link>
            <Link href="/register/business" className="hover:text-white/80 transition-colors">Для бизнеса</Link>
            <Link href="/register/freelancer" className="hover:text-white/80 transition-colors">Фрилансерам</Link>
          </div>
          <p>© 2026 BookApp. Все права защищены.</p>
        </div>
      </footer>

      <LoginTypeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
