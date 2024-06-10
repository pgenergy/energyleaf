const jiti = require("jiti")(__filename);

const file = process.argv[2];
const action = process.argv[3];
const args = process.argv.slice(4);

jiti(`./${file}.ts`)[action](args);
