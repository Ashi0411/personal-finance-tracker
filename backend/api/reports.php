<?php

/**
 * Monthly Financial Reports API Endpoint
 * Personal Finance Tracker
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/ReportController.php';
require_once __DIR__ . '/../middleware/auth.php';

$userId = requireLogin();
$controller = new ReportController($pdo);
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $monthYear = $_GET['month_year'] ?? date('Y-m');
        $response = $controller->getMonthlyReport($userId, $monthYear);
    } else {
        http_response_code(405);
        $response = ['success' => false, 'message' => 'Method not allowed.'];
    }
} catch (Exception $e) {
    error_log("Reports API error: " . $e->getMessage());
    http_response_code(500);
    $response = ['success' => false, 'message' => 'An unexpected server error occurred.'];
}

echo json_encode($response);
