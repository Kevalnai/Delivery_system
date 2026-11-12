// controllers/productController.js (final with debug & fixed path)

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Product = require("../models/Product");


// ✅ Configure Multer for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/uploads");
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log("💾 Upload destination path:", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    console.log("📸 File uploaded with name:", filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log("🛠️ File filter running...");
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    console.log("📝 File Type:", file.mimetype);
    console.log("📝 File Extension:", path.extname(file.originalname));

    if (extname && mimetype) {
      console.log("✅ File is valid!");
      return cb(null, true);
    } else {
      console.log("❌ Invalid file type! Only JPEG, PNG, GIF allowed.");
      cb(new Error("Only images (JPEG, PNG, GIF) are allowed"));
    }
  },
}).single("image");

// ✅ GET: Display Add Product Form
exports.getAddProduct = (req, res) => {
  console.log("GET /add-products - Rendering Add Product Page");
  res.render("add-product", { title: "Add Product" });
};

exports.postAddProduct = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("❌ Multer Error:", err);
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const { title, category, description, price, condition } = req.body;

    try {
      console.log("📥 Request Body:", req.body);
      console.log("📸 File Info:", req.file);

      // Store the local file path in MongoDB
      const imagePath = `uploads/${req.file.filename}`; // relative path to the public/uploads folder

      // Create a new product
      const newProduct = new Product({
        title,
        category,
        description,
        price: parseFloat(price),
        condition: [].concat(condition || []).filter(Boolean),
        image: imagePath, // Store local file path
      });

      await newProduct.save();
      console.log("✅ Product saved to DB:", newProduct);

      // Optionally, delete the local file if not needed anymore
      // fs.unlinkSync(req.file.path);

      res.status(200).json({ message: "Product added successfully!", product: newProduct });
    } catch (error) {
      console.error("❌ DB Error:", error);
      res.status(500).json({ error: "Failed to save product" });
    }
  });
};



// ✅ GET: Display All Products from MongoDB
exports.getProducts = async (req, res) => {
  try {
    console.log("🔍 Fetching products from database...");
    const products = await Product.find({ status: 'Available' });
    console.log(`📦 Found ${products.length} products`);

    products.forEach(product => {
      console.log(`➡️ Product: ${product.title}, Image: ${product.image}`);
    });

    res.render("product-list", { title: "Products", products });
  } catch (error) {
    console.error("❌ Error Fetching Products:", error);
    res.status(500).send("Error retrieving products");
  }
};

exports.manageProducts = async (req, res) => {
  console.log("manage product");
  
  try {
    const products = await Product.find(); // Fetch all products from the database
    res.render('buyer/manage', { products }); // Pass products to the EJS view
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server Error');
  }
};


// Update Product Status
exports.updateProductStatus = async (req, res) => {
  try {
    const { productId, status } = req.body;

    if (!productId || !status) {
      return res.status(400).send('Product ID and status are required');
    }

    const product = await Product.findByIdAndUpdate(productId, { status }, { new: true });
    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.status(200).send('Product status updated successfully');
  } catch (error) {
    console.error('Error updating product status:', error);
    return res.status(500).send('Server Error');
  }
};