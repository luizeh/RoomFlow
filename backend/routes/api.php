<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\Admin\DashboardController;
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

/*
| Usuário autenticado
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::put('/profile', [UserController::class, 'update'])->name('profile.update');

    Route::apiResource('reservations', ReservationController::class);

    // Agenda da sala (horários ocupados). Admin vê quem reservou; usuário comum vê só "ocupado".
    Route::get('/rooms/{room}/schedule', [RoomController::class, 'schedule'])->name('rooms.schedule');
});

/*
| Admin: auth:sanctum → admin → controller
| Todas as URLs começam com /api/admin e os nomes com admin.
*/
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::apiResource('users', AdminUserController::class)->except(['store']);
    Route::apiResource('rooms', AdminRoomController::class);
    Route::apiResource('reservations', AdminReservationController::class)->except(['store']);
});
