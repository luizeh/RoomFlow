<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomScheduleTest extends TestCase
{
    use RefreshDatabase;

    private Room $room;
    private User $owner;
    private User $other;

    protected function setUp(): void
    {
        parent::setUp();

        $this->room = Room::create(['name' => 'Sala Atlântico', 'capacity' => 8, 'location' => '3º andar']);
        $this->owner = User::factory()->create(['name' => 'Ana Dona']);
        $this->other = User::factory()->create(['name' => 'Bruno Outro']);

        // Reserva da Ana na segunda, 14h-15h
        Reservation::create([
            'user_id' => $this->owner->id,
            'room_id' => $this->room->id,
            'start_at' => '2030-01-07 14:00:00',
            'end_at' => '2030-01-07 15:00:00',
        ]);
    }

    private function scheduleUrl(string $start = '2030-01-06', string $end = '2030-01-13'): string
    {
        return "/api/rooms/{$this->room->id}/schedule?start={$start}&end={$end}";
    }

    public function test_visitante_sem_login_nao_ve_a_agenda(): void
    {
        $this->getJson($this->scheduleUrl())->assertUnauthorized();
    }

    public function test_usuario_ve_reserva_dos_outros_so_como_ocupado(): void
    {
        $response = $this->actingAs($this->other)->getJson($this->scheduleUrl());

        $response->assertOk()
            ->assertExactJson([[
                'id' => null,
                'start_at' => '2030-01-07 14:00:00',
                'end_at' => '2030-01-07 15:00:00',
                'is_mine' => false,
            ]]);

        $this->assertStringNotContainsString('Ana', $response->getContent());
    }

    public function test_usuario_ve_a_propria_reserva_com_id(): void
    {
        $this->actingAs($this->owner)->getJson($this->scheduleUrl())
            ->assertOk()
            ->assertJsonPath('0.is_mine', true)
            ->assertJsonPath('0.id', 1)
            ->assertJsonMissingPath('0.user');
    }

    public function test_admin_ve_quem_reservou(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        $this->actingAs($admin)->getJson($this->scheduleUrl())
            ->assertOk()
            ->assertJsonPath('0.id', 1)
            ->assertJsonPath('0.is_mine', false)
            ->assertJsonPath('0.user.name', 'Ana Dona');
    }

    public function test_so_traz_reservas_do_periodo_e_da_sala(): void
    {
        $otherRoom = Room::create(['name' => 'Sala Pacífico', 'capacity' => 4, 'location' => '2º andar']);
        Reservation::create([
            'user_id' => $this->other->id,
            'room_id' => $otherRoom->id,
            'start_at' => '2030-01-07 14:00:00',
            'end_at' => '2030-01-07 15:00:00',
        ]);

        // Mesma sala, semana seguinte
        Reservation::create([
            'user_id' => $this->other->id,
            'room_id' => $this->room->id,
            'start_at' => '2030-01-15 09:00:00',
            'end_at' => '2030-01-15 10:00:00',
        ]);

        $this->actingAs($this->other)->getJson($this->scheduleUrl())
            ->assertOk()
            ->assertJsonCount(1);
    }

    public function test_inclui_reserva_que_atravessa_o_inicio_do_periodo(): void
    {
        // Período começando às 14h30, no meio da reserva das 14h-15h
        $this->actingAs($this->other)
            ->getJson($this->scheduleUrl('2030-01-07 14:30:00', '2030-01-07 18:00:00'))
            ->assertOk()
            ->assertJsonCount(1);
    }

    public function test_valida_o_periodo(): void
    {
        $this->actingAs($this->other)->getJson("/api/rooms/{$this->room->id}/schedule")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['start', 'end']);

        $this->actingAs($this->other)->getJson($this->scheduleUrl('2030-01-13', '2030-01-06'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['end']);

        $this->actingAs($this->other)->getJson($this->scheduleUrl('2030-01-01', '2030-06-01'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['end']);
    }

    public function test_sala_inexistente_retorna_404(): void
    {
        $this->actingAs($this->other)
            ->getJson('/api/rooms/999/schedule?start=2030-01-06&end=2030-01-13')
            ->assertNotFound();
    }
}
