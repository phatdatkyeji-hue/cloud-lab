import { useEffect, useState } from "react";

function App() {
  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const response = await fetch(
        "https://cuddly-goggles-q7j75v55wrvg3g7-5000.app.github.dev/api/students"
      );

      const data = await response.json();

      setStudents(data);
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Thêm sinh viên
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://cuddly-goggles-q7j75v55wrvg3g7-5000.app.github.dev/api/students",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            studentId,
            name,
            email
          })
        }
      );

      const data = await response.json();

      console.log(data);

      // Làm mới danh sách
      fetchStudents();

      // Xóa dữ liệu trong Form
      setStudentId("");
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  return (
    <div>
      <h1>Danh sách sinh viên</h1>

      <ul>
        {students.map((student) => (
          <li key={student._id}>
            MSSV: {student.studentId} - Họ tên: {student.name} - Email: {student.email}
          </li>
        ))}
      </ul>

      <hr />

      <h2>Thêm sinh viên</h2>

      <form onSubmit={handleSubmit}>
        <label>MSSV:</label>
        <br />
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <br />
        <br />

        <label>Họ tên:</label>
        <br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br />
        <br />

        <label>Email:</label>
        <br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />
        <br />

        <button type="submit">
          Thêm sinh viên
        </button>
      </form>
    </div>
  );
}

export default App;