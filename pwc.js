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
    "esri/layers/FeatureLayer",
    'esri/widgets/BasemapGallery',
    'esri/core/watchUtils',
    "dojo/on",
    'dojo/domReady!',
  ], function (WebMap, MapView, Home, Legend, BasemapToggle, Search, Locate, LayerList, FeatureLayer, BasemapGallery, watchUtils, on) {

    let obj;

    ///// Web Map
    var map = new WebMap({
      portalItem: {
        id: '4c95d0ae349849ddbd50cde3e10971a8',
      },
      basemap: 'streets-navigation-vector'
    });

    ///// View
    var view = new MapView({
      container: 'viewDiv',
      map: map
    });

    ///// Load map
    map.load()

    //// Load current data from Admin Console. Post error if problem arises.
    .then(function(currentStatus){
      let url = 'https://saintpaulltsdev.prod.acquia-sites.com/pwcs?_format=json';
      fetch('https://saintpaulltsdev.prod.acquia-sites.com/pwcs?_format=json', {
          method: 'get',
          mode: 'no-cors'
      })
      Promise.resolve().then(function(currentStatus) {
        // console.log(response)
        obj = [{
    "nid": [
      {
        "value": 131481
      }
    ],
    "uuid": [
      {
        "value": "b5d37d65-2e66-486c-b634-2f668b6d72bb"
      }
    ],
    "vid": [
      {
        "value": 622741
      }
    ],
    "langcode": [
      {
        "value": "en"
      }
    ],
    "type": [
      {
        "target_id": "public_works_communications",
        "target_type": "node_type",
        "target_uuid": "8ee37bef-aab6-4c0a-98ef-a45c3e39099a"
      }
    ],
    "revision_timestamp": [
      {
        "value": "2020-09-25T21:43:21+00:00",
        "format": "Y-m-d\\TH:i:sP"
      }
    ],
    "revision_uid": [
      {
        "target_id": 27201,
        "target_type": "user",
        "target_uuid": "f96bfbab-5344-4434-a66d-a12bc38ac38b",
        "url": "/user/27201"
      }
    ],
    "revision_log": [],
    "status": [
      {
        "value": true
      }
    ],
    "uid": [
      {
        "target_id": 27201,
        "target_type": "user",
        "target_uuid": "f96bfbab-5344-4434-a66d-a12bc38ac38b",
        "url": "/user/27201"
      }
    ],
    "title": [
      {
        "value": "Winter Emergency"
      }
    ],
    "created": [
      {
        "value": "2020-09-25T21:42:19+00:00",
        "format": "Y-m-d\\TH:i:sP"
      }
    ],
    "changed": [
      {
        "value": "2020-09-25T21:43:21+00:00",
        "format": "Y-m-d\\TH:i:sP"
      }
    ],
    "promote": [
      {
        "value": true
      }
    ],
    "sticky": [
      {
        "value": false
      }
    ],
    "default_langcode": [
      {
        "value": true
      }
    ],
    "revision_translation_affected": [
      {
        "value": true
      }
    ],
    "metatag": {
      "value": {
        "title": "Winter Emergency | Saint Paul, Minnesota",
        "canonical_url": "https://saintpaulltsdev.prod.acquia-sites.com/node/131481"
      }
    },
    "path": [
      {
        "alias": null,
        "pid": null,
        "langcode": "en"
      }
    ],
    "field_clean_up_phase": [
      {
        "value": "2020-10-14T15:16:20-05:00",
        "end_value": "2020-10-25T15:42:20-05:00"
      }
    ],
    "field_day_plow_phase": [
      {
        "value": "2020-09-25T16:42:20-05:00",
        "end_value": "2020-09-25T17:42:20-05:00"
      }
    ],
    "field_night_plow_phase": [
      {
        "value": "2020-09-25T19:42:20-05:00",
        "end_value": "2020-09-25T20:42:20-05:00"
      }
    ]
  }]
        return(obj)
      }).catch(function(err) {
          console.log('There has been an error. Cannot load current data.')
      });
    })

    //// load basemaps
    .then(function(){
      //////// Basemap Gallery
      var basemapGallery = new BasemapGallery({
        container: 'map-div',
        view: view,
      });

      watchUtils.once(basemapGallery.source.basemaps, 'length', function (state) {
        setTimeout(function () {
          basemapGallery.source.basemaps.splice(6, 20);
          basemapGallery.source.basemaps.splice(0, 1);
          basemapGallery.source.basemaps.splice(1, 2);
        }, 1000);
      });
    })

    // Use data from Admin Console
    .then(function(currentStatus) {
      view.map = map;

      // Options for timestamp visualization
      const options = {
         timeZone:"Canada/Central",
         hour12 : true,
         hour:  "numeric",
         minute: "numeric"
      };

      let toNight, fromNight, toDay, fromDay, toClean, fromClean;

      let nightPlow = obj[0].field_night_plow_phase;
      let nightPlowFrom = new Date(nightPlow[0].value).getTime()
      let nightPlowTo = new Date(nightPlow[0].end_value).getTime()

      let dayPlow = obj[0].field_day_plow_phase;
      let dayPlowFrom = new Date(dayPlow[0].value).getTime()
      let dayPlowTo = new Date(dayPlow[0].end_value).getTime()

      let cleanUp = obj[0].field_clean_up_phase;
      let cleanUpFrom = new Date(cleanUp[0].value).getTime()
      let cleanUpTo = new Date(cleanUp[0].end_value).getTime()

      let emergency = obj[0].status[0].value;
      let currentTime = Date.now()

      // Update UI banner with timestamp
      function updateBanner() {
        toNight = new Date(nightPlowTo).toLocaleTimeString('en-US', options);
        fromNight = new Date(nightPlowFrom).toLocaleTimeString('en-US', options);

        toDay = new Date(dayPlowTo).toLocaleTimeString('en-US', options);
        fromDay = new Date(dayPlowFrom).toLocaleTimeString('en-US', options);

        toClean = new Date(cleanUpTo).toLocaleTimeString('en-US', options);
        fromClean = new Date(cleanUpFrom).toLocaleTimeString('en-US', options);


        if((currentTime > nightPlowFrom) && (currentTime < nightPlowTo)){
          console.log('within nightplow')
          $('#phase').text("Night Plow Active " + toNight + " to " + fromNight);
          $('#nightPlow-button').addClass('active');
          // $('.carousel-item #cleanUp-text').first().addClass('active');

        } else if ((currentTime > dayPlowFrom) && (currentTime < dayPlowTo)) {
          console.log('within dayplow')
          $('#phase').text("Day Plow Active " + toDay + " to " + fromDay);
          $('#dayPlow-button').addClass('active');
          // $('.carousel-item #cleanUp-text').first().addClass('active');

        } else if ((currentTime > cleanUpFrom) && (currentTime < cleanUpTo)) {
          console.log('within cleanup');
          $('#phase').text("Clean Up Active " + toClean + " to " + fromClean);
          $('#cleanUp-button').addClass('active');
          // $('.carousel-item #cleanUp-text').first().addClass('active');

        } else {
          console.log('Outside of times. Put green');
          $('ul li .active').css('color', 'green');
          $('.status-header').css('background-color', 'green');
          $('#emergency').text("NO SNOW EMERGENCY");
          $('#normal-button').addClass('active');
          // $('.carousel-item #normal-text').first().addClass('active');
        }
      }

      function updateCarousel() {
        $('#nightPlow-text').text("Active " + toNight + " to " + fromNight);
        $('#dayPlow-text').text("Active " + toDay + " to " + fromDay);
        $('#cleanUp-text').text("Active " + toClean + " to " + fromClean);
      }


      //// Check if emergency
        switch (emergency) {
          case emergency === true:
            $('ul li .active').css('color', 'red');
            $('.status-header').css('background-color', 'red');
            $('#emergency').text("SNOW EMERGENCY DECLARED");
            updateBanner()
            updateCarousel()
          break;

          default:
            $('ul li .active').css('color', 'green');
            $('.status-header').css('background-color', 'green');
            $('#emergency').text("NO SNOW EMERGENCY");
            $('#phase').text("Normal Parking Active");
            $('#normal-button').addClass('active');
            // $('#normal-text').addClass('active');
        }


      //// Button event
      $('.sublayers .sublayers-item').click(function (e) {
        var id = (e.target.getAttribute('data-id'))
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
          size: '18px',
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

        //////// Layer List (phases)
        var layerList = new LayerList({
          container: 'help-div',
          view: view,
        });
        console.log(layerList.operationalItems);

        //////// Legend
        var legendWidget = new Legend({
          container: 'status-div',
          view: view,
          // layerInfos: [{
          //   layer: FeatureLayer
          // }]
        });

        console.log(legendWidget);

      })
      .catch(function(error) {
        console.error("The resource failed to load: ", error);
      })
  });


//////////////////////////////////////////////////////////////////
  ///// Card button + pop-up control
  // Remove css classes from select buttons on load
  $('.phases-button, .map-button, .help-button').removeClass('none');

  $('.tab-menu li a').click(function () {
    var button = this.classList[0];
    switch (button) {
      case 'status-button':
        $('.map-button, .help-button').removeClass('none');
        $('#map-collapse, #help-collapse').collapse('hide');
        $('#collapse-header').collapse('toggle');
        break;

      case 'map-button':
        $(this).addClass('none');
        // $('.status-button').removeClass('active');
        $('.help-button').removeClass('none');
        $('#collapse-header, #help-collapse').collapse(
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
        // $('.status-button').removeClass('active');
        $('.map-button').removeClass('none');
        $('#collapse-header, #map-collapse').collapse('hide');
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

  // Resets the buttons to grey by clicking card header title.
  $('.card-header').click(function () {
    $('.map-button, .help-button').removeClass('none');
  });
});

// document.addEventListener(
//   'click',
//   function (event) {
//     // Log the clicked element in the console
//     console.log(event.target);
//
//     // If the clicked element doesn't have the right selector, bail
//     if (!event.target.matches('.click-me')) return;
//   },
//   false
// );
