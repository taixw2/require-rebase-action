# require-rebase-action

The purpose of this action is to get team members to use rebase instead of merge whenever possible.

## Uses

```
name: 'require-rebase'
on:
  pull_request:

env:
  BASE: main # rebase branch name
  REMOTE: origin # remote name

jobs:
  checke-rebase: # make sure the action works on a clean machine without building
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout'
        uses: actions/checkout@v2

      - name: 'Fetch'
        run: |
          git fetch ${{ env.REMOTE }} ${{ env.BASE }}

      - name: 'Check Rebase'
        uses: taixw2/require-rebase-action
        with:
          base: ${{ env.BASE }}
          origin: ${{ env.REMOTE }}

```
