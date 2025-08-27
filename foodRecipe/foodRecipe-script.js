// Execute script only after the DOM is fully loaded.
$(document).ready(function () {
    // Initialize the Bootstrap modal component for the favorites view.
    let favoritesModal = new bootstrap.Modal(document.getElementById('favoritesModal'));

    // --- API Call Functions ---
    // Searches for recipes based on a user's query.
    function searchRecipes(query) {
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
        fetchAndDisplay(apiUrl, `No recipes found for "${query}". Please try another search.`);
        sessionStorage.setItem('lastSearch', query); // Save search to session storage
    }

    // Fetches a predefined list of popular recipes (in this case, Seafood).
    function getPopularRecipes() {
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood`;
        fetchAndDisplay(apiUrl, "Could not load popular recipes at this time.");
    }

    // General function to fetch data from TheMealDB API and display it.
    function fetchAndDisplay(apiUrl, errorMessage) {
        const $resultsContainer = $('#resultsContainer');
        const $message = $('#message');
        $resultsContainer.empty();
        $message.text('Loading recipes...');

        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function (data) {
                $message.text('');
                $('#popularBtn').text('Hide Recipes');
                if (data.meals) {
                    // The API returns a list, so we loop through and fetch full details for each.
                    data.meals.forEach(meal => {
                        $.ajax({
                            url: `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`,
                            type: 'GET',
                            success: function (detailData) {
                                if (detailData.meals) {
                                    $resultsContainer.append(createRecipeCard(detailData.meals[0]));
                                }
                            }
                        });
                    });
                } else {
                    $message.text(errorMessage);
                }
            },
            error: function () {
                $message.text("Could not connect to the recipe service. Please try again later.");
            }
        });
    }

    // --- Helper function to create Bootstrap recipe cards ---
    // Dynamically builds the HTML for a single recipe card.
    function createRecipeCard(meal) {
        const favorites = getFavorites();
        const isFavorited = favorites.some(fav => String(fav.idMeal) === String(meal.idMeal));
        const favoritedClass = isFavorited ? 'favorited' : ''; // Check if the meal is in favorites

        return `
            <div class="col" data-meal-id="${meal.idMeal}">
              <div class="card shadow-sm recipe-card h-100">
                <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                <div class="card-body">
                  <p class="card-text">${meal.strMeal}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                      <a href="${meal.strSource || '#'}" target="_blank" class="btn btn-sm btn-outline-secondary">View</a>
                    </div>
                    <button class="favorite-btn ${favoritedClass}" title="Add to favorites"><i class="fas fa-star"></i></button>
                  </div>
                </div>
              </div>
            </div>
        `;
    }

    // --- Local Storage & Favorites Logic ---
    function getFavorites() { return JSON.parse(localStorage.getItem('favoriteRecipes')) || []; }
    function saveFavorites(favorites) {
        localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
        renderFavorites(); // Re-render the favorites list after saving
    }
    // Renders the favorite recipes into the modal.
    function renderFavorites() {
        const favorites = getFavorites();
        const $favoritesContainer = $('#favoritesContainer');
        $favoritesContainer.empty();
        if (favorites.length > 0) {
            $('#toggleFavoritesBtn').show();
            favorites.forEach(meal => {
                $favoritesContainer.append(createRecipeCard(meal));
            });
        } else {
            $('#toggleFavoritesBtn').hide();
            $favoritesContainer.html('<p class="text-muted col-12">No favorite recipes saved yet.</p>');
        }
    }

    // --- Event Handlers ---
    $('#searchBtn').on('click', function () {
        const query = $('#searchInput').val().trim();
        if (query) searchRecipes(query);
    });
    $('#searchInput').on('keypress', function (e) { if (e.which === 13) $('#searchBtn').click(); });

    $('#popularBtn').on('click', function () {
        const $resultsContainer = $('#resultsContainer');
        const $button = $(this);
        // This button toggles between showing and hiding the popular recipes.
        if ($resultsContainer.children().length > 0) {
            $resultsContainer.empty();
            $('#message').text('Popular recipes hidden. Search for a recipe to begin.');
            $button.text('View Popular Recipes');
        } else {
            getPopularRecipes();
        }
    });

    $('#toggleFavoritesBtn').on('click', function () {
        renderFavorites();
        favoritesModal.show();
    });

    // Handles clicks on the favorite (star) button using event delegation.
    $(document).on('click', '.favorite-btn', function () {
        const $card = $(this).closest('.col');
        const mealId = String($card.data('meal-id'));
        let favorites = getFavorites();
        const mealIndex = favorites.findIndex(fav => String(fav.idMeal) === mealId);

        if (mealIndex > -1) {
            // If already a favorite, remove it.
            favorites.splice(mealIndex, 1);
            saveFavorites(favorites);
            $(`.col[data-meal-id="${mealId}"] .favorite-btn`).removeClass('favorited');
        } else {
            // If not a favorite, fetch its details and add it.
            $.ajax({
                url: `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
                type: 'GET',
                success: function (data) {
                    if (data.meals) {
                        favorites.push(data.meals[0]);
                        saveFavorites(favorites);
                        $(`.col[data-meal-id="${mealId}"] .favorite-btn`).addClass('favorited');
                    }
                }
            });
        }
    });

    $('#clearFavoritesBtn').on('click', function () {
        if (confirm("Are you sure you want to clear all your favorite recipes?")) {
            saveFavorites([]);
            $('.favorite-btn').removeClass('favorited');
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
            const randomDuration = (Math.random() * 6 + 7).toFixed(2);
            const randomDelay = (Math.random() * 5).toFixed(2);
            iconsHtml += `<i class="fa-solid ${randomIcon}" style="animation-duration: ${randomDuration}s; animation-delay: -${randomDelay}s;"></i>`;
        }
        backgroundContainer.html(iconsHtml);
    }
    // --- END: Animated Background ---

    // --- Initial Load ---
    // Checks session storage for a previous search to restore it on page load.
    const lastSearch = sessionStorage.getItem('lastSearch');
    if (lastSearch) {
        $('#searchInput').val(lastSearch);
        searchRecipes(lastSearch);
    } else {
        $('#message').text('Search for a recipe or view popular ones to get started!');
    }
    renderFavorites(); // Initial render to show/hide the favorites button
    createIconBackground(); // Create the animated background
});
