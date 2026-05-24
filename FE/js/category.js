document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    const links = document.querySelectorAll(".nav-link");

    links.forEach(link => link.classList.remove("active-link"));
    const categoryTitle = document.getElementById('categoryTitle');
    // Home
    if (path.includes("index.html") || path === "/") {
        document.querySelector('a[href="../index.html"]')?.classList.add("active-link");
    }

    // Category page
    if (path.includes("category.html")) {
        const cat = params.get("cat");
        console.log("CAT VALUE:", cat);
        const icon = document.createElement('i');
        if (cat === "sticker sheets") {
            categoryTitle.textContent = "Sticker Sheets";
            icon.className = 'fa-solid fa-layer-group';
            document
                .querySelector('a[href="category.html?cat=sticker sheets"]')
                ?.classList.add("active-link");
        } else if (cat === "stickers") {
            categoryTitle.textContent = "Stickers";
            icon.className = 'fa-solid fa-sticky-note';
            document
                .querySelector('a[href="category.html?cat=stickers"]')
                ?.classList.add("active-link");
        }
        else if (cat === "mugs") {
            categoryTitle.textContent = "Mugs";
            icon.className = 'bi bi-cup-fill me-2';
            document
                .querySelector('a[href="category.html?cat=mugs"]')
                ?.classList.add("active-link");
        } else if (cat === "medals") {
            categoryTitle.textContent = "Medals";
            icon.className = 'bi bi-award-fill me-2';
            document
                .querySelector('a[href="category.html?cat=medals"]')
                ?.classList.add("active-link");
        } else if (cat === "coaster") {
            categoryTitle.textContent = "Coasters";
            icon.className = 'bi bi-award-fill me-2';
            document
                .querySelector('a[href="category.html?cat=coaster"]')
                ?.classList.add("active-link");
        }
        else if (cat === "visa stickers") {

            categoryTitle.textContent = "Visa Stickers";
            icon.className = 'bi bi-award-fill me-2';
            document
                .querySelector('a[href="category.html?cat=visa stickers"]')
                ?.classList.add("active-link");
        } else if (cat === "laptop stickers") {
            categoryTitle.textContent = "Laptop Stickers";
            icon.className = 'bi bi-award-fill me-2';
            document
                .querySelector('a[href="category.html?cat=laptop stickers"]')
                ?.classList.add("active-link");
        }
        else {
            document
                .querySelector('a[href="../pages/category.html"]')
                ?.classList.add("active-link");
        }
        categoryTitle.parentElement.prepend(icon);
    }

    // Stickers dropdown (لو عندك صفحات خاصة بيها)
    if (path.includes("stickers")) {
        document
            .getElementById("stickersDropdown")
            ?.classList.add("active-link");
    }
});
