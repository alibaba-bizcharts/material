// Generate umd/index.html upon packages/[pkgName]/umd when dev the block
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const write = require('write');
const chokidar = require('chokidar');
const browserSync = require('browser-sync').create();
const babelParser = require("@babel/parser");
const babelCore = require("@babel/core");
const generate = require('@babel/generator').default;
const Prism = require('prismjs');
const prettier = require("prettier");
const signale = require('signale');
const pkgName = process.argv.slice(0).pop();
const pkgPath = path.join(__dirname, `../packages/${pkgName}`);
const jsxPath = `${pkgPath}/src/index.jsx`;
const bodyTplPath = path.join(__dirname, `../templates/body.html`);
const styleTplPath = path.join(__dirname, `../templates/style.css`);
const skeletonTplPath = `${pkgPath}/skeleton.html`;
const reload = browserSync.reload;
const compile = () => {
  const pkgJson = require(`${pkgPath}/package.json`);
  const jsCode = prettier.format(
    fs.readFileSync(jsxPath, { encoding: 'utf8' }),
    { parser: "babel" }
  );
  const bodyStr = fs.readFileSync(bodyTplPath, { encoding: 'utf8' });
  const styleStr = fs.readFileSync(styleTplPath, { encoding: 'utf8' });
  const skeletonStr = fs.readFileSync(skeletonTplPath, { encoding: 'utf8' });
  const umdCode = transformCode(jsCode);
  const compiledBodyStr = _.template(bodyStr)({
    origin_code: encodeURIComponent(jsCode),
    preview_code: Prism.highlight(jsCode, Prism.languages.javascript, 'javascript'),
    style: styleStr,
    title: pkgJson.blockConfig.title,
    desc: pkgJson.description,
    categories: pkgJson.blockConfig.categories,
  });
  const compiledSkeletonStr = _.template(skeletonStr)({
    body_str: compiledBodyStr,
    title: pkgJson.blockConfig.title,
    umdCode: umdCode.replace(/mountNode/g, 'document.getElementById("block-preview")')
  });
  write.sync(
    `${pkgPath}/umd/index.html`,
    compiledSkeletonStr
  );
  reload();
}
/**
 * transform esm code to umd style
 * @param {String} code origin code
 */
const transformCode = (code) => {
  const { code: umdCode} = babelCore.transform(code, {
    presets: ["@babel/preset-env", "@babel/preset-react"],
    plugins: [
      ["@babel/plugin-transform-modules-umd", {
        "globals": {
          "bizcharts": "BizCharts",
          "react": "React",
          "react-dom": "ReactDOM",
          "_": "lodash",
          "numeral": "numeral",
        }
      }]
    ]
  });
  return umdCode;
}
// generate html
compile();

// start webserver
browserSync.init({
  server: `${pkgPath}/umd/`
});

// listen for file change
const watchPath = [
  path.join(__dirname, '../templates/'),
  `${pkgPath}/src/`,
  `${pkgPath}/skeleton.html`,
  `${pkgPath}/package.json`,
];
const delay = 150;
chokidar.watch(watchPath, {ignored: /node_modules/}).on('change', _.debounce(compile, delay));
