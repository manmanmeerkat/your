// 共通のスラグ取得関数（改善版）
export const GetGodsSlug = (
  name: string,
  slugMap: Record<string, string>,
  // isDebug: boolean = false
): string => {
  // const debugPrefix = isDebug ? "デスクトップ" : "モバイル";

  // if (isDebug) {
  //   console.log(`\n=== ${debugPrefix} - 神 "${name}" のスラグ検索開始 ===`);
  //   console.log(`利用可能なslugMap:`, Object.keys(slugMap));
  // }

  // 完全一致を先に試す
  if (slugMap[name]) {
    // console.log(
    //   `${debugPrefix} - 神 "${name}": 完全一致でデータベースから取得したスラグを使用: ${slugMap[name]}`
    // );
    return slugMap[name];
  }

  // より柔軟なマッチングを試す
  const normalizedName = name.toLowerCase().replace(/\s/g, "-");

  for (const [title, slug] of Object.entries(slugMap)) {
    const normalizedTitle = title.toLowerCase();

    // パターン1: 通常の部分一致（タイトルが名前で始まる）
    if (normalizedTitle.startsWith(name.toLowerCase())) {
      // console.log(
      //   `${debugPrefix} - 神 "${name}": 部分一致(通常)でデータベースのスラグを使用: ${slug} (マッチしたタイトル: "${title}")`
      // );
      return slug;
    }

    // パターン2: 名前がタイトルで始まる（逆方向のマッチング）
    if (name.toLowerCase().startsWith(normalizedTitle.split(" ")[0])) {
      // console.log(
      //   `${debugPrefix} - 神 "${name}": 逆方向部分一致でデータベースのスラグを使用: ${slug} (マッチしたタイトル: "${title}")`
      // );
      return slug;
    }

    // パターン3: スペースをハイフンに変換してマッチング
    if (normalizedTitle.startsWith(normalizedName)) {
      // console.log(
      //   `${debugPrefix} - 神 "${name}": 部分一致(正規化)でデータベースのスラグを使用: ${slug} (マッチしたタイトル: "${title}")`
      // );
      return slug;
    }

    // パターン4: より柔軟なマッチング（"no Kami"、"no Mikoto"などを除去）
    const titleBase = normalizedTitle
      .replace(/\s+(no\s+)?(kami|mikoto|okami|gami)$/i, "")
      .trim();
    const nameBase = name
      .toLowerCase()
      .replace(/\s+(no\s+)?(kami|mikoto|okami|gami)$/i, "")
      .trim();

    if (
      titleBase === nameBase ||
      titleBase.startsWith(nameBase) ||
      nameBase.startsWith(titleBase)
    ) {
      // console.log(
      //   `${debugPrefix} - 神 "${name}": 柔軟マッチングでデータベースのスラグを使用: ${slug} (マッチしたタイトル: "${title}", 正規化後: "${titleBase}" vs "${nameBase}")`
      // );
      return slug;
    }
  }

  // if (isDebug) {
  //   console.log(
  //     `${debugPrefix} - 神 "${name}": マッチするタイトルが見つかりませんでした`
  //   );
  //   console.log(`利用可能なタイトル:`, Object.keys(slugMap));
  // }

  // データベースから最新のスラグが見つからない場合のフォールバック
  const fallbackSlug = name
    .toLowerCase()
    .replace(/ō/g, "o") // 特殊文字を標準文字に変換
    .replace(/ū/g, "u")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // console.log(
  //   `${debugPrefix} - 神 "${name}": フォールバックスラグを使用: ${fallbackSlug}`
  // );
  return fallbackSlug;
};