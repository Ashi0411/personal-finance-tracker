<?php

/**
 * User Controller
 * Personal Finance Tracker
 */

require_once __DIR__ . '/../models/User.php';

class UserController
{
    private User $user;

    public function __construct(PDO $db)
    {
        $this->user = new User($db);
    }

    public function register(): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $name     = trim($data['name'] ?? '');
        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        // Required fields validation
        if ($name === '' || $email === '' || $password === '') {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Name, email, and password are required.'
            ]);
            return;
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Please provide a valid email address.'
            ]);
            return;
        }

        // Validate password length
        if (strlen($password) < 8) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Password must be at least 8 characters.'
            ]);
            return;
        }

        // Check if email already exists
        if ($this->user->findByEmail($email)) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'An account with this email already exists.'
            ]);
            return;
        }

        try {
            $created = $this->user->create($name, $email, $password);

            if ($created) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'User registered successfully. You can now login.'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Registration failed. Please try again.'
                ]);
            }
        } catch (PDOException $e) {
            error_log("Registration error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Registration failed due to a server error.'
            ]);
        }
    }
}