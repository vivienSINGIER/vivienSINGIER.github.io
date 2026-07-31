
function copyEmail() {
    var link = document.querySelector(".copy-email");
    var text = link.firstChild.textContent.trim();

    navigator.clipboard.writeText(text);

    var tooltip = document.querySelector(".copy-tooltip");
    var originalText = tooltip.textContent;
    tooltip.textContent = "copié";

    setTimeout(() => {
        tooltip.textContent = originalText;
    }, 2000);
}

const copyEmailEl = document.querySelector(".copy-email");
if (copyEmailEl) {
    copyEmailEl.addEventListener("click", copyEmail);
}

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

console.log(sections.length);
console.log(navLinks.length);

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

const projectFilters = document.querySelectorAll(".filter-btn");
const projectItems = document.querySelectorAll(".project-item");

function toggleFilters(selected) {
    projectFilters.forEach(btn => btn.classList.remove("active"));
    selected.classList.add("active");
    
    const filter = selected.dataset.filter;
    
    projectItems.forEach(item => {
       const tags = item.dataset.category || "";
       const matches = filter === "all" 
                || tags.includes(filter) 
                || (tags === "" && filter === "other");
       item.classList.toggle("hidden", !matches);
    });
}

if (projectItems.length !== 0 && projectFilters.length !== 0) {
    projectFilters.forEach(filter => {
        filter.addEventListener("click", () => toggleFilters(filter));
    });
}