
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

document.querySelector('.copy-email').addEventListener('click', copyEmail);