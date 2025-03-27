const jsonServer = require("json-server");
const cors = require("cors");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(cors()); // Enable CORS
server.use(middlewares);
server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});

// Ensure the script runs only after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded, initializing photo gallery...");
    initializePhotoGallery();
    loadGallery(); // Load existing images
});

function initializePhotoGallery() {
    const uploadInput = document.getElementById("photo-upload");
    const uploadBtn = document.getElementById("upload-btn");
    const photoContainer = document.querySelector("#gallery");

    if (!uploadInput || !uploadBtn || !photoContainer) {
        console.error("Error: One or more elements are missing in the HTML.");
        return;
    }
    console.log("Photo upload elements found, setting up event listeners...");

    const apiUrl = "http://localhost:3000/photos"; // JSON Server URL

    function loadGallery() {
        console.log("Fetching photos from:", apiUrl);
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch photos.");
                return response.json();
            })
            .then(photos => {
                console.log("Photos loaded:", photos);
                photoContainer.innerHTML = ""; // Clear before adding new photos
                photos.forEach(addPhotoToGallery);
            })
            .catch(error => console.error("Error loading photos:", error));
    }
    loadGallery();
    function addPhotoToGallery(photo) {
        const div = document.createElement("div");
        div.innerHTML = `
            <img src="${photo.url}" alt="Event Photo" class="photo-item">
            <button class="remove-btn">Remove</button>
        `;
        photoContainer.appendChild(div);
    }

    uploadBtn.addEventListener("click", () => {
        console.log("Upload button clicked!");

        const files = uploadInput.files;
        console.log("Selected files:", files);

        if (files.length === 0) {
            alert("Please select at least one photo to upload.");
            return;
        }

        if (files.length > 10) {
            alert("You can only upload up to 10 photos.");
            return;
        }

        Array.from(files).forEach(file => {
            if (!file.type.startsWith("image/")) {
                alert("Only image files are allowed.");
                return;
            }

            console.log("Processing file:", file.name);

            const reader = new FileReader();
            reader.onload = () => {
                const newPhoto = { url: reader.result };

                fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newPhoto)
                })
                .then(response => {
                    if (!response.ok) throw new Error("Failed to upload photo.");
                    return response.json();
                })
                .then(photo => {
                    console.log("Photo uploaded successfully:", photo);
                    addPhotoToGallery(photo); // Add photo dynamically
                })
                .catch(error => console.error("Error uploading photo:", error));
            };
            reader.readAsDataURL(file);
        });

        uploadInput.value = ""; // Clear input after upload
    });

    // Remove photo event listener
    photoContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-btn")) {
            const photoDiv = event.target.parentElement;
            const imgSrc = photoDiv.querySelector("img").src;
            
            // Remove from JSON Server
            fetch(apiUrl)
                .then(response => response.json())
                .then(photos => {
                    const photoToDelete = photos.find(photo => photo.url === imgSrc);
                    if (photoToDelete) {
                        fetch(`${apiUrl}/${photoToDelete.id}`, {
                            method: "DELETE"
                        })
                        .then(() => {
                            console.log("Photo deleted from server:", photoToDelete.id);
                            photoDiv.remove();
                        })
                        .catch(error => console.error("Error deleting photo:", error));
                    }
                });
        }
    });
}
