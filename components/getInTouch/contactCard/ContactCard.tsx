import Image from "next/image";
import Link from "next/link";
import { SNS_LINKS } from "@/constants/constants";

export function ContactCard({
  title,
  content,
  detail,
  link,   // ← new!
}: {
  title: string;
  content?: string;
  detail?: string;
  link?: { href: string; label: string };
}) {

  const filteredSNSLinks = SNS_LINKS.filter((sns) => sns.img !== "/images/icon/x-white.png");

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mx-auto text-center">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      {content && <p className="mb-2 text-slate-700">{content}</p>}

      {detail && <p className="text-red-600 mb-4">{detail}</p>}

      {link && (
        <p className="mb-4">
          <Link
            href={link.href}
            className="text-red-600 hover:underline text-lg"
          >
            {link.label}
          </Link>
        </p>
      )}
      <p className="text-xl font-bold mb-3">Follow us:</p>
      <div className="flex justify-center items-center flex-wrap gap-2">
        {filteredSNSLinks.map((sns, index) => (
          <div key={sns.label} className="flex items-center">
            <Link
              href={sns.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-slate-600 hover:text-red-600 group"
            >
              <Image
                src={sns.img}
                alt={`${sns.label} icon`}
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="relative block">
                {sns.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-400 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            {index < filteredSNSLinks.length - 1 && (
              <span className="mx-2 text-slate-400">|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}