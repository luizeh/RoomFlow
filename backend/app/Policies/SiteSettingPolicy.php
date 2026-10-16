<?php

namespace App\Policies;

use App\Models\SiteSetting;
use App\Models\User;

class SiteSettingPolicy
{
    /**
     * Só admin edita o conteúdo do site.
     */
    public function update(User $user, SiteSetting $settings): bool
    {
        return $user->role === 'admin';
    }
}
