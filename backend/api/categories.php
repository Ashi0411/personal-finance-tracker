<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/CategoryController.php';

$controller = new CategoryController($pdo);

$method = $_SERVER['REQUEST_METHOD'];


if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Please login first.'
    ]);

    exit;
}

$userId = $_SESSION['user_id'];

try {

    switch ($method) {

        case 'GET':

            if (isset($_GET['id'])) {

                $categoryId = (int) $_GET['id'];

                $response = $controller->getOne(
                    $categoryId,
                    $userId
                );

            } else {

                $response = $controller->getAll($userId);
            }

            break;


        case 'POST':

            $data = json_decode(
                file_get_contents('php://input'),
                true
            );

            $name = $data['name'] ?? '';

            $response = $controller->create(
                $userId,
                $name
            );

            break;


        case 'PUT':

            $data = json_decode(
                file_get_contents('php://input'),
                true
            );

            $categoryId = (int) ($data['category_id'] ?? 0);
            $name = $data['name'] ?? '';

            $response = $controller->update(
                $categoryId,
                $userId,
                $name
            );

            break;


        case 'DELETE':

            $data = json_decode(
                file_get_contents('php://input'),
                true
            );

            $categoryId = (int) ($data['category_id'] ?? 0);

            $response = $controller->delete(
                $categoryId,
                $userId
            );

            break;


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