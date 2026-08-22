<?php

require_once __DIR__ . '/../models/Category.php';

class CategoryController
{
    private Category $category;

    public function __construct(PDO $db)
    {
        $this->category = new Category($db);
    }

    public function create(int $userId, string $name): array
    {
        if (trim($name) === '') {
            return [
                'success' => false,
                'message' => 'Category name is required.'
            ];
        }

        $created = $this->category->create($userId, trim($name));

        return [
            'success' => $created,
            'message' => $created
                ? 'Category created successfully.'
                : 'Failed to create category.'
        ];
    }

    public function getAll(int $userId): array
    {
        return [
            'success' => true,
            'categories' => $this->category->getAllByUser($userId)
        ];
    }

    public function getOne(int $categoryId, int $userId): array
    {
        $category = $this->category->findById($categoryId, $userId);

        if (!$category) {
            return [
                'success' => false,
                'message' => 'Category not found.'
            ];
        }

        return [
            'success' => true,
            'category' => $category
        ];
    }

    public function update(
        int $categoryId,
        int $userId,
        string $name
    ): array {
        if (trim($name) === '') {
            return [
                'success' => false,
                'message' => 'Category name is required.'
            ];
        }

        $updated = $this->category->update(
            $categoryId,
            $userId,
            trim($name)
        );

        return [
            'success' => $updated,
            'message' => $updated
                ? 'Category updated successfully.'
                : 'Failed to update category.'
        ];
    }

    public function delete(int $categoryId, int $userId): array
    {
        $deleted = $this->category->delete(
            $categoryId,
            $userId
        );

        return [
            'success' => $deleted,
            'message' => $deleted
                ? 'Category deleted successfully.'
                : 'Failed to delete category.'
        ];
    }
}