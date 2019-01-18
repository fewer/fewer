const fs = require('fs');
const path = require('path');
const util = require('util');

const writeFileAsync = util.promisify(fs.writeFile);

class WatchPlugin {
  apply(jestHooks) {
    jestHooks.onTestRunComplete(results => {
      this._lastResults = results;
    });
  }

  // Get the prompt information for interactive plugins
  getUsageInfo(globalConfig) {
    return {
      key: 'e',
      prompt: 'update TypeVal error snapshots',
    };
  }

  // Executed when the key from `getUsageInfo` is input
  async run(globalConfig) {
    if (!this._lastResults || !this._lastResults.testResults.length) {
      return false;
    }

    for (const testResult of this._lastResults.testResults) {
      if (testResult.errorsSnapshot) {
        await writeFileAsync(
          path.join(
            path.dirname(testResult.testFilePath),
            path.basename(testResult.testFilePath, '.ts') + '.errors.json',
          ),
          JSON.stringify(testResult.errorsSnapshot, null, 4),
        );
      }
    }

    return true;
  }
}

module.exports = WatchPlugin;
