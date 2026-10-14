<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
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


    public function search(Request $request)
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $term = '%' . $request->string('q')->trim() . '%';

        return response()->json(
            User::whereKeyNot($request->user()->id)
                ->where(
                    fn ($q) => $q
                        ->where('name', 'like', $term)
                        ->orWhere('email', 'like', $term)
                )
                ->orderBy('name')
                ->limit(10)
                ->get(['id', 'name', 'email'])
        );
    }
}
