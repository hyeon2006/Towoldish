function resetCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

function resetCookieAtMidnight() {
    var now = new Date();
    var midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // 다음 날 자정
        0, 0, 0
    );
    var timeUntilMidnight = midnight - now;
    setTimeout(function() {
        resetCookie('rating'); // 초기화할 쿠키 이름 입력
        resetCookieAtMidnight(); // 자정마다 계속 초기화
    }, timeUntilMidnight);
}

// 페이지가 로드될 때 초기화 함수 실행
resetCookieAtMidnight();