import React from 'react';
import { 
  FileSpreadsheet, 
  Settings2, 
  Printer, 
  CheckCircle2, 
  HelpCircle,
  Stethoscope
} from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onPrint: () => void;
  onExportExcel: () => void;
  hasResults: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenGuide,
  onPrint,
  onExportExcel,
  hasResults,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single-element Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
              Đối Soát Bệnh Nhân Pro
            </span>
            <span className="text-xs text-slate-500 mt-1">
              Phần mềm kiểm tra trùng khớp & trích xuất chênh lệch HIS
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 hover:text-teal-700 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Quy tắc đối soát</span>
          </button>
          <a
            href="#stats-section"
            className="hover:text-teal-700 transition-colors"
          >
            Thống kê nhanh
          </a>
          <a
            href="#results-section"
            className="hover:text-teal-700 transition-colors"
          >
            Bảng kết quả
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Cài đặt quy tắc đối soát"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Quy tắc lọc</span>
          </button>

          {hasResults && (
            <>
              <button
                onClick={onPrint}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                title="In kết quả đối soát"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>In</span>
              </button>

              <button
                onClick={onExportExcel}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Xuất Excel</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
