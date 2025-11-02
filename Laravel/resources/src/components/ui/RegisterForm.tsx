import React, { useState } from "react";

const RegisterForm: React.FC = () => {
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/dang-ky", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          Ho_Ten: hoTen,
          Email_TK: email,
          Mat_Khau: matKhau,
          Mat_Khau_confirmation: xacNhan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Đăng ký thành công!");
        console.log("User:", data.user);
      } else {
        setMessage(data.message || "❌ Đăng ký thất bại!");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Không thể kết nối tới server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h2 className="text-3xl font-bold mb-6">Đăng ký Momentia</h2>

      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 w-[350px] border p-6 rounded-lg shadow-md bg-white"
      >
        <input
          type="text"
          placeholder="Họ và tên"
          value={hoTen}
          onChange={(e) => setHoTen(e.target.value)}
          required
          className="border p-2 rounded-md"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded-md"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          required
          className="border p-2 rounded-md"
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={xacNhan}
          onChange={(e) => setXacNhan(e.target.value)}
          required
          className="border p-2 rounded-md"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      {message && (
        <p
          className="mt-4 text-lg"
          style={{ color: message.includes("✅") ? "green" : "red" }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default RegisterForm;
