// lib/MarkedRenderer.ts
import { marked } from "marked";

export const configureMarkedRenderer = () => {
  // マークダウンレンダラーの設定
  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false,
  });

  // カスタムレンダラーを設定
  const renderer = new marked.Renderer();
  
  // 見出しにIDとクラスを追加
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens[0].raw;
    const id = text.toLowerCase().replace(/[^\w]+/g, "-");
    
    if (depth === 1) {
      return `<section class="japanese-style-modern-section">
        <h${depth} id="${id}" class="japanese-style-modern-h${depth}">${text}</h${depth}>`;
    } else {
      return `<h${depth} id="${id}" class="japanese-style-modern-h${depth}">${text}</h${depth}>`;
    }
  };
  
  // 段落にクラスを追加
  renderer.paragraph = (text) => {
    return `<p class="japanese-style-modern-p">${text}</p>`;
  };
  
  // リストにクラスを追加
  renderer.list = (body, ordered) => {
    const type = ordered ? 'ol' : 'ul';
    return `<${type} class="japanese-style-modern-${type}">${body}</${type}>`;
  };
  
  // リスト項目にクラスを追加
  renderer.listitem = (text) => {
    return `<li class="japanese-style-modern-li">${text}</li>`;
  };
  
  // 引用にクラスを追加
  renderer.blockquote = (quote) => {
    return `<blockquote class="japanese-style-modern-blockquote">${quote}</blockquote>`;
  };
  
  // 強調にクラスを追加
  renderer.strong = (text) => {
    // 流派名の場合は特別なクラスを追加
    if (text.includes('-ryu')) {
      return `<strong class="ryu-name">${text}</strong>`;
    }
    return `<strong class="japanese-style-modern-strong">${text}</strong>`;
  };
  
  // 斜体にクラスを追加
  renderer.em = (text) => {
    return `<em class="japanese-style-modern-em">${text}</em>`;
  };
  
  // リンクにクラスを追加
  renderer.link = (href, title, text) => {
    return `<a href="${href}" class="japanese-style-modern-a" ${title ? `title="${title}"` : ''}>${text}</a>`;
  };
  
  // 画像にクラスを追加
  renderer.image = (href, title, text) => {
    return `<img src="${href}" alt="${text || ''}" class="japanese-style-modern-img" ${title ? `title="${title}"` : ''}>`;
  };
  
  marked.use({ renderer });
  
  // マークダウンのレンダリングと後処理
  const renderMarkdown = (content: string) => {
    let html = marked.parse(content);
    
    // H1見出しの後にセクションの閉じタグを追加し、新しいセクションを開始
    html = html.replace(/<\/h1>/g, '</h1>');
    
    // 最後のセクションを閉じる
    html += '</section>';
    
    // セクション間の重複する閉じタグと開始タグを修正
    html = html.replace(/<\/section><section class="japanese-style-modern-section">/g, '</section>\n<section class="japanese-style-modern-section">');
    
    return html;
  };
  
  return {
    renderMarkdown
  };
};