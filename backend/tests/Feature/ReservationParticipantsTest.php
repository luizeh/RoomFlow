<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationParticipantsTest extends TestCase
{
    use RefreshDatabase;

    private Room $room;
    private User $host;
    private User $participant;
    private User $outsider;

    protected function setUp(): void
    {
        parent::setUp();

        $this->room = Room::create([
            'name' => 'Sala Atlântico',
            'capacity' => 8,
            'location' => '3º andar',
        ]);

        $this->host = User::factory()->create([
            'name' => 'Ana Organizadora',
        ]);

        $this->participant = User::factory()->create([
            'name' => 'Bruno Participante',
        ]);

        $this->outsider = User::factory()->create([
            'name' => 'Carlos Externo',
        ]);
    }

    private function makeReservation(
        array $attributes = []
    ): Reservation {
        return Reservation::create(array_merge([
            'user_id' => $this->host->id,
            'room_id' => $this->room->id,
            'title' => 'Reunião de planejamento',
            'start_at' => '2030-01-07 14:00:00',
            'end_at' => '2030-01-07 15:00:00',
        ], $attributes));
    }

    private function reservationPayload(
        array $overrides = []
    ): array {
        return array_merge([
            'room_id' => $this->room->id,
            'title' => 'Reunião de planejamento',
            'start_at' => '2030-01-07 16:00:00',
            'end_at' => '2030-01-07 17:00:00',
        ], $overrides);
    }

    public function test_host_cria_reserva_com_participante(): void
    {
        $response = $this->actingAs($this->host)
            ->postJson('/api/reservations', $this->reservationPayload([
                'participant_ids' => [$this->participant->id],
            ]));

        $response->assertCreated()
            ->assertJsonPath('title', 'Reunião de planejamento');

        $reservationId = $response->json('id');

        $this->assertDatabaseHas('reservation_participants', [
            'reservation_id' => $reservationId,
            'user_id' => $this->participant->id,
        ]);

        $this->actingAs($this->participant)
            ->getJson('/api/reservations')
            ->assertOk()
            ->assertJsonPath('0.id', $reservationId);
    }

    public function test_participante_nao_pode_editar_ou_excluir_reserva(): void
    {
        $reservation = $this->makeReservation();

        $reservation->participants()->sync([
            $this->participant->id,
        ]);

        $this->actingAs($this->participant)
            ->putJson(
                "/api/reservations/{$reservation->id}",
                $this->reservationPayload([
                    'title' => 'Tentativa de alteração',
                    'start_at' => '2030-01-07 14:00:00',
                    'end_at' => '2030-01-07 15:00:00',
                ])
            )
            ->assertForbidden();

        $this->actingAs($this->participant)
            ->deleteJson("/api/reservations/{$reservation->id}")
            ->assertForbidden();
    }

    public function test_pessoa_de_fora_nao_pode_visualizar_reserva(): void
    {
        $reservation = $this->makeReservation();

        $this->actingAs($this->outsider)
            ->getJson("/api/reservations/{$reservation->id}")
            ->assertForbidden();
    }

    public function test_host_nao_pode_adicionar_a_si_proprio_como_participante(): void
    {
        $this->actingAs($this->host)
            ->postJson('/api/reservations', $this->reservationPayload([
                'participant_ids' => [$this->host->id],
            ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'participant_ids.0',
            ]);
    }

    public function test_participante_pode_sair_da_reserva(): void
    {
        $reservation = $this->makeReservation();

        $reservation->participants()->sync([
            $this->participant->id,
        ]);

        $this->actingAs($this->participant)
            ->deleteJson(
                "/api/reservations/{$reservation->id}/participation"
            )
            ->assertNoContent();

        $this->assertDatabaseMissing('reservation_participants', [
            'reservation_id' => $reservation->id,
            'user_id' => $this->participant->id,
        ]);

        $this->actingAs($this->participant)
            ->getJson('/api/reservations')
            ->assertOk()
            ->assertJsonCount(0);
    }

    public function test_link_publico_mostra_apenas_dados_permitidos_e_pode_ser_desativado(): void
    {
        $reservation = $this->makeReservation();

        $shareResponse = $this->actingAs($this->host)
            ->postJson("/api/reservations/{$reservation->id}/share");

        $shareResponse->assertOk()
            ->assertJsonStructure(['share_token']);

        $token = $shareResponse->json('share_token');

        $this->assertNotEmpty($token);

        // Simula uma visita pública sem sessão autenticada.
        $this->app['auth']->forgetGuards();

        $publicResponse = $this->getJson(
            "/api/shared-reservations/{$token}"
        );

        $publicResponse->assertOk()
            ->assertJsonPath('host', 'Ana Organizadora')
            ->assertJsonPath('room.name', 'Sala Atlântico');

        $this->assertStringNotContainsString(
            '@',
            $publicResponse->getContent()
        );

        // O host desativa o link.
        $this->actingAs($this->host)
            ->deleteJson("/api/reservations/{$reservation->id}/share")
            ->assertNoContent();

        // O mesmo token não deve funcionar novamente.
        $this->app['auth']->forgetGuards();

        $this->getJson("/api/shared-reservations/{$token}")
            ->assertNotFound();
    }

    public function test_participante_nao_recebe_share_token(): void
    {
        $reservation = $this->makeReservation();

        $reservation->forceFill([
            'share_token' => 'token-secreto-de-teste',
        ])->save();

        $reservation->participants()->sync([
            $this->participant->id,
        ]);

        $this->actingAs($this->participant)
            ->getJson("/api/reservations/{$reservation->id}")
            ->assertOk()
            ->assertJsonMissingPath('share_token');
    }
}
