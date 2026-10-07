export type MatchStatus = 
  | 'EXACT_FULL_MATCH' 
  | 'SUFFIX_NAME_MATCH' 
  | 'UNMATCHED_ONLY_IN_DS2' 
  | 'ONLY_IN_DS1';

export interface RawPatientItem {
  id: string;
  originalText: string;
  cleanName: string;
  normalizedName: string; // lowercase, trimmed, normalized spaces
  normalizedNoAccent: string; // accent-removed for fuzzy/similarity check
  tokens: string[]; // words array
  lineNum: number;
}

export interface NearMatchWarning {
  ds1Original: string;
  similarity: number; // 0 to 1
  reason: string;
}

export interface ReconciledItem {
  stt: number;
  ds2Name: string;
  ds2Original: string;
  status: MatchStatus;
  matchedWithDs1: string | null;
  matchReason: string;
  similarityNotes: string[];
  nearMatches: NearMatchWarning[];
}

export interface ReconciliationStats {
  totalDs1: number;
  totalDs2: number;
  totalMatched: number;
  totalOnlyInDs2: number;
  totalOnlyInDs1: number;
}

export interface ReconciliationRuleOptions {
  stripPrefixNumbers: boolean; // Loại bỏ STT đầu dòng như 1., 2/, 03 -
  stripParenthesesInfo: boolean; // Loại bỏ thông tin phụ trong ngoặc (năm sinh, SĐT, BHYT)
  caseInsensitive: boolean; // Bỏ qua chữ hoa / chữ thường (mặc định BẬT)
  allowSuffixMatch: boolean; // Khớp tên rút gọn (1 từ) hoặc đệm + tên (2 từ)
  maxWordsForSuffix: number; // Tối đa số từ xem là tên rút gọn (mặc định: 2)
  fuzzyWarningEnabled: boolean; // Cảnh báo tên gần giống
  fuzzyThreshold: number; // Ngưỡng tương đồng (0.75 = 75%)
  ignoreAccents: boolean; // So khớp không phân biệt dấu tiếng Việt (mặc định TẮT)
}

export interface ReconciliationResult {
  stats: ReconciliationStats;
  itemsOnlyInDs2: ReconciledItem[];
  itemsMatched: ReconciledItem[];
  itemsOnlyInDs1: {
    stt: number;
    name: string;
    original: string;
    lineNum: number;
  }[];
  allDs2Results: ReconciledItem[];
  processedAt: string;
}
