var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }
  async intPackage() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname, // Default to current folder name
      },
      // {
      //   type: "confirm",
      //   name: "cool",
      //   message: "Would you like to enable the Cool feature?",
      // },
    ]);
    this.answers = answers;
    const pkgJson = {
      name: answers.name,
      version: "1.0.0",
      description: "学习笔记",
      main: "generators/app/index.js",
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
      keywords: [],
      author: "",
      license: "ISC",
      dependencies: {},
    };

    // Extend or create package.json file in destination path
    this.fs.extendJSON(this.destinationPath("package.json"), pkgJson);
    this.npmInstall(["vue"], { "save-dev": false });
    this.npmInstall(
      [
        "webpack",
        "webpack-cli",
        "vue-loader",
        "vue-style-loader",
        "css-loader",
        "copy-webpack-plugin",
        "@babel/core",
        "@babel/preset-env",
        "@babel/plugin-transform-react-jsx",
      ],
      {
        "save-dev": true,
      }
    );
  }

  copyFiles() {
    // console.log("answers", answers);
    this.fs.copyTpl(this.templatePath("HelloWorld.vue"), this.destinationPath("src/HelloWorld.vue"), {});
    this.fs.copyTpl(this.templatePath("webpack.config.js"), this.destinationPath("webpack.config.js"), {});
    this.fs.copyTpl(this.templatePath("main.js"), this.destinationPath("src/main.js"), {});
    this.fs.copyTpl(this.templatePath("index.html"), this.destinationPath("src/index.html"), {
      title: this.answers.name,
    });
  }
};
