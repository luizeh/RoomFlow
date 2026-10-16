<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;

// Conteúdo do site para as telas públicas (landing page e footer): só leitura.
// A edição fica no Admin\SiteSettingController.
class SiteSettingController extends Controller
{
    public function show()
    {
        return response()->json(SiteSetting::current());
    }
}
