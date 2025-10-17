// Global state management
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentTheme = localStorage.getItem("theme") || "dark";

// Initialize the application
function initApp() {
  applyTheme(currentTheme);
  updateCartCount();
  loadNavigation();
}

// Theme management
function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", currentTheme);
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  document.documentElement.className = theme;
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.innerHTML =
      theme === "dark"
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
  }
}

// Cart management
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification("Product added to cart!");
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  if (typeof renderCart === "function") {
    renderCart();
  }
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.classList.toggle("hidden", totalItems === 0);
  }
}

function getCart() {
  return cart;
}

function clearCart() {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Notification system
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  } text-white`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.remove("translate-x-full");
  }, 100);

  setTimeout(() => {
    notification.classList.add("translate-x-full");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Data loading
async function loadData() {
  try {
    const response = await fetch("data.json");
    return await response.json();
  } catch (error) {
    console.error("Error loading data:", error);
    return { products: [], categories: [] };
  }
}

// Search functionality
function searchProducts(products, query) {
  if (!query) return products;

  const lowerQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.title.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.categories.some((cat) => cat.toLowerCase().includes(lowerQuery))
  );
}

// Filter products by category
function filterByCategory(products, category) {
  if (!category || category === "all") return products;
  return products.filter((product) => product.categories.includes(category));
}

// Navigation
function loadNavigation() {
  const navElements = document.querySelectorAll("nav a");
  navElements.forEach((link) => {
    if (
      link.getAttribute("href") === window.location.pathname.split("/").pop()
    ) {
      link.classList.add("text-blue-400", "font-semibold");
    }
  });
}

// Purchase process
function handlePurchase(product) {
  if (product.price === 0) {
    // Free product - direct download
    startDownload(product);
  } else {
    // Paid product - redirect to Telegram
    const message = `Product: ${product.title}\nPrice: $${product.price}\nDescription: ${product.shortDescription}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://t.me/heanghg799?text=${encodedMessage}`, "_blank");
  }
}

function startDownload(product) {
  // Simulate download
  showNotification(`Downloading ${product.title}...`);
  // In a real implementation, this would trigger the actual file download
  setTimeout(() => {
    showNotification("Download complete! Thank you for your purchase.");
  }, 2000);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);
