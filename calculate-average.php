<?php
    // 이전에 저장된 평균 평점 값을 가져옵니다.
    $averageRating = isset($_POST["averageRating"]) ? $_POST["averageRating"] : 0;

    // 새로운 평균 평점 값을 가져옵니다.
    $newAverageRating = ($_POST["averageRating"] ?? 0) + ($_GET["averageRating"] ?? 0);

    // 새로운 평균 평점 값을 계산합니다.
    $newAverageRating /= 2;

    // 새로운 평균 평점 값을 저장합니다.
    // 여기에 원격 서버에서 데이터베이스를 사용하는 로직을 추가합니다.
    // 예를 들어, 파일에 값을 저장합니다.
    file_put_contents("average-rating.txt", $newAverageRating);

    // 현재 평균 평점 값을 반환합니다.
    echo $newAverageRating;
?>