import React from 'react';

import { Image, ScrollView, View } from 'react-native';
import MImagePicker from 'react-native-image-video-picker-editor'
import Video from 'react-native-video';
import { HandleCrop } from 'react-native-image-video-picker-editor/cropper'



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: [],
      showResult: false
    }
  }
  picker = <MImagePicker
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


  renderVideo(video) {
    console.log('rendering video');
    return (
      <View style={{ height: 300, width: 300 }}>
        <Video
          source={{ uri: video }}
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
          rate={1}
          paused={false}
          volume={1}
          muted={false}
          resizeMode={'cover'}
          onError={(e) => console.log(e)}
          onLoad={(load) => console.log(load)}
          repeat={true}
        >
          <View></View>
        </Video>
      </View>
    );
  }

  renderImage(image) {
    return (
      <Image
        style={{ width: 300, height: 300, resizeMode: 'contain' }}
        source={{ uri: image }}
      />
    );
  }

  renderAsset(image) {
    if (image.type == "photo") {
      return this.renderImage(image.assest);

    }
    return this.renderVideo(image.assest);

  }

  results = () => {
    return (
      <ScrollView>
        {this.state.result.map((i) => (
          <View key={i}>{this.renderAsset(i)}</View>
        ))
        }
      </ScrollView>)
  }

  renderItem = () => {
    if (this.state.showResult) {
      return this.results();
    }
    return this.picker;
  }

  render() {
    return (
      this.renderItem()

    )
  }
}

export default App;

