import React, { useState, useMemo } from 'react';
import { 
  ReconciliationResult, 
  ReconciledItem 
} from '../types/reconcile';
import { 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Filter,
  ExternalLink,
  Info
} from 'lucide-react';
import { exportToExcel, generateMarkdownReport } from '../utils/excelHelper';

interface ResultSectionProps {
  result: ReconciliationResult | null;
  activeTab: 'only-ds2' | 'matched' | 'only-ds1' | 'all-ds2';
  onChangeTab: (tab: 'only-ds2' | 'matched' | 'only-ds1' | 'all-ds2') => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  result,
  activeTab,
  onChangeTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [onlyShowWarnings, setOnlyShowWarnings] = useState(false);

  if (!result) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center my-6">
        <p className="text-sm text-slate-500">
          Vui lòng nhập hoặc chọn dữ liệu mẫu ở trên và nhấn "Thực hiện đối soát" để xem kết quả.
        </p>
      </div>
    );
  }

  const { stats, itemsOnlyInDs2, itemsMatched, itemsOnlyInDs1, allDs2Results } = result;

  const handleCopyMarkdown = async () => {
    const reportText = generateMarkdownReport(result);
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Không thể sao chép:', err);
    }
  };

  // Lọc dữ liệu theo tab & từ khóa tìm kiếm
  const filteredOnlyDs2 = useMemo(() => {
    return itemsOnlyInDs2.filter((item) => {
      const matchSearch =
        item.ds2Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.similarityNotes.some((n) => n.toLowerCase().includes(searchTerm.toLowerCase()));
      if (onlyShowWarnings) {
        return matchSearch && item.similarityNotes.length > 0;
      }
      return matchSearch;
    });
  }, [itemsOnlyInDs2, searchTerm, onlyShowWarnings]);

  const filteredMatched = useMemo(() => {
    return itemsMatched.filter(
      (item) =>
        item.ds2Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.matchedWithDs1 && item.matchedWithDs1.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [itemsMatched, searchTerm]);

  const filteredOnlyDs1 = useMemo(() => {
    return itemsOnlyInDs1.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [itemsOnlyInDs1, searchTerm]);

  return (
    <div id="results-section" className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden my-6">
      {/* Tab Navigation & Export Actions */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Interactive Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => onChangeTab('only-ds2')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'only-ds2'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Chỉ có trong Danh sách 2</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 bg-amber-100/80 text-amber-800 rounded">
              {itemsOnlyInDs2.length}
            </span>
          </button>

          <button
            onClick={() => onChangeTab('matched')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matched'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Đã khớp</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 bg-emerald-100/80 text-emerald-800 rounded">
              {itemsMatched.length}
            </span>
          </button>

          <button
            onClick={() => onChangeTab('only-ds1')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'only-ds1'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Chỉ có trong DS 1 (Thô)</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
              {itemsOnlyInDs1.length}
            </span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Sao chép báo cáo Markdown đúng mẫu đề bài"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã sao chép báo cáo!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Sao chép kết quả</span>
              </>
            )}
          </button>

          <button
            onClick={() => exportToExcel(result)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tải Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên bệnh nhân..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        {activeTab === 'only-ds2' && (
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={onlyShowWarnings}
              onChange={(e) => setOnlyShowWarnings(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <span>Chỉ hiện ca có cảnh báo gần giống ({itemsOnlyInDs2.filter(i => i.similarityNotes.length > 0).length})</span>
          </label>
        )}
      </div>

      {/* TAB 1: BẢNG TỔNG HỢP NHỮNG NGƯỜI CHỈ CÓ TRONG DANH SÁCH 2 (THEO ĐÚNG ĐỀ BÀI) */}
      {activeTab === 'only-ds2' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4 w-16 text-center">STT</th>
                <th className="py-3 px-4 min-w-[240px]">
                  Tên bệnh nhân (theo Danh sách 2)
                </th>
                <th className="py-3 px-4 min-w-[340px]">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOnlyDs2.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    {itemsOnlyInDs2.length === 0
                      ? 'Tuyệt vời! Không có bệnh nhân nào ở Danh sách 2 bị thiếu trong Danh sách 1.'
                      : 'Không tìm thấy bệnh nhân nào phù hợp với từ khóa tìm kiếm.'}
                  </td>
                </tr>
              ) : (
                filteredOnlyDs2.map((item, index) => {
                  const hasWarning = item.similarityNotes.length > 0;
                  return (
                    <tr
                      key={index}
                      className={`hover:bg-slate-50 transition-colors ${
                        hasWarning ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-500 tabular-nums">
                        {item.stt}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{item.ds2Name}</span>
                          {hasWarning && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-normal text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              Cần kiểm tra
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {hasWarning ? (
                          <div className="space-y-1">
                            {item.similarityNotes.map((note, nIdx) => (
                              <div
                                key={nIdx}
                                className="text-amber-900 font-medium flex items-start gap-1.5"
                              >
                                <span className="text-amber-500">&bull;</span>
                                <span>{note}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            Không tìm thấy bất kỳ thông tin trùng khớp nào trong Danh sách 1
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: BỆNH NHÂN ĐÃ KHỚP */}
      {activeTab === 'matched' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4 w-16 text-center">STT</th>
                <th className="py-3 px-4 min-w-[220px]">Tên bệnh nhân (DS2)</th>
                <th className="py-3 px-4 min-w-[200px]">Đã khớp với DS1</th>
                <th className="py-3 px-4 min-w-[260px]">Hình thức & Chi tiết khớp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMatched.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    Không có bệnh nhân nào đã khớp.
                  </td>
                </tr>
              ) : (
                filteredMatched.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-500 tabular-nums">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.ds2Name}
                    </td>
                    <td className="py-3 px-4 font-medium text-emerald-700">
                      {item.matchedWithDs1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-600">{item.matchReason}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CHỈ CÓ TRONG DANH SÁCH 1 (THÔ) */}
      {activeTab === 'only-ds1' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4 w-16 text-center">STT</th>
                <th className="py-3 px-4 min-w-[260px]">Tên bệnh nhân (Danh sách 1)</th>
                <th className="py-3 px-4 min-w-[200px]">Dữ liệu gốc</th>
                <th className="py-3 px-4">Tình trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOnlyDs1.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    Tất cả các bệnh nhân ở Danh sách 1 đều đã được khớp vào Danh sách 2!
                  </td>
                </tr>
              ) : (
                filteredOnlyDs1.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-500 tabular-nums">
                      {item.stt}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {item.original}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      Chưa tìm thấy người tương ứng trong phần mềm HIS (DS2)
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info & Quick Summary */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Hiển thị <strong>{activeTab === 'only-ds2' ? filteredOnlyDs2.length : activeTab === 'matched' ? filteredMatched.length : filteredOnlyDs1.length}</strong> kết quả
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
          <span>DS1: {stats.totalDs1}</span>
          <span>&bull;</span>
          <span>DS2: {stats.totalDs2}</span>
          <span>&bull;</span>
          <span className="text-emerald-700 font-semibold">Khớp: {stats.totalMatched}</span>
          <span>&bull;</span>
          <span className="text-amber-800 font-semibold">Chỉ DS2: {stats.totalOnlyInDs2}</span>
        </div>
      </div>
    </div>
  );
};
