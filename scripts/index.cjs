const jiti = require('jiti')(__filename);

const file = process.argv[2];
const argument = process.argv[3] ? eval('(' + process.argv[3] + ')') : {};

jiti(`./src/${file}.ts`).default(argument);
