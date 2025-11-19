import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const data = [
  { name: 'Nguyễn Văn A', progress: 85, codeQuality: 90 },
  { name: 'Trần Thị B', progress: 45, codeQuality: 60 },
  { name: 'Lê Văn C', progress: 67, codeQuality: 75 },
  { name: 'Phạm Thị D', progress: 95, codeQuality: 88 },
  { name: 'Hoàng Văn E', progress: 30, codeQuality: 50 },
];

const pieData = [
  { name: 'Hoàn thành', value: 8 },
  { name: 'Đang làm', value: 12 },
  { name: 'Gặp khó khăn', value: 4 },
];

const COLORS = ['#2D5016', '#F4A261', '#ef4444'];

const TeacherDashboard: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-forest mb-2">Bảng điều khiển Giáo viên</h1>
        <p className="text-gray-600 mb-8">Lớp 11A2 - Môn Tin học</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium">Sĩ số lớp</h3>
            <p className="text-3xl font-bold text-charcoal">24</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-gray-500 font-medium">Trung bình cấp độ</h3>
             <p className="text-3xl font-bold text-forest">2.4</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-gray-500 font-medium">Cần hỗ trợ</h3>
             <p className="text-3xl font-bold text-red-500">4</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-forest mb-4">Tiến độ học sinh</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" name="Tiến độ (%)" fill="#2D5016" />
                  <Bar dataKey="codeQuality" name="Chất lượng code" fill="#F4A261" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-forest mb-4">Tổng quan trạng thái</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Action Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
           <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-charcoal">Danh sách học sinh cần lưu ý</h3>
              <button className="text-sm text-amber hover:underline">Xem tất cả</button>
           </div>
           <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                 <tr>
                    <th className="px-6 py-3 font-medium">Học sinh</th>
                    <th className="px-6 py-3 font-medium">Vấn đề hiện tại</th>
                    <th className="px-6 py-3 font-medium">Số lần chạy lỗi</th>
                    <th className="px-6 py-3 font-medium">Hành động</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 <tr>
                    <td className="px-6 py-4 font-medium">Hoàng Văn E</td>
                    <td className="px-6 py-4 text-red-500">Kẹt ở vòng lặp vô hạn</td>
                    <td className="px-6 py-4">12</td>
                    <td className="px-6 py-4">
                       <button className="bg-forest text-white px-3 py-1 rounded text-xs hover:bg-forest-light transition">Hỗ trợ ngay</button>
                    </td>
                 </tr>
                 <tr>
                    <td className="px-6 py-4 font-medium">Trần Thị B</td>
                    <td className="px-6 py-4 text-amber-dark">Lỗi cú pháp liên tục</td>
                    <td className="px-6 py-4">8</td>
                    <td className="px-6 py-4">
                       <button className="bg-forest text-white px-3 py-1 rounded text-xs hover:bg-forest-light transition">Hỗ trợ ngay</button>
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;