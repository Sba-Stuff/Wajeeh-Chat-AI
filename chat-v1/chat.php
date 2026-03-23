<?php
header('Content-Type: application/json');

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed']);
    exit;
}

// Get user input
$input = json_decode(file_get_contents("php://input"), true);
$userPrompt = $input['prompt'] ?? '';

if (empty($userPrompt)) {
    http_response_code(400);
    echo json_encode(['error' => 'Prompt is required']);
    exit;
}

// OpenAI API key
$apiKey = "sk-Suck-It";
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'OpenAI API key not configured']);
    exit;
}

// OpenAI API endpoint (Responses API)
$url = "http://localhost:1234/v1/responses";

// Request payload
$data = [
    "model" => "liquid/lfm2-1.2b",
    "input" => $userPrompt
];

// Initialize cURL
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer {$apiKey}"
    ],
    CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$responseData = json_decode($response, true);

// Handle API errors
if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode([
        'error' => 'OpenAI API error',
        'details' => $responseData
    ]);
    exit;
}

// Extract AI response text
$aiText = $responseData['output'][0]['content'][0]['text'] ?? 'No response';

// Return result
echo json_encode([
    'prompt' => $userPrompt,
    'response' => $aiText
]);
