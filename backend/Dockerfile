FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Копирование кода проекта
COPY deliveryapp/ .

# Создание директорий для статических и медиа файлов
RUN mkdir -p /app/static /app/media

# Запуск сервера с выводом логов в консоль
CMD ["gunicorn", "deliveryapp.wsgi:application", "--bind", "0:8000", "--log-level", "debug", "--access-logfile", "-", "--error-logfile", "-"]
