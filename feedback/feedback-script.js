$(document).ready(function () {

    // --- Social Share Links ---
    (function setShareLinks() {
        var pageUrl = window.location.href;
        var text = encodeURIComponent("Check out this Street Food feedback page!");
        var twitter = "https://twitter.com/intent/tweet?text=" + text + "&url=" + encodeURIComponent(pageUrl);
        var facebook = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(pageUrl);
        $('.social-icons .twitter').attr('href', twitter).attr('target', '_blank').attr('rel', 'noopener noreferrer');
        $('.social-icons .facebook').attr('href', facebook).attr('target', '_blank').attr('rel', 'noopener noreferrer');
        $('.social-icons .instagram').attr('href', "https://www.instagram.com/").attr('target', '_blank').attr('rel', 'noopener noreferrer');
    })();

    // --- API & Storage Logic ---
    $('#randomUserBtn').on('click', function () {
        const apiUrl = 'https://randomuser.me/api/?inc=name';
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function (data) {
                if (data.results && data.results[0]) {
                    const user = data.results[0];
                    const fullName = `${user.name.first} ${user.name.last}`;
                    $('#userName').val(fullName);
                    sessionStorage.setItem('userName', fullName);
                }
            }
        });
    });

    const formFields = ['userName', 'stallName', 'comments'];
    formFields.forEach(fieldId => {
        const inputElement = $(`#${fieldId}`);
        inputElement.val(sessionStorage.getItem(fieldId) || '');
        inputElement.on('input', () => { sessionStorage.setItem(fieldId, inputElement.val()); });
    });

    // --- START: Range Slider Update Logic ---
    // This function updates both the number display and the visual fill of the slider.
    function updateRangeSlider(input) {
        const $input = $(input);
        const min = $input.attr('min') || 1;
        const max = $input.attr('max') || 5;
        const value = $input.val();

        // Update the number output
        $input.prev('div').find('output').text(value);

        // Calculate the percentage to fill the track and set the CSS custom property
        const percent = ((value - min) / (max - min)) * 100;
        $input.css('--fill-percent', `${percent}%`);
    }

    // Add event listener and trigger it once on page load to set the initial state.
    $('input[type="range"]').on('input', function () {
        updateRangeSlider(this);
    }).each(function () {
        updateRangeSlider(this);
    });
    // --- END: Range Slider Update Logic ---


    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    $('#toggleReviewsBtn').on('click', function () {
        const $feedbackList = $('#feedback-list');
        const isVisible = $feedbackList.is(':visible');
        $feedbackList.slideToggle(300);
        $(this).text(isVisible ? 'Show Reviews' : 'Hide Reviews');
        setCookie('reviewsHidden', isVisible, 7);
    });

    // --- Main Feedback Logic ---
    function renderFeedback() {
        const allFeedback = JSON.parse(localStorage.getItem('allFeedback')) || [];
        const $feedbackList = $('#feedback-list');
        const currentUser = sessionStorage.getItem('currentUser');
        $feedbackList.empty();

        if (allFeedback.length === 0) {
            $feedbackList.html('<p class="text-muted">No reviews yet. Be the first to share!</p>');
        } else {
            allFeedback.slice().reverse().forEach((item, index) => {
                const originalIndex = allFeedback.length - 1 - index;
                let actionButtons = '';
                if (currentUser && currentUser === item.userName) {
                    actionButtons = `
                        <div class="review-actions">
                            <button class="action-btn edit-btn" data-index="${originalIndex}" title="Edit"><i class="fas fa-pen-to-square"></i></button>
                            <button class="action-btn delete-btn" data-index="${originalIndex}" title="Delete"><i class="fas fa-trash"></i></button>
                        </div>`;
                }

                $feedbackList.append(`
                    <div class="card review-card mb-3" data-index="${originalIndex}">
                        <div class="card-body">
                            ${actionButtons}
                            <h5 class="card-title">${item.userName} reviewed <span class="stall">${item.stallName}</span></h5>
                            <div class="rating-display mb-2">
                                <small class="text-muted">
                                    <b>Overall:</b> ${item.rating}/5 | <b>Taste:</b> ${item.taste}/5 | <b>Authenticity:</b> ${item.authenticity}/5
                                </small>
                            </div>
                            <p class="card-text comment-text">"${item.comments}"</p>
                            <div class="edit-area mt-3" style="display: none;">
                                <textarea class="form-control">${item.comments}</textarea>
                                <div class="d-flex justify-content-end gap-2 mt-2">
                                    <button class="btn btn-sm btn-secondary cancel-btn">Cancel</button>
                                    <button class="btn btn-sm btn-success save-btn">Save</button>
                                </div>
                            </div>
                        </div>
                    </div>`);
            });
        }
    }

    $('#feedbackForm').on('submit', function (event) {
        event.preventDefault();
        const userName = $('#userName').val();
        const newFeedback = {
            id: Date.now(),
            userName: userName,
            stallName: $('#stallName').val(),
            rating: $('#rating').val(),
            taste: $('#taste').val(),
            authenticity: $('#authenticity').val(),
            comments: $('#comments').val(),
        };
        const allFeedback = JSON.parse(localStorage.getItem('allFeedback')) || [];
        allFeedback.push(newFeedback);
        localStorage.setItem('allFeedback', JSON.stringify(allFeedback));
        sessionStorage.setItem('currentUser', userName);
        this.reset();
        // Reset sliders to their default state after submission
        $('input[type="range"]').each(function () {
            $(this).val(3);
            updateRangeSlider(this);
        });
        formFields.forEach(fieldId => sessionStorage.removeItem(fieldId));
        renderFeedback();
        alert('Thank you for your feedback!');
    });

    // --- Edit and Delete Event Handlers ---
    $('#feedback-list').on('click', '.delete-btn', function () {
        if (confirm("Are you sure you want to delete this review?")) {
            const index = $(this).data('index');
            let allFeedback = JSON.parse(localStorage.getItem('allFeedback')) || [];
            allFeedback.splice(index, 1);
            localStorage.setItem('allFeedback', JSON.stringify(allFeedback));
            renderFeedback();
        }
    });

    $('#feedback-list').on('click', '.edit-btn', function () {
        const $cardBody = $(this).closest('.card-body');
        $cardBody.find('.comment-text, .rating-display, .card-title, .review-actions').hide();
        $cardBody.find('.edit-area').slideDown();
    });

    $('#feedback-list').on('click', '.cancel-btn', function () {
        const $cardBody = $(this).closest('.card-body');
        $cardBody.find('.edit-area').slideUp(() => {
            $cardBody.find('.comment-text, .rating-display, .card-title, .review-actions').show();
        });
    });

    $('#feedback-list').on('click', '.save-btn', function () {
        const $card = $(this).closest('.card');
        const index = $card.data('index');
        const newComment = $card.find('textarea').val();
        let allFeedback = JSON.parse(localStorage.getItem('allFeedback')) || [];
        if (allFeedback[index]) {
            allFeedback[index].comments = newComment;
            localStorage.setItem('allFeedback', JSON.stringify(allFeedback));
            renderFeedback();
        }
    });

    // --- START: Animated Background ---
    /**
     * Generates the dynamic, animated background using Font Awesome icons.
     */
    function createIconBackground() {
        const backgroundContainer = $('#iconBackground');
        if (!backgroundContainer.length) return;

        const icons = ['fa-burger', 'fa-pizza-slice', 'fa-hotdog', 'fa-ice-cream', 'fa-candy-cane', 'fa-drumstick-bite'];
        const iconCount = Math.ceil(($(window).width() * $(window).height()) / (150 * 150)) * 2;

        let iconsHtml = '';
        for (let i = 0; i < iconCount; i++) {
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            // Randomize animation duration for a more natural, less uniform movement.
            const randomDuration = (Math.random() * 2.55 + 3).toFixed(2);
            const randomDelay = (Math.random() * 5).toFixed(2);
            iconsHtml += `<i class="fa-solid ${randomIcon}" style="animation-duration: ${randomDuration}s; animation-delay: -${randomDelay}s;"></i>`;
        }
        backgroundContainer.html(iconsHtml);
    }
    // --- END: Animated Background ---

    // --- Initial Load ---
    renderFeedback();
    createIconBackground(); // Create the animated background on page load
    if (getCookie('reviewsHidden') === 'true') {
        $('#feedback-list').hide();
        $('#toggleReviewsBtn').text('Show Reviews');
    }
});
