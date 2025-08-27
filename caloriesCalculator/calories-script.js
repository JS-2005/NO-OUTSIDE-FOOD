// This script manages the UI interactions, history, and display rendering for the Calorie Calculator.
// The core analysis logic is handled by the script in caloriesCalculator.html.

$(document).ready(function () {
    // --- 1. Element Caching ---
    const elements = {
        choiceSection: $('#choiceSection'),
        textAnalyzerSection: $('#textAnalyzerSection'),
        imageAnalyzerSection: $('#imageAnalyzerSection'),
        historyContainer: $('#historyContainer'),
        textInput: $('#textInput'),
        textResultsContent: $('#textResultsContent'),
        allCaloriesList: $('#allCaloriesList'),
        viewAllBtn: $('#viewAllBtn'),
        socialShareContainer: $('#socialShareContainer'),
        shareTwitter: $('#shareTwitter'),
        shareFacebook: $('#shareFacebook'),
        historyList: $('#historyList'),
        imagePreview: $('#imagePreview'),
        imagePreviewText: $('#imagePreviewText'),
        iconBackground: $('#iconBackground')
    };

    // --- 2. UI and View Management ---

    function setMode(mode) {
        elements.choiceSection.toggle(mode === 'choice');
        elements.textAnalyzerSection.toggle(mode === 'text');
        elements.imageAnalyzerSection.toggle(mode === 'image');
        elements.historyContainer.toggle(mode === 'choice');

        if (mode === 'choice') {
            renderHistory();
        }
    }

    // --- 3. Event Handlers ---

    $('#chooseTextBtn').on('click', () => setMode('text'));
    $('#chooseImageBtn').on('click', () => setMode('image'));
    $('.back-btn').on('click', () => setMode('choice'));

    $('#imageUpload').on('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                elements.imagePreview.attr('src', e.target.result).show();
                elements.imagePreviewText.hide();
            };
            reader.readAsDataURL(file);
        }
    });

    $('body').on('click', '.candidate-card', function () {
        const $card = $(this);
        const $resultsContainer = $card.closest('.results-section').find('#textResultsContent, #imageResultsContent');
        const result = $card.data('food-data');

        if (result) {
            displayResults(result, $resultsContainer);
            saveToHistory(result);
            $('html, body').animate({ scrollTop: $resultsContainer.offset().top - 80 }, 300);
        }
    });

    // --- 4. Display & Rendering Functions (Exposed Globally) ---

    function displayCandidates(list, $resultsContainer) {
        const cards = list.map(f => {
            const foodDataString = JSON.stringify(f);
            return `<button type="button" class="candidate-card" data-food-data='${foodDataString}' title="Choose ${f.name}">
                        <div class="candidate-name">${f.name}</div>
                        <div class="candidate-calories">${f.calories} kcal</div>
                    </button>`;
        }).join('');

        const html = `<div class="candidate-wrap">
                        <p class="mb-3 text-muted">We found a few possible matches — please select the correct one:</p>
                        <div class="candidate-grid">${cards}</div>
                      </div>`;
        $resultsContainer.html(html);
    }
    window.displayCandidates = displayCandidates;

    function displayResults(data, $resultsContainer) {
        const resultsHtml = `
            <div class="result-header">
                <div class="result-info-col">
                    <h3 class="food-title mb-1">${data.name}</h3>
                    <div class="calories-highlight-xl">${Math.round(data.calories)} <span>kcal</span></div>
                </div>
            </div>
            <ul class="list-group list-group-flush mt-3">
                <li class="list-group-item d-flex justify-content-between"><span>Serving Size</span> <strong>${data.servingSize || 'N/A'}</strong></li>
                <li class="list-group-item d-flex justify-content-between"><span>Protein</span> <strong>${data.protein || 'N/A'}</strong></li>
                <li class="list-group-item d-flex justify-content-between"><span>Carbohydrates</span> <strong>${data.carbohydrates || 'N/A'}</strong></li>
                <li class="list-group-item d-flex justify-content-between"><span>Fat</span> <strong>${data.fat || 'N/A'}</strong></li>
            </ul>`;
        $resultsContainer.html(resultsHtml);
        updateSocialShareLinks(data.name, data.calories);
        if ($resultsContainer.is('#textResultsContent')) {
            elements.socialShareContainer.show();
        }
    }
    window.displayResults = displayResults;

    function updateSocialShareLinks(foodName, calories) {
        const shareText = `I just found out ${foodName} has about ${Math.round(calories)} calories! Check out this AI-powered calculator.`;
        const pageUrl = window.location.href;
        elements.shareTwitter.attr('href', `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`);
        elements.shareFacebook.attr('href', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(shareText)}`);
    }

    // --- 5. History Management (Using LocalStorage) ---

    function getHistory() {
        return JSON.parse(localStorage.getItem('calorieHistory_ai_no_pics_fixed')) || [];
    }

    function saveToHistory(data) {
        let history = getHistory();
        history = history.filter(item => item.name !== data.name);

        // *** BUG FIX: Save the ENTIRE data object, not just parts of it. ***
        history.unshift(data);

        if (history.length > 5) history.length = 5;
        localStorage.setItem('calorieHistory_ai_no_pics_fixed', JSON.stringify(history));
        renderHistory();
    }
    window.saveToHistory = saveToHistory;

    function renderHistory() {
        const history = getHistory();
        elements.historyList.empty();

        if (history.length === 0) {
            elements.historyContainer.hide();
            return;
        }

        elements.historyContainer.show();
        history.forEach(item => {
            const itemDataString = JSON.stringify(item);
            elements.historyList.append(`
                <div class="list-group-item history-item d-flex justify-content-between align-items-center" data-food-data='${itemDataString}' role="button">
                    <div class="d-flex align-items-center gap-2">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">${item.name}</div>
                        </div>
                    </div>
                    <span class="badge bg-primary rounded-pill">${item.calories} kcal</span>
                </div>`);
        });
    }

    elements.historyList.on('click', '.history-item', function () {
        const result = $(this).data('food-data');
        if (result) {
            setMode('text');
            displayResults(result, elements.textResultsContent);
            $('html, body').animate({ scrollTop: elements.textResultsContent.offset().top - 80 }, 300);
        }
    });

    $('#clearHistoryBtn').on('click', () => {
        if (confirm("Are you sure you want to clear your history?")) {
            localStorage.removeItem('calorieHistory_ai_no_pics_fixed');
            renderHistory();
        }
    });

    // --- 6. Animated Background ---
    function createIconBackground() {
        if (!elements.iconBackground.length) return;
        const icons = ['fa-burger', 'fa-pizza-slice', 'fa-hotdog', 'fa-ice-cream', 'fa-candy-cane', 'fa-drumstick-bite'];
        const iconCount = Math.ceil(($(window).width() * $(window).height()) / (150 * 150)) * 2;
        let iconsHtml = '';
        for (let i = 0; i < iconCount; i++) {
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            const randomDuration = (Math.random() * 6 + 7).toFixed(2);
            const randomDelay = (Math.random() * 5).toFixed(2);
            iconsHtml += `<i class="fa-solid ${randomIcon}" style="animation-duration: ${randomDuration}s; animation-delay: -${randomDelay}s;"></i>`;
        }
        elements.iconBackground.html(iconsHtml);
    }

    // --- 7. Initialization ---
    setMode('choice');
    renderHistory();
    createIconBackground();
});
