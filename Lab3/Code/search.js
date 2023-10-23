var searchText = document.querySelector('.search-text');
    var fullScreenDiv = document.querySelector('.full-screen-search');
    var closeBtn = document.querySelector('.close');
    var searchResults = document.querySelector('.search-content');

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

    searchBtn.onclick = showScreen;
    closeBtn.onclick = hideScreen;

    fullScreen_searchbtn = document.querySelector('.search-container button');

    //ADD THIS
    fullScreen_searchbtn.onclick = function() {
        var searchValue = document.querySelector('.search-container input').value;
        hideScreen();
        reduceMap();
        showResults();
    }


