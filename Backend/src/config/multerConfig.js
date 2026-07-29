const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
const employeeUploadDir = path.join(uploadDir, "employees");
const clientUploadDir = path.join(uploadDir, "clients");
const projectUploadDir = path.join(uploadDir, "projects");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(employeeUploadDir)) {
  fs.mkdirSync(employeeUploadDir, { recursive: true });
}
if (!fs.existsSync(clientUploadDir)) {
  fs.mkdirSync(clientUploadDir, { recursive: true });
}
if (!fs.existsSync(projectUploadDir)) {
  fs.mkdirSync(projectUploadDir, { recursive: true });
}

const projectImagesDir = path.join(projectUploadDir, "images");
const projectImagesZipDir = path.join(projectUploadDir, "ProjectImageZip");
const projectSourceBackupDir = path.join(projectUploadDir, "source_code_backup");

if (!fs.existsSync(projectImagesDir)) {
  fs.mkdirSync(projectImagesDir, { recursive: true });
}
if (!fs.existsSync(projectImagesZipDir)) {
  fs.mkdirSync(projectImagesZipDir, { recursive: true });
}
if (!fs.existsSync(projectSourceBackupDir)) {
  fs.mkdirSync(projectSourceBackupDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destinationDir;

    if (req.baseUrl?.includes("/clients")) {
      destinationDir = clientUploadDir;
    } else if (req.baseUrl?.includes("/projects")) {
      if (file.fieldname === 'project_images' && path.extname(file.originalname).toLowerCase() === '.zip') {
        destinationDir = projectImagesZipDir;
      } else if (file.fieldname === 'project_images') {
        destinationDir = projectImagesDir;
      } else if (file.fieldname === 'source_code_backup') {
        destinationDir = projectSourceBackupDir;
      } else {
        destinationDir = projectUploadDir;
      }
    } else {
      destinationDir = employeeUploadDir;
    }

    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    cb(null, destinationDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for ZIP and large assets
  fileFilter: (req, file, cb) => {
    // allow images and documents
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "application/x-zip-compressed",
      "application/x-rar-compressed",
      "application/vnd.rar",
    ];
    const isAllowed = allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx|txt|xls|xlsx|ppt|pptx|zip|rar)$/i);
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC/DOCX, images, text, spreadsheets, presentations, and ZIP/RAR files are allowed."));
    }
  },
});

module.exports = { upload };
