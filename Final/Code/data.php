<?php
// Database configuration
$host = '127.0.0.1';
$user = 'root';
$password = 'pineapple';
$database = 'carpark';

// Create a connection
$connection = new mysqli($host, $user, $password, $database);

// Check connection
if ($connection->connect_error) {
    die('Connection failed: ' . $connection->connect_error);
}

// Query the database
$query = 'SELECT * FROM carparks';
$result = $connection->query($query);

// Convert the result to an array
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

// Close the database connection
$connection->close();

// Output the data as JSON
header('Content-Type: application/json');
echo json_encode($data);
?>
