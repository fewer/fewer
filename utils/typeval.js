const glob = require('fast-glob');

(async () => {
    const paths = await glob(['./packages/**/__typeval__/**/*.ts']);

    console.log(paths);
})();
