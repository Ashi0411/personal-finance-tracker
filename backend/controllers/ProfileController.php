<?php

/**
 * Profile & Avatar Management Controller
 * Personal Finance Tracker
 */

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/auth.php';

class ProfileController
{
    private User $userModel;
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->userModel = new User($db);
    }

    public function getProfile(int $userId): void
    {
        $user = $this->userModel->findById($userId);
        if (!$user) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'User not found.'
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'user' => [
                'user_id'    => (int) $user['user_id'],
                'name'       => $user['name'],
                'email'      => $user['email'],
                'avatar_url' => $user['avatar_url'],
                'created_at' => $user['created_at']
            ]
        ]);
    }

    public function uploadAvatar(int $userId): void
    {
        if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            $errMsg = 'No image uploaded or upload error occurred.';
            if (isset($_FILES['avatar']['error'])) {
                switch ($_FILES['avatar']['error']) {
                    case UPLOAD_ERR_INI_SIZE:
                    case UPLOAD_ERR_FORM_SIZE:
                        $errMsg = 'Image size exceeds maximum upload limit.';
                        break;
                    case UPLOAD_ERR_NO_FILE:
                        $errMsg = 'Please select an image file to upload.';
                        break;
                }
            }
            echo json_encode(['success' => false, 'message' => $errMsg]);
            return;
        }

        $file = $_FILES['avatar'];

        // Maximum size: 5 MB
        $maxBytes = 5 * 1024 * 1024;
        if ($file['size'] > $maxBytes) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Image file size must be less than 5MB.'
            ]);
            return;
        }

        // Validate MIME type securely using finfo
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif'
        ];

        if (!isset($allowedMimes[$mimeType])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid file format. Please upload a JPEG, PNG, WebP, or GIF image.'
            ]);
            return;
        }

        $ext = $allowedMimes[$mimeType];
        $uploadDir = __DIR__ . '/../uploads/avatars/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Fetch current user to clean up previous avatar file
        $currentUser = $this->userModel->findById($userId);
        if ($currentUser && !empty($currentUser['avatar_url'])) {
            $oldPath = __DIR__ . '/../../' . ltrim($currentUser['avatar_url'], '/\\');
            if (file_exists($oldPath) && is_file($oldPath)) {
                @unlink($oldPath);
            }
        }

        // Generate safe unique filename
        $safeFilename = sprintf('avatar_%d_%d_%s.%s', $userId, time(), bin2hex(random_bytes(4)), $ext);
        $targetPath = $uploadDir . $safeFilename;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to save uploaded image. Please check server permissions.'
            ]);
            return;
        }

        $avatarUrl = 'backend/uploads/avatars/' . $safeFilename;
        $updated = $this->userModel->updateAvatar($userId, $avatarUrl);

        if (!$updated) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database error while saving profile picture.'
            ]);
            return;
        }

        startSecureSession();
        $_SESSION['user_avatar'] = $avatarUrl;

        echo json_encode([
            'success'    => true,
            'message'    => 'Profile picture updated successfully!',
            'avatar_url' => $avatarUrl
        ]);
    }

    public function deleteAvatar(int $userId): void
    {
        $currentUser = $this->userModel->findById($userId);
        if ($currentUser && !empty($currentUser['avatar_url'])) {
            $oldPath = __DIR__ . '/../../' . ltrim($currentUser['avatar_url'], '/\\');
            if (file_exists($oldPath) && is_file($oldPath)) {
                @unlink($oldPath);
            }
        }

        $updated = $this->userModel->updateAvatar($userId, null);

        if (!$updated) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database error while removing profile picture.'
            ]);
            return;
        }

        startSecureSession();
        $_SESSION['user_avatar'] = null;

        echo json_encode([
            'success' => true,
            'message' => 'Profile picture removed successfully.'
        ]);
    }
}
