const btnUp = document.querySelector('#button-up');

function onScroll() {
  if (window.pageYOffset > 200) {
    btnUp.classList.add('active');
  } else {
    btnUp.classList.remove('active');
  }
}

function goToPageTop() {
  if (window.pageYOffset > 0) {
    window.scrollTo({ top: 0 });
  }
}

window.addEventListener('scroll', onScroll);
btnUp.addEventListener('click', goToPageTop);
