<?php

class Dashboard
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getSummary(int $userId, ?string $monthYear = null): array
    {
        if (!$monthYear || !preg_match('/^\d{4}-\d{2}$/', $monthYear)) {
            $monthYear = date('Y-m');
        }

        // 1. Current Month Totals
        $sqlMonth = "SELECT
                        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS month_income,
                        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS month_expenses
                     FROM transactions
                     WHERE user_id = :user_id
                       AND DATE_FORMAT(transaction_date, '%Y-%m') = :month_year";

        $stmtMonth = $this->db->prepare($sqlMonth);
        $stmtMonth->execute([
            ':user_id'    => $userId,
            ':month_year' => $monthYear
        ]);

        $monthResult = $stmtMonth->fetch(PDO::FETCH_ASSOC);
        $monthIncome = (float) ($monthResult['month_income'] ?? 0);
        $monthExpenses = (float) ($monthResult['month_expenses'] ?? 0);
        $monthBalance = $monthIncome - $monthExpenses;

        // 2. All-Time Cumulative Totals
        $sqlAllTime = "SELECT
                        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS all_income,
                        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS all_expenses
                       FROM transactions
                       WHERE user_id = :user_id";

        $stmtAll = $this->db->prepare($sqlAllTime);
        $stmtAll->execute([':user_id' => $userId]);
        $allResult = $stmtAll->fetch(PDO::FETCH_ASSOC);

        $allIncome = (float) ($allResult['all_income'] ?? 0);
        $allExpenses = (float) ($allResult['all_expenses'] ?? 0);
        $allBalance = $allIncome - $allExpenses;

        // Format label (e.g. "August 2026")
        $dateTime = DateTime::createFromFormat('Y-m', $monthYear);
        $monthLabel = $dateTime ? $dateTime->format('F Y') : $monthYear;

        return [
            'month_year'        => $monthYear,
            'month_label'       => $monthLabel,
            'total_income'      => $monthIncome,
            'total_expenses'    => $monthExpenses,
            'balance'           => $monthBalance,
            'all_time_income'   => $allIncome,
            'all_time_expenses' => $allExpenses,
            'all_time_balance'  => $allBalance
        ];
    }
}