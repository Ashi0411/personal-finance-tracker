<?php

/**
 * Budget Model
 * Personal Finance Tracker
 */

class Budget
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function create(
        int $userId,
        int $categoryId,
        float $amount,
        string $monthYear
    ): bool {
        $sql = "INSERT INTO budgets (user_id, category_id, amount, month_year)
                VALUES (:user_id, :category_id, :amount, :month_year)
                ON DUPLICATE KEY UPDATE amount = :amount_update";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':user_id'       => $userId,
            ':category_id'   => $categoryId,
            ':amount'        => $amount,
            ':month_year'    => $monthYear,
            ':amount_update' => $amount
        ]);
    }

    public function getAllByUser(int $userId, ?string $monthYear = null): array
    {
        $currentMonth = $monthYear ?: date('Y-m');

        $sql = "SELECT
                    b.budget_id,
                    b.user_id,
                    b.category_id,
                    c.name AS category_name,
                    b.amount AS budget_limit,
                    b.month_year,
                    COALESCE(SUM(t.amount), 0) AS total_spent
                FROM budgets b
                INNER JOIN categories c
                    ON b.category_id = c.category_id
                LEFT JOIN transactions t
                    ON t.user_id = b.user_id
                    AND t.category_id = b.category_id
                    AND t.type = 'expense'
                    AND DATE_FORMAT(t.transaction_date, '%Y-%m') = b.month_year
                WHERE b.user_id = :user_id
                  AND b.month_year = :month_year
                GROUP BY b.budget_id, b.user_id, b.category_id, c.name, b.amount, b.month_year
                ORDER BY c.name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':user_id'    => $userId,
            ':month_year' => $currentMonth
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $budgetId, int $userId): ?array
    {
        $sql = "SELECT b.*, c.name AS category_name
                FROM budgets b
                INNER JOIN categories c ON b.category_id = c.category_id
                WHERE b.budget_id = :budget_id AND b.user_id = :user_id
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':budget_id' => $budgetId,
            ':user_id'   => $userId
        ]);

        $budget = $stmt->fetch(PDO::FETCH_ASSOC);
        return $budget ?: null;
    }

    public function update(
        int $budgetId,
        int $userId,
        int $categoryId,
        float $amount,
        string $monthYear
    ): bool {
        $sql = "UPDATE budgets
                SET category_id = :category_id,
                    amount = :amount,
                    month_year = :month_year
                WHERE budget_id = :budget_id AND user_id = :user_id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':category_id' => $categoryId,
            ':amount'      => $amount,
            ':month_year'  => $monthYear,
            ':budget_id'   => $budgetId,
            ':user_id'     => $userId
        ]);
    }

    public function delete(int $budgetId, int $userId): bool
    {
        $sql = "DELETE FROM budgets
                WHERE budget_id = :budget_id AND user_id = :user_id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':budget_id' => $budgetId,
            ':user_id'   => $userId
        ]);
    }
}
