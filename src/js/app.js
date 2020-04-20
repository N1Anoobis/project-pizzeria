// /* global Handlebars */ // eslint-disable-line no unused-vars
import {
  settings,
  select,
  templates,
  classNames
} from './settings.js';
import utils from './utils.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    // console.log(thisApp.navLinks)
    thisApp.navLinks[0].style.display = 'none';

    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[0].id;
    for (const page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);
    // console.log(pageMatchingHash);
    for (const link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        // get page id from href atribute
        const id = clickedElement.getAttribute('href').replace('#', '');
        // run thisApp.activePages with that id
        thisApp.activatePage(id);
        //change URL hash
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    // let pageId = pageId
    const thisApp = this;
    // add class 'active' to matching pages, remove from non-match
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    // add class 'active' to matching links, remove from non-match
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId);
    }

    // removing elements from home page
    const cart = document.querySelector(select.containerOf.cart);
    const nav = document.querySelectorAll(select.nav.links);
    const header = document.querySelector('.header');
    if (pageId == 'home') {
      for (const na of nav) {
        na.style.display = 'none';
      }
      cart.style.display = 'none';
      header.style.height = '200px';

      //code for  home page
      const menuLinks = document.querySelectorAll('.home a');
      for (let link of menuLinks) {
        link.addEventListener('click', function (event) {
          const clickedElement = this;
          event.preventDefault();
          // get page id from href atribute
          const id = clickedElement.getAttribute('href').replace('#', '');
          // run thisApp.activePages with that id
          thisApp.activatePage(id);
          //change URL hash
          window.location.hash = '#/' + id;
        });
        // carusel lunch
        thisApp.caruselInit();
      }


    } else {
      cart.style.display = 'block';
      header.style.height = '';
      // console.log(thisApp.intervalValue);

      // remove home page from visable menu
      for (const na of nav) {
        // thisApp.navLinks[0].style.display = 'none';
        na.style.display = 'block';

      }
    }
  },

  caruselInit() {
    const thisApp = this;
    let activeElement = 2;
    const caruselDots = document.querySelectorAll('.carusel-dots i');
    const caruselContainer = document.querySelector('.carusel-place');
    //data for hanlebars
    const caruselImages = ['assets/pizza-3.jpg', 'assets/pizza-4.jpg',
      'assets/pizza-5.jpg'
    ];
    const caruselH2 = ['AMAZING SERVICE !', 'RECOMENNDED !', ' SIMPLY BEST !', 'ALLWAYS GREAT !'];
    const caruselAuthor = ['-Mike Allford', '-Jack Black', '-Edmund West', 'Joe Nelson'];

    //to display first carusel
    const generatedHTML = {
      src: caruselImages[activeElement - 1],
      h2Line: caruselH2[activeElement - 1],
      author: caruselAuthor[activeElement - 1],
    };
    // pass stuff for handlebars first display
    componentUsedInHandlebars(generatedHTML);
    caruselDots[1].classList.add('active');
    caruselDots[0].classList.remove('active');

    // main loop
    function changeElement() {

      if (activeElement == caruselImages.length) {
        activeElement = 0;
      }
      //simple active dot adder
      for (const dot of caruselDots) {
        dot.classList.remove('active');
      }

      //data for handlebars
      let caruselData = {
        src: caruselImages[activeElement],
        h2Line: caruselH2[activeElement],
        author: caruselAuthor[activeElement],
      };
     
      caruselDots[activeElement].classList.add('active');
      componentUsedInHandlebars(caruselData);

      activeElement++;
    }

    clearInterval(thisApp.intervalValue);
    thisApp.intervalValue = setInterval(changeElement, 3000);

    function componentUsedInHandlebars(generatedHTML) {

      const generated = templates.carusel(generatedHTML);

      const element = utils.createDOMFromHTML(generated);
      // clearing unnecessary elements
      const caruselWrap = document.querySelectorAll('.carusel-place .carusel');
      for (const carWr of caruselWrap) {
        carWr.remove();
      }
      caruselContainer.appendChild(element);
    }
  },

  initBooking: function (tables) {
    const thisApp = this;

    const bookingContener = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingContener, tables);
  },

  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    let tables = {};
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();

      })
      .then(function (parsedResponse) {
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
    // /for tables 
    thisApp.tables = {};
    const urlTables = settings.db.url + '/' + settings.db.tables;
    fetch(urlTables)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        thisApp.data.tables = parsedResponse;

        tables = {
          tables: thisApp.data.tables,
        };

        thisApp.initBooking(tables);
      });
  },

  init: function () {
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    // thisApp.initBooking();
  },
};

app.init();
