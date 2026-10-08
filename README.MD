# Room Flow

## Backend com Docker

O backend requer PHP 8.4.1 ou superior. No Windows, use os atalhos abaixo na raiz do projeto para executar Composer e Artisan com o PHP 8.4 do container:

```powershell
docker compose up -d --build
.\composer.ps1 dump-autoload
.\artisan.ps1 make:request StoreRoomRequest
```

Outros exemplos:

```powershell
.\composer.ps1 install
.\artisan.ps1 migrate
.\artisan.ps1 route:list
```

Não execute `composer` diretamente no Windows enquanto o PHP local for 8.3; esse comando usa o PHP local, que não atende à versão exigida pelas dependências. Os atalhos do projeto executam os comandos dentro do serviço `backend`.
