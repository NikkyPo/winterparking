window.onload = function(){

// Load Modules
require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Home",
  "esri/widgets/Legend",
  "esri/widgets/BasemapToggle",
  "esri/widgets/Search",
  "esri/widgets/Locate",
  "esri/widgets/LayerList",

], function (WebMap, MapView, Home, Legend, BasemapGallery, Search, Locate, LayerList,) {
  ///// Web Map
  var map = new WebMap({
    portalItem: {
      id: "6aaffaa58782402bb47dfae5cc4e2b2d",
    },
  });
  ///// View
  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-93.109, 44.91396],
    zoom: 11,
    padding: {
      top: 0,
      bottom: 60,
    },
    uiComponents: [],
  });

  ////////////////////////////////////////
  /// Widgets added to UI containter ////
  ///////////////////////////////////////

  ///// Home button
  var home = new Home({
    view: view,
  });
  view.ui.add(home, "top-left", 0);

  ////// Custom marker
  var marker = {
    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    color: "red",
    size: "20px",
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: [128, 0, 0, 0.5],
      width: "1.5px",
    },
  };

  ///// Search widget
  var searchWidget = new Search({
    view: view,
    popupEnabled: false,
  });
  view.ui.add(searchWidget, "top-right");

  // Change search marker symbol
  searchWidget.watch("activeSource", function (evt) {
    console.log(evt, "here");
    evt.resultSymbol = marker;
  });

  // Returns search result
  searchWidget.on("select-result", function (evt) {
    console.log("search event info: ", JSON.stringify(evt.result.feature));
    var point = {
      type: "point",
      latitude: evt.result.feature.geometry.latitude,
      longitude: evt.result.feature.geometry.longitude,
    };
    console.log("lat/long result ", point);
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
  view.ui.add(locate, "top-left");

  //////// Legend
  var legendWidget = new Legend({
    container: "status-div",
    view: view,
  });

  //////// Layer List (phases)
  var layerList = new LayerList({
    container: "layer-div",
    view: view,
  });

});


var $buttonArray = [];
$(".tab-menu li a").each(function(){
  var menu = $(this).attr('href');
  $buttonArray.push(menu)
});

$(".tab-menu li a").click(function(){
    var button = this.classList[0];
    switch (button) {
      case 'status-button':
        if (button.contains("collapsed") || button.children[0].style.color === ""){
          $('#phases-collapse').collapse('hide');
          for (var i=0; i < this.children.length; i++){
            this.children[i].style.color = "black";
          }
        } else {
          for (var i=0; i < button.children.length; i++){
            button.children[i].style.color = "black";
          }
          button.children[0].style.color = "#666";
          button.children[1].style.color = "#666";
        }
        console.log(button)
        break;
      case 'phases-button':
        console.log(button)
        break;
      case 'map-button':
        console.log(button)
        break;
      case 'help-button':
        console.log(button)
        break;
    }
})

// Control cards
// var statusButton = document.getElementById("status-button")
//
// statusButton.addEventListener("click", function() {
//   if (statusButton.classList.contains("collapsed") || statusButton.children[0].style.color === "") {
//     $('#phases-collapse').collapse('hide');
//     for (var i=0; i < this.children.length; i++){
//       this.children[i].style.color = "black";
//     }
//   } else {
//     for (var i=0; i < statusButton.children.length; i++){
//       statusButton.children[i].style.color = "black";
//     }
//     statusButton.children[0].style.color = "#666";
//     statusButton.children[1].style.color = "#666";
//   }
// }, false);
//
// // Resets the buttons to grey by clicking card header title and X.
// document.querySelectorAll('.change-color').forEach(function(item) {
//   item.addEventListener('click', function() {
//     statusButton.children[0].className = "#666";
//     statusButton.children[1].className = "#666";
//   });
// });

};

// document.addEventListener(
//   "click",
//   function (event) {
//     // Log the clicked element in the console
//     console.log(event.target);
//
//     // If the clicked element doesn't have the right selector, bail
//     if (!event.target.matches(".click-me")) return;
//   },
//   false
// );



    // $('#test1').on('click', function(e) {
    //   console.log("works")
    //     $('#phases-collapse .collapse').removeAttr("data-parent").collapse('show');
    // });
    // $('#toggleAccordionHide').on('click', function(e) {
    //     $('#accordion .collapse').attr("data-parent","#accordion").collapse('hide');
    // });
