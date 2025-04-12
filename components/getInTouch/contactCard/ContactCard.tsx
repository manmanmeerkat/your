import Image from "next/image";
import { SNS_LINKS } from "@/constants/constants";

export function ContactCard({
  title,
  content,
  detail,
}: {
  title: string;
  content?: string;
  detail?: string;
}) {

    const filteredSNSLinks = SNS_LINKS.filter((sns) => sns.img !== "/images/icon/x-white.png");

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mx-auto text-center">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      {content && <p className="mb-2 text-slate-700">{content}</p>}
      {detail && <p className="text-red-600 mb-4">{detail}</p>}

      <p className="text-xl font-bold mb-3">Follow us:</p>
      <div className="flex flex-col items-center space-y-4">
        {filteredSNSLinks.map((sns) => (
          <a
            key={sns.label}
            href={sns.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-slate-600 hover:text-red-600"
          >
            <Image
              src={sns.img}
              alt={`${sns.label} icon`}
              width={24}
              height={24}
              className="object-contain"
            />
            <span>{sns.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
