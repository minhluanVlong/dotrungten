import {
  RawPatientItem,
  ReconciledItem,
  ReconciliationResult,
  ReconciliationRuleOptions,
  ReconciliationStats,
} from '../types/reconcile';
import {
  checkNearMatch,
  cleanPatientName,
  normalizeForComparison,
  tokenizeName,
} from './normalize';

export const DEFAULT_RULE_OPTIONS: ReconciliationRuleOptions = {
  stripPrefixNumbers: true,
  stripParenthesesInfo: true,
  caseInsensitive: true,
  allowSuffixMatch: true,
  maxWordsForSuffix: 2, // 1 từ (Tên) hoặc 2 từ (Đệm + Tên)
  fuzzyWarningEnabled: true,
  fuzzyThreshold: 0.75,
  ignoreAccents: false,
};

/**
 * Tách nội dung văn bản đầu vào thành danh sách các bệnh nhân thô
 */
export function parsePatientList(
  rawText: string,
  options: ReconciliationRuleOptions
): RawPatientItem[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const result: RawPatientItem[] = [];

  lines.forEach((line, index) => {
    const rawLine = line.trim();
    if (!rawLine) return;

    const clean = cleanPatientName(rawLine, {
      stripPrefixNumbers: options.stripPrefixNumbers,
      stripParenthesesInfo: options.stripParenthesesInfo,
    });

    if (!clean) return;

    const normalized = normalizeForComparison(clean, options.ignoreAccents);
    const tokens = tokenizeName(normalized);

    result.push({
      id: `p-${index + 1}-${Date.now().toString(36)}`,
      originalText: rawLine,
      cleanName: clean,
      normalizedName: normalized,
      normalizedNoAccent: normalizeForComparison(clean, true),
      tokens,
      lineNum: index + 1,
    });
  });

  return result;
}

/**
 * Kiểm tra xem một bệnh nhân DS2 có khớp với một mục trong DS1 hay không
 */
function checkPatientMatch(
  ds2Item: RawPatientItem,
  ds1Item: RawPatientItem,
  options: ReconciliationRuleOptions
): {
  isMatch: boolean;
  matchType?: 'EXACT_FULL_MATCH' | 'SUFFIX_NAME_MATCH';
  reason?: string;
} {
  const norm1 = ds1Item.normalizedName;
  const norm2 = ds2Item.normalizedName;
  const tokens1 = ds1Item.tokens;
  const tokens2 = ds2Item.tokens;

  // 1. Khớp chính xác hoàn toàn chuỗi đã chuẩn hóa
  if (norm1 === norm2) {
    return {
      isMatch: true,
      matchType: 'EXACT_FULL_MATCH',
      reason: `Khớp chính xác họ và tên ("${ds1Item.cleanName}")`,
    };
  }

  // 2. Quy tắc khi DS1 chỉ ghi Tên hoặc Tên đệm + Tên (số từ <= maxWordsForSuffix, mặc định là 1 hoặc 2 từ)
  if (
    options.allowSuffixMatch &&
    tokens1.length > 0 &&
    tokens1.length <= options.maxWordsForSuffix &&
    tokens2.length >= tokens1.length
  ) {
    // Kiểm tra xem DS2 có KẾT THÚC bằng đúng các từ trong DS1 hay không
    // Ví dụ: tokens1 = ["an"], tokens2 = ["nguyễn", "văn", "an"]
    // tokens1 = ["văn", "an"], tokens2 = ["nguyễn", "văn", "an"]
    const ds2TailTokens = tokens2.slice(tokens2.length - tokens1.length);
    const isTailEqual = ds2TailTokens.every((t, i) => t === tokens1[i]);

    if (isTailEqual) {
      const matchLabel =
        tokens1.length === 1
          ? `Khớp tên kết thúc "${ds1Item.cleanName}"`
          : `Khớp đệm + tên kết thúc "${ds1Item.cleanName}"`;
      return {
        isMatch: true,
        matchType: 'SUFFIX_NAME_MATCH',
        reason: `${matchLabel} (DS1: "${ds1Item.cleanName}")`,
      };
    }
  }

  return { isMatch: false };
}

/**
 * Hàm thực thi đối soát dữ liệu bệnh nhân chính
 */
export function reconcilePatientLists(
  rawList1: string,
  rawList2: string,
  userOptions: Partial<ReconciliationRuleOptions> = {}
): ReconciliationResult {
  const options: ReconciliationRuleOptions = {
    ...DEFAULT_RULE_OPTIONS,
    ...userOptions,
  };

  const parsedDs1 = parsePatientList(rawList1, options);
  const parsedDs2 = parsePatientList(rawList2, options);

  const matchedDs1Indices = new Set<number>();
  const allDs2Results: ReconciledItem[] = [];
  const itemsOnlyInDs2: ReconciledItem[] = [];
  const itemsMatched: ReconciledItem[] = [];

  // Duyệt qua từng bệnh nhân trong Danh sách 2 (xuất từ phần mềm)
  parsedDs2.forEach((ds2Item, index) => {
    let matched = false;
    let matchType: 'EXACT_FULL_MATCH' | 'SUFFIX_NAME_MATCH' = 'EXACT_FULL_MATCH';
    let matchReason = '';
    let matchedDs1ItemName: string | null = null;

    // Tìm trong Danh sách 1
    for (let i = 0; i < parsedDs1.length; i++) {
      const ds1Item = parsedDs1[i];
      const matchCheck = checkPatientMatch(ds2Item, ds1Item, options);

      if (matchCheck.isMatch) {
        matched = true;
        matchType = matchCheck.matchType!;
        matchReason = matchCheck.reason!;
        matchedDs1ItemName = ds1Item.cleanName;
        matchedDs1Indices.add(i);
        break; // Đã tìm thấy khớp trong DS1
      }
    }

    if (matched) {
      const item: ReconciledItem = {
        stt: index + 1,
        ds2Name: ds2Item.cleanName,
        ds2Original: ds2Item.originalText,
        status: matchType,
        matchedWithDs1: matchedDs1ItemName,
        matchReason,
        similarityNotes: [],
        nearMatches: [],
      };
      itemsMatched.push(item);
      allDs2Results.push(item);
    } else {
      // KHÔNG KHỚP: Đây là bệnh nhân có trong Danh sách 2 nhưng KHÔNG có trong Danh sách 1
      const similarityNotes: string[] = [];
      const nearMatches: Array<{ ds1Original: string; similarity: number; reason: string }> = [];

      // Kiểm tra xem có trường hợp nào ở DS1 gần giống không để tạo ghi chú cảnh báo
      if (options.fuzzyWarningEnabled && parsedDs1.length > 0) {
        for (const ds1Item of parsedDs1) {
          const near = checkNearMatch(
            ds2Item.normalizedName,
            ds2Item.cleanName,
            ds1Item.normalizedName,
            ds1Item.cleanName
          );

          if (near.isNear) {
            similarityNotes.push(near.reason);
            nearMatches.push({
              ds1Original: ds1Item.cleanName,
              similarity: near.similarity,
              reason: near.reason,
            });
            // Giới hạn tối đa 2 cảnh báo để tránh rối bảng
            if (similarityNotes.length >= 2) break;
          }
        }
      }

      const item: ReconciledItem = {
        stt: itemsOnlyInDs2.length + 1, // STT theo danh sách trích xuất
        ds2Name: ds2Item.cleanName,
        ds2Original: ds2Item.originalText,
        status: 'UNMATCHED_ONLY_IN_DS2',
        matchedWithDs1: null,
        matchReason: 'Không tìm thấy trong Danh sách 1 theo quy tắc đối soát',
        similarityNotes,
        nearMatches,
      };

      itemsOnlyInDs2.push(item);
      allDs2Results.push(item);
    }
  });

  // Tìm những người chỉ có trong Danh sách 1 (chưa được phần mềm khớp)
  const itemsOnlyInDs1: Array<{ stt: number; name: string; original: string; lineNum: number }> = [];
  parsedDs1.forEach((ds1Item, idx) => {
    if (!matchedDs1Indices.has(idx)) {
      itemsOnlyInDs1.push({
        stt: itemsOnlyInDs1.length + 1,
        name: ds1Item.cleanName,
        original: ds1Item.originalText,
        lineNum: ds1Item.lineNum,
      });
    }
  });

  const stats: ReconciliationStats = {
    totalDs1: parsedDs1.length,
    totalDs2: parsedDs2.length,
    totalMatched: itemsMatched.length,
    totalOnlyInDs2: itemsOnlyInDs2.length,
    totalOnlyInDs1: itemsOnlyInDs1.length,
  };

  return {
    stats,
    itemsOnlyInDs2,
    itemsMatched,
    itemsOnlyInDs1,
    allDs2Results,
    processedAt: new Date().toISOString(),
  };
}
