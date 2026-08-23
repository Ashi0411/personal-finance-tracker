<?php

/**
 * Goal Model
 * Personal Finance Tracker
 */

class Goal
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function create(
        int $userId,
        string $name,
        float $targetAmount,
        float $currentAmount,
        string $targetDate
    ): bool {
        $status = ($currentAmount >= $targetAmount) ? 'completed' : 'in_progress';

        $sql = "INSERT INTO goals (user_id, name, target_amount, current_amount, target_date, status)
                VALUES (:user_id, :name, :target_amount, :current_amount, :target_date, :status)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':user_id'        => $userId,
            ':name'           => $name,
            ':target_amount'  => $targetAmount,
            ':current_amount' => $currentAmount,
            ':target_date'    => $targetDate,
            ':status'         => $status
        ]);
    }

    public function getAllByUser(int $userId): array
    {
        $sql = "SELECT *
                FROM goals
                WHERE user_id = :user_id
                ORDER BY (status = 'in_progress') DESC, target_date ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':user_id' => $userId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $goalId, int $userId): ?array
    {
        $sql = "SELECT *
                FROM goals
                WHERE goal_id = :goal_id AND user_id = :user_id
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':goal_id' => $goalId,
            ':user_id' => $userId
        ]);

        $goal = $stmt->fetch(PDO::FETCH_ASSOC);
        return $goal ?: null;
    }

    public function update(
        int $goalId,
        int $userId,
        string $name,
        float $targetAmount,
        float $currentAmount,
        string $targetDate,
        string $status
    ): bool {
        $sql = "UPDATE goals
                SET name = :name,
                    target_amount = :target_amount,
                    current_amount = :current_amount,
                    target_date = :target_date,
                    status = :status
                WHERE goal_id = :goal_id AND user_id = :user_id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':name'           => $name,
            ':target_amount'  => $targetAmount,
            ':current_amount' => $currentAmount,
            ':target_date'    => $targetDate,
            ':status'         => $status,
            ':goal_id'        => $goalId,
            ':user_id'        => $userId
        ]);
    }

    public function deposit(int $goalId, int $userId, float $amount): bool
    {
        $goal = $this->findById($goalId, $userId);
        if (!$goal) return false;

        $newAmount = (float) $goal['current_amount'] + $amount;
        $targetAmount = (float) $goal['target_amount'];
        $newStatus = ($newAmount >= $targetAmount) ? 'completed' : 'in_progress';

        $sql = "UPDATE goals
                SET current_amount = :current_amount,
                    status = :status
                WHERE goal_id = :goal_id AND user_id = :user_id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':current_amount' => $newAmount,
            ':status'         => $newStatus,
            ':goal_id'        => $goalId,
            ':user_id'        => $userId
        ]);
    }

    public function delete(int $goalId, int $userId): bool
    {
        $sql = "DELETE FROM goals
                WHERE goal_id = :goal_id AND user_id = :user_id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':goal_id' => $goalId,
            ':user_id' => $userId
        ]);
    }
}
