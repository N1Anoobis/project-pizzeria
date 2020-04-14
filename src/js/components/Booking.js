import {
  select,
  templates,
  settings,
  classNames
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
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const dateEndParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        dateEndParam,
      ],
      eventCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        dateEndParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        dateEndParam,
      ],
    };
    // console.log('getdata params', params);
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };
    // console.group('getData urls', urls);
    Promise.all([fetch(urls.booking), fetch(urls.eventCurrent), fetch(urls.eventsRepeat), ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventCurrent, eventsRepeat);
      });
  }
  // 
  parseData(bookings, eventCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    for (const item of bookings) {
      // console.log(item)
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (const item of eventCurrent) {
      // console.log(item)
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    // console.log(maxDate);

    for (const item of eventsRepeat) {
      // console.log(item)
      if (item.repeat == 'daily') {
        for (let loopData = minDate; loopData <= maxDate; loopData = utils.addDays(loopData, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopData), item.hour, item.duration, item.table);
        }
      }
    }
    console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);



    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log(hourBlock)
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      // creating booked object
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    console.log(thisBooking.datePicker.value);
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    console.log(thisBooking.hourPicker.value);
    let allAvailble = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailble = true;
    }

    for (const table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        // if not any table is booked(includes) then add class
        !allAvailble &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

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

    thisBooking.dom.tables = bookingWrapper.querySelectorAll(select.booking.tables);
    // console.log(thisBooking.dom.tables);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.dataPicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
  }
}

export default Booking;
