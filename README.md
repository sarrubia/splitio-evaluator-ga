# Split evaluator github action
GIthub action to evaluate Splits

## Inputs

### api-key
**Required** your [Split account API key](https://help.split.io/hc/en-us/articles/360019916211)

### key
**Required** the account/user key

### splits
**Required** the Splits to be evaluated. Must be a JSON representation due to Github actions inputs limitations
For instance: `["split_a","split_b"]`

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
        uses: sarrubia/split-evaluator-github-action@v0.7
        with:
          api-key: ${{ secrets.SPLIT_API_KEY }}
          key: ${{ secrets.SPLIT_EVAL_KEY }}
          splits: '["split_a", "split_b"]'

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