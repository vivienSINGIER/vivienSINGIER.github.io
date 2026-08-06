
const cBtnPrev    = document.querySelector(".prev");
const cBtnNext    = document.querySelector(".carousel-btn.next");
const cDots    = document.querySelectorAll(".carousel-dot")
const cSlide   = document.querySelectorAll(".carousel-slide");
const cCounter = document.querySelector(".carousel-counter")

function getActiveIndex() {
    for ( let i = 0; i < cDots.length; i++ ) {
        if ( cDots[i].classList.contains("active"))
            return i;
    }
    return -1;
}

function switchSlide(index) {
    let i = getActiveIndex();
    let count = cDots.length;
    
    if (i >= count)
        return;
    if (index >= count)
        return;
    
    cDots[i].classList.remove("active");
    cDots[index].classList.add("active");

    cSlide[i].classList.remove("active");
    cSlide[index].classList.add("active");
    
    cCounter.firstChild.textContent = `${index + 1} / ${count}`
}

function buttonToggle(isNext) {
    let count = cDots.length;
    let index = getActiveIndex();
    
    if (isNext) { index = index + 1; }
    else        { index = index - 1; }

    if ( index < 0 )
        index += count;
    
    index = index % count;

    switchSlide(index);
}

function dotToggle(dotIndex) {
    let index = getActiveIndex();
    if ( index === dotIndex) 
        return;
    
    switchSlide(dotIndex);
}

function test(testStr) {
    cCounter.textContent = testStr;
}

if ( cBtnPrev ) {
    cBtnPrev.addEventListener("click", () =>  buttonToggle(false) );
}

if ( cBtnNext ) {
    cBtnNext.addEventListener("click", () => buttonToggle(true) );
}

if ( cDots.length > 0) {
    let count = cDots.length;
    for ( let i = 0; i < count; i++ ) {
        cDots[i].addEventListener("click", () => dotToggle(i));
    }
}