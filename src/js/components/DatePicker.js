/* global flatpickr */ // eslint-disable-line no unused-vars
import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import {
  select,
  settings,
} from '../settings.js';

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;
    // actual date
    thisWidget.minDate = new Date(thisWidget.value);

    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

    flatpickr(thisWidget.dom.input, {
      // dateFormat: 'd.m.Y',
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      'disable': [
        function (date) {
          // return true to disable
          return (date.getDay() === 1);
        }
      ],
      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      },
      onChange: function (selectedDates, dateStr) {

        thisWidget.value = dateStr;
      },
    });
  }

  parseValue(value) {
    
    return value;
    
  }

  isValid() {
    return true;
  }
}

export default DatePicker;
