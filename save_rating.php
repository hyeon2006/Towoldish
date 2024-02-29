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

<?php
// 자정이 되는 시점에 JSON 데이터를 초기화하는 코드를 작성합니다.
if (date('H') == '00' && date('i') == '00' && date('s') == '00') {
    // JSON 데이터를 초기화합니다.
    $ratings = [];
    $json = json_encode($ratings);

    // JSON 데이터를 초기화하기 위한 JavaScript 코드를 생성합니다.
    $js_code = "<script>var ratings = JSON.parse(" . json_encode($json) . ");</script>";
    $js_code .= "<div id='ratings'></div>";
    $js_code .= "<script>document.getElementById('ratings').innerHTML = ratings.join(' ');</script>";

    // 자동 실행 예약을 위한 크론탭 명령어를 생성합니다.
    $crontab_command = "0 0 * * * /usr/bin/php " . __FILE__;

    // 해당 PHP 스크립트를 실행합니다.
    if (eval($js_code)) {
        // 자동 실행 예약을 등록합니다.
        if (file_put_contents('/etc/cron.d/ratings-reset', $crontab_command)) {
            // 자동 실행 예약을 등록하는 데 성공하면, 성공 메시지를 출력합니다.
            echo "JSON 데이터 초기화에 성공하였습니다.";
        } else {
            // 자동 실행 예약을 등록하는 데 실패하면, 오류 메시지를 출력합니다.
            echo "자동 실행 예약을 등록하는 데 실패하였습니다.";
        }
    } else {
        // 자동 실행 예약을 등록하기 전에 발생한 오류를 처리합니다.
        echo "JSON 데이터 초기화에 실패하였습니다.";
    }
}
?>