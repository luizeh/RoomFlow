<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Avisos do site (sininho). Aqui não usamos Notification::fake(): queremos o aviso salvo de verdade no banco.
class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $ana;
    private Reservation $reservation;

    protected function setUp(): void
    {
        parent::setUp();

        $room = Room::create(['name' => 'Sala Atlântico', 'capacity' => 8, 'location' => '3º andar']);

        $this->admin = User::factory()->create();
        $this->admin->forceFill(['role' => 'admin'])->save();

        $this->ana = User::factory()->create(['name' => 'Ana']);

        $this->reservation = Reservation::create([
            'user_id' => $this->ana->id,
            'room_id' => $room->id,
            'title' => 'Reunião',
            'start_at' => '2030-01-07 14:00:00',
            'end_at' => '2030-01-07 15:00:00',
        ]);
    }

    public function test_aprovar_cria_aviso_no_site_para_o_dono(): void
    {
        $this->actingAs($this->admin)->postJson("/api/admin/reservations/{$this->reservation->id}/approve")->assertOk();

        $this->actingAs($this->ana)->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('notifications.0.data.status', 'approved')
            ->assertJsonPath('notifications.0.data.reservation_id', $this->reservation->id)
            ->assertJsonPath('notifications.0.data.message', 'Sua reserva na Sala Atlântico foi aprovada.')
            ->assertJsonPath('notifications.0.read_at', null);
    }

    public function test_recusa_salva_o_motivo_no_aviso(): void
    {
        $this->actingAs($this->admin)->postJson("/api/admin/reservations/{$this->reservation->id}/reject", ['reason' => 'Manutenção'])->assertOk();

        $this->actingAs($this->ana)->getJson('/api/notifications')
            ->assertJsonPath('notifications.0.data.status', 'rejected')
            ->assertJsonPath('notifications.0.data.rejection_reason', 'Manutenção');
    }

    public function test_marcar_como_lido_um_e_todos(): void
    {
        $this->reservation->reject($this->admin);
        $this->reservation->notifyOwner();
        $this->reservation->approve($this->admin);
        $this->reservation->notifyOwner();

        $id = $this->actingAs($this->ana)->getJson('/api/notifications')
            ->assertJsonPath('unread_count', 2)
            ->json('notifications.0.id');

        $this->actingAs($this->ana)->postJson("/api/notifications/{$id}/read")->assertNoContent();
        $this->actingAs($this->ana)->getJson('/api/notifications')->assertJsonPath('unread_count', 1);

        $this->actingAs($this->ana)->postJson('/api/notifications/read-all')->assertNoContent();
        $this->actingAs($this->ana)->getJson('/api/notifications')->assertJsonPath('unread_count', 0);
    }

    public function test_nao_ve_nem_marca_aviso_de_outra_pessoa(): void
    {
        $this->reservation->approve($this->admin);
        $this->reservation->notifyOwner();
        $id = $this->ana->notifications()->first()->id;

        $outro = User::factory()->create();

        $this->actingAs($outro)->getJson('/api/notifications')
            ->assertJsonPath('unread_count', 0)
            ->assertJsonCount(0, 'notifications');

        $this->actingAs($outro)->postJson("/api/notifications/{$id}/read")->assertNotFound();
    }

    public function test_visitante_sem_login_nao_acessa(): void
    {
        $this->getJson('/api/notifications')->assertUnauthorized();
    }
}
