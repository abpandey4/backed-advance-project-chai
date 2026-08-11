import multer from "multer";

const storage = multer.diskStorage({                            // Store files in disk, multer needs to know where and how to store uploaded files
    destination: function(req, file, cb){
        cb(null, "./public/temp");                              // here files will be stored temporarily
    },
    filename: function(req, file, cb){                    
        cb(null, file.originalname)
    }
})

export const upload = multer({storage});

