if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(registration => {
    console.log('Service Worker registered', registration);
  }).catch(error=> {
    console.log('SW registration failed', error);
  })
}

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
  ], function (WebMap, MapView, Home, Legend, Search, BasemapGallery, Basemap, Track, Locator, Zoom, watchUtils) {
    ///// Web Map /////
    var map = new WebMap({
      portalItem: {
        id: '4c95d0ae349849ddbd50cde3e10971a8',
      },
    });

    ///// View /////
    var view = new MapView({
      container: 'viewDiv',
      map: map,
      ui: {
        components: ['attribution'],
      },
    });

    ///// Search widget /////

    // Custom St. Paul geo-locator
    var locatorUrl =
      'https://utility.arcgis.com/usrsvcs/servers/167be6071af249d497556cae54c1ccd6/rest/services/World/GeocodeServer';
    // Custom marker for Search
    var marker = {
      type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
      color: 'red',
      size: '15px',
      outline: {
        color: [128, 0, 0],
        width: '1.5px',
      },
    };

    var searchWidget = new Search({
      view: view,
      popupEnabled: false,
      includeDefaultSources: false, // Removes default Esri Geocoder
      sources: [
        {
          locator: new Locator({
            //Uses custom St. Paul geo-locator with custom marker
            url: locatorUrl,
          }),
          id: 'StPaulGeocoder',
          placeholder: 'Search for an address or place',
          resultSymbol: marker,
        },
      ],
    });
    view.ui.add(searchWidget, 'top-right');

    // Returns search result. The returned result can be used for reporting.
    searchWidget.on('select-result', function (evt) {
      console.log('search event info: ', JSON.stringify(evt.result));
    });

    // Collapse all panels on search clicked
    searchWidget.on('search-focus', function (evt) {
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
      view: view,
    });
    view.ui.add(zoom, 'top-left');

    ///// Home button /////
    var home = new Home({
      view: view,
    });
    view.ui.add(home, 'top-left', 0);

    ///// Track user location /////
    var track = new Track({
      view: view,
    });
    view.ui.add(track, 'top-left');

    ///// Load Basemap Gallery /////
    let basemapGallery = new BasemapGallery({
      source: [
        Basemap.fromId('hybrid'), // create a basemap from a well known id
        Basemap.fromId('streets-navigation-vector'),
        Basemap.fromId('streets-night-vector'),
      ],
      container: 'map-div',
      view: view,
      activeBasemap: 'streets-navigation-vector',
    });

    ////////////////////
    ///// Begin app /////
    ////////////////////

    // Fetch Admin console data
    function getJSON() {
      return fetch('https://saintpaulltsdev.prod.acquia-sites.com/pwcs?_format=json')
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return data;
        })
        .catch(function (error) {
          console.error(error.message);
        });
    }
    // Function call to get Admin data, continue if no error.
    getJSON().then(function (data) {
      map
        .load()
        .then(function () {
          // grab all the layers and load them
          const allLayers = map.allLayers;
          const promises = allLayers.map(function (layer) {
            // Turn off all layers
            layer.visible = false;
            return layer.load();
          });
          // Return layer promise
          return Promise.all(promises.toArray());
        })
        .then(function (layers) {
          // Options for timestamp visualization
          const options = {
            hour12: true,
            hour: 'numeric',
            minute: 'numeric',
            timeZone: 'America/Chicago',
          };
          let obj;
          let layer1, layer2;
          let toNight, fromNight, toDay, fromDay, toClean, fromClean;
          let nightPlowFrom,
            nightPlowTo,
            dayPlowFrom,
            dayPlowTo,
            cleanUpFrom,
            cleanUpTo;
          let currentTime, createdTime;

          ///// Sort all layers based on id.
          layers.sort(function (a, b) {
            if (a.id > b.id) {
              return 1;
            } else if (a.id < b.id) {
              return -1;
            } else {
              return 0;
            }
          });
          // IMPORTANT!!! If the web map changes at all (layers are replaced, etc)
          // and the application is displaying incorrect layers, check that the code
          // above returns the correct order of layer ids.
          // If not, update the reference table below and look at the code where
          // there is a layers[X] below to ensure the correct layers are being shown.
          // There are two layers for each of the phases, and one for the basemap.
          //
          // Current sorting will return:
          // 0 Snow_Emergency_Parking_USNG_Sections_Cleanup_View_6028
          // 1 Snow_Emergency_Parking_USNG_Sections_Day_Plow_View_1109
          // 2 Snow_Emergency_Parking_USNG_Sections_Night_Plow_View_2187
          // 3 Snow_Emergency_Parking_USNG_Sections_Normal_View_6049
          // 4 Winter_Street_Parking_Cleanup_View_4291
          // 5 Winter_Street_Parking_Day_Plow_View_607
          // 6 Winter_Street_Parking_Night_Plow_View_7283
          // 7 Winter_Street_Parking_Normal_View_6799
          // 8 streets-navigation-vector-base-layer

          // Turn on Basemap Layer
          layers[8].visible = true;

          // Call function when normal parking in effect or a map error happens
          function normalParking() {
            console.log('No Snow Emergency in effect');
            layers[3].visible = true;
            layers[7].visible = true;
            $('ul li .active').css('color', 'green');
            $('.status-header').css('background-color', 'green');
            $('#emergency').text(obj.field_normal_parking_status_head[0].value);
            $('#normal-button').addClass('active');
            $('#layer-carousel')
              .find('#normal-active')
              .first()
              .addClass('active');
            // Set console times
            toNight = new Date(nightPlowTo).toLocaleTimeString(
              'en-US',
              options
            );
            fromNight = new Date(nightPlowFrom).toLocaleTimeString(
              'en-US',
              options
            );
            toDay = new Date(dayPlowTo).toLocaleTimeString('en-US', options);
            fromDay = new Date(dayPlowFrom).toLocaleTimeString(
              'en-US',
              options
            );
          }

          // Normal Parking is shown if the Admin Console fails to provide data
          // or another problem happens.
          function normalParkingFailSafe() {
            console.log('Something went wrong loading the data');
            layers[3].visible = true;
            layers[7].visible = true;
            $('ul li .active').css('color', 'green');
            $('.status-header').css('background-color', 'green');
            $('#emergency').text('Normal Parking');
            $('#normal-button').addClass('active');
            $('#layer-carousel')
              .find('#normal-active')
              .first()
              .addClass('active');
          }

          // Update UI banner with timestamp
          function updateBanner() {
            toNight = new Date(nightPlowTo).toLocaleTimeString(
              'en-US',
              options
            );
            fromNight = new Date(nightPlowFrom).toLocaleTimeString(
              'en-US',
              options
            );
            toDay = new Date(dayPlowTo).toLocaleTimeString('en-US', options);
            fromDay = new Date(dayPlowFrom).toLocaleTimeString(
              'en-US',
              options
            );
            // If current time is between date emergency was created and Night Plow To, show Night Plow
            if (createdTime < nightPlowTo && currentTime < nightPlowTo) {
              console.log('within nightplow');
              layers[2].visible = true;
              layers[6].visible = true;
              $('#phase').text(
                obj.field_night_plow_phase_sub[0].value +
                  fromNight +
                  ' to ' +
                  toNight
              );
              $('#nightPlow-button').addClass('active');
              $('#layer-carousel')
                .find('#nightPlow-active')
                .first()
                .addClass('active');
              // If current time is between the end of Night Plow and the end of Day Plow, show Day Plow
            } else if (currentTime > nightPlowTo && currentTime < dayPlowTo) {
              console.log('within dayplow');
              layers[1].visible = true;
              layers[5].visible = true;
              $('#phase').text(
                obj.field_day_plow_phase_sub_[0].value +
                  fromDay +
                  ' to ' +
                  toDay
              );
              $('#dayPlow-button').addClass('active');
              $('#layer-carousel')
                .find('#dayPlow-active')
                .first()
                .addClass('active');
              // If current time is between the end of Clean Up and the end of Day Plow, show Clean Up
            } else if (currentTime > dayPlowTo && currentTime < cleanUpTo) {
              console.log('within cleanup');
              layers[4].visible = true;
              layers[0].visible = true;
              $('#phase').text(obj.field_clean_up_phase_sub_[0].value);
              $('#cleanUp-button').addClass('active');
              $('#layer-carousel')
                .find('#cleanUp-active')
                .first()
                .addClass('active');
            } else {
              normalParking();
              legendNormal();
            }
          }

          // Calculates and refreshes page when Day Plow begins, Clean Up begins,
          // and when Clean Up ends if current time is within those ranges
          function refreshPage() {
            if (currentTime < nightPlowTo && currentTime > createdTime) {
              // Refreshes page when phase changes to Day Plow
              var timeOut = nightPlowTo - currentTime;
              setTimeout(function (timeOut) {
                window.location.reload(true);
              }, timeOut);
            } else if (currentTime > dayPlowFrom && currentTime < cleanUpFrom) {
              // Refreshes page when phase changes to Clean Up
              var timeOut = cleanUpFrom - currentTime;
              setTimeout(function (timeOut) {
                window.location.reload(true);
              }, timeOut);
            } else if (currentTime > cleanUpFrom && currentTime < cleanUpTo) {
              // Refreshes page when phase changes to Normal Parking
              var timeOut = cleanUpTo - currentTime;
              setTimeout(function (timeOut) {
                window.location.reload(true);
              }, timeOut);
            } else {
              console.log('no refresh needed');
            }
          }

          let testData = [
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
                      value: '2020-11-28T17:00:20-05:00',
                      end_value: '2020-11-30T20:00:20-05:00',
                    }
                  ],
                  field_day_plow_phase: [
                    {
                      value: '2019-11-28T08:00:20-05:00',
                      end_value: '2019-11-28T17:00:20-05:00',
                    }
                  ],
                  field_night_plow_phase: [
                    {
                      value: '2020-11-19T21:00:20-05:00',
                      end_value: '2020-11-28T07:00:20-05:00',
                    },
                  ],
                },
              ];

          //// Check if data is valid.
          if (testData !== undefined) {
            
            // Admin console data can be used here
            obj = testData;
            
            console.log(obj.field_night_plow_phase.value)
            // Set Time variables
            nightPlowFrom = new Date(
              obj.field_night_plow_phase[0].value
            ).getTime();
            nightPlowTo = new Date(
              obj.field_night_plow_phase[0].end_value
            ).getTime();

            dayPlowFrom = new Date(obj.field_day_plow_phase[0].value).getTime();
            dayPlowTo = new Date(
              obj.field_day_plow_phase[0].end_value
            ).getTime();

            cleanUpFrom = new Date(obj.field_clean[0].value).getTime();
            cleanUpTo = new Date(obj.field_clean[0].end_value).getTime();

            currentTime = Date.now();
            createdTime = new Date(obj.created[0].value).getTime();

            // Check if current time is between when snow emergency event was created and clean up end time.
            if (currentTime >= createdTime && currentTime <= cleanUpTo) {
              $('ul li .active').css('color', 'red');
              $('.status-header').css('background-color', 'red');
              $('#emergency').text('SNOW EMERGENCY DECLARED');
              updateBanner();
              refreshPage();
            } else {
              // If outside the above times, put normal parking
              normalParking();
            }
          } else {
            // If the data fails, show Normal Parking with an alert to the user
            alert(
              'There was a problem and current status will not be shown. Please reload the webpage.'
            );
            normalParkingFailSafe();
          }

          //////// Legend
          // Defines each layer legend and container based on the 'layers' object
          var nightPlowlegend = new Legend({
            view: view,
            layerInfos: [
              {
                layer: layers[2],
                title: 'Night Plow (' + fromNight + ' to ' + toNight + ')',
              },
            ],
            container: 'nightPlow-div',
          });

          var dayPlowlegend = new Legend({
            view: view,
            layerInfos: [
              {
                layer: layers[1],
                title: 'Day Plow (' + fromDay + ' to ' + toDay + ')',
              },
            ],
            container: 'dayPlow-div',
          });

          var cleanUplegend = new Legend({
            view: view,
            layerInfos: [
              {
                layer: layers[0],
              },
            ],
            container: 'cleanUp-div',
          });

          var normallegend = new Legend({
            view: view,
            layerInfos: [
              {
                layer: layers[3],
              },
            ],
            container: 'normal-div',
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
            for (var j = mapLayers - 1; j >= 0; j--) {
              if (
                layers[j].id !== layer1 &&
                layers[j].id !== layer2 &&
                layers[j].id !== 'streets-navigation-vector-base-layer'
              ) {
                layers[j].visible = false;
              }
            }
          }

          // Turns layers on and off depending on the button click event id
          function statusEvent(id) {
            switch (id) {
              // Night Plow
              case '1':
                layer1 = 'Winter_Street_Parking_Night_Plow_View_7283';
                layer2 =
                  'Snow_Emergency_Parking_USNG_Sections_Night_Plow_View_2187';
                layers[2].visible = true;
                layers[6].visible = true;
                removeAllLayers(layer1, layer2);
                break;

              // Day Plow
              case '2':
                layer1 = 'Winter_Street_Parking_Day_Plow_View_607';
                layer2 =
                  'Snow_Emergency_Parking_USNG_Sections_Day_Plow_View_1109';
                layers[1].visible = true;
                layers[5].visible = true;
                removeAllLayers(layer1, layer2);
                break;

              // Clean Up
              case '3':
                layer1 = 'Winter_Street_Parking_Cleanup_View_4291';
                layer2 =
                  'Snow_Emergency_Parking_USNG_Sections_Cleanup_View_6028';
                layers[4].visible = true;
                layers[0].visible = true;
                removeAllLayers(layer1, layer2);
                break;

              // Normal
              case '4':
                layer1 = 'Winter_Street_Parking_Normal_View_6799';
                layer2 =
                  'Snow_Emergency_Parking_USNG_Sections_Normal_View_6049';
                layers[3].visible = true;
                layers[7].visible = true;
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
        .catch(function (err) {
          console.log(err);
          console.log(`Error: ${err}`);
        });
    });
  });

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
        $('#collapse-header, #help-collapse').collapse('hide');
        if ($(this).attr('aria-expanded') === 'true') {
          $('.map-button').removeClass('none');
        } else if ($(this).attr('aria-expanded') === 'false') {
          $('.map-button').addClass('none');
        } else {
          console.log('panel collapsed');
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
          console.log('panel collapsed');
        }
        break;
    }
  });

  // Resets the buttons to grey by clicking card header title.
  $('.card-header').click(function () {
    $('.map-button, .help-button').removeClass('none');
  });
});
