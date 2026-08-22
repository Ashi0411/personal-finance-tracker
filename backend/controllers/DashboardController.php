<?php

require_once __DIR__ . '/../models/Dashboard.php';

class DashboardController
{
    private Dashboard $dashboard;

    public function __construct(PDO $db)
    {
        $this->dashboard = new Dashboard($db);
    }

    public function getSummary(int $userId): array
    {
        $summary = $this->dashboard->getSummary($userId);

        return [
            'success' => true,
            'summary' => $summary
        ];
    }
}