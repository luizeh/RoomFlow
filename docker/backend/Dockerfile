FROM php:8.4-cli

WORKDIR /var/www

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install zip pdo_mysql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY backend/ .

RUN composer install

EXPOSE 8000

CMD ["sh", "-c", "composer install --no-interaction --prefer-dist && php artisan serve --host=0.0.0.0 --port=8000"]
