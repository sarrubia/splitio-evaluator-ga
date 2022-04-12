const core = require('@actions/core');
const github = require('@actions/github');
const SplitFactory = require('@splitsoftware/splitio').SplitFactory;


const checkInputParam = function(param, errMsg) {
    if(param == ""){
        core.setFailed(errMsg);
        throw errMsg
    }
}

try {
  // `who-to-greet` input defined in action metadata file
  const apiKey = core.getInput('api-key');
  checkInputParam(apiKey, "API Key is required")
  core.debug("api-key: " + apiKey.substring(0, 5));

  const key = core.getInput('key');
  checkInputParam(key, "User/Evaluation key is required")
  core.debug("key: " + key);

  const splitName = core.getInput('split');
  checkInputParam(splitName, "Split name is required")
  core.debug("Split: " + splitName);

  
  var factory = SplitFactory({
    core: {
      authorizationKey: apiKey
    }
  });
  var client = factory.client();

  client.on(client.Event.SDK_READY, function() {
    // The key here represents the ID of the user/account/etc you're trying to evaluate a treatment for
    var treatment = client.getTreatment(key, splitName);
    core.debug("Treatment: " + treatment)

    // Export env var
    core.exportVariable(splitName, treatment);

    // Set the step output
    core.setOutput("result", JSON.stringify({splitName:treatment}));

    client.destroy();
    client = null;
  });

} catch (error) {
  core.setFailed(error.message);
}
