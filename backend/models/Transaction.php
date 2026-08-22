<?php

class Transaction
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
        string $type,
        string $description,
        string $transactionDate
    ): bool {

        $sql = "INSERT INTO transactions
                (
                    user_id,
                    category_id,
                    amount,
                    type,
                    description,
                    transaction_date
                )
                VALUES
                (
                    :user_id,
                    :category_id,
                    :amount,
                    :type,
                    :description,
                    :transaction_date
                )";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':user_id' => $userId,
            ':category_id' => $categoryId,
            ':amount' => $amount,
            ':type' => $type,
            ':description' => $description,
            ':transaction_date' => $transactionDate
        ]);
    }

    public function getAllByUser(int $userId): array
    {
        $sql = "SELECT
                    t.transaction_id,
                    t.category_id,
                    c.name AS category_name,
                    t.amount,
                    t.type,
                    t.description,
                    t.transaction_date,
                    t.created_at
                FROM transactions t
                LEFT JOIN categories c
                    ON t.category_id = c.category_id
                WHERE t.user_id = :user_id
                ORDER BY t.transaction_date DESC,
                         t.transaction_id DESC";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':user_id' => $userId
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(
        int $transactionId,
        int $userId
    ): ?array {

        $sql = "SELECT
                    t.transaction_id,
                    t.category_id,
                    c.name AS category_name,
                    t.amount,
                    t.type,
                    t.description,
                    t.transaction_date,
                    t.created_at
                FROM transactions t
                LEFT JOIN categories c
                    ON t.category_id = c.category_id
                WHERE t.transaction_id = :transaction_id
                AND t.user_id = :user_id
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':transaction_id' => $transactionId,
            ':user_id' => $userId
        ]);

        $transaction = $stmt->fetch(PDO::FETCH_ASSOC);

        return $transaction ?: null;
    }

    public function update(
        int $transactionId,
        int $userId,
        int $categoryId,
        float $amount,
        string $type,
        string $description,
        string $transactionDate
    ): bool {

        $sql = "UPDATE transactions
                SET
                    category_id = :category_id,
                    amount = :amount,
                    type = :type,
                    description = :description,
                    transaction_date = :transaction_date
                WHERE transaction_id = :transaction_id
                AND user_id = :user_id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':category_id' => $categoryId,
            ':amount' => $amount,
            ':type' => $type,
            ':description' => $description,
            ':transaction_date' => $transactionDate,
            ':transaction_id' => $transactionId,
            ':user_id' => $userId
        ]);
    }

    public function delete(
        int $transactionId,
        int $userId
    ): bool {

        $sql = "DELETE FROM transactions
                WHERE transaction_id = :transaction_id
                AND user_id = :user_id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':transaction_id' => $transactionId,
            ':user_id' => $userId
        ]);
    }
}