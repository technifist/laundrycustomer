import React, {Component} from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { Container, Header, Left, Body, Right, Title, Icon, Row, Footer, Col, List, ListItem } from 'native-base';
import { Button, Divider } from 'react-native-elements';
import { Loader } from '../components/GeneralComponents';
import { connect } from 'react-redux';
import {  font_title, font_description  } from '../config/Constants';
import { subTotal, total, calculatePricing, selectDate, reset } from '../actions/CartActions';
import {addToCart } from '../actions/ProductActions';
import DateTimePicker from "react-native-modal-datetime-picker";
import Snackbar from 'react-native-snackbar';
import * as colors from '../assets/css/Colors';
import strings from "../languages/strings.js";
import EvilIcons from "react-native-vector-icons/EvilIcons";

class Cart extends Component<Props> {

  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      //this.add_to_cart = this.add_to_cart.bind(this);
      this.state = {
        deliveryDatePickerVisible : false,
        isLoding: true        
      }
  }

  async componentDidMount(){
  this._unsubscribe=this.props.navigation.addListener('focus',()=>{
    this.calculate_total();
  });
}
componentWillUnmount(){
  this._unsubscribe();
}

  showDeliveryDatePicker = () => {
    this.setState({ deliveryDatePickerVisible: true });
  };
 
  hideDeliveryDatePicker = () => {
    this.setState({ deliveryDatePickerVisible: false });
  };
 
  handleDeliveryDatePicked = async(date) => {
    this.setState({ deliveryDatePickerVisible: false })
    var d = new Date(date);
    let delivery_date = d.getDate() + '/' + ("0" + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
    await this.props.selectDate(delivery_date);
  };





calculate_total(){
  this.props.calculatePricing();

  console.log("this.props?.promo", this.props?.promo)
 
  if(this.props?.promo && this.props?.promo === undefined){
    let net_total = parseFloat(this.props.sub_total);
    let total = net_total;
    this.props.total({ promo_amount:0, total: total});
  }else{
    if(this.props?.promo?.promo_type == 1){
      let total_without_discount = parseFloat(this.props.sub_total - this.props?.promo?.discount);
      let net_total = total_without_discount;
      let total = net_total;
      if(total > 0){
        this.props.total({ promo_amount:this.props?.promo?.discount, total: total });
      }else{
         this.setState({isLoding:false});
        // alert('Sorry this promo is not valid!');
      }
      
    }else{
      let discount = this.props?.promo?.discount  ?  (this.props?.promo?.discount /100) * this.props.sub_total : 0;

      console.log("discount", discount)

      let total_without_discount = parseFloat(this.props.sub_total - discount);
      let net_total = total_without_discount;
      let total = net_total;

      console.log("total", total)

      if(total >= 0){
        this.props.total({ promo_amount: discount, total: total});
      }else{
        this.setState({isLoding:false});
        // alert('Sorry this promo is not valid!');
      }
    }
  }
}


  handleBackButtonClick= () => {
      // this.props.navigation.goBack("Product2", {id:this.state.service_id, service_name:this.state.service_name});
      this.props.navigation.goBack(null);
  }

  address_list = () => {
    this.props.navigation.navigate('AddressList');
  }

  select_address = () => {
    if(this.props.delivery_date != undefined){
      this.props.navigation.navigate('AddressList',{ from:'cart' });
    }else{
      this.showSnackbar(strings.please_choose_delivery_date);
    }
    
  }

  showSnackbar(msg){
    Snackbar.show({
      title:msg,
      duration: Snackbar.LENGTH_SHORT,
    });
  }

  applyPromo = () => {
    this.props.navigation.navigate('Promo');
  }


  add_to_cart = async (qty,product_id,product_name,price, service_id) => {
   
     let cart_items = this.props.cart_items;
     let old_product_details = this.props.cart_items[service_id + '-' + product_id];
     let sub_total = parseFloat(this.props.sub_total);
     let total_price = parseFloat(price);

     console.log("total_price", total_price)

        delete this.props.cart_items[service_id + '-' + product_id];
        await this.props.addToCart(this.props.cart_items);
        await this.props.subTotal(parseFloat(sub_total) - parseFloat(total_price));
        
       // totalPrice - parseFloat(total_price)
        let promoAmount = this.props?.promo_amount

       
       //console.log("promoAmount", promoAmount)
      // console.log('totalPrice', totalPrice)

       if(this.props?.promo && this.props?.promo !== undefined){

        let discount = this.props?.promo?.discount  ?  (this.props?.promo?.discount /100) * this.props.sub_total : 0;
        let total_without_discount = parseFloat(this.props.sub_total - discount);
        this.props.total({ promo_amount:discount , total: total_without_discount});

        let cartData = Object.keys(this.props.cart_items).map((key)=> { 
          return {
            quantit:cart_items[key].qty,
            name:cart_items[key].product_name,
            price:cart_items[key].price,
            product_id:cart_items[key].product_id,
            service_id:cart_items[key].service_id
          }
        })
        
        if(cartData?.length === 0){
          this.props.reset()
        }

        console.log("cartData", cartData)

       }
       else {
        let promoAmount = this.props?.promo_amount
        let totalPrice = parseFloat(sub_total) - parseFloat(total_price) 
        this.props.total({ promo_amount: promoAmount, total: totalPrice});
       }

       
  }

  render() {

    const { isLoding,cart_items, sub_total, total_amount, promo_amount, delivery_date } = this.props
    console.log("promo", this.props.promo)
    console.log("promo_amount", promo_amount)
    if(isLoding) return null

    return (
      <Container>
        <Header androidStatusBarColor={colors.theme_bg} style={styles.header} >
          <Left style={{ flex: 1 }} >
            <Icon onPress={this.handleBackButtonClick} style={styles.icon} name='arrow-back' />
          </Left>
          <Body style={styles.header_body} >
            <Title style={styles.title} >{strings.cart}</Title>
          </Body>
          <Right />
        </Header>
        <ScrollView>
          <Divider style={{ backgroundColor: colors.theme_fg_two }} />
          <Row style={{ padding:10 }} >
            <Left>
              <Text>{strings.your_clothes}</Text>
            </Left>
          </Row>
          <List>
          {Object.keys(cart_items).map((key)=> {
            return <ListItem>
              <Row>
                <Col style={{ width:50 }} >
                  <Text style={styles.qty} >{cart_items[key].qty}x</Text>
                </Col>
                <Col>
                  <Text>{cart_items[key].product_name}( {cart_items[key].service_name} )</Text>
                </Col>
                <Col style={{ width:60 }} >
                  <Text>{global.currency}{cart_items[key].price}</Text>
                </Col>
                <Col style={styles.crossItem}>
                  <Pressable style={styles.crossItem} 
                    onPress={() => {
                      this.add_to_cart(cart_items[key].qty, cart_items[key].product_id ,cart_items[key].product_name,cart_items[key].price, cart_items[key].service_id)
                    }}
                  >
                     <EvilIcons name='close-o' color='red' size={32} />
                  </Pressable>
                </Col>
              </Row>
            </ListItem> 
          })}
          </List>
          {promo_amount === 0 && 
          <Row style={{ padding:20 }} >
            <Col style={{ width:60 }} >
              <Icon style={{ color:colors.theme_fg_two }} name='pricetag' />
            </Col>
            <Col>
              <Text style={{ fontSize:12,fontFamily:font_description }} >No promotion applied.Choose your promotion here.</Text>
              <Text onPress={() => this.applyPromo()} style={styles.choose_promotion}>{strings.choose_promotion}</Text>
            </Col>
          </Row> }
          {
            promo_amount > 0 &&  <Row style={{ padding:20 }} >
            <Col style={{ width:50 }} >
              <Icon style={{ color:colors.theme_fg }} name='pricetag' />
            </Col>
            <Col>
              <Text style={styles.promotion_applied} >Promotion applied</Text>
              <Text style={{ fontSize:12,fontFamily:font_description }} >You are saving {global.currency}{promo_amount}</Text>
              <Text onPress={() => this.applyPromo()} style={styles.change_promo}>Change promo</Text>
            </Col>
          </Row> 
          }
  
          <Divider style={{ backgroundColor: colors.theme_fg_two }} />
          <Row style={styles.sub_total} >
            <Col>
              <Text>{strings.subtotal}</Text>
            </Col>
            <Col style={{ width:60 }} >
              <Text style={{ fontFamily:font_title }} >{global.currency}{sub_total}</Text>
            </Col>
          </Row>
          <Row style={styles.discount} >
            <Col>
              <Text>{strings.discount}</Text>
            </Col>
            <Col style={{ width:60 }} >
              <Text style={{ fontFamily:font_title }} >{global.currency}{promo_amount}</Text>
            </Col>
          </Row>
          <Row style={styles.total} >
            <Col>
              <Text>{strings.total}</Text>
            </Col>
            <Col style={{ width:60 }} >
            <Text style={styles.total_amount} >{global.currency}{total_amount}</Text>
            </Col>
          </Row>
          <Divider style={{ backgroundColor: colors.theme_fg_two }} />
          <Row style={styles.delivery_date} >
            <Col>
            <Button
              title={strings.choose_expected_delivery_date}
              type="outline"
              buttonStyle={{ borderColor:colors.theme_fg }}
              titleStyle={{ color:colors.theme_fg,fontFamily:font_description }}
              onPress={this.showDeliveryDatePicker}
            />
            <DateTimePicker
              isVisible={this.state.deliveryDatePickerVisible}
              onConfirm={this.handleDeliveryDatePicked}
              onCancel={this.hideDeliveryDatePicker}
              minimumDate={new Date()}
              mode='date'
            />
            </Col>
          </Row>
          {delivery_date != undefined &&
          <Row style={{ justifyContent:'center' }} >
            <Text style={styles.delivery_date_text}>{delivery_date}</Text>
          </Row>
          }
        </ScrollView>
        <Footer style={styles.footer} >
          <View style={styles.footer_content}>
            <Button
              onPress={this.select_address}
              title={strings.select_address}
              buttonStyle={styles.select_address}
              titleStyle={{color:colors.theme_bg_three,fontFamily:font_description}}
            />
          </View>
        </Footer>
      
      </Container>
    );
  }
}

function mapStateToProps(state){
  return{
    cart_items : state.product.cart_items,
    sub_total : state.cart.sub_total,
    promo : state.cart.promo,
    total_amount : state.cart.total_amount,
    promo_amount : state.cart.promo_amount,
    isLoding : state.cart.isLoding,
    delivery_date : state.cart.delivery_date
  };
}

const mapDispatchToProps = (dispatch) => ({
    subTotal: (data) => dispatch(subTotal(data)),
    total: (data) => dispatch(total(data)),
    calculatePricing: () => dispatch(calculatePricing()),
    selectDate: (data) => dispatch(selectDate(data)),
    addToCart: (data) => dispatch(addToCart(data)),
    reset:()=> dispatch(reset())
});


export default connect(mapStateToProps,mapDispatchToProps)(Cart);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.theme_bg_two,
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
  qty:{
    fontSize:15, 
    color:colors.theme_fg, 
    fontFamily:font_title
  },
  crossItem:{
    width:30,
    alignItems:'center',
    justifyContent:'center'
   },
  promotion_applied:{
    fontSize:15, 
    color:colors.theme_fg, 
    fontFamily:font_title
  },
  choose_promotion:{
    color:colors.theme_fg, 
    fontFamily:font_title
  },
  change_promo:{
    color:colors.theme_fg, 
    fontSize:13,
    fontFamily:font_description
  },
  sub_total:{
    paddingLeft:20, 
    paddingRight:20, 
    paddingTop:10
  },
  discount:{
    paddingLeft:20, 
    paddingRight:20, 
    paddingTop:10
  },
  total:{
    paddingLeft:20, 
    paddingRight:20, 
    paddingTop:10, 
    paddingBottom:10
  },
  total_amount:{
    fontFamily:font_title, 
    color:colors.theme_fg_two
  },
  delivery_date:{
    padding:20, 
    justifyContent:'center'
  },
  delivery_date_text:{
    color:colors.theme_fg, 
    marginBottom:20,
    fontFamily:font_description
  },
  footer:{
    backgroundColor:'transparent'
  },
  footer_content:{
    width:'90%'
  },
  select_address:{
    backgroundColor:colors.theme_bg
  }
});

