import React from 'react';
import { X, CheckCircle, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

interface RulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesGuideModal: React.FC<RulesGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              Quy tắc đối soát & Khớp tên Bệnh nhân
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-600">
          {/* Quy tắc 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs">
                1
              </span>
              <h4>Khớp chính xác họ và tên đầy đủ</h4>
            </div>
            <p className="text-xs text-slate-600 ml-8 mb-2">
              Nếu Danh sách 1 có đầy đủ Họ và Tên (từ 3 từ trở lên, ví dụ: <strong>"Nguyễn Văn An"</strong>), hệ thống chỉ coi là trùng nếu Danh sách 2 có đúng <strong>"Nguyễn Văn An"</strong>.
            </p>
            <div className="ml-8 text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
              <span className="text-emerald-700 font-semibold">&bull; Khớp:</span> DS1 = "Nguyễn Văn An" &rarr; DS2 = "nguyễn văn an" (Bỏ qua viết hoa/thường, khoảng trắng thừa)<br />
              <span className="text-rose-700 font-semibold">&bull; Không khớp:</span> DS1 = "Nguyễn Văn An" &ne; DS2 = "Trần Văn An"
            </div>
          </div>

          {/* Quy tắc 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs">
                2
              </span>
              <h4>Khớp khi Danh sách 1 chỉ có tên hoặc tên đệm + tên</h4>
            </div>
            <p className="text-xs text-slate-600 ml-8 mb-2">
              Nếu Danh sách 1 chỉ ghi Tên (1 từ, ví dụ: <strong>"An"</strong>) hoặc Tên đệm + Tên (2 từ, ví dụ: <strong>"Văn An"</strong>): Hệ thống kiểm tra xem trong Danh sách 2 có bệnh nhân nào kết thúc bằng đúng từ/cụm từ đó hay không.
            </p>
            <div className="ml-8 text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 space-y-1">
              <div>
                <span className="text-emerald-700 font-semibold">&bull; Ví dụ 1:</span> DS1 = "An" &rarr; Khớp với "Nguyễn Văn An", "Trần Văn An", "Lê An".
              </div>
              <div>
                <span className="text-emerald-700 font-semibold">&bull; Ví dụ 2:</span> DS1 = "Văn An" &rarr; Khớp với "Nguyễn Văn An", "Trần Văn An" (kết thúc bằng "Văn An").
              </div>
              <div>
                <span className="text-slate-500 font-semibold">&bull; Phân biệt từ chuẩn:</span> "An" sẽ <strong>không</strong> vô tình khớp với "Hoàng Giang" (vì chữ cuối là "Giang", không phải từ "An").
              </div>
            </div>
          </div>

          {/* Quy tắc 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs">
                3
              </span>
              <h4>Mục tiêu trích xuất & Cảnh báo gần giống</h4>
            </div>
            <p className="text-xs text-slate-600 ml-8 mb-2">
              Hệ thống lọc và liệt kê danh sách những bệnh nhân ở <strong>Danh sách 2 (Phần mềm)</strong> mà hoàn toàn <strong>không tìm thấy bất kỳ thông tin trùng khớp nào</strong> trong Danh sách 1 theo các quy tắc trên.
            </p>
            <div className="ml-8 text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
              <strong>Cảnh báo thông minh:</strong> Nếu phát hiện trường hợp lệch dấu tiếng Việt (ví dụ DS1: "Lê Văn Án" vs DS2: "Lê Văn An") hoặc lệch 1-2 ký tự gõ nhầm, hệ thống sẽ tự động thêm vào cột <em>Ghi chú</em> để nhân viên y tế kiểm tra lại ngay!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
