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

- [`sample/noanimation`](./sample/noanimation/noanimation.html) - It loads a skinned mesh without any animation. Same example as [this](https://github.com/adrs2002/threeXfileLoader/blob/master/sample/xFileLoad_basic.html) one from the original implementation, but it uses new three (r0.147.0). The model file and the texture are the same.
- [`sample/withanimation`](./sample/withanimation/withanimation.html) - It loads a skinned mesh without animation, then it loads a standing animation and plays it. There is a ui panel where further animations could be selected. Same example as [this](https://github.com/adrs2002/threeXfileLoader/blob/master/sample/xFileLoaderSample.html) one from the original implementation, but it uses the same new three version. The model, the texture and the animation files are the same.
- [`sample/mql`](./sample/mqx/truck.html) - It loads a mesh without any animation. Same example as [this](https://github.com/adrs2002/threeXfileLoader/blob/master/sample/xFileLoad_mqx.html) one from the original implementation, but it uses new three (r0.147.0). The model file and the texture are the same.
- [`sample/multiplemeshes`](./sample/multiplemeshes/multiple.html) - It loads a skinned mesh without animation then sets the position of this mesh and adds it to the screen. A duplication of this mesh is also added to the screen but to a different position. Then it loads the standing animation and plays for both mesh. There is a ui panel where further animations could be selected for each mesh. This application is based on [this](https://github.com/adrs2002/threeXfileLoader/blob/master/sample/xFileLoad_copyAnimation.html) one from the original implementation, but it uses the same new three version. The mode, the texture and the animation fales are the same.
