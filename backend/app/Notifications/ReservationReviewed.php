<?php

namespace App\Notifications;

use App\Enums\ReservationStatus;
use App\Models\Reservation;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// E-mail para o dono da reserva quando o admin aprova ou recusa a solicitação.
class ReservationReviewed extends Notification
{
    public function __construct(public Reservation $reservation)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $reservation = $this->reservation->loadMissing('room');
        $approved = $reservation->status === ReservationStatus::Approved;

        $when = $reservation->start_at->format('d/m/Y').' das '
            .$reservation->start_at->format('H:i').' às '.$reservation->end_at->format('H:i');

        $mail = (new MailMessage)
            ->subject($approved ? 'Sua reserva foi aprovada' : 'Sua solicitação de reserva foi recusada')
            ->greeting('Olá, '.explode(' ', $notifiable->name)[0].'!')
            ->line($approved
                ? 'Sua solicitação de reserva foi aprovada.'
                : 'Infelizmente sua solicitação de reserva foi recusada.')
            ->line('**Sala:** '.$reservation->room->name)
            ->line('**Quando:** '.$when);

        if ($reservation->title) {
            $mail->line('**Título:** '.$reservation->title);
        }

        if (! $approved && $reservation->rejection_reason) {
            $mail->line('**Motivo:** '.$reservation->rejection_reason);
        }

        return $mail
            ->action('Ver reserva', rtrim(config('app.frontend_url'), '/').'/reservations/'.$reservation->id)
            ->salutation('Equipe '.config('app.name'));
    }
}
