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

        pdfDoc.getPage(num).then(page => {
            // Determine scale based on viewport to make it responsive
            const unscaledViewport = page.getViewport({ scale: 1 });
            const containerWidth = canvasContainer.clientWidth;
            const containerHeight = canvasContainer.clientHeight;

            // We want it to fit inside the screen comfortably
            const scaleX = (containerWidth - 40) / unscaledViewport.width;
            const scaleY = (containerHeight - 40) / unscaledViewport.height;
            const scale = Math.min(scaleX, scaleY, 2.5); // Cap scale at 2.5 for crispness, but fit screen

            const viewport = page.getViewport({ scale: scale });

            // Create new canvas for crossfade animation
            const newCanvas = document.createElement('canvas');
            const ctx = newCanvas.getContext('2d');
            newCanvas.height = viewport.height;
            newCanvas.width = viewport.width;
            newCanvas.className = 'pdf-canvas entering';

            // Set animation direction
            if (direction === 'next') {
                newCanvas.classList.add('slide-in-right');
            } else if (direction === 'prev') {
                newCanvas.classList.add('slide-in-left');
            } else {
                newCanvas.classList.add('fade-in');
            }

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                pageRendering = false;

                // Swap canvases for smooth transition
                if (currentCanvas) {
                    const oldCanvas = currentCanvas;
                    oldCanvas.classList.add('leaving');
                    oldCanvas.classList.remove('entering', 'slide-in-right', 'slide-in-left', 'fade-in');

                    setTimeout(() => {
                        if (oldCanvas.parentNode) {
                            oldCanvas.parentNode.removeChild(oldCanvas);
                        }
                    }, 400); // Wait for transition to finish
                }

                canvasContainer.appendChild(newCanvas);

                // Trigger reflow to start fade
                void newCanvas.offsetWidth;
                newCanvas.classList.remove('entering');
                currentCanvas = newCanvas;

                if (pageNumPending !== null) {
                    renderPage(pageNumPending, direction);
                    pageNumPending = null;
                }
            });
        });

        pageNum.textContent = num;

        // Update button states
        btnPrev.style.opacity = num <= 1 ? '0.3' : '1';
        btnPrev.style.pointerEvents = num <= 1 ? 'none' : 'auto';

        btnNext.style.opacity = num >= pdfDoc.numPages ? '0.3' : '1';
        btnNext.style.pointerEvents = num >= pdfDoc.numPages ? 'none' : 'auto';
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
        currentPage--;
        queueRenderPage(currentPage, 'prev');
    }

    function onNextPage() {
        if (currentPage >= pdfDoc.numPages || pageRendering) return;
        currentPage++;
        queueRenderPage(currentPage, 'next');
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
