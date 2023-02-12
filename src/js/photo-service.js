import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const searchForm = document.querySelector('#search-form');
const loadMoreBtn = document.querySelector('.button_load-more');
const gallery = document.querySelector('.gallery');

const axios = require('axios').default;

const API_KEY = '30259589-e85b59f1319aa3b130ca376fa';
const BASE_URL = 'https://pixabay.com/api/';
const COUNT_IN_PAGE = 40;

const paramLoadMore = {
  query: '',
  page: 1,
  totalHits: 0,
};

const lightbox = new SimpleLightbox('.photo-card img', {
  sourceAttr: 'data-src',
  overlay: true,
  captionSelector: 'self',
  captionsData: 'alt',
  nav: true,
});

async function fetchPhotos(query = '', page = 1) {
  try {
    const pictures = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${COUNT_IN_PAGE}`
    );
    return pictures;
  } catch (error) {
    console.log(error);
  }
}

const createGalleryCards = hits => {
  const markup = hits
    .map(card => {
      return `<div class="photo-card">
    <img class="photo-card__image" src="${card.webformatURL}" data-src="${card.largeImageURL}" alt="${card.tags}" loading="lazy" />
    <div class="info">
      <p class="info-item">
        <b>Likes </b>${card.likes}
      </p>
      <p class="info-item">
        <b>Views </b>${card.views}
      </p>
      <p class="info-item">
        <b>Comments </b>${card.comments}
      </p>
      <p class="info-item">
        <b>Downloads </b>${card.downloads}
      </p>
    </div>
  </div>`;
    })
    .join('');
  return markup;
};

const onSearchFormSubmit = async event => {
  event.preventDefault();
  const query = event.target.elements.searchQuery.value.trim();
  if (!query.length) return;

  try {
    const response = await fetchPhotos(query, 1);
    const { data } = response;

    if (data.hits.length === 0) {
      Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      event.target.reset();
      gallery.innerHTML = '';
      loadMoreBtn.classList.add('is-hidden');
      return;
    }

    if (data.totalHits / 40 > 1) {
      loadMoreBtn.classList.remove('is-hidden');
    }

    paramLoadMore.query = query;
    paramLoadMore.totalHits = data.totalHits;

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    if (data.totalHits / 40 <= 1) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
    gallery.innerHTML = '';
    gallery.innerHTML = createGalleryCards(data.hits);
    lightbox.refresh();
  } catch (err) {
    console.log(err);
  }
};

const onLoadMore = async () => {
  paramLoadMore.page += 1;
  loadMoreBtn.classList.add('is-hidden');
  if (
    paramLoadMore.totalHits &&
    Math.ceil(paramLoadMore.totalHits / 40) >= paramLoadMore.page
  ) {
    const response = await fetchPhotos(paramLoadMore.query, paramLoadMore.page);
    gallery.insertAdjacentHTML(
      'beforeend',
      createGalleryCards(response.data.hits)
    );
    lightbox.refresh();

    if (Math.ceil(paramLoadMore.totalHits / 40) !== paramLoadMore.page) {
      loadMoreBtn.classList.remove('is-hidden');
    } else {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  }
};

searchForm.addEventListener('submit', onSearchFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMore);
