<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;

// Painel admin: gerenciamento de usuários.
// Não tem policy porque todas as rotas já passam pelo middleware 'admin'.
class UserController extends Controller
{
    /**
     * Lista todos os usuários, com a quantidade de reservas de cada um.
     */
    public function index()
    {
        $users = User::withCount('reservations')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

    /**
     * Mostra um usuário com as reservas dele.
     */
    public function show(User $user)
    {
        return response()->json($user->load('reservations.room'));
    }

    /**
     * Atualiza nome, e-mail e papel (role) de um usuário.
     */
    public function update(UserRequest $request, User $user)
    {
        $data = $request->validated();

        // Impede o admin de tirar o próprio acesso de admin
        if ($user->is($request->user()) && ($data['role'] ?? 'admin') !== 'admin') {
            return response()->json(['message' => 'Você não pode remover o seu próprio acesso de administrador.'], 422);
        }

        // forceFill porque 'role' não é fillable. É seguro aqui: $data só tem o que o
        // UserRequest validou (name, email, role) e a rota só é acessível por admin.
        $user->forceFill($data)->save();

        return response()->json($user);
    }

    /**
     * Exclui um usuário (menos a própria conta).
     */
    public function destroy(Request $request, User $user)
    {
        if ($user->is($request->user())) {
            return response()->json(['message' => 'Você não pode excluir a sua própria conta.'], 422);
        }

        $user->delete();

        return response()->noContent();
    }
}
