import express from 'express';
import { ObjectId } from 'mongodb';
import connectDB from './db/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express()
app.use(express.json())

function isValidObjectId(id) {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
  }

const startServer = async () => {
    const db = await connectDB()

    app.get('/', (req, res) => {
        res.send('Server is running and connected to MongoDB')
    })

    app.get('/products', async (req, res) => {
        try {
            const products = await db.collection('products').find().toArray();
            res.status(200).json(products)
        } catch (error) {
            res.status(500).json({ message: 'Error creating product', error })
        }
    })

    app.get('/products/:id', async (req, res) => {
        console.log(`Received request to fetch product with ID: ${req.params.id}`);
      
        try {
          if (!ObjectId.isValid(req.params.id)) {
            console.log('Invalid ObjectId format');
            return res.status(400).json({ message: 'Invalid product ID format' });
          }
      
          const product = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) });
          if (!product) {
            console.log('Product not found');
            return res.status(404).json({ message: 'Product not found' });
          }
          
          console.log('Product found:', product);
          res.status(200).json(product);
        } catch (error) {
          console.error('Error fetching product:', error);
          res.status(500).json({ message: 'Error fetching product', error });
        }
      });
      

    app.post('/products', async (req, res) => {
        const { name, price, description } = req.body;
        try {
            const result = await db.collection('products').insertOne({ name, price, description })
            res.status(201).json(result)
        } catch (error) {
            res.status(500).json({ message: 'Error creating product', error })
        }
    })

    app.put('/products/:id', async (req, res) => {
        const { name, price, description } = req.body;

        if (!isValidObjectId(req.params.id)) {
          return res.status(400).json({ message: 'Invalid product ID' });
        }
      
        try {
          const result = await db.collection('products').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { name, price, description } }
          );
      
          if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Product not found or no changes' });
          }
      
          res.status(200).json(result);
        } catch (error) {
          res.status(500).json({ message: 'Error updating product', error });
        }
      });
      
      
      app.delete('/products/:id', async (req, res) => {
        if (!isValidObjectId(req.params.id)) {
          return res.status(400).json({ message: 'Invalid product ID' });
        }
      
        try {
          const result = await db.collection('products').deleteOne({ _id: new ObjectId(req.params.id) });
      
          if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
          }
      
          res.status(200).json(result);
        } catch (error) {
          res.status(500).json({ message: 'Error deleting product', error });
        }
      });
      

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}


startServer();