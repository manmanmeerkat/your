// public/js/article-highlight.js
// シンタックスハイライト用の軽量スクリプト
document.addEventListener('DOMContentLoaded', () => {
    // コードブロックにシンタックスハイライトクラスを追加
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      block.classList.add('syntax-highlight');
    });
    
    // 外部リンクに属性を追加
    const links = document.querySelectorAll('.article-content a');
    links.forEach(link => {
      if (link.hostname !== window.location.hostname) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  });