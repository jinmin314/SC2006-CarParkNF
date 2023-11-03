// Initialize and add the map
let map, infoWindow;
let markers = [];

var directionsService;
var directionsRenderer;
var carparklocation;
var cplat;
var cplng;
var searchText = document.querySelector('.search-text');
var fullScreenDiv = document.querySelector('.full-screen-search');
var closeBtn = document.querySelector('.close');
var searchResults = document.querySelector('.search-content');
var fullScreen_searchbtn = document.querySelector('.search-container button');
var backBtn = document.querySelector('.back');
backBtn.addEventListener("click", returnToResults);

function returnToResults() {
  if (window.location.hash == "#fav") window.location.href = "./favourite.html";
  else window.location.href = "./index.html#back";
}

async function initMap(position) {
  // Request needed libraries.
  //@ts-ignore
  const {Map} = await google.maps.importLibrary("maps");
  const {spherical} = await google.maps.importLibrary("geometry");
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  // Center on searched location
    map = new Map(document.getElementById("map"), {
    zoom: 15,
    center: position,
    mapId: "mapid",
  });
  // DIRECTIONS
  directionsRenderer.setMap(map);
  const onClickHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  };
  var selectBtn = document.querySelector('.selectBtn');
  selectBtn.addEventListener("click", onClickHandler);
  
  if (window.location.hash != "#fav") {
    infoWindow = new google.maps.InfoWindow({disableAutoPan: true});
    infoWindow.setPosition(position);
    infoWindow.setContent("Your destination is here.");
    infoWindow.open(map);
    setMarker(map, position);
  }
  reduceMap();

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

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  // Try HTML5 geolocation.
  removeMarker();
  var curlatlng;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        curlatlng =  new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	directionsService
	  .route({
	    origin: curlatlng,
	    destination: carparklocation,
	    travelMode: google.maps.TravelMode.DRIVING,
	  })
	  .then((response) => {
	    directionsRenderer.setDirections(response);
	    infoWindow = new google.maps.InfoWindow();
	    infoWindow.setPosition(curlatlng);
            infoWindow.setContent("You are here.");
            infoWindow.open(map);
            setTimeout(function(){
              infoWindow.close();
              const openmap = confirm("Open detailed navigation in Google Maps?");
              if (openmap) {window.open("https://www.google.com/maps/dir/?api=1&destination=" + cplat + "," + cplng + "&travelmode=driving");}
            },1000);
	  })
	  },
	  () => {
		handleLocationError(true, infoWindow, map.getCenter());
	    },
	  );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
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

function passToPHP(location, totallots, avail, total) {
  var xhr = new XMLHttpRequest();
  // Construct the URL with the location parameter
  var url = "getlatlng.php?location=" + encodeURIComponent(location) + "&totallots=" + encodeURIComponent(totallots);
  xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // Request completed successfully, now process the data
        var data = JSON.parse(xhr.responseText);
        // Data length should always be 1 result only 
        for (var i = 0; i < data.length; i++) {
          var la = data[i]["lat"];
          var lg = data[i]["lng"];
          cplat = la;
          cplng = lg;
          carparklocation = new google.maps.LatLng(la, lg);
          setMarker(map, carparklocation);
          map.setCenter(carparklocation);
          checkLowAvail(avail, total);
        }
      }
    };
  // Send the AJAX request
  xhr.send();
}

function passToPHPFav(location, totallots, avail, total) {
  var xhr = new XMLHttpRequest();
  // Construct the URL with the location parameter
  var url = "getlatlng.php?location=" + encodeURIComponent(location) + "&totallots=" + encodeURIComponent(totallots);
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // Request completed successfully, now process the data
        var data = JSON.parse(xhr.responseText);
        // Data length should always be 1 result only 
        for (var i = 0; i < data.length; i++) {
          var la = data[i]["lat"];
          var lg = data[i]["lng"];
          var avail = data[i]["carLotsAvail"];
          var total = data[i]["carTotalLots"];
          cplat = la;
          cplng = lg;
          document.getElementById("price").textContent = "$1.20/hr";
          carparklocation = new google.maps.LatLng(la, lg);
          setMarker(map, carparklocation);
          checkLowAvail(avail, total);
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(

            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              const distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(pos["lat"], pos["lng"]), new google.maps.LatLng(la, lg));
              document.getElementById("distance").textContent = Math.round(distance)+"m";
       	      document.getElementById("availability").textContent = avail+"/"+total;
              map.setCenter(carparklocation);
          },
          () => {
            handleLocationError(true, infoWindow, map.getCenter());
          },
        );
        } else {
           // Browser doesn't support Geolocation
           handleLocationError(false, infoWindow, map.getCenter());
           var search = localStorage.getItem('searchlocation');
           var searchlatlng = JSON.parse(search);
           const distance = google.maps.geometry.spherical.computeDistanceBetween(searchlatlng, new google.maps.LatLng(la, lg));
           document.getElementById("distance").textContent = Math.round(distance)+"m";
       	   document.getElementById("availability").textContent = avail+"/"+total;
           map.setCenter(carparklocation);
        }
        }
      }
    };
  // Send the AJAX request
  xhr.send();
} 

function checkLowAvail(avail, total) {
  // Check if below 5% availability
  if ((avail/total) <= 0.05) 
  {
    const carryon = confirm("WARNING!! Carpark Availability is low!! Do you still wish to proceed?");
    if (!carryon)
    {
      returnToResults();
    }
  }
}

function findCookieByValue(targetValue, targetAddress) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    const [name, value] = cookie.split('=');
    const [act_value, not_availability] = value.split("{");
    if (act_value === targetValue && name === targetAddress) {
      const [act_availability] = not_availability.split("}");
      return act_availability;
    }
  }
}

function checkIfLocationInFav(targetValue) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    const [name, value] = cookie.split('=');
    if (name === targetValue) {
      return true;
    }
  }
}

function setFavorite() {
  var star = document.querySelector(".star i");
      star.classList.remove("bx-star");
      star.classList.add("bxs-star");
}

function getQueryParameters() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
  if (window.location.hash !== "#fav") {
    const location = urlParams.get("location");
    const distance = urlParams.get("distance");
    const availability = urlParams.get("availability");
    const price = urlParams.get("price");
    const avail = parseInt(availability.split("/")[0]);
    const total = parseInt(availability.split("/")[1]);
    // Populate the data into the HTML elements
    document.getElementById("location").textContent = location;
    document.getElementById("distance").textContent = distance;
    document.getElementById("availability").textContent = availability;
    document.getElementById("price").textContent = price;
    // Mark carpark location accurately using database instead of searching
    passToPHP(location, availability.split('/')[1], avail, total);
    if(checkIfLocationInFav(location)){
      setFavorite();
    }
  }
  else {
    const location = urlParams.get("location");
    document.getElementById("location").textContent = location;
    const availability = findCookieByValue("location", location);
    document.getElementById("availability").textContent = availability;
    passToPHPFav(location, availability.split('/')[1], 0, 0);
    if(checkIfLocationInFav(location)){
      setFavorite();
    }
  } 
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


