const express = require("express");
const { update } = require("../models/task");
const Task = require("../models/task");
const router = express.Router();

const auth = require("../middleware/auth");

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    const result = await task.save();
    res.status(201).send(result);
  } catch (error) {
    res.send(error);
  }
});

// GET /tasks?completed=true
router.get("/tasks", auth, async (req, res) => {
  let queryField = {};
  const completed = req.query.completed;
  const page = req.query.page;
  const perPage = req.query.perPage;
  const limit = parseInt(perPage);
  const skip = parseInt((page - 1) * perPage);
  const sortBy = req.query.sortBy;
  const order = req.query.order;
  sortOption = {};
  sortOption[sortBy] = order;
  if (completed) {
    queryField = { owner: req.user._id, completed: completed };
  } else {
    {
      queryField = { owner: req.user._id };
    }
  }
  Task.find(queryField)
    .limit(limit)
    .skip(skip)
    .sort(sortOption)
    .populate({ path: "owner", select: "name age" })
    .exec()
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((error) => res.send({ error: error }));
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findById(_id)
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  isUpdateAllowed = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isUpdateAllowed) {
    return res.status(404).send({ error: "Update not allowed" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send({ error: "task not found" });
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.status(200).send(task);
  } catch (error) {
    res.status(500).send({ error: "task not found" });
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      res.status(404).send({ error: "Task not found" });
    }
    res.status(200).send({ message: "Task deleted" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
