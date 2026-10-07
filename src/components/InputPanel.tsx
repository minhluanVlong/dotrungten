import React, { useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  FileText, 
  Database,
  ArrowRight,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { SAMPLE_DATASETS, SampleDataset } from '../data/sampleDatasets';
import { readNamesFromFile } from '../utils/excelHelper';

interface InputPanelProps {
  list1: string;
  list2: string;
  onChangeList1: (val: string) => void;
  onChangeList2: (val: string) => void;
  onRunReconciliation: () => void;
  onClearAll: () => void;
  onLoadSample: (sample: SampleDataset) => void;
  onToggleGuide: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  list1,
  list2,
  onChangeList1,
  onChangeList2,
  onRunReconciliation,
  onClearAll,
  onLoadSample,
  onToggleGuide,
}) => {
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const getLineCount = (text: string) => {
    if (!text.trim()) return 0;
    return text.split(/\r?\n/).filter((l) => l.trim().length > 0).length;
  };

  const count1 = getLineCount(list1);
  const count2 = getLineCount(list2);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetList: 1 | 2
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.txt')) {
        const text = await file.text();
        if (targetList === 1) onChangeList1(text);
        else onChangeList2(text);
      } else {
        // Excel hoặc CSV
        const names = await readNamesFromFile(file);
        const joined = names.join('\n');
        if (targetList === 1) onChangeList1(joined);
        else onChangeList2(joined);
      }
    } catch (err) {
      console.error('Lỗi đọc tệp:', err);
      alert('Không thể đọc file. Vui lòng kiểm tra định dạng .xlsx, .csv hoặc .txt');
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Top action toolbar */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Nạp dữ liệu đầu vào
          </span>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 hidden sm:inline">Dữ liệu mẫu:</span>
            <div className="flex items-center gap-1">
              {SAMPLE_DATASETS.map((sample, idx) => (
                <button
                  key={sample.id}
                  onClick={() => onLoadSample(sample)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-slate-200/70 rounded-md transition-colors cursor-pointer"
                  title={sample.description}
                >
                  Mẫu {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleGuide}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem quy tắc khớp</span>
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa cả 2</span>
          </button>
        </div>
      </div>

      {/* Two Column Input Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Danh sách 1: Dữ liệu thô */}
        <div className="p-5 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                <h3 className="text-sm font-bold text-slate-800">
                  Danh sách 1 (Dữ liệu thô / Tự tạo)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sổ ghi chép, danh sách viết tay. Có thể chỉ có tên (ví dụ: <span className="font-semibold text-slate-700">An</span>) hoặc tên đệm + tên (ví dụ: <span className="font-semibold text-slate-700">Văn An</span>).
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                {count1} BN
              </span>
            </div>
          </div>

          <div className="relative flex-1 mt-2">
            <textarea
              value={list1}
              onChange={(e) => onChangeList1(e.target.value)}
              placeholder="Dán Danh sách 1 vào đây...&#10;Mỗi bệnh nhân một dòng, ví dụ:&#10;Nguyễn Văn An&#10;Bình&#10;Văn Dũng&#10;Trần Thị Huệ"
              rows={9}
              className="w-full h-56 p-3 text-sm font-mono text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-y"
              spellCheck={false}
            />
          </div>

          {/* Quick upload & clean actions for DS1 */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef1}
                accept=".xlsx,.xls,.csv,.txt"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 1)}
              />
              <button
                onClick={() => fileInputRef1.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Tải file Excel / CSV</span>
              </button>
            </div>

            {list1 && (
              <button
                onClick={() => onChangeList1('')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Xóa DS1
              </button>
            )}
          </div>
        </div>

        {/* Danh sách 2: Xuất từ phần mềm */}
        <div className="p-5 flex flex-col bg-slate-50/30">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <h3 className="text-sm font-bold text-slate-800">
                  Danh sách 2 (Xuất từ phần mềm HIS)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu xuất từ phần mềm bệnh viện. Hệ thống sẽ tìm ra ai có ở DS2 này mà <span className="font-semibold text-rose-600">KHÔNG CÓ</span> trong DS1.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-semibold text-blue-700 tabular-nums">
                {count2} BN
              </span>
            </div>
          </div>

          <div className="relative flex-1 mt-2">
            <textarea
              value={list2}
              onChange={(e) => onChangeList2(e.target.value)}
              placeholder="Dán Danh sách 2 vào đây...&#10;Mỗi bệnh nhân một dòng, ví dụ:&#10;Nguyễn Văn An&#10;Đỗ Thái Bình&#10;Lê Văn Dũng&#10;Bùi Đức Thịnh (chỉ có ở DS2)"
              rows={9}
              className="w-full h-56 p-3 text-sm font-mono text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y"
              spellCheck={false}
            />
          </div>

          {/* Quick upload & clean actions for DS2 */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef2}
                accept=".xlsx,.xls,.csv,.txt"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 2)}
              />
              <button
                onClick={() => fileInputRef2.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Tải file Excel / CSV</span>
              </button>
            </div>

            {list2 && (
              <button
                onClick={() => onChangeList2('')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Xóa DS2
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Process Action Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Tự động xử lý đối soát theo 3 quy tắc: khớp đầy đủ họ tên, khớp tên/đệm kết thúc, và cảnh báo sai lệch.
        </div>

        <button
          onClick={onRunReconciliation}
          disabled={!list1.trim() && !list2.trim()}
          className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Thực hiện đối soát</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
