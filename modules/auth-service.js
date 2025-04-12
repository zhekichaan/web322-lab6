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

let User = mongoose.model("users", userSchema);

const initialize = () => {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(process.env.MONGODB);
    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

const registerUser = (userData) => {
  return new Promise(function (resolve, reject) {
    if (userData.password == userData.password2) {
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          userData.password = hash;

          let newUser = new User(userData);

          newUser
            .save()
            .then(() => {
              resolve(); // if everything is good -> resolve
            })
            .catch((err) => {
              if (err.code == 11000) {
                reject("User Name already taken"); // if error code is 11000 -> reject (duplicate key)
              } else {
                reject(`There was an error creating the user: ${err}`); // any other error -> reject
              }
            });
        })
        .catch(() => {
          reject("There was an error encrypting the password");
        });
    } else {
      reject("Passwords do not match");
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
        } else {
          bcrypt
            .compare(userData.password, users[0].password)
            .then((result) => {
              if (!result) {
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
