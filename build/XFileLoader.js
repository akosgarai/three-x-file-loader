(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.THREE = global.THREE || {}, global.THREE.XFileLoader = factory()));
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }

  var HeaderLineParser = /*#__PURE__*/function () {
    function HeaderLineParser(line) {
      _classCallCheck(this, HeaderLineParser);
      this._parseHeaderLine(line);
    }

    /*
     * Format example: 'xof 0303txt 0032'
     **/
    _createClass(HeaderLineParser, [{
      key: "_parseHeaderLine",
      value: function _parseHeaderLine(headerLine) {
        if (typeof headerLine !== 'string') {
          throw 'Line is not string.';
        }
        if (!headerLine.startsWith('xof ')) {
          throw 'Header mismatch, file is not an XFile.';
        }
        this._fileMajorVersion = headerLine[4] + '' + headerLine[5];
        this._fileMinorVersion = headerLine[6] + '' + headerLine[7];
        this._fileFormat = headerLine.substring(8, 12);
        switch (this._fileFormat) {
          case 'txt ':
            this._fileCompressed = false;
            this._fileBinary = false;
            break;
          case 'bin ':
            this._fileCompressed = false;
            this._fileBinary = true;
            break;
          case 'tzip':
            this._fileCompressed = true;
            this._fileBinary = false;
            break;
          case 'bzip':
            this._fileCompressed = true;
            this._fileBinary = true;
            break;
          default:
            throw 'Unsupported x-file format: ' + this._fileFormat;
        }
      }
    }]);
    return HeaderLineParser;
  }();

  var ExportedNode = /*#__PURE__*/function () {
    function ExportedNode(nodeDataDefault) {
      _classCallCheck(this, ExportedNode);
      this.valueLength = 0;
      this.lines = 0;
      this.nodeData = nodeDataDefault;
    }
    _createClass(ExportedNode, [{
      key: "updateExport",
      value: function updateExport(subExport) {
        this.valueLength += subExport.valueLength;
        this.lines += subExport.lines;
      }
    }]);
    return ExportedNode;
  }();
  var Vector3 = /*#__PURE__*/_createClass(function Vector3(x, y, z) {
    _classCallCheck(this, Vector3);
    this.x = x;
    this.y = y;
    this.z = z;
  });
  var Vector2 = /*#__PURE__*/_createClass(function Vector2(x, y) {
    _classCallCheck(this, Vector2);
    this.x = x;
    this.y = y;
  });
  var Color = /*#__PURE__*/_createClass(function Color(r, g, b) {
    _classCallCheck(this, Color);
    this.r = r;
    this.g = g;
    this.b = b;
  });
  var BoneWeight = /*#__PURE__*/_createClass(function BoneWeight() {
    _classCallCheck(this, BoneWeight);
    this.weight = null; // mWeight
    this.boneIndex = null; // mVertex
  });
  var Bone = /*#__PURE__*/_createClass(function Bone() {
    _classCallCheck(this, Bone);
    this.name = null; // mName
    this.boneWeights = []; // mWeights
    this.offsetMatrix = []; // mOffsetMatrix
  });
  var Material = /*#__PURE__*/_createClass(function Material() {
    _classCallCheck(this, Material);
    this.name = '';
    this.color = new Color(0, 0, 0);
    this.shininess = 0;
    this.specular = new Color(0, 0, 0);
    this.emissive = new Color(0, 0, 0);
    // textureFileName
    this.map = '';
    // normalMapFileName
    this.normalMap = '';
    this.normalScale = new Vector2(1, 1);
    // bumpMapFileName
    this.bumpMap = '';
    this.bumpScale = 1;
    // emissiveMapFileName
    this.emissiveMap = '';
    // lightMapFileName
    this.lightMap = '';
    // is reference flag - if true, the material is given only by name
    this.isReference = false;
  });
  var Scene = /*#__PURE__*/_createClass(function Scene() {
    _classCallCheck(this, Scene);
    this.rootNode = null;
    this.materials = [];
    this.meshes = [];
    this.animations = [];
    this.animTicksPerSecond = 0;
  });
  // https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L59-L62
  var Face = /*#__PURE__*/_createClass(function Face() {
    _classCallCheck(this, Face);
    this.indices = [];
  }); // https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L112-L144
  var Mesh = /*#__PURE__*/_createClass(function Mesh() {
    _classCallCheck(this, Mesh);
    this.name = ''; //mName
    // Normal vectors Vector3
    this.normals = []; //mNormals
    // Normal face indices
    this.normalFaces = []; //mNormFaces
    // Vertex positions Vector3
    this.vertices = []; //mPositions
    // Vertex face indices
    this.vertexFaces = []; //mPosFaces
    // number of texture coordinates
    this.numTexCoords = 0; //mNumTextures
    // Texture coordinates Vector2
    this.texCoords = []; //mTexCoords
    // number of colors
    this.numColors = 0; //mNumColorSets
    // vertex colors
    this.colors = {}; //mColors
    // face materials
    this.faceMaterials = []; //mFaceMaterials
    // materials
    this.materials = []; //mMaterials
    // bones
    this.bones = []; //mBones
  });
  // https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L177-L180
  // Possible to use for quaternions also.
  var TimedArray = /*#__PURE__*/_createClass(function TimedArray(length) {
    _classCallCheck(this, TimedArray);
    this.dataLength = length;
    this.time = null;
    this.data = [];
  });
  // https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L182-L189
  // either three separate key sequences for position, rotation, scaling
  // or a combined key sequence of transformation matrices.
  var AnimBone = /*#__PURE__*/_createClass(function AnimBone() {
    _classCallCheck(this, AnimBone);
    this.name = ''; //mBoneName
    this.positionKeys = []; //mPosKeys
    this.rotationKeys = []; //mRotKeys
    this.scaleKeys = []; //mScaleKeys
    this.matrixKeys = []; //mTrafoKeys
  });
  // https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L192-L200
  var Animation = /*#__PURE__*/_createClass(function Animation() {
    _classCallCheck(this, Animation);
    this.name = ''; //mName
    // array of AnimBones.
    this.boneAnimations = []; //mAnims
  });
  // https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileHelper.h#L146-L175
  var Node = /*#__PURE__*/function () {
    function Node(parentNode) {
      _classCallCheck(this, Node);
      this.name = '';
      this.parentNode = null;
      this.childrenNodes = [];
      this.meshes = [];
      this.transformation = []; //mTrafoMatrix

      if (this._isNode(parentNode)) {
        this.parentNode = parentNode;
      }
    }
    _createClass(Node, [{
      key: "_isNode",
      value: function _isNode(nodeCandidate) {
        return _typeof(nodeCandidate) === 'object' && nodeCandidate !== null && nodeCandidate.constructor.name == 'Node';
      }
    }, {
      key: "addChildren",
      value: function addChildren(childNode) {
        if (this._isNode(childNode)) {
          this.childrenNodes.push(childNode);
        }
      }
    }]);
    return Node;
  }();

  // https://en.cppreference.com/w/cpp/string/byte/isspace
  function isSpace(currChar) {
    var countAsSpace = [' ', '\f', '\n', '\r', '\t', '\v'];
    return countAsSpace.indexOf(currChar) > -1;
  }
  function readInteger(fullText) {
    var result = new ExportedNode(0);
    var isNegative = false;
    if (fullText[result.valueLength] == '-') {
      isNegative = true;
      ++result.valueLength;
    }
    if (isNaN(parseInt(fullText[result.valueLength], 10))) {
      throw 'Number expected.';
    }
    while (result.valueLength < fullText.length) {
      var currentDigit = parseInt(fullText[result.valueLength], 10);
      if (isNaN(currentDigit)) {
        break;
      }
      result.nodeData = result.nodeData * 10 + currentDigit;
      ++result.valueLength;
    }
    if (isNegative) {
      result.nodeData = -1 * result.nodeData;
    }
    return result;
  }
  // read a floating point number. Input is the full text of the rest of the model file.
  // The output is an object with the value and the length of the text read.
  // The value is the floating point number.
  // The length is the number of characters read.
  function readFloat(fullText) {
    var result = new ExportedNode(0);
    var isNegative = false;
    if (fullText[result.valueLength] == '-') {
      isNegative = true;
      ++result.valueLength;
    }
    if (isNaN(parseInt(fullText[result.valueLength], 10))) {
      throw 'Number expected.';
    }
    while (result.valueLength < fullText.length) {
      var currentDigit = parseInt(fullText[result.valueLength], 10);
      if (isNaN(currentDigit)) {
        break;
      }
      result.nodeData = result.nodeData * 10 + currentDigit;
      ++result.valueLength;
    }
    if (fullText[result.valueLength] == '.') {
      ++result.valueLength;
      var decimal = 0.1;
      while (result.valueLength < fullText.length) {
        var _currentDigit = parseInt(fullText[result.valueLength], 10);
        if (isNaN(_currentDigit)) {
          break;
        }
        result.nodeData = result.nodeData + decimal * _currentDigit;
        decimal = decimal * 0.1;
        ++result.valueLength;
      }
    }
    if (isNegative) {
      result.nodeData = -1 * result.nodeData;
    }
    return result;
  }
  // readRGBA function reads 4 floating point numbers from the input.
  // As the THREE.Color only has a constructor that takes 3 floats, the fourth is ignored.
  // The output is an object with the Color and the length of the text read.
  function readRGBA(fullText) {
    var result = new ExportedNode(new Color());
    var rColorComponentData = readFloat(fullText);
    // increase the result.valueLength by the length of the read data.
    result.updateExport(rColorComponentData);
    // separator character.
    result.valueLength += 1;
    // read the green component.
    var gColorComponentData = readFloat(fullText.substring(result.valueLength));
    // increase the result.valueLength by the length of the read data.
    result.updateExport(gColorComponentData);
    result.valueLength += 1;
    // read the blue component.
    var bColorComponentData = readFloat(fullText.substring(result.valueLength));
    // increase the result.valueLength by the length of the read data.
    result.updateExport(bColorComponentData);
    result.valueLength += 1;
    // read the alpha component.
    // increase the result.valueLength by the length of the read data.
    result.updateExport(readFloat(fullText.substring(result.valueLength)));
    // set the color.
    result.nodeData = new Color(rColorComponentData.nodeData, gColorComponentData.nodeData, bColorComponentData.nodeData);
    result.updateExport(testForSeparator(fullText.substring(result.valueLength)));
    return result;
  }
  // readRGB function reads 3 floating point numbers from the input.
  // The output is an object with the Color and the length of the text read.
  function readRGB(fullText) {
    var result = new ExportedNode(new Color());
    var rColorComponentData = readFloat(fullText);
    // increase the result.valueLength by the length of the read data.
    result.updateExport(rColorComponentData);
    // separator character.
    result.valueLength += 1;
    // read the green component.
    var gColorComponentData = readFloat(fullText.substring(result.valueLength));
    // increase the result.valueLength by the length of the read data.
    result.updateExport(gColorComponentData);
    result.valueLength += 1;
    // read the blue component.
    var bColorComponentData = readFloat(fullText.substring(result.valueLength));
    // increase the result.valueLength by the length of the read data.
    result.updateExport(bColorComponentData);
    result.valueLength += 1;
    // set the color.
    result.nodeData = new Color(rColorComponentData.nodeData, gColorComponentData.nodeData, bColorComponentData.nodeData);
    result.updateExport(testForSeparator(fullText.substring(result.valueLength)));
    return result;
  }
  // readString function reads a string from the input. The input has to be prefixed and suffixed with the '"' character.
  // The output is an object with the string and the length of the text read.
  function readString(fullText) {
    var result = new ExportedNode('');
    if (fullText[result.valueLength] != '"') {
      throw 'String expected.';
    }
    ++result.valueLength;
    while (result.valueLength < fullText.length) {
      var currentChar = fullText[result.valueLength];
      if (currentChar == '"') {
        ++result.valueLength;
        return result;
      }
      result.nodeData += currentChar;
      ++result.valueLength;
    }
    throw 'Unterminated string.';
  }
  // readVector3 function reads 3 floating point numbers from the input.
  // The output is an object with the Vector3 and the length of the text read.
  function readVector3(fullText) {
    var result = new ExportedNode(new Vector3());
    var xComponentData = readFloat(fullText);
    // increase the result.valueLength by the length of the read data.
    result.updateExport(xComponentData);
    result.valueLength += 1;
    result.nodeData.x = xComponentData.nodeData;
    var yComponentData = readFloat(fullText.substring(result.valueLength));
    // increase the result.valueLength by the length of the read data.
    result.updateExport(yComponentData);
    result.valueLength += 1;
    result.nodeData.y = yComponentData.nodeData;
    var zComponentData = readFloat(fullText.substring(result.valueLength));
    result.updateExport(zComponentData);
    result.valueLength += 1;
    result.nodeData.z = zComponentData.nodeData;
    return result;
  }
  // readVector2 function reads 2 floating point numbers from the input.
  // The output is an object with the Vector2 and the length of the text read.
  function readVector2(fullText) {
    var result = new ExportedNode(new Vector2());
    var xComponentData = readFloat(fullText);
    // increase the result.valueLength by the length of the read data.
    result.updateExport(xComponentData);
    result.valueLength += 1;
    result.nodeData.x = xComponentData.nodeData;
    var yComponentData = readFloat(fullText.substring(result.valueLength));
    // increase the result.valueLength by the length of the read data.
    result.updateExport(yComponentData);
    result.valueLength += 1;
    result.nodeData.y = yComponentData.nodeData;
    return result;
  }
  // readUntilEndOfLine function reads the input until the end of the line.
  // The output is the number of characters until the end of the line.
  function readUntilEndOfLine(fullText) {
    var result = 0;
    while (result < fullText.length) {
      var currentChar = fullText[result];
      if (currentChar == '\n' || currentChar == '\r') {
        return ++result;
      }
      ++result;
    }
    throw 'Unterminated line.';
  }
  // readUntilNextNonWhitespace function reads the input until the next non-whitespace character.
  // Returns an ExportedNode without any data.
  function readUntilNextNonWhitespace(fullText) {
    var result = new ExportedNode(null);
    while (true) {
      while (result.valueLength < fullText.length && isSpace(fullText[result.valueLength])) {
        if (fullText[result.valueLength] == '\n') {
          result.lines++;
        }
        result.valueLength++;
      }
      if (result.valueLength >= fullText.length) {
        return result;
      }
      // ignore the comments
      if (fullText[result.valueLength] == '/' && fullText[result.valueLength + 1] == '/' || fullText[result.valueLength] == '#') {
        result.valueLength += readUntilEndOfLine(fullText.substring(result.valueLength));
        result.lines++;
      } else {
        break;
      }
    }
    return result;
  }
  // getNextToken function reads the input until the end of the next token.
  // Returns an ExportedNode without the token string as nodeData.
  function getNextToken(fullText) {
    var result = new ExportedNode('');
    result.updateExport(readUntilNextNonWhitespace(fullText));
    while (result.valueLength < fullText.length && !isSpace(fullText[result.valueLength])) {
      // either keep token delimiters when already holding a token, or return if first valid char
      var delimiters = [';', '}', '{', ','];
      if (delimiters.indexOf(fullText[result.valueLength]) > -1) {
        if (!result.nodeData.length) {
          result.nodeData = result.nodeData + fullText[result.valueLength];
          ++result.valueLength;
        }
        break; // stop for delimiter
      }

      result.nodeData = result.nodeData + fullText[result.valueLength];
      ++result.valueLength;
    }
    return result;
  }
  // tests and possibly consumes a separator char, but does nothing if there was no separator
  function testForSeparator(fullText) {
    // ignore the whitespaces
    var skipped = readUntilNextNonWhitespace(fullText);
    if (fullText[skipped.valueLength] == ',' || fullText[skipped.valueLength] == ';') {
      skipped.valueLength++;
    }
    return skipped;
  }

  // headOfDataObject parser function. Input is the full text of the rest of the model file.
  // It reads the next token with the StringUtils.getNextToken function to a variable called headToken.
  // If the headToken.token is the '{', it updates the headToken.token to empty string and returns the headToken.
  // Otherwise, it reads the next token to a variable called openNode
  // if openNode.token is '{', it  increases the headToken.valueLength by the value of openNode.valueLength and
  // increases the headToken.lines by the value of openNode.lines and returns the headToken.
  function headOfDataObject(fullText) {
    var headToken = getNextToken(fullText);
    if (headToken.nodeData === '{') {
      headToken.nodeData = '';
      return headToken;
    }
    var openNode = getNextToken(fullText.substring(headToken.valueLength));
    if (openNode.nodeData === '{') {
      headToken.valueLength += openNode.valueLength;
      headToken.lines += openNode.lines;
      return headToken;
    }
    throw 'Opening brace expected.';
  }
  // template node parser function. Input is the full text of the rest of the model file.
  // First it reads the head of the node with the headOfDataObject function to a variable called head.
  // Then it reads the next token to a variable called guid.
  // It reads the next token until it finds the closing brace.
  // It throws 'Unexpected end of file reached while parsing template definition' if the read token is empty string.
  function templateNode(fullText) {
    var templateNode = new ExportedNode(null);
    templateNode.updateExport(headOfDataObject(fullText));
    templateNode.updateExport(getNextToken(fullText.substring(templateNode.valueLength)));
    while (true) {
      var token = getNextToken(fullText.substring(templateNode.valueLength));
      templateNode.updateExport(token);
      if (token.nodeData === '') {
        throw 'Unexpected end of file reached while parsing template definition.';
      }
      if (token.nodeData === '}') {
        break;
      }
    }
    return templateNode;
  }
  // Parse a texture filename definition based on the assimp xfile parser logic
  // example content: '{\n"texture/SSR06_Born2_dif.png";\n}'
  function textureFilenameNode(fullText) {
    var node = new ExportedNode('');
    // ignore the whitespaces
    node.updateExport(readUntilNextNonWhitespace(fullText));
    // read the opening brace with the headOfDataObject function
    node.updateExport(headOfDataObject(fullText.substring(node.valueLength)));
    // ignore the whitespaces
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // Extract the texture filename from the material definition with the readString StringUtil function
    var textureFilename = readString(fullText.substring(node.valueLength));
    node.nodeData = textureFilename.nodeData;
    // increase the readUntil counter by the length of the read string
    node.valueLength += textureFilename.valueLength;
    // throw exception if the next character is not a semi-colon.
    if (fullText[node.valueLength] != ';') {
      throw 'Unexpected token while parsing texture filename.';
    }
    // increase the readUntil counter by the length of the semi-colon
    node.valueLength += 1;
    // ignore the whitespaces
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // throw exception if the next token is not a closing brace.
    var closingBrace = getNextToken(fullText.substring(node.valueLength));
    if (closingBrace.nodeData != '}') {
      throw 'Unexpected token while parsing texture filename.';
    }
    // increase the readUntil counter by the length of the closing brace
    node.updateExport(closingBrace);
    return node;
  }
  // Parse a material object definition based on the assimp xfile parser logic
  // The assimp implementation is located in this link: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L655-L692
  function materialNode(fullText) {
    var node = new ExportedNode(null);
    var materialName = headOfDataObject(fullText);
    // if the material name is empty, generate a unique name prefixed with the string 'material_'
    if (materialName.nodeData === '') {
      materialName.nodeData = 'material_' + fullText.substring(materialName.valueLength).length;
    }
    node.nodeData = new Material();
    node.nodeData.name = materialName.nodeData;
    node.updateExport(materialName);

    // ignore the whitespaces
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));

    // Extract the diffuse color from the material definition with the readRGBA StringUtil function
    var diffuseColor = readRGBA(fullText.substring(node.valueLength));
    // increase the node.valueLength counter by the length of the read RGBA string
    node.updateExport(diffuseColor);
    // Set the diffuse color of the material
    node.nodeData.color = new Color(diffuseColor.nodeData.r, diffuseColor.nodeData.g, diffuseColor.nodeData.b);
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));

    // ignore the whitespaces
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));

    // Extract the shininess value from the material definition with the readFloat StringUtil function
    var shininess = readFloat(fullText.substring(node.valueLength));
    // increase the node.valueLength counter by the length of the read float string
    node.updateExport(shininess);
    // Set the shininess value of the material
    node.nodeData.shininess = shininess.nodeData;
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));

    // ignore the whitespaces
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));

    // Extract the specular color from the material definition with the readRGB StringUtil function
    var specularColor = readRGB(fullText.substring(node.valueLength));
    // increase the node.valueLength counter by the length of the read RGBA string
    node.updateExport(specularColor);
    // Set the specular color of the material
    node.nodeData.specular = new Color(specularColor.nodeData.r, specularColor.nodeData.g, specularColor.nodeData.b);
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));

    // ignore the whitespaces
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));

    // Extract the emissive color from the material definition with the readRGB StringUtil function
    var emissiveColor = readRGB(fullText.substring(node.valueLength));
    // increase the node.valueLength counter by the length of the read RGBA string
    node.updateExport(emissiveColor);
    // Set the emissive color of the material
    node.nodeData.emissive = new Color(emissiveColor.nodeData.r, emissiveColor.nodeData.g, emissiveColor.nodeData.b);
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    while (true) {
      var nextToken = getNextToken(fullText.substring(node.valueLength));
      node.updateExport(nextToken);
      if (nextToken.nodeData == '') {
        throw 'Unexpected end of file reached while parsing material';
      } else if (nextToken.nodeData == '}') {
        break;
        // handle the 'TextureFilename' token. Some exporters write "TextureFileName" instead.
      } else if (nextToken.nodeData == 'TextureFilename' || nextToken.nodeData == 'TextureFileName') {
        var textureName = textureFilenameNode(fullText.substring(node.valueLength));
        node.updateExport(textureName);
        node.nodeData.map = textureName.nodeData;
        // handle the 'NormalmapFilename' token. Some exporters write "NormalmapFileName" instead.
      } else if (nextToken.nodeData == 'NormalmapFilename' || nextToken.nodeData == 'NormalmapFileName') {
        var _textureName = textureFilenameNode(fullText.substring(node.valueLength));
        node.updateExport(_textureName);
        node.nodeData.normalMap = _textureName.nodeData;
        // default to normalScale of Vector2(2,2)
        node.nodeData.normalScale = new Vector2(2, 2);
        // handle the 'BumpmapFilename' token. Some exporters write "BumpmapFileName" instead.
      } else if (nextToken.nodeData == 'BumpmapFilename' || nextToken.nodeData == 'BumpmapFileName' || nextToken.nodeData == 'BumpMapFilename') {
        var _textureName2 = textureFilenameNode(fullText.substring(node.valueLength));
        node.updateExport(_textureName2);
        node.nodeData.bumpMap = _textureName2.nodeData;
        // default to bumpScale of 1
        node.nodeData.bumpScale = 1;
        // handle the 'EmissiveMapFilename' token. Some exporters write "EmissiveMapFileName" instead.
      } else if (nextToken.nodeData == 'EmissiveMapFilename' || nextToken.nodeData == 'EmissiveMapFileName') {
        var _textureName3 = textureFilenameNode(fullText.substring(node.valueLength));
        node.updateExport(_textureName3);
        node.nodeData.emissiveMap = _textureName3.nodeData;
        // handle the 'LightMapFilename' token. Some exporters write "LightMapFileName" instead.
      } else if (nextToken.nodeData == 'LightMapFilename' || nextToken.nodeData == 'LightMapFileName') {
        var _textureName4 = textureFilenameNode(fullText.substring(node.valueLength));
        node.updateExport(_textureName4);
        node.nodeData.lightMap = _textureName4.nodeData;
      } else {
        throw 'Unexpected token while parsing material: ' + nextToken.nodeData;
      }
    }
    return node;
  }
  // MeshNormal node parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L509-L544
  function meshNormalNode(fullText, mesh) {
    var node = new ExportedNode(mesh);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // read the number of normals
    var count = readInteger(fullText.substring(node.valueLength));
    node.updateExport(count);
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // read the normals
    for (var i = 0; i < count.nodeData; i++) {
      var normal = readVector3(fullText.substring(node.valueLength));
      node.updateExport(normal);
      node.nodeData.normals.push(normal.nodeData);
      // Remove the white spaces and the separator characters that might be present.
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    // read the number of faces.
    var numFaces = readInteger(fullText.substring(node.valueLength));
    node.updateExport(numFaces);
    if (numFaces.nodeData != node.nodeData.vertexFaces.length) {
      throw 'Normal face count does not match vertex face count.';
    }
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    if (numFaces.nodeData > 0) {
      // read the face indices
      for (var _i = 0; _i < numFaces.nodeData; _i++) {
        var numIndices = readInteger(fullText.substring(node.valueLength));
        node.updateExport(numIndices);
        node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
        node.nodeData.normalFaces.push(new Face());
        for (var j = 0; j < numIndices.nodeData; j++) {
          var index = readInteger(fullText.substring(node.valueLength));
          node.updateExport(index);
          node.nodeData.normalFaces[_i].indices.push(index.nodeData);
          node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
        }
        // Remove the white spaces and the separator characters that might be present.
        node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
        node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
      }
      // Remove the white spaces and the separator characters that might be present.
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    }
    // The next token should be the closing brace
    var nextToken = getNextToken(fullText.substring(node.valueLength));
    node.updateExport(nextToken);
    if (nextToken.nodeData != '}') {
      throw 'Unexpected token while parsing mesh normals: ' + nextToken.nodeData;
    }
    return node;
  }
  // MeshTextureCoords node parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L547-L563
  function meshTextureCoordsNode(fullText, mesh) {
    var node = new ExportedNode(mesh);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // read the number of texture coordinates
    var count = readInteger(fullText.substring(node.valueLength));
    node.updateExport(count);
    if (count.nodeData != node.nodeData.vertices.length) {
      throw 'Texture coordinate count does not match vertex face count.';
    }
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    for (var i = 0; i < count.nodeData; i++) {
      var uv = readVector2(fullText.substring(node.valueLength));
      node.updateExport(uv);
      node.nodeData.texCoords.push(uv.nodeData);
      // Remove the white spaces and the separator characters that might be present.
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    // The next token should be the closing brace
    var nextToken = getNextToken(fullText.substring(node.valueLength));
    node.updateExport(nextToken);
    if (nextToken.nodeData != '}') {
      throw 'Unexpected token while parsing mesh texture coords: ' + nextToken.nodeData;
    }
    return node;
  }
  // MeshVertexColors node parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L566-L593
  function meshVertexColorsNode(fullText, mesh) {
    var node = new ExportedNode(mesh);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // read the number of colors
    var count = readInteger(fullText.substring(node.valueLength));
    node.updateExport(count);
    if (count.nodeData != node.nodeData.vertices.length) {
      throw 'Vertex color count does not match vertex count';
    }
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    for (var i = 0; i < count.nodeData; i++) {
      var index = readInteger(fullText.substring(node.valueLength));
      node.updateExport(index);
      if (index.nodeData >= node.nodeData.vertices.length) {
        throw 'Vertex color index out of bounds';
      }
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
      var color = readRGBA(fullText.substring(node.valueLength));
      node.updateExport(color);
      node.nodeData.colors[index.nodeData] = color.nodeData;
      // Remove the white spaces and the separator characters that might be present.
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    // The next token should be the closing brace
    var nextToken = getNextToken(fullText.substring(node.valueLength));
    node.updateExport(nextToken);
    if (nextToken.nodeData != '}') {
      throw 'Unexpected token while parsing mesh vertex colors: ' + nextToken.nodeData;
    }
    return node;
  }
  // MeshMaterialListNode based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L596-L652
  function meshMaterialListNode(fullText, mesh) {
    var node = new ExportedNode(mesh);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // read the number of materials
    var count = readInteger(fullText.substring(node.valueLength));
    node.updateExport(count);
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // read non triangulated face material index count
    var numMatIndices = readInteger(fullText.substring(node.valueLength));
    node.updateExport(numMatIndices);
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // some models have a material index count of 1... to be able to read them we
    // replicate this single material index on every face
    if (numMatIndices.nodeData != node.nodeData.vertexFaces.length && numMatIndices.nodeData != 1) {
      throw 'Per-Face material index count does not match face count';
    }
    // read per-face material indices
    for (var i = 0; i < numMatIndices.nodeData; i++) {
      var index = readInteger(fullText.substring(node.valueLength));
      node.updateExport(index);
      node.nodeData.faceMaterials.push(index.nodeData);
      // Remove the white spaces and the separator characters that might be present.
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    // in certain versions, the face indices end with two semicolons.
    if (node.valueLength < fullText.length && fullText[node.valueLength] == ';') {
      // handle the second semicolon with increasing the value length
      node.valueLength++;
    }
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // if there was only a single material index, replicate it on all faces
    while (node.nodeData.faceMaterials.length < node.nodeData.vertexFaces.length) {
      node.nodeData.faceMaterials.push(node.nodeData.faceMaterials[node.nodeData.faceMaterials.length - 1]);
    }
    // read following data objects
    while (true) {
      var nextToken = getNextToken(fullText.substring(node.valueLength));
      node.updateExport(nextToken);
      if (nextToken.nodeData == '') {
        throw 'Unexpected end of file while parsing mesh material list';
      } else if (nextToken.nodeData == '}') {
        break;
      } else if (nextToken.nodeData == '{') {
        // In this case we have a material referenced by name
        var materialName = getNextToken(fullText.substring(node.valueLength));
        node.updateExport(materialName);
        var material = new Material();
        material.name = materialName.nodeData;
        material.isReference = true;
        node.nodeData.materials.push(material);
        node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
        var closingBrace = getNextToken(fullText.substring(node.valueLength));
        node.updateExport(closingBrace);
        if (closingBrace.nodeData != '}') {
          throw 'Unexpected token while parsing mesh material list: ' + closingBrace.nodeData;
        }
        node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
      } else if (nextToken.nodeData == 'Material') {
        // inlined material
        var _material = materialNode(fullText.substring(node.valueLength));
        node.updateExport(_material);
        node.nodeData.materials.push(_material.nodeData);
        node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
      } else if (nextToken.nodeData == ';') {
        // ignore semicolons
        node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
      } else {
        // ignore unknown data objects
        node.updateExport(unknownNode(fullText.substring(node.valueLength)));
      }
    }
    return node;
  }
  // UnknowDataObjectParser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L869-L895
  function unknownNode(fullText) {
    var node = new ExportedNode(null);
    var exceptionMessage = 'Unexpected end of file while parsing unknown data object';
    var depth = 0;
    // find the opening brace
    while (true) {
      var nextToken = getNextToken(fullText.substring(node.valueLength));
      node.updateExport(nextToken);
      if (nextToken.nodeData == '') {
        throw exceptionMessage;
      } else if (nextToken.nodeData == '{') {
        depth++;
        break;
      }
    }
    // find the closing brace
    while (depth > 0) {
      var _nextToken = getNextToken(fullText.substring(node.valueLength));
      node.updateExport(_nextToken);
      if (_nextToken.nodeData == '') {
        throw exceptionMessage;
      } else if (_nextToken.nodeData == '{') {
        depth++;
      } else if (_nextToken.nodeData == '}') {
        depth--;
      }
    }
    return node;
  }
  // SkinWeightsNode Parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L448-L495
  function skinWeightsNode(fullText, mesh) {
    var node = new ExportedNode(mesh);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    var name = readString(fullText.substring(node.valueLength));
    node.updateExport(name);
    var bone = new Bone();
    bone.name = name.nodeData;
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // read the number of bones
    var numBones = readInteger(fullText.substring(node.valueLength));
    node.updateExport(numBones);
    // Remove the white spaces and the separator characters that might be present.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // read the bone indices
    for (var i = 0; i < numBones.nodeData; i++) {
      var boneIndex = readInteger(fullText.substring(node.valueLength));
      node.updateExport(boneIndex);
      var boneWeight = new BoneWeight();
      boneWeight.boneIndex = boneIndex.nodeData;
      bone.boneWeights.push(boneWeight);
      // Remove the white spaces and the separator characters that might be present.
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    // read the vertex weights
    for (var _i2 = 0; _i2 < numBones.nodeData; _i2++) {
      var vertexWeight = readFloat(fullText.substring(node.valueLength));
      node.updateExport(vertexWeight);
      bone.boneWeights[_i2].weight = vertexWeight.nodeData;
      // Remove the white spaces and the separator characters that might be present.
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    // The next 16 floats are the bone offset matrix
    for (var _i3 = 0; _i3 < 16; _i3++) {
      var matrixValue = readFloat(fullText.substring(node.valueLength));
      node.updateExport(matrixValue);
      bone.offsetMatrix.push(matrixValue.nodeData);
      // Remove the separator character.
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    }
    // After the offset matrix, there is a semicolon.
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    // Remove the whitespaces.
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // The next token should be the closing brace
    var nextToken = getNextToken(fullText.substring(node.valueLength));
    node.updateExport(nextToken);
    if (nextToken.nodeData != '}') {
      throw 'Unexpected token while parsing mesh skin weights node: ' + nextToken.nodeData;
    }
    // Update the mesh with the bone
    node.nodeData.bones.push(bone);
    return node;
  }
  // Mesh Node parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L389-L445
  function meshNode(fullText) {
    var meshName = headOfDataObject(fullText);
    var mesh = new Mesh();
    mesh.name = meshName.nodeData;
    var node = new ExportedNode(null);
    node.updateExport(meshName);
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // Read the vertex count
    var vertexCount = readInteger(fullText.substring(node.valueLength));
    node.updateExport(vertexCount);
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // read vertexCount.nodeData vertices into an array with the StringUtils.readVector3 function
    for (var i = 0; i < vertexCount.nodeData; i++) {
      var vertex = readVector3(fullText.substring(node.valueLength));
      node.updateExport(vertex);
      mesh.vertices.push(vertex.nodeData);
      // After the vector3, there is a semicolon.
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      // Remove the whitespaces.
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    // read the number of faces to a variable with the StringUtils.readInteger function
    var faceCount = readInteger(fullText.substring(node.valueLength));
    node.updateExport(faceCount);
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    for (var _i4 = 0; _i4 < faceCount.nodeData; _i4++) {
      var face = new Face();
      var numIndices = readInteger(fullText.substring(node.valueLength));
      node.updateExport(numIndices);
      // the number is followed by a colon
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      // read the indices
      for (var j = 0; j < numIndices.nodeData; j++) {
        var index = readInteger(fullText.substring(node.valueLength));
        node.updateExport(index);
        face.indices.push(index.nodeData);
        // Remove the separator character.
        node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      }
      mesh.vertexFaces.push(face);
      // Remove the separator character, go to next character.
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    // read following data objects
    while (true) {
      var nextToken = getNextToken(fullText.substring(node.valueLength));
      node.updateExport(nextToken);
      if (nextToken.nodeData == '') {
        throw 'Unexpected end of file while parsing mesh';
      } else if (nextToken.nodeData == '}') {
        break;
      } else if (nextToken.nodeData == 'MeshNormals') {
        var meshNormals = meshNormalNode(fullText.substring(node.valueLength), mesh);
        node.updateExport(meshNormals);
        mesh = meshNormals.nodeData;
      } else if (nextToken.nodeData == 'MeshTextureCoords') {
        var meshTextureCoords = meshTextureCoordsNode(fullText.substring(node.valueLength), mesh);
        node.updateExport(meshTextureCoords);
        mesh = meshTextureCoords.nodeData;
      } else if (nextToken.nodeData == 'MeshVertexColors') {
        var meshVertexColors = meshVertexColorsNode(fullText.substring(node.valueLength), mesh);
        node.updateExport(meshVertexColors);
        mesh = meshVertexColors.nodeData;
      } else if (nextToken.nodeData == 'MeshMaterialList') {
        var meshMaterialList = meshMaterialListNode(fullText.substring(node.valueLength), mesh);
        node.updateExport(meshMaterialList);
        mesh = meshMaterialList.nodeData;
      } else if (nextToken.nodeData == 'VertexDuplicationIndices') {
        // It is ignored by assimp, so we will ignore it too.
        node.updateExport(unknownNode(fullText.substring(node.valueLength)));
      } else if (nextToken.nodeData == 'XSkinMeshHeader') {
        // It is ignored by assimp, so we will ignore it too.
        node.updateExport(unknownNode(fullText.substring(node.valueLength)));
      } else if (nextToken.nodeData == 'SkinWeights') {
        var skinWeights = skinWeightsNode(fullText.substring(node.valueLength), mesh);
        node.updateExport(skinWeights);
        mesh = skinWeights.nodeData;
      } else {
        node.updateExport(unknownNode(fullText.substring(node.valueLength)));
      }
    }
    node.nodeData = mesh;
    return node;
  }
  // AnimTicksPerSecondNode parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L695-L699
  function animTicksPerSecondNode(fullText) {
    var node = new ExportedNode(null);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    var ticksPerSecond = readInteger(fullText.substring(node.valueLength));
    node.updateExport(ticksPerSecond);
    node.nodeData = ticksPerSecond.nodeData;
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // The next token should be the closing brace
    var nextToken = getNextToken(fullText.substring(node.valueLength));
    node.updateExport(nextToken);
    if (nextToken.nodeData != '}') {
      throw 'Unexpected token while parsing aminTicksPerSecond node: ' + nextToken.nodeData;
    }
    return node;
  }
  // TransformationMatrixNode parser based on the assimp implementation: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L361-L386
  function transformationMatrixNode(fullText) {
    var node = new ExportedNode(null);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    var matrix = [];
    for (var i = 0; i < 16; i++) {
      var value = readFloat(fullText.substring(node.valueLength));
      node.updateExport(value);
      matrix.push(value.nodeData);
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    }
    node.nodeData = matrix;
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    // The next token should be the closing brace
    var nextToken = getNextToken(fullText.substring(node.valueLength));
    node.updateExport(nextToken);
    if (nextToken.nodeData != '}') {
      throw 'Unexpected token while parsing transformationMatrix node: ' + nextToken.nodeData;
    }
    return node;
  }
  function animationKeyNode(fullText, boneAnim) {
    var node = new ExportedNode(boneAnim);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    var keyType = readInteger(fullText.substring(node.valueLength));
    node.updateExport(keyType);
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    var numberOfKeys = readInteger(fullText.substring(node.valueLength));
    node.updateExport(numberOfKeys);
    node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    for (var i = 0; i < numberOfKeys.nodeData; i++) {
      var time = readInteger(fullText.substring(node.valueLength));
      node.updateExport(time);
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      var readCount = readInteger(fullText.substring(node.valueLength));
      switch (keyType.nodeData) {
        case 0:
          // Rotation keys
          // The rotation keys are stored as quaternions
          var quaternion = new TimedArray(4);
          node.updateExport(readCount);
          if (readCount.nodeData != 4) {
            throw 'Invalid number of arguments for quaternion key in animation';
          }
          node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          quaternion.time = time.nodeData;
          for (var j = 0; j < readCount.nodeData; j++) {
            var value = readFloat(fullText.substring(node.valueLength));
            node.updateExport(value);
            quaternion.data.push(value.nodeData);
            node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          }
          // It might be followed by multiple separators (;,)
          node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          node.nodeData.rotationKeys.push(quaternion);
          break;
        case 1:
          // scale vector keys
          var scaleVector = new TimedArray(3);
          node.updateExport(readCount);
          if (readCount.nodeData != 3) {
            throw 'Invalid number of arguments for scale vector in animation';
          }
          node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          scaleVector.time = time.nodeData;
          for (var _j = 0; _j < readCount.nodeData; _j++) {
            var _value = readFloat(fullText.substring(node.valueLength));
            node.updateExport(_value);
            scaleVector.data.push(_value.nodeData);
            node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          }
          // It might be followed by multiple separators (;,)
          node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          node.nodeData.scaleKeys.push(scaleVector);
          break;
        case 2:
          // position vector keys
          var positionVector = new TimedArray(3);
          node.updateExport(readCount);
          if (readCount.nodeData != 3) {
            throw 'Invalid number of arguments for position vector in animation';
          }
          node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          positionVector.time = time.nodeData;
          for (var _j2 = 0; _j2 < readCount.nodeData; _j2++) {
            var _value2 = readFloat(fullText.substring(node.valueLength));
            node.updateExport(_value2);
            positionVector.data.push(_value2.nodeData);
            node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          }
          // It might be followed by multiple separators (;,)
          node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          node.nodeData.positionKeys.push(positionVector);
          break;
        case 3:
        case 4:
          var matrix = new TimedArray(16);
          node.updateExport(readCount);
          if (readCount.nodeData != 16) {
            throw 'Invalid number of arguments for matrix in animation';
          }
          node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          matrix.time = time.nodeData;
          for (var _j3 = 0; _j3 < readCount.nodeData; _j3++) {
            var _value3 = readFloat(fullText.substring(node.valueLength));
            node.updateExport(_value3);
            matrix.data.push(_value3.nodeData);
            node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          }
          // It might be followed by multiple separators (;,)
          node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
          node.nodeData.matrixKeys.push(matrix);
          break;
        default:
          throw 'Invalid animation type';
      }
      node.updateExport(testForSeparator(fullText.substring(node.valueLength)));
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    // The next token should be the closing brace
    var nextToken = getNextToken(fullText.substring(node.valueLength));
    node.updateExport(nextToken);
    if (nextToken.nodeData != '}') {
      throw 'Unexpected token while parsing animationKey node: ' + nextToken.nodeData;
    }
    return node;
  }
  function animationNode(fullText, animation) {
    var node = new ExportedNode(animation);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    var boneAnimation = new AnimBone();
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    while (true) {
      var nextToken = getNextToken(fullText.substring(node.valueLength));
      node.updateExport(nextToken);
      if (nextToken.nodeData == '') {
        throw 'Unexpected end of file while parsing animation node';
      } else if (nextToken.nodeData == '}') {
        break;
      } else if (nextToken.nodeData == 'AnimationKey') {
        var animationKey = animationKeyNode(fullText.substring(node.valueLength), boneAnimation);
        node.updateExport(animationKey);
        // Update the existing one or add a new one. In case of bone animation with the name has been
        // found, update the existing one with the new keys. Otherwise, add a new one.
        var existingBoneAnimation = animation.boneAnimations.find(function (boneAnim) {
          return boneAnim.name == boneAnimation.name;
        });
        if (existingBoneAnimation) {
          existingBoneAnimation.rotationKeys = animationKey.nodeData.rotationKeys;
          existingBoneAnimation.scaleKeys = animationKey.nodeData.scaleKeys;
          existingBoneAnimation.positionKeys = animationKey.nodeData.positionKeys;
          existingBoneAnimation.matrixKeys = animationKey.nodeData.matrixKeys;
        } else {
          node.nodeData.boneAnimations.push(animationKey.nodeData);
        }
        node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
      } else if (nextToken.nodeData == 'AnimationOptions') {
        // It is ignored by assimp, so we will ignore it too.
        node.updateExport(unknownNode(fullText.substring(node.valueLength)));
      } else if (nextToken.nodeData == '{') {
        node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
        var animName = getNextToken(fullText.substring(node.valueLength));
        node.updateExport(animName);
        boneAnimation.name = animName.nodeData;
        node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
        // The next token should be the closing brace
        var nameCloseBrace = getNextToken(fullText.substring(node.valueLength));
        node.updateExport(nameCloseBrace);
        if (nameCloseBrace.nodeData != '}') {
          throw 'Unexpected token while parsing animation node: ' + nameCloseBrace.nodeData;
        }
        node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
      } else {
        node.updateExport(unknownNode(fullText.substring(node.valueLength)));
      }
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    return node;
  }
  function animationSetNode(fullText) {
    var node = new ExportedNode(null);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    var animation = new Animation();
    animation.name = head.nodeData;
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    while (true) {
      var nextToken = getNextToken(fullText.substring(node.valueLength));
      node.updateExport(nextToken);
      if (nextToken.nodeData == '') {
        throw 'Unexpected end of file while parsing animationSet node';
      } else if (nextToken.nodeData == '}') {
        break;
      } else if (nextToken.nodeData == 'Animation') {
        var animNode = animationNode(fullText.substring(node.valueLength), animation);
        node.updateExport(animNode);
        animation = animNode.nodeData;
        node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
      } else {
        node.updateExport(unknownNode(fullText.substring(node.valueLength)));
      }
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    node.nodeData = animation;
    return node;
  }
  function frameNode(fullText, parentFrame) {
    var node = new ExportedNode(parentFrame);
    var head = headOfDataObject(fullText);
    node.updateExport(head);
    var frame = new Node(parentFrame);
    frame.name = head.nodeData;
    node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    while (true) {
      var nextToken = getNextToken(fullText.substring(node.valueLength));
      node.updateExport(nextToken);
      if (nextToken.nodeData == '') {
        throw 'Unexpected end of file while parsing frame node';
      }
      if (nextToken.nodeData == '}') {
        break;
      } else if (nextToken.nodeData == 'Frame') {
        var frmNode = frameNode(fullText.substring(node.valueLength), frame);
        node.updateExport(frmNode);
        frame = frmNode.nodeData;
      } else if (nextToken.nodeData == 'FrameTransformMatrix') {
        var transformMatrix = transformationMatrixNode(fullText.substring(node.valueLength));
        node.updateExport(transformMatrix);
        frame.transformation = transformMatrix.nodeData;
      } else if (nextToken.nodeData == 'Mesh') {
        var mshNode = meshNode(fullText.substring(node.valueLength));
        node.updateExport(mshNode);
        frame.meshes.push(mshNode.nodeData);
      } else {
        node.updateExport(unknownNode(fullText.substring(node.valueLength)));
      }
      node.updateExport(readUntilNextNonWhitespace(fullText.substring(node.valueLength)));
    }
    if (node.nodeData != null) {
      node.nodeData.addChildren(frame);
    } else {
      node.nodeData = frame;
    }
    return node;
  }

  var TextParser = /*#__PURE__*/function () {
    // It contains the text of the .X file

    // It points to the index of the lastly processed file content.

    // It stores the processed line numbers.

    // It stores the Scene data.

    function TextParser(text) {
      _classCallCheck(this, TextParser);
      _defineProperty(this, "fileContent", void 0);
      _defineProperty(this, "readUntil", void 0);
      _defineProperty(this, "lineNumber", void 0);
      _defineProperty(this, "exportScene", void 0);
      this.fileContent = text;
      this.readUntil = 0;
      this.lineNumber = 0;
      // the first line is the format definition. Not connected to the model content.
      this.readUntil += readUntilEndOfLine(this.fileContent.substring(this.readUntil));
      this.lineNumber++;
      this.exportScene = new Scene();
    }
    _createClass(TextParser, [{
      key: "parse",
      value: function parse() {
        while (this.readUntil < this.fileContent.length) {
          var objectName = getNextToken(this.fileContent.substring(this.readUntil));
          this.readUntil += objectName.valueLength;
          this.lineNumber += objectName.lines;
          if (objectName.nodeData == '') {
            break;
          }
          this._parseObjectBasedOnName(objectName.nodeData);
          var skipped = readUntilNextNonWhitespace(this.fileContent.substring(this.readUntil));
          this.readUntil += skipped.valueLength;
          this.lineNumber += skipped.lines;
        }
        if (this.exportScene.rootNode != null) {
          this._filterHierarchy(this.exportScene.rootNode);
        }
        return this.exportScene;
      }
    }, {
      key: "_parseObjectBasedOnName",
      value: function _parseObjectBasedOnName(objectName) {
        switch (objectName) {
          case 'template':
            this._parseTemplateObject();
            break;
          case 'Frame':
            this._parseFrameObject();
            break;
          case 'Mesh':
            this._parseMeshObject();
            break;
          case 'AnimTicksPerSecond':
            this._parseAnimTicksPerSecondObject();
            break;
          case 'AnimationSet':
            this._parseAnimationSetObject();
            break;
          case 'Material':
            this._parseMaterialObject();
            break;
          case '}':
            break;
          default:
            this._parseUnknownObject();
            break;
        }
      }
    }, {
      key: "_parseTemplateObject",
      value: function _parseTemplateObject() {
        var template = templateNode(this.fileContent.substring(this.readUntil));
        this.readUntil += template.valueLength;
        this.lineNumber += template.lines;
      }
    }, {
      key: "_parseFrameObject",
      value: function _parseFrameObject() {
        var frame = frameNode(this.fileContent.substring(this.readUntil));
        this.readUntil += frame.valueLength;
        this.lineNumber += frame.lines;
        if (this.exportScene.rootNode == null) {
          this.exportScene.rootNode = frame.nodeData;
        } else {
          // We already have a root node. We need to create a new root node and add the previous root node as a child.
          // Name the new root node as '$dummy_root', as it is called in the assimp implementation.
          // If the root node is the dummy root, then we can just add the new frame as a child.
          if (this.exportScene.rootNode.name == '$dummy_root') ; else {
            // We need to create a new root node.
            var newRoot = new Node(null);
            newRoot.name = '$dummy_root';
            this.exportScene.rootNode.parent = newRoot;
            newRoot.childrenNodes.push(this.exportScene.rootNode);
            this.exportScene.rootNode = newRoot;
          }
          frame.nodeData.parentNode = this.exportScene.rootNode;
          this.exportScene.rootNode.childrenNodes.push(frame.nodeData);
        }
      }
      // parse a mesh object definition based on the assimp xfile parser.
      // The assimp implementation is located in this link: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L389-L445
      // The mesh has to be base on THREE.Mesh.
    }, {
      key: "_parseMeshObject",
      value: function _parseMeshObject() {
        var mesh = meshNode(this.fileContent.substring(this.readUntil));
        this.readUntil += mesh.valueLength;
        this.lineNumber += mesh.lines;
        this.exportScene.meshes.push(mesh.nodeData);
      }
      // Parse a material object definition based on the assimp xfile parser logic
      // The assimp implementation is located in this link: https://github.com/assimp/assimp/blob/master/code/AssetLib/X/XFileParser.cpp#L655-L692
      // The extracted material is stored in this.exportScene.materials
    }, {
      key: "_parseMaterialObject",
      value: function _parseMaterialObject() {
        var material = materialNode(this.fileContent.substring(this.readUntil));
        this.readUntil += material.valueLength;
        this.lineNumber += material.lines;
        this.exportScene.materials.push(material.nodeData);
      }
    }, {
      key: "_parseAnimTicksPerSecondObject",
      value: function _parseAnimTicksPerSecondObject() {
        var animTicksPerSecond = animTicksPerSecondNode(this.fileContent.substring(this.readUntil));
        this.readUntil += animTicksPerSecond.valueLength;
        this.lineNumber += animTicksPerSecond.lines;
        this.exportScene.animTicksPerSecond = animTicksPerSecond.nodeData;
      }
    }, {
      key: "_parseAnimationSetObject",
      value: function _parseAnimationSetObject() {
        var animationSet = animationSetNode(this.fileContent.substring(this.readUntil));
        this.readUntil += animationSet.valueLength;
        this.lineNumber += animationSet.lines;
        this.exportScene.animations.push(animationSet.nodeData);
      }
    }, {
      key: "_parseUnknownObject",
      value: function _parseUnknownObject() {
        var unknown = unknownNode(this.fileContent.substring(this.readUntil));
        this.readUntil += unknown.valueLength;
        this.lineNumber += unknown.lines;
      }
      // Filters the imported hierarchy for some degenerated cases that some exporters produce.
      // if the node has just a single unnamed child containing a mesh, remove
      // the anonymous node between. The 3DSMax kwXport plugin seems to produce this
      // mess in some cases
    }, {
      key: "_filterHierarchy",
      value: function _filterHierarchy(parentNode) {
        if (parentNode.childrenNodes.length == 1 && parentNode.meshes.length == 0) {
          var childNode = parentNode.childrenNodes[0];
          if (childNode.name == '' && childNode.meshes.length > 0) {
            // transfer its meshes to the parent node
            for (var i = 0; i < childNode.meshes.length; i++) {
              parentNode.meshes.push(childNode.meshes[i]);
            }
            // transfer the transformations as well.
            // pNode->mTrafoMatrix = pNode->mTrafoMatrix * child->mTrafoMatrix;
            var multipliedMatrix = [];
            for (var _i = 0; _i < 4; _i++) {
              for (var j = 0; j < 4; j++) {
                multipliedMatrix[_i * 4 + j] = 0;
                for (var k = 0; k < 4; k++) {
                  multipliedMatrix[_i * 4 + j] += parentNode.trafoMatrix[_i * 4 + k] * childNode.trafoMatrix[k * 4 + j];
                }
              }
            }
            parentNode.trafoMatrix = multipliedMatrix;
            parentNode.childrenNodes = [];
          }
        }
        // recurse for all children
        for (var _i2 = 0; _i2 < parentNode.childrenNodes.length; _i2++) {
          this._filterHierarchy(parentNode.childrenNodes[_i2]);
        }
      }
    }]);
    return TextParser;
  }();

  var XFileLoader = /*#__PURE__*/function () {
    function XFileLoader(manager, texloader) {
      _classCallCheck(this, XFileLoader);
      this.manager = manager !== undefined ? manager : new THREE.DefaultLoadingManager();
      this.texloader = texloader !== undefined ? texloader : new THREE.TextureLoader(this.manager);
      this._fileLoaderUrl = '';
      this._options = {};
      this._headerInfo = null;
      // The following variables are used to store the data of the extracted three.js objects.
      this.meshes = [];
      this.animations = [];
      // The following variables are used to store the data of the current object
      this._currentObject = {};
      this._currentMesh = {};
      this._currentAnimation = {};
      // The exported scene is stored in this variable.
      this._exportScene = {};
    }
    _createClass(XFileLoader, [{
      key: "_setArgOption",
      value: function _setArgOption(_arg) {
        if (!_arg) {
          throw 'Missing arguments.';
        }
        if (_arg[0]) {
          this._fileLoaderUrl = _arg[0];
        }
        if (_arg[1]) {
          this.options = _arg[1];
        }
      }
    }, {
      key: "load",
      value: function load(_arg, onLoad, onProgress, onError) {
        var _this = this;
        this._setArgOption(_arg);
        var loader = new THREE.FileLoader(this.manager);
        loader.setResponseType('arraybuffer');
        loader.load(this._fileLoaderUrl, function (response) {
          _this._parse(response, onLoad);
        }, onProgress, onError);
      }
    }, {
      key: "_parse",
      value: function _parse(data, onLoad) {
        var _this2 = this;
        // make sure data is a string
        if (typeof data !== "string") {
          var array_buffer = new Uint8Array(data);
          var str = '';
          for (var i = 0; i < data.byteLength; i++) {
            str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
          }

          data = str;
        }
        var lines = data.split(/\r?\n/);
        var firstLine = lines[0];
        this._headerInfo = new HeaderLineParser(firstLine);
        this.onLoad = onLoad;
        if (!this._headerInfo._fileCompressed && !this._headerInfo._fileBinary) {
          var parser = new TextParser(lines.slice(1).join('\n'));
          this._exportScene = parser.parse();
          this._initCurrentAnimationAndMesh();
          this._currentObject = this._exportScene.rootNode;
          if (this._currentObject) {
            this._processFrame(this._currentObject);
          } else {
            this._exportScene.animations.forEach(function (currentAnim) {
              _this2._currentAnimation = currentAnim;
              _this2._makeOutputAnimation();
            });
          }
          setTimeout(function () {
            _this2.onLoad({
              models: _this2.meshes,
              animations: _this2.animations
            });
          }, 1);
        } else {
          throw 'Unsupported file format.';
        }
      }
      // _initCurrentAnimationAndMesh creates the output mesh or animation from the current objects
      // and adds them to the output arrays. Then it resets the current animation and mesh.
    }, {
      key: "_initCurrentAnimationAndMesh",
      value: function _initCurrentAnimationAndMesh() {
        var _this3 = this;
        this._exportScene.meshes.forEach(function (currentMesh) {
          _this3._currentMesh = currentMesh;
          _this3._makeOutputMesh();
        });
        this._currentMesh = {};
        this._exportScene.animations.forEach(function (currentAnim) {
          _this3._currentAnimation = currentAnim;
          _this3._makeOutputAnimation();
        });
        this._currentAnimation = {};
      }
    }, {
      key: "_makeOutputMesh",
      value: function _makeOutputMesh(currentObject) {
        var _this4 = this;
        if (this._currentMesh && Object.keys(this._currentMesh).length > 0) {
          var geometry = new THREE.BufferGeometry();
          geometry.verticesNeedUpdate = true;
          geometry.normalsNeedUpdate = true;
          geometry.colorsNeedUpdate = true;
          geometry.uvsNeedUpdate = true;
          geometry.groupsNeedUpdate = true;
          // set faces aka indices
          var indices = [];
          this._currentMesh.vertexFaces.forEach(function (face) {
            indices.push(face.indices[0], face.indices[1], face.indices[2]);
          });
          // set vertices
          var vertices = this._vector3sToFloat32Array(this._currentMesh.vertices, indices);
          geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          // set faces aka indices for normals
          var indicesN = [];
          this._currentMesh.normalFaces.forEach(function (face) {
            indicesN.push(face.indices[0], face.indices[1], face.indices[2]);
          });
          // set normals
          var normals = this._vector3sToFloat32Array(this._currentMesh.normals, indicesN);
          geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
          //geometry.setIndex(indices);
          var uvs = this._vector2sToFloat32Array(this._currentMesh.texCoords, indices);
          geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
          // set materials
          var materials = [];
          this._currentMesh.materials.forEach(function (currentMaterial) {
            // if the material is referenced by name, get the material from the scene
            var material = currentMaterial;
            if (material.isReference) {
              _this4._exportScene.materials.forEach(function (currentSceneMaterial) {
                if (currentSceneMaterial.name === material.name) {
                  material = currentSceneMaterial;
                }
              });
            }
            var mpMat = new THREE.MeshPhongMaterial();
            mpMat.name = material.name;
            mpMat.color = new THREE.Color(material.color.r, material.color.g, material.color.b);
            mpMat.shininess = material.shininess;
            mpMat.specular = new THREE.Color(material.specular.r, material.specular.g, material.specular.b);
            mpMat.emissive = new THREE.Color(material.emissive.r, material.emissive.g, material.emissive.b);
            if (material.map) {
              mpMat.map = _this4.texloader.load(material.map);
            }
            if (material.bumpMap) {
              mpMat.bumpMap = _this4.texloader.load(material.bumpMap);
              // The original xLoader sets the bumpScale to 0.05 by default.
              // In my case it defaults to 1 (see Material type constructor or materialNode parser),
              // as it is the default value for this property (according to the threejs docs).
              mpMat.bumpScale = material.bumpScale;
            }
            if (material.normalMap) {
              mpMat.normalMap = _this4.texloader.load(material.normalMap);
              mpMat.normalScale = new THREE.Vector2(material.normalScale.x, material.normalScale.y);
            }
            if (material.emissiveMap) {
              mpMat.emissiveMap = _this4.texloader.load(material.emissiveMap);
            }
            if (material.lightMap) {
              mpMat.lightMap = _this4.texloader.load(material.lightMap);
            }
            materials.push(mpMat);
          });
          var mesh = null;
          if (this._currentMesh.bones.length > 0) {
            // define the bones based on the xLoader solution.
            // make bones from the current root node.
            var bones = [];
            var tempBoneCountData = [];
            var tempBoneWeightData = [];
            var tempBoneIndexData = [];
            this._currentMesh.vertices.forEach(function (vertex) {
              tempBoneCountData.push(0);
              tempBoneWeightData.push([0, 0, 0, 0]);
              tempBoneIndexData.push([1, 0, 0, 0]);
            });
            this._makeBones(currentObject.parentNode, bones);
            this._currentMesh.bones.forEach(function (bone) {
              var boneIndex = 0;
              for (var bb = 0; bb < bones.length; bb++) {
                if (bones[bb].name === bone.name) {
                  boneIndex = bb;
                  bones[bb].OffsetMatrix = new THREE.Matrix4().fromArray(bone.offsetMatrix);
                  break;
                }
              }
              bone.boneWeights.forEach(function (boneWeight) {
                var index = boneWeight.boneIndex;
                var weight = boneWeight.weight;
                tempBoneWeightData[index][tempBoneCountData[index]] = weight;
                tempBoneIndexData[index][tempBoneCountData[index]] = boneIndex;
                tempBoneCountData[index] += 1;
              });
            });
            var skinWeights = this._array4sToFloat32Array(tempBoneWeightData, indices);
            geometry.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeights, 4));
            var skinIndices = this._array4sToFloat32Array(tempBoneIndexData, indices);
            geometry.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndices, 4));
            mesh = new THREE.SkinnedMesh(geometry, materials.length === 1 ? materials[0] : materials);
            var offsetList = [];
            bones.forEach(function (bone) {
              if (bone.OffsetMatrix) {
                offsetList.push(bone.OffsetMatrix);
              } else {
                offsetList.push(new THREE.Matrix4());
              }
            });
            var skeleton = new THREE.Skeleton(bones, offsetList);
            mesh.add(skeleton.bones[0]);
            mesh.bind(skeleton);
          } else {
            mesh = new THREE.Mesh(geometry, materials.length === 1 ? materials[0] : materials);
          }
          mesh.name = this._currentMesh.name;
          var worldBaseMx = new THREE.Matrix4();
          if (currentObject) {
            var currentMxFrame = currentObject.putBone;
            if (currentMxFrame && currentMxFrame.parent) {
              while (true) {
                currentMxFrame = currentMxFrame.parent;
                if (currentMxFrame) {
                  worldBaseMx.multiply(currentMxFrame.FrameTransformMatrix);
                } else {
                  break;
                }
              }
              mesh.applyMatrix4(worldBaseMx);
            }
          }
          this.meshes.push(mesh);
        }
      }
      // It creates the bone hierarchy from the current object
    }, {
      key: "_makeBones",
      value: function _makeBones(currentFrame, outputBones) {
        var _this5 = this;
        if (currentFrame == null) {
          return;
        }
        var frameTransformationMatrix = new THREE.Matrix4().fromArray(currentFrame.transformation);
        var b = new THREE.Bone();
        b.name = currentFrame.name;
        b.applyMatrix4(frameTransformationMatrix);
        b.FrameTransformMatrix = frameTransformationMatrix;
        if (currentFrame.parentNode) {
          for (var i = 0; i < outputBones.length; i++) {
            if (currentFrame.parentNode.name === outputBones[i].name) {
              outputBones[i].add(b);
              b.parent = outputBones[i];
              break;
            }
          }
        }
        outputBones.push(b);
        currentFrame.childrenNodes.forEach(function (child) {
          _this5._makeBones(child, outputBones);
        });
      }
    }, {
      key: "_makeOutputAnimation",
      value: function _makeOutputAnimation() {
        var _this6 = this;
        if (this._currentAnimation && Object.keys(this._currentAnimation).length > 0) {
          this._currentAnimation.hierarchy = [];
          this._currentAnimation.boneAnimations.forEach(function (boneAnimation) {
            var boneAnimKeys = [];
            if (boneAnimation.positionKeys.length > 0) {
              boneAnimation.positionKeys.forEach(function (vectorKey, index) {
                var vector = new THREE.Vector3(vectorKey.data[0], vectorKey.data[1], vectorKey.data[2]);
                if (typeof boneAnimKeys[index] != "undefined") {
                  boneAnimKeys[index].pos = vector;
                } else {
                  boneAnimKeys.push({
                    time: vectorKey.time,
                    pos: vector
                  });
                }
              });
            }
            if (boneAnimation.scaleKeys.length > 0) {
              boneAnimation.scaleKeys.forEach(function (vectorKey, index) {
                var vector = new THREE.Vector3(vectorKey.data[0], vectorKey.data[1], vectorKey.data[2]);
                if (typeof boneAnimKeys[index] != "undefined") {
                  boneAnimKeys[index].scl = vector;
                } else {
                  boneAnimKeys.push({
                    time: vectorKey.time,
                    scl: vector
                  });
                }
              });
            }
            if (boneAnimation.rotationKeys.length > 0) {
              boneAnimation.rotationKeys.forEach(function (quaternionKey, index) {
                var quaternion = new THREE.Quaternion(quaternionKey.data[1], quaternionKey.data[2], quaternionKey.data[3], quaternionKey.data[0] * -1);
                if (typeof boneAnimKeys[index] != "undefined") {
                  boneAnimKeys[index].rot = quaternion;
                } else {
                  boneAnimKeys.push({
                    time: quaternionKey.time,
                    rot: quaternion
                  });
                }
              });
            }
            if (boneAnimation.matrixKeys.length > 0) {
              boneAnimation.matrixKeys.forEach(function (matrixKey, index) {
                var matrix = new THREE.Matrix4().fromArray(matrixKey.data);
                if (typeof boneAnimKeys[index] != "undefined") {
                  boneAnimKeys[index].rot = new THREE.Quaternion().setFromRotationMatrix(matrix);
                  boneAnimKeys[index].pos = new THREE.Vector3().setFromMatrixPosition(matrix);
                  boneAnimKeys[index].scl = new THREE.Vector3().setFromMatrixScale(matrix);
                } else {
                  boneAnimKeys.push({
                    time: matrixKey.time,
                    matrix: matrix,
                    rot: new THREE.Quaternion().setFromRotationMatrix(matrix),
                    pos: new THREE.Vector3().setFromMatrixPosition(matrix),
                    scl: new THREE.Vector3().setFromMatrixScale(matrix)
                  });
                }
              });
            }
            _this6._currentAnimation.hierarchy.push({
              name: boneAnimation.name,
              keys: boneAnimKeys,
              parent: ''
            });
          });
          this.animations.push(this._currentAnimation);
        }
      }
    }, {
      key: "_processFrame",
      value: function _processFrame(currentObject) {
        var _this7 = this;
        // Make bone from the current frame object.
        this._boneFromCurrentObject(currentObject);
        currentObject.meshes.forEach(function (currentMesh) {
          _this7._currentMesh = currentMesh;
          _this7._makeOutputMesh(currentObject);
        });
        if (currentObject.animations) {
          currentObject.animations.forEach(function (currentAnim) {
            _this7._currentAnimation = currentAnim;
            _this7._makeOutputAnimation();
          });
        }
        currentObject.childrenNodes.forEach(function (child) {
          _this7._processFrame(child);
        });
      }
    }, {
      key: "_array4sToFloat32Array",
      value: function _array4sToFloat32Array(vectors, indices) {
        var floatArray = [];
        indices.forEach(function (index) {
          var vector = vectors[index];
          floatArray.push(vector[0]);
          floatArray.push(vector[1]);
          floatArray.push(vector[2]);
          floatArray.push(vector[3]);
        });
        return new Float32Array(floatArray);
      }
    }, {
      key: "_vector3sToFloat32Array",
      value: function _vector3sToFloat32Array(vectors, indices) {
        var floatArray = [];
        indices.forEach(function (index) {
          var vector = vectors[index];
          floatArray.push(vector.x);
          floatArray.push(vector.y);
          floatArray.push(vector.z);
        });
        return new Float32Array(floatArray);
      }
    }, {
      key: "_vector2sToFloat32Array",
      value: function _vector2sToFloat32Array(vectors, indices) {
        var floatArray = [];
        indices.forEach(function (index) {
          var vector = vectors[index];
          floatArray.push(vector.x);
          floatArray.push(1 - vector.y);
        });
        return new Float32Array(floatArray);
      }
    }, {
      key: "_boneFromCurrentObject",
      value: function _boneFromCurrentObject(currentObject) {
        if (currentObject == null) {
          return;
        }
        var frameTransformationMatrix = new THREE.Matrix4().fromArray(currentObject.transformation);
        var b = new THREE.Bone();
        b.name = currentObject.name;
        b.applyMatrix4(frameTransformationMatrix);
        //b.matrixWorld.copy(b.matrix);
        b.FrameTransformMatrix = frameTransformationMatrix;
        currentObject.putBone = b;
        if (currentObject.parentNode) {
          currentObject.parentNode.putBone.add(currentObject.putBone);
        }
      }
    }]);
    return XFileLoader;
  }();

  return XFileLoader;

}));
