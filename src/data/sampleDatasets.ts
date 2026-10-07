export interface SampleDataset {
  id: string;
  title: string;
  description: string;
  list1: string;
  list2: string;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'outpatient-clinic',
    title: 'Phòng Khám Đa Khoa (Mẫu chuẩn đề bài)',
    description: 'Bao gồm đủ trường hợp: khớp chính xác họ tên, khớp theo tên/đệm+tên, BN chỉ có ở phần mềm, và BN lệch dấu cần cảnh báo.',
    list1: `Nguyễn Văn An
Trần Thị Kim Loan
Võ Minh Trí
Phạm Hoàng Bách
Bình
Hương
Huy
Văn Dũng
Thị Huệ
Lê Văn Án
Đặng Mỹ Linh`,
    list2: `Nguyễn Văn An
Trần Thị Kim Loan
Võ Minh Trí
Phạm Hoàng Bách
Đỗ Thái Bình
Nguyễn Thu Hương
Trần Quang Huy
Lê Văn Dũng
Phạm Thị Huệ
Lê Văn An
Bùi Đức Thịnh
Nguyễn Gia Hân
Hoàng Quốc Việt
Vũ Thảo My`,
  },
  {
    id: 'inpatient-records',
    title: 'Khoa Nội - Dữ liệu thô có số thứ tự & năm sinh',
    description: 'Thử nghiệm tính năng tự động làm sạch STT đầu dòng, mã y tế và năm sinh trong ngoặc.',
    list1: `1. Nguyễn Hoàng Long (1978)
2. Trần Đình Trọng - 1990
3/ Vũ Thị Hoa
4) Mai
05 - Văn Toàn
06. Lê Ngọc Bảo
7. Hà Đức Chinh [BHYT]
8. Tuấn`,
    list2: `Nguyễn Hoàng Long
Trần Đình Trọng
Vũ Thị Hoa
Nguyễn Tuyết Mai
Nguyễn Văn Toàn
Lê Ngọc Bảo
Hà Đức Chinh
Phan Văn Đức
Đoàn Văn Hậu
Nguyễn Tuấn Anh
Ngô Quang Tuấn`,
  },
  {
    id: 'vaccination-center',
    title: 'Trung Tâm Tiêm Chủng - Đối soát sổ tiêm với phần mềm',
    description: 'Đối soát các ca tiêm chủng trong ca trực, phát hiện các phiếu đã nhập vào phần mềm mà chưa có trong sổ ghi bàn tiêm.',
    list1: `Bé Nguyễn Minh Khôi
Bé Bảo An
Lê Hoàng Yến
Phương Thảo
Minh Quân
Trần Bảo Ngọc
Khánh Vy`,
    list2: `Nguyễn Minh Khôi
Lê Bảo An
Lê Hoàng Yến
Vũ Phương Thảo
Đặng Minh Quân
Trần Bảo Ngọc
Nguyễn Khánh Vy
Đinh Tiến Dũng
Hồ Quỳnh Nga
Lâm Nhật Tân`,
  },
];
