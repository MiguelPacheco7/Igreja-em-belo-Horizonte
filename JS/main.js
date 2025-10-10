document.addEventListener('DOMContentLoaded', () => {

    // Inicialização do Lenis para scroll suave
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothTouch: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // --- INÍCIO: LÓGICA PARA SCROLL SUAVE EM LINKS DE ÂNCORA (SOLUÇÃO) ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                // Previne o salto instantâneo padrão do navegador
                e.preventDefault();

                // Pega o ID da seção (ex: #sobre-nos)
                const targetId = this.getAttribute('href');

                // Rola para a seção usando Lenis
                lenis.scrollTo(targetId, {
                    duration: 1.4, // Usa a duração da sua configuração principal
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                });
            });
        });
        // --- FIM: LÓGICA PARA SCROLL SUAVE EM LINKS DE ÂNCORA (SOLUÇÃO) ---
    }

    // --- LÓGICA DO CARROSSEL 3D ATUALIZADA (SEM DESCRIÇÕES) ---
    const carouselContainers = document.querySelectorAll('.carousel-3d-container');
    if (carouselContainers.length > 0) {
        carouselContainers.forEach(container => {
            const track = container.querySelector('.carousel-3d-track');
            if (!track) return;

            const slides = Array.from(track.children);
            const nextButton = container.querySelector('#next-btn');
            const prevButton = container.querySelector('#prev-btn');

            if (slides.length === 0) return;

            let currentIndex = 0;
            const slideCount = slides.length;
            let autoplayInterval = null;
            const AUTOPLAY_DELAY = 5000;
            let touchStartX = 0;
            let touchEndX = 0;
            const swipeThreshold = 50;

            const stopAutoplay = () => {
                clearInterval(autoplayInterval);
            };

            const startAutoplay = () => {
                stopAutoplay();
                autoplayInterval = setInterval(goToNext, AUTOPLAY_DELAY);
            };

            const updateCarousel = () => {
                slides.forEach(slide => slide.classList.remove('active', 'prev', 'next'));

                const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
                const nextIndex = (currentIndex + 1) % slideCount;

                if (slides[currentIndex]) slides[currentIndex].classList.add('active');
                if (slides[prevIndex]) slides[prevIndex].classList.add('prev');
                if (slides[nextIndex]) slides[nextIndex].classList.add('next');
            };

            const goToNext = () => {
                currentIndex = (currentIndex + 1) % slideCount;
                updateCarousel();
            };

            const goToPrev = () => {
                currentIndex = (currentIndex - 1 + slideCount) % slideCount;
                updateCarousel();
            };

            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    goToNext();
                    startAutoplay();
                });
            }

            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    goToPrev();
                    startAutoplay();
                });
            }

            container.addEventListener('mouseenter', stopAutoplay);
            container.addEventListener('mouseleave', startAutoplay);

            const handleSwipe = () => {
                const swipeDistance = touchEndX - touchStartX;
                if (Math.abs(swipeDistance) > swipeThreshold) {
                    if (swipeDistance < 0) {
                        goToNext();
                    } else {
                        goToPrev();
                    }
                }
            };

            track.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                stopAutoplay();
            }, { passive: true });

            track.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].clientX;
                handleSwipe();
                startAutoplay();
            });

            // Inicia o carrossel
            updateCarousel();
            startAutoplay();
        });
    }

    // --- NOVA LÓGICA PARA O SLIDER DE AVISOS ---
    const avisosContainer = document.querySelector('.avisos-slider-container');
    if (avisosContainer) {
        const slides = document.querySelectorAll('.aviso-slide');
        const titleElement = document.getElementById('aviso-title');
        const nextBtn = document.getElementById('avisos-next-btn');
        const prevBtn = document.getElementById('avisos-prev-btn');

        // Dados dos títulos para cada slide
        const slideTitles = [
            "Oficina de Louvor",
            "Super Casa de Adolescentes",
            "Conferência da Família"
        ];

        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
            // Atualiza o título
            titleElement.style.opacity = 0;
            setTimeout(() => {
                titleElement.textContent = slideTitles[index];
                titleElement.style.opacity = 1;
            }, 250); // Metade da duração da transição do slide
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        // Adiciona eventos aos botões
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        // Mostra o primeiro slide ao carregar
        showSlide(currentSlide);
    }

    const openBtn = document.getElementById('open-history-modal');
    const closeBtn = document.getElementById('close-history-modal');
    const overlay = document.getElementById('history-modal-overlay');
    const card = document.getElementById('history-modal-card');

    // Função para abrir o modal
    function openModal() {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex'); // Adiciona o flex aqui

        void overlay.offsetWidth;

        overlay.classList.add('opacity-100');
        card.classList.remove('scale-95', 'opacity-0');
        card.classList.add('scale-100', 'opacity-100');
        document.body.style.overflow = 'hidden';
    }

    // Função para fechar o modal
    function closeModal() {
        overlay.classList.remove('opacity-100');
        card.classList.remove('scale-100', 'opacity-100');
        card.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex'); // Remove o flex aqui
            document.body.style.overflow = '';
        }, 300);
    }

    // 1. Abrir ao clicar no botão "Conheça mais"
    if (openBtn) {
        openBtn.addEventListener('click', openModal);
    }

    // 2. Fechar ao clicar no "X"
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // 3. Fechar ao clicar fora do card (no overlay)
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            // Verifica se o clique foi exatamente no overlay e não em um elemento filho
            if (e.target === overlay) {
                closeModal();
            }
        });
    }

}); // <-- Esta chave e parêntese fecham o 'DOMContentLoaded'