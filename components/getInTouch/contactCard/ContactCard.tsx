// import Image from "next/image";
import Link from "next/link";
// import { SNS_LINKS } from "@/constants/constants";

export function ContactCard({
  title,
  content,
  detail,
  link,
}: {
  title: string;
  content?: string;
  detail?: string;
  link?: { href: string; label: string };
}) {
  // const filteredSNSLinks = SNS_LINKS.filter(
  //   (sns) => sns.img !== "/images/icon/x-white.png"
  // );

  return (
    <div
      className="
        relative overflow-hidden
        rounded-2xl
        shadow-[0_18px_60px_rgba(0,0,0,.35)]
        bg-white/10 backdrop-blur-x
      "
    >
      {/* subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/12 via-white/6 to-white/10" />

      <div className="relative p-8 md:p-10 text-[#f3f3f2]">
        <h3 className="text-xl font-semibold tracking-tight">
          {title}
        </h3>

        {content && (
          <p className="mt-3 text-[#f3f3f2]/80 leading-relaxed">
            {content}
          </p>
        )}

        {detail && (
          <p className="mt-3 text-[#df7163]">
            {detail}
          </p>
        )}

        {link && (
          <div className="mt-7 flex justify-end">
            <Link
              href={link.href}
              className="
                inline-flex items-center justify-center gap-2
                rounded-full px-6 py-2.5
                bg-[#c96a5d]/90 text-[#f3f3f2]
                shadow-sm
                ring-1 ring-white/10
                hover:bg-[#f3f3f2]/90 hover:text-[#c96a5d]
                transition-all duration-200
                hover:-translate-y-[1px] hover:shadow-md
              "
            >
              {link.label}
              <span className="text-lg leading-none">→</span>
            </Link>
          </div>
        )}

        {/* <div className="mt-10">
          <p className="text-lg font-semibold">Follow us</p>

          <div className="mt-4 flex flex-wrap gap-3">
            {filteredSNSLinks.map((sns) => (
              <Link
                key={sns.label}
                href={sns.href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-2
                  rounded-full px-4 py-2
                  bg-white/8
                  ring-1 ring-white/10
                  text-[#f3f3f2]/85
                  hover:text-[#f3f3f2]
                  hover:bg-white/12
                  transition-all duration-200
                "
              >
                <Image
                  src={sns.img}
                  alt={`${sns.label} icon`}
                  width={18}
                  height={18}
                  className="object-contain"
                  unoptimized
                />
                <span className="font-semibold">{sns.label}</span>
              </Link>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}
