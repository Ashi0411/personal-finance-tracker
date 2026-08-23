<?php

class User
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function create(
        string $name,
        string $email,
        string $password
    ): bool {

        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $sql = "INSERT INTO users
                (name, email, password_hash)
                VALUES
                (:name, :email, :password_hash)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password_hash' => $passwordHash
        ]);
    }

    public function findByEmail(
        string $email
    ): ?array {

        $sql = "SELECT *
                FROM users
                WHERE email = :email
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':email' => $email
        ]);

        $user =
            $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    public function findById(int $userId): ?array
    {
        $sql = "SELECT user_id, name, email, avatar_url, created_at
                FROM users
                WHERE user_id = :user_id
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':user_id' => $userId]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function updateAvatar(int $userId, ?string $avatarUrl): bool
    {
        $sql = "UPDATE users
                SET avatar_url = :avatar_url
                WHERE user_id = :user_id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':avatar_url' => $avatarUrl,
            ':user_id' => $userId
        ]);
    }
}