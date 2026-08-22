<?php

require_once __DIR__ . '/../models/User.php';

class AuthController
{
    private User $user;

    public function __construct(PDO $db)
    {
        $this->user = new User($db);
    }

    public function login(): void
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if ($email === '' || $password === '') {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Email and password are required.'
            ]);

            return;
        }

        $user = $this->user->findByEmail($email);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password.'
            ]);

            return;
        }

        session_start();

        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['email'] = $user['email'];

        echo json_encode([
            'success' => true,
            'message' => 'Login successful.',
            'user' => [
                'user_id' => $user['user_id'],
                'name' => $user['name'],
                'email' => $user['email']
            ]
        ]);
    }
}