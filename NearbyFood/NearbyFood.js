$(document).ready(function() {
            // --- CONFIGURATION ---
            // IMPORTANT: Replace with your actual LocationIQ API Key
            const apiKey = 'pk.36b0c30d367ea065d9207b4ce9010afd'; 
            const searchRadius = 10000; // in meters (10km)
            const searchLimit = 18; // Max number of results to display

            // --- UI ELEMENT SELECTORS ---
            const findBtn = $('#find-food-btn');
            const loader = $('#loader');
            const resultsContainer = $('#results');
            const errorMessage = $('#error-message');

            // --- EVENT LISTENERS ---
            findBtn.on('click', function() {
                // Reset UI
                resultsContainer.empty();
                errorMessage.hide();
                loader.show();
                
                // Start the process
                getUserLocation();
            });

            // --- FUNCTIONS ---

            // Gets the user's current geolocation.
            function getUserLocation() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            getNearbyFood(lat, lon);
                        },
                        handleLocationError
                    );
                } else {
                    showError("Geolocation is not supported by this browser.");
                }
            }

      
            // Fetches nearby food places from the LocationIQ API.
            function getNearbyFood(lat, lon) {
                const apiUrl = `https://us1.locationiq.com/v1/nearby.php?key=${apiKey}&lat=${lat}&lon=${lon}&tag=restaurant&radius=${searchRadius}&format=json&limit=${searchLimit}`;

                $.ajax({
                    url: apiUrl,
                    method: 'GET',
                    success: function(data) {
                        loader.hide();
                        if (data && data.length > 0) {
                            displayResults(data);
                        } else {
                            showError("No food places found nearby. Try increasing the search radius.");
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        loader.hide();
                        if (jqXHR.status === 401 || jqXHR.status === 403) {
                           showError("Authentication failed. Please check your API key.");
                        } else {
                           showError(`An API error occurred: ${errorThrown}`);
                        }
                    }
                });
            }

            
            //  Renders the list of food places on the page.
            function displayResults(places) {
                resultsContainer.empty(); // Clear previous results
                places.forEach(place => {
                    // Use a placeholder if the name is not available
                    const name = place.name || 'Name not available';
                    const address = place.display_name;
                    const distance = parseFloat(place.distance).toFixed(2);

                    const cardHtml = `
                        <div class="col-lg-4 col-md-6">
                            <div class="card place-card h-100">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title mb-2">${name}</h5>
                                    <p class="card-subtitle mb-3 text-muted small">${address}</p>
                                    <div class="mt-auto d-flex justify-content-between align-items-center">
                                        <span class="distance-badge">${distance} meters away</span>
                                        <a href="https://www.google.com/maps?q=${place.lat},${place.lon}" target="_blank" class="btn btn-outline-primary btn-sm">View on Map</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    resultsContainer.append(cardHtml);
                });
            }

            // Handles errors from the Geolocation API
            function handleLocationError(error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        showError("Location access denied. Please enable it in your browser settings.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        showError("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        showError("The request to get user location timed out.");
                        break;
                    default:
                        showError("An unknown error occurred while getting your location.");
                        break;
                }
            }
            
          
            //   Displays an error message to the user.
            function showError(message) {
                loader.hide();
                errorMessage.text(message).show();
            }
        });