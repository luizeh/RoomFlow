<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\ReservationShareController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\Admin\ReservationReviewController;
use App\Http\Controllers\Admin\SiteSettingController as AdminSiteSettingController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\RoomController as AdminRoomController;
use App\Http\Controllers\Admin\ReservationController as AdminReservationController;

/*
| Rotas públicas
*/

// throttle:6,1 → no máximo 6 tentativas por minuto (por IP). Depois disso a API responde 429.
// Protege contra força bruta de senha e criação de contas em massa.
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::apiResource('rooms', RoomController::class)->only(['index', 'show']);
Route::get('/shared-reservations/{token}',[ReservationShareController::class, 'show'])->middleware('throttle:30,1');

// Textos da landing page e contatos do footer
Route::get('/site-settings', [SiteSettingController::class, 'show'])->name('site-settings.show');

/*
| Usuário autenticado
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::put('/profile', [UserController::class, 'update'])->name('profile.update');

    // Avisos do site (sininho). read-all vem antes de {id} para não ser lido como id.
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    Route::apiResource('reservations', ReservationController::class);

    // Agenda da sala (horários ocupados). Admin vê quem reservou; usuário comum vê só "ocupado".
    Route::get('/rooms/{room}/schedule', [RoomController::class, 'schedule'])->name('rooms.schedule');

    // Agenda geral: todas as salas (ou as filtradas em ?rooms[]=...), mesmas regras da agenda da sala.
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule');

    Route::get('/users/search', [UserController::class, 'search']);
    
    Route::post('/reservations/{reservation}/share', [ReservationShareController::class, 'store']);
    Route::delete('/reservations/{reservation}/share',[ReservationShareController::class, 'destroy']);
    Route::delete('/reservations/{reservation}/participation',[ReservationController::class, 'leave']);
});

/*
| Admin: auth:sanctum → admin → controller
| Todas as URLs começam com /api/admin e os nomes com admin.
*/
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::apiResource('users', AdminUserController::class)->except(['store']);
    Route::apiResource('rooms', AdminRoomController::class);
    // Fila de solicitações. pending-count vem antes do apiResource para não ser lido como {reservation}.
    Route::get('/reservations/pending-count', [ReservationReviewController::class, 'pendingCount'])->name('reservations.pending-count');
    Route::post('/reservations/{reservation}/approve', [ReservationReviewController::class, 'approve'])->name('reservations.approve');
    Route::post('/reservations/{reservation}/reject', [ReservationReviewController::class, 'reject'])->name('reservations.reject');

    Route::apiResource('reservations', AdminReservationController::class)->except(['store']);

    // Conteúdo do site (landing page e footer)
    Route::get('/site-settings', [AdminSiteSettingController::class, 'show'])->name('site-settings.show');
    Route::put('/site-settings', [AdminSiteSettingController::class, 'update'])->name('site-settings.update');
});
