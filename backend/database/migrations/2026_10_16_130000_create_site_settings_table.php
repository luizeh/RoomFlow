<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Conteúdo editável do site (landing page e footer). A tabela tem uma linha só.
     */
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();

            // Landing page
            $table->string('hero_eyebrow', 60)->nullable();
            $table->string('hero_title', 120);
            $table->text('hero_text')->nullable();
            $table->string('hero_image_path')->nullable();

            // Contato (footer)
            $table->string('phone', 30)->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('address', 200)->nullable();
            $table->string('business_hours', 120)->nullable();

            // Redes sociais (footer)
            $table->string('instagram_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('facebook_url')->nullable();

            $table->string('footer_text', 300)->nullable();

            $table->timestamps();
        });

        // Já cria a linha única com os textos que estavam fixos na landing
        DB::table('site_settings')->insert([
            'hero_eyebrow' => 'Reservas sem conflito',
            'hero_title' => 'Sua sala, no seu horário.',
            'hero_text' => 'Com o RoomFlow você encontra a sala ideal, confere a agenda em tempo real e solicita sua reserva em poucos cliques — sem planilhas, sem choque de horários.',
            'footer_text' => 'Reserva de salas de reunião simples e organizada.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
