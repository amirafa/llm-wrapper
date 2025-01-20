<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    exit();
}

// Fetch the raw POST data
$data = json_decode(file_get_contents("php://input"), true);

// Check if message exists
if (isset($data['contents'])) {
    // Set the Google API URL and your API key
    $googleApiKey = 'YOUR_GEMINI_API_KEY';  // Replace with your actual API key
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" . $googleApiKey;

    $jsonData = json_encode($data);


    // Initialize cURL session
    $ch = curl_init();

    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);

    // Execute the cURL request and capture the response
    $response = curl_exec($ch);

    // Check for cURL errors
    if ($response === false) {
        echo json_encode(["error" => "cURL Error: " . curl_error($ch)]);
    } else {

        // Decode the response from the API
        $responseData = json_decode($response, true);
        
        $responseText = $responseData['candidates'][0]['content']['parts'][0]['text'];
        
        echo json_encode(["response" => $responseText]);
    }

    // Close the cURL session
    curl_close($ch);
} else {
    echo json_encode(["error" => "No message received."]);
}

?>
