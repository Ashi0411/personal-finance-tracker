<?php

/**
 * Goals API Endpoint
 * Personal Finance Tracker
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/GoalController.php';
require_once __DIR__ . '/../middleware/auth.php';

$userId = requireLogin();
$controller = new GoalController($pdo);
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $response = $controller->getAll($userId);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            // Handle Deposit / Contribution
            if (isset($data['action']) && $data['action'] === 'deposit') {
                $goalId = (int) ($data['goal_id'] ?? 0);
                $amount = (float) ($data['amount'] ?? 0);
                $response = $controller->deposit($goalId, $userId, $amount);
                break;
            }

            // Standard Create
            $name          = $data['name'] ?? '';
            $targetAmount  = (float) ($data['target_amount'] ?? 0);
            $currentAmount = (float) ($data['current_amount'] ?? 0);
            $targetDate    = $data['target_date'] ?? '';

            $response = $controller->create($userId, $name, $targetAmount, $currentAmount, $targetDate);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $goalId        = (int) ($data['goal_id'] ?? 0);
            $name          = $data['name'] ?? '';
            $targetAmount  = (float) ($data['target_amount'] ?? 0);
            $currentAmount = (float) ($data['current_amount'] ?? 0);
            $targetDate    = $data['target_date'] ?? '';
            $status        = $data['status'] ?? 'in_progress';

            $response = $controller->update(
                $goalId,
                $userId,
                $name,
                $targetAmount,
                $currentAmount,
                $targetDate,
                $status
            );
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            $goalId = (int) ($data['goal_id'] ?? 0);
            $response = $controller->delete($goalId, $userId);
            break;

        default:
            http_response_code(405);
            $response = ['success' => false, 'message' => 'Method not allowed.'];
    }
} catch (Exception $e) {
    error_log("Goals API error: " . $e->getMessage());
    http_response_code(500);
    $response = ['success' => false, 'message' => 'An unexpected server error occurred.'];
}

echo json_encode($response);
