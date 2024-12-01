// Function to handle fetching users
async function fetchUsers() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/users');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
            const usersDataDiv = document.getElementById('users-data');
            usersDataDiv.innerHTML = data.map(user => `
                <div class="data-item">
                    <strong>${user.name}</strong> (${user.email})
                </div>
            `).join('');
        } else {
            document.getElementById('users-data').innerHTML = '<p>No users found.</p>';
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        document.getElementById('users-data').innerHTML = `<p class="error">Error fetching users: ${error.message}</p>`;
    }
}

// Function to handle fetching products
async function fetchProducts() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/products');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
            const productsDataDiv = document.getElementById('products-data');
            productsDataDiv.innerHTML = data.map(product => `
                <div class="data-item">
                    <strong>${product.name}</strong> - $${product.price}
                </div>
            `).join('');
        } else {
            document.getElementById('products-data').innerHTML = '<p>No products found.</p>';
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products-data').innerHTML = `<p class="error">Error fetching products: ${error.message}</p>`;
    }
}

// Function to handle fetching orders
async function fetchOrders() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/orders');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
            const ordersDataDiv = document.getElementById('orders-data');
            ordersDataDiv.innerHTML = data.map(order => `
                <div class="data-item">
                    <strong>${order.name}</strong> bought ${order.quantity} x ${order.product_name}
                </div>
            `).join('');
        } else {
            document.getElementById('orders-data').innerHTML = '<p>No orders found.</p>';
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        document.getElementById('orders-data').innerHTML = `<p class="error">Error fetching orders: ${error.message}</p>`;
    }
}
// Track the current page state
let currentPage = 'fetch-cars'; // Default page

// Function to handle fetching cars
async function fetchCars() {
    currentPage = 'fetch-cars';  // Track that we're on the "fetch cars" page

    try {
        const response = await fetch('http://127.0.0.1:5000/api/cars');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
            const carsDataDiv = document.getElementById('cars-data');

            // Use map and await the results before joining
            const carItems = await Promise.all(data.map(async car => {
                let salePrice = null;
                let oldPrice = car.price;  // Default to original price

                // Ensure price is valid before continuing
                const isValidPrice = (price) => !isNaN(price) && price !== null && price !== undefined;

                try {
                    const saleResponse = await fetch(`http://127.0.0.1:5000/api/car_sale/${car.veh_inv_id}`);
                    const saleData = await saleResponse.json();

                    if (saleData.campaign_price && isValidPrice(saleData.campaign_price)) {
                        salePrice = saleData.campaign_price;  // If there's a sale, use the campaign price
                        oldPrice = car.price;  // Keep the original price if there's a sale
                    } else {
                        console.log(`No active sale for ${car.veh_inv_id}`);
                    }
                } catch (error) {
                    console.log(`Error fetching sale data for ${car.veh_inv_id}: ${error}`);
                }

                // Ensure salePrice and oldPrice are valid before using `toFixed`
                const displayPrice = isValidPrice(salePrice) ? salePrice : (isValidPrice(oldPrice) ? oldPrice : 0);

                // Return the car's HTML content with the correct price
                return `
                    <div class="data-item" onclick="viewCarDetails('${car.veh_id}', '${car.veh_inv_id}')">
                        <strong>${car.veh_name}</strong><br>
                        <img src="${car.image_url}" alt="${car.veh_name}" class="car-image">
                        ${isValidPrice(salePrice) ? `<span class="old-price" style="text-decoration: line-through; color: grey;">$${oldPrice.toFixed(2)}</span> ` : ''}
                        <span class="${isValidPrice(salePrice) ? 'sale-price' : ''}" style="${isValidPrice(salePrice) ? 'color: red;' : ''}">$${displayPrice.toFixed(2)}</span><br>
                        Mileage: ${car.mileage} miles<br>
                        Color: ${car.ext_color}<br>
                        Condition: ${car.condition}<br>
                        Year: ${car.year}<br>
                        Location: ${car.location}<br>
                    </div>
                `;
            }));

            // Join the array of car HTML elements into a single string and set the innerHTML
            carsDataDiv.innerHTML = carItems.join('');
        } else {
            document.getElementById('cars-data').innerHTML = '<p>No cars found.</p>';
        }
    } catch (error) {
        console.error('Error fetching cars:', error);
        document.getElementById('cars-data').innerHTML = `<p class="error">Error fetching cars: ${error.message}</p>`;
    }
}


// Function to view detailed car information
async function viewCarDetails(carId, carInvId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/cars/${carId}`);
        const car = await response.json();

        if (car) {
            // Check if the car has a sale price
            let salePrice = car.price;
            let originalPrice = car.price;  // Default to regular price
            let salePriceHtml = '';  // HTML to display sale price if applicable
            let oldPriceHtml = '';  // HTML to display original price with strikethrough if on sale

            try {
                const saleResponse = await fetch(`http://127.0.0.1:5000/api/car_sale/${carInvId}`);
                const saleData = await saleResponse.json();

                if (saleData.campaign_price) {
                    salePrice = saleData.campaign_price;  // Use the sale price if available
                    oldPriceHtml = `<span class="old-price" style="text-decoration: line-through; color: grey;">$${originalPrice.toFixed(2)}</span>`;  // Strikethrough the original price
                    salePriceHtml = `<span class="sale-price" style="color: red;">$${salePrice.toFixed(2)}</span>`;  // Display sale price in red
                }
            } catch (error) {
                console.log(`No sale found for car ${carInvId}`);
            }

            // Display the car details with the updated price
            const carDetailsDiv = document.getElementById('car-details');
            carDetailsDiv.innerHTML = `
                <h2>${car.veh_name} - ${salePriceHtml || `$${salePrice.toFixed(2)}`}</h2>
                ${oldPriceHtml}  <!-- Show the original price with strikethrough if on sale -->
                <br>
                <img src="${car.image_url}" alt="${car.veh_name}" class="car-image-large">
                <p><strong>Mileage:</strong> ${car.mileage} miles</p>
                <p><strong>Color:</strong> ${car.ext_color}</p>
                <p><strong>Engine:</strong> ${car.engine}</p>
                <p><strong>Horsepower:</strong> ${car.horsepower} hp</p>
                <p><strong>Year:</strong> ${car.year}</p>
                <p><strong>Location:</strong> ${car.location}</p>
                <p><strong>Description:</strong> ${car.special_notes}</p>
                <button onclick="closeCarDetails()">Close</button>
                <button id="buy-button" onclick="proceedToPayment('${carInvId}', '${car.veh_name}', '${salePrice}')">Buy Now</button>
            `;
            showSection('car-details-section');  // Show the details section
        } else {
            alert('Car details not found.');
        }
    } catch (error) {
        console.error('Error fetching car details:', error);
        alert('Error fetching car details.');
    }
}

// Function to handle search cars
async function searchCars() {
    currentPage = 'products';  // Track that we're on the "search cars" page

    const query = document.getElementById('search-query').value.trim().toLowerCase();
    const selectedYear = document.getElementById('year-filter').value;
    const selectedPriceRange = document.getElementById('price-filter').value;

    const carResultsDiv = document.getElementById('car-results');
    carResultsDiv.innerHTML = '';  // Clear current car list

    if (query === '' && selectedYear === '' && selectedPriceRange === '') {
        carResultsDiv.innerHTML = '<p>Please enter a search term or select filters.</p>';
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/cars/search?query=${encodeURIComponent(query)}&year=${encodeURIComponent(selectedYear)}&price_range=${encodeURIComponent(selectedPriceRange)}`);
        const cars = await response.json();

        if (cars.length > 0) {
            displayCars(cars);
        } else {
            carResultsDiv.innerHTML = '<p>No cars found matching your query.</p>';
        }
    } catch (error) {
        console.error('Error fetching cars:', error);
        carResultsDiv.innerHTML = '<p>Error fetching cars. Please try again later.</p>';
    }
}

// Function to display car cards
function displayCars(cars) {
    const carResultsDiv = document.getElementById('car-results');
    carResultsDiv.innerHTML = cars.slice(0, 5).map(car => {
        let salePriceHtml = '';
        let oldPriceHtml = '';

        if (car.sale_price) {
            salePriceHtml = `<span class="sale-price" style="color: red;">$${car.sale_price.toFixed(2)}</span>`;
            oldPriceHtml = `<span class="old-price" style="text-decoration: line-through; color: grey;">$${car.price.toFixed(2)}</span>`;
        } else {
            salePriceHtml = `$${car.price.toFixed(2)}`;
        }

        return `
            <div class="data-item" onclick="viewCarDetails('${car.veh_id}', '${car.veh_inv_id}')">
                <img src="${car.image_url}" alt="${car.veh_name}">
                <h3>${car.veh_name}</h3>
                ${oldPriceHtml}
                <p>${salePriceHtml}</p>
                <p>Mileage: ${car.mileage} miles</p>
                <p>Year: ${car.year}</p>
                <p>Color: ${car.ext_color}</p>
                <p>Horsepower: ${car.horsepower} hp</p>
            </div>
        `;
    }).join('');
}

// Function to clear search input and filters
function clearSearch() {
    document.getElementById('search-query').value = '';
    document.getElementById('year-filter').value = '';
    document.getElementById('price-filter').value = '';
    document.getElementById('car-results').innerHTML = '';
}

// Function to close the car details and return to the correct list
function closeCarDetails() {

    if (currentPage === 'products') {
        showSection('products');  // Go back to the products page
    }
    else {
        showSection('cars');  // Go back to the fetch cars page
    }
}

// Function that redirects to the payment page
function proceedToPayment(id, name, price) {
    // Collect car details from the car details page
    const carId = id;
    const carName = name;
    const carPrice = price;

    // Redirect to the payment page with car details in the query string
    window.location.href = `/payment?car_id=${carId}&car_name=${encodeURIComponent(carName)}&car_price=${encodeURIComponent(carPrice)}`;
}


// Function to show and hide sections
function showSection(section) {
    console.log(`Showing section: ${section}`);
    if (section === "products") {
        currentPage = 'products';
    }
    if (section === "cars") {
        currentPage = 'cars';
    }
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(section).classList.add('active');
}


// Initialize with Users section visible
window.onload = () => {
    showSection('users');
};
