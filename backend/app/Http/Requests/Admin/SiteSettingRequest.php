<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Edição do conteúdo do site (landing page e footer) pelo admin.
 * Vem como multipart (por causa da imagem), então chega via POST com _method=PUT.
 */
class SiteSettingRequest extends FormRequest
{
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
            'hero_eyebrow' => ['nullable', 'string', 'max:60'],
            'hero_title' => ['required', 'string', 'max:120'],
            'hero_text' => ['nullable', 'string', 'max:600'],
            'hero_image' => ['nullable', 'image', 'max:5120'],
            // true = apaga a imagem enviada e volta para a imagem padrão
            'remove_hero_image' => ['sometimes', 'boolean'],

            'phone' => ['nullable', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string', 'max:200'],
            'business_hours' => ['nullable', 'string', 'max:120'],

            'instagram_url' => ['nullable', 'url', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],

            'footer_text' => ['nullable', 'string', 'max:300'],
        ];
    }

    /**
     * Campos que vão direto para a tabela (a imagem é tratada à parte no controller).
     */
    public function settingsData(): array
    {
        return $this->safe()->except(['hero_image', 'remove_hero_image']);
    }
}
