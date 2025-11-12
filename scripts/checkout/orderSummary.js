import { cart, removeFromCart, updateDeliveryOption } from '../../data/cart.js';
import { products, getProduct } from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import {
  deliveryOptions,
  getDeliveryOption,
} from '../../data/deliveryOptions.js';

// rendering the checkout page
export function renderOrderSummary() {
  let cartSummaryHTML = '';

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
      <img class="product-image" src="${matchingProduct.image}">

      <div class="cart-item-details">
        <div class="product-name">
          ${matchingProduct.name}
        </div>
        <div class="product-price">
          $${formatCurrency(matchingProduct.priceCents)}
        </div>
        <div class="product-quantity">
          <span>
            Quantity: <span class="quantity-label">${cartItem.quantity}</span>
          </span>
          <span class="update-quantity-link link-primary">
            Update
          </span>
          <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${
            matchingProduct.id
          }">
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

  // add listeners so choosing a radio updates cart data and the item's top delivery date
  document.querySelectorAll('.delivery-option-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const optionId = input.dataset.optionId ?? input.value;
      // input.name is "delivery-option-<productId>"
      const productId = input.name.replace('delivery-option-', '');

      // update cart data (mutate imported cart array)
      const cartItem = cart.find(
        (ci) => String(ci.productId) === String(productId)
      );
      if (cartItem) {
        cartItem.deliveryOptionId = optionId;
      }

      // compute new date string and update the delivery-date element inside this item's container
      const selectedOption =
        deliveryOptions.find((opt) => String(opt.id) === String(optionId)) ||
        deliveryOptions[0];
      const dateString = dayjs()
        .add(selectedOption.deliveryDays, 'days')
        .format('dddd, MMMM D');

      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );
      if (container) {
        const deliveryDateEl = container.querySelector('.delivery-date');
        if (deliveryDateEl)
          deliveryDateEl.textContent = `Delivery date: ${dateString}`;
      }
    });
  });

  // delete functionality (guard DOM removal)
  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = String(link.dataset.productId);
      // remove from cart data
      removeFromCart(productId);

      // remove DOM container if present
      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );
      if (container) container.remove();

      // refresh checkout items count
      updateCheckoutItems();
    });
  });

  document.querySelectorAll('.js-delivery-option').forEach((element) => {
    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
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
