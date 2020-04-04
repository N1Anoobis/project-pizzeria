/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      // console.log('new Product:', thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;

      //generate HTML based on templated
      const generatedHTML = templates.menuProduct(thisProduct.data);

      //create elements using utils.createDOMFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      //add element to menu
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      // console.log(thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      // console.log(thisProduct);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);

      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      // console.log(thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      // console.log(thisProduct.priceElem );
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      // console.log(thisProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    }

    // version with no if
    // initAccordion() {
    //   const thisProduct = this;

    //   const clickedElements = thisProduct.element.querySelectorAll(select.menuProduct.clickable);
    //   for (const clEl of clickedElements) {
    //     clEl.addEventListener('click', function (e) {
    //       e.preventDefault();

    //         console.log('all elements', allInEl);

    //         allInEl.classList.remove('active');
    //       }

    //       clEl.parentNode.classList.toggle('active');

    //     });
    //   }
    // }

    initAccordion() {
      const thisProduct = this;
      // console.log(thisProduct.element);
      /* find the clickable trigger (the element that should react to clicking) */
      const clickedElements = thisProduct.element.querySelectorAll(select.menuProduct.clickable);
      /* START: click event listener to trigger */
      for (const clicked of clickedElements) {
        clicked.addEventListener('click', function (e) {
          /* prevent default action for event */
          e.preventDefault();

          /* toggle active class on element of thisProduct */
          thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
          /* find all active products */
          const allActiveProd = document.querySelectorAll(select.all.menuProductsActive);
          /* START LOOP: for each active product */
          for (const allAct of allActiveProd) {
            /* START: if the active product isn't the element of thisProduct */
            if (allAct != clicked.parentNode) {
              /* remove class active for the active product */
              allAct.classList.remove(classNames.menuProduct.wrapperActive);
            }
            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        });
      }
      /* END: click event listener to trigger */
    }

    initOrderForm() {
      const thisProduct = this;
      // console.log('initOrderForm');
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();

      });
    }

    processOrder() {
      const thisProduct = this;
      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);

      thisProduct.params = {};
      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;

      /* START LOOP: for each paramId in thisProduct.data.params */

      for (const paramID in thisProduct.data.params) {
        // console.log('paramID', paramID);
        if (thisProduct.data.params.hasOwnProperty(paramID)) {

          /* save the element in thisProduct.data.params with key paramId as const param */
          const param = thisProduct.data.params[paramID];
          // console.log('param', param);

          /* START LOOP: for each optionId in param.options */
          for (const optionId in param.options) {
            // console.log('optionId', optionId);
            if (param.options.hasOwnProperty(optionId)) {

              /* save the element in param.options with key optionId as const option */
              const option = param.options[optionId];
              // console.log(option.label);

              // check if formData[paramId] exist and then if it contain 
              const optionSelected = formData.hasOwnProperty(paramID) && formData[paramID].indexOf(optionId) > -1;

              // console.log('optionSelected', optionSelected);

              /* START IF: if option is selected and option is not default */
              if (optionSelected && !option.default) {

                /* add price of option to variable price */
                price = price + option.price;

                /* END IF: if option is selected and option is not default */
              } else if (!optionSelected && option.default) {

                /* START ELSE IF: if option is not selected and option is default */
                price = price - option.price;

                /* deduct price of option from price */
              }
              const allIMG = thisProduct.imageWrapper.querySelectorAll(`.${paramID}-${optionId}`);

              if (optionSelected) {
                if (!thisProduct.params[paramID]) {
                  thisProduct.params[paramID] = {
                    label: param.label,
                    options: {},
                  };
                }
                thisProduct.params[paramID].options[optionId] = option.label;
                for (const allI of allIMG) {
                  allI.classList.add(classNames.menuProduct.imageVisible);
                }

              } else {
                for (const allI of allIMG) {
                  allI.classList.remove(classNames.menuProduct.imageVisible);
                }

              }
              //two last lines removed from here because double loop caused wrong price value
            }
          }
        }
      }
      // multiply price by amount
      // price *= thisProduct.amountWidget.value;
      // thisProduct.priceElem.textContent = price;
      /* multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AnountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;


      app.cart.add(thisProduct);

      // reseting prouct to default after adding to cart
      for (const input of thisProduct.formInputs) {

        input.checked = false;

        if (input.defaultChecked) {
          input.checked = true;
        }

        if (input.options) {
          input.options.selectedIndex = 0;
        }
      }

      thisProduct.select = thisProduct.element.querySelector('li select option');
      const numberOfMeals = thisProduct.amountWidgetElem.querySelector(select.widgets.amount.input);
      numberOfMeals.value = 1;
     
      //   this way the pictures in pizza refresh as well without one line of code
      thisProduct.processOrder();
      thisProduct.priceElem.textContent = thisProduct.data.price;
      thisProduct.price = thisProduct.data.price;
      thisProduct.initAmountWidget();


    }
  }

  class AnountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);
      // Add validation
      if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
      // console.log('new////Value', thisWidget.value);
      // thisWidget.element.querySelector(select.widgets.amount.input).textContent = '';
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (e) {
        e.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (e) {
        e.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
      // listuner for keydown handle
      thisWidget.input.addEventListener('keydown', function (e) {
        e.preventDefault();

        // control of widget by keyes
        if (e.keyCode == 37) {
          thisWidget.setValue(thisWidget.value - 1);
        } else if (e.keyCode == 39) {
          thisWidget.setValue(thisWidget.value + 1);
        }
      });
    }

    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

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
        // let result = prod.getData();
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
    //clearing cart after submiting order
    clearBasket(cartProduct) {
      const thisCart = this;
      thisCart.products = [];
      cartProduct.dom.wrapper.remove();
      thisCart.update();
      thisCart.dom.inputPhone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.inputPhone.value = null;
      thisCart.dom.inputAddress = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.inputAddress.value = null;
    }

  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AnountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {

        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function (e) {
        e.preventDefault();
        thisCartProduct.remove();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (e) {
        e.preventDefault();
        thisCartProduct.remove();
      });
    }

    getData() {
      const thisCartProduct = this;

      const dataFromCartProduct = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.params,
      };
      // function return object
      return dataFromCartProduct;
    }
  }

  const app = {

    initMenu: function () {
      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);

      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;
      fetch(url)
        .then(function (rawResponse) {
          return rawResponse.json();
        })
        .then(function (parsedResponse) {
          thisApp.data.products = parsedResponse;
          thisApp.initMenu();
        });

    },

    init: function () {
      const thisApp = this;

      thisApp.initData();
      thisApp.initCart();
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    }
  };

  app.init();
}
