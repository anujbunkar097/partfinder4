document.getElementById('searchButton').addEventListener('click', searchParts);
document.getElementById('partNumberInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchParts();
    }
});

async function searchParts() {
    const partNumber = document.getElementById('partNumberInput').value;
    const resultsContainer = document.getElementById('resultsContainer');
    const summaryContainer = document.getElementById('summaryContainer'); // Get summary container
    const loader = document.getElementById('loader');
    const searchButton = document.getElementById('searchButton');

    if (!partNumber) {
        alert('Please enter a part number.');
        return;
    }

    const webhookUrl = 'https://transformco.app.n8n.cloud/webhook/2a1d2507-373b-43a7-9ec9-3965b56dbcc3';

    resultsContainer.innerHTML = '';
    summaryContainer.innerHTML = ''; // Clear previous summary
    loader.style.display = 'block';
    searchButton.disabled = true;

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ partNumber: partNumber })
        });

        const resultData = await response.json();
        
        console.log("RAW DATA RECEIVED FROM N8N:", resultData);
        
        // NEW: Display the summary and the results
        displayResults(resultData);

    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = `<p style="color: red;">An error occurred.</p>`;
    } finally {
        loader.style.display = 'none';
        searchButton.disabled = false;
    }
}

function displayResults(data) {
    const resultsContainer = document.getElementById('resultsContainer');
    const summaryContainer = document.getElementById('summaryContainer');
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    summaryContainer.innerHTML = '';

    // NEW: Display the AI-generated summary
    if (data.summary) {
        summaryContainer.innerHTML = `<p><strong>AI Analysis:</strong> ${data.summary}</p>`;
    }

    const results = data.results;

    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p>No detailed results found.</p>';
        return;
    }

    results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'result-card';

        // NEW: Add 'best-bet' class if the item is recommended
        if (result.isBest) {
            card.classList.add('best-bet');
        }

        const title = result.site || 'Unknown Site';
        const price = result.price || 'Not available';
        const availability = result.availability || 'Not specified';
        const url = result.url || '#';
        const bestBetBadge = result.isBest ? '🏆 Best Option' : '';

        card.innerHTML = `
            <h3><a href="${url}" target="_blank">${title}</a> <span style="color: #28a745; font-weight: bold;">${bestBetBadge}</span></h3>
            <p><strong>Price:</strong> ${price}</p>
            <p><strong>Availability:</strong> <span style="color: ${availability && availability.toUpperCase().includes('IN STOCK') ? 'green' : 'red'};">${availability}</span></p>
        `;
        resultsContainer.appendChild(card);
    });
}
