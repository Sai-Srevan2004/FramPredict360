const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

exports.uploadMiddleware = upload.single('file');

exports.detectDisease = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Image file is required'
    });
  }

  const formData = new FormData();
  formData.append('file', req.file.buffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype
  });
  formData.append('crop_type', req.body.crop_type || 'Rice');

  const response = await axios.post(
    `${FASTAPI_URL}/api/disease/detect`,
    formData,
    { headers: formData.getHeaders(), timeout: 60000 }
  );

  res.json({ success: true, data: response.data });
};

exports.getSupportedCrops = async (req, res) => {
  const response = await axios.get(`${FASTAPI_URL}/api/disease/supported-crops`);
  res.json({ success: true, data: response.data });
};