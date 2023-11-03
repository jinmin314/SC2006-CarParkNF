var favouriteCarparks = [];
var resultsList = document.getElementById("favourite-results");

function findCookieByValue(targetValue) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie) {
      const [name, value] = cookie.split('=');
      const [not_act_value] = value.split("{");
      const [act_value] = not_act_value.split("}");
      
      if (act_value === targetValue) {
        favouriteCarparks.push(name);
      }
      
      }
    }
    return null; // Cookie with the specified value not found
  }

function createListItem(data) {
    const li = document.createElement("li");
    li.innerHTML = `
        <div class="row-results">
            <a href="./details.html?location=${data}#fav">
                <i class='bx bx-map'></i>
                <span class="location">${data}</span>
            </a>
        </div>
    `;
    return li;
  }

  findCookieByValue("location");
  for (let i = 0; i < favouriteCarparks.length; i++) {
    const data = favouriteCarparks[i];
    const itemList = createListItem(data);
    resultsList.appendChild(itemList);
  }


