import {
  select,
  templates
} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render() {
    const thisBooking = this;

    //generate HTML based on templated
    const generatedHTML = templates.bookingWidget();
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
    console.log(thisBooking.dom);
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
