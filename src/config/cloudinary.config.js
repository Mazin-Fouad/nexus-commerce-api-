const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// 1. "Anruf" beim Lagerhaus: Wir verbinden uns mit Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Die "Versandanweisung" definieren
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // In welches Regal im Lagerhaus soll das Paket?
    folder: "nexus-commerce/products",
    // Welche Paket-Typen sind erlaubt? (Sicherheit!)
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    // Soll das Lagerhaus das Paket direkt optimieren? (Größe anpassen)
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

// 3. Den Sortierer mit der Versandanweisung ausstatten
const upload = multer({ storage: storage });

// 4. Den fertigen Sortierer für andere Teile der App verfügbar machen
module.exports = upload;
