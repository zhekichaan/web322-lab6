/********************************************************************************
 * WEB322 – Assignment 04
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Yevhen Chernytskyi Student ID: 166613232 Date: Mon Mar 10
 *
 ********************************************************************************/

const projectData = require("./modules/projects"); // import functions

projectData.initialize(); // initialize object

const express = require("express"); // import express package
const app = express(); // create express application
const port = 3000; // set port to 3000
const path = require("path");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));

app.get("/about", (req, res) => res.render("about"));

app.get("/solutions/projects", (req, res) => {
  if (req.query.sector) {
    // if query has a sector parameter, look for projects with this sector
    projectData
      .getProjectsBySector(req.query.sector)
      .then((data) => {
        res.render("projects", { projects: data });
      })
      .catch((reason) => {
        res.status(404).render("404", {
          message: `No projects found for sector: ${req.query.sector}`,
        });
      });
  } else {
    // if not, just show all projects
    projectData.getAllProjects().then((data) => {
      res.render("projects", { projects: data }); // send data of all projects
    });
  }
});

app.get("/solutions/projects/:sectorId", (req, res) => {
  projectData
    .getProjectById(req.params.sectorId) // using sector ID from parameters
    .then((data) => {
      res.render("project", { project: data });
    })
    .catch((reason) => {
      res.status(404).render("404", {
        message: `Unable to find requested project.`,
      });
    });
});

app.use((req, res, next) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for",
  }); // middleware for any other routes
});

// listen for connections
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
