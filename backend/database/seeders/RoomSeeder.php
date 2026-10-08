<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            ['name' => 'Sala Alfa', 'capacity' => 6, 'location' => 'Prédio A - 1º Andar', 'description' => 'Equipada com TV de 55 polegadas e lousa digital.'],
            ['name' => 'Auditório Principal', 'capacity' => 50, 'location' => 'Prédio Central - Térreo', 'description' => 'Possui projetor, sistema de som e ar-condicionado central.'],
            ['name' => 'Sala de Foco', 'capacity' => 2, 'location' => 'Prédio B - 2º Andar', 'description' => null],
        ];

        // updateOrCreate pelo nome: rodar o seeder de novo não duplica as salas
        foreach ($rooms as $room) {
            Room::updateOrCreate(['name' => $room['name']], $room);
        }
    }
}
