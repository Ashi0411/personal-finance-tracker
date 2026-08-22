<?php

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
        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (
            $name === '' ||
            $email === '' ||
            $password === ''
        ) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' =>
                    'Name, email and password are required.'
            ]);

            return;
        }

        if (!filter_var(
            $email,
            FILTER_VALIDATE_EMAIL
        )) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' =>
                    'Invalid email address.'
            ]);

            return;
        }

        if (strlen($password) < 8) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' =>
                    'Password must be at least 8 characters.'
            ]);

            return;
        }

        if ($this->user->findByEmail($email)) {
            http_response_code(409);

            echo json_encode([
                'success' => false,
                'message' =>
                    'Email already registered.'
            ]);

            return;
        }

        try {

            $this->user->create(
                $name,
                $email,
                $password
            );

            http_response_code(201);

            echo json_encode([
                'success' => true,
                'message' =>
                    'User registered successfully.'
            ]);

        } catch (PDOException $e) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' =>
                    'Registration failed.'
            ]);
        }
    }


    // ========================================================
    // LOGIN
    // ========================================================

    public function login(): void
    {
        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $email =
            trim($data['email'] ?? '');

        $password =
            $data['password'] ?? '';


        if (
            $email === '' ||
            $password === ''
        ) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' =>
                    'Email and password are required.'
            ]);

            return;
        }


        if (!filter_var(
            $email,
            FILTER_VALIDATE_EMAIL
        )) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' =>
                    'Invalid email address.'
            ]);

            return;
        }


        $user =
            $this->user->findByEmail($email);


        if (!$user) {

            http_response_code(401);

            echo json_encode([
                'success' => false,
                'message' =>
                    'Invalid email or password.'
            ]);

            return;
        }


        if (!password_verify(
            $password,
            $user['password_hash']
        )) {

            http_response_code(401);

            echo json_encode([
                'success' => false,
                'message' =>
                    'Invalid email or password.'
            ]);

            return;
        }

        if (!password_verify(
    $password,
    $user['password_hash']
)) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' =>
            'Invalid email or password.'
    ]);

    return;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$_SESSION['user_id'] = $user['user_id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_email'] = $user['email'];


        echo json_encode([
            'success' => true,
            'message' =>
                'Login successful.',

            'user' => [
                'user_id' =>
                    $user['user_id'],

                'name' =>
                    $user['name'],

                'email' =>
                    $user['email']
            ]
        ]);
    }
}