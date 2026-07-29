const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
const employeeUploadDir = path.join(uploadDir, "employees");
const clientUploadDir = path.join(uploadDir, "clients");
const projectUploadDir = path.join(uploadDir, "projects");
const traineeUploadDir = path.join(uploadDir, "trainees");
const expenseUploadDir = path.join(uploadDir, "expenses");

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
if (!fs.existsSync(traineeUploadDir)) {
  fs.mkdirSync(traineeUploadDir, { recursive: true });
}
if (!fs.existsSync(expenseUploadDir)) {
  fs.mkdirSync(expenseUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationDir = req.baseUrl?.includes("/clients")
      ? clientUploadDir
      : req.baseUrl?.includes("/projects")
        ? projectUploadDir
        : req.baseUrl?.includes("/trainee-intern")
          ? traineeUploadDir
          : req.baseUrl?.includes("/expenses")
            ? expenseUploadDir
            : employeeUploadDir;
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
