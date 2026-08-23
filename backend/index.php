<?php

/**
 * API Front Controller & Status Endpoint
 * Personal Finance Tracker
 */

header("Content-Type: application/json");

echo json_encode([
    'success' => true,
    'name'    => 'Personal Finance Tracker API',
    'version' => '1.0.0',
    'status'  => 'online',
    'endpoints' => [
        'POST /backend/api/register.php'    => 'Register a new user',
        'POST /backend/api/login.php'       => 'User login',
        'POST /backend/api/logout.php'      => 'User logout',
        'GET  /backend/api/auth-status.php' => 'Check current session status',
        'GET/POST/PUT/DELETE /backend/api/categories.php'   => 'Category management',
        'GET/POST/PUT/DELETE /backend/api/transactions.php' => 'Transaction management',
        'GET /backend/api/dashboard.php'    => 'Financial summary metrics'
    ]
]);