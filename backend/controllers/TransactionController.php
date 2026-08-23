<?php

/**
 * Transaction Controller
 * Personal Finance Tracker
 */

require_once __DIR__ . '/../models/Transaction.php';
require_once __DIR__ . '/../models/Category.php';

class TransactionController
{
    private Transaction $transaction;
    private Category $category;

    public function __construct(PDO $db)
    {
        $this->transaction = new Transaction($db);
        $this->category    = new Category($db);
    }

    public function create(
        int $userId,
        int $categoryId,
        float $amount,
        string $type,
        string $description,
        string $transactionDate
    ): array {
        if ($categoryId <= 0) {
            return [
                'success' => false,
                'message' => 'Valid category is required.'
            ];
        }

        // Verify category ownership (Prevent IDOR)
        if (!$this->category->findById($categoryId, $userId)) {
            return [
                'success' => false,
                'message' => 'Selected category does not exist.'
            ];
        }

        if ($amount <= 0) {
            return [
                'success' => false,
                'message' => 'Amount must be greater than zero.'
            ];
        }

        if (!in_array($type, ['income', 'expense'], true)) {
            return [
                'success' => false,
                'message' => 'Transaction type must be income or expense.'
            ];
        }

        $transactionDate = trim($transactionDate);
        if ($transactionDate === '' || !strtotime($transactionDate)) {
            return [
                'success' => false,
                'message' => 'A valid transaction date (YYYY-MM-DD) is required.'
            ];
        }

        $created = $this->transaction->create(
            $userId,
            $categoryId,
            $amount,
            $type,
            trim($description),
            $transactionDate
        );

        return [
            'success' => $created,
            'message' => $created
                ? 'Transaction created successfully.'
                : 'Failed to create transaction.'
        ];
    }

    public function getAll(int $userId): array
    {
        return [
            'success'      => true,
            'transactions' => $this->transaction->getAllByUser($userId)
        ];
    }

    public function getOne(int $transactionId, int $userId): array
    {
        $transaction = $this->transaction->findById($transactionId, $userId);

        if (!$transaction) {
            return [
                'success' => false,
                'message' => 'Transaction not found.'
            ];
        }

        return [
            'success'     => true,
            'transaction' => $transaction
        ];
    }

    public function update(
        int $transactionId,
        int $userId,
        int $categoryId,
        float $amount,
        string $type,
        string $description,
        string $transactionDate
    ): array {
        if ($transactionId <= 0) {
            return [
                'success' => false,
                'message' => 'Invalid transaction ID.'
            ];
        }

        if ($categoryId <= 0) {
            return [
                'success' => false,
                'message' => 'Valid category is required.'
            ];
        }

        // Verify category ownership (Prevent IDOR)
        if (!$this->category->findById($categoryId, $userId)) {
            return [
                'success' => false,
                'message' => 'Selected category does not exist.'
            ];
        }

        if ($amount <= 0) {
            return [
                'success' => false,
                'message' => 'Amount must be greater than zero.'
            ];
        }

        if (!in_array($type, ['income', 'expense'], true)) {
            return [
                'success' => false,
                'message' => 'Transaction type must be income or expense.'
            ];
        }

        $transactionDate = trim($transactionDate);
        if ($transactionDate === '' || !strtotime($transactionDate)) {
            return [
                'success' => false,
                'message' => 'A valid transaction date (YYYY-MM-DD) is required.'
            ];
        }

        $updated = $this->transaction->update(
            $transactionId,
            $userId,
            $categoryId,
            $amount,
            $type,
            trim($description),
            $transactionDate
        );

        return [
            'success' => $updated,
            'message' => $updated
                ? 'Transaction updated successfully.'
                : 'Failed to update transaction.'
        ];
    }

    public function delete(int $transactionId, int $userId): array
    {
        if ($transactionId <= 0) {
            return [
                'success' => false,
                'message' => 'Invalid transaction ID.'
            ];
        }

        $deleted = $this->transaction->delete($transactionId, $userId);

        return [
            'success' => $deleted,
            'message' => $deleted
                ? 'Transaction deleted successfully.'
                : 'Failed to delete transaction.'
        ];
    }
}