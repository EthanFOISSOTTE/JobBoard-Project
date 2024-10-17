<?php
class NotificationController {
    private $conn;
    private $table_name = "notifications";

    public function __construct($db) {
        $this->conn = $db;
    }

    // READ (Get all notifications or notifications for a specific user)
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
        
        $notifications = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $notification = array(
                "notif_id" => $notif_id,
                "user_id" => $user_id,
                "body" => $body,
                "is_seen" => $is_seen,
                "is_archived" => $is_archived,
                "sent_at" => $sent_at
            );
            array_push($notifications, $notification);
        }
        http_response_code(200);
        echo json_encode($notifications);
    }

    // CREATE (Add a new notification)
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " SET user_id=:user_id, body=:body, is_seen=:is_seen, is_archived=:is_archived";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":user_id", $data['user_id']);
        $stmt->bindParam(":body", $data['body']);
        $stmt->bindParam(":is_seen", $data['is_seen']);
        $stmt->bindParam(":is_archived", $data['is_archived']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Notification created successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create notification."));
        }
    }

    // UPDATE (Modify an existing notification)
    public function update($data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET body=:body, is_seen=:is_seen, is_archived=:is_archived 
                  WHERE notif_id=:notif_id";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":body", $data['body']);
        $stmt->bindParam(":is_seen", $data['is_seen']);
        $stmt->bindParam(":is_archived", $data['is_archived']);
        $stmt->bindParam(":notif_id", $data['notif_id']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Notification updated successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update notification."));
        }
    }

    // DELETE (Remove an existing notification)
    public function delete($data) {
        $query = "DELETE FROM " . $this->table_name . " WHERE notif_id=:notif_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":notif_id", $data['notif_id']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Notification deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete notification."));
        }
    }
}
?>
