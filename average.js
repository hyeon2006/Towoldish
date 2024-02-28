// 이전에 입력한 별점 값을 저장하기 위한 localStorage 변수
let ratings = JSON.parse(localStorage.getItem('ratings')) || [];

// 초기화 기준일자를 저장합니다.
const initialDate = new Date();
initialDate.setHours(0, 0, 0, 0);
localStorage.setItem('initialDate', initialDate.getTime());

// 사용자가 입력한 별점 값을 저장합니다.
if (window.location.pathname === '/rating.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const rating = parseInt(urlParams.get('rating'));

    if (!isNaN(rating)) {
        ratings.push(rating);
        localStorage.setItem('ratings', JSON.stringify(ratings));
    }
}

// ratings 배열에서 별점의 합계와 평균을 계산합니다.
const sum = ratings.reduce((total, rating) => total + rating, 0);
const average = sum / ratings.length;

// 평균 값을 localStorage에 추가합니다.
localStorage.setItem('average', average);

// 평균 값을 rating.html의 averageRating 요소에 추가합니다.
const avgElement = document.createElement('p');
avgElement.textContent = `평균 별점: ${localStorage.getItem('average')}`;
document.getElementById('averageRating').textContent = avgElement.textContent;

// 초기화 기준일자와 현재 일자를 비교하여 별점과 평균 값을 초기화합니다.
const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);
const currentTime = currentDate.getTime();
const initialTime = parseInt(localStorage.getItem('initialDate'));

if (currentTime > initialTime) {
    localStorage.setItem('ratings', JSON.stringify([]));
    localStorage.setItem('initialDate', currentTime);
    localStorage.setItem('average', 0);
}