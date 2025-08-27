document.addEventListener('DOMContentLoaded', () => {
    const foodFactOutput = document.getElementById('factDisplay');
    const loadingSpinner = document.getElementById('loading-spinner');
    const getFactBtn = document.getElementById('get-fact-btn');

    // --- Function to fetch and display a food fact ---
    async function getFoodFact() {
        foodFactOutput.classList.add('d-none'); 
        loadingSpinner.classList.remove('d-none');
        getFactBtn.disabled = true; // Disable button during fetch (re-enabled) 

        try {
            const prompt = "Give me one interesting, concise, and surprising street food related fact without any introductory phrases like 'Did you know' or 'Here's a fact' with a simple grammar and vocabulary. ";
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "AIzaSyC1-2lGRtK8gCeCCItGuf2s9y9ixTRDZJk"; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const factText = result.candidates[0].content.parts[0].text.trim();
                foodFactOutput.textContent = factText;
                foodFactOutput.classList.remove('d-none'); // Show fact
            } else {
                foodFactOutput.textContent = 'Failed to fetch a food fact. Please try again.';
                foodFactOutput.classList.remove('d-none');
                console.error('Unexpected API response structure:', result);
            }

        } catch (error) {
            foodFactOutput.textContent = 'Error: Could not retrieve a food fact. Please check your network connection or try again later.';
            console.error('Error fetching food fact from Gemini API:', error);

        } finally {
            loadingSpinner.classList.add('d-none'); // Hide spinner 
            getFactBtn.disabled = false; // Enable button
        }
    }

    // --- Load a fact on initial page load ---
    getFoodFact(); 
    
    // --- Event Listeners --- 
    getFactBtn.addEventListener('click', getFoodFact);
});