<?php
class OfferController {
    private $conn;
    private $table_name = "offers";

    public function __construct($db) {
        $this->conn = $db;
    }

    // READ (Get all offers or offers for a specific company)
    public function read($data) {
        if (isset($data['offre_id'])) {
            $query = "SELECT * FROM " . $this->table_name . " WHERE offre_id = :offre_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":offre_id", $data['offre_id']);

        } elseif (isset($data['company_id'])) {
            $query = "SELECT * FROM " . $this->table_name . " WHERE company_id = :company_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":company_id", $data['company_id']);

        } else {
            $query = "SELECT * FROM " . $this->table_name;
            $stmt = $this->conn->prepare($query);
        }
        
        $stmt->execute();
        
        $offers = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $offer = array(
                "offre_id" => $offre_id,
                "company_id" => $company_id,
                "job_title" => $job_title,
                "short_description" => $short_description,
                "markdown_file" => $markdown_file,
                "tags" => $tags,
                "job_location" => $job_location,
                "salary" => $salary,
                "work_time" => $work_time,
                "is_blocked" => $is_blocked,
                "created_at" => $created_at
            );
            array_push($offers, $offer);
        }
        http_response_code(200);
        echo json_encode($offers);
    }

    // CREATE (Add a new offer)
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET company_id=:company_id, job_title=:job_title, short_description=:short_description, markdown_file=:markdown_file, 
                  tags=:tags, job_location=:job_location, salary=:salary, work_time=:work_time, is_blocked=:is_blocked";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":company_id", $data['company_id']);
        $stmt->bindParam(":job_title", $data['job_title']);
        $stmt->bindParam(":short_description", $data['short_description']);
        $stmt->bindParam(":markdown_file", $data['markdown_file']);
        $stmt->bindParam(":tags", $data['tags']);
        $stmt->bindParam(":job_location", $data['job_location']);
        $stmt->bindParam(":salary", $data['salary']);
        $stmt->bindParam(":work_time", $data['work_time']);
        $stmt->bindParam(":is_blocked", $data['is_blocked']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Offer created successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create offer."));
        }
    }

    // UPDATE (Modify an existing offer)
    public function update($data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET job_title=:job_title, short_description=:short_description, markdown_file=:markdown_file, 
                  tags=:tags, job_location=:job_location, salary=:salary, work_time=:work_time, is_blocked=:is_blocked 
                  WHERE offre_id=:offre_id";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":job_title", $data['job_title']);
        $stmt->bindParam(":short_description", $data['short_description']);
        $stmt->bindParam(":markdown_file", $data['markdown_file']);
        $stmt->bindParam(":tags", $data['tags']);
        $stmt->bindParam(":job_location", $data['job_location']);
        $stmt->bindParam(":salary", $data['salary']);
        $stmt->bindParam(":work_time", $data['work_time']);
        $stmt->bindParam(":is_blocked", $data['is_blocked']);
        $stmt->bindParam(":offre_id", $data['offre_id']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Offer updated successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update offer."));
        }
    }

    // DELETE (Remove an existing offer)
    public function delete($data) {
        $query = "DELETE FROM " . $this->table_name . " WHERE offre_id=:offre_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":offre_id", $data['offre_id']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Offer deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete offer."));
        }
    }
}
?>
