<?php
class ApplicationController {
    private $conn;
    private $table_name = "applications";

    public function __construct($db) {
        $this->conn = $db;
    }

    // READ (Get all applications)
    public function read($data) {
        if (isset($data['application_id'])) {
            $query = "SELECT * FROM " . $this->table_name . " WHERE application_id = :application_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":application_id", $data['application_id']);
            
        } elseif (isset($data['offre_id'])) {
            $query = "SELECT * FROM " . $this->table_name . " WHERE offre_id = :offre_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":offre_id", $data['offre_id']);
        } else {
            $query = "SELECT * FROM " . $this->table_name;
            $stmt = $this->conn->prepare($query);
        }

        $stmt->execute();

        $applications = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $application = array(
                "application_id" => $application_id,
                "offre_id" => $offre_id,
                "user_id" => $user_id,
                "message" => $message,
                "status" => $status,
                "created_at" => $created_at
            );
            array_push($applications, $application);
        }
        http_response_code(200);
        echo json_encode($applications);
    }

    // CREATE (Add a new application)
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " SET offre_id=:offre_id, user_id=:user_id, message=:message, status=:status";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":offre_id", $data['offre_id']);
        $stmt->bindParam(":user_id", $data['user_id']);
        $stmt->bindParam(":message", $data['message']);
        $stmt->bindParam(":status", $data['status']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Application created successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create application."));
        }
    }

    // UPDATE (Modify an existing application)
    public function update($data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET offre_id=:offre_id, user_id=:user_id, message=:message, status=:status 
                  WHERE application_id=:application_id";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":offre_id", $data['offre_id']);
        $stmt->bindParam(":user_id", $data['user_id']);
        $stmt->bindParam(":message", $data['message']);
        $stmt->bindParam(":status", $data['status']);
        $stmt->bindParam(":application_id", $data['application_id']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Application updated successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update application."));
        }
    }

    // DELETE (Remove an existing application)
    public function delete($data) {
        $query = "DELETE FROM " . $this->table_name . " WHERE application_id=:application_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":application_id", $data['application_id']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Application deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete application."));
        }
    }
}
?>
