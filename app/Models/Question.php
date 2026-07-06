<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $guarded = [];

    // Cast kolom options menjadi array (dari JSON)
    protected function casts(): array
    {
        return [
            'options' => 'array',
        ];
    }
}
