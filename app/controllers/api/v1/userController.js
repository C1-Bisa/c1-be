const userService = require("../../../services/userService");

module.exports = {

  list(req, res) {
    userService
      .list()
      .then(({ data, count }) => {
        res.status(200).json({
          status: "Success",
          data: { users: data },
          meta: { total: count },
        });
      })
      .catch((err) => {
        res.status(400).json({
          status: "Failed",
          message: err.message,
        });
      });
  },

  register(req, res) {
    userService
      .create(req.body)
      .then((code) => {
        if(!code.data){
          res.status(422).json({
            status: code.status,
            message: code.message,
          });
          return;
        }

        res.status(201).json({
          status: code.status,
          message: code.message,
          data: {
            user: code.data,
            otp: code.otp
          }
        });
      })
      .catch((err) => {
        res.status(422).json({
          status: "Failed",
          message: err.message,
        });
      });
  },

  update(req, res) {
    userService
      .update(req.params.id, req.body)
      .then(() => {
        res.status(200).json({
          status: "OK",

        });
      })
      .catch((err) => {
        res.status(422).json({
          status: "FAIL",
          message: err.message,
        });
      });
  },

  async destroy(req, res) {
    try {
      await userService.delete(req.params.id);
      res.status(200).json({
        message: "User deleted successfully" 
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete user" 
      });
    }
  },


  verifikasi(req, res) {
    userService
      .check(req.body)
      .then((verify) => {
        if(!verify.data){
          res.status(422).json({
            status: verify.status,
            message: verify.message,
          });
          return;
        }

        res.status(201).json({
          subject: verify.subject,
          message: verify.message,
        });
      })
      .catch((err) => {
        res.status(422).json({
          status: "Failed",
          message: err.message,
        });
      });
  },

  resend(req, res) {
    userService
      .resendCode(req.params.id)
      .then((verify) => {
        if(!verify.data){
          res.status(422).json({
            status: verify.status,
            message: verify.message,
            data: null
          });
          return;
        }

        res.status(201).json({
          subject: verify.data.subject,
          message: verify.data.message,
          otp: verify.data.otp
        });
      })
      .catch((err) => {
        res.status(422).json({
          status: "Failed",
          message: err.message,
        });
      });
  },

  
  async checkUser (req, res, next) {
    try {
      const id = req.params.id;
      const userPayload = await userService.get(id);
  
      if (!userPayload) {
        res.status(404).json({
          status: "FAIL",
          message: `user not found!`,
        });
        return;
      }
  
      req.user = userPayload;

      next();
    } catch (err) {
      res.status(500).json({
        status: "FAIL",
        message: "server error!",
      });
    }
  },
  
};
