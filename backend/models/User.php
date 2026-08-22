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
}