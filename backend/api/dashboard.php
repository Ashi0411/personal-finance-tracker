<?php

/**
 * Dashboard API Endpoint
 * Personal Finance Tracker
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/DashboardController.php';
require_once __DIR__ . '/../middleware/auth.php';

$userId = requireLogin();
$controller = new DashboardController($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);
    exit;
}

try {
    $monthYear = $_GET['month_year'] ?? date('Y-m');
    $response = $controller->getSummary($userId, $monthYear);
    echo json_encode($response);
} catch (Exception $e) {
    error_log("Dashboard API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected server error occurred.'
    ]);
}