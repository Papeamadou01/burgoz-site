/* ============================================================
   BURGOZ FAST FOOD — script.js
   Gestion du menu, filtres, panier et notifications
   ============================================================ */

// =============================================
// DONNÉES DU MENU
// Chaque produit : id, catégorie, nom, description,
// prix (FCFA), emoji, couleur de fond, badge, étoiles
// =============================================
const menu = [
  {
    id: 1, cat: 'burger',
    name: 'Classic Burgoz',
    desc: 'Steak haché, cheddar, tomate, salade, sauce maison',
    price: 3500, emoji: '🍔', bg: 'bg1', badge: 'hot', stars: 5
  },
  {
    id: 2, cat: 'burger',
    name: 'Double Cheese',
    desc: 'Double steak, double cheddar, oignons caramélisés',
    price: 4500, emoji: '🍔', bg: 'bg2', badge: 'hot', stars: 5
  },
  {
    id: 3, cat: 'burger',
    name: 'Chicken Crispy',
    desc: 'Blanc de poulet frit, coleslaw, sauce buffalo',
    price: 3800, emoji: '🍗', bg: 'bg3', badge: 'new', stars: 4
  },
  {
    id: 4, cat: 'burger',
    name: 'Veggie Burgoz',
    desc: 'Galette de légumes, avocat, tomate, sauce yaourt',
    price: 3200, emoji: '🥬', bg: 'bg4', badge: null, stars: 4
  },
  {
    id: 5, cat: 'tacos',
    name: 'Tacos Royal',
    desc: 'Poulet grillé, fromage fondu, frites, sauce fromagère',
    price: 4000, emoji: '🌮', bg: 'bg5', badge: 'hot', stars: 5
  },
  {
    id: 6, cat: 'tacos',
    name: 'Tacos Géant',
    desc: 'Double viande, double fromage, sauce algérienne',
    price: 5000, emoji: '🌯', bg: 'bg6', badge: null, stars: 5
  },
  {
    id: 7, cat: 'frites',
    name: 'Frites Classic',
    desc: 'Pommes de terre fraîches dorées à point',
    price: 1200, emoji: '🍟', bg: 'bg7', badge: null, stars: 4
  },
  {
    id: 8, cat: 'frites',
    name: 'Frites XL Épicées',
    desc: 'Frites maxi format, épices maison, sauce dip',
    price: 1800, emoji: '🍟', bg: 'bg8', badge: 'new', stars: 5
  },
  {
    id: 9, cat: 'frites',
    name: 'Nuggets x6',
    desc: 'Nuggets de poulet croustillants, sauce au choix',
    price: 2000, emoji: '🍗', bg: 'bg1', badge: null, stars: 4
  },
  {
    id: 10, cat: 'boisson',
    name: 'Coca-Cola 50cl',
    desc: 'Coca-Cola bien frais',
    price: 800, emoji: '🥤', bg: 'bg2', badge: null, stars: 4
  },
  {
    id: 11, cat: 'boisson',
    name: 'Jus de Bissap',
    desc: 'Bissap frais maison, légèrement sucré',
    price: 700, emoji: '🫐', bg: 'bg3', badge: 'new', stars: 5
  },
  {
    id: 12, cat: 'dessert',
    name: 'Sundae Caramel',
    desc: 'Glace vanille, sauce caramel, chantilly',
    price: 1500, emoji: '🍦', bg: 'bg4', badge: null, stars: 4
  }
];

// =============================================
// ÉTAT GLOBAL
// =============================================
let cart = [];           // Articles dans le panier
let currentCat = 'all'; // Catégorie active
let toastTimer = null;   // Timer pour la notification

// =============================================
// RENDU DU MENU
// Génère les cartes produits selon la catégorie
// =============================================
function renderMenu(cat) {
  const grid = document.getElementById('menuGrid');

  // Filtrage selon la catégorie sélectionnée
  const items = cat === 'all' ? menu : menu.filter(m => m.cat === cat);

  // Génération du HTML de chaque carte
  grid.innerHTML = items.map(item => {
    const inCart = cart.find(c => c.id === item.id);

    // Génération des étoiles (remplies / vides)
    const starsHTML = '★'.repeat(item.stars) + '☆'.repeat(5 - item.stars);

    // Badge (Populaire / Nouveau)
    let badgeHTML = '';
    if (item.badge === 'hot') {
      badgeHTML = '<span class="badge-hot">🔥 POPULAIRE</span>';
    } else if (item.badge === 'new') {
      badgeHTML = '<span class="badge-new">✨ NOUVEAU</span>';
    }

    return `
      <div class="menu-card">
        <div class="card-img ${item.bg}">
          <span style="font-size:3.5rem">${item.emoji}</span>
          ${badgeHTML}
        </div>
        <div class="card-body">
          <div class="stars">${starsHTML}</div>
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          <div class="card-footer">
            <span class="price">${item.price.toLocaleString('fr-FR')} FCFA</span>
            <button
              class="add-btn ${inCart ? 'added' : ''}"
              onclick="addToCart(${item.id})"
              title="Ajouter au panier"
            >
              ${inCart ? '✓' : '+'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// =============================================
// FILTRE PAR CATÉGORIE
// =============================================
function filterCat(btn, cat) {
  // Retire la classe active de tous les boutons
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  // Active le bouton cliqué
  btn.classList.add('active');
  // Mémorise la catégorie active et re-render
  currentCat = cat;
  renderMenu(cat);
}

// =============================================
// AJOUT AU PANIER
// =============================================
function addToCart(id) {
  const item = menu.find(m => m.id === id);
  const existing = cart.find(c => c.id === id);

  if (existing) {
    // Si déjà dans le panier → augmenter la quantité
    existing.qty++;
  } else {
    // Sinon → ajouter avec quantité = 1
    cart.push({ ...item, qty: 1 });
  }

  updateCart();
  renderMenu(currentCat);
  showToast(`✅ ${item.emoji} ${item.name} ajouté !`);
}

// =============================================
// MODIFICATION DE QUANTITÉ DANS LE PANIER
// =============================================
function changeQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx < 0) return;

  cart[idx].qty += delta;

  // Si la quantité tombe à 0 ou moins → retirer du panier
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }

  updateCart();
  renderMenu(currentCat);
}

// =============================================
// MISE À JOUR DE L'AFFICHAGE DU PANIER
// =============================================
function updateCart() {
  // Total des articles
  const count = cart.reduce((sum, c) => sum + c.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const itemsEl  = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  // Panier vide
  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div>🛒</div>
        Votre panier est vide
      </div>
    `;
    footerEl.style.display = 'none';
    return;
  }

  // Liste des articles dans le panier
  itemsEl.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="ci-emoji">${c.emoji}</div>
      <div class="ci-info">
        <h4>${c.name}</h4>
        <span>${(c.price * c.qty).toLocaleString('fr-FR')} FCFA</span>
      </div>
      <div class="ci-qty">
        <button class="qty-btn" onclick="changeQty(${c.id}, -1)">−</button>
        <span class="qty-n">${c.qty}</span>
        <button class="qty-btn" onclick="changeQty(${c.id}, 1)">+</button>
      </div>
    </div>
  `).join('');

  // Calcul des totaux
  const subtotal  = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const isFreeDel = subtotal >= 8000;
  const delivery  = isFreeDel ? 0 : 1000;
  const total     = subtotal + delivery;

  document.getElementById('subtotal').textContent = subtotal.toLocaleString('fr-FR') + ' FCFA';
  document.getElementById('delivery').textContent  = isFreeDel ? 'Gratuite' : '1 000 FCFA';
  document.getElementById('total').textContent     = total.toLocaleString('fr-FR') + ' FCFA';
  footerEl.style.display = 'block';
}

// =============================================
// OUVERTURE / FERMETURE DU PANIER
// =============================================
function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartPanel').classList.toggle('open');
}

// =============================================
// SCROLL VERS LE MENU
// =============================================
function scrollToMenu() {
  document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' });
}

// =============================================
// NOTIFICATION TOAST
// Affiche un message pendant 2,2 secondes
// =============================================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// =============================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  renderMenu('all');
});