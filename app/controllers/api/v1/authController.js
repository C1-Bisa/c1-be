const userService = require("../../../services/userService")
const jwt = require("jsonwebtoken")
const {JWT_SIGNATURE_KEY} = process.env;
require('dotenv').config()

// Fungsi async untuk memeriksa apakah token telah kadaluwarsa
const isTokenExpired = async(token) =>{
  try {
    const decodedToken = jwt.verify(token, JWT_SIGNATURE_KEY);
    const currentTime = Math.floor(Date.now() / 1000); // Waktu saat ini dalam detik

    if (decodedToken.exp < currentTime) {
      // Token telah kadaluwarsa
      return true;
    } else {
      // Token masih berlaku
      return false;
    }
  } catch (err) {
    // Terjadi kesalahan dalam verifikasi token
    throw new Error('Failed to verify token');
  }

}

module.exports ={

  // middleware authorization
  authorize(req,res,next) {
    try{
    // meendapatkan token 
    const bearerToken = req.headers.authorization; 
    const token = bearerToken.split("Bearer ")[1];

    const tokenPayload = jwt.verify(token,JWT_SIGNATURE_KEY);

    req.user = tokenPayload;

    next();
    }catch(err){
      console.log(err);
      res.cookie('jwt', '', { expires: new Date(0) });
      res.status(401).json({
        message: "Sesi login berakhir, harap login kembali!",
      });
    
    }
  },

  auth(req, res, next) {
    try {
      const bearerToken = req.headers.authorization;
      const token = bearerToken.split("Bearer ")[1];
      
      if (!bearerToken) {
        return res.status(401).json({
          status: 'failed',
          message: 'Required authorization',
        });
      }
      const tokenPayload = jwt.verify(token, JWT_SIGNATURE_KEY);
      Users.findByPk(tokenPayload.id).then((instance) => {
        req.user = instance;
        next();
      });
    } catch {
      res.status(401).json({
        status: 'failed',
        message: 'Invalid token',
      });
    }
  },

  authorizeAdmin(req,res,next) {
    userService
      .authorize(req.headers.authorization)
      .then((user) => {
        if(user.role === "Admin"){
          req.user = user;
        }else{
          throw new Error()
        }
        next()
      })
      .catch((err) => {
        res.status(403).json({
          message:  "You dont have permission",
        });
      });
  },

  login(req, res) {
    userService
      .login(req.body)
      .then((user) => {
        if(!user.data){
          res.status(401).json({
            status: "FAIL",
            message : user.message,
            data: null,
          });
          return;
        }
        const token = user.data.token;
        res.cookie('jwt', token, { httpOnly: true, secure: false});

        res.status(201).json({
          status: "OK",
          data: {
            id: user.data.id,
            name: user.data.name,
            email: user.data.email,
            token
          },
        });
      })
      .catch((err) => {
        res.status(422).json({
          status: "FAIL",
          message: err.message,
        });
      });
  },

  logout(req, res) {

    // Hapus token dari cookie dengan mengeset waktu kadaluarsa ke masa lalu
    res.clearCookie('jwt');
  
    // Kirim respon berhasil logout
    res.status(200).json({ 
      status : 'Ok',
      message: 'Logout berhasil' 
    });
  },

  // Middleware async untuk memeriksa token kedaluwarsa
  async checkTokenExpiration(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader.split("Bearer ")[1]) {
      return res.status(402).json({ message: 'Unauthorizeddd' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      if (isTokenExpired(token)) {
        res.cookie('jwt', '', { expires: new Date(0) });
        // Hapus token dari cookie
        return res.status(401).json({ message: 'Login session end. Please log in again.' });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

}
