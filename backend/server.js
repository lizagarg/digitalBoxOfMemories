import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import { supabase } from "./supabase.js";
import razorpay from "./razorpay.js";
import crypto from "crypto";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend running 🚀");
});

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

app.post("/package", async (req, res) => {
  try {
    const { sender, receiver, items } = req.body;

    // Package must have at least one item
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Package must contain at least one item.",
      });
    }

    // Generate unique public ID
    const publicId = nanoid(8);

    // Save package to Supabase
    const { data, error } = await supabase
      .from("packages")
      .insert({
        public_id: publicId,
        sender_name: sender || null,
        receiver_name: receiver || null,
        items,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Package created successfully.",
      publicId,
      package: data,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

app.get("/package/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;

    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("public_id", publicId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    res.json({
      success: true,
      package: data,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});