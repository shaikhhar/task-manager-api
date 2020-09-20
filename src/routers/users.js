const express = require("express");
const { update } = require("../models/user");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

const { sendWelcomeEmail, farewellEmail } = require("../emails/account");

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const result = await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ result, token });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send({ message: "user not found" });
    }
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    farewellEmail(req.user.email, req.user.name);
    res.status(200).send({ message: "user deleted" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((tokenObject) => {
      return tokenObject.token !== req.token;
    });

    await req.user.save();
    res.status(201).send(req.user);
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(201).send(req.user);
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

const upload = multer({
  // dest: "images", // saving file as binary hence removing this
  limits: {
    fileSize: 15000000,
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("file must be jpg, jpeg or png"));
    }
    cb(null, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 600, height: 600 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ message: "uploaded successfully" });
  },
  (error, req, res, next) => {
    res.send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  try {
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.send({ error: error });
  }
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.send({ error: "unable to fetch the image" });
  }
});

module.exports = router;
