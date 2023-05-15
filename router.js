const express = require("express");

const router = express.Router();

const shortid = require("shortid");

const { MongoClient } = require("mongodb");

const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");

const dotenv = require("dotenv");

const Razorpay = require("razorpay");

dotenv.config({ path: "./config.env" });

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const authenticate = require("./middleware/authenticate");

router.use(cookieParser());
router.use(express.json());

//mongoose
require("./db/connection");

// let razorpay = new Razorpay({
//   key_id: "rzp_test_OGBBHpDvdeGYJK",
//   key_secret: "av5mFilTc1oi19oTwRz0YyfP ",
// });

// router.post("/razorpay", async (req, res) => {
//   console.log("start");

//   const payment_capture = 1;
//   const currency = "INR";

//   console.log("mid");

//   let options = {
//     amount: 500,
//     currency,
//     receipt: shortid.generate(),
//     payment_capture,
//   };
//   // try {
//   console.log("end");

//   const response = await razorpay.orders.create(options);
//   console.log(response);
//   res.json({
//     id: response.id,
//     currency: response.currency,
//     amount: response.amount,
//     receipt: response.receipt,
//   });
//   // } catch (e) {
//   //   console.log("catch");
//   //   console.log(e);
//   // }
// });

async function FindHostDetail() {
  const uri =
    "mongodb+srv://Prashant:Prashant0012@cluster0.bai5pod.mongodb.net/?retryWrites=true&w=majority";
  const Client = new MongoClient(uri);
  await Client.connect();
  const result = Client.db("bookapi")
    .collection("booklists")
    .find()
    .sort({ _id: -1 })
    .toArray();

  return result;
}

//get json format data
router.use(express.json());

// model
const User = require("./model/userSchema");

const AllUser = require("./model/AllUserDetail");

router.get("/", authenticate, (req, res) => {
  res.send(req.rootUser);
});

router.get("/about", authenticate, (req, res) => {
  console.log("hello my about");
  res.send(req.rootUser);
});

router.get("/cart", authenticate, (req, res) => {
  res.send(req.rootUser);
});

router.post("/register", async (req, res) => {
  const { name, email, phone, password, cpassword } = req.body;

  console.log(name, email, phone, password, cpassword);

  if (!name || !email || !phone || !password || !cpassword) {
    return res.status(422).json({ error: "plz filled the field properly" });
  }

  try {
    const userExist = await User.findOne({ Email: email });

    if (userExist) {
      return res.status(422).json({ error: "Email already Exist" });
    } else if (password !== cpassword) {
      return res.status(422).json({ error: "password are not matching" });
    } else {
      const user = new User({
        Name: name,
        Email: email,
        Phone: phone,
        Password: password,
        CPassword: cpassword,
      });

      await user.save();

      let addAll = AllUser({
        Name: name,
        Email: email,
        Phone: phone,
        UniqueId: user._id.toString(),
      });

      await addAll.save();

      res
        .status(201)
        .send({ message: "user registered successfuly", registerData: user });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/signin", async (req, res) => {
  try {
    let token;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "plz filled the data" });
    }

    const userLogin = await User.findOne({ Email: email });

    if (userLogin) {
      const isMatched = await bcrypt.compare(password, userLogin.Password);

      console.log(userLogin);
      console.log(isMatched + "matched");

      if (!isMatched) {
        res.status(400).json({ error: "Invalid Credientials" });
      } else {
        token = await userLogin.generateAuthToken();

        console.log(token);

        res.cookie("jwtauth", token, {
          httpOnly: true,
          maxAge: 3600000,
        });

        // res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });

        setTimeout(() => {
          res.status(200).send({ messsage: "login successfully", });
        }, 4000);
      }
    } else {
      res.status(400).json({ error: "Invalid Credientials" });
    }
  } catch (err) {
    console.log(err);
  }
});


router.get("/book",async (req, res) => {

  let data = await FindHostDetail();

  res.send(data);


});

router.get("/logout", authenticate, async (req, res) => {
  req.rootUser.tokens = [];

  console.log("this is logout page");

  res.clearCookie("jwtauth");

  await req.rootUser.save();

  res.status(200).send("User Logout");
});

module.exports = router;
