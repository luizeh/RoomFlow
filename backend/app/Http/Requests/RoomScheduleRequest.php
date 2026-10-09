<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Validator;

/**
 * Período da agenda de uma sala: ?start=2026-10-05&end=2026-10-12
 * (o mesmo intervalo que a agenda do frontend está mostrando).
 */
class RoomScheduleRequest extends FormRequest
{
    /**
     * Maior período aceito numa consulta, para não carregar meses de reservas de uma vez.
     */
    public const MAX_DAYS = 62;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after:start'],
        ];
    }

    public function messages(): array
    {
        return [
            'end.after' => 'O fim do período deve ser depois do início.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                if (Carbon::parse($this->start)->diffInDays(Carbon::parse($this->end)) > self::MAX_DAYS) {
                    $validator->errors()->add('end', 'O período da agenda pode ter no máximo '.self::MAX_DAYS.' dias.');
                }
            },
        ];
    }
}
