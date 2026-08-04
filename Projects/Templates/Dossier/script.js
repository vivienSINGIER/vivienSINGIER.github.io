
const cBtns    = document.querySelectorAll(".carousel-btn");
const cDots    = document.querySelectorAll(".carousel-dot")
const cSlide   = document.querySelectorAll(".carousel-slide");
const cCounter = document.querySelectorAll(".carousel-counter")

function getActiveIndex() {
    let count = 0;
    cDots.forEach(d => {
        if (d.classList.contains("active")) {
            return count;
        }
        count = count + 1;
    })
    return count;
}

function switchSlide(index) {
    let i = getActiveIndex();
    let count = cDots.length;
    
    if (i >= count)
        return;
    if (index >= count)
        return;
    
    cDots.values()[i].classList.remove("active");
    cDots.values()[index].classList.add("active");

    cSlide.values()[i].classList.remove("active");
    cSlide.values()[index].classList.add("active");
}

function buttonToggle(isNext) {
    let count = cDots.length;
    let index = getActiveIndex();
    
    if (isNext) { index = index + 1; }
    else        { index = index - 1; }

    if ( index >= count ) return;
    if ( index < 0 ) return;

    switchSlide(index);
}

function dotToggle(dotIndex) {
    let index = getActiveIndex();
    if ( index === dotIndex) return;
    
    switchSlide(index);
}

