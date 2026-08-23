<?php

/**
 * Profile & Avatar API Endpoint
 * Personal Finance Tracker
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/ProfileController.php';
require_once __DIR__ . '/../middleware/auth.php';

$userId = requireLogin();
$controller = new ProfileController($pdo);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    $controller->getProfile($userId);
} elseif ($method === 'POST') {
    if ($action === 'upload') {
        $controller->uploadAvatar($userId);
    } elseif ($action === 'delete') {
        $controller->deleteAvatar($userId);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid profile action.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}
