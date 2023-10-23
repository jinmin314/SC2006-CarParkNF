let star = document.querySelector(".star");

star.onclick = function(){
    var star = document.querySelector(".star i");
    if (star.classList.contains("bxs-star")){
        star.classList.remove("bxs-star");
        star.classList.add("bx-star");
    }
    else{
        star.classList.remove("bx-star");
        star.classList.add("bxs-star");
    }
}


