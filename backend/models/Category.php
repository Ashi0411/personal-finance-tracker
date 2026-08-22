<?php

class Category
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function create(int $userId, string $name): bool
    {
        $sql = "INSERT INTO categories (user_id, name)
                VALUES (:user_id, :name)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':user_id' => $userId,
            ':name' => $name
        ]);
    }

    public function getAllByUser(int $userId): array
    {
        $sql = "SELECT category_id, name
                FROM categories
                WHERE user_id = :user_id
                ORDER BY name ASC";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':user_id' => $userId
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $categoryId, int $userId): ?array
    {
        $sql = "SELECT category_id, name
                FROM categories
                WHERE category_id = :category_id
                AND user_id = :user_id
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':category_id' => $categoryId,
            ':user_id' => $userId
        ]);

        $category = $stmt->fetch(PDO::FETCH_ASSOC);

        return $category ?: null;
    }

    public function update(
        int $categoryId,
        int $userId,
        string $name
    ): bool {
        $sql = "UPDATE categories
                SET name = :name
                WHERE category_id = :category_id
                AND user_id = :user_id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':name' => $name,
            ':category_id' => $categoryId,
            ':user_id' => $userId
        ]);
    }

    public function delete(int $categoryId, int $userId): bool
    {
        $sql = "DELETE FROM categories
                WHERE category_id = :category_id
                AND user_id = :user_id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':category_id' => $categoryId,
            ':user_id' => $userId
        ]);
    }
}