require("dotenv").config();

require("pg");
const Sequelize = require("sequelize");

// set up sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.PG_CONNECTION_STRING, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Allows self-signed certificates
    },
  },
});

const Sector = sequelize.define(
  "Sector",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true, // use "project_id" as a primary key
      autoIncrement: true, // automatically increment the value
    },
    sector_name: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true, // use "project_id" as a primary key
      autoIncrement: true, // automatically increment the value
    },
    title: Sequelize.STRING,
    feature_img_url: Sequelize.STRING,
    summary_short: Sequelize.TEXT,
    intro_short: Sequelize.TEXT,
    impact: Sequelize.TEXT,
    original_source_url: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

Project.belongsTo(Sector, { foreignKey: "sector_id" });

const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getAllProjects = () => {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getProjectById = (projectID) => {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: {
        id: projectID,
      },
    })
      .then((data) => {
        resolve(data[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getProjectsBySector = (sector) => {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: {
        "$Sector.sector_name$": {
          [Sequelize.Op.iLike]: `%${sector}%`,
        },
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(`Unable to find a project with sector: ${sector}.`);
      });
  });
};

const addProject = (projectData) => {
  return new Promise((resolve, reject) => {
    Project.create(projectData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getAllSectors = () => {
  return new Promise((resolve, reject) => {
    Sector.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// export functions
module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  addProject,
  getAllSectors,
};
