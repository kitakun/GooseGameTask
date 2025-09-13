# GooseGameTask

Браузерная игра, где игроки соревнуются, кто быстрее и больше натапает по виртуальному гусю, подхватившему мутацию G-42.

## 🚀 Быстрый старт

### Быстрый запуск для тестирования

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd Goose
```

2. **Установите зависимости:**
```bash
# Установка всех зависимостей
npm install

# Установка зависимостей бекенда
cd backend && npm install

# Установка зависимостей фронтенда
cd ../frontend && npm install
```

3. **Настройте базу данных (SQLite для быстрого тестирования):**
```bash
cd ../backend

# Создайте .env файл
cp env.example .env

# Отредактируйте .env для использования SQLite
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'JWT_SECRET="test-secret-key"' >> .env
echo 'ROUND_DURATION=60' >> .env
echo 'COOLDOWN_DURATION=30' >> .env
echo 'PORT=3001' >> .env
```

4. **Инициализируйте базу данных:**
```bash
# Генерируйте Prisma клиент
npm run db:generate

# Примените схему к базе данных
npm run db:push

# Инициализируйте базу данных
npm run db:init
```

5. **Запустите приложение:**
```bash
# Из корневой директории
npm run dev
```

6. **Откройте в браузере:**
- Фронтенд: http://localhost:5173
- Бекенд API: http://localhost:3001

### Тестовые пользователи
- **Админ**: `admin` / любой пароль
- **Никита**: `nikita` / любой пароль  
- **Игрок**: любое другое имя / любой пароль

## Технологии

### Backend
- Node.js + TypeScript
- Fastify (веб-фреймворк)
- Prisma (ORM)
- PostgreSQL (база данных)
- JWT (аутентификация)

### Frontend
- React + TypeScript
- Vite (сборщик)
- React Router (роутинг)
- Zustand (управление состоянием)
- Tailwind CSS (стили)
- Lucide React (иконки)


## 🏗️ Архитектура

### Backend Architecture

#### Feature Slice Design (FSD) Pattern
Бекенд использует архитектурный паттерн Feature Slice Design для организации кода:

```
backend/src/
├── app/                    # Слой приложения
│   ├── index.ts           # Инициализация сервера
│   ├── plugins.ts         # Регистрация плагинов
│   ├── middleware.ts      # Регистрация middleware
│   ├── routes.ts          # Регистрация роутов
│   └── providers.ts       # Провайдеры (Prisma, etc.)
├── domain/                 # Доменный слой (бизнес-логика)
│   ├── user/
│   │   ├── model.ts       # Типы пользователя
│   │   └── api.ts         # Сервисы пользователя
│   ├── round/
│   │   ├── model.ts       # Типы раундов
│   │   └── api.ts         # Сервисы раундов
│   └── tap/
│       ├── model.ts       # Типы тапов
│       └── api.ts         # Сервисы тапов
├── features/               # Слой фич (пользовательские сценарии)
│   ├── auth/
│   │   ├── api/
│   │   │   ├── controller.ts  # Контроллеры аутентификации
│   │   │   └── types.ts       # API типы
│   │   └── lib/
│   │       ├── middleware.ts  # Middleware аутентификации
│   │       └── utils.ts       # Утилиты (JWT, bcrypt)
│   ├── rounds/
│   │   ├── api/
│   │   │   ├── controller.ts      # Контроллеры раундов
│   │   │   ├── adminController.ts # Админ контроллеры
│   │   │   └── types.ts           # API типы
│   │   └── lib/
│   │       └── utils.ts           # Утилиты раундов
│   └── tap/
│       └── api/
│           └── controller.ts      # Контроллеры тапов
└── shared/                 # Общий слой
    ├── api/
    │   ├── types.ts        # Общие API типы
    │   └── fastify.d.ts    # Расширения Fastify
    ├── config/
    │   └── index.ts        # Конфигурация
    └── lib/
        └── database.ts     # Prisma клиент
```

#### Ключевые принципы архитектуры:
- **Разделение ответственности**: Каждый слой имеет четко определенную роль
- **Инверсия зависимостей**: Features зависят от Domain, но не наоборот
- **Path mapping**: Использование `@/` алиасов для чистых импортов
- **Типобезопасность**: Строгая типизация на всех уровнях

### Frontend Architecture

#### Component-Based Architecture
Фронтенд построен на основе компонентной архитектуры с использованием современных React паттернов:

```
frontend/src/
├── components/             # Переиспользуемые компоненты
│   ├── Header.tsx         # Шапка приложения
│   ├── Layout.tsx         # Основной лейаут
│   ├── LoadingSpinner.tsx # Компонент загрузки
│   └── RoundPage/         # Компоненты страницы раунда
│       ├── GameArea.tsx   # Игровая область
│       ├── RoundHeader.tsx# Заголовок раунда
│       ├── RoundStatusCard.tsx # Статус раунда
│       ├── StatsSection.tsx    # Статистика
│       └── TapResult.tsx       # Результат тапа
├── pages/                  # Страницы приложения
│   ├── LoginPage.tsx      # Страница входа
│   ├── RoundsPage.tsx     # Список раундов
│   └── RoundPage.tsx      # Страница раунда
├── store/                  # Управление состоянием (Zustand)
│   ├── authStore.ts       # Состояние аутентификации
│   └── roundsStore.ts     # Состояние раундов
├── api/                    # API клиент
│   ├── client.ts          # Базовый клиент
│   ├── client.auth.ts     # API аутентификации
│   ├── client.rounds.ts   # API раундов
│   └── client.tap.ts      # API тапов
├── hooks/                  # Кастомные хуки
│   └── useDelayedLoader.ts# Хук для отложенной загрузки
├── utils/                  # Утилиты
│   └── roundUtils.ts      # Утилиты для работы с раундами
└── types/                  # TypeScript типы
    └── index.ts           # Общие типы
```

#### Ключевые особенности фронтенда:
- **Оптимизация производительности**: React.memo, useCallback, delayed loader
- **Типобезопасность**: Строгая типизация с TypeScript
- **Состояние**: Zustand для простого и эффективного управления состоянием
- **Стили**: Tailwind CSS для быстрой разработки UI
- **Роутинг**: React Router для SPA навигации

### Масштабируемость
Приложение разработано с учетом возможности запуска нескольких инстансов бекенда:
- Нет привязки пользователя к определенному инстансу
- Использование транзакций для обеспечения консистентности данных
- Обработка race conditions при подсчете очков

### Безопасность
- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- Валидация входных данных с Zod
- Проверка ролей и прав доступа

