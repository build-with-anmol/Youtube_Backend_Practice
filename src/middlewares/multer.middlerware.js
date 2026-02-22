import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // where to save the file public folder
  },

  filename: function (req, file, cb) { 
    
    cb(null, Date.now() + path.extname(file.originalname));  // using this we can change the name of the file
  },
});

export const upload = multer({ storage: storage });
