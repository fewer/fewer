'use strict';

/**
 * Do NOT allow using `npm` as package manager.
 */
if (process.env.npm_execpath.indexOf('yarn') === -1) {
  console.error(`
                        !! WARNING!!

    Please use Yarn to install dependencies instead of NPM.

    ${'To install please run $ yarn or $ yarn install'}
  `);
  process.exit(1);
}
