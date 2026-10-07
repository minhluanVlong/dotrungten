/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { InputPanel } from './components/InputPanel';
import { ResultSection } from './components/ResultSection';
import { RulesGuideModal } from './components/RulesGuideModal';
import { SettingsModal } from './components/SettingsModal';
import { SAMPLE_DATASETS, SampleDataset } from './data/sampleDatasets';
import { reconcilePatientLists, DEFAULT_RULE_OPTIONS } from './utils/reconcileEngine';
import { ReconciliationRuleOptions } from './types/reconcile';
import { exportToExcel } from './utils/excelHelper';
import { CheckCircle2, ShieldCheck, FileSpreadsheet, AlertCircle } from 'lucide-react';

export default function App() {
  // Dữ liệu ban đầu lấy từ mẫu 1 (Phòng khám Ngoại Trú chuẩn theo đề bài)
  const [list1, setList1] = useState(SAMPLE_DATASETS[0].list1);
  const [list2, setList2] = useState(SAMPLE_DATASETS[0].list2);
  const [ruleOptions, setRuleOptions] = useState<ReconciliationRuleOptions>(DEFAULT_RULE_OPTIONS);

  // Trạng thái modal & giao diện
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'only-ds2' | 'matched' | 'only-ds1' | 'all-ds2'>('only-ds2');

  // Tính toán kết quả đối soát ngay lập tức khi danh sách hoặc tùy chọn thay đổi
  const reconciliationResult = useMemo(() => {
    return reconcilePatientLists(list1, list2, ruleOptions);
  }, [list1, list2, ruleOptions]);

  const handleClearAll = useCallback(() => {
    setList1('');
    setList2('');
  }, []);

  const handleLoadSample = useCallback((sample: SampleDataset) => {
    setList1(sample.list1);
    setList2(sample.list2);
    setActiveTab('only-ds2');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportExcel = useCallback(() => {
    if (reconciliationResult) {
      exportToExcel(reconciliationResult);
    }
  }, [reconciliationResult]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Header Bar */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onPrint={handlePrint}
        onExportExcel={handleExportExcel}
        hasResults={Boolean(reconciliationResult && (list1 || list2))}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner giới thiệu ngắn gọn & trạng thái */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold tracking-wide uppercase mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Chuyên gia Đối soát & Khớp Dữ liệu Y tế</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Đối Soát Danh Sách Bệnh Nhân (BN)
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tự động so sánh dữ liệu thô (sổ tay, phòng khám) với danh sách xuất từ phần mềm HIS. 
              Tìm chính xác những bệnh nhân <strong>có trong Danh sách 2 nhưng KHÔNG có trong Danh sách 1</strong> theo quy tắc khớp cả họ tên, khớp tên rút gọn, và cảnh báo sai lệch dấu.
            </p>
          </div>
        </div>

        {/* Input Panel */}
        <InputPanel
          list1={list1}
          list2={list2}
          onChangeList1={setList1}
          onChangeList2={setList2}
          onRunReconciliation={() => setActiveTab('only-ds2')}
          onClearAll={handleClearAll}
          onLoadSample={handleLoadSample}
          onToggleGuide={() => setIsGuideOpen(true)}
        />

        {/* Thống kê nhanh 4 chỉ số (Yêu cầu 2 của người dùng) */}
        {reconciliationResult && (
          <StatsBar
            stats={reconciliationResult.stats}
            onFilterTab={(tab) => setActiveTab(tab)}
            activeTab={activeTab}
          />
        )}

        {/* Bảng tổng hợp & Kết quả chi tiết (Yêu cầu 1 của người dùng) */}
        <ResultSection
          result={reconciliationResult}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      </main>

      {/* Bản in chuyên dụng (chỉ xuất hiện khi in) */}
      {reconciliationResult && (
        <div className="hidden print:block print:p-8 bg-white text-black">
          <div className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-xl font-bold uppercase">
              Báo Cáo Đối Soát Dữ Liệu Bệnh Nhân (BN)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Thời gian xuất: {new Date().toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-base font-bold mb-2">Thống kê nhanh:</h2>
            <ul className="text-sm space-y-1">
              <li>&bull; Tổng số BN Danh sách 1 (Dữ liệu thô): <strong>{reconciliationResult.stats.totalDs1}</strong></li>
              <li>&bull; Tổng số BN Danh sách 2 (Phần mềm): <strong>{reconciliationResult.stats.totalDs2}</strong></li>
              <li>&bull; Số BN đã khớp: <strong>{reconciliationResult.stats.totalMatched}</strong></li>
              <li>&bull; Số BN chỉ có trong Danh sách 2: <strong>{reconciliationResult.stats.totalOnlyInDs2}</strong></li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold mb-2">
              Danh sách những người chỉ có trong Danh sách 2 (Phần mềm):
            </h2>
            <table className="w-full text-xs border border-collapse border-black">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="border border-black p-2 w-12 text-center">STT</th>
                  <th className="border border-black p-2 text-left">Tên bệnh nhân (theo DS2)</th>
                  <th className="border border-black p-2 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {reconciliationResult.itemsOnlyInDs2.map((item, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                    <td className="border border-black p-2 font-bold">{item.ds2Name}</td>
                    <td className="border border-black p-2">
                      {item.similarityNotes.length > 0
                        ? item.similarityNotes.join('; ')
                        : 'Không có thông tin trong Danh sách 1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            Hệ thống đối soát dữ liệu bệnh nhân chuyên nghiệp &bull; Xử lý 100% bảo mật trên trình duyệt (Client-Side)
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Quy tắc khớp
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cài đặt lọc
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RulesGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        options={ruleOptions}
        onChangeOptions={setRuleOptions}
      />
    </div>
  );
}
