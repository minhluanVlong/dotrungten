import React from 'react';
import { ReconciliationRuleOptions } from '../types/reconcile';
import { X, Sliders, RotateCcw } from 'lucide-react';
import { DEFAULT_RULE_OPTIONS } from '../utils/reconcileEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ReconciliationRuleOptions;
  onChangeOptions: (newOpts: ReconciliationRuleOptions) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  options,
  onChangeOptions,
}) => {
  if (!isOpen) return null;

  const handleToggle = (key: keyof ReconciliationRuleOptions) => {
    onChangeOptions({
      ...options,
      [key]: !options[key],
    });
  };

  const handleReset = () => {
    onChangeOptions(DEFAULT_RULE_OPTIONS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              Cài đặt Quy tắc & Làm sạch Dữ liệu
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Options */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Tách STT đầu dòng */}
          <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900">
                Tự động tách bỏ STT đầu dòng
              </div>
              <p className="text-slate-500 mt-0.5">
                Loại bỏ "1.", "02 -", "3/", "4)" đứng trước tên để lấy họ tên chuẩn.
              </p>
            </div>
            <input
              type="checkbox"
              checked={options.stripPrefixNumbers}
              onChange={() => handleToggle('stripPrefixNumbers')}
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Loại bỏ thông tin trong ngoặc */}
          <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900">
                Bỏ thông tin phụ trong ngoặc đơn / vuông
              </div>
              <p className="text-slate-500 mt-0.5">
                Loại bỏ "(1985)", "(Nam)", "[BHYT]" khi so sánh tên.
              </p>
            </div>
            <input
              type="checkbox"
              checked={options.stripParenthesesInfo}
              onChange={() => handleToggle('stripParenthesesInfo')}
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Khớp tên rút gọn (Quy tắc 2) */}
          <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900">
                Khớp tên rút gọn khi DS1 chỉ có tên hoặc đệm + tên
              </div>
              <p className="text-slate-500 mt-0.5">
                Kiểm tra xem tên ở DS2 có kết thúc bằng cụm tên ở DS1 hay không (Quy tắc 2).
              </p>
            </div>
            <input
              type="checkbox"
              checked={options.allowSuffixMatch}
              onChange={() => handleToggle('allowSuffixMatch')}
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Cảnh báo gần giống */}
          <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900">
                Cảnh báo ca gần giống (sai dấu / sai chính tả)
              </div>
              <p className="text-slate-500 mt-0.5">
                Ghi chú các trường hợp như "Lê Văn Án" vs "Lê Văn An" để kiểm tra lại.
              </p>
            </div>
            <input
              type="checkbox"
              checked={options.fuzzyWarningEnabled}
              onChange={() => handleToggle('fuzzyWarningEnabled')}
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Tùy chọn so sánh không dấu */}
          <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900">
                Bỏ qua dấu tiếng Việt khi so khớp
              </div>
              <p className="text-slate-500 mt-0.5">
                (Mặc định tắt) Nếu bật, "Nguyễn Văn Án" và "Nguyễn Văn An" sẽ được tính là trùng khớp.
              </p>
            </div>
            <input
              type="checkbox"
              checked={options.ignoreAccents}
              onChange={() => handleToggle('ignoreAccents')}
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};
