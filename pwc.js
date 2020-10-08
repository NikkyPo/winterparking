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

  $(".tab-menu li a").click(function(){
      var button = this.classList[0];
      switch (button) {
        case 'status-button':
          $('.phases-button, .map-button, .help-button').removeClass('none');
          $('#phases-collapse, #map-collapse, #help-collapse').collapse('hide');

          if ($(this).attr("aria-expanded") === "true" || $(this).hasClass("active")){
            console.log("close")
            $('.status-button').removeClass('active');
          } else if ($(this).attr("aria-expanded") === "false"){
            console.log("open")
            $('.status-button').addClass('active');
          } else {
            console.log("not working")
          }
          break;

        case 'phases-button':
          $(this).addClass("none")
          $('.status-button').removeClass('active');
          $('.map-button, .help-button').removeClass('none');
          $('#status-collapse, #map-collapse, #help-collapse').collapse('hide');

        if ($(this).attr("aria-expanded") === "true"){
          console.log("close")
          $('.phases-button').removeClass('none');
        } else if ($(this).attr("aria-expanded") === "false"){
          console.log("open")
            $('.phases-button').addClass('none');
        } else {
          console.log("not working")
        }
          break;

        case 'map-button':
          $(this).addClass("none")
          $('.status-button').removeClass('active');
          $('.phases-button, .help-button').removeClass('none');
          $('#status-collapse, #phases-collapse, #help-collapse').collapse('hide');

        if ($(this).attr("aria-expanded") === "true"){
          console.log("close")
          $('.map-button').removeClass('none');
        } else if ($(this).attr("aria-expanded") === "false"){
          console.log("open")
          $('.map-button').addClass('none');
        } else {
          console.log("not working")
        }
          break;

        case 'help-button':
          $(this).addClass("none")
          $('.status-button').removeClass('active');
          $('.phases-button, .map-button').removeClass('none');
          $('#status-collapse, #phases-collapse, #map-collapse').collapse('hide');

        if ($(this).attr("aria-expanded") === "true"){
          console.log("close")
          $('.help-button').removeClass('none');
        } else if ($(this).attr("aria-expanded") === "false"){
          console.log("open")
          $('.help-button').addClass('none');
        } else {
          console.log("not working")
        }
          break;
      }
  });


  // Resets the buttons to grey by clicking card header title and X.
  $('.change-color').click(function () {
    $('.status-button, .phases-button, .map-button, .help-button').removeClass('none');
  });
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

var startX
var startY
var endX
var endY
var treshold = 100; //this sets the minimum swipe distance, to avoid noise and to filter actual swipes from just moving fingers
var style = document.querySelector(".status-header"); //Only for design purposes
console.log(style)

//Function to handle swipes
function handleTouch(start,end, cbL, cbR){
  //calculate the distance on x-axis and o y-axis. Check wheter had the great moving ratio.
  var xDist = endX - startX;
  var yDist = endY - startY;
  console.log(xDist);
  console.log(yDist);
   if(endX - startX < 0){
      cbL();
    }else{
      cbR();
    }
}

//writing the callback fn()
var up = () => {
  $('#status-collapse').collapse('show');
}
var down = () =>{
  $('#status-collapse').collapse('hide');
}

//configs the elements on load
window.onload = function(){
 window.addEventListener('touchstart', function(event){
   //console.log(event);
   startX = event.touches[0].clientX;
   startY = event.touches[0].clientY;
   //console.log(`the start is at X: ${startX}px and the Y is at ${startY}px`)

 })

  window.addEventListener('touchend', function(event){
   //console.log(event);
   endX = event.changedTouches[0].clientX;
   endY = event.changedTouches[0].clientY;
   //console.log(`the start is at X: ${endX}px and the Y is at ${endY}px`)

   handleTouch(startX, endX, up, down)

 })
}
