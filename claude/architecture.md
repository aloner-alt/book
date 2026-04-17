# Архитектура BookApp — Next.js 14 (App Router)

## Стек технологий

| Слой | Технология |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Язык | TypeScript |
| База данных | PostgreSQL + Prisma ORM |
| Аутентификация | NextAuth.js v5 (JWT, credentials provider) |
| Стили | Tailwind CSS + CSS Variables (цветовая схема по ролям) |
| Компоненты | shadcn/ui (radix-ui) |
| Валидация | Zod + React Hook Form |
| Email | Resend / Nodemailer |
| SMS | SMSC.ru / SMS Aero API |
| State | Zustand (глобальный) + React Query (серверный кэш) |
| Загрузка файлов | UploadThing / Cloudinary |
| Деплой | Vercel + Neon DB (serverless PostgreSQL) |

---

## Структура папок

```
bookapp/
├── app/                              # Next.js App Router
│   ├── (public)/                     # Публичные страницы (без auth)
│   │   ├── page.tsx                  # Экран A — Главная (Landing)
│   │   ├── login/
│   │   │   └── page.tsx              # Экран C — Форма входа
│   │   ├── register/
│   │   │   ├── business/
│   │   │   │   └── page.tsx          # Экран D — Регистрация бизнесмена
│   │   │   ├── client/
│   │   │   │   └── page.tsx          # Экран E — Регистрация клиента
│   │   │   └── freelancer/
│   │   │       └── page.tsx          # Экран K — Регистрация самозанятого
│   │   └── reset-password/
│   │       └── page.tsx
│   │
│   ├── (cabinet)/                    # Защищённые кабинеты (auth required)
│   │   ├── layout.tsx                # Layout с проверкой JWT
│   │   │
│   │   ├── cabinet/
│   │   │   ├── business/             # Кабинет бизнесмена (Экран F)
│   │   │   │   ├── layout.tsx        # Сайдбар + хедер бизнесмена
│   │   │   │   ├── page.tsx          # Расписание (главная кабинета)
│   │   │   │   ├── employees/
│   │   │   │   │   ├── page.tsx      # Экран G — Список сотрудников
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx  # Экран I — Создание сотрудника
│   │   │   │   ├── clients/
│   │   │   │   │   └── page.tsx      # CRM — база клиентов
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx      # Аналитика
│   │   │   │   └── finances/
│   │   │   │       └── page.tsx      # Финансы
│   │   │   │
│   │   │   ├── employee/             # Кабинет сотрудника (Экран J)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── freelancer/           # Кабинет самозанятого (Экран L)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── clients/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── finances/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── client/               # Кабинет клиента (Экран M)
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── masters/
│   │   │       │   └── page.tsx      # Каталог мастеров
│   │   │       └── profile/
│   │   │           └── page.tsx
│   │
│   ├── api/                          # API Routes (Route Handlers)
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts          # NextAuth handler
│   │   │   ├── register/
│   │   │   │   ├── business/
│   │   │   │   │   └── route.ts      # POST /api/auth/register/business
│   │   │   │   ├── client/
│   │   │   │   │   └── route.ts      # POST /api/auth/register/client
│   │   │   │   └── freelancer/
│   │   │   │       └── route.ts      # POST /api/auth/register/freelancer
│   │   │   └── reset-password/
│   │   │       └── route.ts
│   │   ├── employees/
│   │   │   ├── route.ts              # POST /api/employees/create
│   │   │   └── [businessId]/
│   │   │       └── route.ts          # GET /api/employees/:business_id
│   │   ├── appointments/
│   │   │   ├── route.ts              # POST create
│   │   │   ├── [date]/
│   │   │   │   └── route.ts          # GET by date
│   │   │   └── [id]/
│   │   │       ├── cancel/
│   │   │       │   └── route.ts      # PATCH cancel
│   │   │       └── reschedule/
│   │   │           └── route.ts      # PATCH reschedule
│   │   ├── services/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts              # Загрузка фото
│   │
│   ├── layout.tsx                    # Root layout (шрифты, провайдеры)
│   └── globals.css                   # CSS переменные цветов по ролям
│
├── components/                       # Переиспользуемые компоненты
│   ├── ui/                           # shadcn/ui базовые компоненты
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── calendar.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Header.tsx                # Публичный хедер (Landing)
│   │   ├── CabinetHeader.tsx         # Хедер кабинета (по роли)
│   │   └── Sidebar.tsx               # Сайдбар бизнесмена
│   │
│   ├── auth/
│   │   ├── LoginTypeModal.tsx        # Экран B — Модал выбора роли
│   │   ├── RoleTabSwitcher.tsx       # Переключатель ролей в форме входа
│   │   └── PasswordInput.tsx         # Input с show/hide пароля
│   │
│   ├── schedule/
│   │   ├── CalendarGrid.tsx          # Сетка расписания (главный компонент)
│   │   ├── AppointmentCard.tsx       # Карточка записи в расписании
│   │   ├── MiniCalendar.tsx          # Мини-календарь в сайдбаре
│   │   ├── DayNavigator.tsx          # Кнопки < Сегодня >
│   │   └── CreateAppointmentModal.tsx # Модал создания записи
│   │
│   ├── employees/
│   │   ├── EmployeeCard.tsx          # Карточка сотрудника (Экран G)
│   │   ├── EmployeeDetailModal.tsx   # Экран H — расширенная карточка
│   │   └── EmployeeGrid.tsx          # Сетка карточек
│   │
│   ├── appointments/
│   │   ├── AppointmentRow.tsx        # Строка записи (кабинет сотрудника/клиента)
│   │   ├── CancelModal.tsx           # Подтверждение отмены
│   │   └── RescheduleModal.tsx       # Модал переноса
│   │
│   └── forms/
│       ├── BusinessRegisterForm.tsx
│       ├── ClientRegisterForm.tsx
│       ├── FreelancerRegisterForm.tsx
│       └── CreateEmployeeForm.tsx
│
├── lib/
│   ├── auth.ts                       # NextAuth config (providers, callbacks)
│   ├── prisma.ts                     # Prisma client singleton
│   ├── validations/                  # Zod schemas
│   │   ├── auth.ts                   # registerBusinessSchema, loginSchema...
│   │   ├── employee.ts
│   │   └── appointment.ts
│   ├── utils.ts                      # cn(), formatDate(), formatPhone()...
│   └── notifications.ts              # SMS/Email отправка
│
├── store/
│   └── useAppStore.ts                # Zustand — глобальный стейт (текущая дата, модалы)
│
├── types/
│   └── index.ts                      # TypeScript типы (UserRole, AppointmentStatus...)
│
├── middleware.ts                     # Route protection по ролям
│
├── prisma/
│   └── schema.prisma                 # Схема БД
│
└── public/
    └── icons/                        # SVG иконки
```

---

## Схема базы данных (Prisma Schema)

```prisma
// prisma/schema.prisma

enum UserRole {
  BUSINESS
  CLIENT
  EMPLOYEE
  FREELANCER
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  RESCHEDULED
}

model User {
  id            String    @id @default(cuid())
  login         String    @unique
  email         String?   @unique
  passwordHash  String
  role          UserRole
  createdAt     DateTime  @default(now())
  failedAttempts Int      @default(0)
  lockedUntil   DateTime?

  businessProfile   BusinessProfile?
  clientProfile     ClientProfile?
  employeeProfile   EmployeeProfile?
  freelancerProfile FreelancerProfile?
  sessions          Session[]
}

model BusinessProfile {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id])

  ownerName   String           // ФИО владельца
  phone       String
  companyName String
  legalForm   String           // ИП / ООО / АО / Самозанятый
  inn         String
  category    String           // Парикмахерская, Тату-студия...
  city        String
  companyPhone String?

  employees   EmployeeProfile[]
  services    Service[]
  appointments Appointment[]
}

model EmployeeProfile {
  id             String  @id @default(cuid())
  userId         String  @unique
  user           User    @relation(fields: [userId], references: [id])
  businessId     String
  business       BusinessProfile @relation(fields: [businessId], references: [id])

  firstName      String
  lastName       String
  middleName     String?
  phone          String
  email          String?
  photoUrl       String?
  position       String           // Мастер / Администратор / Менеджер
  specialization String
  workMode       String?
  employmentType String?
  services       String?          // Текст — перечень услуг
  about          String?
  rating         Float?           @default(0)
  isActive       Boolean          @default(true)

  appointments   Appointment[]
}

model FreelancerProfile {
  id             String  @id @default(cuid())
  userId         String  @unique
  user           User    @relation(fields: [userId], references: [id])

  fullName       String
  inn            String
  phone          String
  email          String?
  photoUrl       String?
  specialization String
  city           String
  experience     Int?             // Стаж в годах
  about          String?
  rating         Float?           @default(0)

  clients        ClientProfile[]  @relation("FreelancerClients")
  services       Service[]
  appointments   Appointment[]    @relation("FreelancerAppointments")
}

model ClientProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])

  firstName   String
  lastName    String
  phone       String
  email       String?
  city        String?
  birthdate   DateTime?
  gender      String?  @default("NOT_SPECIFIED")

  appointments     Appointment[]
  favoriteFreelancers FreelancerProfile[] @relation("FreelancerClients")
}

model Service {
  id                    String  @id @default(cuid())
  name                  String
  price                 Float
  durationMinutes       Int

  businessId            String?
  business              BusinessProfile?  @relation(fields: [businessId], references: [id])
  freelancerId          String?
  freelancer            FreelancerProfile? @relation(fields: [freelancerId], references: [id])

  appointments          Appointment[]
}

model Appointment {
  id            String            @id @default(cuid())
  status        AppointmentStatus @default(PENDING)
  datetime      DateTime
  durationMin   Int

  clientId      String
  client        ClientProfile     @relation(fields: [clientId], references: [id])

  serviceId     String?
  service       Service?          @relation(fields: [serviceId], references: [id])

  // Запись либо к сотруднику, либо к самозанятому
  employeeId    String?
  employee      EmployeeProfile?  @relation(fields: [employeeId], references: [id])
  freelancerId  String?
  freelancer    FreelancerProfile? @relation("FreelancerAppointments", fields: [freelancerId], references: [id])

  businessId    String?
  business      BusinessProfile?  @relation(fields: [businessId], references: [id])

  notes         String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}
```

---

## API Routes

### Аутентификация

| Метод | URL | Действие | Доступ |
|-------|-----|---------|--------|
| POST | `/api/auth/register/business` | Регистрация бизнесмена | Public |
| POST | `/api/auth/register/client` | Регистрация клиента | Public |
| POST | `/api/auth/register/freelancer` | Регистрация самозанятого | Public |
| POST | `/api/auth/[...nextauth]` | Вход / Refresh Token | Public |

### Сотрудники

| Метод | URL | Действие | Доступ |
|-------|-----|---------|--------|
| POST | `/api/employees` | Создать сотрудника | BUSINESS |
| GET | `/api/employees/[businessId]` | Список сотрудников | BUSINESS |
| PATCH | `/api/employees/[id]` | Обновить данные | BUSINESS |
| PATCH | `/api/employees/[id]/deactivate` | Отключить сотрудника | BUSINESS |

### Записи (Appointments)

| Метод | URL | Действие | Доступ |
|-------|-----|---------|--------|
| GET | `/api/appointments/[date]` | Расписание на дату | BUSINESS, EMPLOYEE, FREELANCER |
| POST | `/api/appointments` | Создать запись | BUSINESS, CLIENT, FREELANCER |
| PATCH | `/api/appointments/[id]/cancel` | Отменить запись | All |
| PATCH | `/api/appointments/[id]/reschedule` | Перенести запись | All |

### Услуги и профили

| Метод | URL | Действие | Доступ |
|-------|-----|---------|--------|
| GET | `/api/services/[providerId]` | Список услуг | Public |
| POST | `/api/services` | Создать услугу | BUSINESS, FREELANCER |
| GET | `/api/masters` | Каталог мастеров | Public |
| POST | `/api/upload` | Загрузка фото | Authenticated |

---

## Middleware — защита маршрутов

```
middleware.ts
├── /cabinet/business/**  → только BUSINESS
├── /cabinet/employee/**  → только EMPLOYEE
├── /cabinet/freelancer/**→ только FREELANCER
├── /cabinet/client/**    → только CLIENT
├── /api/employees/**     → только BUSINESS (кроме GET для расписания)
└── /* (публичные)        → без ограничений
```

**Логика:** читает JWT из cookie → проверяет `role` → разрешает или делает `redirect`.

---

## Цветовая схема (CSS Variables)

```css
/* globals.css */
:root {
  --color-business:   #4a235a;  /* Фиолетовый — бизнесмен */
  --color-client:     #1a5fa8;  /* Синий — клиент */
  --color-employee:   #1a6b4a;  /* Зелёный — сотрудник */
  --color-freelancer: #0e7070;  /* Бирюзовый — самозанятый */
  --color-header:     #1a1a2e;  /* Тёмно-синий — общий фон шапок */
  --color-accent:     #f0a000;  /* Оранжевый — текущая дата, акценты */
}
```

Каждый кабинет применяет `data-role="business"` на `<body>`, что позволяет переключать тему через CSS.

---

## State Management

### Zustand Store (`store/useAppStore.ts`)

```ts
interface AppStore {
  // Текущая выбранная дата в расписании
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  // Режим отображения расписания
  scheduleView: 'day' | 'week';
  setScheduleView: (view: 'day' | 'week') => void;

  // Состояние модальных окон
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;

  createAppointmentModal: { open: boolean; prefillTime?: string; prefillEmployeeId?: string };
  setCreateAppointmentModal: (state: ...) => void;
}
```

### React Query (TanStack Query)

Для кэширования серверных данных:
- `useAppointments(date)` — список записей на дату
- `useEmployees(businessId)` — список сотрудников
- `useServices(providerId)` — услуги

---

## Auth Flow (NextAuth.js v5)

```
1. Пользователь вводит логин + пароль + роль
2. POST /api/auth/callback/credentials
3. CredentialsProvider.authorize():
   a. Находит User по login в БД
   b. Проверяет failedAttempts / lockedUntil
   c. bcrypt.compare(password, user.passwordHash)
   d. При успехе — возвращает { id, role }
   e. При ошибке — инкрементирует failedAttempts (блокировка после 5)
4. NextAuth создаёт JWT с { sub: userId, role }
5. Middleware читает JWT из cookie session
6. Redirect в нужный кабинет по role:
   BUSINESS   → /cabinet/business
   CLIENT     → /cabinet/client
   EMPLOYEE   → /cabinet/employee
   FREELANCER → /cabinet/freelancer
```

---

## Валидация форм (Zod)

```ts
// lib/validations/auth.ts

export const registerBusinessSchema = z.object({
  ownerName:    z.string().min(2),
  phone:        z.string().regex(/^\+7\d{10}$/),
  email:        z.string().email(),
  login:        z.string().min(4).regex(/^[a-zA-Z0-9_]+$/),
  password:     z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: z.string(),
  companyName:  z.string().min(2),
  legalForm:    z.enum(['ИП', 'ООО', 'АО', 'Самозанятый']),
  inn:          z.string().refine(validateINN),
  category:     z.string(),
  city:         z.string().min(2),
  companyPhone: z.string().optional(),
  consent:      z.literal(true),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});
```

---

## Уведомления

```
lib/notifications.ts
├── sendSMS(phone, message)     → SMSC.ru API
├── sendEmail(to, subject, html)→ Resend API
└── notifyAppointment(event):
    ├── 'confirmed'   → SMS + Email клиенту
    ├── 'cancelled'   → SMS + Email клиенту
    └── 'reminder'    → SMS за 24 часа (cron job / Vercel Cron)
```

---

## Ключевые бизнес-правила в коде

1. **Сотрудник не регистрируется сам** — эндпоинт `POST /api/employees` проверяет `session.role === 'BUSINESS'`
2. **Блокировка после 5 неудачных входов** — хранится в `User.failedAttempts` + `User.lockedUntil`
3. **ИНН валидация** — алгоритм проверки контрольных сумм ФНС (12 цифр для ИП/самозанятых, 10 для ООО)
4. **Отмена за < 24 часов** — клиентский кабинет показывает предупреждение, API не блокирует (UX решение)
5. **Сотрудник видит только свои записи** — в запросе фильтр `WHERE employeeId = session.userId`

---

## Этапы реализации (MVP First)

### Этап 1 — MVP (соответствует spec Этапу 1)
- [ ] Инициализация Next.js 14 + Prisma + NextAuth
- [ ] Регистрация бизнесмена (Экран D) + логин
- [ ] Кабинет бизнесмена с расписанием (Экран F)
- [ ] Создание сотрудников (Экраны G, H, I)
- [ ] Кабинет сотрудника (Экран J)
- [ ] Регистрация и кабинет клиента (Экраны E, M)

### Этап 2
- [ ] Кабинет самозанятого (Экраны K, L)
- [ ] Финансовый учёт + аналитика
- [ ] SMS/Email уведомления
- [ ] Публичные профили мастеров

### Этап 3
- [ ] Тарифы и подписки
- [ ] Онлайн-оплата (ЮКassa)
- [ ] Каталог/маркетплейс мастеров

---

## Инициализация проекта

```bash
npx create-next-app@latest bookapp \
  --typescript --tailwind --eslint \
  --app --src-dir=false --import-alias="@/*"

cd bookapp

# ORM и БД
npm install prisma @prisma/client
npx prisma init

# Auth
npm install next-auth@beta @auth/prisma-adapter

# Валидация и формы
npm install zod react-hook-form @hookform/resolvers

# UI компоненты
npx shadcn@latest init
npx shadcn@latest add button input form modal calendar

# State
npm install zustand @tanstack/react-query

# Безопасность
npm install bcryptjs
npm install -D @types/bcryptjs
```
