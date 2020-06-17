# react-native-image-video-picker-editor


iOS/Android image picker with support for camera, video, configurable compression, multiple images and cropping


<p align="left">
</p>

## Important note

I never try it with  react-native < 0.60 

# Install

## Step 1

```bash
npm i react-native-image-video-picker-editor --save
```

## Step 2 Dependencies
```bash
npm @react-native-community/cameraroll @react-native-community/image-editor @react-native-community/masked-view react-native-camera react-native-vector-icons react-native-video react-native-video-helper react-native-easy-view-transformer
```

### iOS

```bash
cd ios
pod install
```

### Android

- **VERY IMPORTANT** Add the following to your `build.gradle`'s . (android/App/build.gradle)

```gradle

android {
  ...
  defaultConfig {
    ...
    missingDimensionStrategy 'react-native-camera', 'general' // <--- insert this line
  }
}

```

## Step 3 link assests
```bash
react-native link
```

## Step 4 Permissions

### iOS add these to info.plist

```bash
Privacy - Photo Library Usage Description  (NSPhotoLibraryUsageDescription)
Privacy - Camera Usage Description (NSCameraUsageDescription)
Privacy - Microphone Usage Description (NSMicrophoneUsageDescription)
```


### Android add these to android/app/src/main/AndroidManifest.xml

```bash
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```

# Manual Installation 
please follow each dependensy document : 

- https://www.npmjs.com/package/@react-native-community/cameraroll
- https://github.com/react-native-community/react-native-image-editor
- https://github.com/react-native-community/react-native-masked-view
- https://github.com/react-native-community/react-native-camera
- https://github.com/oblador/react-native-vector-icons
- https://github.com/react-native-community/react-native-video
- https://github.com/classapp/react-native-video-helper
- https://github.com/Luehang/react-native-easy-view-transformer



## Usage

Import library

```javascript
import MImagePicker from 'react-native-image-video-picker-editor'
import { HandleCrop } from 'react-native-image-video-picker-editor/cropper'
```



```javascript
<MImagePicker
    header={{ nextTitle: "Next", cancelTitle: "Cancel" }}
    onCancel={() => { }}
    onNext={async (param) => {
      param.videoMaxLen = 3; // not set or 0 for unlimited
      param.videoQuality = 'low';
      const res = await HandleCrop(param);
      this.setState({ result: res, showResult: true })
    }}
    cropSize={{ width: 200, height: 200 }}
    maxScale={10}  
    max={4}
    cameraConfig = {{ camerPhotoTile: "Photo", cameraVideoTitle: "Video", cameraCancelTitle: "Cancle", maxVideoLen: 0, videoQuality: "480p" }}
  // profile={true}

  />
```
