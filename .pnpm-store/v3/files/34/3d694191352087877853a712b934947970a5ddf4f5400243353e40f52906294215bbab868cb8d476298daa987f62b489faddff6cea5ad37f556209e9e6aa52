var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// src/index.ts
import ts from "typescript";
import { writeFileSync, rmSync } from "fs";
import * as c from "colorette";
import { terser } from "rollup-plugin-terser";
import { resolve, dirname, parse } from "path";
import { mergeAndConcat } from "merge-anything";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
function findClosestPackageJson(start = process.cwd(), level = 0) {
  try {
    const path = resolve(start, "package.json");
    return __require(path);
  } catch {
    return level >= 10 ? {} : findClosestPackageJson(dirname(start), level + 1);
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
  const { name: srcName } = parse(src);
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
      file: asSubPackage ? resolve(`dist/${name}/index.common.js`) : void 0,
      dir: asSubPackage ? void 0 : resolve("dist/cjs"),
      sourcemap: true
    },
    {
      format: "esm",
      file: asSubPackage ? resolve(`dist/${name}/index.module.js`) : void 0,
      dir: asSubPackage ? void 0 : resolve("dist/esm"),
      sourcemap: true
    },
    {
      name,
      format: "umd",
      file: asSubPackage ? resolve(`dist/${name}/index.umd.js`) : void 0,
      dir: asSubPackage ? void 0 : resolve("dist/umd"),
      sourcemap: true,
      plugins: [terser()]
    }
  ];
  const output = rollupOptions.output || outputs.filter(({ format }) => targets.includes(format));
  const defaultOptions = {
    input: resolve(src),
    external: ["solid-js", "solid-js/web", "solid-js/store", ...external],
    output,
    plugins: [
      babel({
        extensions,
        babelHelpers: "bundled",
        presets: [
          ["babel-preset-solid", solidOptions || {}],
          "@babel/preset-typescript",
          ["@babel/preset-env", { bugfixes: true, targets: babelTargets }]
        ],
        ...babelOptions
      }),
      nodeResolve({ extensions }),
      {
        name: "ts",
        buildEnd() {
          const program = ts.createProgram([resolve(src)], {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            jsx: ts.JsxEmit.Preserve,
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
          writeFileSync(resolve(currentDir, "dist", name, "package.json"), JSON.stringify(build, null, 2), { encoding: "utf8" });
        }
      }
    ]
  };
  return mergeAndConcat(rollupOptions, defaultOptions);
}
function withSolid(options = {}) {
  rmSync(resolve(process.cwd(), "dist"), {
    force: true,
    recursive: true
  });
  return Array.isArray(options) ? options.map((option) => processOptions(option, true)) : processOptions(options, false);
}
export {
  withSolid as default
};
//# sourceMappingURL=index.js.map
