((content)=>{
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
})({"./src/main.js":{"deps":{"./a.js":"./src\\a.js","./b.js":"./src\\b.js"},"code":"\"use strict\";\n\nvar _a = _interopRequireDefault(require(\"./a.js\"));\n\nvar _b = _interopRequireDefault(require(\"./b.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nfunction a() {\n  return _a[\"default\"] + _b[\"default\"];\n}\n\nconsole.log(a());"},"./src\\a.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nvar num = 1;\nvar _default = num;\nexports[\"default\"] = _default;"},"./src\\b.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nvar num2 = 1;\nvar _default = num2;\nexports[\"default\"] = _default;"}})