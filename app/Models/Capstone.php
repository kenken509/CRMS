<?php

// app/Models/Capstone.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Capstone extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'abstract',
        'statement_of_the_problem',
        'objectives',
        'authors',
        'adviser',
        'academic_year',
        'category_id',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}