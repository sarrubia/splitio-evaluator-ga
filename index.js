const core = require('@actions/core');
const SplitFactory = require('@splitsoftware/splitio').SplitFactory;

const checkInputParam = function (param, errMsg) {
  if (param == '') {
    core.setFailed(errMsg);
    throw errMsg;
  }
};

try {
  // `who-to-greet` input defined in action metadata file
  const apiKey = core.getInput('api-key');
  checkInputParam(apiKey, 'API Key is required');
  core.debug('api-key: ' + apiKey.substring(0, 5) + '...');

  const key = core.getInput('key');
  checkInputParam(key, 'User/Evaluation key is required');
  core.debug('key: ' + key);

  const splits = core.getMultilineInput('splits');
  core.debug('Splits: ' + splits);

  var factory = SplitFactory({
    core: {
      authorizationKey: apiKey,
    },
  });
  var client = factory.client();

  client.on(client.Event.SDK_READY, function () {
    var result = client.getTreatments(key, splits);

    for (const splitName in result) {
      if (Object.hasOwnProperty.call(result, splitName)) {
        const treatment = result[splitName];
        // Export env var
        core.exportVariable(splitName, treatment);
      }
    }

    // Set the step output
    core.setOutput('result', JSON.stringify(result));

    client.destroy();
    client = null;
  });
} catch (error) {
  core.setFailed(error.message);
}
