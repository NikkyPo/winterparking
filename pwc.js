$(document).ready(function () {
  // Load Modules
  require([
    'esri/WebMap',
    'esri/views/MapView',
    'esri/widgets/Home',
    'esri/widgets/Legend',
    'esri/widgets/BasemapToggle',
    'esri/widgets/Search',
    'esri/widgets/Locate',
    'esri/widgets/LayerList',
    'esri/widgets/BasemapGallery',
  ], function (WebMap, MapView, Home, Legend, BasemapToggle, Search, Locate, LayerList, BasemapGallery) {
    ///// Web Map
    var map = new WebMap({
      portalItem: {
        id: '4c95d0ae349849ddbd50cde3e10971a8',
      },
    });
    ///// View
    var view = new MapView({
      container: 'viewDiv',
      map: map,
      center: [-93.109, 44.91396],
      zoom: 11,
      uiComponents: [],
    });

    ////////////////////////////////////////
    /// Widgets added to UI containter ////
    ///////////////////////////////////////

    ///// Home button
    var home = new Home({
      view: view,
    });
    view.ui.add(home, 'top-left', 0);

    ////// Custom marker
    var marker = {
      type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
      color: 'red',
      size: '20px',
      outline: {
      // autocasts as new SimpleLineSymbol()
      color: [128, 0, 0, 0.5],
      width: '1.5px',
      },
    };

    ///// Search widget
    var searchWidget = new Search({
      view: view,
      popupEnabled: false,
    });
    view.ui.add(searchWidget, 'top-right');

    // Change search marker symbol
    searchWidget.watch('activeSource', function (evt) {
      console.log(evt, 'here');
      evt.resultSymbol = marker;
    });

    // Returns search result
    searchWidget.on('select-result', function (evt) {
      console.log('search event info: ', JSON.stringify(evt.result.feature));
      var point = {
        type: 'point',
        latitude: evt.result.feature.geometry.latitude,
        longitude: evt.result.feature.geometry.longitude,
      };
      console.log('lat/long result ', point);
    });

    ///// Locate Button
    var locate = new Locate({
      view: view,
      useHeadingEnabled: false,
      goToOverride: function (view, options) {
        options.target.scale = 1500; // Override the default map scale
        return view.goTo(options.target);
      },
    });
    view.ui.add(locate, 'top-left');

    //////// Legend
    var legendWidget = new Legend({
      container: 'status-div',
      view: view,
    });

    //////// Layer List (phases)
    var layerList = new LayerList({
      container: 'phases-div',
      view: view,
    });

    //////// Basemap Gallery
    var basemapGallery = new BasemapGallery({
      container: 'map-div',
      view: view,
    });
  });

  ///// Card button + pop-up control
  // Remove css classes from select buttons
  $('.phases-button, .map-button, .help-button').removeClass('none');

  $('.tab-menu li a').click(function () {
    var button = this.classList[0];
    switch (button) {
      case 'status-button':
        $('.phases-button, .map-button, .help-button').removeClass('none');
        $('#phases-collapse, #map-collapse, #help-collapse').collapse('hide');

        if (
          $(this).attr('aria-expanded') === 'true' ||
          $(this).hasClass('none')
        ) {
          console.log('close');
          $('.status-button').removeClass('none');
        } else if ($(this).attr('aria-expanded') === 'false') {
          console.log('open');
          $('.status-button').addClass('none');
        } else {
          console.log('not working');
        }
        break;

      case 'phases-button':
        $(this).addClass('none');
        $('.status-button, .map-button, .help-button').removeClass('none');
        $('#status-collapse, #map-collapse, #help-collapse').collapse('hide');

        if ($(this).attr('aria-expanded') === 'true') {
          console.log('close');
          $('.phases-button').removeClass('none');
        } else if ($(this).attr('aria-expanded') === 'false') {
          console.log('open');
          $('.phases-button').addClass('none');
        } else {
          console.log('not working');
        }
        break;

      case 'map-button':
        $(this).addClass('none');
        $('.status-button, .phases-button, .help-button').removeClass('none');
        $('#status-collapse, #phases-collapse, #help-collapse').collapse(
          'hide'
        );

        if ($(this).attr('aria-expanded') === 'true') {
          console.log('close');
          $('.map-button').removeClass('none');
        } else if ($(this).attr('aria-expanded') === 'false') {
          console.log('open');
          $('.map-button').addClass('none');
        } else {
          console.log('not working');
        }
        break;

      case 'help-button':
        $(this).addClass('none');
        $('.status-button, .phases-button, .map-button').removeClass('none');
        $('#status-collapse, #phases-collapse, #map-collapse').collapse('hide');

        if ($(this).attr('aria-expanded') === 'true') {
          console.log('close');
          $('.help-button').removeClass('none');
        } else if ($(this).attr('aria-expanded') === 'false') {
          console.log('open');
          $('.help-button').addClass('none');
        } else {
          console.log('not working');
        }
        break;
    }
  });

  // Resets the buttons to grey by clicking card header title and X.
  $('.change-color').click(function () {
    $('.status-button, .phases-button, .map-button, .help-button').removeClass('none');
  });

  // document.querySelectorAll('.change-color').forEach(function(item) {
  //   item.addEventListener('click', function() {
  //     statusButton.children[0].className = "#666";
  //     statusButton.children[1].className = "#666";
  //   });
  // });
});

document.addEventListener(
  'click',
  function (event) {
    // Log the clicked element in the console
    console.log(event.target);

    // If the clicked element doesn't have the right selector, bail
    if (!event.target.matches('.click-me')) return;
  },
  false
);
