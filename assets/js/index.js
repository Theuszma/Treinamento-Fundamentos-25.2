document.addEventListener('DOMContentLoaded', () => {

    const productCards = document.querySelectorAll('.produto-card');
    productCards.forEach(card => {
        const folder = card.dataset.folder;
        if (!folder) return;
        const imageNames = card.dataset.images.split(',');
        const images = imageNames.map(name => folder + name.trim());
        let currentIndex = 0;
        const productImage = card.querySelector('.produto-imagem');
        const prevButton = card.querySelector('.nav-btn.prev-btn');
        const nextButton = card.querySelector('.nav-btn.next-btn');
        if (!productImage || !prevButton || !nextButton || images.length <= 1) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            return;
        }
        function updateImage() { productImage.src = images[currentIndex]; }
        prevButton.addEventListener('click', () => { currentIndex--; if (currentIndex < 0) { currentIndex = images.length - 1; } updateImage(); });
        nextButton.addEventListener('click', () => { currentIndex++; if (currentIndex >= images.length) { currentIndex = 0; } updateImage(); });
    });

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const allProductCards = document.querySelectorAll('.produto-card');
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        allProductCards.forEach(card => {
            const productName = card.dataset.name ? card.dataset.name.toLowerCase() : '';
            const priceElement = card.querySelector('.preco');
            const priceText = priceElement ? priceElement.textContent.toLowerCase().trim() : '';
            if (searchTerm === '') { card.style.display = 'flex'; return; }
            const nameMatch = productName.includes(searchTerm);
            const priceMatch = priceText.includes(searchTerm);
            if (nameMatch || priceMatch) { card.style.display = 'flex'; } else { card.style.display = 'none'; }
        });
    }
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', performSearch);
        searchInput.addEventListener('input', () => { if (searchInput.value.trim() === '') { performSearch(); } });
    }

    const loginMenuButton = document.getElementById('login-menu-button');
    const modalOverlay = document.getElementById('login-modal-overlay');
    const closeModalButton = document.getElementById('close-modal-button');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    function updateToLoggedIn(email) {
        const username = email.split('@')[0];
        if (loginMenuButton) {
            loginMenuButton.textContent = username;
            loginMenuButton.removeEventListener('click', openModal);
            loginMenuButton.addEventListener('click', logout);
        }
    }
    function updateToLoggedOut() {
        if (loginMenuButton) {
            loginMenuButton.textContent = 'Login';
            loginMenuButton.removeEventListener('click', logout);
            loginMenuButton.addEventListener('click', openModal);
        }
    }
    function openModal() {
        if (modalOverlay) {
            modalOverlay.classList.add('visible');
        }
    }
    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('visible');
        }
    }
    function logout() {
        if (confirm('Você tem certeza que deseja sair?')) {
            localStorage.removeItem('userEmail');
            updateToLoggedOut();
        }
    }
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;
            const isEmailValid = isValidEmail(email);
            const isPasswordValid = password.length > 4;
            if (isEmailValid && isPasswordValid) {
                alert('Login bem-sucedido!');
                localStorage.setItem('userEmail', email);
                closeModal();
                updateToLoggedIn(email);
            } else {
                if (!isEmailValid) {
                    alert('Por favor, insira um email em um formato válido (ex: nome@dominio.com).');
                } else if (!isPasswordValid) {
                    alert('A senha precisa ter mais de 4 caracteres.');
                }
            }
        });
    }
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
    }
    function checkLoginState() {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            updateToLoggedIn(savedEmail);
        } else {
            updateToLoggedOut();
        }
    }
    checkLoginState();

    let cart = [];
    
    const cartIconButton = document.getElementById('cart-icon');
    const cartPanel = document.getElementById('cart-panel');
    const closeCartButton = document.getElementById('close-cart-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCounter = document.getElementById('cart-counter');
    const allComprarButtons = document.querySelectorAll('.comprar-btn');
    const checkoutButton = document.getElementById('checkout-button');
    const checkoutModal = document.getElementById('checkout-modal-overlay');
    const closeCheckoutModalButton = document.getElementById('close-checkout-modal-button');
    const addToCartMessage = document.getElementById('add-to-cart-message');

    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    function loadCart() {
        const savedCart = localStorage.getItem('shoppingCart');
        cart = savedCart ? JSON.parse(savedCart) : [];
        updateCartUI();
    }

    function showAddToCartMessage() {
        addToCartMessage.classList.add('show');
        setTimeout(() => {
            addToCartMessage.classList.remove('show');
        }, 1500);
    }

    function addToCart(event) {
        const button = event.target;
        const productCard = button.closest('.produto-card');
        const productId = productCard.dataset.productId;
        const name = productCard.dataset.name;
        const price = productCard.querySelector('.preco').textContent;
        const image = productCard.querySelector('.produto-imagem').src;
        
        let existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            const item = {
                productId: productId,
                name: name,
                price: price,
                image: image,
                quantity: 1
            };
            cart.push(item);
        }

        saveCart();
        updateCartUI();
        showAddToCartMessage();
        if(cartIconButton) {
            cartIconButton.classList.add('shake');
            setTimeout(() => cartIconButton.classList.remove('shake'), 500);
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.productId !== productId);
        saveCart();
        updateCartUI();
    }

    function updateCartUI() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="padding: 20px; text-align: center;">Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <div class="cart-item-quantity">${item.quantity}</div>
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.quantity > 1 ? item.quantity + 'x ' : ''}${item.price}</p>
                    </div>
                    <button class="cart-item-remove-btn" data-product-id="${item.productId}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        
        const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);
        if(cartCounter) {
            cartCounter.textContent = totalItemsInCart;
            if (totalItemsInCart > 0) {
                cartCounter.classList.add('visible');
            } else {
                cartCounter.classList.remove('visible');
            }
        }

        document.querySelectorAll('.cart-item-remove-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.productId;
                removeFromCart(productId);
            });
        });
    }

    allComprarButtons.forEach(button => button.addEventListener('click', addToCart));
    if(cartIconButton) cartIconButton.addEventListener('click', () => cartPanel.classList.add('open'));
    if(closeCartButton) closeCartButton.addEventListener('click', () => cartPanel.classList.remove('open'));

    if(checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            const isLoggedIn = localStorage.getItem('userEmail');

            if (!isLoggedIn) {
                alert('Faça login antes');
                return; 
            }
            
            if (cart.length === 0) {
                alert('Carrinho vazio');
                return;
            }

            if(cartPanel) cartPanel.classList.remove('open');
            if(checkoutModal) checkoutModal.classList.add('visible');
        });
    }
    if(closeCheckoutModalButton) closeCheckoutModalButton.addEventListener('click', () => checkoutModal.classList.remove('visible'));
    
    loadCart();

});