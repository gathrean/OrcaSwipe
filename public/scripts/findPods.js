const stack = document.querySelector('.stack');
        const cards = Array.from(document.querySelectorAll('.card'));

        let currentCardIndex = 0;
        let isDragging = false;
        let startPosX = 0;
        let currentTranslateX = 0;

        stack.addEventListener('mousedown', handleDragStart);
        stack.addEventListener('touchstart', handleDragStart);
        stack.addEventListener('mousemove', handleDragMove);
        stack.addEventListener('touchmove', handleDragMove);
        stack.addEventListener('mouseup', handleDragEnd);
        stack.addEventListener('touchend', handleDragEnd);

        function handleDragStart(event) {
            if (event.type === 'touchstart') {
                startPosX = event.touches[0].clientX;
            } else {
                startPosX = event.clientX;
            }

            isDragging = true;
        }

        function handleDragMove(event) {
            event.preventDefault();

            if (isDragging) {
                let currentPosX = 0;

                if (event.type === 'touchmove') {
                    currentPosX = event.touches[0].clientX;
                } else {
                    currentPosX = event.clientX;
                }

                const translateX = currentPosX - startPosX + currentTranslateX;
                cards[currentCardIndex].style.transform = `translateX(${translateX}px)`;
            }
        }

        function handleDragEnd(event) {
            isDragging = false;

            if (event.type === 'touchend') {
                const currentPosX = event.changedTouches[0].clientX;
                currentTranslateX = currentPosX - startPosX + currentTranslateX;
            } else {
                const currentPosX = event.clientX;
                currentTranslateX = currentPosX - startPosX + currentTranslateX;
            }

            if (currentTranslateX > 100) {
                swipeRight();
            } else if (currentTranslateX < -100) {
                swipeLeft();
            } else {
                resetPosition();
            }
        }

        function swipeRight() {
            cards[currentCardIndex].style.transform = `translateX(1000px)`;
            cards[currentCardIndex].style.transition = 'transform 0.3s ease-in-out';

            setTimeout(() => {
                cards[currentCardIndex].style.display = 'none';
                cards[currentCardIndex].style.transition = '';

                currentCardIndex++;
                if (currentCardIndex >= cards.length) {
                    currentCardIndex = 0;
                }

                cards[currentCardIndex].style.display = 'block';
                cards[currentCardIndex].style.transform = '';
            }, 300);
        }

        function swipeLeft() {
            cards[currentCardIndex].style.transform = `translateX(-1000px)`;
            cards[currentCardIndex].style.transition = 'transform 0.3s ease-in-out';

            setTimeout(() => {
                cards[currentCardIndex].style.display = 'none';
                cards[currentCardIndex].style.transition = '';

                currentCardIndex++;
                if (currentCardIndex >= cards.length) {
                    currentCardIndex = 0;
                }

                cards[currentCardIndex].style.display = 'block';
                cards[currentCardIndex].style.transform = '';
            }, 300);
        }

        function resetPosition() {
            cards[currentCardIndex].style.transform = '';
        }