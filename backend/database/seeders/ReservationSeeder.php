<?php

namespace Database\Seeders;

use App\Enums\ReservationStatus;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

// Depende do RoomSeeder: usa as salas que ele cria.
class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        // Usuário comum para testes manuais (login: john@example.com / password).
        // firstOrCreate: se já existir, não mexe nele.
        $user = User::firstOrCreate(
            ['email' => 'john@example.com'],
            ['name' => 'John Doe', 'password' => 'password']
        );

        $alfa = Room::where('name', 'Sala Alfa')->firstOrFail();
        $auditorio = Room::where('name', 'Auditório Principal')->firstOrFail();

        // Uma aprovada e uma pendente, para testar a fila de solicitações do painel.
        // status não está no fillable, então é definido com forceFill().
        Reservation::updateOrCreate(
            ['user_id' => $user->id, 'room_id' => $alfa->id],
            [
                'title' => 'Alinhamento semanal',
                'start_at' => now()->addDay()->setTime(9, 0),
                'end_at' => now()->addDay()->setTime(10, 0),
            ]
        )->forceFill(['status' => ReservationStatus::Approved])->save();

        Reservation::updateOrCreate(
            ['user_id' => $user->id, 'room_id' => $auditorio->id],
            [
                'title' => 'Apresentação para clientes',
                'start_at' => now()->addDays(3)->setTime(14, 0),
                'end_at' => now()->addDays(3)->setTime(16, 0),
            ]
        )->forceFill(['status' => ReservationStatus::Pending])->save();
    }
}
