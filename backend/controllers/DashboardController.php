<?php

require_once __DIR__ . '/../models/Dashboard.php';

class DashboardController
{
    private Dashboard $dashboard;

    public function __construct(PDO $db)
    {
        $this->dashboard = new Dashboard($db);
    }

    public function getSummary(int $userId, ?string $monthYear = null): array
    {
        $summary = $this->dashboard->getSummary($userId, $monthYear);

        return [
            'success' => true,
            'summary' => $summary
        ];
    }
}