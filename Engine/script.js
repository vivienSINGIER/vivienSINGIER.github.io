const viewPorts = document.querySelectorAll(".viewport");

if ( viewPorts.length > 0 ) {
    viewPorts.forEach(vp => {
        if ( vp.classList.contains("active") )
            return;

        let video = vp.querySelector("video");

        video.addEventListener("mouseover", () => { video.play(); })
        video.addEventListener("mouseleave", () => {
           video.pause();
           video.currentTime = 0;
        });

        vp.addEventListener("focusin", () => { video.play(); })
        vp.addEventListener("focusout", () => {
            video.pause();
            video.currentTime = 0;
        });

    });
}