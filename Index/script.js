
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