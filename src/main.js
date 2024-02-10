import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.form'),
  gallery: document.querySelector('.gallery'),
  loader: document.querySelector('.loader'),
};
function toggleLoader() {
  refs.loader.classList.toggle('hidden');
}

refs.form.addEventListener('submit', onFormSubmit);

function getImagesByName(name) {
  const searchParams = new URLSearchParams({
    key: '42272856-fbb9ecaa9aa7f62044da3b204',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    q: name,
  });
  const BASE_URL = 'https://pixabay.com/api/';
  const PARAMS = `?${searchParams}`;
  const url = BASE_URL + PARAMS;
  return fetch(url).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(res.status);
    }
  });
}

function onFormSubmit(event) {
  event.preventDefault();
  toggleLoader();
  const query = event.target.elements.query.value;
  getImagesByName(query)
    .then(data => {
      toggleLoader();
      if (query === '') {
        iziToast.warning({
          message:
            'Sorry, you forgot to enter a search term. Please try again!',
          position: 'topRight',
          messageSize: '16px',
          timeout: 2000,
        });
        return;
      } else if (parseInt(data.totalHits) > 0) {
        renderMarkup(data.hits);
      } else {
        refs.gallery.innerHTML = '';
        iziToast.error({
          message:
            'Sorry, there are no images matching your search query. Please try again!',
          position: 'topRight',
          backgroundColor: 'red',
          messageColor: 'white',
          messageSize: '16px',
          iconColor: 'white',
          iconUrl: errorIcon,
          color: 'white',
          timeout: 2000,
        });
      }
    })
    .catch(err => {
      iziToast.error({
        message: 'Error',
        position: 'topRight',
        backgroundColor: 'red',
        messageColor: 'white',
        messageSize: '16px',
        iconColor: 'white',
        iconUrl: errorIcon,
        color: 'white',
        timeout: 2000,
      });
    });
  event.target.reset();
}

function galleryTemplate({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<a class="gallery-link" href="${largeImageURL}"><img class="gallery-image" src="${webformatURL}" alt="${tags}"/>
  <div class="gallery-review">
  <div class="gallery-review-item"><b>Likes</b> <span>${likes}</span></div>
  <div class="gallery-review-item"><b>Views</b> <span>${views}</span></div>
  <div class="gallery-review-item"><b>Comments</b> <span>${comments}</span></div>
  <div class="gallery-review-item"><b>Downloads</b> <span>${downloads}</span></div>
  </div></a>
    `;
}

let gallery = new SimpleLightbox('.gallery a', {
  showCounter: false,
  captionDelay: 250,
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
});

function renderMarkup(images) {
  const markup = images.map(galleryTemplate).join('');
  refs.gallery.innerHTML = markup;
  gallery.refresh();
}