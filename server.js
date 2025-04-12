/********************************************************************************
 * WEB322 – Assignment 05
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Yevhen Chernytskyi Student ID: 166613232 Date: Mon Mar 24
 *
 ********************************************************************************/

const projectData = require("./modules/projects");
const authData = require("./modules/auth-service"); // import user auth module

const clientSessions = require("client-sessions");

const express = require("express");
const app = express();
const port = 3000;
// const path = require("path");
const bodyParser = require("body-parser");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "o6LjQ5EVNC28ZgK64hDELM18ScpFQr", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const ensureLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.get("/", (req, res) => res.render("home"));

app.get("/about", (req, res) => res.render("about"));

app.get("/solutions/projects", (req, res) => {
  if (req.query.sector) {
    projectData
      .getProjectsBySector(req.query.sector)
      .then((data) => {
        res.render("projects", { projects: data });
      })
      .catch((err) => {
        res.status(404).render("404", {
          message: err,
        });
      });
  } else {
    projectData.getAllProjects().then((data) => {
      res.render("projects", { projects: data });
    });
  }
});

app.get("/solutions/projects/:projectID", (req, res) => {
  projectData
    .getProjectById(req.params.projectID)
    .then((data) => {
      res.render("project", { project: data });
    })
    .catch((err) => {
      res.status(404).render("404", {
        message: err,
      });
    });
});

app.get("/solutions/addProject", ensureLogin, (req, res) => {
  projectData
    .getAllSectors()
    .then((sectorData) => {
      res.render("addProject", { sectors: sectorData });
    })
    .catch((err) => {
      res.status(404).render("404", {
        message: err,
      });
    });
});

app.post("/solutions/addProject", ensureLogin, (req, res) => {
  projectData
    .addProject(req.body)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: err,
      });
    });
});

app.get("/solutions/editProject/:id", ensureLogin, (req, res) => {
  projectData
    .getAllSectors()
    .then((sectorData) => {
      projectData
        .getProjectById(req.params.id)
        .then((projectData) => {
          res.render("editProject", {
            sectors: sectorData,
            project: projectData,
          });
        })
        .catch((err) => {
          res.status(404).render("404", {
            message: err,
          });
        });
    })
    .catch((err) => {
      res.status(404).render("404", {
        message: err,
      });
    });
});

app.post("/solutions/editProject", ensureLogin, (req, res) => {
  projectData
    .editProject(req.body)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: err,
      });
    });
});

app.get("/solutions/deleteProject/:id", ensureLogin, (req, res) => {
  projectData
    .deleteProject(req.params.id)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: err,
      });
    });
});

app.get("/login", (req, res) => {
  res.render("login", {
    errorMessage: "",
    userName: "",
  });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/register", (req, res) => {
  res.render("register", {
    errorMessage: "",
    successMessage: "",
    userName: "",
  });
});

app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", {
        errorMessage: "",
        successMessage: "User created",
        userName: "",
      });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        successMessage: "",
        userName: req.body.userName,
      });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();

  res.render("home");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

app.use((req, res, next) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for",
  });
});

// listen for connections
projectData
  .initialize()
  .then(authData.initialize)
  .then(function () {
    app.listen(port, function () {
      console.log(`app listening on: ${port}`);
    });
  })
  .catch(function (err) {
    console.log(`unable to start server: ${err}`);
  });
