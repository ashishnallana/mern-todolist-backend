const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Authenticate = require("../middleware/authenticate");

// *register
router.post("/register", async (req, res) => {
  const { name, email, password, cpassword } = req.body;

  if (!name || !email || !password || !cpassword) {
    return res.status(422).json({ error: "Kindly fill all the details!" });
  }

  try {
    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(422).json({ error: "Email already exists!" });
    } else if (password !== cpassword) {
      return res.status(422).json({ error: "passwords not matching!!" });
    } else {
      const newUser = new User({
        name,
        email,
        password,
        cpassword,
      });
      const registerUser = await newUser.save();

      res.status(201).json({ message: "user registered successfully!!" });
    }
  } catch (error) {
    console.log(error.message);
  }
});

// *login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(422).json({ error: "Kidly fill all the fields!!" });
    }

    const userFound = await User.findOne({ email });

    if (userFound) {
      const correctPassword = await bcrypt.compare(
        password,
        userFound.password
      );

      // const oneMonthFromNow = new Date();
      // oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      const token = await userFound.generateAuthToken();
      res.cookie("jwttoken", token, {
        // expires: oneMonthFromNow,
        httpOnly: true,
        secure: true,
      });

      if (!correctPassword) {
        res.status(400).json({ error: "Invalid Credentials!" });
      } else {
        res.status(200).json({ message: "User LoggedIn!" });
      }
    } else {
      res.status(400).json({ error: "User doesn't exist!" });
    }
  } catch (error) {
    console.log(error.message);
  }
});

// *open page iff user loggedIn
router.get("/auth", Authenticate, (req, res) => {
  console.log(req.rootUser);
  res.status(200).send(req.rootUser);
});

// *logout user
router.get("/logout", (req, res) => {
  res.clearCookie("jwttoken", { path: "/" });
  res.status(200).send("User logged out!");
});

//* fetch tasks
router.post("/todos", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user.todos);
  } catch (error) {
    console.log(error.message);
  }
});

//  *new task
router.post("/new", async (req, res) => {
  const { _id, title, description } = req.body;
  if (!title || !description) {
    return res.status(422).json({
      error: "Atleast add a title and some content to create your new task!",
    });
  }
  try {
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    user.todos.push({ title, description });
    const updatedUser = await user.save();
    res.send({ message: "todo added successfully!" });
  } catch (error) {
    throw new Error("Error adding todo: " + error.message);
  }
});

// *edit task
router.post("/edit", async (req, res) => {
  const { userId, todoId, newTitle, newDesc } = req.body;
  if (!newTitle || !newDesc) {
    return res.status(422).json({
      error: "title or description not found!",
    });
  }
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const todo = user.todos.id(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    todo.title = newTitle;
    todo.description = newDesc;

    const updatedUser = await user.save();
    res.send({ message: "todo edit successful!" });
  } catch (error) {
    throw new Error("Error editing todo: " + error.message);
  }
});

router.post("/complete", async (req, res) => {
  try {
    const { userId, todoId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }
    const todo = user.todos.id(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    todo.completed = true;

    const updatedUser = await user.save();
    res.send({ message: "Todo completed!" });
  } catch (error) {
    throw new Error("Error marking todo as completed: " + error.message);
  }
});

router.post("/undocomplete", async (req, res) => {
  try {
    const { userId, todoId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }
    const todo = user.todos.id(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    todo.completed = false;

    const updatedUser = await user.save();
    res.send({ message: "completion mark removed!" });
  } catch (error) {
    throw new Error("Error marking todo as incomplete: " + error.message);
  }
});

router.post("/delete", async (req, res) => {
  try {
    const { userId, todoId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Find the index of the todo within the user's todos array
    const todoIndex = user.todos.findIndex(
      (todo) => todo._id.toString() === todoId
    );
    if (todoIndex === -1) {
      throw new Error("Todo not found");
    }
    user.todos.splice(todoIndex, 1);
    const updatedUser = await user.save();
    res.send({ message: "todo deleted successfully!" });
  } catch (error) {
    throw new Error("Error deleting todo: " + error.message);
  }
});

module.exports = router;
