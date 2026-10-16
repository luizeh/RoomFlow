<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SiteSettingTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        return $admin;
    }

    public function test_visitante_le_o_conteudo_do_site(): void
    {
        // A migration já cria a linha com os textos padrão
        $this->getJson('/api/site-settings')
            ->assertOk()
            ->assertJsonPath('hero_title', 'Sua sala, no seu horário.')
            ->assertJsonPath('hero_image_url', null);
    }

    public function test_admin_edita_textos_e_contatos(): void
    {
        $this->actingAs($this->admin())->putJson('/api/admin/site-settings', [
            'hero_title' => 'Novo título',
            'phone' => '(44) 3333-4444',
            'instagram_url' => 'https://instagram.com/roomflow',
        ])->assertOk()->assertJsonPath('hero_title', 'Novo título');

        $this->getJson('/api/site-settings')
            ->assertJsonPath('phone', '(44) 3333-4444')
            ->assertJsonPath('instagram_url', 'https://instagram.com/roomflow');
    }

    public function test_admin_envia_e_remove_imagem_de_fundo(): void
    {
        Storage::fake('public');
        $admin = $this->admin();

        $this->actingAs($admin)->post('/api/admin/site-settings', [
            '_method' => 'PUT',
            'hero_title' => 'Título',
            // PNG real de 1x1 pixel (fake()->image() precisaria da extensão GD, que o container não tem)
            'hero_image' => UploadedFile::fake()->createWithContent(
                'fundo.png',
                base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')
            ),
        ], ['Accept' => 'application/json'])->assertOk();

        $path = SiteSetting::current()->hero_image_path;
        Storage::disk('public')->assertExists($path);

        $this->actingAs($admin)->putJson('/api/admin/site-settings', [
            'hero_title' => 'Título',
            'remove_hero_image' => true,
        ])->assertOk()->assertJsonPath('hero_image_url', null);

        Storage::disk('public')->assertMissing($path);
    }

    public function test_valida_os_campos(): void
    {
        $this->actingAs($this->admin())->putJson('/api/admin/site-settings', [
            'hero_title' => '',
            'email' => 'nao-e-email',
            'linkedin_url' => 'sem-http',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['hero_title', 'email', 'linkedin_url']);
    }

    public function test_cliente_nao_edita(): void
    {
        $this->actingAs(User::factory()->create())
            ->putJson('/api/admin/site-settings', ['hero_title' => 'Hack'])
            ->assertForbidden();
    }
}
