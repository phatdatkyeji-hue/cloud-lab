import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  "http://localhost:5000/api/students";

function App() {
  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ==============================
  // LẤY DANH SÁCH SINH VIÊN
  // ==============================
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách sinh viên");
      }

      const data = await response.json();

      setStudents(data);
    } catch (error) {
      console.error("Lỗi:", error);
      setError("Không thể kết nối đến Backend Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ==============================
  // RESET FORM
  // ==============================
  const resetForm = () => {
    setStudentId("");
    setName("");
    setEmail("");
    setEditingId(null);
  };

  // ==============================
  // THÊM / CẬP NHẬT SINH VIÊN
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentId || !name || !email) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      setSubmitting(true);

      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          name,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error("Thao tác thất bại");
      }

      await response.json();

      await fetchStudents();

      resetForm();
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // CHỌN SINH VIÊN ĐỂ SỬA
  // ==============================
  const handleEdit = (student) => {
    setEditingId(student._id);
    setStudentId(student.studentId);
    setName(student.name);
    setEmail(student.email);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==============================
  // XÓA SINH VIÊN
  // ==============================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa sinh viên này không?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Xóa sinh viên thất bại");
      }

      await fetchStudents();

      // Nếu đang sửa sinh viên vừa bị xóa
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể xóa sinh viên.");
    }
  };

  return (
    <div className="app">
      {/* ================= HEADER ================= */}
      <header className="header">
        <div className="header-content">
          <div>
            <div className="brand">
              <div className="brand-icon">🎓</div>

              <div>
                <h1>Student Management System v2.0</h1>
                <p>Quản lý thông tin sinh viên - Docker Image 2.0</p>
              </div>
            </div>
          </div>

          <button className="refresh-btn" onClick={fetchStudents}>
            ↻ Làm mới
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="container">
        {/* ================= THỐNG KÊ ================= */}
        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon blue">👥</div>

            <div>
              <p>Tổng sinh viên</p>
              <h2>{students.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <p>Trạng thái hệ thống</p>
              <h2 className="online">Online</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">⚡</div>

            <div>
              <p>Backend API</p>
              <h2 className="online">Connected</h2>
            </div>
          </div>
        </section>

        {/* ================= FORM ================= */}
        <section className="form-card">
          <div className="section-title">
            <div>
              <span className="section-label">
                {editingId ? "CẬP NHẬT" : "QUẢN LÝ"}
              </span>

              <h2>
                {editingId
                  ? "Chỉnh sửa thông tin sinh viên"
                  : "Thêm sinh viên mới"}
              </h2>
            </div>

            {editingId && (
              <button className="cancel-btn" onClick={resetForm}>
                Hủy chỉnh sửa
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label>Mã số sinh viên</label>

                <input
                  type="text"
                  placeholder="Ví dụ: SV001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Họ và tên</label>

                <input
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Email</label>

                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-action">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Đang xử lý..."
                    : editingId
                    ? "✓ Cập nhật sinh viên"
                    : "+ Thêm sinh viên"}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ================= DANH SÁCH ================= */}
        <section className="students-card">
          <div className="students-header">
            <div>
              <span className="section-label">DATABASE</span>

              <h2>Danh sách sinh viên</h2>

              <p>
                Dữ liệu được lấy trực tiếp từ MongoDB Atlas thông qua REST API.
              </p>
            </div>

            <div className="student-count">
              {students.length} sinh viên
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>

              <p>Đang tải dữ liệu...</p>
            </div>
          ) : students.length === 0 ? (
            /* EMPTY */
            <div className="empty">
              <div className="empty-icon">📚</div>

              <h3>Chưa có sinh viên</h3>

              <p>Hãy thêm sinh viên đầu tiên bằng biểu mẫu phía trên.</p>
            </div>
          ) : (
            /* TABLE */
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>MSSV</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, index) => (
                    <tr key={student._id}>
                      <td>
                        <span className="index">{index + 1}</span>
                      </td>

                      <td>
                        <span className="student-id">
                          {student.studentId}
                        </span>
                      </td>

                      <td>
                        <div className="student-name">
                          <div className="avatar">
                            {student.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <strong>{student.name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="email">
                          {student.email}
                        </span>
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(student)}
                            title="Chỉnh sửa"
                          >
                            ✎
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(student._id)
                            }
                            title="Xóa"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer>
        <p>
          Student Management System • React + Express + MongoDB Atlas
        </p>
      </footer>
    </div>
  );
}

export default App;