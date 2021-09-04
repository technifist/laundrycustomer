import React, {Component} from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Image, Keyboard, PermissionsAndroid, Alert } from 'react-native';
import { Container, Header, Content, Left, Body, Right, Title, Icon, Footer } from 'native-base';
import { Button } from 'react-native-elements';
import MapView, { PROVIDER_GOOGLE,  Polygon  } from 'react-native-maps';
import { height_50, GOOGLE_KEY, LATITUDE_DELTA, LONGITUDE_DELTA, api_url, address, pin, font_title, font_description , polygonsPoints } from '../config/Constants';
import Snackbar from 'react-native-snackbar';
import { serviceActionPending, serviceActionError, serviceActionSuccess, editServiceActionPending, editServiceActionError, editServiceActionSuccess, updateServiceActionPending, updateServiceActionError, updateServiceActionSuccess } from '../actions/AddressActions';
import axios from 'axios';
import { connect } from 'react-redux';
import { Loader } from '../components/GeneralComponents';
import * as colors from '../assets/css/Colors';
import Geolocation from '@react-native-community/geolocation';
import strings from "../languages/strings.js";
import * as geolib from 'geolib';


class Address extends Component<Props> {

  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      this.state = {
        address: strings.please_select_your_location,
        door_no:'',
        mapRegion: null,
        validation:true,
        address_id:this.props.route.params.id,
        open_map:0,
        markerLatLong:{
          latitude:0,
          longitude:0
        }
      }

  }

  add_address = async () => {
    Keyboard.dismiss();
    await this.checkValidate();
    if(this.state.validation){
        this.props.serviceActionPending();
        await axios({
          method: 'post', 
          url: api_url + address,
          data:{ customer_id: global.id, address: this.state.address.toString(), door_no: this.state.door_no, latitude: this.state.latitude, longitude: this.state.longitude }
        })
        .then(async response => {
            await this.props.serviceActionSuccess(response.data);
            await this.redirect(response.data);
        })
        .catch(error => {
            this.showSnackbar(strings.sorry_something_went_wrong);
            this.props.serviceActionError(error);
        });
    }
  }

  redirect = async (data) =>{
    if(data.status == 1){
     this.handleBackButtonClick();
    }else{
      alert(data.message);
    }
  }

  checkValidate(){
    if(this.state.door_no == '' ){
      this.state.validation = false;
      this.showSnackbar(strings.please_enter_door_number);
      return true;
    }else if(this.state.address == strings.please_select_your_location ){
      this.state.validation = false;
      this.showSnackbar(strings.please_select_your_location_in_map);
      return true;
    }else{
      this.state.validation = true;
    }
    
  }

  showSnackbar(msg){
    Snackbar.show({
      title:msg,
      duration: Snackbar.LENGTH_SHORT,
    });
  }

  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
  }

  async componentDidMount() {   
    
    if(Platform.OS === "ios"){
       await this.findType();
    }else{
       await this.requestCameraPermission();
    }
    
  }

  async requestCameraPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,{
                'title': strings.location_access_required,
                'message': strings.rith_laundry_needs_to_access_your_location_for_tracking
            }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            await this.findType();
        } else {
           await this.handleBackButtonClick();
        }
    } catch (err) {
        console.log(err)
        //await this.handleBackButtonClick();
    }
  }

  async findType(){
    if(this.state.address_id == 0){
      await this.getInitialLocation();
    }else{
      await this.edit_address();
    }
  }

  edit_address = async () => {
    this.props.editServiceActionPending();
    await axios({
      method: 'get', 
      url: api_url+address+'/'+this.state.address_id+'/edit' ,
    })
    .then(async response => {
        await this.props.editServiceActionSuccess(response.data);
        await this.setState({ open_map:1 })
        await this.setLocation();
    })
    .catch(error => {
        this.showSnackbar(strings.sorry_something_went_wrong);
        this.props.editServiceActionError(error);
    });
  }

  setLocation(){
    let region = {
      latitude: parseFloat(this.props.data.latitude),
      longitude: parseFloat(this.props.data.longitude),
      latitudeDelta:  LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA
    }
    this.setState({ address : this.props.data.address, door_no : this.props.data.door_no, mapRegion: region })
  }

  update_address = async () => {
    Keyboard.dismiss();
    await this.checkValidate();
    if(this.state.validation){
        this.props.updateServiceActionPending();
        await axios({
          method: 'patch', 
          url: api_url+address+'/'+this.state.address_id,
          data:{ customer_id: global.id, address: this.state.address.toString(), door_no: this.state.door_no, latitude: this.state.latitude, longitude: this.state.longitude }
        })
        .then(async response => {
            await this.props.updateServiceActionSuccess(response.data);
            await this.redirect(response.data);
        })
        .catch(error => {
            this.showSnackbar(strings.sorry_something_went_wrong);
            this.props.updateServiceActionError(error);
        });
    }
  }

  async getInitialLocation(){

    await Geolocation.getCurrentPosition( async(position) => {
      this.setState({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      let region = {
        latitude:       await position.coords.latitude,
        longitude:      await position.coords.longitude,
        latitudeDelta:  LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }

      let markerLocation ={
        latitude:       await position.coords.latitude,
        longitude:      await position.coords.longitude,
      }

      this.setState({ mapRegion: region, open_map:1, markerLatLong:markerLocation });
      
    }, error => console.log(error) , 
    {enableHighAccuracy: false, timeout: 10000 });
  }


  onRegionChange = async(value) => {
    this.setState({ address : strings.please_wait });

    let body = {
      latitude: value.latitude ,
      longitude: value.longitude,
    }

    let isValid = geolib.isPointInPolygon(body, polygonsPoints);
    this.setState({markerLatLong:body})
    if(isValid){
     
      fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + value.latitude + ',' + value.longitude + '&key=' + GOOGLE_KEY)
        .then((response) => response.json())
        .then(async(responseJson) => {
           if(responseJson.results[0].formatted_address != undefined){
              this.setState({ address : responseJson.results[0].formatted_address, latitude: value.latitude, longitude: value.longitude });
           }else{
              this.setState({ address : strings.sorry_something_went_wrong });
           }
      }) 
    }

    else {
      Alert.alert(
        "Error",
         strings.service_area_restriction_message,
        [
          {
            text: "Ok",
            onPress: () => {}
          },
        ],
        {cancelable: true},
      );
    }
  }


  onMarkerDragEnd = async(lat, long) => {
    this.setState({ address : strings.please_wait });

    let body = {
      latitude: lat,
      longitude: long
    }

    let isValid = geolib.isPointInPolygon(body, polygonsPoints);

    this.setState({markerLatLong:body})

    if(isValid){
      fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + lat + ',' + long + '&key=' + GOOGLE_KEY)
        .then((response) => response.json())
        .then(async(responseJson) => {
           if(responseJson.results[0].formatted_address != undefined){
              this.setState({ address : responseJson.results[0].formatted_address, latitude: lat, longitude: long });
           }else{
              this.setState({ address : strings.sorry_something_went_wrong });
           }
      }) 
    }

    else {
      Alert.alert(
        "Error",
         strings.service_area_restriction_message,
        [
          {
            text: "Ok",
            onPress: () => {}
          },
        ],
        {cancelable: true},
      );
    }
  }

  render() {

    const { isLoding } = this.props

    let mapRegionNew =  {
      latitude:30.6909292,
      longitude:73.0840975,
      latitudeDelta:  LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA
    }
    

    return (
      <Container keyboardShouldPersistTaps='always' style={{ backgroundColor: colors.theme_bg_three }} > 
        <Header androidStatusBarColor={colors.theme_bg} style={styles.header} >
          <Left style={{ flex: 1 }} >
            <Icon onPress={this.handleBackButtonClick} style={styles.icon} name='arrow-back' />
          </Left>
          <Body style={styles.header_body} >
            <Title style={styles.title} >{strings.create_address}</Title>
          </Body>
          <Right />
        </Header>
        
        {this.state.open_map == 1 && <Content keyboardShouldPersistTaps='always'>
          <View style={styles.content} >
           <MapView
               provider={PROVIDER_GOOGLE} 
               style={styles.map}
               maxZoomLevel={20}
               minZoomLevel={1}
               //scrollEnabled={false}
               initialRegion={this.state.mapRegion}
              // showsUserLocation={true}
               showsMyLocationButton={false}
               onRegionChangeComplete={(region) => {
                  this.onRegionChange(region); 
               }}
            >
              <Polygon
                coordinates={polygonsPoints}
                strokeColor={colors.theme_bg_three} // fallback for when `strokeColors` is not supported by the map-provider
                strokeWidth={0}
                fillColor='rgba(28,85,112,0.2)'
              />
             
               {/* <MapView.Marker
                  draggable={true}
                  onDragEnd={(e) => { 
                    console.log('dragEnd', e.nativeEvent.coordinate)
                    this.onMarkerDragEnd(
                      e?.nativeEvent?.coordinate?.latitude,
                      e?.nativeEvent?.coordinate?.longitude,
                    );
                  }}
                  coordinate={this.state.markerLatLong}
                /> */}
            </MapView>
            <View style={styles.location_markers}>
              <View style={styles.pin} >
                <Image
                  style= {{flex:1 , width: undefined, height: undefined}}
                  source={pin}
                />
              </View>
            </View>
          </View>
          <View style={styles.address_content} >
            <View style={{ flexDirection:'row' }} >
              <Left>
                <Text style={styles.landmark_label} >{strings.door_number} / {strings.landmark}</Text>
              </Left>
            </View> 
            <View style={styles.landmark_content} >
              <TextInput 
                style={styles.landmark_text}
                onChangeText={ TextInputValue =>
                  this.setState({door_no : TextInputValue }) }
                value={this.state.door_no}
              />
            </View>
            <View style={{ marginTop:20 }} />
            <View style={{ flexDirection:'row' }} >
              <Left>
                <Text style={styles.address_label} >{strings.address}</Text>
              </Left>
            </View> 
            <View style={{ flexDirection:'row' }} >
              <Left>
                <Text style={styles.address_text} >
                  {this.state.address}
                </Text>
              </Left>
            </View>
          </View>
        </Content>}
        {this.state.open_map == 1 && <Footer style={styles.footer} >
          <View style={styles.footer_content}>
            <Button
              title={strings.done}
              onPress={ this.state.address_id != 0 ? this.update_address : this.add_address}
              buttonStyle={styles.done}
              titleStyle={{color:colors.theme_bg_three,fontFamily:font_description}}
            />
          </View>
        </Footer>}
        <Loader visible={isLoding} />
      </Container>

    );
  }
}

function mapStateToProps(state){
  return{
    isLoding : state.address.isLoding,
    message : state.address.isLoding,
    status : state.address.isLoding,
    data : state.address.data
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data)),
    editServiceActionPending: () => dispatch(editServiceActionPending()),
    editServiceActionError: (error) => dispatch(editServiceActionError(error)),
    editServiceActionSuccess: (data) => dispatch(editServiceActionSuccess(data)),
    updateServiceActionPending: () => dispatch(updateServiceActionPending()),
    updateServiceActionError: (error) => dispatch(updateServiceActionError(error)),
    updateServiceActionSuccess: (data) => dispatch(updateServiceActionSuccess(data))
});

export default connect(mapStateToProps,mapDispatchToProps)(Address);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  header:{
    backgroundColor:colors.theme_bg_three
  },
  icon:{
    color:colors.theme_fg_two
  },
  header_body: {
    flex: 3,
    justifyContent: 'center'
  },
  title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'center', 
    fontSize:16, 
    fontFamily:font_title
  },
  map: {
    width:'100%',
    height:height_50
  },
  location_markers: {
    position: 'absolute',
  },
  content: {
    alignItems:'center', 
    justifyContent:'center'
  },
  pin:{
    height:30, 
    width:25, 
    top:-15 
  },
  address_content:{
    width:'100%', 
    padding:20, 
    backgroundColor:colors.theme_bg_three, 
    marginBottom:10 
  },
  landmark_label:{
    fontSize:15, 
    fontFamily:font_title, 
    color:colors.theme_fg_two 
  },
  landmark_content:{
    width:'100%', 
    marginTop:5 
  },
  landmark_text:{
    borderColor: colors.theme_fg, 
    borderBottomWidth: 1, 
    padding:10, 
    borderRadius:5, 
    height:40,
    fontFamily:font_description
  },
  address_label:{
    fontSize:15, 
    fontFamily:font_title, 
    color:colors.theme_fg_two
  },
  address_text:{
    fontSize:15, 
    marginTop:5,
    fontFamily:font_description
  },
  footer:{
    backgroundColor:colors.theme_bg_three
  },
  footer_content:{
    width:'90%', 
    justifyContent:'center'
  },
  done:{
    backgroundColor:colors.theme_bg
  }
});