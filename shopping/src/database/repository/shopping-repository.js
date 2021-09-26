const { CustomerModel, ProductModel, OrderModel, CartModel } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError, BadRequestError } = require('../../utils/app-errors')


//Dealing with data base operations
class ShoppingRepository {

    // payment

    async Orders(customerId){
        try{
            const orders = await OrderModel.find({customerId });        
            return orders;
        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Orders')
        }
    }
    
    async Cart(customerId){

        try {
            
                const cartItems = await CartModel.find({
                    customerId: customerId
                })
                if(cartItems){
                    return cartItems;
                }
        
                throw new Error('Data not Found!')
            
        } catch (err) {
            throw err;
        }

    } 

   
    async AddCartItem(customerId, item, qty, isRemove){

        try{

            const cart = await CartModel.findOne({customerId: customerId});

            const { _id }  = item;
    
            if(cart){ 
     
                let isExist = false;

                let cartItems = cart.items;
                
                if(cartItems.length > 0){
                   
                     cartItems.map(item => {

                         if(item.product._id.toString() === _id.toString()){

                             if(isRemove){

                                cartItems.splice(cartItems.indexOf(item), 1);
                                
                                console.log(cartItems);

                            }else{
                                item.unit = qty;
                            }
                            isExist = true;
                        } 
                    });
                }
                
                
                if(!isExist && !isRemove){
                    cartItems.push({ product: {...item}, unit: qty});
                } 

                cart.items = cartItems;
                
                return await cart.save();
                
            }else{
                return await CartModel.create({
                    customerId,
                    items: [{ product: {...item}, unit: qty }]
                });
            }
            
 
        }catch(err){

            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Customer')
        }

    }
 
 
    async CreateNewOrder(customerId, txnId){

        //check transaction for payment Status
        
        try{
            const cart = await CartModel.findOne({customerId: customerId});
            
            console.log(cart);

            if(cart){
                
                let amount = 0;   
    
                let cartItems = cart.items;
    
                if(cartItems.length > 0){
                    //process Order
                    cartItems.map(item => {
                        amount += parseInt(item.product.price) *  parseInt(item.unit);   
                    });
        
                    // 86873645
                    const orderId = uuidv4();
        
                    const order = new OrderModel({
                        orderId,
                        customerId,
                        amount,
                        txnId,
                        status: 'received',
                        items: cartItems
                    })
        
                    cart.items = [];
                    
                    const orderResult = await order.save();
                       
                    await cart.save();
    
                    return orderResult;
                }
            } 
    
          return {}

        }catch(err){
            
 
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Category')
        }
        

    }
}

module.exports = ShoppingRepository;