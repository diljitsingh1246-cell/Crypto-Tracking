  /* -----------------------
            CONFIG
        -------------------------*/
        const API_KEY = "CG-q2s46bsTBEy1GyuX1bUNENTN";
        const API_BASE_URL = "https://api.coingecko.com/api/v3/";
        const DEFAULT_CURRENCY = "usd";

        let currentData = [];
        let priceChart = null; // Stores the Chart.js instance
        let currentCurrency = DEFAULT_CURRENCY;

        const pageContainer = document.getElementById("page-container");

        /* -----------------------
            PAGE TEMPLATES (Uses Template Literals)
        -------------------------*/
        const pages = {
            home: `
                <h1 class="page-title">LARGEST - CRYPTO - MARKETPLACE</h1>
                <div class="controls">
                    <input type="text" id="search-input" placeholder="🔍Search coins..." />
                    <button id="reload-btn" class="action-btn">Reload <i class="fas fa-sync-alt"></i></button>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Coin</th>
                                <th>Price</th>
                                <th class="hide-mobile">24h Change</th>
                                <th class="hide-mobile">Market Cap</th>
                            </tr>
                        </thead>
                        <tbody id="crypto-list">
                            </tbody>
                    </table>
                </div>

                <div id="chart-area" class="chart-hidden">
                    <h2>Price Chart</h2>
                    <div class="chart-box">
                        <canvas id="price-chart"></canvas>
                        <p id="chart-status"></p>
                    </div>
                </div>
            `,

            pricing: `
                <h2 class="page-title">💰 Pricing Plans</h2>
                <div class="card-container">
                    <div class="pricing-card">
                        <h3 style="text-decoration: underline;">Free Tier</h3>
                        <p class="price-tag">$0/mo</p>
                        <ul>
                            <li><i class="fas fa-check-circle" style="color: var(--positive-color);"></i> Real-time price data</li>
                            <li><i class="fas fa-check-circle" style="color: var(--positive-color);"></i> Access to top 100 coins</li>
                            <li><i class="fas fa-check-circle" style="color: var(--positive-color);"></i> Basic 7-day chart history</li>
                        </ul>
                        <button class="cta-button">Current Plan</button>
                    </div>
                    <div class="pricing-card premium">
                        <h3 style="text-decoration: underline;">Crypto Plus</h3>
                        <p class="price-tag">$9.99/mo</p>
                        <ul>
                            <li><i class="fas fa-star" style="color: var(--primary-color);"></i> **All Free Tier features**</li>
                            <li><i class="fas fa-chart-line" style="color: var(--primary-color);"></i> Access to all listed coins</li>
                            <li><i class="fas fa-calendar-alt" style="color: var(--primary-color);"></i> Full 6-Month chart history</li>
                            <li><i class="fas fa-volume-mute" style="color: var(--primary-color);"></i> Ad-free experience</li>
                            <li><i class="fas fa-headset" style="color: var(--primary-color);"></i> Priority support</li>
                        </ul>
                        <button class="cta-button">Upgrade Now</button>
                    </div>
                    <div class="pricing-card premium">
                        <h3 style="text-decoration: underline;">Crypto Pro</h3>
                        <p class="price-tag">$19.99/mo</p>
                        <ul>
                            <li><i class="fas fa-star-of-life" style="color: var(--primary-color);"></i> **All Plus Tier features**</li>
                            <li><i class="fas fa-globe" style="color: var(--primary-color);"></i> Full 1-year chart history</li>
                            <li><i class="fas fa-graduation-cap" style="color: var(--primary-color);"></i> Premium Course Access</li>
                            <li><i class="fas fa-user-tie" style="color: var(--primary-color);"></i> Dedicated Account Manager</li>
                        </ul>
                        <button class="cta-button">Upgrade Now</button>
                    </div>
                </div>
                <p class="note">Plans are billed annually. Cancel anytime.</p>
            `,

            support: `
                <h2 class="page-title">📞 Support Center</h2>
                
                <div class="info-card">
                    <h3 style="text-decoration: underline; font-size:2.2rem;">Contact Us</h3>
                    <p><strong>Email:</strong> jatttmaam@gmail.com.</p>
                    <p><strong>Phone:</strong> +91 97802-10548 [Mon-Fri, 9am - 5pm EST].</p>
                    <p><strong>Live Chat:</strong> Available 24/7 on the bottom right of the screen.</p>
                </div>

                <div class="info-card">
                    <h3 style="text-align: center;">Frequently Asked Questions (FAQ)</h3>
                    <ul class="faq-list">
                        <li><strong>1. How often is the data updated?</strong>Answer=) Data is updated every minute from the source API.</li>
                        <li><strong>2. Which exchanges do you track?</strong>Answer=) We aggregate data from major global exchanges using CoinGecko.</li>
                        <li><strong>3. How do I report a bug?</strong>Answer=) Please email our support address with details and screenshots.</li>
                    </ul>
                </div>
            `,

            about: `
                <div class="info-card">
                    <h2 class="page-title" style="font-size: 2.5em; text-decoration: underline;">ℹ️ About CryptoTrack</h2>
                    <p style="font-size: 1.2rem;">CryptoTrack is a leading platform dedicated to providing **accurate, real-time market data** for the world's most popular cryptocurrencies.</p>
                    
                    <h3>Our Mission =)</h3>
                    <p style="font-size:1.2rem;">Our mission is to simplify the complex world of crypto by offering a clean, user-friendly interface for tracking prices, market capitalization, and 24-hour changes. We believe in empowering our users with transparent and timely information.</p>
                    
                    <h3>Technology =)</h3>
                    <p>This site is built using **Vanilla JavaScript** and integrates with the **CoinGecko API** for reliable data feeds. Charting is powered by the popular **Chart.js** library, ensuring dynamic and responsive data visualization.</p>
                </div>
            `
        };

        /* -----------------------
            UTILITY FUNCTIONS
        -------------------------*/
        // Function to format prices
        const formatPrice = (price) => {
            const options = {
                style: 'currency',
                currency: currentCurrency.toUpperCase(),
                maximumFractionDigits: price < 1 ? 8 : 2,
            };
            // Use toLocaleString with custom options
            return price.toLocaleString(undefined, options);
        };
        
        // Formats large numbers for Market Cap
        const formatLargeNumber = (num) => {
            if (Math.abs(num) >= 1.0e+9) return (Math.abs(num) / 1.0e+9).toFixed(2) + "B";
            if (Math.abs(num) >= 1.0e+6) return (Math.abs(num) / 1.0e+6).toFixed(2) + "M";
            return num.toLocaleString();
        };

        /* -----------------------
            PAGE MANAGEMENT
        -------------------------*/
        const updateNavLinks = (page) => {
            document.querySelectorAll(".nav-link").forEach(link => {
                link.classList.remove("active");
                if (link.dataset.page === page) link.classList.add("active");
            });
        };

        const loadPage = (page) => {
            // Clear previous chart instance if it exists and we're leaving the home page
            if (priceChart && page !== "home") {
                priceChart.destroy();
                priceChart = null;
            }

            pageContainer.innerHTML = pages[page];
            updateNavLinks(page);
            
            // Re-initialize home page features if necessary
            if (page === "home") initHomePage();
        };

        /* -----------------------
            HOME PAGE INITIALIZER
        -------------------------*/
        const initHomePage = () => {
            // Check for elements and attach handlers
            const reloadBtn = document.getElementById("reload-btn");
            const searchInput = document.getElementById("search-input");
            
            if (reloadBtn) reloadBtn.addEventListener('click', fetchCryptoData);
            if (searchInput) searchInput.addEventListener('keyup', filterCoins);
            
            // Note: Table row clicks are handled via event delegation in the main DOMContentLoaded listener

            fetchCryptoData();
        };

        /* -----------------------
            FETCH COINS
        -------------------------*/
        const fetchCryptoData = async () => {
            const list = document.getElementById("crypto-list");
            if (!list) return;

            // Show loading state with a spinner
            list.innerHTML = `<tr><td colspan="5" class="loading-message"><span class="spinner"></span> Fetching data...</td></tr>`;
            
            const chartArea = document.getElementById("chart-area");
            if (chartArea) chartArea.classList.add("chart-hidden");

            const url = `${API_BASE_URL}coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&sparkline=false&x_cg_api_key=${API_KEY}`;

            try {
                const res = await fetch(url);
                
                if (res.status === 429) { // Handle rate limiting explicitly
                    throw new Error("API Rate Limit Exceeded. Please wait a minute and try again.");
                }

                if (!res.ok) {
                    const errorDetails = await res.json().catch(() => ({}));
                    throw new Error(`HTTP error! Status: ${res.status}. Details: ${errorDetails.error || 'Unknown error'}`);
                }
                
                currentData = await res.json();
                renderCoinTable(currentData);
            } catch (err) {
                console.error("Error fetching crypto data:", err);
                // Display error message
                list.innerHTML = `<tr><td colspan="5" class="error-message"><i class="fas fa-exclamation-triangle"></i> Error: ${err.message || "Failed to load market data."}</td></tr>`;
            }
        };

        /* -----------------------
            RENDER TABLE
        -------------------------*/
        const renderCoinTable = (data) => {
            const list = document.getElementById("crypto-list");
            if (!list) return;
            
            list.innerHTML = "";
            
            if (data.length === 0) {
                list.innerHTML = `<tr><td colspan="5" class="empty-message">No coins found matching your search.</td></tr>`;
                return;
            }

            const rowsHtml = data.map(coin => {
                const priceChange = coin.price_change_percentage_24h;
                const changeClass = priceChange > 0 ? "positive" : (priceChange < 0 ? "negative" : "");
                
                // Use data attributes for click handling (delegated)
                return `
                    <tr data-coin-id="${coin.id}" data-coin-name="${coin.name}">
                        <td>${coin.market_cap_rank}</td>
                        <td class="coin-details"><img src="${coin.image}" width="20" alt="${coin.symbol.toUpperCase()} logo"> ${coin.name} (${coin.symbol.toUpperCase()})</td>
                        <td>${formatPrice(coin.current_price)}</td>
                        <td class="hide-mobile ${changeClass}">
                            ${priceChange ? priceChange.toFixed(2) : "0.00"}%
                        </td>
                        <td class="hide-mobile">$${formatLargeNumber(coin.market_cap)}</td>
                    </tr>
                `;
            }).join('');

            list.innerHTML = rowsHtml;
        };

        /* -----------------------
            SEARCH FILTER
        -------------------------*/
        const filterCoins = () => {
            const searchInput = document.getElementById("search-input");
            if (!searchInput) return;

            const q = searchInput.value.toLowerCase();

            const filtered = currentData.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.symbol.toLowerCase().includes(q)
            );

            renderCoinTable(filtered);
        };

        /* -----------------------
            FETCH CHART DATA
        -------------------------*/
        const fetchChart = async (id, name) => {
            const chartArea = document.getElementById("chart-area");
            const chartStatus = document.getElementById("chart-status");
            
            if (!chartArea || !chartStatus) return;
            
            chartArea.classList.remove("chart-hidden");
            chartArea.scrollIntoView({ behavior: 'smooth' });

            chartStatus.innerHTML = `<span class="spinner"></span> Loading 7-day chart for **${name}**...`;

            // Fetch 7 days of historical market data
            const url = `${API_BASE_URL}coins/${id}/market_chart?vs_currency=${currentCurrency}&days=7&x_cg_api_key=${API_KEY}`;

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                
                const data = await res.json();
                const { prices } = data; // Destructuring for cleaner access

                if (!prices || prices.length === 0) {
                    chartStatus.textContent = `${name} chart data unavailable.`;
                    return;
                }

                // Format data for Chart.js
                const labels = prices.map(([timestamp]) => new Date(timestamp).toLocaleDateString());
                const priceValues = prices.map(([, price]) => price); // Destructuring array elements

                drawChart(labels, priceValues, name);
            } catch (err) {
                console.error("Error fetching chart data:", err);
                chartStatus.textContent = `Chart for ${name} unavailable due to an API error.`;
            }
        };

        /* -----------------------
            DRAW CHART
        -------------------------*/
        const drawChart = (labels, prices, name) => {
            const ctx = document.getElementById("price-chart");
            if (!ctx) return;
            
            if (priceChart) priceChart.destroy();

            // Get colors from CSS variables
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
            const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--card-bg-hover').trim();
            const textGray = 'rgb(170, 170, 170)';

            priceChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        label: `Price (${currentCurrency.toUpperCase()})`,
                        data: prices,
                        borderColor: primaryColor,
                        backgroundColor: `rgba(0, 255, 234, 0.1)`, // Manually set for efficiency
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: true, 
                            labels: { color: textGray } 
                        },
                        title: { 
                            display: true, 
                            text: `7-Day Price History for ${name}`, 
                            color: 'white',
                            font: { size: 18 }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    let label = context.dataset.label || '';
                                    if (label) label += ': ';
                                    label += formatPrice(context.parsed.y);
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: textGray },
                            grid: { color: gridColor }
                        },
                        y: {
                            ticks: { 
                                color: textGray,
                                callback: (value) => formatPrice(value)
                            },
                            grid: { color: gridColor }
                        }
                    }
                }
            });

            document.getElementById("chart-status").textContent = `Displaying 7-day history for ${name}. Click another row to view its chart.`;
        };


        /* -----------------------
            INITIALIZATION & GLOBAL EVENT LISTENERS
        -------------------------*/
        document.addEventListener("DOMContentLoaded", () => {
            
            // --- Global Click Handler (Event Delegation) ---
            document.body.addEventListener('click', (e) => {
                // 1. Navbar Links & Logo
                const link = e.target.closest('a[data-page]');
                if (link) {
                    e.preventDefault();
                    loadPage(link.dataset.page);
                    return;
                }

                // 2. Sign Up Button
                if (e.target.matches('.sign-up-btn') || e.target.matches('.cta-button')) {
                    alert("Sign Up/CTA clicked! This would typically open a modal or navigate to a registration/checkout page.");
                    return;
                }

                // 3. Crypto Table Row Click (Home Page Only)
                // Check if the click target is a table row (tr) within the #crypto-list body
                const row = e.target.closest('#crypto-list tr');
                if (row) {
                    const { coinId, coinName } = row.dataset;
                    if (coinId && coinName) {
                        fetchChart(coinId, coinName);
                    }
                }
            });

            // Initial page load
            loadPage("home");
        });