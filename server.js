if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const port = 3015
const Organ = require('./model/Organization')
const Store = require('./model/Store')
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid');


// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + path.extname(file.originalname); // Rename the file with a unique timestamp
    cb(null, filename);
  }
});

// Initialize multer middleware
const upload = multer({ storage: storage });




// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/uploads', express.static('uploads'));

// parse application/json
app.use(bodyParser.json())
app.use(cors())
//connect to mongodb
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/', (req, res)=> {
    res.send("Hello world")
})

app.post('/login', async (req, res) => {
    // Authenticate User
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username: username }).exec();
      console.log(user)
  
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
  
      // Compare the provided password with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(passwordMatch)
  
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
  
      // Password is correct, generate and return access token
      const accessToken = await generateAccessToken(user);
      console.log(accessToken)
      res.json({ accessToken: accessToken });
    } catch (error) {
      console.error("Error authenticating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/register', async (req, res) => {
    const { name, username, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);// 10 is the salt rounds

        // Create a new user with the hashed password
        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword, // Store the hashed password
        });

        // Save the user to the database
        const savedUser = await newUser.save();
        res.status(200).json({ success: true, data: savedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'An error occurred' });
    }
});
//get 
//get all products
app.get('/products/:id', async(req, res)=>{
  const id = req.params.id
  try{
    //const user = await Organ.findOne({ OrganName: id }).exec();
    const user = true
    if(user == true){
      const products = await Store.find({OrganId: id})
      res.send(products)
    }
  }catch(error){
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred' });
  }
})

// Route for uploading an image along with other form data
app.post('/postproduct/:id', upload.single('image'), (req, res) => {
  // File is uploaded and stored in 'uploads/' directory
  const id = req.params.id;
  const ItemName = req.body.name;
  const ItemPrice = req.body.price;
  const ItemDescription = req.body.description;

  console.log(ItemName)
  console.log(id)

  // Get the filename of the uploaded image
  const ItemImage = req.file.filename;

  console.log(ItemImage)

  // Create a new item with image and other data
  const item = new Store({
      ItemName: ItemName,
      ItemImage: ItemImage,
      ItemPrice: ItemPrice,
      ItemDescription: ItemDescription,
      OrganId: id,
      ItemID: uuidv4()
  });

  // Save the item to the database
  item.save()
      .then(savedItem => {
          res.status(201).json(savedItem);
      })
      .catch(error => {
          res.status(500).json({ error: error.message });
      });
});
function generateAccessToken(user) {
  const userObject = user.toObject(); // Convert Mongoose document to plain JavaScript object
  return jwt.sign(userObject, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

app.listen(port, ()=> {
    console.log(`App is running on port ${port}`)
})