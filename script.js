document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded, initializing photo gallery...");
    initializePhotoGallery();
});

function initializePhotoGallery() {
    const uploadInput = document.getElementById("photo-upload");
    const uploadBtn = document.getElementById("upload-btn");
    const photoContainer = document.getElementById("photo-container");

    if (!uploadInput || !uploadBtn || !photoContainer) {
        console.error("Error: One or more elements are missing in the HTML.");
        return;
    }

    console.log("Photo upload elements found, setting up event listeners...");

    const apiUrl = "https://eventgram-ewtp.onrender.com/photos"; // JSON Server URL

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

    function addPhotoToGallery(photo) {
        const img = document.createElement("img");
        img.src = photo.url;
        img.classList.add("photo-item");
        photoContainer.appendChild(img);
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

    loadGallery(); // Load images when the page loads
}
