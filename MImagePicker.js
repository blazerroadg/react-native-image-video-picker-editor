import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Platform,
  SafeAreaView,
  PermissionsAndroid,
  Image,
  Modal,
  TouchableHighlight,
  ActivityIndicator,
  Alert
} from 'react-native'


import ViewTransformer from "react-native-easy-view-transformer"
import CameraRoll from "@react-native-community/cameraroll";
import Icon from 'react-native-vector-icons/Entypo';
import MaskedView from '@react-native-community/masked-view';
import Video from 'react-native-video';
import MCamera from './MCamera'

import MImageTitle from './MImageTitle'
import { MButton } from './MButton';
import { VidoUri } from './cropper'
const { width, height } = Dimensions.get('window')

const HEADER_MAX_HEIGHT = width;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 10 : 20;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;



export default class MImagePicker extends React.Component {
  constructor(props) {
    super(props)
    this.transformView = React.createRef()
    this.state = {
      photos: [],
      selected: [],
      after: null,
      hasNextPage: true,
      scrollY: new Animated.Value(
        Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
      ),
      refreshing: false,
      defaultImage: null,
      contentInset: HEADER_MAX_HEIGHT,
      cropperParams: [],
      loading: false,
      showCamera: false,
      mute: false,
      singleSelect: false
    }
  }

  transformerPressed = () => {
    this.setState({
      scrollY: new Animated.Value(
        Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
      )
    })
  }



  setTransform = (filename) => {
    if (!this.transformView.current) {
      return;
    };
    let ifi = filename ? filename : this.state.defaultImage.filename;
    const trans = this.state.cropperParams.find(t => t.filename == ifi);
    if (trans) {
      this.transformView.current.updateTransform({ scale: trans.cropperParams.scale, translateX: trans.cropperParams.positionX, translateY: trans.cropperParams.positionY });
      return;
    }
    this.transformView.current.updateTransform({ scale: 1, translateX: 0, translateY: 0 });
  }


  setCropperParams = cropperParams => {
    const param = { positionX: cropperParams.translateX, positionY: cropperParams.translateY, scale: cropperParams.scale }
    let params = Array.from(this.state.cropperParams)
    const image = this.state.defaultImage;
    if (params.length == 0) {
      params.push({ filename: image.filename, cropperParams: param });
      this.setState({ cropperParams: params });
      return;
    }
    const crparamIndex = params.findIndex(t => t.filename == image.filename);
    if (crparamIndex === - 1) {
      params.push({ filename: image.filename, cropperParams: param });
      this.setState({ cropperParams: params });
      return;
    }
    params[crparamIndex] = { ...params[crparamIndex], cropperParams: param };
    this.setState({ cropperParams: params });
  };


  async componentDidMount() {

    await this.andriodAccess();
    await this.setDefualt();
    await this.getPhotos();
    this.setState({ singleSelect: this.props.profile || this.props.max == 1 });
    this.setState({ badgeColor: this.props.badgeColor ? this.props.badgeColor : 'white' })
  }

  selectImage = (index) => {

    let newSelected = Array.from(this.state.selected)
    const maxVideoLen = this.props.maxVideoLen || 0;
    if (newSelected.indexOf(index) === -1) {
      const selected = this.state.photos[index];
      if (Platform.Version <= 18 && Platform.OS == "android" && maxVideoLen > 0 && selected.node.image.playableDuration > maxVideoLen) {
        Alert.alert("Alert", `Please select the video lenght under ${maxVideoLen} sec or update your andriod version to abvoe 18`, [
          {
            text: "Ok",
          }
        ],
          { cancelable: true })
        return;
      }

      newSelected.push(index)
      if ((this.props.max === 1 || this.props.profile) && newSelected.length > 1) {
        newSelected.splice(0, 1)
      }
    } else {
      const deleteIndex = newSelected.indexOf(index)
      if (this.state.photos[newSelected[deleteIndex]].node.image.filename == this.state.defaultImage.filename) {
        newSelected.splice(deleteIndex, 1)
      }
      else {
        this.setState(
          {
            defaultImage: this.state.photos[newSelected[deleteIndex]].node.image,
            scrollY: new Animated.Value(
              Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
            )

          })
        this.setTransform(this.state.photos[newSelected[deleteIndex]].node.image.filename);

        return;
      }
    }

    if (newSelected.length > this.props.max && this.props.max != 1) return

    if (newSelected.length === 0) newSelected = []
    const inx = newSelected.length - 1;
    if (!this.state.photos[newSelected[inx]]) return;
    this.setState(
      {
        selected: newSelected,
        defaultImage: this.state.photos[newSelected[inx]].node.image,
        scrollY: new Animated.Value(
          Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
        )

      })
    this.setTransform(this.state.photos[newSelected[inx]].node.image.filename);

  }

  showCamera = () => {
    this.setState({ showCamera: true })
  }


  andriodAccess = async () => {
    if (Platform.OS === "ios") return;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          'title': 'Access Storage',
          'message': 'Access Storage for the pictures'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use read from the storage")
      } else {
        console.log("Storage permission denied")
      }
      const granted2 = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          'title': 'Access Storage',
          'message': 'Access Storage for the pictures'
        }
      )
      if (granted2 === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use read from the storage")
      } else {
        console.log("Storage permission denied")
      }
    } catch (err) {
      console.warn(err)
    }
  }




  setDefualt = async () => {
    const assetType = this.props.assetType ? this.props.assetType : 'All';
    let params = { first: 1, assetType: assetType }
    var res = await CameraRoll.getPhotos(params);
    if (res.edges.length > 0) {
      this.setState(
        {
          defaultImage: res.edges[0].node.image
        })
    }
  }

  getPhotos = async () => {
    let assetType = this.props.assetType ? this.props.assetType : 'All';
    if (this.props.profile) assetType = 'Photos';
    let params = { first: 10, assetType: assetType }
    if (this.state.after) params.after = this.state.after
    if (!this.state.hasNextPage) return
    var res = await CameraRoll.getPhotos(params);
    this.processPhotos(res)
  }

  processPhotos = (assets) => {
    if (this.state.after === assets.endCursor) return
    this.setState({
      photos: [...this.state.photos, ...assets.edges],
      after: assets.page_info.end_cursor,
      hasNextPage: assets.page_info.has_next_page
    })
  }

  getItemLayout = (data, index) => {
    let length = width / 4
    return { length, offset: length * index, index }
  }

  prepareCallback = () => {
    let { selected, photos } = this.state
    const selectedPhotos = selected.map(i => photos[i])
    const assetsInfo = Promise.all(selectedPhotos.map(i => MediaLibrary.getAssetInfoAsync(i)))
    this.props.callback(assetsInfo)
  }
  UUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  photoTaked = (param) => {
    const { type, assest } = param;
    if (type === "video") {
      assest.playableDuration = 30;
    }
    assest.filename = this.UUID() + '.mov'

    const nsl = [...this.state.selected];
    for (let index = 0; index < nsl.length; index++) {
      nsl[index] = nsl[index] + 1;
    }
    const nnsl = [0, ...nsl];
    this.setState(
      {
        defaultImage: assest,
        photos: [{ node: { image: assest } }, ...this.state.photos],
        selected: nnsl,
        showCamera: false
      })
  }

  next = () => {
    this.props.onNext({ selected: this.state.selected, photos: this.state.photos, cropperParams: this.state.cropperParams, cropSize: this.props.cropSize, HEADER_MAX_HEIGHT })
  }

  renderHeader = () => {
    let selectedCount = this.state.selected.length

    let headerText = `${selectedCount} ${this.props.headerSelectText ? this.props.headerSelectText : 'Selected'}`
    if (selectedCount === this.props.max) headerText = headerText + ' (Max)'
    const headerCloseText = this.props.headerCloseText ? this.props.headerCloseText : 'Close'
    const headerDoneText = this.props.headerDoneText ? this.props.headerDoneText : 'Done'
    const headerButtonColor = this.props.headerButtonColor ? this.props.headerButtonColor : '#007aff'

    return (
      <SafeAreaView forceInset={{ top: 'always' }} style={{ height: 52 }}>
        <View style={styles.header}>

          <MButton
            color={headerButtonColor}
            title={headerCloseText}
            onPress={() => this.props.callback(Promise.resolve([]))}
          />
          <MButton
            onPress={toggleCamera}
            style={{ backgroundColor: 'transparent' }}
            textSyle={{ color: "blue" }}
          >
            <Icon name="camera" size={40} color="white" />
          </MButton>

          <Text style={styles.headerText}>{headerText}</Text>
          <MButton
            color={headerButtonColor}
            title={headerDoneText}
            onPress={() => this.prepareCallback()}
          />

        </View>
      </SafeAreaView>
    )
  }


  renderImageTile = ({ item, index }) => {
    const selected = this.state.selected.indexOf(index) !== -1
    let selectedItemCount = this.state.selected.indexOf(index) + 1
    if (this.props.max == 1) {
      selectedItemCount = "";
    }


    return (
      <MImageTitle
        item={item}
        selectedItemCount={selectedItemCount}
        index={index}
        camera={false}
        selected={selected}
        selectImage={this.selectImage}
        badgeColor='white'
        paddingTop={Platform.OS !== 'ios' ? HEADER_MAX_HEIGHT : 0}
        singleSelect={this.state.singleSelect}
      />
    )
  }

  renderLoading = () => {
    return (
      <View style={styles.emptyContent}>
        <ActivityIndicator size='large' color={this.props.loadingColor ? this.props.loadingColor : '#bbb'} />
      </View>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContent}>
        <Text style={styles.emptyText}>{this.props.emptyText ? this.props.emptyText : 'No image'}</Text>
      </View>
    )
  }


  renderAsset(image) {
    if (this.props.profile) {
      return this.renderProfile(image);
    }
    if (image.playableDuration > 0) {
      return this.renderVideo(image);
    }

    return this.renderImage(image);
  }
  bufferConfig = {
    minBufferMs: 2000,
    maxBufferMs: 2000,
  }


  renderVideo(video) {
    const videoUri = VidoUri(video);

    return (
      <TouchableHighlight
        style={{ height: width, width: width, backgroundColor: "#ccc" }}
        onPress={() => this.setState({
          mute: !this.state.mute,
          scrollY: new Animated.Value(
            Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
          )
        })}
      >
        <Video
          bufferConfig={this.bufferConfig}
          key={this.state.defaultImage.filename}
          source={{ uri: videoUri }}
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
          rate={1}
          paused={false}
          volume={1}
          muted={this.state.mute}
          resizeMode={'cover'}
          onError={(e) => console.log(e)}
          onLoad={(load) => console.log(load)}
          repeat={true}
        >
          <View></View>
        </Video>
      </TouchableHighlight>
    );
  }

  renderProfile(image) {
    return (
      <View style={{
        width: width, height: width, backgroundColor: 'black'
      }}>

        <MaskedView
          style={{
            height: width, width: width
          }}
          maskElement={
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                alignItems: 'center',
                justifyContent: 'center',
                height: width, width: width,

              }}
            >
              <View style={{
                width: width - (width / 10),
                height: width - (width / 10),
                borderRadius: (width - (width / 10)) / 2,
                backgroundColor: 'black',
              }} />
            </View>
          }
        >
          <ViewTransformer
            ref={this.transformView}
            maxScale={this.props.maxScale}
            onTransformGestureReleased={(e) => this.setCropperParams(e)}
            onSingleTapConfirmed={this.transformerPressed}
            style={{ backgroundColor: "#ccc", position: 'absolute', width: '100%', height: '100%', zIndex: 10 }}
          >
            <Image source={{ uri: image.uri }} style={{ width: width, height: width }} />

          </ViewTransformer>
        </MaskedView>
      </View>
    );
  }
  renderImage(image) {
    return (
      <ViewTransformer
        ref={this.transformView}
        maxScale={this.props.maxScale}
        onTransformGestureReleased={(e) => this.setCropperParams(e)}
        onSingleTapConfirmed={this.transformerPressed}
        style={{ backgroundColor: "#ccc" }}
        onLayout={() => this.setTransform()}
      >
        <Image source={{ uri: image.uri }} style={{ width: width, height: width }} />
      </ViewTransformer>
    );
  }
  renderImages = () => {

    const scrollY = Animated.add(
      this.state.scrollY,
      Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0,
    );
    const headerTranslate = scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, -HEADER_SCROLL_DISTANCE],
      extrapolate: 'clamp',
    });
    const { nextTitle, cancelTitle } = this.props.header



    return (

      <SafeAreaView style={styles.container}>
        {this.state.loading && this.activityIndicatorModla}
        <View style={styles.headerContainer}>
          <MButton
            onPress={this.props.onCancel}
            style={{ backgroundColor: 'white' }}
            textSyle={{ color: 'blue' }}
            title={cancelTitle} />
          <MButton
            onPress={this.showCamera}
            style={{ backgroundColor: 'white' }}
          >
            <Icon name="camera" size={30} color="black" />
          </MButton>
          <MButton
            onPress={this.next}
            style={{ backgroundColor: 'white' }}
            textSyle={{ color: 'blue' }}
            title={nextTitle} />

        </View>
        <View style={styles.fill}>
          <Animated.FlatList
            contentInset={{
              top: HEADER_MAX_HEIGHT,
            }}
            contentOffset={{
              y: -HEADER_MAX_HEIGHT,
            }}

            style={[styles.fill]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
              { useNativeDriver: true },
            )}
            data={this.state.photos}
            numColumns={4}

            renderItem={this.renderImageTile}
            keyExtractor={(_, index) => index}
            onEndReached={this.getPhotos}
            onEndReachedThreshold={height / 5}
            initialNumToRender={10}
            removeClippedSubviews={true}
          />
          <Animated.View
            style={[
              styles.header,
              { transform: [{ translateY: headerTranslate }], justifyContent: 'center', alignItems: 'center', backgroundColor: "#ccc" },
            ]}
          >
            {
              this.state.defaultImage && this.renderAsset(this.state.defaultImage)
            }

          </Animated.View>
        </View>

      </SafeAreaView>

    )
  }
  camera = () => {
    const config = this.props.cameraConfig || { camerPhotoTile: "Photo", cameraVideoTitle: "Video", cameraCancelTitle: "Cancle", maxVideoLen: 0, videoQuality: "480p" }
    return (
      <Modal style={{ width: width, height: height }}>
        <MCamera
          onCancle={() => this.setState({ showCamera: false })}
          onPhotoTaked={this.photoTaked}
          config={config}
        />
      </Modal>)
  }
  activityIndicatorModla =
    <Modal
      animationType="fade"
      transparent style={{ width: width - 20, height: height - 20 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <ActivityIndicator size="large" color="white" style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }} />
        </View>
      </SafeAreaView>
    </Modal>


  render() {
    return (
      <View style={styles.container}>
        {this.state.showCamera ? this.camera() : this.renderImages()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'white',
    width: '100%',
    height: 50,
    borderBottomColor: 'white',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 20,
    paddingLeft: 20
  },
  container: {
    flex: 1
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 19
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: '#bbb',
    fontSize: 20
  },
  fill: {
    flex: 1,
    width: '100%'
  },
  content: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    height: HEADER_MAX_HEIGHT,
    borderBottomColor: 'white',
    borderBottomWidth: 1
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: HEADER_MAX_HEIGHT,
    resizeMode: 'cover',

  },
  bar: {
    backgroundColor: 'transparent',
    marginTop: Platform.OS === 'ios' ? 28 : 38,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  title: {
    color: 'white',
    fontSize: 18,
  },
  scrollViewContent: {
    paddingTop: Platform.OS !== 'ios' ? HEADER_MAX_HEIGHT : 0,
  },
  row: {
    height: 40,
    margin: 16,
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flex: 1,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  imageContainerDeep: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flex: 1,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },

})
