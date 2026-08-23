const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const Student = require("../models/Student");

app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Đã kết nối MongoDB Atlas thành công!");
  })
  .catch((error) => {
    console.error("Lỗi kết nối MongoDB:", error.message);
  });

// API kiểm tra Backend
app.get("/api/hello", (req, res) => {
  res.json({
    message: "Backend đang hoạt động!"
  });
});


// API cập nhật sinh viên
app.put("/api/students/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên!"
      });
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// API lấy danh sách sinh viên
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// API thêm sinh viên
app.post("/api/students", async (req, res) => {
  try {
    const student = new Student({
      studentId: req.body.studentId,
      name: req.body.name,
      email: req.body.email
    });

    const savedStudent = await student.save();

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// API xóa sinh viên
app.delete("/api/students/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên!"
      });
    }

    res.json({
      message: "Xóa sinh viên thành công!",
      student: deletedStudent
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Khởi động Server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});