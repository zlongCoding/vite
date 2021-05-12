const Koa = require("koa");
const fs = require("fs");
const path = require("path");
const compilerSfc = require("@vue/compiler-sfc");
const compilerDom = require("@vue/compiler-dom");
require("./main/serve")
const wss = require("./main/serve")()
// console.log(wss.send)
const WriteSocket = require("./main/constance/socket")
wss.on('connection', function connection(socket) {
    socket.on('message', function incoming(message) {
      console.log('received: %s', message);
    });
  
    socket.send('something');
    chokidar.watch('./src', {
        ignored: ['**/node_modules/**', '**/.git/**'],
        ignoreInitial: true,
        ignorePermissionErrors: true,
        disableGlobbing: true,
      }).on('all', (event, path) => {
        console.log(event, path);

        socket.send(JSON.stringify({
            type: event,
            path:path
        }))
    });
  });

// wss.on('message', (message) => {
//     console.log(message) // Hello
  // const serve = require('koa-static');

const chokidar = require('chokidar');


const koaBody = require("koa-body")({
  multipart: true,
});
const app = new Koa();
app.use(koaBody);
// app.use(serve(path.join(__dirname, './static')))

function rewriteImport(content) {
  return content.replace(/ from ['|"]([^'"]+)['|"]/g, function (s0, s1) {
    if (s1.startsWith("./") || s1.startsWith("/") || s1.startsWith("../")) {
      return s0;
    } else {
      return ` from '/@modules/${s1}'`;
    }
  });
}
function type (file, ext) {
    return ext !== '' ? path.extname(path.basename(file, ext)) : path.extname(file)
  }

function getReqParam(name, variable) {
    var query = name.split("?")[1];
    if(!query) return ''
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return "";
}

app.use(async (ctx) => {
  const url = ctx.request.url;
  if (url === "/") {
    ctx.type = "text/html";
    const content = fs.readFileSync("./index.html", "utf-8").replace(
      '<script type="module" src="/src/main.js"></script>',
      `
        <script>
          window.process = {env:{NODE_ENV:'dev'}}
          ${WriteSocket}
        </script>
        <script type="module" src="/src/main.js"></script>
      `
    );
    ctx.body = content;
  } else if (url.indexOf(".vue") > -1) {
    const type = getReqParam(url, "type");
    let vuePath = path.join(__dirname, url.split("?")[0]);
    const ret = compilerSfc.parse(fs.readFileSync(vuePath, "utf-8"));
    console.log(type, "=============type")
    if (!type) {
      

      const scriptContent = ret.descriptor.script.content;
      const script = scriptContent.replace(
        "export default ",
        "const __script = "
      );
      // 返回App.vue解析结果
      ctx.type = "text/javascript";
      ctx.body = `
          ${rewriteImport(script)}
          import { render as __render } from '${url}?type=template'
          __script.render = __render
          export default __script
        `;
    } else if (type === "template") {
      // 模板内容
      const template = ret.descriptor.template.content;
      // 编译为render
      const render = compilerDom.compile(template, { mode: "module" }).code;
      ctx.type = "text/javascript";
      ctx.body = rewriteImport(render);
    }
  } else if (url.startsWith("/@modules")) {
    const moduleName = url.replace("/@modules/", "");
    const prefix = path.join(__dirname, "./node_modules", moduleName);
    const module = require(prefix + "/package.json").module;
    const filePath = path.join(prefix, module);
    const ret = fs.readFileSync(filePath, "utf8");
    ctx.type = "text/javascript";
    ctx.body = rewriteImport(ret);
  } else if (url.endsWith(".js")) {
    const p = path.join(__dirname, url);
    ctx.type = "text/javascript";
    ctx.body = rewriteImport(fs.readFileSync(p, "utf-8"));
  } else if (url.endsWith(".css")) {
    const p = path.join(__dirname, url);
    ctx.type = "text/css";
    ctx.body = fs.readFileSync(p, "utf-8");
  } 
  else if (url.startsWith("/static")) {
      const staticPath = path.join(__dirname, url)
    ctx.type = type(staticPath, "")
    ctx.body = fs.createReadStream(path.join(__dirname, url))
    // ctx.body = fs.readFileSync(staticPath,  "utf-8");
    return path
  }
});

app.listen(3001, () => {
  console.log("kvite start");
});
