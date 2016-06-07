/* places autocomplete */
var input = /** @type {!HTMLInputElement} */ (document.getElementById('pac-input'));
var types = document.getElementById('type-selector');
map.controls[google.maps.ControlPosition.LEFT_TOP].push(input);
map.controls[google.maps.ControlPosition.LEFT_TOP].push(types);

var autocomplete = new google.maps.places.Autocomplete(input);
//bind autocomplete results to map
autocomplete.bindTo('bounds', map);

/* places info window and marker */
var placesInfoWindow = new google.maps.InfoWindow();
var placesMarker = new google.maps.Marker({
  map: map,
  anchorPoint: new google.maps.Point(0, -29)
});

/*
  when search box changes, hide previous marker
  and display new marker
*/
autocomplete.addListener('place_changed', function() {
  placesInfoWindow.close();
  placesMarker.setVisible(false);
  var place = autocomplete.getPlace();
  if (!place.geometry) {
    console.log("Autocomplete's returned place contains no geometry");
    return;
  }

  /* If the place has a geometry, present it on the map */
  if (place.geometry.viewport) {
    map.fitBounds(place.geometry.viewport);
  } else {
    map.setCenter(place.geometry.location);
    map.setZoom(17);
  }
  placesMarker.setIcon(/** @type {google.maps.Icon} */({
    url: place.icon,
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(35, 35)
  }));
  placesMarker.setPosition(place.geometry.location);
  placesMarker.setVisible(true);

  var address = '';
  if (place.address_components) {
    address = [
      (place.address_components[0] && place.address_components[0].short_name || ''),
      (place.address_components[1] && place.address_components[1].short_name || ''),
      (place.address_components[2] && place.address_components[2].short_name || '')
    ].join(' ');
  }

  /* reveal places info window */
  placesInfoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
  placesInfoWindow.open(map, placesMarker);

  /* if directions were showing at the time of a places search, hide directions */
  showDirections = false;
  toggleDirections();
});

/* Set a listener on the radio button to change the filter type */
function setupClickListener(id, types) {
  var radioButton = document.getElementById(id);
  radioButton.addEventListener('click', function() {
    autocomplete.setTypes(types);
  });
}

/* setup listeners for places search type radio buttons */
setupClickListener('changetype-all', []);
setupClickListener('changetype-address', ['address']);
setupClickListener('changetype-establishment', ['establishment']);
