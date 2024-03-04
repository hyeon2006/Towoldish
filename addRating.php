<?php
// MySQL 연결 설정
$servername = "towol.n-e.kr";
$username = "sh";
$password = "sh";
$dbname = "rate";

// MySQL 연결
$conn = new mysqli($servername, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die("연결 실패: " . $conn->connect_error);
}

// 쿼리 작성 및 실행
$sql = "SELECT value FROM ratings";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = array(); // 빈 배열 생성
    while ($row = $result->fetch_assoc()) {
        $data[] = $row; // 데이터를 배열에 추가
    }

    // 데이터를 JSON으로 변환
    $json_data = json_encode($data);

    // JSON 데이터 출력
    header('Content-Type: application/json');
    echo $json_data;
} else {
    echo "데이터가 없습니다.";
}

// 연결 종료
$conn->close();
?>