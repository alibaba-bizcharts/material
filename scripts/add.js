const inquirer = require('inquirer');
const signale = require('signale');
const spawn = require('cross-spawn');
const path = require('path');
const pathExists = require('path-exists');
const jsonfile = require('jsonfile');

inquirer
  .prompt([{
    type: "input",
    name: "name",
    message: "Npm package name",
  }, {
    type: "input",
    name: "title",
    message: "Please write the title",
  }, {
    type: "input",
    name: "description",
    message: "Please write the describption",
  }, {
    type: "input",
    name: "categories",
    message: "Please write the categories(use space to split)",
  }])
  .then(async (answers) => {
    const { name: packageName, title, description, categories } = answers;
    const writePath = path.join(__dirname, `../packages/${packageName}`);
    const isExist = await pathExists(writePath);
    // check exist
    if (isExist) {
      signale.error(`${packageName} already exist upon packages/`);
      return;
    };
    const result = spawn.sync('cp', [
      '-R',
      path.join(__dirname, '../scaffold'),
      writePath
    ], { stdio: 'inherit' });
    // modify block package.json
    const pgkJsonPath = path.join(__dirname, `../packages/${packageName}/package.json`);
    const pkgJson = jsonfile.readFileSync(pgkJsonPath);
    pkgJson.name = `@bizcharts/${packageName}`;
    pkgJson.description = description;
    pkgJson.blockConfig.title = pkgJson.title = title;
    pkgJson.blockConfig.name = pkgJson.name;
    pkgJson.blockConfig.categories = pkgJson.blockConfig.categories.concat(categories.split(' '));
    pkgJson.scripts.start = `node ../../scripts/start.js ${packageName}`;
    jsonfile.writeFileSync(pgkJsonPath, pkgJson, { spaces: 2, EOL: '\r\n' });
    signale.success(`add ${packageName} upon packages/`);
  });