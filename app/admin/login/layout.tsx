// app/admin/login/layout.tsx
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 認証チェックを行わない独自のレイアウト
  return <>{children}</>;
}
