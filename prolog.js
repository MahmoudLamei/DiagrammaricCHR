const jquery = require("jquery");
const Pengine = require('pengines');

var pengine = new Pengine({
    oncreate: handleCreate,
    onprompt: handlePrompt,
    onoutput: handleOutput
});
console.log(pengine);
function handleCreate() {
    pengine.ask("repeat,\npengine_input(X), \npengine_output(X), \nX == stop.");
}
function handlePrompt() {
    pengine.input(prompt(this.data));
}
function handleOutput() {
    document.getElementById("out").innerHTML = this.data;
}
//browserify prolog.js -o bundle.js