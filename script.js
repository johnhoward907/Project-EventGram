const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});

document.addEventListener("DOMContentLoaded", () => {
    const uploadInput = document.getElementById("photo-upload");
    const uploadBtn = document.getElementById("upload-btn");
    const photoContainer = document.getElementById("photo-container");

    const apiUrl = "http://localhost:3000/photos";

    // Fetch and display images from server
    function loadGallery() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(photos => {
                photoContainer.innerHTML = ""; // Clear before adding new photos
                photos.forEach(photo => {
                    const img = document.createElement("img");
                    img.src = photo.url;
                    img.classList.add("photo-item");
                    photoContainer.appendChild(img);
                });
            })
            .catch(error => console.error("Error loading photos:", error));
    }

    // Upload new photos
    uploadBtn.addEventListener("click", () => {
        const files = uploadInput.files;
        if (files.length === 0) {
            alert("Please select at least one photo to upload.");
            return;
        }

        if (files.length > 10) {
            alert("You can only upload up to 10 photos.");
            return;
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const newPhoto = { url: reader.result };

                // Save to local server
                fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newPhoto)
                })
                .then(() => loadGallery())
                .catch(error => console.error("Error uploading photo:", error));
            };
            reader.readAsDataURL(file);
        });

        uploadInput.value = ""; // Clear input after upload
    });

    loadGallery(); // Load images when page loads
});
