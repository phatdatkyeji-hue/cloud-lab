
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const Student = require("../models/Student");

// ==========================================
// 1. CẤU HÌNH CORS
// ==========================================

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép request không có Origin
      if (!origin) {
        return callback(null, true);
      }

      // Cho phép các domain đã khai báo
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Môi trường phát triển cho phép linh hoạt
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      // Production: từ chối domain không được phép
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json());

// ==========================================
// 2. MIDDLEWARE GHI LOG TẤT CẢ REQUEST
// ==========================================

app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    console.log(
      `[API LOG] ${new Date().toISOString()} | ` +
      `${req.method} ${req.originalUrl} | ` +
      `Status: ${res.statusCode} | ` +
      `Time: ${duration}ms`
    );
  });

  next();
});

// ==========================================
// 3. KẾT NỐI MONGODB ATLAS
// ==========================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("[DATABASE] Đã kết nối MongoDB Atlas thành công!");
    console.log("[DATABASE] Database:", mongoose.connection.name);
    console.log("[DATABASE] Collection: students");
  })
  .catch((error) => {
    console.error(
      "[DATABASE ERROR] Lỗi kết nối MongoDB:",
      error.message
    );
  });

// Theo dõi tình trạng kết nối MongoDB
mongoose.connection.on("disconnected", () => {
  console.warn("[DATABASE WARNING] MongoDB đã ngắt kết nối!");
});

mongoose.connection.on("reconnected", () => {
  console.log("[DATABASE] MongoDB đã kết nối lại thành công!");
});

// ==========================================
// 4. API KIỂM TRA BACKEND
// ==========================================

app.get("/api/hello", (req, res) => {
  res.json({
    message: "Backend đang hoạt động!"
  });
});

// Health Check: kiểm tra trạng thái Backend và MongoDB
app.get("/health", (req, res) => {
  const databaseConnected =
    mongoose.connection.readyState === 1;

  const status = databaseConnected ? "healthy" : "unhealthy";

  res.status(databaseConnected ? 200 : 503).json({
    status,
    server: "running",
    database: databaseConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 5. API LẤY DANH SÁCH SINH VIÊN
// GET /api/students
// ==========================================

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();

    console.log(
      `[STUDENT READ] Đã lấy danh sách ${students.length} sinh viên`
    );

    res.json(students);
  } catch (error) {
    console.error(
      "[STUDENT READ ERROR] Không thể lấy danh sách:",
      error.message
    );

    res.status(500).json({
      message: error.message
    });
  }
});

// ==========================================
// 6. API THÊM SINH VIÊN
// POST /api/students
// ==========================================

app.post("/api/students", async (req, res) => {
  try {
    const student = new Student({
      studentId: req.body.studentId,
      name: req.body.name,
      email: req.body.email
    });

    const savedStudent = await student.save();

    console.log(
      `[STUDENT CREATE] Đã thêm sinh viên: ` +
      `${savedStudent.studentId} - ${savedStudent.name}`
    );

    res.status(201).json(savedStudent);
  } catch (error) {
    console.error(
      "[STUDENT CREATE ERROR] Thêm sinh viên thất bại:",
      error.message
    );

    res.status(500).json({
      message: error.message
    });
  }
});

// ==========================================
// 7. API CẬP NHẬT SINH VIÊN
// PUT /api/students/:id
// ==========================================

app.put("/api/students/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedStudent) {
      console.warn(
        `[STUDENT UPDATE] Không tìm thấy sinh viên ID: ${req.params.id}`
      );

      return res.status(404).json({
        message: "Không tìm thấy sinh viên!"
      });
    }

    console.log(
      `[STUDENT UPDATE] Đã cập nhật sinh viên: ` +
      `${updatedStudent.studentId} - ${updatedStudent.name}`
    );

    res.json(updatedStudent);
  } catch (error) {
    console.error(
      "[STUDENT UPDATE ERROR] Cập nhật thất bại:",
      error.message
    );

    res.status(500).json({
      message: error.message
    });
  }
});

// ==========================================
// 8. API XÓA SINH VIÊN
// DELETE /api/students/:id
// ==========================================

app.delete("/api/students/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!deletedStudent) {
      console.warn(
        `[STUDENT DELETE] Không tìm thấy sinh viên ID: ${req.params.id}`
      );

      return res.status(404).json({
        message: "Không tìm thấy sinh viên!"
      });
    }

    console.log(
      `[STUDENT DELETE] Đã xóa sinh viên: ` +
      `${deletedStudent.studentId} - ${deletedStudent.name}`
    );

    res.json({
      message: "Xóa sinh viên thành công!",
      student: deletedStudent
    });
  } catch (error) {
    console.error(
      "[STUDENT DELETE ERROR] Xóa sinh viên thất bại:",
      error.message
    );

    res.status(500).json({
      message: error.message
    });
  }
});

// ==========================================
// 9. XỬ LÝ LỖI CORS VÀ LỖI SERVER
// ==========================================

app.use((err, req, res, next) => {
  console.error("[SERVER ERROR]", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Domain không được phép truy cập API."
    });
  }

  res.status(500).json({
    message: "Lỗi máy chủ nội bộ."
  });
});

// ==========================================
// 10. KHỞI ĐỘNG SERVER
// ==========================================

app.listen(PORT, () => {
  console.log("========================================");
  console.log("[AUTO-DEPLOY BUOI 6] Backend khởi động thành công!");
  console.log(`[SERVER] Port: ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("[SERVER] Health Check: /health");
  console.log("[SERVER] API Students: /api/students");
  console.log("========================================");
});
