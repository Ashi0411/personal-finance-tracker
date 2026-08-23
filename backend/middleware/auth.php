<?php

/**
 * Authentication Middleware & Session Helper
 * Personal Finance Tracker
 */

function startSecureSession(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        $isSecure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

        session_set_cookie_params([
            'lifetime' => 86400, // 24 hours
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isSecure,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        session_start();
    }
}

function requireLogin(): int
{
    startSecureSession();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' => 'Authentication required. Please login.'
        ]);

        exit;
    }

    return (int) $_SESSION['user_id'];
}