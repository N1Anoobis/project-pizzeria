import {
  select,
  classNames,
  templates
} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
    thisProduct.customEventListiner();
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

    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);

    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);

    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);

    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);

    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  customEventListiner() {
    const thisProduct = this;
    document.addEventListener('edit', (event) => {
      if (event.detail.cartProduct.id == thisProduct.id) {
        thisProduct.edit(event.detail.cartProduct);
      }
    });
  }

  edit(recived) {
    const thisProduct = this;

    const checkedInputs = [];
    for (const param in recived.params) {
      if (recived.params.hasOwnProperty(param)) {
        const element = recived.params[param];

        for (const key in element.options) {
          if (element.options.hasOwnProperty(key)) {

            for (const input of thisProduct.formInputs) {
              input.checked = false;

              if (input.value.toLowerCase() == key.toLowerCase()) {

                input.checked = true;
                // push correct inputs in to array
                checkedInputs.push(input);

              }
              // restore the value of select
              if (input.options) {
                input.value = key;
              }
            }
          }
        }
      }
    }
    //secend set of loops to handle proper display of results
    for (const input of thisProduct.formInputs) {

      for (const item of checkedInputs) {

        if (input.value.toLowerCase() == item.value.toLowerCase()) {

          input.checked = true;
        }
      }
    }

    // //   this way the pictures in pizza refresh
    thisProduct.processOrder();
    thisProduct.priceElem.textContent = recived.price;
    thisProduct.amountWidgetElem.querySelector('input').value = recived.amount;
  }

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
      if (thisProduct.data.params.hasOwnProperty(paramID)) {

        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramID];

        /* START LOOP: for each optionId in param.options */
        for (const optionId in param.options) {

          if (param.options.hasOwnProperty(optionId)) {

            /* save the element in param.options with key optionId as const option */
            const option = param.options[optionId];

            // check if formData[paramId] exist and then if it contain 
            const optionSelected = formData.hasOwnProperty(paramID) && formData[paramID].indexOf(optionId) > -1;

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
              // console.log(thisProduct.params.options);
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
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //new custom event 
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });

    thisProduct.element.dispatchEvent(event);

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

export default Product;
