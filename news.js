const apiKey = 'e662a78bf0224efb83779af734fdb225';
let currentCategory = 'general';
let currentPage = 1;
let totalPages = 1;
const articlesPerPage = 6;
let isLoading = false;

// Theme handling
function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Load saved theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Theme toggle button
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Initial news fetch
    fetchNews('general', 1);
});

async function fetchNews(category = 'general', page = 1) {
    if (isLoading) return;
    isLoading = true;
    document.getElementById('loading').style.display = 'block';

    const apiUrl = category === 'general' 
        ? `https://newsapi.org/v2/top-headlines?country=us&page=${page}&pageSize=${articlesPerPage + 1}&apiKey=${apiKey}`
        : `https://newsapi.org/v2/everything?q=${category}&page=${page}&pageSize=${articlesPerPage + 1}&apiKey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.articles.length > 0) {
            const newsGrid = document.getElementById('newsGrid');
            newsGrid.innerHTML = '';

            if (page === 1) {
                const featured = data.articles[0];
                document.getElementById('featuredImage').src = featured.urlToImage || 'https://via.placeholder.com/1200x400';
                document.getElementById('featuredTitle').textContent = featured.title;
                document.getElementById('featuredDescription').textContent = featured.description || featured.content;
                document.getElementById('featuredLink').href = featured.url;
                data.articles.shift();
            }

            data.articles.forEach(article => {
                const articleHTML = `
                    <div class="col">
                        <div class="card news-card">
                            <img src="${article.urlToImage || 'https://via.placeholder.com/400x200'}" 
                                 class="card-img-top news-image" 
                                 alt="${article.title}">
                            <div class="card-body">
                                <h5 class="card-title">${article.title}</h5>
                                <p class="card-text">${article.description || 'Click to read more...'}</p>
                                <a href="${article.url}" class="btn btn-outline-primary btn-sm" target="_blank">Read More</a>
                            </div>
                        </div>
                    </div>
                `;
                newsGrid.innerHTML += articleHTML;
            });

            totalPages = Math.ceil(data.totalResults / articlesPerPage);
            updatePagination(page);
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        document.getElementById('newsGrid').innerHTML = '<p class="text-center">Failed to load news.</p>';
    } finally {
        isLoading = false;
        document.getElementById('loading').style.display = 'none';
    }
}

function updatePagination(currentPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    pagination.innerHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    pagination.innerHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
    `;

    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.getAttribute('data-page'));
            if (page && page !== currentPage) {
                currentPage = page;
                fetchNews(currentCategory, page);
            }
        });
    });
}

// Handle navbar clicks
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        
        const category = e.target.getAttribute('data-category');
        if (category !== currentCategory) {
            currentCategory = category;
            currentPage = 1;
            fetchNews(category, 1);
        }
    });
});