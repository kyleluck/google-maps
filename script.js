var map;
var labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var labelIndex = 0;
var markers = [];
var traffic = true;
var trafficLayer;
var showDirections = true;

function initMap() {

  /* variables for directions */
  var origin_place_id = null;
  var destination_place_id = null;
  var travel_mode = google.maps.TravelMode.DRIVING;

  /* lat and lng coordinates for Atlanta & ATV. These two will be initially displayed */
  var atlantaLatlng = {lat: 33.749, lng: -84.388};
  var atvLatlng = {lat: 33.773887, lng: -84.402853};

  /* initialize map. set center on Atlanta */
  map = new google.maps.Map(document.getElementById('map'), {
    center: atlantaLatlng,
    zoom: 11,
    streetViewControl: true
  });

  /* add markers for Atlanta & ATV */
  addMarker(atlantaLatlng, map, 'Atlanta');
  addMarker(atvLatlng, map, 'ATV');

  /* add a marker when the user clicks on the map */
  google.maps.event.addListener(map, 'click', function(event) {
    addMakerOnClick(event.latLng, map);
  });

  /*
  Leaving this code in for future reference
  ------------------------------------------

  var infowindow = new google.maps.InfoWindow();
  //add places service
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: atlantaLatlng,
    radius: 500,
    type: ['store']
  }, serviceCallback);

  //callback function for Places service
  function serviceCallback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }
    }
  }

  //create a marker for each Places service result
  function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: placeLoc
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  }
  */


  /* initially display traffic layer */
  trafficLayer = new google.maps.TrafficLayer();
  toggleTrafficLayer();

  /* directions */
  var directionsService = new google.maps.DirectionsService(); // no () in documentation
  var directionsDisplay = new google.maps.DirectionsRenderer({
    draggable: true,
    map: map,
    panel: document.getElementById('right-panel')
  });

  var origin_input = document.getElementById('origin-input');
  var destination_input = document.getElementById('destination-input');
  var modes = document.getElementById('mode-selector');

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(origin_input);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(destination_input);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(modes);

  /* bind origin and destination autocomplete */
  var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
  origin_autocomplete.bindTo('bounds', map);
  var destination_autocomplete = new google.maps.places.Autocomplete(destination_input);
  destination_autocomplete.bindTo('bounds', map);

  /* Sets a listener on a radio button to change the filter type on Places Autocomplete. */
  function setupDirectionsClickListener(id, mode) {
    var radioButton = document.getElementById(id);
    radioButton.addEventListener('click', function() {
      travel_mode = mode;
      route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
    });
  }
  /* setup listeners for changing direction modes */
  setupDirectionsClickListener('changemode-walking', google.maps.TravelMode.WALKING);
  setupDirectionsClickListener('changemode-transit', google.maps.TravelMode.TRANSIT);
  setupDirectionsClickListener('changemode-driving', google.maps.TravelMode.DRIVING);

  function expandViewportToFitPlace(map, place) {
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
  }

  /* whenever origin changes, autocomplete */
  origin_autocomplete.addListener('place_changed', function() {
    var place = origin_autocomplete.getPlace();
    if (!place.geometry) {
      window.alert("Autocomplete's returned place contains no geometry");
      return;
    }
    expandViewportToFitPlace(map, place);

    // If the place has a geometry, store its place ID and route if we have
    // the other place ID
    origin_place_id = place.place_id;
    route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
  });

  /* whenever destination changes, autocomplete */
  destination_autocomplete.addListener('place_changed', function() {
    var place = destination_autocomplete.getPlace();
    if (!place.geometry) {
      window.alert("Autocomplete's returned place contains no geometry");
      return;
    }
    expandViewportToFitPlace(map, place);

    // If the place has a geometry, store its place ID and route if we have
    // the other place ID
    destination_place_id = place.place_id;
    route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
  });

  /* find directions and display */
  function route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay) {
    if (!origin_place_id || !destination_place_id) {
      return;
    }
    directionsService.route({
      origin: {'placeId': origin_place_id},
      destination: {'placeId': destination_place_id},
      travelMode: travel_mode
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        showDirections = true;
        toggleDirections();
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }



} // end initMap function

/* function to toggle the traffic layer and set button values appropriately */
function toggleTrafficLayer() {
  var trafficButton = document.getElementById('toggle-traffic');
  if (traffic === true) {
    //add traffic layer
    trafficLayer.setMap(map);
    traffic = false;
    trafficButton.setAttribute('value', 'Hide Traffic');
  } else {
    trafficLayer.setMap(null);
    traffic = true;
    trafficButton.setAttribute('value', 'Show Traffic');
  }
}

/* add a marker to the map @ the point the user clicks */
function addMakerOnClick(location, map) {
  var marker = new google.maps.Marker({
    position: location,
    label: labels[labelIndex++ % labels.length],
    animation: google.maps.Animation.DROP,
    map: map,
    draggable: true
  });
  markers.push(marker);
}

/* function to add two initial markers: Atlanta & ATV */
function addMarker(location, map, title) {
  var marker = new google.maps.Marker({
    position: location,
    animation: google.maps.Animation.DROP,
    map: map,
    title: title
  });

  if (title === 'ATV') {
    var atvContentString = '<div id="content">Atlanta Tech Village is home to some of the brightest and most talented companies in the world. Surround yourself with like minded individuals looking to make a dent in the universe.</div>';
    setInfoWindow(map, marker, atvContentString);
  } else if (title === 'Atlanta') {
    var atlantaContentString = '<div id="content">Atlanta is the capital of and the most populous city in the U.S. state of Georgia, with an estimated 2013 population of 447,841.[6] Atlanta is the cultural and economic center of the Atlanta metropolitan area, home to 5,522,942 people and the ninth largest metropolitan area in the United States.[7] Atlanta is the county seat of Fulton County, and a small portion of the city extends eastward into DeKalb County.</div>';
    setInfoWindow(map, marker, atlantaContentString);
  }
}

/* function to set info windows */
function setInfoWindow(map, marker, content) {
  var infowindow = new google.maps.InfoWindow({
    content: content
  });
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
}

/* Sets the map on all markers in the markers array */
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

/* Removes the markers from the map, but keeps them in the array */
function clearMarkers() {
  setMapOnAll(null);
}

/* Shows any markers in the markers array */
function showMarkers() {
  setMapOnAll(map);
}

/* Deletes all markers in the markers array by removing references to them */
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

/* function to toggle direction panel */
function toggleDirections() {
  var rightPanel = document.getElementById('right-panel');
  var directionsButton = document.getElementById('toggle-directions');
  var map = document.getElementById('map');

  if (showDirections) {
    rightPanel.className = '';
    showDirections = false;
    directionsButton.setAttribute('value', 'Hide Directions');
    map.style.width = "63%";
  } else {
    rightPanel.className = 'hide';
    showDirections = true;
    directionsButton.setAttribute('value', 'Show Directions');
    map.style.width = "100%";
    google.maps.event.trigger(map, 'resize');
  }
}
