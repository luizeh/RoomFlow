<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // A ordem importa: ReservationSeeder usa as salas do RoomSeeder
        $this->call(RoomSeeder::class);
        $this->call(AdminUserSeeder::class);
        $this->call(ReservationSeeder::class);

        // User::factory(10)->create();

        User::firstOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'password' => Hash::make(Str::random(32)),
        ]);
    }
}
