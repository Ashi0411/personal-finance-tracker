<?php

/**
 * Transactions API Endpoint
 * Personal Finance Tracker
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/TransactionController.php';
require_once __DIR__ . '/../middleware/auth.php';

$userId = requireLogin();
$controller = new TransactionController($pdo);
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $transactionId = (int) $_GET['id'];
                $response = $controller->getOne($transactionId, $userId);
            } else {
                $response = $controller->getAll($userId);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            $categoryId      = (int) ($data['category_id'] ?? 0);
            $amount          = (float) ($data['amount'] ?? 0);
            $type            = $data['type'] ?? '';
            $description     = $data['description'] ?? '';
            $transactionDate = $data['transaction_date'] ?? '';

            $response = $controller->create(
                $userId,
                $categoryId,
                $amount,
                $type,
                $description,
                $transactionDate
            );
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);

            $transactionId   = (int) ($data['transaction_id'] ?? 0);
            $categoryId      = (int) ($data['category_id'] ?? 0);
            $amount          = (float) ($data['amount'] ?? 0);
            $type            = $data['type'] ?? '';
            $description     = $data['description'] ?? '';
            $transactionDate = $data['transaction_date'] ?? '';

            $response = $controller->update(
                $transactionId,
                $userId,
                $categoryId,
                $amount,
                $type,
                $description,
                $transactionDate
            );
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            $transactionId = (int) ($data['transaction_id'] ?? 0);
            $response = $controller->delete($transactionId, $userId);
            break;

        default:
            http_response_code(405);
            $response = [
                'success' => false,
                'message' => 'Method not allowed.'
            ];
    }
} catch (Exception $e) {
    error_log("Transactions API error: " . $e->getMessage());
    http_response_code(500);
    $response = [
        'success' => false,
        'message' => 'An unexpected server error occurred.'
    ];
}

echo json_encode($response);