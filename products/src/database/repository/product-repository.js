const mongoose = require('mongoose');
const { ProductModel } = require("../models");

//Dealing with data base operations
class ProductRepository {


    async CreateProduct({ name, desc, type, unit,price, available, suplier, banner }){

        const product = new ProductModel({
            name, desc, type, unit,price, available, suplier, banner
        })

    //    return await ProductModel.findByIdAndDelete('607286419f4a1007c1fa7f40');

        const productResult = await product.save();
        return productResult;
    }


     async Products(){
        return await ProductModel.find();
    }
   
    async FindById(id){
        
       return await ProductModel.findById(id);

    }

    async FindByCategory(category){

        const products = await ProductModel.find({ type: category});

        return products;
    }

    async FindSelectedProducts(selectedIds){
        const products = await ProductModel.find().where('_id').in(selectedIds.map(_id => _id)).exec();
        return products;
    }
    
}

module.exports = ProductRepository;
