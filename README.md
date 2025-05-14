# Delivery App

Приложение для управления доставками с веб и мобильным интерфейсом.

## Структура проекта

```
delivery-app/
├── backend/         # Django бэкенд
├── frontend/        # Фронтенд приложения
    ├── web/         # Веб-интерфейс (React + Vite)
    └── mobile/      # Мобильное приложение (React Native + Expo)

```

## Требования

- Docker и Docker Compose
- Node.js 18+ и npm
- Python 3.10+

## Развертывание бэкенда

### Локальное развертывание

1. Перейдите в директорию бэкенда:

```bash
cd backend
```

2. Создайте и активируйте виртуальное окружение:

```bash
python -m venv venv
.\venv\Scripts\activate  # для Windows
```

3. Установите зависимости:

```bash
pip install -r requirements.txt
```

4. Создайте файл .env в директории backend/ со следующими параметрами:

```
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=sqlite
SECRET_KEY=your-secret-key
DEBUG=True
```

5. Выполните миграции и создайте суперпользователя:

```bash
python manage.py migrate
python manage.py createsuperuser
```

6. Загрузите начальные данные:

```bash
python manage.py loaddata initial_data_tags.json
python manage.py loaddata initial_data_delivery.json
```

7. Запустите сервер разработки:

```bash
python manage.py runserver
```

### Развертывание с Docker

1. Убедитесь, что Docker и Docker Compose установлены

2. Запустите контейнеры:

```bash
docker-compose up -d
```

3. Выполните миграции и создайте суперпользователя:

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

4. Загрузите начальные данные:

```bash
docker-compose exec backend python manage.py loaddata initial_data_tags.json
docker-compose exec backend python manage.py loaddata initial_data_delivery.json
```

## Развертывание веб-интерфейса

1. Перейдите в директорию веб-интерфейса:

```bash
cd frontend/web/latest
```

2. Установите зависимости:

```bash
npm install
```

3. Запустите сервер разработки:

```bash
npm run dev
```

4. Для сборки проекта:

```bash
npm run build
```

## Развертывание мобильного приложения

1. Перейдите в директорию мобильного приложения:

```bash
cd frontend/mobile
```

2. Установите зависимости:

```bash
npm install
```

3. Запустите приложение:

```bash
npx expo start
```

4. Для создания сборки Android:

```bash
eas build -p android --profile preview
```

## API Эндпоинты

### Аутентификация

- `POST /api/jwt/create/` - Получение JWT токена
  - Параметры: `username`, `password`
  - Возвращает: `access`, `refresh`

- `POST /api/jwt/refresh/` - Обновление JWT токена
  - Параметры: `refresh`
  - Возвращает: `access`

- `GET /auth/users/me/` - Получение информации о текущем пользователе


### Доставки

- `GET /api/deliveries/` - Получение списка доставок
  - Параметры фильтрации: `start_date`, `end_date`, `service`

- `POST /api/deliveries/` - Создание новой доставки

- `GET /api/deliveries/{id}/` - Получение информации о доставке

- `PUT /api/deliveries/{id}/` - Обновление информации о доставке

- `DELETE /api/deliveries/{id}/` - Удаление доставки

### Услуги

- `GET /api/services/` - Получение списка услуг

## Технологии

### Бэкенд
- Django 5.2.1
- Django REST Framework 3.16.0
- PostgreSQL (в Docker)
- JWT аутентификация (djangorestframework_simplejwt)
- Djoser для управления пользователями

### Веб-интерфейс
- React
- Vite
- Material UI
- Axios для API запросов

### Мобильное приложение
- React Native
- Expo
- TypeScript

## Автор проекта

**Александр**
- GitHub: [alexunder2003](https://github.com/alexunder2003)
- Email: alexunder2003@example.com

