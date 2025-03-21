const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");
// importing data files

let projects = []; // creating empty array for data

const initialize = () => {
  return new Promise((resolve, reject) => {
    projectData.map((project) => {
      // map through each proeject in projectData
      project.sector = sectorData.find(
        (element) => element.id == project.sector_id // look for a sector with the same id as sector_id in project
      ).sector_name;
      projects.push(project); // push to the array
    });
    resolve(); // resolve with no data
  });
};

const getAllProjects = () => {
  return new Promise((resolve, reject) => {
    resolve(projects); // resolve with all projects
  });
};

const getProjectById = (projectID) => {
  const result = projects.find((project) => project.id == projectID); // look for one project with projectID

  return new Promise((resolve, reject) => {
    if (result) resolve(result);
    else reject(`Unable to find a project with id: ${projectID}.`);
  });
};

const getProjectsBySector = (sector) => {
  const result = projects.filter(
    (project) => project.sector.toLowerCase().includes(sector.toLowerCase()) // look for projects that include sector
  );

  return new Promise((resolve, reject) => {
    if (result.length > 0)
      resolve(result); // if 1 or more found resolve with result
    else reject(`Unable to find a project with sector: ${sector}.`);
  });
};

// export functions
module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
};
