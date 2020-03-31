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
      // console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      // console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      // console.log(thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

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
    //       const allInactiveElements = document.querySelectorAll(select.all.menuProducts);
    //       for (const allInEl of allInactiveElements) {

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
          thisProduct.element.classList.toggle('active');
          /* find all active products */
          const allActiveProd = document.querySelectorAll(select.all.menuProductsActive);
          /* START LOOP: for each active product */
          for (const allAct of allActiveProd) {
            /* START: if the active product isn't the element of thisProduct */
            if (allAct != clicked.parentNode) {
              /* remove class active for the active product */
              allAct.classList.remove('active');
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
      });
    }

    processOrder() {
      const thisProduct = this;
      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);

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
                for (const allI of allIMG) {
                  allI.classList.add('active');
                }

              } else {
                for (const allI of allIMG) {
                  allI.classList.remove('active');
                }

              }
              //two last lines removed from here because double loop caused wrong price value
            }
          }
        }
      }
      // multiply price by amount
      price *= thisProduct.amountWidget.value;

      thisProduct.priceElem.textContent = price;
      // console.log('price', price);
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AnountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

  }

  class AnountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      // console.log('AmountWidget', thisWidget);
      // console.log('constructor arguments', element);
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
      thisWidget.linkIncrease.addEventListener('keydown', function (e) {
        e.preventDefault();

        // console.log('keyCode', e.keyCode);
        if (e.keyCode == 37) {
          thisWidget.setValue(thisWidget.value - 1);
        } else if (e.keyCode == 39) {
          thisWidget.setValue(thisWidget.value + 1);
        }
      });

    }

    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

  }

  class Cart {
    constructor(element){
      const thisCart =  this;
      thisCart.products = [];
      console.log('element', element);
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle('active');
      });
    }

  }

  const app = {

    initMenu: function () {
      const thisApp = this;
      // console.log('thisApp.data:', thisApp.data);


      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }

      // const testProduct = new Product();
      // console.log('testProduct:', testProduct);
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    }
  };

  app.init();
}
