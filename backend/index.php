<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/controllers/UserController.php";
require_once __DIR__ . "/controllers/AuthController.php";
require_once __DIR__ . "/controllers/TransactionController.php";
require_once __DIR__ . "/middleware/auth.php";

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

if ($method === 'POST' && $action === 'register') {

    $controller = new UserController($pdo);
    $controller->register();

    exit;
}

if ($method === 'POST' && $action === 'login') {

    $controller = new AuthController($pdo);
    $controller->login();

    exit;
}

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

if (in_array($action, [
    'transactions',
    'transaction-create',
    'transaction-update',
    'transaction-delete'
], true)) {

    requireLogin();

    $controller = new TransactionController($pdo);

    if ($action === 'transactions' && $method === 'GET') {
        $controller->getAll();
        exit;
    }

    if ($action === 'transaction-create' && $method === 'POST') {
        $controller->create();
        exit;
    }

    if ($action === 'transaction-update' && $method === 'PUT') {
        $controller->update();
        exit;
    }

    if ($action === 'transaction-delete' && $method === 'DELETE') {
        $controller->delete();
        exit;
    }
}

/*
|--------------------------------------------------------------------------
| Unknown Route
|--------------------------------------------------------------------------
*/

http_response_code(404);

echo json_encode([
    'success' => false,
    'message' => 'Endpoint not found.'
]);