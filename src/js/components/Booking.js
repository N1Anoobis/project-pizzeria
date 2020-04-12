import {
  select,
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



    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.dataPicker = bookingWrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = bookingWrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.orderConfirmation = bookingWrapper.querySelector('.order-confirmation');
    // console.log(document.querySelector('.booking-form'))
  }

  dinamicPeopleOrder() {
    const thisBooking = this;
    ///listiner to take current value of people wiget
    let input = thisBooking.dom.peopleAmount.querySelector('input');
    // console.log(input.value);
    thisBooking.dom.peopleAmount.addEventListener('click', function () {
    
      const remove = document.querySelector('.booking-form').querySelectorAll('.order-confirmation');
      // console.log(remove);
      for (const elem of remove) {
        elem.parentNode.removeChild(elem);
      }
      // document.querySelector('.booking-form').removeChild(thisBooking.dom.orderConfirmation);


      for (let index = 0; index < input.value; index++) {
        //clone the dammn thing
        const cloned = thisBooking.dom.orderConfirmation.cloneNode(true);

        document.querySelector('.booking-form').appendChild(cloned);
      }
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
