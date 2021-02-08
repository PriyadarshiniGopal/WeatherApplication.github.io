let stars = document.querySelectorAll('.clip-star');
let text = document.getElementsByName('rating-text');
let button = document.querySelector('.rating-button');

function starClick(e) {
    for (let index = 0; index < e.target.getAttribute('star'); index++)
        stars[index].style.background = 'gold';
}

function updateBarWidth() {
    let totalReviewCount, totalStars = 0;
    for (let bar = 1; bar < 6; bar++) {
        let barReviewCount = Number(document.querySelectorAll('.side.right')[5 - bar].textContent);
        totalReviewCount = 0;
        for (let reviewCount of document.querySelectorAll('.side.right')) {
            totalReviewCount += Number(reviewCount.textContent);
        }
        document.querySelector('.bar-' + bar).style.width = 100 * barReviewCount / totalReviewCount + '%';
        totalStars += (bar * barReviewCount)
    }
    document.getElementsByName("rating-average")[0].innerHTML = (totalStars / totalReviewCount).toFixed(2) + ' average based on ' + totalReviewCount + ' reviews.';
}
function changeText(e) {
    let starCount = 0;
    for (let star of stars) {
        if (star.style.background === 'gold')
            starCount++;
        star.style.background = 'white';
    }
    if (starCount == 0) {
        document.getElementById('rating-error-msg').innerHTML = "Please select stars !";
        return;
    }
    document.getElementById('rating-error-msg').innerHTML = "";
    let review = document.querySelectorAll('.side.right')[5 - starCount];
    let reviewCount = Number(review.textContent) + 1;
    review.textContent = reviewCount;
    updateBarWidth();
}

updateBarWidth();
for (let star of stars) {
    star.addEventListener('click', starClick);
}
button.addEventListener('click', changeText);