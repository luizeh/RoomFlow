<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

// Conteúdo editável do site: textos da landing page e dados de contato do footer.
// A tabela tem uma linha só; use SiteSetting::current() para pegá-la.
#[Fillable([
    'hero_eyebrow', 'hero_title', 'hero_text', 'hero_image_path',
    'phone', 'whatsapp', 'email', 'address', 'business_hours',
    'instagram_url', 'linkedin_url', 'facebook_url', 'footer_text',
])]
class SiteSetting extends Model
{
    protected $appends = [
        'hero_image_url',
    ];

    /**
     * A linha única de configurações. Se por algum motivo não existir, cria com o título padrão.
     */
    public static function current(): self
    {
        return static::firstOrCreate([], ['hero_title' => 'Sua sala, no seu horário.']);
    }

    /**
     * URL pública da imagem de fundo enviada pelo admin (null = o frontend usa a imagem padrão).
     */
    protected function heroImageUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! $this->hero_image_path) {
                    return null;
                }

                /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
                $disk = Storage::disk('public');

                return $disk->url($this->hero_image_path);
            },
        );
    }
}
