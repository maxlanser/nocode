document.addEventListener("DOMContentLoaded", () => {
  // Получаем ссылку на блок, в котором будет находиться видеоролик
  const videoBlock = document.getElementById('video');

  function addVideo() {
    videoBlock.classList.add('hero__video--active');

    // Создаем элемент видео
    const video = document.createElement('video');
    video.src = 'video/coding.mp4'; // Замените на свой путь к видеоролику
    video.controls = true; // Добавляем элементы управления для видео
    video.loop = true;

    // Добавляем видео в блок
    videoBlock.appendChild(video);

    // Воспроизводим видеоролик
    video.play();
  }

  // Добавляем обработчик события клика на блок
  videoBlock.addEventListener('click', addVideo, {once: true});


  const swiper = new Swiper('.swiper', {
    slidesPerView: "auto",
    spaceBetween: 20,
    autoplay: {
      delay: 2500,
      disableOnInteraction: true
    },
    speed: 1000
  });

  const items = document.querySelectorAll(".faq__label");

  function toggleFaq(e) {
    const faqToggle = e.target.classList.contains('faq__label--active');

    for (i = 0; i < items.length; i++) {
      items[i].classList.remove('faq__label--active');
    }

    if (!faqToggle) {
      this.classList.add('faq__label--active');
    }
  }

  items.forEach(item => item.addEventListener('click', toggleFaq));
});
