export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-xl bg-[#180614]/85 px-10 shadow-lg ring-1 ring-white/10 backdrop-blur-md">
      <h2 className="
          inline-flex items-center justify-center
          py-2
          text-2xl md:text-3xl font-bold
          text-[#f3f3f2]
          rounded-xl
          bg-[#180614]/70 backdrop-blur-sm
          ring-1 ring-white/10
          shadow-sm
      ">
      {children}
      </h2>
    </div>
  );
}
