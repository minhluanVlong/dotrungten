import React from 'react';
import { ReconciliationStats } from '../types/reconcile';
import { Users, FileText, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';

interface StatsBarProps {
  stats: ReconciliationStats;
  onFilterTab?: (tab: 'only-ds2' | 'matched' | 'only-ds1') => void;
  activeTab?: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, onFilterTab, activeTab }) => {
  const matchRate = stats.totalDs2 > 0 
    ? Math.round((stats.totalMatched / stats.totalDs2) * 100) 
    : 0;

  return (
    <div id="stats-section" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6">
      {/* 1. Tổng số BN DS1 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Tổng BN Danh sách 1
          </span>
          <FileText className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 tabular-nums">
            {stats.totalDs1.toLocaleString('vi-VN')}
          </span>
          <span className="text-xs text-slate-400">Dữ liệu thô</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Chưa qua phần mềm HIS
        </div>
      </div>

      {/* 2. Tổng số BN DS2 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Tổng BN Danh sách 2
          </span>
          <Users className="w-4 h-4 text-blue-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 tabular-nums">
            {stats.totalDs2.toLocaleString('vi-VN')}
          </span>
          <span className="text-xs text-blue-600">Phần mềm HIS</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Xuất từ hệ thống cơ sở dữ liệu
        </div>
      </div>

      {/* 3. Số BN đã khớp */}
      <div 
        onClick={() => onFilterTab && onFilterTab('matched')}
        className={`bg-white border rounded-xl p-4 transition-all cursor-pointer ${
          activeTab === 'matched' 
            ? 'border-emerald-500 ring-2 ring-emerald-100' 
            : 'border-slate-200 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-700">
            Số BN đã khớp
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 tabular-nums">
            {stats.totalMatched.toLocaleString('vi-VN')}
          </span>
          <span className="text-xs font-medium text-emerald-600 font-mono">
            ({matchRate}%)
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>Khớp tên hoặc họ tên</span>
          <span className="text-[11px] text-emerald-700 hover:underline">Xem chi tiết &rarr;</span>
        </div>
      </div>

      {/* 4. Số BN CHỈ CÓ TRONG DS2 (Mục tiêu trích xuất cốt lõi) */}
      <div 
        onClick={() => onFilterTab && onFilterTab('only-ds2')}
        className={`bg-amber-50/70 border rounded-xl p-4 transition-all cursor-pointer ${
          activeTab === 'only-ds2' 
            ? 'border-amber-500 ring-2 ring-amber-100' 
            : 'border-amber-300/80 hover:border-amber-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900">
            Chỉ có trong DS 2
          </span>
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-800 tabular-nums">
            {stats.totalOnlyInDs2.toLocaleString('vi-VN')}
          </span>
          <span className="text-xs font-medium text-amber-700">
            Cần đối soát
          </span>
        </div>
        <div className="mt-2 text-xs text-amber-800 flex items-center justify-between">
          <span>Không có ở DS1 (thô)</span>
          <span className="text-[11px] font-semibold text-amber-900 hover:underline">Xem bảng &rarr;</span>
        </div>
      </div>
    </div>
  );
};
