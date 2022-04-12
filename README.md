# Split evaluator github action
GIthub action to evaluate Splits

## Inputs

### api-key
**Required** your account Split API key

### key
**Required** the evaluation/user key

### split
**Required** the Split to be evaluated

## Outputs

### `result`

This is a JSON string representation following the pattern: `{"splitName":"treatment"}`

## Env vars

After runing the action you will have available in the future steps environment blocks an env var named with the value of the input parameter Split and the treatment result as its value.
 