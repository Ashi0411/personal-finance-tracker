<?php

/**
 * Report Controller
 * Personal Finance Tracker
 */

class ReportController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getMonthlyReport(int $userId, string $monthYear): array
    {
        $monthYear = trim($monthYear);
        if (!preg_match('/^\d{4}-\d{2}$/', $monthYear)) {
            $monthYear = date('Y-m');
        }

        // 1. Fetch User Info
        $user = $this->getUserInfo($userId);

        // 2. Fetch Aggregated Monthly Totals
        $totalsSql = "SELECT 
                        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
                        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
                        COUNT(*) AS total_transactions
                      FROM transactions
                      WHERE user_id = :user_id
                        AND DATE_FORMAT(transaction_date, '%Y-%m') = :month_year";
        
        $totalsStmt = $this->db->prepare($totalsSql);
        $totalsStmt->execute([':user_id' => $userId, ':month_year' => $monthYear]);
        $totals = $totalsStmt->fetch(PDO::FETCH_ASSOC);

        $totalIncome = (float) $totals['total_income'];
        $totalExpenses = (float) $totals['total_expenses'];
        $netSavings = $totalIncome - $totalExpenses;
        $savingsRate = ($totalIncome > 0) ? round(($netSavings / $totalIncome) * 100, 1) : 0.0;

        // 3. Category Breakdown (Expenses)
        $catExpenseSql = "SELECT 
                            c.name AS category_name,
                            COALESCE(SUM(t.amount), 0) AS total_amount,
                            COUNT(t.transaction_id) AS transaction_count
                          FROM categories c
                          INNER JOIN transactions t ON c.category_id = t.category_id
                          WHERE t.user_id = :user_id
                            AND t.type = 'expense'
                            AND DATE_FORMAT(t.transaction_date, '%Y-%m') = :month_year
                          GROUP BY c.category_id, c.name
                          ORDER BY total_amount DESC";
        
        $catExpStmt = $this->db->prepare($catExpenseSql);
        $catExpStmt->execute([':user_id' => $userId, ':month_year' => $monthYear]);
        $expenseCategories = $catExpStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($expenseCategories as &$cat) {
            $amt = (float) $cat['total_amount'];
            $cat['percentage'] = ($totalExpenses > 0) ? round(($amt / $totalExpenses) * 100, 1) : 0.0;
        }
        unset($cat);

        // 4. Category Breakdown (Income)
        $catIncomeSql = "SELECT 
                            c.name AS category_name,
                            COALESCE(SUM(t.amount), 0) AS total_amount,
                            COUNT(t.transaction_id) AS transaction_count
                          FROM categories c
                          INNER JOIN transactions t ON c.category_id = t.category_id
                          WHERE t.user_id = :user_id
                            AND t.type = 'income'
                            AND DATE_FORMAT(t.transaction_date, '%Y-%m') = :month_year
                          GROUP BY c.category_id, c.name
                          ORDER BY total_amount DESC";

        $catIncStmt = $this->db->prepare($catIncomeSql);
        $catIncStmt->execute([':user_id' => $userId, ':month_year' => $monthYear]);
        $incomeCategories = $catIncStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($incomeCategories as &$cat) {
            $amt = (float) $cat['total_amount'];
            $cat['percentage'] = ($totalIncome > 0) ? round(($amt / $totalIncome) * 100, 1) : 0.0;
        }
        unset($cat);

        // 5. Budget Adherence Comparison
        $budgetSql = "SELECT 
                        b.budget_id,
                        c.name AS category_name,
                        b.amount AS budget_limit,
                        COALESCE(SUM(t.amount), 0) AS total_spent
                      FROM budgets b
                      INNER JOIN categories c ON b.category_id = c.category_id
                      LEFT JOIN transactions t ON t.user_id = b.user_id 
                                               AND t.category_id = b.category_id
                                               AND t.type = 'expense'
                                               AND DATE_FORMAT(t.transaction_date, '%Y-%m') = b.month_year
                      WHERE b.user_id = :user_id
                        AND b.month_year = :month_year
                      GROUP BY b.budget_id, c.name, b.amount";

        $budgetStmt = $this->db->prepare($budgetSql);
        $budgetStmt->execute([':user_id' => $userId, ':month_year' => $monthYear]);
        $budgets = $budgetStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($budgets as &$b) {
            $limit = (float) $b['budget_limit'];
            $spent = (float) $b['total_spent'];
            $b['percentage_used'] = ($limit > 0) ? round(($spent / $limit) * 100, 1) : 0.0;
            $b['status'] = ($spent > $limit) ? 'over_budget' : 'within_budget';
        }
        unset($b);

        // 6. Itemized Transactions Statement
        $txSql = "SELECT 
                    t.transaction_id,
                    t.amount,
                    t.type,
                    t.description,
                    t.transaction_date,
                    c.name AS category_name
                  FROM transactions t
                  LEFT JOIN categories c ON t.category_id = c.category_id
                  WHERE t.user_id = :user_id
                    AND DATE_FORMAT(t.transaction_date, '%Y-%m') = :month_year
                  ORDER BY t.transaction_date DESC, t.transaction_id DESC";

        $txStmt = $this->db->prepare($txSql);
        $txStmt->execute([':user_id' => $userId, ':month_year' => $monthYear]);
        $transactions = $txStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'success' => true,
            'report'  => [
                'type'                 => 'monthly',
                'month_year'           => $monthYear,
                'generated_at'         => date('Y-m-d H:i:s'),
                'user'                 => $user,
                'summary'              => [
                    'total_income'       => $totalIncome,
                    'total_expenses'     => $totalExpenses,
                    'net_savings'        => $netSavings,
                    'savings_rate'       => $savingsRate,
                    'transaction_count'  => (int) $totals['total_transactions']
                ],
                'expense_categories'   => $expenseCategories,
                'income_categories'    => $incomeCategories,
                'budget_adherence'     => $budgets,
                'transactions'         => $transactions
            ]
        ];
    }

    public function getYearlyReport(int $userId, string $year): array
    {
        $year = trim($year);
        if (!preg_match('/^\d{4}$/', $year)) {
            $year = date('Y');
        }

        $user = $this->getUserInfo($userId);

        // 1. Annual Totals
        $totalsSql = "SELECT 
                        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
                        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
                        COUNT(*) AS total_transactions
                      FROM transactions
                      WHERE user_id = :user_id
                        AND DATE_FORMAT(transaction_date, '%Y') = :year";

        $totalsStmt = $this->db->prepare($totalsSql);
        $totalsStmt->execute([':user_id' => $userId, ':year' => $year]);
        $totals = $totalsStmt->fetch(PDO::FETCH_ASSOC);

        $totalIncome = (float) $totals['total_income'];
        $totalExpenses = (float) $totals['total_expenses'];
        $netSavings = $totalIncome - $totalExpenses;
        $savingsRate = ($totalIncome > 0) ? round(($netSavings / $totalIncome) * 100, 1) : 0.0;

        // 2. 12-Month Progression Breakdown
        $monthNames = [
            '01' => 'January', '02' => 'February', '03' => 'March',
            '04' => 'April', '05' => 'May', '06' => 'June',
            '07' => 'July', '08' => 'August', '09' => 'September',
            '10' => 'October', '11' => 'November', '12' => 'December'
        ];

        $monthlyBreakdownSql = "SELECT 
                                    DATE_FORMAT(transaction_date, '%m') AS month_num,
                                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
                                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses,
                                    COUNT(*) AS tx_count
                                FROM transactions
                                WHERE user_id = :user_id
                                  AND DATE_FORMAT(transaction_date, '%Y') = :year
                                GROUP BY month_num
                                ORDER BY month_num ASC";

        $mbStmt = $this->db->prepare($monthlyBreakdownSql);
        $mbStmt->execute([':user_id' => $userId, ':year' => $year]);
        $rawMonths = $mbStmt->fetchAll(PDO::FETCH_ASSOC);

        $monthsMap = [];
        foreach ($rawMonths as $rm) {
            $monthsMap[$rm['month_num']] = $rm;
        }

        $monthlyTimeline = [];
        foreach ($monthNames as $num => $name) {
            $mIncome = isset($monthsMap[$num]) ? (float) $monthsMap[$num]['income'] : 0.0;
            $mExpenses = isset($monthsMap[$num]) ? (float) $monthsMap[$num]['expenses'] : 0.0;
            $mNet = $mIncome - $mExpenses;
            $mCount = isset($monthsMap[$num]) ? (int) $monthsMap[$num]['tx_count'] : 0;

            $monthlyTimeline[] = [
                'month_num'   => $num,
                'month_name'  => $name,
                'month_year'  => "{$year}-{$num}",
                'income'      => $mIncome,
                'expenses'    => $mExpenses,
                'net_savings' => $mNet,
                'tx_count'    => $mCount
            ];
        }

        // 3. Annual Category Breakdown (Expenses)
        $catExpenseSql = "SELECT 
                            c.name AS category_name,
                            COALESCE(SUM(t.amount), 0) AS total_amount,
                            COUNT(t.transaction_id) AS transaction_count
                          FROM categories c
                          INNER JOIN transactions t ON c.category_id = t.category_id
                          WHERE t.user_id = :user_id
                            AND t.type = 'expense'
                            AND DATE_FORMAT(t.transaction_date, '%Y') = :year
                          GROUP BY c.category_id, c.name
                          ORDER BY total_amount DESC";

        $catExpStmt = $this->db->prepare($catExpenseSql);
        $catExpStmt->execute([':user_id' => $userId, ':year' => $year]);
        $expenseCategories = $catExpStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($expenseCategories as &$cat) {
            $amt = (float) $cat['total_amount'];
            $cat['percentage'] = ($totalExpenses > 0) ? round(($amt / $totalExpenses) * 100, 1) : 0.0;
        }
        unset($cat);

        // 4. Annual Category Breakdown (Income)
        $catIncomeSql = "SELECT 
                            c.name AS category_name,
                            COALESCE(SUM(t.amount), 0) AS total_amount,
                            COUNT(t.transaction_id) AS transaction_count
                          FROM categories c
                          INNER JOIN transactions t ON c.category_id = t.category_id
                          WHERE t.user_id = :user_id
                            AND t.type = 'income'
                            AND DATE_FORMAT(t.transaction_date, '%Y') = :year
                          GROUP BY c.category_id, c.name
                          ORDER BY total_amount DESC";

        $catIncStmt = $this->db->prepare($catIncomeSql);
        $catIncStmt->execute([':user_id' => $userId, ':year' => $year]);
        $incomeCategories = $catIncStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($incomeCategories as &$cat) {
            $amt = (float) $cat['total_amount'];
            $cat['percentage'] = ($totalIncome > 0) ? round(($amt / $totalIncome) * 100, 1) : 0.0;
        }
        unset($cat);

        // 5. Itemized Transactions (Top recent in the year)
        $txSql = "SELECT 
                    t.transaction_id,
                    t.amount,
                    t.type,
                    t.description,
                    t.transaction_date,
                    c.name AS category_name
                  FROM transactions t
                  LEFT JOIN categories c ON t.category_id = c.category_id
                  WHERE t.user_id = :user_id
                    AND DATE_FORMAT(t.transaction_date, '%Y') = :year
                  ORDER BY t.transaction_date DESC, t.transaction_id DESC";

        $txStmt = $this->db->prepare($txSql);
        $txStmt->execute([':user_id' => $userId, ':year' => $year]);
        $transactions = $txStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'success' => true,
            'report'  => [
                'type'                 => 'yearly',
                'year'                 => $year,
                'generated_at'         => date('Y-m-d H:i:s'),
                'user'                 => $user,
                'summary'              => [
                    'total_income'       => $totalIncome,
                    'total_expenses'     => $totalExpenses,
                    'net_savings'        => $netSavings,
                    'savings_rate'       => $savingsRate,
                    'transaction_count'  => (int) $totals['total_transactions']
                ],
                'monthly_timeline'     => $monthlyTimeline,
                'expense_categories'   => $expenseCategories,
                'income_categories'    => $incomeCategories,
                'transactions'         => $transactions
            ]
        ];
    }

    private function getUserInfo(int $userId): array
    {
        $userStmt = $this->db->prepare("SELECT name, email FROM users WHERE user_id = :user_id LIMIT 1");
        $userStmt->execute([':user_id' => $userId]);
        return $userStmt->fetch(PDO::FETCH_ASSOC) ?: ['name' => 'User', 'email' => ''];
    }
}
