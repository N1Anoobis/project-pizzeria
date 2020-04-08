import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.products = [];
    // console.log('element', element);
    thisCart.getElements(element);
    thisCart.initActions();
    // thisCart.update();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    thisCart.dom.inputPhone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    //  console.log(thisCart.dom.inputPhone);
    thisCart.dom.inputAddress = thisCart.dom.wrapper.querySelector(select.cart.address);

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    // define element in with we will display active order afrer button add order clicked
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    // console.log(thisCart.dom.productList);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function () {
      thisCart.remove(event.detail.cartProduct);
    });
    // custom event attempt
    thisCart.dom.productList.addEventListener('edit', function () {
      thisCart.remove(event.detail.cartProduct);
      return (event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (e) {
      e.preventDefault();

      // taking lenght of object!
      if (!Object.keys(thisCart.products).length) {
        return;
        //simple valiacion of length of inputs
      } else {
        if (Object.keys(thisCart.dom.inputPhone.value).length < 9) {

          thisCart.dom.inputPhone.classList.add('error');
          return;

        } else if (Object.keys(thisCart.dom.inputAddress.value).length < 8) {
          thisCart.dom.inputAddress.classList.add('error');
          return;
        }
        thisCart.dom.inputPhone.classList.remove('error');
        thisCart.dom.inputAddress.classList.remove('error');
        thisCart.sendOrder();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      }

    });
    // event input to check current value of input
    thisCart.dom.inputPhone.addEventListener('input', function (e) {
      e.preventDefault();

      let mobile = thisCart.dom.inputPhone.value;


      thisCart.dom.inputPhone.classList.remove('error');

      thisCart.dom.inputPhone.classList.remove('error');
      if (mobile.length < 9) {

        thisCart.dom.inputPhone.classList.add('error');

        return;
      }
    });
    // event input to check current value of input
    thisCart.dom.inputAddress.addEventListener('input', function (e) {
      e.preventDefault();

      thisCart.dom.inputAddress.classList.remove('error');
      let adress = thisCart.dom.inputAddress.value;

      if (adress.length < 8) {

        thisCart.dom.inputAddress.classList.add('error');

        return;
      }
    });
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.inputAddress.value,
      totalPrice: thisCart.totalPrice,
      phone: thisCart.dom.inputPhone.value,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (const prod of thisCart.products) {
      // let result = prod.getData();payload
      payload.products.push(prod.getData());

    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),

    };

    fetch(url, options)
      .then(function (response) {
        // return response.json();
        console.log('response', response);
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
    //clearing cart after submiting order
    for (const prod of thisCart.products) {
      thisCart.clearBasket(prod);
    }

  }

  add(menuProduct) {
    const thisCart = this;
    //creating HTML
    const generatedHTML = templates.cartProduct(menuProduct);

    thisCart.element = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(thisCart.element);

    thisCart.products.push(new CartProduct(menuProduct, thisCart.element));
    thisCart.update();
  }

  update() {
    const thisCart = this;
    //reset price of delivery if there is no items in basket
    // thisCart.products.length == 0 ? thisCart.deliveryFee = 0 : thisCart.deliveryFee = 20;
    thisCart.deliveryFee = thisCart.products.length == 0 ? 0 : 20;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    // effect of loading cart
    thisCart.dom.form.classList.add('change');
    setTimeout(() => {
      thisCart.dom.form.classList.remove('change');
    }, 200);


    for (const prod of thisCart.products) {
      thisCart.subtotalPrice = thisCart.subtotalPrice + prod.price;
      thisCart.totalNumber = thisCart.totalNumber + prod.amount;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }
  }

  remove(cartProduct) {
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
    // if cart is empty then reset additional styles
    if (!Object.keys(thisCart.products).length) {
      thisCart.dom.inputPhone.classList.remove('error');
      thisCart.dom.inputAddress.classList.remove('error');
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    }
  }

  edit(thisProduct) {
    const thisCart = this;
  
    thisCart.remove(thisProduct);
  
  }

  //clearing cart after submiting order
  clearBasket(cartProduct) {
    const thisCart = this;
    thisCart.products = [];
    cartProduct.dom.wrapper.remove();
    thisCart.update();
    // thisCart.dom.inputPhone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.inputPhone.value = null;
    // thisCart.dom.inputAddress = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.inputAddress.value = null;
  }
}

export default Cart;