#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const base =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";
const target = `${base}/register`;
const out = path.join(__dirname, "..", "public", "kpl-register-qr.png");

QRCode.toFile(
  out,
  target,
  {
    type: "png",
    width: 512,
    margin: 2,
    color: { dark: "#0F2744", light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  },
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`QR written to ${out}`);
    console.log(`URL: ${target}`);
  }
);
