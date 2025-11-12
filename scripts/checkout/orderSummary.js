import {
  cart,
  removeFromCart,
  updateDeliveryOption,
  updateQuantity,
} from '../../data/cart.js';
import { products, getProduct } from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import {
  deliveryOptions,
  getDeliveryOption,
} from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';

// rendering the checkout page
export function renderOrderSummary() {
  let cartSummaryHTML = '';

  // build HTML for each cart item
  cart.forEach((cartItem) => {
    const productId = String(cartItem.productId);
    const matchingProduct = getProduct(productId);
    const deliveryOptionId = cartItem.deliveryOptionId;

    // function from 'deliveryOptions.js'
    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const dateString = dayjs()
      .add(deliveryOption.deliveryDays, 'days')
      .format('dddd, MMMM D');

    // refresh checkout items count
    updateCheckoutItems();

    cartSummaryHTML += `
  <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
    <div class="delivery-date">
      Delivery date: ${dateString}
    </div>

    <div class="cart-item-details-grid">
      <img class="product-image" src="${matchingProduct.image}" alt="${
      matchingProduct.name
    }">

      <div class="cart-item-details">
        <div class="product-name">
          ${matchingProduct.name}
        </div>
        <div class="product-price">
          $${formatCurrency(matchingProduct.priceCents)}
        </div>
        <div class="product-quantity">
          <label>
            Qty:
            <input
              type="number"
              min="1"
              class="quantity-input"
              data-product-id="${matchingProduct.id}"
              value="${cartItem.quantity}">
          </label>
          <span class="delete-quantity-link link-primary js-delete-link" 
            data-product-id="
                ${matchingProduct.id}">
            Delete
          </span>
        </div>
      </div>

      <div class="delivery-options">
        <div class="delivery-options-title">
          Choose a delivery option:
        </div>
        ${deliveryOptionsHTML(matchingProduct, cartItem)}
      </div>
    </div>
  </div>
`;
  });

  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = '';
    deliveryOptions.forEach((deliveryOption) => {
      const dateString = dayjs()
        .add(deliveryOption.deliveryDays, 'days')
        .format('dddd, MMMM D');

      const priceString =
        deliveryOption.priceCents === 0
          ? 'FREE'
          : `$${formatCurrency(deliveryOption.priceCents)} -`;

      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

      html += `
        <div class="delivery-option js-delivery-option"
        data-product-id="${matchingProduct.id}"
        data-delivery-option-id="${deliveryOption.id}">
            <input
                type="radio"
                id="delivery-${matchingProduct.id}-${deliveryOption.id}"
                name="delivery-option-${matchingProduct.id}"
                value="${deliveryOption.id}"
                data-option-id="${deliveryOption.id}"
                class="delivery-option-input"
                ${isChecked ? 'checked' : ''}>

            <label for="delivery-${matchingProduct.id}-${deliveryOption.id}">
              <div>
                  <div class="delivery-option-date">
                      ${dateString}
                  </div>
                  <div class="delivery-option-price">
                      ${priceString} Shipping
                  </div>    
              </div>
            </label>
        </div>
    `;
    });
    return html;
  }

  // insert summary safely
  const orderSummaryEl = document.querySelector('.js-order-summary');
  if (orderSummaryEl) orderSummaryEl.innerHTML = cartSummaryHTML;

  // --- Attach listeners ONCE after the DOM is updated ---

  // add listeners so choosing a radio updates cart data and the item's top delivery date
  document.querySelectorAll('.delivery-option-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const optionId = input.dataset.optionId ?? input.value;
      // input.name is "delivery-option-<productId>"
      const productId = input.name.replace('delivery-option-', '');

      // update cart data using the function
      updateDeliveryOption(productId, optionId);

      // update only the delivery date element for this item (avoid full re-render)
      const deliveryOptionObj = getDeliveryOption(optionId);
      const dateString = dayjs()
        .add(deliveryOptionObj.deliveryDays, 'days')
        .format('dddd, MMMM D');

      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );
      if (container) {
        const deliveryDateEl = container.querySelector('.delivery-date');
        if (deliveryDateEl)
          deliveryDateEl.textContent = `Delivery date: ${dateString}`;
      }
      // re-render to update everything
      //renderOrderSummary();
      renderPaymentSummary();
    });
  });

  // Update quantity: prompt for new qty -> update cart -> re-render summaries
  document.querySelectorAll('.update-quantity-link').forEach((link) => {
    link.addEventListener('click', () => {
      const container = link.closest('.cart-item-container');
      if (!container) return;
      const deleteLink = container.querySelector('.js-delete-link');
      const productId = deleteLink
        ? String(deleteLink.dataset.productId)
        : null;
      if (!productId) return;

      const qtyLabel = container.querySelector('.quantity-label');
      const current = qtyLabel ? Number(qtyLabel.textContent) : 1;
      const input = prompt('Enter quantity', String(current));
      if (input === null) return; // cancelled
      const newQty = Number(input);
      if (Number.isNaN(newQty) || newQty < 1)
        return alert('Please enter a valid quantity (1 or more).');

      updateQuantity(productId, newQty);

      // re-render entire order summary and payment summary to reflect quantity change
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  // delete functionality (guard DOM removal)
  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = String(link.dataset.productId).trim();
      // remove from cart data
      removeFromCart(productId);

      // remove DOM container if present
      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );
      if (container) container.remove();

      // updating payment section
      renderPaymentSummary();

      // refresh checkout items count
      updateCheckoutItems();
    });
  });

  // add listeners so choosing a radio updates cart data and the item's top delivery date
  document.querySelectorAll('.delivery-option-input').forEach((input) => {
    input.addEventListener('change', (event) => {
      const optionId = input.dataset.optionId ?? input.value;
      // input.name is "delivery-option-<productId>"
      const productId = input.name.replace('delivery-option-', '');

      // update cart data using the function
      updateDeliveryOption(productId, optionId);

      // only update payment summary, not the entire order summary
      renderPaymentSummary();
    });
  });

  // fixing top of the page checkout items
  function updateCheckoutItems() {
    let itemAmount = 0;
    cart.forEach((item) => {
      itemAmount += item.quantity;
    });
    const result =
      itemAmount === 0 || itemAmount === 1
        ? `${itemAmount} Item`
        : `${itemAmount} Items`;
    document.querySelector('.return-to-home-link').innerHTML = result;
  }
  updateCheckoutItems();
}
