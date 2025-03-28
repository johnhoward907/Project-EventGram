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

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded, initializing photo gallery...");
    initializePhotoGallery();
});

function initializePhotoGallery() {
    const uploadInput = document.getElementById("photo-upload");
    const uploadBtn = document.getElementById("upload-btn");
    const photoContainer = document.querySelector("#gallery");
    const apiUrl = "http://localhost:3000/photos";

    if (!uploadInput || !uploadBtn || !photoContainer) {
        console.error("Error: Missing essential elements in HTML.");
        return;
    }
    console.log("Elements found, setting up event listeners...");

    async function loadGallery() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch photos.");
            const photos = await response.json();
            console.log("Photos loaded:", photos);
            photoContainer.innerHTML = "";
            photos.forEach(addPhotoToGallery);
        } catch (error) {
            console.error("Error loading photos:", error);
        }
    }
    loadGallery();

    function addPhotoToGallery(photo) {
        const div = document.createElement("div");
        div.classList.add("photo-item");
        div.innerHTML = `
            <img src="${photo.url}" alt="Event Photo" class="photo-item">
            <button class="remove-btn">Remove</button>
        `;
        photoContainer.appendChild(div);
    }

    uploadBtn.addEventListener("click", async () => {
        console.log("Upload button clicked!");
        const files = uploadInput.files;

        if (files.length === 0) {
            alert("Please select at least one photo to upload.");
            return;
        }
        if (files.length > 10) {
            alert("You can only upload up to 10 photos.");
            return;
        }

        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                alert("Only image files are allowed.");
                return;
            }

            console.log("Processing file:", file.name);
            const reader = new FileReader();
            reader.onload = async () => {
                const newPhoto = { url: reader.result };
                try {
                    const response = await fetch(apiUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newPhoto)
                    });
                    if (!response.ok) throw new Error("Failed to upload photo.");
                    const photo = await response.json();
                    console.log("Photo uploaded successfully:", photo);
                    addPhotoToGallery(photo);
                } catch (error) {
                    console.error("Error uploading photo:", error);
                }
            };
            reader.readAsDataURL(file);
        }
        uploadInput.value = "";
    });

    photoContainer.addEventListener("click", async (event) => {
        if (!event.target.classList.contains("remove-btn")) return;

        const photoDiv = event.target.parentElement;
        const imgSrc = photoDiv.querySelector("img").src;

        try {
            const response = await fetch(apiUrl);
            const photos = await response.json();
            const photoToDelete = photos.find(photo => photo.url === imgSrc);
            if (!photoToDelete) return;

            const deleteResponse = await fetch(`${apiUrl}/${photoToDelete.id}`, { method: "DELETE" });
            if (!deleteResponse.ok) throw new Error("Failed to delete photo.");

            console.log("Photo deleted successfully:", photoToDelete.id);
            photoDiv.remove();
        } catch (error) {
            console.error("Error deleting photo:", error);
        }
    });
}
