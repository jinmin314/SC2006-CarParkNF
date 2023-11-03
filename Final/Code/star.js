var star = document.querySelectorAll(".star");

function setCookie(cname, cvalue, exdays){
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function starCheck(){
    var star = this.querySelector("i");
    var location = this.parentElement.parentElement.querySelector(".location").innerHTML;
   
    var availability = document.getElementById("availability").innerHTML;


    if (star.classList.contains("bx-star")){
        // If star is not selected
        // add favourite carpark
        star.classList.remove("bx-star");
        star.classList.add("bxs-star");
        setCookie(location , "location"+ "{" + availability + "}", 365);
    }
    else{
        // if star is select selected
        // remove favourite carpark
        star.classList.remove("bxs-star");
        star.classList.add("bx-star");
        setCookie(location , "location"+ "{" + availability + "}", -365); 
    }
}

for (var i = 0; i < star.length; i++){
    star[i].addEventListener("click", starCheck);
}













