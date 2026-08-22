<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/TransactionController.php';

$controller = new TransactionController($pdo);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Please login first.'
    ]);

    exit;
}

$userId = $_SESSION['user_id'];

$method = $_SERVER['REQUEST_METHOD'];

try {

    switch ($method) {

        // ==========================================
        // GET
        // ==========================================

        case 'GET':

            if (isset($_GET['id'])) {

                $transactionId = (int) $_GET['id'];

                $response = $controller->getOne(
                    $transactionId,
                    $userId
                );

            } else {

                $response = $controller->getAll($userId);
            }

            break;


        // ==========================================
        // POST
        // ==========================================

        case 'POST':

            $data = json_decode(
                file_get_contents('php://input'),
                true
            );

            $categoryId = (int) ($data['category_id'] ?? 0);
            $amount = (float) ($data['amount'] ?? 0);
            $type = $data['type'] ?? '';
            $description = $data['description'] ?? '';
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


        // ==========================================
        // PUT
        // ==========================================

        case 'PUT':

            $data = json_decode(
                file_get_contents('php://input'),
                true
            );

            $transactionId =
                (int) ($data['transaction_id'] ?? 0);

            $categoryId =
                (int) ($data['category_id'] ?? 0);

            $amount =
                (float) ($data['amount'] ?? 0);

            $type =
                $data['type'] ?? '';

            $description =
                $data['description'] ?? '';

            $transactionDate =
                $data['transaction_date'] ?? '';

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


        // ==========================================
        // DELETE
        // ==========================================

        case 'DELETE':

            $data = json_decode(
                file_get_contents('php://input'),
                true
            );

            $transactionId =
                (int) ($data['transaction_id'] ?? 0);

            $response = $controller->delete(
                $transactionId,
                $userId
            );

            break;


        // ==========================================
        // INVALID METHOD
        // ==========================================

        default:

            http_response_code(405);

            $response = [
                'success' => false,
                'message' => 'Method not allowed.'
            ];
    }

} catch (Exception $e) {

    http_response_code(500);

    $response = [
        'success' => false,
        'message' => 'Server error.',
        'error' => $e->getMessage()
    ];
}

echo json_encode($response);