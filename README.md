# material-blocks

This repository used to store bizcharts blcok material.

> block is an kind of react component, that used by classic scenes in our daily develop.

## How to create new block

```bash
npm run add
```

This command will generate an new directory upon *packages* dir which contains a lots of file that needed by block.

## How to develop block

```
cd packages/[block]

npm start
```

## How to build block asset

```
cd packages/[block]

npm build
```

## How to add tag to block

- manually: modify block's package.json file **blockConfig.categories** field.
- automatic: When you publish block first time, you will be asked to fill the categories field.

## Note

Once the Merge request accepted by the maintainer, the new block will be compiled, and then show in the [block gallery area](bizcharts.net).