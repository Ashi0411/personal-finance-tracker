<?php

function requireLogin(): void
{
    session_start();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' => 'Authentication required.'
        ]);

        exit;
    }
}