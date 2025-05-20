// utils/simpleMarkdownRenderer.ts
export const renderSimpleMarkdown = (content: string): string => {
    // セクション開始タグの追加
    let html = '<section class="japanese-style-modern-section">';
    
    // 段落に分割
    const paragraphs = content.split(/\n\s*\n/);
    
    // 各段落を処理
    for (let i = 0; i < paragraphs.length; i++) {
      let paragraph = paragraphs[i].trim();
      
      if (!paragraph) continue; // 空の段落はスキップ
      
      // 見出しを処理
      if (paragraph.startsWith('# ')) {
        const headingText = paragraph.substring(2);
        const id = headingText.toLowerCase().replace(/[^\w]+/g, "-");
        
        // 新しいセクションの開始（最初のセクション以外）
        if (i > 0) {
          html += '</section><section class="japanese-style-modern-section">';
        }
        
        html += `<h1 id="${id}" class="japanese-style-modern-h1">${headingText}</h1>`;
      } else if (paragraph.startsWith('## ')) {
        const headingText = paragraph.substring(3);
        const id = headingText.toLowerCase().replace(/[^\w]+/g, "-");
        html += `<h2 id="${id}" class="japanese-style-modern-h2">${headingText}</h2>`;
      } else if (paragraph.startsWith('### ')) {
        const headingText = paragraph.substring(4);
        const id = headingText.toLowerCase().replace(/[^\w]+/g, "-");
        html += `<h3 id="${id}" class="japanese-style-modern-h3">${headingText}</h3>`;
      } else {
        // 通常の段落を処理
        
        // 太字を処理
        paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="japanese-style-modern-strong">$1</strong>');
        
        // 流派名を特別に処理
        paragraph = paragraph.replace(/\*\*(.*?-ryu)\*\*/g, '<strong class="ryu-name">$1</strong>');
        
        // 斜体を処理
        paragraph = paragraph.replace(/\*(.*?)\*/g, '<em class="japanese-style-modern-em">$1</em>');
        
        // 段落タグを追加
        html += `<p class="japanese-style-modern-p">${paragraph}</p>`;
      }
    }
    
    // セクション終了タグを追加
    html += '</section>';
    
    return html;
  };