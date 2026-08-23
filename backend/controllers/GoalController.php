<?php

/**
 * Goal Controller
 * Personal Finance Tracker
 */

require_once __DIR__ . '/../models/Goal.php';

class GoalController
{
    private Goal $goal;

    public function __construct(PDO $db)
    {
        $this->goal = new Goal($db);
    }

    public function create(
        int $userId,
        string $name,
        float $targetAmount,
        float $currentAmount,
        string $targetDate
    ): array {
        $name = trim($name);
        if ($name === '') {
            return ['success' => false, 'message' => 'Goal name is required.'];
        }

        if ($targetAmount <= 0) {
            return ['success' => false, 'message' => 'Target amount must be greater than zero.'];
        }

        if ($currentAmount < 0) {
            $currentAmount = 0.0;
        }

        $targetDate = trim($targetDate);
        if ($targetDate === '' || !strtotime($targetDate)) {
            return ['success' => false, 'message' => 'Valid target date is required.'];
        }

        $created = $this->goal->create($userId, $name, $targetAmount, $currentAmount, $targetDate);

        return [
            'success' => $created,
            'message' => $created ? 'Financial goal created successfully.' : 'Failed to create goal.'
        ];
    }

    public function getAll(int $userId): array
    {
        return [
            'success' => true,
            'goals'   => $this->goal->getAllByUser($userId)
        ];
    }

    public function update(
        int $goalId,
        int $userId,
        string $name,
        float $targetAmount,
        float $currentAmount,
        string $targetDate,
        string $status
    ): array {
        if ($goalId <= 0) {
            return ['success' => false, 'message' => 'Invalid goal ID.'];
        }

        $name = trim($name);
        if ($name === '') {
            return ['success' => false, 'message' => 'Goal name is required.'];
        }

        if ($targetAmount <= 0) {
            return ['success' => false, 'message' => 'Target amount must be greater than zero.'];
        }

        $targetDate = trim($targetDate);
        if ($targetDate === '' || !strtotime($targetDate)) {
            return ['success' => false, 'message' => 'Valid target date is required.'];
        }

        if (!in_array($status, ['in_progress', 'completed'], true)) {
            $status = ($currentAmount >= $targetAmount) ? 'completed' : 'in_progress';
        }

        $updated = $this->goal->update(
            $goalId,
            $userId,
            $name,
            $targetAmount,
            $currentAmount,
            $targetDate,
            $status
        );

        return [
            'success' => $updated,
            'message' => $updated ? 'Goal updated successfully.' : 'Failed to update goal.'
        ];
    }

    public function deposit(int $goalId, int $userId, float $amount): array
    {
        if ($goalId <= 0) {
            return ['success' => false, 'message' => 'Invalid goal ID.'];
        }

        if ($amount <= 0) {
            return ['success' => false, 'message' => 'Contribution amount must be greater than zero.'];
        }

        $deposited = $this->goal->deposit($goalId, $userId, $amount);

        return [
            'success' => $deposited,
            'message' => $deposited ? 'Contribution added to goal!' : 'Failed to add contribution.'
        ];
    }

    public function delete(int $goalId, int $userId): array
    {
        if ($goalId <= 0) {
            return ['success' => false, 'message' => 'Invalid goal ID.'];
        }

        $deleted = $this->goal->delete($goalId, $userId);

        return [
            'success' => $deleted,
            'message' => $deleted ? 'Goal deleted successfully.' : 'Failed to delete goal.'
        ];
    }
}
