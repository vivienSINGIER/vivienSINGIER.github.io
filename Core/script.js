
const revealObs = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            console.log(entry.target, entry.isIntersecting);
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
            } else {
                entry.target.classList.remove("in-view");
            }
        });
    }, { threshold: 0.10 }
);

const revealElements = document.querySelectorAll(".reveal")
 
revealElements.forEach((rEl) => revealObs.observe(rEl));

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

if (sections.length !== 0 && navLinks.length !== 0) {
    const navObs = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("id");
                    navLinks.forEach(link => {
                        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
                    });
                }
            });
        }, { rootMargin: "-45% 0px -45% 0px" }
    ); 
    
    sections.forEach(sect => navObs.observe(sect));
}

function copyEmail(el) {
    var text = el.firstChild.textContent.trim();

    navigator.clipboard.writeText(text);

    var tooltip = el.querySelector(".copy-tooltip");
    var originalText = tooltip.textContent;
    tooltip.textContent = "copié";

    setTimeout(() => {
        tooltip.textContent = originalText;
    }, 2000);
}

const copyEmailEls = document.querySelectorAll(".copy-email");
if ( copyEmailEls.length > 0) {
    copyEmailEls.forEach(el => {
        el.addEventListener("click", () => copyEmail(el));
    });
}