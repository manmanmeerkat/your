# Your Secret Japan - 画像使用方法ガイド

## 📸 基本的な画像挿入

### シンプルな画像表示

```markdown
![画像の説明文](/images/articles/記事ID/画像ファイル名.jpg)
```

**例:**

```markdown
![美しい神社の風景](/images/articles/3ab2733e-7351-4428-9a8b-038ca68097f5/shrine.jpg)
```

---

## 📐 サイズ指定付き画像（推奨）

### 基本のサイズ指定

```markdown
![画像の説明文](/images/articles/記事ID/画像ファイル名.jpg){size: 幅 x 高さ}
```

**例:**

```markdown
![神社の本殿](/images/articles/3ab2733e-7351-4428-9a8b-038ca68097f5/shrine.jpg){size: 600x400}
```

### レスポンシブサイズの推奨値

| サイズ   | 用途                     | 記法例            |
| -------- | ------------------------ | ----------------- |
| **小**   | アイコンや装飾           | `{size: 300x200}` |
| **中**   | 記事内画像（標準）       | `{size: 600x400}` |
| **大**   | メイン画像・ヒーロー画像 | `{size: 800x600}` |
| **横長** | パノラマ・風景           | `{size: 800x300}` |
| **縦長** | 人物・建物               | `{size: 400x600}` |

---

## 🏷️ キャプション付き画像

### キャプション表示

```markdown
![画像の説明文](/images/articles/記事ID/画像ファイル名.jpg){size: 600x400, caption: 詳細な説明文}
```

**例:**

```markdown
![清水寺](/images/articles/3ab2733e-7351-4428-9a8b-038ca68097f5/kiyomizu.jpg){size: 800x600, caption: 京都の代表的な寺院である清水寺の舞台}
```

---

## ⚡ 優先読み込み（パフォーマンス最適化）

### ファーストビュー画像の最適化

```markdown
![画像の説明文](/images/articles/記事ID/画像ファイル名.jpg){size: 800x600, priority}
```

**使用場面:**

- 記事の最初に表示される画像
- アイキャッチ画像
- 重要度の高い画像

**例:**

```markdown
![天照大神の浮世絵](/images/articles/3ab2733e-7351-4428-9a8b-038ca68097f5/amaterasu.jpg){size: 800x400, priority}
```

---

## 🎨 複数オプションの組み合わせ

### 全オプション使用例

```markdown
![画像の説明文](/images/articles/記事ID/画像ファイル名.jpg){size: 600x400, caption: 詳細説明, priority}
```

**実例:**

```markdown
![三貴神の浮世絵](/images/articles/3ab2733e-7351-4428-9a8b-038ca68097f5/three-gods.jpg){size: 800x300, caption: 天照大神・月読命・須佐之男命の三貴神を描いた浮世絵, priority}
```

---

## 📱 レスポンシブ対応のベストプラクティス

### モバイルファーストの考え方

1. **横幅は最大 800px 以下**に抑える
2. **アスペクト比**を考慮した高さ設定
3. **読み込み速度**を重視したサイズ選択

### 用途別推奨サイズ

#### 🖼️ ヒーロー画像・アイキャッチ

```markdown
{size: 800x450, priority} # 16:9 比率
{size: 800x600, priority} # 4:3 比率
```

#### 📷 記事内画像（標準）

```markdown
{size: 600x400} # バランスの良いサイズ
{size: 500x375} # やや小さめ
```

#### 🎭 装飾・アイコン

```markdown
{size: 300x200} # 小さめの装飾
{size: 200x200} # 正方形アイコン
```

#### 🌅 パノラマ・風景

```markdown
{size: 800x300} # 横長パノラマ
{size: 700x350} # 中サイズ横長
```

---

## 🔧 管理画面での操作

### 1. 画像アップロード

1. 管理画面で「🖼️ 画像管理」をクリック
2. 「📁 画像をアップロード」で画像を選択
3. 複数ファイル同時アップロード可能

### 2. マークダウンコード取得

1. 「📋 マークダウンコピー」ボタンをクリック
2. クリップボードに自動コピー
3. 記事エディタに貼り付け

### 3. フィーチャー画像設定

- ⭐ ボタンでメイン画像として設定
- 記事一覧での表示に使用

---

## 📋 実際の使用例

### 記事での実装例

```markdown
# 日本の三貴神について

![三貴神の浮世絵](/images/articles/3ab2733e-7351-4428-9a8b-038ca68097f5/three-gods.jpg){size: 800x400, caption: 天照大神・月読命・須佐之男命を描いた力強い浮世絵, priority}

日本神話における最も重要な神々である三貴神について解説します。

## 天照大神（あまてらすおおみかみ）

![天照大神](/images/articles/3ab2733e-7351-4428-9a8b-038ca68097f5/amaterasu.jpg){size: 600x400, caption: 太陽神として崇められる天照大神}

太陽を司る最高神で、皇室の祖神とされています。

## 月読命（つくよみのみこと）

![月読命](/images/articles/3ab2733e-7351-4428-9a8b-038ca68097f5/tsukuyomi.jpg){size: 600x400, caption: 月を司る神秘的な存在}

夜と月を司る神で、神秘的な力を持つとされています。

## 須佐之男命（すさのおのみこと）

![須佐之男命](/images/articles/3ab2733e-7351-4428-9a8b-038ca68097f5/susanoo.jpg){size: 600x400, caption: 嵐と海を司る力強い神}

嵐と海を司る勇猛な神で、多くの冒険譚で知られています。
```

---

## ⚠️ 注意事項

### ファイルサイズ

- **最大 10MB**まで対応
- **WebP, JPEG, PNG, GIF**形式をサポート

### パフォーマンス

- `{priority}`は**記事上部の重要な画像**のみに使用
- 過度な大きいサイズは避ける
- モバイル表示を考慮したサイズ選択

### アクセシビリティ

- **代替テキスト**は必ず記載
- 画像の内容を適切に説明
- **キャプション**で詳細情報を補完

---

## 🎯 まとめ

Your Secret Japan では、シンプルなマークダウン記法で高機能な画像表示が可能です：

1. **基本**: `![説明](URL)`
2. **サイズ指定**: `![説明](URL){size: 600x400}`
3. **キャプション**: `![説明](URL){size: 600x400, caption: 詳細説明}`
4. **最適化**: `![説明](URL){size: 800x600, priority}`
   markdown![画像説明](/images/articles/example.jpg){size: 600x400}
5. 幅のみ指定（新機能）
   markdown![画像説明](/images/articles/example.jpg){width: 600}

高さは自動調整（アスペクト比保持）

3. 高さのみ指定（新機能）
   markdown![画像説明](/images/articles/example.jpg){height: 400}

幅は自動調整（アスペクト比保持）

4. 幅と高さを個別指定（新機能）
   markdown![画像説明](/images/articles/example.jpg){width: 600, height: 400}
5. 他のオプションとの組み合わせ
   markdown![画像説明](/images/articles/example.jpg){width: 800, caption: 説明文, priority}
   ![画像説明](/images/articles/example.jpg){height: 300, caption: 縦長画像}
   🎯 使用場面の例
   幅固定・レスポンシブ高さ
   markdown![横長の風景画像](/images/articles/landscape.jpg){width: 800}

横幅 800px 固定
高さは画像の縦横比に合わせて自動調整

高さ固定・レスポンシブ幅
markdown![縦長の建物画像](/images/articles/building.jpg){height: 600}

高さ 600px 固定
幅は画像の縦横比に合わせて自動調整

カード形式での統一
markdown![商品画像1](/images/articles/product1.jpg){height: 300}
![商品画像2](/images/articles/product2.jpg){height: 300}
![商品画像3](/images/articles/product3.jpg){height: 300}

すべて高さ 300px で統一
幅は各画像の比率に応じて自動調整

📊 優先順位

size 指定が最優先
markdown{size: 600x400, width: 800} # size が優先される

個別指定は size がない場合のみ適用
markdown{width: 600, height: 400} # 両方とも適用される

💡 実際の使用例
markdown# 日本の神社について

![メイン画像](/images/articles/shrine-main.jpg){size: 800x400, priority}

## 境内の様子

![鳥居](/images/articles/torii.jpg){width: 600}
画像の説明文...

![本殿](/images/articles/honden.jpg){height: 400}
画像の説明文...

## ギャラリー

![画像1](/images/articles/gallery1.jpg){height: 250}
![画像2](/images/articles/gallery2.jpg){height: 250}
![画像3](/images/articles/gallery3.jpg){height: 250}
