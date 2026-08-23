<?php

/**
 * Budgets API Endpoint
 * Personal Finance Tracker
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/BudgetController.php';
require_once __DIR__ . '/../middleware/auth.php';

$userId = requireLogin();
$controller = new BudgetController($pdo);
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $monthYear = $_GET['month_year'] ?? date('Y-m');
            $response = $controller->getAll($userId, $monthYear);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $categoryId = (int) ($data['category_id'] ?? 0);
            $amount     = (float) ($data['amount'] ?? 0);
            $monthYear  = $data['month_year'] ?? date('Y-m');

            $response = $controller->create($userId, $categoryId, $amount, $monthYear);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $budgetId   = (int) ($data['budget_id'] ?? 0);
            $categoryId = (int) ($data['category_id'] ?? 0);
            $amount     = (float) ($data['amount'] ?? 0);
            $monthYear  = $data['month_year'] ?? date('Y-m');

            $response = $controller->update($budgetId, $userId, $categoryId, $amount, $monthYear);
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            $budgetId = (int) ($data['budget_id'] ?? 0);
            $response = $controller->delete($budgetId, $userId);
            break;

        default:
            http_response_code(405);
            $response = ['success' => false, 'message' => 'Method not allowed.'];
    }
} catch (Exception $e) {
    error_log("Budgets API error: " . $e->getMessage());
    http_response_code(500);
    $response = ['success' => false, 'message' => 'An unexpected server error occurred.'];
}

echo json_encode($response);
