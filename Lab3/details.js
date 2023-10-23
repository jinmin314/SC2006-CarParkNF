// Initialize and add the map
let map, infoWindow;
let markers = [];

var searchText = document.querySelector('.search-text');
var fullScreenDiv = document.querySelector('.full-screen-search');
var closeBtn = document.querySelector('.close');
var searchResults = document.querySelector('.search-content');
var fullScreen_searchbtn = document.querySelector('.search-container button');
var backBtn = document.querySelector('.back');
backBtn.addEventListener("click", function() {
    window.location.href = "./index.html#back";
});

async function initMap(position) {
  // The location of NTU
  // Request needed libraries.
  //@ts-ignore
  const {Map} = await google.maps.importLibrary("maps");
  const {spherical} = await google.maps.importLibrary("geometry");
  // Center on searched location
    map = new Map(document.getElementById("map"), {
    zoom: 15,
    center: position,
    mapId: "mapid",
  });
  reduceMap();
  setMarker(map, position);
  infoWindow = new google.maps.InfoWindow();

  // Pan to location button
  const locationButton = document.querySelector(".currloc");
  locationButton.classList.add("custom-map-control-button");
  locationButton.style.margin = "0 10px 10px 0";
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);
  
  
  
  // Button on click get position once
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent("You are here.");
          infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        },
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
  
  // BE HERE IF NOT ASYNC WON'T IMPORT API CORRECTLY
  getQueryParameters();
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation.",
  );
  infoWindow.open(map);
}

function showScreen() {
  searchText.blur();
  fullScreenDiv.style.display = 'flex';
}

function hideScreen() {
  fullScreenDiv.style.display = 'none';
}


// ADD THIS
function reduceMap(){
  var map = document.getElementById('map');
  var sidebar = document.querySelector('.sidebar');
  sidebar.style.height = '60%';
  map.style.height = '60%';
}

function getLocation(Value) {
  // Wait for the DOM to be fully loaded and the Google Maps API to be initialized
  window.addEventListener('load', function() {
    // Create a geocoder object.
    var geocoder = new google.maps.Geocoder();
  
    // Rest of your getLocation() logic...
    geocoder.geocode({ 'address': Value }, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK && status !== google.maps.GeocoderStatus.ZERO_RESULTS) {
        // Get the latitude and longitude from the first result.
        console.log(results[0].geometry.location);
        map.setCenter(results[0].geometry.location);
        // Set marker at location
        setMarker(map, results[0].geometry.location);
        reduceMap();
      } else {
        // Handle geocoding errors...
        console.error(status);
      }
    });
  });
}

function setMarker(map, position) {
  const marker = new google.maps.Marker({
    position,
    map,
    });

  // Add marker to array
  markers.push(marker);
}

function removeMarker() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

function passToPHP(location, totallots) {
  var xhr = new XMLHttpRequest();

  // Construct the URL with the location parameter
  var url = "getlatlng.php?location=" + encodeURIComponent(location) + "&totallots=" + encodeURIComponent(totallots);

  xhr.open("GET", url, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // Request completed successfully, now process the data
      var data = JSON.parse(xhr.responseText);
      for (var i = 0; i < data.length; i++) {
        var la = data[i]["lat"];
        var lg = data[i]["lng"];
        const carparklocation = new google.maps.LatLng(la, lg);
        setMarker(map, carparklocation);
        map.setCenter(carparklocation);
      }
    }
  };

  // Send the AJAX request
  xhr.send();
}


function getQueryParameters() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const location = urlParams.get("location");
  const distance = urlParams.get("distance");
  const availability = urlParams.get("availability");
  const price = urlParams.get("price");

  // Populate the data into the HTML elements
  document.getElementById("location").textContent = location;
  document.getElementById("distance").textContent = distance;
  document.getElementById("availability").textContent = availability;
  document.getElementById("price").textContent = price;
  // Mark carpark location accurately using database instead of searching
  passToPHP(location, availability.split('/')[1]);
}

// Check if the current page is the details page
if (window.location.pathname.endsWith("details.html")) {
  var search = localStorage.getItem('searchlocation');
  var searchlatlng = JSON.parse(search);
  initMap(searchlatlng);
}

searchBtn.onclick = showScreen;
closeBtn.onclick = hideScreen;

//Check if page is index.html#showsearch
if(window.location.hash === "#showsearch"){
  showScreen();
}


