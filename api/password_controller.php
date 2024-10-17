<?php
class PasswordController {
    private $conn;
    private $table_name = "passwords";

    public function __construct($db) {
        $this->conn = $db;
    }

    // READ (Get a user's password hash)
    public function read($data) {
        if (isset($data['user_id'])) {
            $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $data['user_id']);
            $stmt->execute();

            $passwords = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                $password = array(
                    "password_id" => $password_id,
                    "user_id" => $user_id,
                    "password_hash" => $password_hash,
                    "created_at" => $created_at
                );
                array_push($passwords, $password);
            }
            http_response_code(200);
            echo json_encode($passwords);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "User ID is required."));
        }
    }

    // CREATE (Add a new password)
    public function create($data) {
        if (!isset($data['user_id']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(array("message" => "User ID and password are required."));
            return;
        }

        // Hash the password before storing it
        $password_hash = password_hash($data['password'], PASSWORD_BCRYPT);

        $query = "INSERT INTO " . $this->table_name . " SET user_id=:user_id, password_hash=:password_hash";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":user_id", $data['user_id']);
        $stmt->bindParam(":password_hash", $password_hash);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Password created successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create password."));
        }
    }

    // UPDATE (Update an existing password)
    public function update($data) {
        if (!isset($data['user_id']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(array("message" => "User ID and new password are required."));
            return;
        }

        // Hash the new password
        $password_hash = password_hash($data['password'], PASSWORD_BCRYPT);

        $query = "UPDATE " . $this->table_name . " 
                  SET password_hash=:password_hash 
                  WHERE user_id=:user_id";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":password_hash", $password_hash);
        $stmt->bindParam(":user_id", $data['user_id']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Password updated successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update password."));
        }
    }

    // DELETE (Delete a user's password)
    public function delete($data) {
        if (!isset($data['user_id'])) {
            http_response_code(400);
            echo json_encode(array("message" => "User ID is required."));
            return;
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE user_id=:user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $data['user_id']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Password deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete password."));
        }
    }
}
?>
