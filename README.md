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
