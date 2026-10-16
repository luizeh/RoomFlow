<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

// Avisos do usuário logado (sininho do site). Quem cria os avisos são as Notifications
// com o canal 'database' (ex.: ReservationReviewed); aqui só lemos e marcamos como lido.
// Cada usuário só acessa os próprios avisos porque tudo parte de $request->user().
class NotificationController extends Controller
{
    /**
     * Últimos avisos e quantos ainda não foram lidos.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->limit(20)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'data' => $notification->data,
                'read_at' => $notification->read_at?->format('Y-m-d H:i:s'),
                'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
            ]);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Marca um aviso como lido. O id é procurado só entre os avisos do usuário,
     * então o aviso de outra pessoa dá 404.
     */
    public function markAsRead(Request $request, string $id)
    {
        $request->user()->notifications()->findOrFail($id)->markAsRead();

        return response()->noContent();
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->noContent();
    }
}
