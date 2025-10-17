document.addEventListener('DOMContentLoaded', () => {

    // Declara a variável `lenis` em um escopo mais amplo para ser acessível em outras funções.
    let lenis;

    // NOVO: Variável para a instância Lenis do card
    let cardLenis;

    // Inicialização do Lenis para scroll suave
    if (typeof Lenis !== 'undefined') {
        // Atribui a instância à variável `lenis`.
        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothTouch: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Lógica para scroll suave em links de âncora
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                lenis.scrollTo(targetId, {
                    duration: 1.4,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                });
            });
        });
    }

    // --- NOVO: LÓGICA DO LENIS NO CARD (APENAS DESKTOP) ---

    // Função para gerenciar a inicialização do Lenis no card
    function setupCardLenis() {
        // Usa o ID que você deve ter adicionado no elemento de rolagem do card no index.html
        const scrollElement = document.getElementById('history-scroll-content');
        const isDesktop = window.innerWidth >= 768; // Tailwind 'md' breakpoint

        // Destrói a instância anterior se existir (útil para eventos de resize)
        if (cardLenis) {
            cardLenis.destroy();
            cardLenis = null;
        }

        // Inicializa o Lenis APENAS no desktop e se o elemento existir
        if (isDesktop && scrollElement) {
            cardLenis = new Lenis({
                wrapper: scrollElement,
                content: scrollElement,
                duration: 1.4,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });

            // Loop de animação específico para o scroll do card
            function cardRaf(time) {
                if (cardLenis) {
                    cardLenis.raf(time);
                    requestAnimationFrame(cardRaf);
                }
            }
            requestAnimationFrame(cardRaf);

            // Importante: Inicializa parado, será ativado em openModal
            cardLenis.stop();
        }
    }

    // Chama a função de setup ao carregar e ao redimensionar (para alternar desktop/mobile)
    setupCardLenis();
    window.addEventListener('resize', setupCardLenis);


    // Define o ano atual no rodapé
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Lógica para o menu mobile
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');
            // Um pequeno atraso para garantir que a transição CSS funcione
            setTimeout(() => {
                mobileMenu.classList.remove('-translate-x-full');
                mobileMenu.classList.add('translate-x-0');
            }, 10);
        });
    }

    const closeMenu = () => {
        if (mobileMenu) {
            mobileMenu.classList.add('-translate-x-full');
            mobileMenu.classList.remove('translate-x-0');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300); // Espera a transição terminar
        }
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMenu);
    }

    if (mobileMenu) {
        const allNavLinks = mobileMenu.querySelectorAll('a');
        allNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(closeMenu, 100);
            });
        });
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

    // --- LÓGICA DO MODAL (Nossa História) ---
    const openBtn = document.getElementById('open-history-modal');
    const closeBtn = document.getElementById('close-history-modal');
    const overlay = document.getElementById('history-modal-overlay'); // VERIFIQUE ESTE ID
    const historyCard = document.getElementById('history-modal-card'); // VERIFIQUE ESTE ID

    // Função para abrir o modal
    function openModal() {
        scrollPosition = window.scrollY; // Salva a posição atual do scroll

        // Animação de entrada
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.add('opacity-100');
            historyCard.classList.remove('scale-95', 'opacity-0');
            historyCard.classList.add('scale-100', 'opacity-100');
        }, 10);

        // Trava o scroll do body (Mantenha o código existente)
        document.body.classList.add('body-lock');
        document.body.style.top = `-${scrollPosition}px`;

        // Lógica Lenis: Pausa o scroll da página e ativa o scroll do card
        if (lenis) {
            lenis.stop();
        }
        if (cardLenis) {
            cardLenis.start();
        }
    }

    function closeModal() {
        // Animação de saída
        historyCard.classList.remove('scale-100', 'opacity-100');
        historyCard.classList.add('scale-95', 'opacity-0');
        overlay.classList.remove('opacity-100');

        // Lógica Lenis: Para o scroll do card e reativa o scroll da página
        if (cardLenis) {
            cardLenis.stop();
        }
        if (lenis) {
            lenis.start();
        }

        // Destrava o scroll do body e retorna para a posição salva
        setTimeout(() => {
            document.body.classList.remove('body-lock');
            window.scrollTo(0, scrollPosition);
            document.body.style.top = '';
            overlay.classList.add('hidden');
        }, 300); // Duração da animação de saída
    }

    if (openBtn) {
        openBtn.addEventListener('click', openModal);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }

    // --- LÓGICA DO BOTÃO FLUTUANTE DE ORAÇÃO ---
    const floatingBtn = document.getElementById('floating-prayer-button');
    const footer = document.getElementById('contato'); // O footer tem o ID "contato"

    if (lenis && floatingBtn && footer) {
        // Usa o evento 'scroll' do Lenis para melhor precisão
        lenis.on('scroll', (e) => {
            const scrollPosition = e.scroll;
            const windowHeight = window.innerHeight;

            // Ponto onde o rodapé começa a ficar visível
            // (offsetTop é a distância do topo do elemento até o topo da página)
            const footerTop = footer.offsetTop;

            // Condição para mostrar o botão:
            // 1. O usuário rolou mais de 500px para baixo.
            // 2. O final da janela ainda NÃO alcançou o topo do rodapé.
            if ((scrollPosition + windowHeight) < footerTop) {
                floatingBtn.classList.add('show');
            } else {
                floatingBtn.classList.remove('show');
            }
        });
    }
});