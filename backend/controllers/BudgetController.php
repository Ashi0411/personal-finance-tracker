<?php

/**
 * Budget Controller
 * Personal Finance Tracker
 */

require_once __DIR__ . '/../models/Budget.php';
require_once __DIR__ . '/../models/Category.php';

class BudgetController
{
    private Budget $budget;
    private Category $category;

    public function __construct(PDO $db)
    {
        $this->budget   = new Budget($db);
        $this->category = new Category($db);
    }

    public function create(
        int $userId,
        int $categoryId,
        float $amount,
        string $monthYear
    ): array {
        if ($categoryId <= 0) {
            return ['success' => false, 'message' => 'Valid category is required.'];
        }

        if (!$this->category->findById($categoryId, $userId)) {
            return ['success' => false, 'message' => 'Selected category does not exist.'];
        }

        if ($amount <= 0) {
            return ['success' => false, 'message' => 'Budget limit must be greater than zero.'];
        }

        $monthYear = trim($monthYear);
        if (!preg_match('/^\d{4}-\d{2}$/', $monthYear)) {
            return ['success' => false, 'message' => 'Valid month format (YYYY-MM) is required.'];
        }

        $created = $this->budget->create($userId, $categoryId, $amount, $monthYear);

        return [
            'success' => $created,
            'message' => $created ? 'Budget set successfully.' : 'Failed to set budget.'
        ];
    }

    public function getAll(int $userId, ?string $monthYear = null): array
    {
        $budgets = $this->budget->getAllByUser($userId, $monthYear);

        return [
            'success' => true,
            'budgets' => $budgets
        ];
    }

    public function update(
        int $budgetId,
        int $userId,
        int $categoryId,
        float $amount,
        string $monthYear
    ): array {
        if ($budgetId <= 0) {
            return ['success' => false, 'message' => 'Invalid budget ID.'];
        }

        if ($categoryId <= 0) {
            return ['success' => false, 'message' => 'Valid category is required.'];
        }

        if (!$this->category->findById($categoryId, $userId)) {
            return ['success' => false, 'message' => 'Selected category does not exist.'];
        }

        if ($amount <= 0) {
            return ['success' => false, 'message' => 'Budget limit must be greater than zero.'];
        }

        $monthYear = trim($monthYear);
        if (!preg_match('/^\d{4}-\d{2}$/', $monthYear)) {
            return ['success' => false, 'message' => 'Valid month format (YYYY-MM) is required.'];
        }

        $updated = $this->budget->update($budgetId, $userId, $categoryId, $amount, $monthYear);

        return [
            'success' => $updated,
            'message' => $updated ? 'Budget updated successfully.' : 'Failed to update budget.'
        ];
    }

    public function delete(int $budgetId, int $userId): array
    {
        if ($budgetId <= 0) {
            return ['success' => false, 'message' => 'Invalid budget ID.'];
        }

        $deleted = $this->budget->delete($budgetId, $userId);

        return [
            'success' => $deleted,
            'message' => $deleted ? 'Budget removed successfully.' : 'Failed to delete budget.'
        ];
    }
}
