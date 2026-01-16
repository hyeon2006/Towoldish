<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$file = __DIR__ . '/likes.json.gz';

function loadData() {
    global $file;
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $decoded = @gzdecode($content);
        
        $json = $decoded !== false ? $decoded : $content;
        
        return json_decode($json, true) ?: [];
    }
    return [];
}

function saveData($data) {
    global $file;
    $json = json_encode($data);
    $compressed = gzencode($json, 9);
    file_put_contents($file, $compressed);
}

$method = $_SERVER['REQUEST_METHOD'];
$data = loadData();

if ($method === 'GET' && isset($_GET['mode']) && $_GET['mode'] === 'get') {
    echo json_encode($data);
    exit;
}

if ($method === 'POST') {
    $mode = $_POST['mode'] ?? '';
    $id = $_POST['id'] ?? '';

    if (!$id) {
        echo json_encode(['error' => 'Missing ID']);
        exit;
    }

    if (!isset($data[$id])) {
        $data[$id] = 0;
    }

    if ($mode === 'like') {
        $data[$id]++;
    } elseif ($mode === 'unlike') {
        if ($data[$id] > 0) $data[$id]--;
    }

    saveData($data);
    echo json_encode(['success' => true, 'count' => $data[$id]]);
    exit;
}
?>