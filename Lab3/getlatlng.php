<?php
// Database configuration
$host = '127.0.0.1';
$user = 'notroot';
$password = 'pineapple';
$database = 'carpark';

// Create a connection
$connection = new mysqli($host, $user, $password, $database);
$data = [];

// Check connection
if ($connection->connect_error) {
    die('Connection failed: ' . $connection->connect_error);
}

if (isset($_GET["location"]) && isset($_GET["totallots"])) {
    // Get the parameters and sanitize them (for security)
    $location = $connection->real_escape_string($_GET["location"]);
    $totallots = $connection->real_escape_string($_GET["totallots"]);

    // Query the database using prepared statements
    $query = $connection->prepare("SELECT lat, lng FROM carparks WHERE address=? AND carTotalLots=?");
    $query->bind_param("ss", $location, $totallots);
    $query->execute();
    $result = $query->get_result();

    // Convert the result to an array
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    // Close the prepared statement
    $query->close();
}

// Close the database connection
$connection->close();

// Output the data as JSON
header('Content-Type: application/json');

// Check if data is empty and return a specific response if no results found
if (empty($data)) {
    echo json_encode(["message" => "No results found"]);
} else {
    echo json_encode($data);
}
?>

