$(document).ready(function () {

  // Load Modules
  require([
    'esri/WebMap',
    'esri/views/MapView',
    'esri/widgets/Home',
    'esri/widgets/Legend',
    'esri/widgets/Search',
    'esri/widgets/BasemapGallery',
    'esri/Basemap',
    'esri/widgets/Track',
    'esri/tasks/Locator',
    'esri/widgets/Zoom',
    'esri/core/watchUtils',
    'dojo/domReady!'

  ], function (WebMap, MapView, Home, Legend, Search, BasemapGallery, Basemap, Track, Locator, Zoom, watchUtils) {

    ///// Web Map /////
    var map = new WebMap({
      portalItem: {
        id: '4c95d0ae349849ddbd50cde3e10971a8'
      }
    });

    ///// View /////
    var view = new MapView({
      container: 'viewDiv',
      map: map,
      ui: {
        components: ['attribution']
      }
    });

    ///// Search widget /////

    // Custom St. Paul geo-locator
    var locatorUrl = 'https://utility.arcgis.com/usrsvcs/servers/167be6071af249d497556cae54c1ccd6/rest/services/World/GeocodeServer';
    // Custom marker for Search
    var marker = {
      type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
      color: 'red',
      size: '15px',
      outline: {
      // autocasts as new SimpleLineSymbol()
      color: [128, 0, 0],
      width: '1.5px',
      },
    };

    var searchWidget = new Search({
      view: view,
      popupEnabled: false,
      includeDefaultSources: false, // Removes default Esri Geocoder
      sources : [
        {
          locator: new Locator({ //Uses custom St. Paul geo-locator with custom marker
            url : locatorUrl
          }),
          id: 'StPaulGeocoder',
          placeholder: 'Search for an address or place',
          resultSymbol: marker
        }
      ]
      });
      view.ui.add(searchWidget, 'top-right');

    // Returns search result. The returned result can be used for reporting.
    searchWidget.on('select-result', function (evt) {
      console.log('search event info: ', JSON.stringify(evt.result));
    });

    // Collapse all panels on search clicked
    searchWidget.on('search-focus', function(evt){
      $('.map-button, .help-button').removeClass('none');
      $('#map-collapse, #help-collapse, #collapse-header').collapse('hide');
    });

    // Removes onfocusout from esri search widget to solve bug with jQuery.
    // https://community.esri.com/thread/216034-search-widgetin-onfocusout-in-47-causes-error-when-used-with-jquery
    view.when(() => {
    document.querySelector('.esri-search__input').onfocusout = null;
    });

    ///// Zoom widget /////
    var zoom = new Zoom({
      view: view
    });
    view.ui.add(zoom, 'top-left');

    ///// Home button /////
    var home = new Home({
      view: view,
    });
    view.ui.add(home, 'top-left', 0);

    ///// Track user location /////
    var track = new Track({
      view: view
    });
    view.ui.add(track, "top-left");

    ///// Load Basemap Gallery /////
    let basemapGallery = new BasemapGallery({
     source: [
         Basemap.fromId('hybrid'), // create a basemap from a well known id
         Basemap.fromId('streets-vector'),
         Basemap.fromId('streets-night-vector')
       ],
     container: 'map-div',
     view: view
   });

    ////////////////////
    ///// Begin app /////
    ////////////////////

    // Try loading Admin Console data first, then load results.
    async function getJSON() {
      let data = await (await fetch('https://saintpaulltsdev.prod.acquia-sites.com/pwcs?_format=json', {
          method: 'get',
      }).catch(handleErr)).json();
        if(data.code && data.code == 400){
          // alert(data.message);
          console.log(data);
        }
        return data;
    }
    // If there was a problem with request, user will see an alert message.
    function handleErr(err){
      let resp = new Response(
        JSON.stringify({
          code: 400,
          message: 'There was a problem and current status will not be shown. Please reload the webpage.'
        })
      );
      return resp;
    }
    getJSON().then(function(data) {
        map.load()
        .then(function() {
          // grab all the layers and load them

          const allLayers = map.allLayers;
          const promises = allLayers.map(function(layer) {
            // Turn off all layers
            // layer.visible = false;
            return layer.load();
          });
          // Return layer promise
          return Promise.all(promises.toArray());
        })
        .then(function(layers) {
          // Admin console data can be used here
          // let obj = data[0]
          console.log(data);

          let obj = [
                {
                  nid: [
                    {
                      value: 131481,
                    },
                  ],
                  uuid: [
                    {
                      value: 'b5d37d65-2e66-486c-b634-2f668b6d72bb',
                    },
                  ],
                  vid: [
                    {
                      value: 622741,
                    },
                  ],
                  langcode: [
                    {
                      value: 'en',
                    },
                  ],
                  type: [
                    {
                      target_id: 'public_works_communications',
                      target_type: 'node_type',
                      target_uuid: '8ee37bef-aab6-4c0a-98ef-a45c3e39099a',
                    },
                  ],
                  revision_timestamp: [
                    {
                      value: '2020-09-25T21:43:21+00:00',
                      format: 'Y-m-d\\TH:i:sP',
                    },
                  ],
                  revision_uid: [
                    {
                      target_id: 27201,
                      target_type: 'user',
                      target_uuid: 'f96bfbab-5344-4434-a66d-a12bc38ac38b',
                      url: '/user/27201',
                    },
                  ],
                  revision_log: [],
                  status: [
                    {
                      value: true,
                    },
                  ],
                  uid: [
                    {
                      target_id: 27201,
                      target_type: 'user',
                      target_uuid: 'f96bfbab-5344-4434-a66d-a12bc38ac38b',
                      url: '/user/27201',
                    },
                  ],
                  title: [
                    {
                      value: 'Winter Emergency',
                    },
                  ],
                  created: [
                    {
                      value: '2020-09-25T21:42:19+00:00',
                      format: 'Y-m-d\\TH:i:sP',
                    },
                  ],
                  changed: [
                    {
                      value: '2020-09-25T21:43:21+00:00',
                      format: 'Y-m-d\\TH:i:sP',
                    }
                  ],
                  promote: [
                    {
                      value: true,
                    }
                  ],
                  sticky: [
                    {
                      value: false,
                    }
                  ],
                  default_langcode: [
                    {
                      value: true,
                    }
                  ],
                  revision_translation_affected: [
                    {
                      value: true,
                    },
                  ],
                  metatag: {
                    value: {
                      title: 'Winter Emergency | Saint Paul, Minnesota',
                      canonical_url:
                        'https://saintpaulltsdev.prod.acquia-sites.com/node/131481',
                    }
                  },
                  path: [
                    {
                      alias: null,
                      pid: null,
                      langcode: 'en',
                    }
                  ],
                  field_clean_up_phase: [
                    {
                      value: '2020-10-29T17:00:20-05:00',
                      end_value: '2020-10-31T20:00:20-05:00',
                    }
                  ],
                  field_day_plow_phase: [
                    {
                      value: '2019-10-26T08:00:20-05:00',
                      end_value: '2019-10-29T17:00:20-05:00',
                    }
                  ],
                  field_night_plow_phase: [
                    {
                      value: '2020-10-23T21:00:20-05:00',
                      end_value: '2020-10-26T07:00:20-05:00',
                    },
                  ],
                },
              ];

          // Turn on Basemap Layer
          // layers[0].visible = true;

          // Options for timestamp visualization
          const options = {
             hour12 : true,
             hour:  'numeric',
             minute: 'numeric'
          };

          let layer1, layer2;
          let toNight, fromNight, toDay, fromDay, toClean, fromClean;

          let nightPlow = obj[0].field_night_plow_phase;
          let nightPlowFrom = new Date(nightPlow[0].value).getTime();
          let nightPlowTo = new Date(nightPlow[0].end_value).getTime();

          let dayPlow = obj[0].field_day_plow_phase;
          let dayPlowFrom = new Date(dayPlow[0].value).getTime();
          let dayPlowTo = new Date(dayPlow[0].end_value).getTime();

          let cleanUp = obj[0].field_clean_up_phase;
          let cleanUpFrom = new Date(cleanUp[0].value).getTime();
          let cleanUpTo = new Date(cleanUp[0].end_value).getTime();

          let currentTime = Date.now();

          // Call function when normal parking in effect or a map error happens
          function normalParking(){
            console.log('Outside of times. Put green');
            layers[2].visible = true;
            layers[1].visible = true;
            $('ul li .active').css('color', 'green');
            $('.status-header').css('background-color', 'green');
            $('#emergency').text('Normal Parking');
            $('#normal-button').addClass('active');
            $('#layer-carousel').find('#normal-active').first().addClass('active');
          }

          // Update UI banner with timestamp
          function updateBanner() {
            toNight = new Date(nightPlowTo).toLocaleTimeString('en-US', options);
            fromNight = new Date(nightPlowFrom).toLocaleTimeString('en-US', options);

            toDay = new Date(dayPlowTo).toLocaleTimeString('en-US', options);
            fromDay = new Date(dayPlowFrom).toLocaleTimeString('en-US', options);

            toClean = new Date(cleanUpTo).toLocaleTimeString('en-US', options);
            fromClean = new Date(cleanUpFrom).toLocaleTimeString('en-US', options);

            if((currentTime > nightPlowFrom) && (currentTime < nightPlowTo)){
              console.log('within nightplow');
              layers[6].visible = true;
              layers[7].visible = true;
              $('#phase').text('Night Plow Active ' + fromNight + ' to ' + toNight);
              $('#nightPlow-button').addClass('active');
              $('#layer-carousel').find('#nightPlow-active').first().addClass('active');

            } else if ((currentTime > dayPlowFrom) && (currentTime < dayPlowTo)) {
              console.log('within dayplow');
              layers[4].visible = true;
              layers[5].visible = true;
              $('#phase').text('Day Plow Active ' + fromDay + ' to ' + toDay);
              $('#dayPlow-button').addClass('active');
              $('#layer-carousel').find('#dayPlow-active').first().addClass('active');

            } else if ((currentTime > cleanUpFrom) && (currentTime < cleanUpTo)) {
              console.log('within cleanup');
              layers[2].visible = true;
              layers[1].visible = true;
              $('#phase').text('Clean Up Active');
              $('#cleanUp-button').addClass('active');
              $('#layer-carousel').find('#cleanUp-active').first().addClass('active');

            } else {
              normalParking();
            }
          }

          //// Check if emergency. Current time is between night plow start time and clean up end time.
          if((currentTime >= nightPlowFrom) && (currentTime <= cleanUpTo)){
            $('ul li .active').css('color', 'red');
            $('.status-header').css('background-color', 'red');
            $('#emergency').text('SNOW EMERGENCY DECLARED');
            updateBanner();
          } else {
            normalParking();
          }

            //////// Legend
            // Defines each layer legend and container based on the 'layers' object
            var nightPlowlegend = new Legend({
              view: view,
              layerInfos: [{
                layer: layers[7],
                title: 'Night Plow Routes (9:00 PM - 7:00 AM)'
              }],
              container: 'nightPlow-div'
            });

            var dayPlowlegend = new Legend({
              view: view,
              layerInfos: [{
                layer: layers[5],
                title: 'Day Plow Routes (8:00 AM - 5:00 PM)'
              }],
              container: 'dayPlow-div'
            });

            var cleanUplegend = new Legend({
              view: view,
              layerInfos: [{
                layer: layers[3]
              }],
              container: 'cleanUp-div'
            });

            var normallegend = new Legend({
              view: view,
              layerInfos: [{
                layer: layers[1]
              }],
              container: 'normal-div'
            });

            // Set to false so legend does not turn off as user zooms in/out
            dayPlowlegend.respectLayerVisibility = false;
            nightPlowlegend.respectLayerVisibility = false;
            cleanUplegend.respectLayerVisibility = false;
            normallegend.respectLayerVisibility = false;

            // Define Basemap titles
            basemapGallery.source.basemaps.items[0].title = 'Satellite';
            basemapGallery.source.basemaps.items[1].title = 'Street Map';
            basemapGallery.source.basemaps.items[2].title = 'Street Map (Night)';


            ///// Events /////

            // Removes all layers except for basemap
            function removeAllLayers(layer1, layer2) {
              var mapLayers = layers.length;
              for (var j = mapLayers-1; j >=0; j--){
                 if ((layers[j].id !== layer1) && (layers[j].id !== layer2) && (layers[j].id !== 'streets-navigation-vector-base-layer')) {
                   layers[j].visible = false;
                 }
              }
            }

            // Turns layers on and off depending on the button click event id
            function statusEvent(id){
              switch (id) {
                // Night Plow
                case '1':
                layer1 = 'Winter_Street_Parking_Night_Plow_View_7283';
                layer2 = 'Snow_Emergency_Parking_USNG_Sections_Night_Plow_View_2187';
                layers[8].visible = true;
                layers[7].visible = true;
                removeAllLayers(layer1, layer2);
                break;

                // Day Plow
                case '2':
                layer1 = 'Winter_Street_Parking_Day_Plow_View_607';
                layer2 = 'Snow_Emergency_Parking_USNG_Sections_Day_Plow_View_1109';
                layers[6].visible = true;
                layers[5].visible = true;
                removeAllLayers(layer1, layer2);
                break;

                // Clean Up
                case '3':
                layer1 = 'Winter_Street_Parking_Cleanup_View_4291';
                layer2 = 'Snow_Emergency_Parking_USNG_Sections_Cleanup_View_6028';
                layers[4].visible = true;
                layers[3].visible = true;
                removeAllLayers(layer1, layer2);
                break;

                // Normal
                case '4':
                layer1 = 'Winter_Street_Parking_Normal_View_6799';
                layer2 = 'Snow_Emergency_Parking_USNG_Sections_Normal_View_6049';
                layers[2].visible = true;
                layers[1].visible = true;
                removeAllLayers(layer1, layer2);
                break;

                default:
                console.log('There has been a problem loading the layer');
                layer1 = null;
                layer2 = null;
                removeAllLayers(layer1, layer2);
              }
            }
            // Listen for when buttons have been clicked to turn layers on and off in map service.
            $('.sublayers-item').click(function (e) {
                var id = e.currentTarget.getAttribute('data-id');
                statusEvent(id);
            });

            // Listen for when carousel has moved to turn layers on and off in map service.
            $('#layer-carousel').bind('slide.bs.carousel', function (e) {
              var id = e.relatedTarget.getAttribute('data-id');
              statusEvent(id);
            });

        })
        .catch(function(err) {
            console.log(`Error: ${err}`);
        });
    });
  });

  //////////////////////////////////////////////////////////////////
  ///// Card button + pop-up control
  // Remove css classes from select buttons on load
  $('.map-button, .help-button').removeClass('none');

  // Change button color 'on-click'
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
        $('.help-button').removeClass('none');
        $('#collapse-header, #help-collapse').collapse(
          'hide'
        );
        if ($(this).attr('aria-expanded') === 'true') {
          $('.map-button').removeClass('none');
        } else if ($(this).attr('aria-expanded') === 'false') {
          $('.map-button').addClass('none');
        } else {
          console.log('not working');
        }
        break;

      case 'help-button':
        $(this).addClass('none');
        $('.map-button').removeClass('none');
        $('#collapse-header, #map-collapse').collapse('hide');
        if ($(this).attr('aria-expanded') === 'true') {
          $('.help-button').removeClass('none');
        } else if ($(this).attr('aria-expanded') === 'false') {
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
