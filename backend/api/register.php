<?php

header("Content-Type: application/json");

session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/UserController.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

    exit;
}

try {

    $controller = new UserController($pdo);

    $controller->register();

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Registration failed."
    ]);
}