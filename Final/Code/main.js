// Initialize and add the map
let map, infoWindow;
let markers = [];

var searchText = document.querySelector('.search-text');
var fullScreenDiv = document.querySelector('.full-screen-search');
var closeBtn = document.querySelector('.close');
var searchResults = document.querySelector('.search-content');
var fullScreen_searchbtn = document.querySelector('.search-container button');

var resultsList = document.getElementById("carpark-result");
var nearbyCarparks = [];

async function initMap() {

  // Request needed libraries.
  //@ts-ignore
  const {Map} = await google.maps.importLibrary("maps");
  const {spherical} = await google.maps.importLibrary("geometry");
  // Check if returned from details page
  if (window.location.hash == "#back" || window.location.hash == "#distance" || window.location.hash == "#availability") {
    // Restore map to previously searched location by retrieving from local storage
    var search = localStorage.getItem('searchlocation');
    var searchlatlng = JSON.parse(search);
    var searchstr = localStorage.getItem('searchstring');
    map = new Map(document.getElementById("map"), {
      zoom: 15,
      center: searchlatlng,
      mapId: "mapid",
    });
    resetSearchResults();
    hideScreen();
    getLocation(searchstr);
    if (window.location.hash === "#distance") {
      ProcessData(searchstr, 1);
    }
    else if (window.location.hash === "#availability") {
      ProcessData(searchstr, 2);
    }
    else {
      ProcessData(searchstr, 1);
    }
  }
  else {
    // Default homepage
    map = new Map(document.getElementById("map"), {
      zoom: 15,
      center: { lat: 1.348, lng: 103.685},
      mapId: "mapid",
    });
 }
  
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
function showResults() {
  searchResults.style.display = 'grid';
}

// ADD THIS
function reduceMap(){
  var map = document.getElementById('map');
  var sidebar = document.querySelector('.sidebar');
  sidebar.style.height = '60%';
  map.style.height = '60%';
}

function getLocation(searchValue) {
  //  Remove previous marker
  removeMarker();
  // Save search string to local storage
  localStorage.setItem('searchstring', searchValue);
  // Create a geocoder object.
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': searchValue }, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK && status != google.maps.GeocoderStatus.ZERO_RESULTS) {
      // Save search lat lng object to local storage
      localStorage.setItem('searchlocation', JSON.stringify(results[0].geometry.location));
      // Get the latitude and longitude from the first result.
      map.setCenter(results[0].geometry.location);
      // Set marker at location
      setMarker(map, results[0].geometry.location);
      reduceMap();
      showResults();
    }
    else {
      // Handle the error.
      console.error(status);
      alert("No results found for search.");
    }
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

function searchLocation() {
  resetSearchResults();
  var searchValue = document.querySelector('.search-container input').value;
  hideScreen();
  getLocation(searchValue);
  ProcessData(searchValue, 1);
}


function createListItem(data) {
  //console.log(data.location);
  //console.log(data.distance);
  //console.log(data.availability)
  //console.log(data.price)
  const li = document.createElement("li");
  li.innerHTML = `
      <div class="row-results">
          <a href="./details.html?location=${data.location}&distance=${data.distance}&availability=${data.availability}&price=${data.price}">
              <i class='bx bx-map'></i>
              <span class="location">${data.location}</span>
              <div class="result-info">
                  <div class="column">
                      <i class="bx bx-walk"></i>
                      <span class="distance">${data.distance}</span>
                  </div>
                  <div class="column">
                      <i class="bx bx-car"></i>
                      <span class="availability">${data.availability}</span>
                  </div>
                  <div class="column">
                      <i class='bx bx-dollar-circle'></i>
                      <span class="price">${data.price}</span>
                  </div>
              </div>
          </a>
      </div>
  `;
  return li;
}

function resetSearchResults() {
  resultsList.innerHTML = "<span class=\"noresults\">No results found.</span>";
}

async function ProcessData(searchValue, sorttype) {
  try {
    const response = await fetch('./data.php');
    const data = await response.json();
    const searchcoord = await geocodeAddress(searchValue);
    const nearbyCarparks = [];
    for (let i = 0; i < data.length; i++) {
      const rad = 500; // 500m
      const id = data[i]["carparkId"];
      const avail = data[i]["carLotsAvail"];
      const total = data[i]["carTotalLots"];
      const address = data[i]["address"];
      const la = data[i]["lat"];
      const lg = data[i]["lng"];

      const dist = google.maps.geometry.spherical.computeDistanceBetween(searchcoord[0].geometry.location, new google.maps.LatLng(la, lg));
      if (dist <= rad) {
        if(resultsList.innerHTML == "<span class=\"noresults\">No results found.</span>") {
          resultsList.innerHTML="";
        }
        nearbyCarparks.push({
          "distance": dist,
          "data": {
            location: address,
            distance: Math.round(dist) + 'm',
            availability: avail + "/" + total,
            price: "$1.20/hr",
            availint: parseInt(avail),
            totalint: parseInt(total)
          }
        });
      }
    }
    
    // MUST DO HERE BECAUSE ASYNC
    // ADD LOGIC FOR SORTING CHOICES
    // SORT BY DISTANCE ASCENDING
    if (sorttype == 1) {
      nearbyCarparks.sort(function (a, b) {
        return a.distance - b.distance;
      });
    }
    // SORT BY AVAILABILITY ASCENDING
    else if (sorttype == 2) {
      nearbyCarparks.sort(function (a, b) {
        return b.data.availint - a.data.availint;
      });
    }
    
    for (let i = 0; i < nearbyCarparks.length; i++) {
      const data = nearbyCarparks[i].data;
      const itemList = createListItem(data);
      resultsList.appendChild(itemList);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function geocodeAddress(searchValue) {
  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({
      'address': searchValue
    }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && status !== google.maps.GeocoderStatus.ZERO_RESULTS) {
        resolve(results);
      } else {
        reject(status);
      }
    });
  });
}

initMap();
searchBtn.onclick = showScreen;
closeBtn.onclick = hideScreen;
fullScreen_searchbtn.onclick = searchLocation;




//Check if page is index.html#showsearch
if(window.location.hash === "#showsearch"){
  showScreen();
}



