<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileRequest;

// Perfil do usuário logado: ele só mexe na própria conta.
// Para LER os dados do usuário logado, o frontend usa GET /api/user (AuthController).
// Gerenciar outros usuários fica no Admin\UserController.
class UserController extends Controller
{
    /**
     * Atualiza nome, e-mail e, se enviada, a senha do usuário logado.
     */
    public function update(ProfileRequest $request)
    {
        $user = $request->user();

        $user->update($request->validated());

        return response()->json($user);
    }
}
