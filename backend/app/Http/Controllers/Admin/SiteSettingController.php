<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SiteSettingRequest;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

// Painel admin: edição dos textos da landing page e dos dados de contato do footer.
class SiteSettingController extends Controller
{
    public function show()
    {
        return response()->json(SiteSetting::current());
    }

    public function update(SiteSettingRequest $request)
    {
        $settings = SiteSetting::current();

        Gate::authorize('update', $settings);

        $data = $request->settingsData();
        $oldImage = $settings->hero_image_path;

        if ($request->hasFile('hero_image')) {
            $data['hero_image_path'] = $request->file('hero_image')->store('site', 'public');
        } elseif ($request->boolean('remove_hero_image')) {
            $data['hero_image_path'] = null;
        }

        $settings->update($data);

        // Só apaga a imagem antiga depois de salvar, para não perder a imagem se o update falhar
        if ($oldImage && array_key_exists('hero_image_path', $data)) {
            Storage::disk('public')->delete($oldImage);
        }

        return response()->json($settings);
    }
}
