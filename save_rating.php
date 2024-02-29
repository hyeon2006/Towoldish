<?php
// 쿠키를 확인합니다.
if (!isset($_COOKIE['rated'])) {
    // 별 등급 값을 배열에 추가합니다.
    if (isset($_GET['rating'])) {
        $rating = $_GET['rating'];
        $ratings[] = $rating;

        // 별 등급 값을 쿠키에 저장합니다.
        setcookie('rated', 'true', time() + (60 * 60 * 24 * 30), '/');
    }
} else {
    echo "이미 등급을 준 적이 있습니다.";
    exit;
}

// 배열을 JSON 형식으로 변환합니다.
$json = json_encode($ratings);

// HTML에서 JavaScript를 사용하여 JSON을 파싱하고, 표시합니다.
echo "<script>var ratings = JSON.parse('" . $json . "');</script>";
echo "<div id='ratings'></div>";
echo "<script>document.getElementById('ratings').innerHTML = ratings.join(' ');</script>";
?>