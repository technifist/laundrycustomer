import React, {Component} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Container, Header, Content, Left, Body, Right, Title, Button, Icon, Row } from 'native-base';
import * as colors from '../assets/css/Colors';
import { Loader } from '../components/GeneralComponents';
import { api_url, privacy,font_title, font_description } from '../config/Constants';
import axios from 'axios';
import { connect } from 'react-redux';
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/PrivacyActions';
import strings from "../languages/strings.js";

class PrivacyPolicy extends Component<Props> {

  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      this.privacy_policy();
  }

  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
  }

  privacy_policy = async () => {
    this.props.serviceActionPending();
    await axios({
      method: 'post', 
      url: api_url + privacy,
      data:{ lang: global.lang }
    })
    .then(async response => {
        await this.props.serviceActionSuccess(response.data)
    })
    .catch(error => {
        this.props.serviceActionError(error);
    });
  }

  render() {

    const { isLoding, error, data, message, status } = this.props

    return (
      <Container>
        <Header androidStatusBarColor={colors.theme_bg} style={styles.header} >
          <Left style={{ flex: 1 }} >
            <Button transparent onPress={this.handleBackButtonClick}>
              <Icon style={styles.icon} name='arrow-back' />
            </Button>
          </Left>
          <Body style={styles.header_body} >
            <Title style={styles.title} >{strings.privacy_policy}</Title>
          </Body>
          <Right />
        </Header>
        <Content style={{ padding:10 }} >
          {data.map((row, index) => (
            <View>
              <Row>
                <Text style={styles.policy_title}>{row.title}</Text>
              </Row>
              <Row>
                <Text style={styles.description}>{row.description}</Text>
              </Row>
              <View style={{ margin:10 }} />
            </View>
          ))}
        </Content>
        <Loader visible={isLoding} />
      </Container>
    );
  }
}

function mapStateToProps(state){
  return{
    isLoding : state.privacy.isLoding,
    error : state.privacy.error,
    data : state.privacy.data,
    message : state.privacy.message,
    status : state.privacy.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data))
});


export default connect(mapStateToProps,mapDispatchToProps)(PrivacyPolicy);

const styles = StyleSheet.create({
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
  policy_title:{
    fontSize:16, 
    fontFamily:font_title, 
    color:'#202028'
  },
  description:{
    fontSize:13, 
    marginTop:5,
    fontFamily:font_description
  }
});
