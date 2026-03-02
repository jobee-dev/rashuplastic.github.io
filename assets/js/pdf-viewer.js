/**
 * Rashu Plastic Project - PDF Viewer
 * Lazily loads PDF.js to ensure performance, keeping initial page load fast.
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnRead = document.getElementById('btn-read-online');
    const modal = document.getElementById('pdf-modal');
    const btnClose = document.getElementById('pdf-close');
    const btnPrev = document.getElementById('pdf-prev');
    const btnNext = document.getElementById('pdf-next');
    const pageNum = document.getElementById('pdf-page-num');
    const pageCount = document.getElementById('pdf-page-count');
    const canvasContainer = document.getElementById('pdf-canvas-container');
    const loader = document.getElementById('pdf-loader');

    // We will inject the canvas dynamically for easy animation handling
    let currentCanvas = null;

    let pdfDoc = null;
    let pageRendering = false;
    let pageNumPending = null;
    let currentPage = 1;
    let pdfjsLibLoaded = false;

    // Config
    const pdfUrl = 'Rashu Plastic Project 2026 Product Catalog.pdf';

    if (!btnRead) return;

    btnRead.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    btnClose.addEventListener('click', closeModal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('pdf-modal-backdrop')) {
            closeModal();
        }
    });

    btnPrev.addEventListener('click', onPrevPage);
    btnNext.addEventListener('click', onNextPage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') onNextPage();
        if (e.key === 'ArrowLeft') onPrevPage();
    });

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (!pdfjsLibLoaded) {
            loadPdfJs();
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function loadPdfJs() {
        loader.style.display = 'block';

        // Dynamically load the pdf.js library
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            pdfjsLibLoaded = true;
            // Configure worker
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            initPdf();
        };
        document.head.appendChild(script);
    }

    function initPdf() {
        pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc_ => {
            pdfDoc = pdfDoc_;
            pageCount.textContent = pdfDoc.numPages;
            renderPage(currentPage, 'initial');
            loader.style.display = 'none';
        }).catch(err => {
            console.error('Error loading PDF:', err);
            loader.textContent = 'Error loading the catalogue. Please try downloading instead.';
        });
    }

    function renderPage(num, direction = 'initial') {
        pageRendering = true;

        const isSpreadMode = window.innerWidth >= 1024;
        let displayNum = num;
        let pagesToRender = [];

        // Determine which pages construct this view
        if (isSpreadMode) {
            if (displayNum === 1) {
                pagesToRender = [1];
            } else {
                if (displayNum % 2 !== 0) displayNum--;
                pagesToRender = [displayNum];
                if (displayNum + 1 <= pdfDoc.numPages) {
                    pagesToRender.push(displayNum + 1);
                }
            }
        } else {
            pagesToRender = [displayNum];
        }

        currentPage = displayNum; // Sync current page tracker

        // Create Spread Wrapper
        const spreadDiv = document.createElement('div');
        spreadDiv.className = 'pdf-spread entering';

        if (direction === 'next') {
            spreadDiv.classList.add('slide-in-right');
        } else if (direction === 'prev') {
            spreadDiv.classList.add('slide-in-left');
        } else {
            spreadDiv.classList.add('fade-in');
        }

        // Render all requested pages into canvases
        Promise.all(pagesToRender.map(pageNumToRender => {
            return pdfDoc.getPage(pageNumToRender).then(page => {
                const unscaledViewport = page.getViewport({ scale: 1 });
                const containerWidth = canvasContainer.clientWidth;
                const containerHeight = canvasContainer.clientHeight;

                // Split available width for 2 pages if rendering a spread pair
                const availableWidth = pagesToRender.length === 2 ? (containerWidth - 60) / 2 : (containerWidth - 40);

                const scaleX = availableWidth / unscaledViewport.width;
                const scaleY = (containerHeight - 40) / unscaledViewport.height;
                const scale = Math.min(scaleX, scaleY, 2.5);

                const viewport = page.getViewport({ scale: scale });

                const newCanvas = document.createElement('canvas');
                const ctx = newCanvas.getContext('2d');

                // Handle High-DPI (Retina) Displays for sharp rendering on mobile
                const outputScale = window.devicePixelRatio || 1;
                newCanvas.width = Math.floor(viewport.width * outputScale);
                newCanvas.height = Math.floor(viewport.height * outputScale);
                newCanvas.style.width = Math.floor(viewport.width) + "px";
                newCanvas.style.height = Math.floor(viewport.height) + "px";

                const transform = outputScale !== 1
                    ? [outputScale, 0, 0, outputScale, 0, 0]
                    : null;

                // Add specific page classes for the center crease styling
                let extraClass = '';
                if (pagesToRender.length === 2) {
                    extraClass = pageNumToRender % 2 === 0 ? ' left-page' : ' right-page';
                }
                newCanvas.className = 'pdf-spread-canvas' + extraClass;

                const renderContext = {
                    canvasContext: ctx,
                    transform: transform,
                    viewport: viewport
                };

                return page.render(renderContext).promise.then(() => newCanvas);
            });
        })).then(canvases => {
            pageRendering = false;

            canvases.forEach(c => spreadDiv.appendChild(c));

            // Swap out old spread view
            if (currentCanvas) {
                const oldSpread = currentCanvas;
                oldSpread.classList.add('leaving');
                oldSpread.classList.remove('entering', 'slide-in-right', 'slide-in-left', 'fade-in');

                setTimeout(() => {
                    if (oldSpread.parentNode) {
                        oldSpread.parentNode.removeChild(oldSpread);
                    }
                }, 400);
            }

            canvasContainer.appendChild(spreadDiv);
            void spreadDiv.offsetWidth;
            spreadDiv.classList.remove('entering');
            currentCanvas = spreadDiv;

            if (pageNumPending !== null) {
                renderPage(pageNumPending, direction);
                pageNumPending = null;
            }
        }).catch(err => {
            console.error("Error rendering spread", err);
            pageRendering = false;
        });

        // Update UI Text
        if (pagesToRender.length === 1) {
            pageNum.textContent = pagesToRender[0];
        } else {
            pageNum.textContent = pagesToRender[0] + ' - ' + pagesToRender[1];
        }

        const firstPage = pagesToRender[0];
        const lastPage = pagesToRender[pagesToRender.length - 1];

        // Update button states
        btnPrev.style.opacity = firstPage <= 1 ? '0.3' : '1';
        btnPrev.style.pointerEvents = firstPage <= 1 ? 'none' : 'auto';

        btnNext.style.opacity = lastPage >= pdfDoc.numPages ? '0.3' : '1';
        btnNext.style.pointerEvents = lastPage >= pdfDoc.numPages ? 'none' : 'auto';
    }

    function queueRenderPage(num, direction) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num, direction);
        }
    }

    function onPrevPage() {
        if (currentPage <= 1 || pageRendering) return;

        let nextPage = currentPage;
        const isSpreadMode = window.innerWidth >= 1024;

        if (isSpreadMode) {
            if (currentPage === 2 || currentPage === 3) nextPage = 1;
            else nextPage = currentPage - 2;
        } else {
            nextPage = currentPage - 1;
        }

        queueRenderPage(nextPage, 'prev');
    }

    function onNextPage() {
        if (currentPage >= pdfDoc.numPages || pageRendering) return;

        let nextPage = currentPage;
        const isSpreadMode = window.innerWidth >= 1024;

        if (isSpreadMode) {
            if (currentPage === 1) nextPage = 2;
            else nextPage = currentPage + 2;
        } else {
            nextPage = currentPage + 1;
        }

        if (nextPage > pdfDoc.numPages) nextPage = pdfDoc.numPages;

        queueRenderPage(nextPage, 'next');
    }

    // Handle Window Resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        if (!modal.classList.contains('active') || !pdfDoc) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!pageRendering) {
                renderPage(currentPage, 'initial');
            }
        }, 200);
    });
});
