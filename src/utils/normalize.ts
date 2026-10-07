/**
 * Utility functions for Vietnamese patient name normalization, tokenization,
 * and string similarity metrics.
 */

// Chuyển tiếng Việt có dấu sang không dấu
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Làm sạch chuỗi tên bệnh nhân:
 * - Tách bỏ số thứ tự STT đứng đầu (1., 02-, 3/, 4)...)
 * - Tách bỏ tiền tố thông dụng (BN, BN:, Bệnh nhân:)
 * - Bỏ thông tin phụ trong ngoặc nếu tùy chọn bật (1985, Nam, BHYT...)
 * - Chuẩn hóa khoảng trắng
 */
export function cleanPatientName(
  rawInput: string,
  options: {
    stripPrefixNumbers?: boolean;
    stripParenthesesInfo?: boolean;
  } = {}
): string {
  if (!rawInput) return '';

  let text = rawInput.trim();

  // Loại bỏ mã vạch hoặc tab/dấu phẩy nếu dán từ excel
  text = text.replace(/^[\t\s,"';]+|[\t\s,"';]+$/g, '');

  if (options.stripPrefixNumbers ?? true) {
    // 1. Nguyễn Văn A | 01 - Nguyễn Văn A | 1/ Nguyễn Văn A | 1) Nguyễn Văn A | #1. Nguyễn Văn A
    text = text.replace(/^(?:STT\s*[:.-]?\s*|\#\s*)?\d+[\.\/\)\-\:\s]+\s*/i, '');
    // Tiền tố BN hoặc Bệnh nhân
    text = text.replace(/^(?:BN|Bệnh nhân|Khách hàng)\s*[:.-]?\s*/i, '');
  }

  if (options.stripParenthesesInfo ?? true) {
    // Loại bỏ nội dung trong ngoặc đơn, ngoặc vuông (năm sinh, giới tính, mã...)
    // Ví dụ: "Nguyễn Văn An (1985)" -> "Nguyễn Văn An"
    // hoặc "Trần Thị Bé [Nữ - 1990]"
    text = text.replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]\s*/g, ' ');
  }

  // Chuẩn hóa khoảng trắng giữa các từ
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Chuẩn hóa họ tên thành dạng so sánh chuẩn:
 * Chữ thường, khoảng trắng đơn, bỏ ký tự lạ
 */
export function normalizeForComparison(
  text: string,
  ignoreAccents = false
): string {
  let normalized = text.trim().toLowerCase();
  // Loại bỏ các ký tự dấu câu không cần thiết ở giữa hoặc cuối tên
  normalized = normalized.replace(/[.,;:\-_/\\#$@!%^&*()~+=[\]{}|]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();

  if (ignoreAccents) {
    normalized = removeVietnameseAccents(normalized);
  }

  return normalized;
}

/**
 * Tokenize chuỗi thành mảng các từ
 */
export function tokenizeName(normalizedStr: string): string[] {
  if (!normalizedStr) return [];
  return normalizedStr.split(/\s+/).filter(Boolean);
}

/**
 * Tính khoảng cách Levenshtein giữa 2 chuỗi
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // xóa
        dp[i][j - 1] + 1, // chèn
        dp[i - 1][j - 1] + cost // thay thế
      );
    }
  }

  return dp[m][n];
}

/**
 * Tính điểm tương đồng từ 0 đến 1
 */
export function calculateSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const distance = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Phân tích lý do không trùng nếu có sự tương đồng cao (cảnh báo kiểm tra lại)
 */
export function checkNearMatch(
  ds2Normalized: string,
  ds2Original: string,
  ds1Normalized: string,
  ds1Original: string
): { isNear: boolean; similarity: number; reason: string } {
  // So sánh không dấu
  const noAccent2 = removeVietnameseAccents(ds2Normalized);
  const noAccent1 = removeVietnameseAccents(ds1Normalized);

  if (noAccent1 === noAccent2 && ds1Normalized !== ds2Normalized) {
    return {
      isNear: true,
      similarity: 0.95,
      reason: `Có BN tương tự ở DS1: "${ds1Original}" (chỉ khác dấu tiếng Việt)`,
    };
  }

  const sim = calculateSimilarity(ds2Normalized, ds1Normalized);
  if (sim >= 0.75) {
    return {
      isNear: true,
      similarity: sim,
      reason: `Có BN tương tự ở DS1: "${ds1Original}" (độ tương đồng ${(sim * 100).toFixed(0)}%, vui lòng kiểm tra lại)`,
    };
  }

  // Kiểm tra trường hợp tên đệm khác 1 chữ hoặc thiếu/thừa họ
  const tokens1 = tokenizeName(ds1Normalized);
  const tokens2 = tokenizeName(ds2Normalized);

  if (tokens1.length >= 2 && tokens2.length >= 2) {
    const lastName1 = tokens1[tokens1.length - 1];
    const lastName2 = tokens2[tokens2.length - 1];
    if (lastName1 === lastName2) {
      const simFull = calculateSimilarity(noAccent1, noAccent2);
      if (simFull >= 0.7) {
        return {
          isNear: true,
          similarity: simFull,
          reason: `Trùng tên "${tokens2[tokens2.length - 1].toUpperCase()}" nhưng khác họ/tên đệm với "${ds1Original}" ở DS1`,
        };
      }
    }
  }

  return { isNear: false, similarity: sim, reason: '' };
}
