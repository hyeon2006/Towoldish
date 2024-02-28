const initialDate = new Date();
initialDate.setHours(0, 0, 0, 0);

const urlParams = new URLSearchParams(window.location.search);
const rating = parseInt(urlParams.get('rating'));

const ratings = [5, 4, 4, 3, 5, 2];

if (!isNaN(rating) && initialDate.getTime() === new Date().setHours(0, 0, 0, 0)) {
    ratings.push(rating);
}

const sum = ratings.reduce((total, rating) => total + rating, 0);
const average = sum / ratings.length;

const avgElement = document.createElement('p');
avgElement.textContent = `평균 별점: ${average.toFixed(2)}`;

// 평균 값을 rating.html의 averageRating 요소에 추가합니다.
document.getElementById('averageRating').textContent = avgElement.textContent;