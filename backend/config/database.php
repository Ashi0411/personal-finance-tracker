<?php

/**
 * Database Configuration & Connection
 * Personal Finance Tracker
 */

$host     = getenv('DB_HOST') ?: '127.0.0.1';
$dbname   = getenv('DB_NAME') ?: 'personal_finance_tracker';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$envPort  = getenv('DB_PORT');

// Candidate ports: configured env port first, then 3307 (local default), then standard 3306
$ports = $envPort ? [(int) $envPort] : [3307, 3306];

$pdo = null;
$lastException = null;

foreach ($ports as $port) {
    try {
        $pdo = new PDO(
            "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4",
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        break; // Successfully connected
    } catch (PDOException $e) {
        $lastException = $e;
    }
}

if (!$pdo) {
    http_response_code(500);
    error_log("Database connection failed: " . ($lastException ? $lastException->getMessage() : 'Unknown error'));

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed. Please ensure MySQL is running."
    ]);

    exit;
}