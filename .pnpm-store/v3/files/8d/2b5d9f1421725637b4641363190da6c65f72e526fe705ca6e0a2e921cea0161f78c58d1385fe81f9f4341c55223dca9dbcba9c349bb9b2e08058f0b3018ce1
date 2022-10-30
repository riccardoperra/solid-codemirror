var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => withSolid
});
var import_typescript = __toESM(require("typescript"));
var import_fs = require("fs");
var c = __toESM(require("colorette"));
var import_rollup_plugin_terser = require("rollup-plugin-terser");
var import_path = require("path");
var import_merge_anything = require("merge-anything");
var import_plugin_node_resolve = require("@rollup/plugin-node-resolve");
var import_plugin_babel = require("@rollup/plugin-babel");
function findClosestPackageJson(start = process.cwd(), level = 0) {
  try {
    const path = (0, import_path.resolve)(start, "package.json");
    return require(path);
  } catch {
    return level >= 10 ? {} : findClosestPackageJson((0, import_path.dirname)(start), level + 1);
  }
}
function processOptions(options, asSubPackage = true) {
  const {
    targets: buildTargets,
    writePackageJson,
    printInstructions,
    babelOptions,
    solidOptions,
    mappingName,
    ...rollupOptions
  } = options;
  const currentDir = process.cwd();
  const targets = buildTargets || ["esm"];
  const pkg = findClosestPackageJson(currentDir);
  const extensions = [".js", ".ts", ".jsx", ".tsx"];
  const src = options.input || pkg.source;
  if (!src) {
    throw new Error('No input was provided. Please provide an input via the "input" option or via "source" in the package.json');
  }
  const { name: srcName } = (0, import_path.parse)(src);
  const name = mappingName || srcName;
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ];
  const babelTargets = pkg.browserslist || "last 2 years";
  if (!src) {
    throw new Error("No input source found. You can add it to the `source` property in your `package.json` or feed it into the `input` option in the `withConfig` function.");
  }
  const outputs = [
    {
      format: "cjs",
      file: asSubPackage ? (0, import_path.resolve)(`dist/${name}/index.common.js`) : void 0,
      dir: asSubPackage ? void 0 : (0, import_path.resolve)("dist/cjs"),
      sourcemap: true
    },
    {
      format: "esm",
      file: asSubPackage ? (0, import_path.resolve)(`dist/${name}/index.module.js`) : void 0,
      dir: asSubPackage ? void 0 : (0, import_path.resolve)("dist/esm"),
      sourcemap: true
    },
    {
      name,
      format: "umd",
      file: asSubPackage ? (0, import_path.resolve)(`dist/${name}/index.umd.js`) : void 0,
      dir: asSubPackage ? void 0 : (0, import_path.resolve)("dist/umd"),
      sourcemap: true,
      plugins: [(0, import_rollup_plugin_terser.terser)()]
    }
  ];
  const output = rollupOptions.output || outputs.filter(({ format }) => targets.includes(format));
  const defaultOptions = {
    input: (0, import_path.resolve)(src),
    external: ["solid-js", "solid-js/web", "solid-js/store", ...external],
    output,
    plugins: [
      (0, import_plugin_babel.babel)({
        extensions,
        babelHelpers: "bundled",
        presets: [
          ["babel-preset-solid", solidOptions || {}],
          "@babel/preset-typescript",
          ["@babel/preset-env", { bugfixes: true, targets: babelTargets }]
        ],
        ...babelOptions
      }),
      (0, import_plugin_node_resolve.nodeResolve)({ extensions }),
      {
        name: "ts",
        buildEnd() {
          const program = import_typescript.default.createProgram([(0, import_path.resolve)(src)], {
            target: import_typescript.default.ScriptTarget.ESNext,
            module: import_typescript.default.ModuleKind.ESNext,
            moduleResolution: import_typescript.default.ModuleResolutionKind.NodeJs,
            jsx: import_typescript.default.JsxEmit.Preserve,
            jsxImportSource: "solid-js",
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            outDir: asSubPackage ? `dist/${name}` : `dist/source`,
            declarationDir: asSubPackage ? `dist/${name}` : `dist/types`,
            declaration: true,
            allowJs: true
          });
          program.emit();
        }
      },
      {
        name: "instructions",
        buildEnd() {
          if (!printInstructions)
            return;
          const example = {
            files: ["dist"],
            main: asSubPackage ? `dist/${name}/index.common.js` : `dist/cjs/${name}.js`,
            module: asSubPackage ? `dist/${name}/index.module.js` : `dist/esm/${name}.js`,
            types: asSubPackage ? `dist/${name}/${name}.d.ts` : `dist/types/${name}.d.ts`,
            exports: {
              ".": {
                solid: asSubPackage ? `./dist/${name}/${name}.jsx` : `./dist/source/${name}.jsx`,
                import: asSubPackage ? `./dist/${name}/index.module.js` : `./dist/esm/${name}.js`,
                browser: asSubPackage ? `./dist/${name}/index.umd.js` : `./dist/umd/${name}.js`,
                require: asSubPackage ? `./dist/${name}/index.common.js` : `./dist/cjs/${name}.js`,
                node: asSubPackage ? `./dist/${name}/index.common.js` : `./dist/cjs/${name}.js`
              }
            }
          };
          const hasFormat = (formats) => {
            return Array.isArray(output) ? output.find(({ format }) => formats.includes(format)) : formats.includes(output.format);
          };
          if (!hasFormat(["cjs", "commonjs"])) {
            example.main = example.module;
            example.exports["."].require = example.exports["."].import;
            example.exports["."].node = example.exports["."].import;
          }
          if (!hasFormat(["umd"])) {
            example.exports["."].browser = example.exports["."].import;
          }
          console.log();
          console.log(c.cyan(c.bold("Example config for your `package.json`:")));
          console.log();
          console.log(c.green(JSON.stringify(example, null, 2)));
          console.log();
        }
      },
      {
        name: "generate",
        buildEnd() {
          if (!writePackageJson)
            return;
          const build = {
            main: `index.common.js`,
            module: `index.module.js`,
            types: `${name}.d.ts`,
            exports: {
              ".": {
                solid: `./${name}.jsx`,
                import: `./index.module.js`,
                browser: `./index.umd.js`,
                require: `./index.common.js`,
                node: `./index.common.js`
              }
            }
          };
          (0, import_fs.writeFileSync)((0, import_path.resolve)(currentDir, "dist", name, "package.json"), JSON.stringify(build, null, 2), { encoding: "utf8" });
        }
      }
    ]
  };
  return (0, import_merge_anything.mergeAndConcat)(rollupOptions, defaultOptions);
}
function withSolid(options = {}) {
  (0, import_fs.rmSync)((0, import_path.resolve)(process.cwd(), "dist"), {
    force: true,
    recursive: true
  });
  return Array.isArray(options) ? options.map((option) => processOptions(option, true)) : processOptions(options, false);
}
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=index.js.map
