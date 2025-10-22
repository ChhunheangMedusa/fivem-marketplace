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
    // Store complete product data including images
    cart.push({
      ...product,
      quantity: 1,
      // Ensure all product data is preserved
      images: product.images || [],
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      fullDescription: product.fullDescription || "",
      installation: product.installation || "",
      dependencies: product.dependencies || [],
      categories: product.categories || [],
      torrentFile: product.torrentFile || "",
    });
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
// Enhanced download functions with torrent support
function downloadProduct(filePath, productName, fileType = "zip") {
  showNotification(
    `Starting ${fileType.toUpperCase()} download: ${productName}`
  );

  const link = document.createElement("a");
  link.href = filePath;

  if (fileType === "torrent") {
    link.download = `${productName.replace(/\s+/g, "-").toLowerCase()}.torrent`;
    link.target = "_blank";
  } else {
    link.download = `${productName.replace(/\s+/g, "-").toLowerCase()}.zip`;
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    showNotification(
      `${productName} ${fileType.toUpperCase()} download started!`
    );
  }, 1000);
}

function downloadWithOptions(product, fileType = "zip") {
  const filePath =
    fileType === "torrent" ? product.torrentFile : product.downloadFile;

  if (!filePath) {
    showNotification(
      `No ${fileType} file available for ${product.title}`,
      "error"
    );
    return;
  }

  downloadProduct(filePath, product.title, fileType);
}

// Purchase process
function handlePurchase(product) {
  if (product.price === 0) {
    // Free product - direct torrent download
    if (product.torrentFile) {
      downloadProduct(product.torrentFile, product.title);
    } else {
      showNotification("No torrent file available for this product", "error");
    }
  } else {
    // Paid product - redirect to Telegram with product details
    sendProductToTelegram(product);
  }
}
function sendProductToTelegram(product) {
  // Create clickable image links
  const imageLinks = product.images
    .map((image, index) => `📸 Image ${index + 1}: [View Here](${image})`)
    .join("\n");

  const message = [
    `🛒 *PRODUCT ORDER REQUEST*`,
    ``,
    `*📦 Product Details:*`,
    `🏷️ *Title:* ${product.title}`,
    `💰 *Price:* $${product.price}`,
    `📝 *Short Description:* ${product.shortDescription}`,
    `🔧 *Categories:* ${product.categories.join(", ")}`,
    ``,
    `*📋 Full Description:*`,
    `${product.fullDescription}`,
    ``,
    `*⚙️ Installation:*`,
    `\`\`\`${product.installation}\`\`\``,
    ``,
    `*📦 Dependencies:*`,
    `\`${product.dependencies.join(", ")}\``,
    ``,
    `*🖼️ Product Images:*`,
    `${imageLinks}`,
    ``,
    `*🔗 Torrent File:*`,
    `\`${product.torrentFile || "Provided after payment"}\``,
    ``,
    `*💳 Order Total: $${product.price}*`,
    ``,
    `_Click the image links above to view screenshots_`,
    `_Then process this order and send download instructions_`,
  ].join("\n");

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://t.me/heanghg799?text=${encodedMessage}`, "_blank");

  showNotification("Opening Telegram with product details...");
}
function createProductMessage(product) {
  const lines = [
    `🛒 *PRODUCT ORDER REQUEST*`,
    ``,
    `*📦 Product Details:*`,
    `🏷️ *Title:* ${product.title}`,
    `💰 *Price:* $${product.price}`,
    `📝 *Description:* ${product.description}`,
    `🔧 *Categories:* ${product.categories.join(", ")}`,
    ``,
    `*📋 Full Description:*`,
    `${product.fullDescription}`,
    ``,
    `*⚙️ Installation Instructions:*`,
    `${product.installation}`,
    ``,
    `*📦 Dependencies Required:*`,
    `• ${product.dependencies.join("\n• ")}`,
    ``,
    `*🖼️ Product Images (${product.images.length}):*`,
    `*Please copy and paste these image URLs in Telegram to view:*`,
    ``,
    `*🔗 Torrent Download:*`,
    `${product.torrentFile || "Will be provided after payment"}`,
    ``,
    `*💳 Order Instructions:*`,
    `1. Copy the image URLs above`,
    `2. Paste each URL in Telegram to view the images`,
    `3. Process the order and provide download link`,
    ``,
    `Thank you! 🎮`,
  ];

  return lines.join("\n");
}
// Enhanced Telegram message formatter
function createTelegramMessage(product) {
  const lines = [
    `🛒 *PRODUCT ORDER REQUEST*`,
    ``,
    `*📦 Product Details:*`,
    `🏷️ *Title:* ${product.title}`,
    `💰 *Price:* $${product.price}`,
    `📝 *Description:* ${product.description}`,
    `🔧 *Categories:* ${product.categories.join(", ")}`,
    ``,
    `*📋 Full Description:*`,
    `${product.fullDescription}`,
    ``,
    `*⚙️ Installation Instructions:*`,
    `${product.installation}`,
    ``,
    `*📦 Dependencies Required:*`,
    `• ${product.dependencies.join("\n• ")}`,
    ``,
    `*🖼️ Product Images:*`,
    `• ${product.images.join("\n• ")}`,
    ``,
    `*🔗 Torrent Download:*`,
    `${product.torrentFile || "Will be provided after payment"}`,
    ``,
    `*💳 Order Information:*`,
    `All product details, images, and download instructions are included above.`,
    `Please process this order and provide the torrent download link.`,
    ``,
    `Thank you! 🎮`,
  ];

  return lines.join("\n");
}
// Function to handle purchase from cart with multiple products
function createCartTelegramMessage(products) {
  let message = `🛒 *ORDER REQUEST - ${products.length} PRODUCT(S)*\n\n`;

  let total = 0;

  products.forEach((product, index) => {
    const productTotal = product.price * product.quantity;
    total += productTotal;

    message += `*📦 PRODUCT ${index + 1}*\n`;
    message += `┌────────────────────────\n`;
    message += `│ 🏷️ *Title:* ${product.title}\n`;
    message += `│ 💰 *Price:* $${product.price} x ${
      product.quantity
    } = $${productTotal.toFixed(2)}\n`;
    message += `│ 📝 *Description:* ${
      product.shortDescription || product.description
    }\n`;
    message += `│ 🔧 *Categories:* ${
      product.categories?.join(", ") || "N/A"
    }\n`;
    message += `│ ⚙️ *Dependencies:* ${
      product.dependencies?.join(", ") || "None"
    }\n`;
    message += `│ 🖼️ *Images:* ${product.images?.length || 0} screenshots\n`;

    // Add image URLs
    if (product.images && product.images.length > 0) {
      message += `│ 📸 *Image URLs:*\n`;
      product.images.forEach((image, imgIndex) => {
        message += `│    ${imgIndex + 1}. ${image}\n`;
      });
    }

    message += `│ 🔗 *Torrent:* ${
      product.torrentFile || "Provided after payment"
    }\n`;
    message += `└────────────────────────\n\n`;
  });

  const tax = total * 0.1;
  const finalTotal = total + tax;

  message += `*💰 ORDER SUMMARY*\n`;
  message += `┌────────────────────────\n`;
  message += `│ 📦 Total Items: ${products.length}\n`;
  message += `│ 💵 Subtotal: $${total.toFixed(2)}\n`;
  message += `│ 🧾 Tax (10%): $${tax.toFixed(2)}\n`;
  message += `│ 💳 *TOTAL: $${finalTotal.toFixed(2)}*\n`;
  message += `└────────────────────────\n\n`;

  message += `*📋 IMPORTANT INSTRUCTIONS*\n`;
  message += `1. Copy the image URLs above\n`;
  message += `2. Paste each URL in Telegram to view product screenshots\n`;
  message += `3. Process the payment\n`;
  message += `4. Provide torrent download links\n\n`;

  message += `Thank you for your business! 🎮`;

  return message;
}
function showDownloadOptions(product) {
  // Create a modal or show download options
  const hasZip = product.downloadFile;
  const hasTorrent = product.torrentFile;

  if (!hasZip && !hasTorrent) {
    showNotification("No download files available for this product", "error");
    return;
  }

  if (hasZip && hasTorrent) {
    // Show download options modal
    showDownloadModal(product);
  } else if (hasZip) {
    downloadWithOptions(product, "zip");
  } else if (hasTorrent) {
    downloadWithOptions(product, "torrent");
  }
}

function showDownloadModal(product) {
  // Create download options modal
  const modalHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 class="text-xl font-semibold mb-4">Download Options</h3>
              <p class="text-gray-300 mb-4">Choose your preferred download method for <strong>${
                product.title
              }</strong>:</p>
              
              <div class="space-y-3">
                  ${
                    product.downloadFile
                      ? `
                  <button onclick="downloadWithOptions(${JSON.stringify(
                    product
                  ).replace(/"/g, "&quot;")}, 'zip'); closeDownloadModal();" 
                          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition flex items-center justify-center">
                      <i class="fas fa-file-archive mr-2"></i>
                      Download ZIP File
                  </button>
                  `
                      : ""
                  }
                  
                  ${
                    product.torrentFile
                      ? `
                  <button onclick="downloadWithOptions(${JSON.stringify(
                    product
                  ).replace(
                    /"/g,
                    "&quot;"
                  )}, 'torrent'); closeDownloadModal();" 
                          class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition flex items-center justify-center">
                      <i class="fas fa-magnet mr-2"></i>
                      Download Torrent File
                  </button>
                  `
                      : ""
                  }
              </div>
              
              <div class="mt-4 text-sm text-gray-400">
                  <p><i class="fas fa-info-circle mr-1"></i> ZIP: Direct download, faster for small files</p>
                  <p><i class="fas fa-info-circle mr-1"></i> Torrent: Better for large files, supports resuming</p>
              </div>
              
              <button onclick="closeDownloadModal()" 
                      class="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition">
                  Cancel
              </button>
          </div>
      </div>
  `;

  const modal = document.createElement("div");
  modal.id = "downloadModal";
  modal.innerHTML = modalHTML;
  document.body.appendChild(modal);
}

function closeDownloadModal() {
  const modal = document.getElementById("downloadModal");
  if (modal) {
    document.body.removeChild(modal);
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
