# Split evaluator github action

This github action let you control your workflows and steps using the [Split Software](https://www.split.io) Feature Flags SDK.
Only a [Split Software free account](https://www.split.io/signup/) is needed to use this Github Action to control your CI/CD pipelines!

## Inputs

### api-key

**Required** your [Split account API key](https://help.split.io/hc/en-us/articles/360019916211)

### key

**Required** the account/user key

### splits

**Required** the Splits to be evaluated. Should be a multiline string due to Github actions inputs limitations
For instance:

```yaml
with:
  splits: |
    split_a
    split_b
```

### Localhost mode

Because features start their life on one developer's machine. A developer should be able to put code behind splits on their development machine without the SDK requiring network connectivity. To achieve this, the Split SDK can be started in localhost mode (aka off-the-grid mode). In this mode, the SDK neither polls nor updates Split servers. Instead, it uses an in-memory data structure to determine what treatments to show to the logged in customer for each of the features.

To use the SDK in localhost mode, replace the API Key with "localhost", as shown in the example below:

```yaml
with:
  api-key: 'localhost'
```

In this mode, the SDK loads a mapping of split name to treatment from a file at `.github/splitio/.split`. For a given split, the treatment specified in the file is returned for every customer.

**Important:** in order to get access to read the `.split` file from your repo, you must to run the `checkout` action before to run the Split evaluation.

```yaml
- name: Checkout code
  uses: actions/checkout@v2

- name: Evaluate action step
  id: evaluator
  uses: sarrubia/splitio-evaluator-ga@v1.1
  with:
    api-key: 'localhost'
    key: ${{ secrets.SPLIT_EVAL_KEY }}
    splits: |
      split_a
      split_b
```

Here is a sample `.split` file. The format of this file is two columns separated by a whitespace. The left column is the split name, and the right column is the treatment name.

```text
# this is a comment

reporting_v2 on # sdk.getTreatment(*, reporting_v2) will return 'on'

double_writes_to_cassandra off

new-navigation v3
```

## Outputs

### `result`

This is a JSON string representation with all evaluated results, for instance: `{"split_a":"on","split_b":"off"}`

## Env vars

After runing the action you will have available in the future steps environment blocks an env var named with the value of the input parameter Splits and the treatment result as its value.
For instance, given the input:

```yaml
on: [push]

jobs:
  split_evaluator_test:
    runs-on: ubuntu-latest
    name: A job to test the Split evaluator github action
    steps:
      - name: Evaluate action step
        id: evaluator
        uses: sarrubia/splitio-evaluator-ga@v1.0
        with:
          api-key: ${{ secrets.SPLIT_API_KEY }}
          key: ${{ secrets.SPLIT_EVAL_KEY }}
          splits: |
            split_a
            split_b
```

The next env vars `env.split_a` and `env.split_b` will be available on future steps like:

Running the step when the evaluation returned `on`

```yaml
- name: Run only when treatment ON
  if: ${{ env.split_a == 'on' }}
  run: echo "Do something great here"
```

Running the step when the evaluation returned `off`

```yaml
- name: Run only when treatment OFF
  if: ${{ env.split_b == 'off' }}
  run: echo "Run something when split is Off"
```

Also if there was some error on evaluation the Split SDK will return the `control` treatment

```yaml
- name: Run only when treatment control
  if: ${{ env.split_b == 'control' }}
  run: echo "Run something when split evaluation was wrong"
```

## Sharing output between jobs

Sometimes it is useful having access to the evaluation results from a diferent job. To achieve this the job must to set up its `output` and the Github actions jobs dependency key-word `needs` is required in order to reference the output's evaluation job. The next is an example of this.

```yaml
on: [push]

jobs:
    split_evaluator:
        runs-on: ubuntu-latest
        name: A job to run the Split evaluator github action
        steps:
        - name: Evaluate action step
            id: evaluator
            uses: sarrubia/splitio-evaluator-ga@v1.0
            with:
            api-key: ${{ secrets.SPLIT_API_KEY }}
            key: ${{ secrets.SPLIT_EVAL_KEY }}
            splits: |
                enable_paywall
                api_verbose
        # The job outputs must be sets in order to share the evaluation results
        outputs:
            treatments: ${{ steps.evaluator.outputs.result }}

    another_job:
        # Job dependency. Means that before this one, the split_evaluator job
        # will be executed and set up the evaluated output
        needs: split_evaluator
        runs-on: ubuntu-latest
        steps:
            - name: Run when paywall is enabled
              if: ${{ fromJson(needs.split_evaluator.outputs.treatments).enable_paywall == 'on' }}
              run: echo 'Paywall has been enabled'
```

Note that to access the exported results the function `fromJson` is required in order to access the output values as an object.

```
fromJson(needs.split_evaluator.outputs.treatments).enable_paywall
```

### Controlling jobs

Having the job dependency and fetching the output a Github action's job can be enabled or not which gave us the capability to control workflows.

```yaml
on: [push]

jobs:
    split_evaluator:
        runs-on: ubuntu-latest
        name: A job to run the Split evaluator github action
        steps:
        - name: Evaluate action step
            id: evaluator
            uses: sarrubia/splitio-evaluator-ga@v1.0
            with:
            api-key: ${{ secrets.SPLIT_API_KEY }}
            key: ${{ secrets.SPLIT_EVAL_KEY }}
            splits: |
                canary_deploy
                integration_tests_v2
        # The job outputs must be sets in order to share the evaluation results
        outputs:
            treatments: ${{ steps.evaluator.outputs.result }}

    testing:
        needs: split_evaluator
        runs-on: ubuntu-latest
        steps:
            - name: Unit tests
              run: echo 'running unit tests...'

            - name: Integration tests
              run: echo 'running integration tests...'

            - name: Integration tests v2
              if: ${{ fromJson(needs.split_evaluator.outputs.treatments).integration_tests_v2 == 'on' }}
              run: echo 'running integration tests v2...'

    deploy_canary:
        needs: [split_evaluator, testing]
        if: ${{ fromJson(needs.split_evaluator.outputs.treatments).canary_deploy == 'on' }}
        runs-on: ubuntu-latest
        steps:
            - name: Deploy to CANARY env
              run: echo 'deploying to CANARY...'

    deploy_prod:
        needs: [split_evaluator, testing]
        runs-on: ubuntu-latest
        steps:
            - name: Deploy to PROD env
              run: echo 'deploying to PROD...'
```
