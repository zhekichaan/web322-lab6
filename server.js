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

projectData.initialize();

const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const bodyParser = require("body-parser");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => res.render("home"));

app.get("/about", (req, res) => res.render("about"));

app.get("/solutions/addProject", (req, res) => {
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

app.post("/solutions/addProject", (req, res) => {
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

app.get("/solutions/editProject/:id", (req, res) => {
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

app.post("/solutions/editProject", (req, res) => {
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

app.get("/solutions/deleteProject/:id", (req, res) => {
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

app.use((req, res, next) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for",
  });
});

// listen for connections
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
