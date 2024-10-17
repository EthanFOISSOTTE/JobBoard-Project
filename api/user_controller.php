<?php
class UserController {
    private $conn;
    private $table_name = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read($data) {
        if (isset($data['user_id'])) {
            $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $data['user_id']);

        } else {
            $query = "SELECT * FROM " . $this->table_name;
            $stmt = $this->conn->prepare($query);
        }

        $stmt->execute();

        $users = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $user = array(
                "user_id" => $user_id,
                "last_name" => $last_name,
                "first_name" => $first_name,
                "email" => $email,
                "phone" => $phone,
                "role" => $role,
                "is_blocked" => $is_blocked,
                "created_at" => $created_at
            );
            array_push($users, $user);
        }
        http_response_code(200);
        echo json_encode($users);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " SET last_name=:last_name, first_name=:first_name, email=:email, phone=:phone, role=:role, is_blocked=:is_blocked";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":last_name", $data['last_name']);
        $stmt->bindParam(":first_name", $data['first_name']);
        $stmt->bindParam(":email", $data['email']);
        $stmt->bindParam(":phone", $data['phone']);
        $stmt->bindParam(":role", $data['role']);
        $stmt->bindParam(":is_blocked", $data['is_blocked']);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "User created successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create user."));
        }
    }

    public function update($data) {
        $query = "UPDATE " . $this->table_name . " SET last_name=:last_name, first_name=:first_name, email=:email, phone=:phone, role=:role, is_blocked=:is_blocked WHERE user_id=:user_id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":last_name", $data['last_name']);
        $stmt->bindParam(":first_name", $data['first_name']);
        $stmt->bindParam(":email", $data['email']);
        $stmt->bindParam(":phone", $data['phone']);
        $stmt->bindParam(":role", $data['role']);
        $stmt->bindParam(":is_blocked", $data['is_blocked']);
        $stmt->bindParam(":user_id", $data['user_id']);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "User updated successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update user."));
        }
    }

    public function delete($data) {
        $query = "DELETE FROM " . $this->table_name . " WHERE user_id=:user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $data['user_id']);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "User deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete user."));
        }
    }
}
?>
