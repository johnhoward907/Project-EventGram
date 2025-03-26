const jsonServer = require("json-server");
const cors = require("cors");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(cors()); // Enable CORS
server.use(middlewares);
server.use(router);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});

// Function to initialize the photo gallery
function initializePhotoGallery() {
    const uploadInput = document.getElementById("photo-upload");
    const uploadBtn = document.getElementById("upload-btn");
    const photoContainer = document.getElementById("photo-container");

    const apiUrl = "http://localhost:5000/photos"; // Corrected port to match json-server

    // Fetch and display images from server
    function loadGallery() {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch photos.");
                return response.json();
            })
            .then(photos => {
                photoContainer.innerHTML = ""; // Clear before adding new photos
                photos.forEach(addPhotoToGallery);
            })
            .catch(error => console.error("Error loading photos:", error));
    }

    function addPhotoToGallery(photo) {
        const img = document.createElement("img");
        img.src = photo.url;
        img.classList.add("photo-item");
        photoContainer.appendChild(img);
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
            if (!file.type.startsWith("image/")) {
                alert("Only image files are allowed.");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const newPhoto = { url: reader.result };

                // Save to local server
                fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newPhoto)
                })
                .then(response => {
                    if (!response.ok) throw new Error("Failed to upload photo.");
                    return response.json();
                })
                .then(photo => addPhotoToGallery(photo)) // Add photo dynamically
                .catch(error => console.error("Error uploading photo:", error));
            };
            reader.readAsDataURL(file);
        });

        uploadInput.value = ""; // Clear input after upload
    });

    loadGallery(); // Load images when page loads
}

// Attach the named function to the DOM event listener

