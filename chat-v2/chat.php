<?php
set_time_limit(3600);
header('Content-Type: application/json');

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed']);
    exit;
}

// Read input
$input = json_decode(file_get_contents("php://input"), true);
$userPrompt = $input['prompt'] ?? '';

if (empty($userPrompt)) {
    http_response_code(400);
    echo json_encode(['error' => 'Prompt is required']);
    exit;
}

// API key (LM Studio ignores it, but header required)
$apiKey = "sk-Suck-It";

// API endpoint
$url = "http://localhost:1234/v1/responses";

// Payload
$data = [
    "model" => "liquid/lfm2-1.2b",
    "input" => $userPrompt
];

// Init cURL
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer {$apiKey}"
    ],
    CURLOPT_POSTFIELDS => json_encode($data),

    // í ½í´´ TIMEOUT SETTINGS
    CURLOPT_CONNECTTIMEOUT => 3600,   // seconds
    CURLOPT_TIMEOUT        => 3600,  // seconds (adjust if needed)
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErrNo = curl_errno($ch);
$curlErr   = curl_error($ch);

curl_close($ch);

// Handle cURL errors (including timeout)
if ($curlErrNo) {
    if ($curlErrNo === CURLE_OPERATION_TIMEDOUT) {
        http_response_code(504);
        echo json_encode([
            'error' => 'Model response timed out',
            'timeout_seconds' => 3600
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'error' => 'cURL error',
            'details' => $curlErr
        ]);
    }
    exit;
}

// Decode response
$responseData = json_decode($response, true);

// Handle API-level errors
if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode([
        'error' => 'OpenAI API error',
        'details' => $responseData
    ]);
    exit;
}

// Extract model output safely
$aiText = $responseData['output'][0]['content'][0]['text'] ?? 'No response from model';

// Success
echo json_encode([
    'prompt'   => $userPrompt,
    'response' => $aiText
]);
