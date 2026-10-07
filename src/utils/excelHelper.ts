import * as XLSX from 'xlsx';
import { ReconciledItem, ReconciliationResult, ReconciliationStats } from '../types/reconcile';

/**
 * Tạo báo cáo dạng văn bản Markdown chuẩn theo đúng yêu cầu đề bài
 */
export function generateMarkdownReport(result: ReconciliationResult): string {
  const { stats, itemsOnlyInDs2 } = result;

  let md = `### KẾT QUẢ ĐỐI SOÁT DỮ LIỆU BỆNH NHÂN (BN)\n\n`;

  md += `### 1. BẢNG TỔNG HỢP NHỮNG NGƯỜI CHỈ CÓ TRONG DANH SÁCH 2\n`;
  md += `| STT | Tên bệnh nhân (theo Danh sách 2) | Ghi chú |\n`;
  md += `| :---: | :--- | :--- |\n`;

  if (itemsOnlyInDs2.length === 0) {
    md += `| - | (Không có bệnh nhân nào chỉ xuất hiện ở Danh sách 2) | Toàn bộ bệnh nhân DS2 đều đã khớp với DS1 |\n`;
  } else {
    itemsOnlyInDs2.forEach((item, index) => {
      const note = item.similarityNotes.length > 0 
        ? item.similarityNotes.join('; ') 
        : 'Chưa có thông tin trong Danh sách 1';
      md += `| ${index + 1} | ${item.ds2Name} | ${note} |\n`;
    });
  }

  md += `\n---\n\n`;
  md += `### 2. THỐNG KÊ NHANH:\n`;
  md += `- Tổng số BN Danh sách 1: ${stats.totalDs1}\n`;
  md += `- Tổng số BN Danh sách 2: ${stats.totalDs2}\n`;
  md += `- Số BN đã khớp: ${stats.totalMatched}\n`;
  md += `- Số BN chỉ có trong Danh sách 2: ${stats.totalOnlyInDs2}\n`;

  return md;
}

/**
 * Xuất file Excel (.xlsx) gồm 3 sheet:
 * - Sheet 1: Chỉ có trong DS2 (Báo cáo chính)
 * - Sheet 2: Danh sách đã khớp (Chi tiết đối chiếu)
 * - Sheet 3: Thống kê tổng hợp
 */
export function exportToExcel(result: ReconciliationResult, fileName = 'doi_soat_benh_nhan.xlsx') {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Chỉ có trong DS2
  const ds2Rows = result.itemsOnlyInDs2.map((item, index) => ({
    'STT': index + 1,
    'Tên bệnh nhân (DS2 - Phần mềm)': item.ds2Name,
    'Dữ liệu gốc': item.ds2Original,
    'Ghi chú & Cảnh báo': item.similarityNotes.length > 0 
      ? item.similarityNotes.join(' | ') 
      : 'Không tìm thấy trong DS1'
  }));
  const ws1 = XLSX.utils.json_to_sheet(ds2Rows.length > 0 ? ds2Rows : [{ 'Thông báo': 'Không có BN nào chỉ có trong DS2' }]);
  XLSX.utils.book_append_sheet(workbook, ws1, 'Chỉ có trong DS2');

  // Sheet 2: Danh sách đã khớp
  const matchedRows = result.itemsMatched.map((item, index) => ({
    'STT': index + 1,
    'Tên bệnh nhân (DS2)': item.ds2Name,
    'Đã khớp với DS1': item.matchedWithDs1 || '',
    'Hình thức khớp': item.status === 'EXACT_FULL_MATCH' ? 'Khớp chính xác họ tên' : 'Khớp tên rút gọn',
    'Chi tiết': item.matchReason
  }));
  const ws2 = XLSX.utils.json_to_sheet(matchedRows.length > 0 ? matchedRows : [{ 'Thông báo': 'Chưa có BN nào khớp' }]);
  XLSX.utils.book_append_sheet(workbook, ws2, 'Đã khớp');

  // Sheet 3: Thống kê
  const statsRows = [
    { 'Chỉ tiêu đối soát': 'Tổng số BN Danh sách 1 (Dữ liệu thô)', 'Số lượng': result.stats.totalDs1 },
    { 'Chỉ tiêu đối soát': 'Tổng số BN Danh sách 2 (Phần mềm)', 'Số lượng': result.stats.totalDs2 },
    { 'Chỉ tiêu đối soát': 'Số BN đã khớp giữa 2 danh sách', 'Số lượng': result.stats.totalMatched },
    { 'Chỉ tiêu đối soát': 'Số BN chỉ có trong Danh sách 2', 'Số lượng': result.stats.totalOnlyInDs2 },
    { 'Chỉ tiêu đối soát': 'Số BN chỉ có trong Danh sách 1 (chưa lên PM)', 'Số lượng': result.stats.totalOnlyInDs1 },
    { 'Chỉ tiêu đối soát': 'Thời gian xử lý', 'Số lượng': new Date().toLocaleString('vi-VN') }
  ];
  const ws3 = XLSX.utils.json_to_sheet(statsRows);
  XLSX.utils.book_append_sheet(workbook, ws3, 'Thống kê tổng quan');

  XLSX.writeFile(workbook, fileName);
}

/**
 * Đọc file Excel hoặc CSV được tải lên và trích xuất danh sách tên
 */
export async function readNamesFromFile(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Chuyển sheet sang mảng các hàng
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  if (!rows || rows.length === 0) return [];

  // Tìm cột chứa tên:
  // Nếu có header dòng 1 như "Họ và tên", "Họ tên", "Tên bệnh nhân", "Tên BN", "Patient Name"
  let targetColIdx = 0;
  let startRowIdx = 0;

  if (rows.length > 1) {
    const headerRow = rows[0].map((c: any) => String(c || '').toLowerCase().trim());
    const nameKeywords = ['tên', 'họ và tên', 'họ tên', 'bệnh nhân', 'bn', 'patient', 'name'];
    const matchedIdx = headerRow.findIndex((col: string) => 
      nameKeywords.some(kw => col.includes(kw))
    );

    if (matchedIdx !== -1) {
      targetColIdx = matchedIdx;
      startRowIdx = 1;
    }
  }

  const names: string[] = [];
  for (let r = startRowIdx; r < rows.length; r++) {
    const cellValue = rows[r]?.[targetColIdx];
    if (cellValue !== undefined && cellValue !== null) {
      const str = String(cellValue).trim();
      if (str) names.push(str);
    }
  }

  return names;
}
