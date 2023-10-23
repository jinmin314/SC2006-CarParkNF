//Filter dropdown
let filterBtn = document.querySelector(".dropdown");

filterBtn.onclick = function(){
document.getElementById("myDropdown").classList.toggle("show");
}

let sortBtn = document.querySelector(".sort");

sortBtn.onclick = function(){
var sortIcon = document.querySelector(".sort i");
var sortText = document.querySelector(".sort span");
if (sortIcon.classList.contains("bx-sort-up")){
    sortIcon.classList.remove("bx-sort-up");
    sortIcon.classList.add("bx-sort-down");
    sortText.textContent = "Sorted by Decreasing Order";
}
else{
    sortIcon.classList.remove("bx-sort-down");
    sortIcon.classList.add("bx-sort-up");
    sortText.textContent = "Sorted by Increasing Order";
}
}

