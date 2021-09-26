const { CustomerModel, AddressModel } = require('../models');
const { APIError, BadRequestError, STATUS_CODES } = require('../../utils/app-errors')

//Dealing with data base operations
class CustomerRepository {

    async CreateCustomer({ email, password, phone, salt }){
        try{
            const customer = new CustomerModel({
                email,
                password,
                salt,
                phone,
                address: []
            })
            const customerResult = await customer.save();
            return customerResult;
        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Customer')
        }
    }
    
    async CreateAddress({ _id, street, postalCode, city, country}){
        
        try{
            const profile = await CustomerModel.findById(_id);
            
            if(profile){
                
                const newAddress = new AddressModel({
                    street,
                    postalCode,
                    city,
                    country
                })
    
                await newAddress.save();
    
                profile.address.push(newAddress);
            }
    
            return await profile.save();

        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Error on Create Address')
        }
    }

    async FindCustomer({ email }){
        try{
            const existingCustomer = await CustomerModel.findOne({ email: email });
            return existingCustomer;
        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Customer')
        }
    }

    async FindCustomerById({ id }){

        try {
            const existingCustomer = await CustomerModel.findById(id).populate('address')
            
            return existingCustomer;
        } catch (err) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Customer');
        }
    }

    async Wishlist(customerId){
        try{
            const profile = await CustomerModel.findById(customerId).populate('wishlist');
           
            return profile.wishlist;
        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Get Wishlist ')
        }
    }

    async AddWishlistItem(customerId, { _id, name, desc, price, available, banner }){

      
        const product = {
            _id, name, desc, price, available, banner 
        };
        
        try{
            const profile = await CustomerModel.findById(customerId).populate('wishlist');
           
            if(profile){
    
                 let wishlist = profile.wishlist;
      
                if(wishlist.length > 0){
                    let isExist = false;
                    wishlist.map(item => {
                        if(item._id.toString() === product._id.toString()){
                           const index = wishlist.indexOf(item);
                           wishlist.splice(index,1);
                           isExist = true;
                        }
                    });
    
                    if(!isExist){
                        wishlist.push(product);
                    }
    
                }else{
                    wishlist.push(product);
                }
    
                profile.wishlist = wishlist;
            }
    
            const profileResult = await profile.save();      
    
            return profileResult.wishlist;

        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Add to WishList')
        }

    }


    async AddCartItem(customerId, {  _id, name, price, banner }, qty, isRemove){

        try{

            const profile = await CustomerModel.findById(customerId).populate('cart');
    
            if(profile){ 
     
                const cartItem = {
                    product: { _id, name, price, banner},
                    unit: qty,
                };
              
                let cartItems = profile.cart;
                
                if(cartItems.length > 0){
                    let isExist = false;
                     cartItems.map(item => {

                        if(item.product._id.toString() === _id.toString()){
                            if(isRemove){
                                cartItems.splice(cartItems.indexOf(item), 1);
                            }else{
                                item.unit = qty;
                            }
                            isExist = true;
                        }
                    });
    
                    if(!isExist){
                        cartItems.push(cartItem);
                    } 
                }else{
                    cartItems.push(cartItem);
                }
    
                profile.cart = cartItems;
    
                const cartSaveResult = await profile.save();

                return cartSaveResult;
            }
            
            throw new Error('Unable to add to cart!');

        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Customer')
        }

    }

    async AddOrderToProfile(customerId, order){
 
        
        try{

            const profile = await CustomerModel.findById(customerId);

            if(profile){ 
                
                if(profile.orders == undefined){
                    profile.orders = []
                }
                profile.orders.push(order);

                profile.cart = [];

                const profileResult = await profile.save();

                return profileResult;
            }
            
            throw new Error('Unable to add to order!');

        }catch(err){

            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Customer')
        }
        
    }

}

module.exports = CustomerRepository;