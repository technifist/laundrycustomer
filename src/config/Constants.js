import { Dimensions } from 'react-native';
import strings from "../languages/strings.js";

export const base_url = "https://laundry.technifist.com/";
export const api_url = "https://laundry.technifist.com/api/";
export const settings = "app_setting";
export const img_url = "https://laundry.technifist.com/public/uploads/";
export const service = "service";
export const faq = "faq";
export const privacy = "privacy_policy";
export const product = "product";
export const register = "customer";
export const login = "customer/login";
export const address = "address";
export const address_list = "address/all";
export const address_delete = "address/delete";
export const my_orders = "get_orders";
export const promo_code = "promo";
export const profile = "customer";
export const profile_picture = "customer/profile_picture";
export const forgot = "customer/forgot_password";
export const reset = "customer/reset_password";
export const place_order = "order";
export const payment_list = "payment";
export const stripe_payment = "stripe_payment";

//Size
export const screenHeight = Math.round(Dimensions.get('window').height);
export const height_40 = Math.round(40 / 100 * screenHeight);
export const height_50 = Math.round(50 / 100 * screenHeight);
export const height_60 = Math.round(60 / 100 * screenHeight);
export const height_35 = Math.round(35 / 100 * screenHeight);
export const height_20 = Math.round(20 / 100 * screenHeight);
export const height_30 = Math.round(30 / 100 * screenHeight);

//Path
export const logo = require('.././assets/img/logo_with_name.png');
export const forgot_password = require('.././assets/img/forgot_password.png');
export const reset_password = require('.././assets/img/reset_password.png');
export const loading = require('.././assets/img/loading.png');
export const pin = require('.././assets/img/location_pin.png');
export const login_image = require('.././assets/img/logo_with_name.png');
export const washing_machine = require('.././assets/img/washing-machine.png');
export const completed_icon = require('.././assets/img/completed.png');
export const active_icon = require('.././assets/img/active.png');

//Font Family
export const font_title = "TitilliumWeb-Bold";
export const font_description = "TitilliumWeb-Regular";


//Map
export const GOOGLE_KEY = "AIzaSyBy-_iF_vTb0x_L44vnvmnqMTbXzmsgWm0";
export const LATITUDE_DELTA = 0.0150;
export const LONGITUDE_DELTA =0.0152;

export const polygonsPoints = [
        {latitude:30.6856051,longitude:73.1155277},
		{latitude:30.6982937,longitude:73.1080918},
		{latitude:30.6948407,longitude:73.0981835},
		{latitude:30.7035132,longitude:73.0862147},
		{latitude:30.6967146,longitude:73.0724177},
		{latitude:30.6909292,longitude:73.0840975},
		{latitude:30.6790991,longitude:73.0701235},
		{latitude:30.6699903,longitude:73.0654355},
		{latitude:30.6677276,longitude:73.0734578},
		{latitude:30.6488683,longitude:73.0734993},
		{latitude:30.6232955,longitude:73.0874514},
		{latitude:30.622771,longitude:73.1055883},
    	{latitude:30.6474223,longitude:73.1057427},
		{latitude:30.6481399,longitude:73.1195833},
		{latitude:30.6568867,longitude:73.1299775},
		{latitude:30.6453917,longitude:73.1371548},
		{latitude:30.6457916,longitude:73.1455654},
		{latitude:30.6633939,longitude:73.1519696},
		{latitude:30.6811713,longitude:73.135669},
]
		

		
