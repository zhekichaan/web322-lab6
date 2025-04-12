const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const bcrypt = require("bcryptjs");

require("dotenv").config();

let userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [{ dateTime: Date, userAgent: String }],
});

let User;

const initialize = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    User = mongoose.model("users", userSchema);
  } catch (err) {
    throw err;
  }
};

const registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
      return;
    }

    try {
      const hash = bcrypt.hashSync(userData.password, 10);
      userData.password = hash;

      const newUser = new User(userData);

      newUser
        .save()
        .then(() => {
          resolve();
        })
        .catch((err) => {
          if (err.code === 11000) {
            reject("User Name already taken");
          } else {
            reject(`There was an error creating the user: ${err}`);
          }
        });
    } catch (err) {
      reject(`There was an error encrypting the password: ${err}`);
    }
  });
};

const checkUser = (userData) => {
  return new Promise(function (resolve, reject) {
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        if (users.length == 0) {
          reject(`Unable to find user: ${userData.userName}`);
        } else if (
          !bcrypt
            .compare(userData.password, users[0].password)
            .then((result) => {
              return result;
            })
        ) {
          reject(`Incorrect Password for user: ${userData.userName}`);
        } else {
          if (users[0].loginHistory.length == 8) {
            users[0].loginHistory.pop();
          }

          users[0].loginHistory.unshift({
            dateTime: new Date().toString(),
            userAgent: userData.userAgent,
          });

          User.updateOne(
            { userName: users[0].userName },
            { $set: { loginHistory: users[0].loginHistory } }
          )
            .exec()
            .then(() => {
              resolve(users[0]);
            })
            .catch((err) => {
              reject(`There was an error verifying the user: ${err}`);
            });
        }
      })
      .catch((err) => {
        reject(`Unable to find user: ${userData.userName}`);
      });
  });
};

module.exports = {
  initialize,
  registerUser,
  checkUser,
};
