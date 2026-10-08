<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // forceFill porque 'role' não é fillable (evita que alguém vire admin pelo cadastro)
        User::firstOrNew(['email' => 'admin@roomflow.com'])
            ->forceFill([
                'name' => 'Administrador',
                'password' => '123123123',
                'role' => 'admin',
            ])
            ->save();
    }
}
