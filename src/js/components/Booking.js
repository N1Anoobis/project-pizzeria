import {
  select,
  settings,
  templates
} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element, tables) {
    const thisBooking = this;
    thisBooking.render(element, tables);
    thisBooking.initWidgets();
    thisBooking.dinamicPeopleOrder();
  }

  render(element, tables) {
    const thisBooking = this;

    //generate HTML based on templated
    const generatedHTML = templates.bookingWidget(tables);
    //create elements using utils.createDOMFromHTML
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    //find menu container
    const bookingWrapper = document.querySelector(select.containerOf.booking);
    //add element to menu
    bookingWrapper.appendChild(thisBooking.element);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingWrapper;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    // console.log(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleDecrese = thisBooking.dom.peopleAmount.querySelector('[href="#less"]');
    thisBooking.dom.peopleIncrese = thisBooking.dom.peopleAmount.querySelector('[href="#more"]');

    // console.log(thisBooking.dom.peopleDecrese);

    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.dataPicker = bookingWrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = bookingWrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.bookingForm = bookingWrapper.querySelector('.booking-form');
    thisBooking.dom.orderConfirmation = bookingWrapper.querySelector('.order-confirmation');
    thisBooking.dom.inputName = bookingWrapper.querySelector('.input-name');


  }

  dinamicPeopleOrder() {
    const thisBooking = this;
    /// current value of people wiget
    let input = thisBooking.dom.peopleAmount.querySelector('input');
    console.log(input.value);
    //number of inputs currently displayed
    const numberOfInputs = document.querySelector('.input-name');

    //removing guest input
    thisBooking.dom.peopleDecrese.addEventListener('click', function () {
      if (numberOfInputs.childElementCount > 1) {
        numberOfInputs.lastElementChild.remove();
      } else {
        return;
      }
    });

    //adding guest input
    thisBooking.dom.peopleIncrese.addEventListener('click', function () {
      if (numberOfInputs.childElementCount < 9) {
        let inputName = document.createElement('input');
        inputName.setAttribute('type', 'text');
        inputName.setAttribute('name', 'guest');
        inputName.setAttribute('value', '');
        thisBooking.dom.inputName.appendChild(inputName);
      } else {
        return;
      }
    });

    //listiner for submit
    thisBooking.dom.bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      thisBooking.dom.guestsNames = document.querySelector('.input-name').querySelectorAll('input');
      // collect all of inputs
      let [...checkAllInputs] = document.querySelector('.input-name').querySelectorAll('input');
      console.log(checkAllInputs);

      // simple 2 step validation
      // check if every single input is ok
      for (const checkInput of checkAllInputs) {
        let guestName = checkInput.value;
        if (guestName.length > 5) {
          checkInput.classList.remove('error');
        } else {
          checkInput.classList.add('error');
        }
      }
      // if all inputs are ok then allow to run
      for (const checkInput of checkAllInputs) {
        if (checkInput.classList.contains('error')) {
          return;
        }
      }
      //fetch stuff
      const url = settings.db.url + '/' + settings.db.order;

      const payload = {
        guests: [],
      };
      for (const guest of thisBooking.dom.guestsNames) {
        payload.guests.push(guest.value);
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
          console.log('response', response);
        }).then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
        });

      //clearing input list and widget after submiting order
      const remove = document.querySelector('.input-name').querySelectorAll('input');
      for (const elem of remove) {
        elem.parentNode.removeChild(elem);
      }
      let inputName = document.createElement('input');
      inputName.setAttribute('type', 'text');
      inputName.setAttribute('name', 'guest');
      inputName.setAttribute('value', '');
      thisBooking.dom.inputName.appendChild(inputName);
      input.value = 1;
      thisBooking.initWidgets();
    });
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.dataPicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}

export default Booking;
