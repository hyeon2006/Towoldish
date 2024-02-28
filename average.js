// 평균을 계산하는 서버 측 스크립트의 URL
const AVERAGE_SCRIPT_URL = "towol.n-e.kr//calculate-average.php";

function sendRatingToServer(event) {
    event.preventDefault();

    const ratingInputs = document.forms.rating.elements;
    let totalRating = 0;
    let validRatingCount = 0;

    for (let i = 0; i < ratingInputs.length; i++) {
        const rating = ratingInputs[i];

        if (rating.checked && rating.value >= 1 && rating.value <= 5) {
            totalRating += parseInt(rating.value);
            validRatingCount++;
        }
    }

    if (validRatingCount > 0) {
        const averageRating = totalRating / validRatingCount;

        // 서버에 평균 평점 값을 전송합니다.
        const xhr = new XMLHttpRequest();
        xhr.open("POST", AVERAGE_SCRIPT_URL, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                const newAverageRating = parseFloat(this.responseText);
                alert(`새로운 평균 평점: ${newAverageRating}`);
            }
        };
        xhr.send(`averageRating=${averageRating}`);

        // form을 초기화하거나 결과를 표시합니다.
        document.forms.rating.reset();
    } else {
        alert("유효한 평점을 입력하세요.");
    }
}