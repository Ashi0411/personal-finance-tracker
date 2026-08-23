<?php

/**
 * Authentication Controller
 * Personal Finance Tracker
 */

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/auth.php';

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

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email address format.'
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

        startSecureSession();

        // Regenerate session ID to prevent Session Fixation attacks
        session_regenerate_id(true);

        $_SESSION['user_id']    = (int) $user['user_id'];
        $_SESSION['user_name']  = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_avatar'] = $user['avatar_url'] ?? null;

        echo json_encode([
            'success' => true,
            'message' => 'Login successful.',
            'user'    => [
                'user_id'    => (int) $user['user_id'],
                'name'       => $user['name'],
                'email'      => $user['email'],
                'avatar_url' => $user['avatar_url'] ?? null
            ]
        ]);
    }

    public function logout(): void
    {
        startSecureSession();

        $_SESSION = [];

        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }

        session_destroy();

        echo json_encode([
            'success' => true,
            'message' => 'Logout successful.'
        ]);
    }

    public function status(): void
    {
        startSecureSession();

        if (isset($_SESSION['user_id'])) {
            $userId = (int) $_SESSION['user_id'];
            $freshUser = $this->user->findById($userId);
            $avatarUrl = $freshUser ? $freshUser['avatar_url'] : ($_SESSION['user_avatar'] ?? null);

            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'user' => [
                    'user_id'    => $userId,
                    'name'       => $freshUser['name'] ?? ($_SESSION['user_name'] ?? 'User'),
                    'email'      => $freshUser['email'] ?? ($_SESSION['user_email'] ?? ''),
                    'avatar_url' => $avatarUrl
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'authenticated' => false,
                'message' => 'No active session.'
            ]);
        }
    }
}