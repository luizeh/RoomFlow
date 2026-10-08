<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use App\Models\Reservation;

class ReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Admin: cria e edita em qualquer data/hora (só precisa fim depois do início).
     * Usuário comum:
     *  - Criação: a reserva precisa começar no futuro.
     *  - Edição: o início pode já ter passado (ex.: estender uma reunião em andamento),
     *    mas o fim não pode ficar no passado.
     * A regra de conflito de sala (after) vale para todos.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isUpdate = $this->route('reservation') !== null;
        $isAdmin = $this->user()?->role === 'admin';

        $startAt = ['required', 'date'];
        $endAt = ['required', 'date', 'after:start_at'];

        if (! $isAdmin) {
            if ($isUpdate) {
                $endAt[] = 'after_or_equal:now';
            } else {
                $startAt[] = 'after:now';
            }
        }

        return [
            'room_id' => ['required', 'exists:rooms,id'],
            'start_at' => $startAt,
            'end_at' => $endAt,
        ];
    }

    public function messages(): array
    {
        return [
            'start_at.after' => 'A reserva não pode começar no passado.',
            'end_at.after' => 'O fim da reserva deve ser depois do início.',
            'end_at.after_or_equal' => 'O fim da reserva não pode ficar no passado.',
        ];
    }

    /**
     * Regra de conflito: roda depois das regras acima.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                // Se as regras básicas já falharam (data inválida, sala inexistente...),
                // não faz sentido consultar o banco com esses valores.
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $query = Reservation::where('room_id', $this->room_id)
                    ->where('start_at', '<', $this->end_at)
                    ->where('end_at', '>', $this->start_at);

                // Na edição, a própria reserva não conta como conflito
                if ($this->route('reservation')) {
                    $query->where('id', '!=', $this->route('reservation')->id);
                }

                if ($query->exists()) {
                    $validator->errors()->add(
                        'start_at',
                        'A sala já está reservada nesse período.'
                    );
                }
            },
        ];
    }
}
