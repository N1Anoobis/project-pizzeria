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
    // clicked.dataset.table = false;
    thisBooking.render(element, tables);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.addListener();
    thisBooking.sendBookingRequest();
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
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };
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
        thisBooking.parseData(bookings, eventCurrent, eventsRepeat);
      });
  }
  // 
  parseData(bookings, eventCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    for (const item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (const item of eventCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (const item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopData = minDate; loopData <= maxDate; loopData = utils.addDays(loopData, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopData), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
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
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
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

    thisBooking.dom.orderConfirmation = document.querySelector('.order-confirmation');
    thisBooking.dom.floorPlan = document.querySelector('.floor-plan');
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.dataPicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function (e) {
      thisBooking.updateDOM();
      // pass event to check it
      thisBooking.tableSelection(e);

      // thisBooking.activTable = false;
    });
  }

  trigger(e) {
    // const thisBooking = this;
    const clicked = e.target;
    console.log('trigger dziala');
    // clear all marked tables so we can have only one chosen at the time
    // because of bind this.dom.tables works
    for (const table of this.dom.tables) {
      table.classList.remove('chosen');
      this.activTable = false;
    }

    if (clicked.classList.contains(classNames.booking.tableBooked)) {
      return;

    } else {
      clicked.classList.add('chosen');
      this.activTable = clicked.dataset.table;
    }

    // taking some data needed for payload before succesfull validation
    this.dom.activeTable = parseInt(clicked.dataset['table'], 10);
  }

  tableSelection(passedE) {
    const thisBooking = this;
    // check if event come from people widget input
    if (passedE.srcElement.classList.value == `widget-amount people-amount`) {
      return;
    } else {
      //if not reset all tables
      for (const table of thisBooking.dom.tables) {
        table.classList.remove('chosen');

      }
    }
  }

  addListener() {
    const thisBooking = this;

    for (const table of thisBooking.dom.tables) {
      console.log(table.classList.contains('booked'));
      console.log(table.classList);

      table.addEventListener('click', thisBooking.trigger.bind(thisBooking));
    }
  }

  sendBookingRequest() {
    const thisBooking = this;
    /// current value of people and hour wiget taken using getters 

    //listiner for submit
    thisBooking.dom.wrapper.addEventListener('submit', function (e) {
      e.preventDefault();

      thisBooking.dom.guestsAddress = thisBooking.dom.orderConfirmation.querySelector('[name="address"]');

      thisBooking.dom.guestsNumber = thisBooking.dom.orderConfirmation.querySelector('[name="phone"]');

      // collect all of inputs
      let checkAllInputs = thisBooking.dom.orderConfirmation.querySelectorAll('input');

      // simple 2 step validation

      for (const checkInput of checkAllInputs) {
        if (checkInput.value.length < 8) {
          checkInput.classList.add('error');
        } else if (checkInput.value.length < 8)
          checkInput.classList.add('error');
      }

      //check if table marked
      console.log(thisBooking.activTable);
      if (!thisBooking.activTable) {
        thisBooking.dom.floorPlan.style.borderColor = 'red';
        return;
      } else {
        thisBooking.dom.floorPlan.style.borderColor = 'black';
      }

      thisBooking.dom.guestsAddress.addEventListener('input', function (e) {
        e.preventDefault();

        let address = thisBooking.dom.guestsAddress.value;
        thisBooking.dom.guestsAddress.classList.remove('error');
        if (address.length < 8) {

          thisBooking.dom.guestsAddress.classList.add('error');
          return;
        }
      });

      thisBooking.dom.guestsNumber.addEventListener('input', function (e) {
        e.preventDefault();

        let phone = thisBooking.dom.guestsNumber.value;
        thisBooking.dom.guestsNumber.classList.remove('error');
        if (phone.length < 8) {

          thisBooking.dom.guestsNumber.classList.add('error');
          return;
        }
      });

      // if all inputs are ok then allow to run
      for (const checkInput of checkAllInputs) {
        if (checkInput.classList.contains('error')) {
          return;
        }
      }

      //fetch stuff
      const url = settings.db.url + '/' + settings.db.booking;

      const payload = {
        address: thisBooking.dom.guestsAddress.value,
        number: thisBooking.dom.guestsNumber.value,
        table: thisBooking.dom.activeTable,
        hour: utils.numberToHour(thisBooking.hour),
        date: thisBooking.datePicker.value,
        ppl: thisBooking.peopleAmount.value,
        repeat: false,
        duration: thisBooking.hoursAmount.value,
      };

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
        });

      // duration and table has to be passed as numbers
      thisBooking.makeBooked(thisBooking.datePicker.value, utils.numberToHour(thisBooking.hour), thisBooking.hoursAmount.value, thisBooking.dom.activeTable);

      // reset after sending to API
      for (const input of checkAllInputs) {
        input.value = null;
      }
      thisBooking.peopleAmount.value = 1;
      thisBooking.hoursAmount.value = 1;
      thisBooking.activeTable = false;
      thisBooking.dom.floorPlan.style.borderColor = 'black';
      thisBooking.initWidgets();
    });
  }
}

export default Booking;
