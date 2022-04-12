const core = require('@actions/core');
const github = require('@actions/github');
const SplitFactory = require('@splitsoftware/splitio').SplitFactory;


try {
  // `who-to-greet` input defined in action metadata file
  const apiKey = core.getInput('api-key');
  const key = core.getInput('key');
  const splitName = core.getInput('split');
  //console.log(`Hello ${nameToGreet}!`);

  
  var factory = SplitFactory({
    core: {
      authorizationKey: apiKey
    }
  });
  var client = factory.client();


  client.on(client.Event.SDK_READY, function() {
    // The key here represents the ID of the user/account/etc you're trying to evaluate a treatment for
    var treatment = client.getTreatment(key, splitName);
    core.exportVariable(splitName, treatment);
    core.setOutput("result", JSON.stringify({splitName:treatment}));

  });

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
