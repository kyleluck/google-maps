var map;
var labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var labelIndex = 0;
var markers = [];

function initMap() {

  //var atlantaLatlng = new google.maps.LatLng(33.749, -84.388);
  var atlantaLatlng = {lat: 33.749, lng: -84.388};
  var atvLatlng = {lat: 33.773887, lng: -84.402853};

  map = new google.maps.Map(document.getElementById('map'), {
    center: atlantaLatlng,
    zoom: 11,
    streetViewControl: true
  });

  addMarker(atlantaLatlng, map, 'Atlanta');
  addMarker(atvLatlng, map, 'ATV');

  //add a marker when the user clicks on the map
  google.maps.event.addListener(map, 'click', function(event) {
    addMakerOnClick(event.latLng, map);
  });

}

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

function addMarker(location, map, title) {

  var marker = new google.maps.Marker({
    position: location,
    animation: google.maps.Animation.DROP,
    map: map,
    title: title
  });

}

// Sets the map on all markers in the markers array
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers in the markers array
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the markers array by removing references to them
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
