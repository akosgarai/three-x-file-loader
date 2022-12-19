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

## Sample applications

You can find sample applications under the `samples` directory.

- noanimation - It loads a skinned mesh without any animation. Same example as [this](https://github.com/adrs2002/threeXfileLoader/blob/master/sample/xFileLoad_basic.html) one from the original implementation, but it uses new three (r0.147.0). The model file and the texture are the same.
