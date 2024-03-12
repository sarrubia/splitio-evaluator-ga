# Split Feature Flags Evaluator

This GitHub Action lets you control your GitHub Workflow steps using [Split](https://www.split.io) feature flags. A [free Split account](https://www.split.io/signup/) is all that is needed to use this GitHub Action to control your CI/CD pipelines.

## Input parameters

The input parameters of this GitHub Action:

### `api-key` (required)

Your server-side [Split SDK API key](https://help.split.io/hc/en-us/articles/360019916211-API-keys).

### `key` (required)

The account/user key. For each feature flag, Split will associate this user key with a feature flag evaluation. This association will not change once assigned (unless the feature flag targeting rule is changed).

_**Tips:**_

* _**For randomized continuous integration testing:**_

  To achieve variable feature flag results, you can use randomly-generated user keys. This allows you to randomize continuous integration testing, and control your allocation percentages using your feature flag definitions in the [Split UI](https://www.split.io).

* _**For controlled CI workflow execution paths:**_

  To split your execution path in your CI workflow in a controlled (and repeatable) way, you can consistently use the same user keys, and then specify your user keys in the feature flag's attribute-based targeting rules, by using the `Is in list` condition. This allows you to control your CI workflow using feature flags in the [Split UI](https://www.split.io).

### `feature-flags` (required)

The names of the feature flags to be evaluated. These are the names you defined when [creating the feature flags](https://help.split.io/hc/en-us/articles/9058495582349-Create-a-feature-flag).

This is a multiline parameter. For example:

```yaml
with:
  feature-flags: |
    feature_flag_a
    feature_flag_b
```

## Output

Executing this GitHub Action produces the following output:

### `result`

A JSON string representation with all evaluated results for the specified user key. For example: 
```
{"feature_flag_a":"on","feature_flag_b":"off"}
```

### `env` variables

An `env` variable will be set for each feature flag. The variable identifier is the given feature flag name and the value is the evaluated treatment result. For example:

Given the input

```yaml
on: [push]

jobs:
  split_evaluator_test:
    runs-on: ubuntu-latest
    name: A job to test the Split Feature Flag Evaluator github action
    steps:
      - name: Evaluate action step
        id: evaluator
        uses: splitio/split-evaluator-action@v1.1
        with:
          api-key: ${{ secrets.SPLIT_API_KEY }}
          key: ${{ secrets.SPLIT_EVAL_KEY }}
          feature-flags: |
            feature_flag_a
            feature_flag_b
```

The `env.feature_flag_a` and `env.feature_flag_b` variables will be instantiated. These variables can be used in subsequent workflow steps. For example:

Running a workflow step when the evaluation returned `on`

```yaml
- name: Run only when treatment ON
  if: ${{ env.feature_flag_a == 'on' }}
  run: echo "Do something great here"
```

Running a workflow step when the evaluation returned `off`

```yaml
- name: Run only when treatment OFF
  if: ${{ env.feature_flag_b == 'off' }}
  run: echo "Run something when feature_flag_b is off"
```

Running a workflow step when there was an error in evaluating a feature flag and the evaluation returned `control`

```yaml
- name: Run only when treatment control
  if: ${{ env.feature_flag_b == 'control' }}
  run: echo "Run something when feature_flag_b was not evaluated successfully"
```

## Sharing output between jobs

You may find it useful to have access to the feature flag evaluation results in a different job. To achieve this, the job must set its `outputs` and the GitHub Actions jobs dependency keyword `needs` is required in a subsequent job that will reference the outputs.

For example:

```yaml
on: [push]

jobs:
    split_evaluator:
        runs-on: ubuntu-latest
        name: A job to run the Split Feature Flags Evaluator github action
        steps:
        - name: Evaluate action step
            id: evaluator
            uses: splitio/split-evaluator-action@v1.0
            with:
            api-key: ${{ secrets.SPLIT_API_KEY }}
            key: ${{ secrets.SPLIT_EVAL_KEY }}
            feature-flags: |
                enable_paywall
                api_verbose
        # The job outputs must be set in order to share the evaluation results
        outputs:
            treatments: ${{ steps.evaluator.outputs.result }}

    another_job:
        # Set the job dependency, to ensure that the split_evaluator job
        # is executed and sets its outputs values before another_job starts.
        needs: split_evaluator
        runs-on: ubuntu-latest
        steps:
            - name: Run when paywall is enabled
              if: ${{ fromJson(needs.split_evaluator.outputs.treatments).enable_paywall == 'on' }}
              run: echo 'Paywall has been enabled'
```

Note that the `fromJson` function is required to access the output values as an object:

```console
fromJson(needs.split_evaluator.outputs.treatments).enable_paywall
```

## Controlling jobs

You can control your workflow by setting job outputs and dependencies and then enabling or disabling a dependent job based on the Split Feature Flags Evaluator action's outputs.

For example:

```yaml
on: [push]

jobs:
    split_evaluator:
        runs-on: ubuntu-latest
        name: A job to run the Split Feature Flags Evaluator github action
        steps:
        - name: Evaluate action step
            id: evaluator
            uses: splitio/split-evaluator-action@v1.0
            with:
            api-key: ${{ secrets.SPLIT_API_KEY }}
            key: ${{ secrets.SPLIT_EVAL_KEY }}
            feature-flags: |
                canary_deploy
                integration_tests_v2
        # Set the job outputs to share the feature flag evaluation results with other jobs
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

## Localhost mode

You can choose to evaluate feature flags from a file rather than from Split servers. To achieve this, the Split Feature Flags Evaluator action can be executed in localhost mode (a.k.a. off-the-grid mode). In this mode, the Split Feature Flags Evaluator neither polls nor updates Split servers. The feature flag evaluations are instead read from a local file.

To use the Split Evaluator action in localhost mode, replace the API Key with "localhost", as shown below:

```yaml
with:
  api-key: 'localhost'
```

In localhost mode, the Split Feature Flags Evaluator action loads a mapping of feature flag names to treatments (evaluation results) from the `.github/splitio/.split` file, without regard to the [`key`](#key-required) input parameter.

You need to create the `.split` file and its contents in your repository's `.github/splitio/` folder. The format of this file is two columns separated by a whitespace. The left column is the feature flag name, and the right column is the treatment value. For example:

```bash
# this is a comment

reporting_v2 on # env.reporting_v2 will evaluate to 'on'

double_writes_to_cassandra off

new-navigation v3
```

_**Important:**_ To access the `.split` file, you must run the `checkout` action (which checks out all your repo files including the `.github/splitio/.split` file) before the Split Feature Flags Evaluator action. The workflow script syntax for this is shown below:

```yaml
- name: Checkout code
  uses: actions/checkout@v2

- name: Evaluate action step
  id: evaluator
  uses: splitio/split-evaluator-action@v1.0
  with:
    api-key: 'localhost'
    key: ${{ secrets.SPLIT_EVAL_KEY }}
    feature-flags: |
      feature_flag_a
      feature_flag_b
```

## About

The Split Feature Flags Evaluator GitHub Action is built using the [Split SDK for JavaScript](https://www.npmjs.com/package/@splitsoftware/splitio).
