<?php
class CompanyController {
    private $conn;
    private $table_name = "companies";

    public function __construct($db) {
        $this->conn = $db;
    }

    // READ (Get all companies)
    public function read($data) {
        if (isset($data['company_id'])) {
            $query = "SELECT * FROM " . $this->table_name . " WHERE company_id = :company_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":company_id", $data['company_id']);

        } elseif (isset($data['user_id'])) {
            $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $data['user_id']);
            
        } else {
            $query = "SELECT * FROM " . $this->table_name;
            $stmt = $this->conn->prepare($query);
        }

        $stmt->execute();

        $companies = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $company = array(
                "company_id" => $company_id,
                "user_id" => $user_id,
                "company_name" => $company_name,
                "company_description" => $company_description,
                "company_website" => $company_website,
                "is_blocked" => $is_blocked
            );
            array_push($companies, $company);
        }
        http_response_code(200);
        echo json_encode($companies);
    }

    // CREATE (Add a new company)
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " SET user_id=:user_id, company_name=:company_name, company_description=:company_description, company_website=:company_website, is_blocked=:is_blocked";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":user_id", $data['user_id']);
        $stmt->bindParam(":company_name", $data['company_name']);
        $stmt->bindParam(":company_description", $data['company_description']);
        $stmt->bindParam(":company_website", $data['company_website']);
        $stmt->bindParam(":is_blocked", $data['is_blocked']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Company created successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create company."));
        }
    }

    // UPDATE (Modify an existing company)
    public function update($data) {
        $query = "UPDATE " . $this->table_name . " 
                  SET company_name=:company_name, company_description=:company_description, company_website=:company_website, is_blocked=:is_blocked 
                  WHERE company_id=:company_id";

        $stmt = $this->conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(":company_name", $data['company_name']);
        $stmt->bindParam(":company_description", $data['company_description']);
        $stmt->bindParam(":company_website", $data['company_website']);
        $stmt->bindParam(":is_blocked", $data['is_blocked']);
        $stmt->bindParam(":company_id", $data['company_id']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Company updated successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update company."));
        }
    }

    // DELETE (Remove an existing company)
    public function delete($data) {
        $query = "DELETE FROM " . $this->table_name . " WHERE company_id=:company_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":company_id", $data['company_id']);

        // Execute the query
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Company deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete company."));
        }
    }
}
?>
