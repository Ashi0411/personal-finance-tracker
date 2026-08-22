<?php

class Dashboard
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getSummary(int $userId): array
    {
        $sql = "SELECT
                    COALESCE(
                        SUM(
                            CASE
                                WHEN type = 'income'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_income,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN type = 'expense'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_expenses

                FROM transactions
                WHERE user_id = :user_id";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':user_id' => $userId
        ]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $totalIncome =
            (float) $result['total_income'];

        $totalExpenses =
            (float) $result['total_expenses'];

        $balance =
            $totalIncome - $totalExpenses;

        return [
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'balance' => $balance
        ];
    }
}