<?php

namespace App\Services;

use App\Models\Capstone;
use App\Support\CapstoneEmbeddingText;

class CapstoneVectorSync
{
    public function sync(Capstone $capstone): void
    {
        $capstone->load('category');

        $text = CapstoneEmbeddingText::from($capstone);

        $embeddingService = new OllamaEmbedding();
        $qdrant = new QdrantClient();

        $vector = $embeddingService->embed($text);

        $qdrant->ensureCollection();

        $payload = [
            'capstone_id' => $capstone->id,
            'title' => $capstone->title,
            'category_id' => $capstone->category_id,
            'academic_year' => $capstone->academic_year,
            'authors' => $capstone->authors,
            'adviser' => $capstone->adviser,
            'updated_at' => optional($capstone->updated_at)->toIso8601String(),
        ];

        $qdrant->upsert((string) $capstone->id, $vector, $payload);
    }
}
