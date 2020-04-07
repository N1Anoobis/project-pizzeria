import {settings, select} from '../settings.js';

class AmountWidget {
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

export default AmountWidget;