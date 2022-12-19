# XFileLoader

DirectX 3D file (X file) loader for three.js.

Based on the [original](https://github.com/adrs2002/threeXfileLoader) loader and the [assimp](https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp) tool.

The file parsing implementation follows the assimp tool to be able to implement the missing features of the original loader.

## Development

It requires `npm`.

1. Clone the repository
2. Install dependencies with `npm install` command.

### Execute tests

`npm run test`

It uses jest.


### Build app

`npm run build`

It uses rollup.
