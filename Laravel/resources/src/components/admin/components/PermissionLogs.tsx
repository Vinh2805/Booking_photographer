export function PermissionLogs() {
  const logs = [
    'Admin01 đã thêm quyền "content.write" cho Support01',
    'Admin02 đã xóa vai trò "Temp Manager"',
    'Admin01 đã tạo vai trò mới "Event Manager"',
  ];

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Nhật ký phân quyền</h4>
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div key={index} className="bg-gray-50 p-2 rounded text-sm">
            <p>{log}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(Date.now() - index * 3600000).toLocaleString("vi-VN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
