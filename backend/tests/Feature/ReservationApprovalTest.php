<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use App\Notifications\ReservationReviewed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ReservationApprovalTest extends TestCase
{
    use RefreshDatabase;

    private Room $room;
    private User $admin;
    private User $ana;
    private User $bruno;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();

        $this->room = Room::create(['name' => 'Sala Atlântico', 'capacity' => 8, 'location' => '3º andar']);

        $this->admin = User::factory()->create();
        $this->admin->forceFill(['role' => 'admin'])->save();

        $this->ana = User::factory()->create(['name' => 'Ana']);
        $this->bruno = User::factory()->create(['name' => 'Bruno']);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'room_id' => $this->room->id,
            'title' => 'Reunião',
            'start_at' => '2030-01-07 14:00:00',
            'end_at' => '2030-01-07 15:00:00',
        ], $overrides);
    }

    public function test_cliente_cria_solicitacao_pendente(): void
    {
        $this->actingAs($this->ana)->postJson('/api/reservations', $this->payload())
            ->assertCreated()
            ->assertJsonPath('status', 'pending');
    }

    public function test_reserva_do_admin_ja_nasce_aprovada(): void
    {
        $this->actingAs($this->admin)->postJson('/api/reservations', $this->payload())
            ->assertCreated()
            ->assertJsonPath('status', 'approved');
    }

    public function test_pendente_nao_bloqueia_o_horario_mas_aprovada_sim(): void
    {
        $this->actingAs($this->ana)->postJson('/api/reservations', $this->payload())->assertCreated();

        // Mesmo horário: Bruno ainda pode solicitar, a da Ana está só pendente
        $this->actingAs($this->bruno)->postJson('/api/reservations', $this->payload())->assertCreated();

        Reservation::first()->approve($this->admin);

        // Depois de aprovada, o horário fica ocupado
        $this->actingAs($this->bruno)->postJson('/api/reservations', $this->payload())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['start_at']);
    }

    public function test_aprovar_recusa_as_pendentes_conflitantes_e_avisa_por_email(): void
    {
        $anaId = $this->actingAs($this->ana)->postJson('/api/reservations', $this->payload())->json('id');
        $brunoId = $this->actingAs($this->bruno)->postJson('/api/reservations', $this->payload([
            'start_at' => '2030-01-07 14:30:00',
            'end_at' => '2030-01-07 15:30:00',
        ]))->json('id');

        $this->actingAs($this->admin)->postJson("/api/admin/reservations/{$anaId}/approve")
            ->assertOk()
            ->assertJsonPath('reservation.status', 'approved')
            ->assertJsonPath('auto_rejected', 1);

        $this->assertDatabaseHas('reservations', ['id' => $brunoId, 'status' => 'rejected']);

        Notification::assertSentTo($this->ana, ReservationReviewed::class);
        Notification::assertSentTo($this->bruno, ReservationReviewed::class);
    }

    public function test_nao_aprova_se_ja_existe_aprovada_no_horario(): void
    {
        $this->actingAs($this->admin)->postJson('/api/reservations', $this->payload())->assertCreated();

        // Pendente criada direto no banco no mesmo horário (ex.: dados antigos)
        $pending = Reservation::create($this->payload(['user_id' => $this->ana->id]));

        $this->actingAs($this->admin)->postJson("/api/admin/reservations/{$pending->id}/approve")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['reservation']);
    }

    public function test_admin_recusa_com_motivo(): void
    {
        $id = $this->actingAs($this->ana)->postJson('/api/reservations', $this->payload())->json('id');

        $this->actingAs($this->admin)->postJson("/api/admin/reservations/{$id}/reject", ['reason' => 'Sala em manutenção'])
            ->assertOk()
            ->assertJsonPath('status', 'rejected')
            ->assertJsonPath('rejection_reason', 'Sala em manutenção');

        Notification::assertSentTo($this->ana, ReservationReviewed::class);
    }

    public function test_cliente_nao_pode_aprovar_nem_recusar(): void
    {
        $id = $this->actingAs($this->ana)->postJson('/api/reservations', $this->payload())->json('id');

        $this->actingAs($this->ana)->postJson("/api/admin/reservations/{$id}/approve")->assertForbidden();
        $this->actingAs($this->ana)->postJson("/api/admin/reservations/{$id}/reject")->assertForbidden();
    }

    public function test_mudar_horario_de_aprovada_volta_para_pendente(): void
    {
        $reservation = Reservation::create($this->payload(['user_id' => $this->ana->id]));
        $reservation->approve($this->admin);

        // Só o título: continua aprovada
        $this->actingAs($this->ana)->putJson("/api/reservations/{$reservation->id}", $this->payload(['title' => 'Outro título']))
            ->assertOk();
        $this->assertSame('approved', $reservation->fresh()->status->value);

        // Mudou o horário: volta para a fila
        $this->actingAs($this->ana)->putJson("/api/reservations/{$reservation->id}", $this->payload([
            'start_at' => '2030-01-07 16:00:00',
            'end_at' => '2030-01-07 17:00:00',
        ]))->assertOk();
        $this->assertSame('pending', $reservation->fresh()->status->value);
    }

    public function test_contador_e_filtro_de_pendentes(): void
    {
        $this->actingAs($this->ana)->postJson('/api/reservations', $this->payload())->assertCreated();
        $this->actingAs($this->admin)->postJson('/api/reservations', $this->payload([
            'start_at' => '2030-01-08 09:00:00',
            'end_at' => '2030-01-08 10:00:00',
        ]))->assertCreated();

        $this->actingAs($this->admin)->getJson('/api/admin/reservations/pending-count')
            ->assertOk()
            ->assertJsonPath('count', 1);

        $this->actingAs($this->admin)->getJson('/api/admin/reservations?status=pending')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.user.name', 'Ana');
    }
}
