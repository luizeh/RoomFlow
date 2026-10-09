<?php

use Illuminate\Support\Facades\Route;

// O backend é só API: as telas ficam no frontend React.
// Esta rota existe apenas para indicar que a API está no ar ao abrir http://localhost:8000.
Route::get('/', function () {
    return response()->json(['name' => 'RoomFlow API']);
});
