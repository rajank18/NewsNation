const newsWords = [
    'News', 'Noticias', 'Nouvelles', 'Nachrichten', 'Notizie', 
    'Новости', '新闻', 'ニュース', '뉴스', 'أخبار', 
    'Notícias', 'Haberler', 'Wiadomości', 'Nyheterna', 'Uutiset'
];

function createMatrixBackground() {
    const matrixBackground = document.querySelector('.matrix-background');
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const wordCount = Math.floor((screenHeight * screenWidth) / 15000); // Adjust for density

    matrixBackground.innerHTML = ''; // Clear existing words

    for (let i = 0; i < wordCount; i++) {
        const word = document.createElement('div');
        word.classList.add('matrix-word');
        word.style.top = `${Math.random() * 100}%`;
        word.style.left = `${Math.random() * 100}%`; // Random horizontal position
        word.style.animationDuration = `${20 + Math.random() * 10}s`; // Random speed
        word.style.fontSize = `${12 + Math.random() * 18}px`; // Random size between 12px and 30px
        word.textContent = newsWords[Math.floor(Math.random() * newsWords.length)];
        
        word.addEventListener('click', () => {
            document.getElementById('search-input').focus();
        });
        
        matrixBackground.appendChild(word);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.addEventListener('load', createMatrixBackground);
window.addEventListener('resize', debounce(createMatrixBackground, 250));

// Search functionality
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const heroSearch = document.getElementById('hero-search');
const searchContainer = document.querySelector('.search-container');

let currentArticleIndex = 0;
let articles = [];

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        performSearch(query);
    }
});

function performSearch(query) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://news-api14.p.rapidapi.com/v2/search/articles?query=${encodedQuery}&language=en`;
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '879c4e3d8fmsh7d48e509036c3cfp1dda49jsn8fa59471ca0a',
            'x-rapidapi-host': 'news-api14.p.rapidapi.com'
        }
    };

    resultsContainer.innerHTML = 'Loading...';

    fetch(url, options)
        .then(response => response.json())
        .then(result => {
            displayResults(result);
            minimizeSearchBox();
            removeMatrixBackground();
            window.scrollTo(0, 0);
        })
        .catch(error => {
            console.error(error);
            resultsContainer.innerHTML = 'An error occurred while fetching results.';

        });
}

function minimizeSearchBox() {
    heroSearch.classList.add('minimized');
    searchContainer.classList.add('minimized');
    heroSearch.style.display = 'block';
}

function removeMatrixBackground() {
    const matrixBackground = document.querySelector('.matrix-background');
    if (matrixBackground) {
        matrixBackground.style.display = 'none';
    }
}

function displayResults(data) {
    console.log('Display Results Data:', data);
    resultsContainer.innerHTML = '';
    if (data.success && data.data && data.data.length > 0) {
        articles = data.data;
        articles.forEach((article, index) => {
            const articleElement = document.createElement('div');
            articleElement.classList.add('article-card');
            articleElement.innerHTML = `
                <div class="article-image">
                    ${article.thumbnail ? `<img src="${article.thumbnail}" alt="${article.title}">` : '<div class="no-image">No Image Available</div>'}
                </div>
                <div class="article-content">
                    <h2>${truncateTitle(article.title, 60)}</h2>
                    <p class="publisher">Published by: ${article.publisher.name}</p>
                </div>
            `;
            articleElement.addEventListener('click', () => openModal(index));
            resultsContainer.appendChild(articleElement);
        });
    } else {
        resultsContainer.innerHTML = '<div class="no-results">No results found.</div>';
    }
}

function truncateTitle(title, maxLength) {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
}

function openModal(index) {
    currentArticleIndex = index;
    updateModalContent();
    document.getElementById('articleModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('articleModal').style.display = 'none';
}

function navigateArticle(direction) {
    currentArticleIndex += direction;
    if (currentArticleIndex < 0) currentArticleIndex = articles.length - 1;
    if (currentArticleIndex >= articles.length) currentArticleIndex = 0;
    updateModalContent();
}

function updateModalContent() {
    const article = articles[currentArticleIndex];
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <span class="close" onclick="closeModal()">&times;</span>
        <div class="modal-image">
            ${article.thumbnail ? `<img src="${article.thumbnail}" alt="${article.title}">` : '<div class="no-image">No Image Available</div>'}
        </div>
        <h2>${article.title}</h2>
        <div class="excerpt">
            <p>${article.excerpt}</p>
        </div>
        <p class="publisher">Published by: ${article.publisher.name}</p>
        <p class="date">Published on: ${new Date(article.date).toLocaleDateString()}</p>
        <a href="${article.url}" target="_blank" class="read-more">Read Full Article</a>
    `;
}

// Add these event listeners after your existing code
document.addEventListener('keydown', (e) => {
    if (document.getElementById('articleModal').style.display === 'flex') {
        if (e.key === 'ArrowLeft') navigateArticle(-1);
        if (e.key === 'ArrowRight') navigateArticle(1);
        if (e.key === 'Escape') closeModal();
    }
});