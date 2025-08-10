import multer from "multer";
import path from "path";
import fs from "fs";

// Define absolute path to public/temp
const uploadPath = path.join(process.cwd(), "public", "temp");

// Ensure directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // absolute and safe
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // or use Date.now() + '-' + file.originalname
  },
});

export const upload = multer({ storage });
