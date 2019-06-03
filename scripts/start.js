// Generate umd/index.html upon packages/[pkgName]/umd when dev the block
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const write = require('write');
const chokidar = require('chokidar');
const browserSync = require('browser-sync').create();
const babelParser = require("@babel/parser");
const generate = require('@babel/generator').default;
const Prism = require('prismjs');
const prettier = require("prettier");
const signale = require('signale');
const pkgName = process.argv.slice(0).pop();
const pkgPath = path.join(__dirname, `../packages/${pkgName}`);
const jsxPath = `${pkgPath}/src/index.jsx`;
const bodyTplPath = path.join(__dirname, `../templates/body.html`);
const skeletonTplPath = `${pkgPath}/skeleton.html`;
const reload = browserSync.reload;
let unimportSDK = [];
const officalSdk = ['react', 'react-dom', 'bizcharts', '@alife/bizcharts'];
const umdMap = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'bizcharts': 'BizCharts',
  '@alife/bizcharts': 'BizCharts'
};
const compile = () => {
  unimportSDK = _.union(unimportSDK);
  const pkgJson = require(`${pkgPath}/package.json`);
  const jsCode = prettier.format(
    fs.readFileSync(jsxPath, { encoding: 'utf8' }),
    { parser: "babel" }
  );
  const bodyStr = fs.readFileSync(bodyTplPath, { encoding: 'utf8' });
  const skeletonStr = fs.readFileSync(skeletonTplPath, { encoding: 'utf8' });
  const umdCode = transformCode(jsCode);
  const compiledBodyStr = _.template(bodyStr)({
    origin_code: encodeURIComponent(jsCode),
    preview_code: Prism.highlight(jsCode, Prism.languages.javascript, 'javascript'),
    title: pkgJson.blockConfig.title,
    desc: pkgJson.description,
    categories: pkgJson.blockConfig.categories,
    warningPkgs: unimportSDK.join(', '),
    umdCode: umdCode.replace(/mountNode/g, 'document.getElementById("block-preview")')
  });
  const compiledSkeletonStr = _.template(skeletonStr)({
    body_str: compiledBodyStr,
    title: pkgJson.blockConfig.title
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
  const ast = babelParser.parse(code, {
    sourceType: "module",
    plugins: [
      "jsx"
    ]
  });
  let prefixStr = '';
  // remove `import` statement
  _.remove(ast.program.body, (node) => {
    if (node.type === 'ImportDeclaration') {
      const importPkg = node.source.value;
      if (node.specifiers.length > 1 || (node.specifiers.length === 1 && node.specifiers[0].type === 'ImportSpecifier')) {
        // import { a, b, c } from "react" => const { a, b, c } = React;
        prefixStr += `const { ${node.specifiers.map(spec => spec.imported.name).join(',')} } = ${umdMap[importPkg]}\n`;
      } else {
        // like import React from "react"
        // nothing todo
      }
      if (!officalSdk.includes(importPkg)) {
        unimportSDK.push(importPkg);
      }
      return true;
    }
  });
  var { code } = generate(ast);
  code = prefixStr + code;
  return code;
}
// generate html
compile();

// start webserver
browserSync.init({
  server: `${pkgPath}/umd/`
});

// listen for file change
const watchPath = [
  path.join(__dirname, '../templates/body.html'),
  `${pkgPath}/src/`,
  `${pkgPath}/skeleton.html`,
  `${pkgPath}/package.json`,
];
const delay = 150;
chokidar.watch(watchPath, {ignored: /node_modules/}).on('change', _.debounce(compile, delay));
