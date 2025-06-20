// utils/encoding.ts - 安全なエンコーディング・ユーティリティ


/**
 * 日本語文字列を含むデータを安全にBase64エンコード
 */
export function safeBase64Encode(data: string): string {
    try {
      // ブラウザ環境での安全なエンコーディング
      if (typeof window !== 'undefined') {
        // UTF-8 -> Uint8Array -> Base64
        const utf8Bytes = new TextEncoder().encode(data);
        const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
        return btoa(binaryString);
      } else {
        // Node.js環境
        return Buffer.from(data, 'utf8').toString('base64');
      }
    } catch (error) {
      console.warn('Failed to encode data:', error);
      // フォールバック: シンプルなハッシュ生成
      return generateSimpleHash(data);
    }
  }
  
  /**
   * 日本語文字列を含むデータを安全にBase64デコード
   */
  export function safeBase64Decode(encodedData: string): string {
    try {
      // ブラウザ環境での安全なデコーディング
      if (typeof window !== 'undefined') {
        // Base64 -> Uint8Array -> UTF-8
        const binaryString = atob(encodedData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
      } else {
        // Node.js環境
        return Buffer.from(encodedData, 'base64').toString('utf8');
      }
    } catch (error) {
      console.warn('Failed to decode data:', error);
      throw new Error('Invalid encoded data');
    }
  }
  
  /**
   * フォールバック用のシンプルハッシュ生成
   */
  function generateSimpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * 一口メモデータの安全なエンコーディング
   */
  export function encodeTriviaData(trivia: ArticleTrivia, index: number): string {
    const data = JSON.stringify({ trivia, index });
    return safeBase64Encode(data);
  }
  
  /**
   * 一口メモデータの安全なデコーディング
   */
  export function decodeTriviaData(encodedData: string): { trivia: ArticleTrivia; index: number } {
    const decodedString = safeBase64Decode(encodedData);
    return JSON.parse(decodedString);
  }