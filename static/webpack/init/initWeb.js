const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser"); //转化ast
const traverse = require("@babel/traverse").default; //遍历ast
const babel = require("@babel/core");
const getFileCode =  (entry) => {
    console.log(entry)
    let entryWrapper = entry.indexOf(".js") > 0 ? entry : `${entry}.js`
    const code = fs.readFileSync(entryWrapper, "utf8");
    const dirname = path.dirname(entryWrapper);  //获取当前文件所在的目录
    const ast = parser.parse(code, {
      sourceType: "module",
    });
    const deps = {};
    traverse(ast, {
      ImportDeclaration(p) {
        const importPath = p.get("source").node.value;
        const asbPath = "./" + path.join(dirname, importPath); //获取相对于src目录的路径
        deps[importPath] = asbPath;
      },
    });
    // 获取当前entry文件下被转化后的代码
    const { code:transCode } = babel.transformFromAst(ast, null, {
      presets: ["@babel/preset-env"],
    });
    return { entryWrapper, transCode, deps }; 
  };
  
const getCurrentCode = (entry) =>{
    const entryInfo = getFileCode(entry);  //拿到入口文件所有信息
    const allInfo = [entryInfo];
    const recurrenceDeps = (deps,modules) => {
        Object.keys(deps).forEach(key=>{
         const info = getFileCode(deps[key])
         modules.push(info);
         recurrenceDeps(info.deps,modules)
       })
    }
    recurrenceDeps(entryInfo.deps,allInfo)
    const webpack_modules = {};
    allInfo.forEach(item=>{
        webpack_modules[item.entryWrapper] = {
          deps:item.deps,
          code:item.transCode,
      }
      })
      return webpack_modules;
}


const webpack_modules = getCurrentCode("./src/main.js");
const writeFunction = `((content)=>{
  const require = (path) => {
    const getSrcPath = (p) => {
      const srcPath = content[path].deps[p];
      return require(srcPath)
    }
    const exports = {};
    ((require)=>{
      eval(content[path].code)
    })(getSrcPath)
    return exports;
  }
  require('./src/main.js')
})(${JSON.stringify(webpack_modules)})`;
fs.writeFileSync("./exs.js", writeFunction);
//   const webpack_modules = recurrenceGetCode("./src/index.js");
// const writeFunction = `((content)=>{
//   const require = (path) => {
//   	const code = content[path].code;
//     eval(code)
//   }
// })(${JSON.stringify(webpack_modules)})`;
// fs.writeFileSync("./exs.js", writeFunction);