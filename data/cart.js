import { getProduct } from './products.js';

export let cart = JSON.parse(localStorage.getItem('cart'));

// Give a default value for now if the cart is null
if (!cart) {
  cart = [
    {
      productId: 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6',
      quantity: 2,
      deliveryOptionId: '1',
    },
    {
      productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d',
      quantity: 1,
      deliveryOptionId: '2',
    },
  ];
}

/* Adding selected items to localStorage() thus page refresh
   does not affect products selected */
function saveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// function to use in amazon.js '.js-add-to-cart' element
export function addToCart(productId) {
  // check if item is already in the cart
  const matchingItem = cart.find(
    (cartItem) => String(cartItem.productId) === String(productId)
  );

  // if it is, increasing quantity by 1
  if (matchingItem) {
    matchingItem.quantity += 1;
  } else {
    cart.push({
      productId: productId,
      quantity: 1,
      deliveryOptionId: '1',
    });
  }

  saveToStorage();
}

export function updateQuantity(productId, newQuantity) {
  const matchingItem = cart.find(
    (cartItem) => String(cartItem.productId) === String(productId)
  );

  if (matchingItem) {
    matchingItem.quantity = Number(newQuantity);
    if (matchingItem.quantity <= 0) {
      // remove instead of keeping zero or negative
      cart = cart.filter((ci) => String(ci.productId) !== String(productId));
    }
    saveToStorage();
  }
}

// function to remove product from the cart
export function removeFromCart(productId) {
  const newCart = [];
  cart.forEach((cartItem) => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }
  });

  cart = newCart;
  saveToStorage();
}

export function updateDeliveryOption(productId, deliveryOptionId) {
  const matchingItem = cart.find(
    (cartItem) => String(cartItem.productId) === String(productId)
  );

  if (matchingItem) {
    matchingItem.deliveryOptionId = deliveryOptionId;
    saveToStorage();
  }
}
