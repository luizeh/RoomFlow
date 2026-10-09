# Room Flow

## Backend com Docker

O backend requer PHP 8.4.1 ou superior, que já vem no container. Por isso, rode `php artisan` e `composer` **dentro do container `backend`**, e não com o PHP instalado no Windows.

Suba os containers:

```powershell
docker compose up -d --build
```

Com os containers rodando, execute os comandos assim:

```powershell
docker compose exec backend php artisan migrate
docker compose exec backend php artisan route:list
docker compose exec backend php artisan make:request StoreRoomRequest
docker compose exec backend composer install
docker compose exec backend composer dump-autoload
```

Os arquivos criados pelo container (ex.: `make:request`) aparecem normalmente na pasta `backend/`, porque ela é compartilhada com o container por volume.
