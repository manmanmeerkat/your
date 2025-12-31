import Link from 'next/link';
import Image from 'next/image';
// import { CATEGORY_LINKS, INFO_LINKS, SNS_LINKS } from '@/constants/constants';
import { CATEGORY_LINKS, INFO_LINKS} from '@/constants/constants';
import { linksType, SNSLinkType } from '@/types/types';

const LinkSection = ({
  title,
  links,
}: {
  title: string;
  links: linksType[] | SNSLinkType[];
}) => (
  <div>
    <h4 className="text-base font-semibold mb-4 tracking-wide text-[#f3f3f2]/90">
      {title}
    </h4>

    <ul className="space-y-2">
      {links.map(({ href, label, img }) => (
        <li key={href}>
          <Link
            href={href}
            className="
              inline-flex items-center gap-2
              text-[#f3f3f2]/75 hover:text-[#f3f3f2]
              transition-colors
            "
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {/* img は今は未使用でもOK */}
            {img && (
              <Image
                src={img}
                alt={label}
                width={18}
                height={18}
                className="object-contain opacity-80"
                unoptimized
              />
            )}

            <span className="relative">
              {label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#df7163]/80 transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  return (
    <footer className="bg-[#180614] text-[#f3f3f2]">
      <div className="container mx-auto px-6 md:px-16 py-12">
        {/* Top */}
       <div className="grid gap-10 lg:grid-cols-[1fr_2fr] items-start">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">Your Secret Japan</h3>

            {/* mobile short */}
            <p className="text-[#f3f3f2]/75 leading-relaxed sm:hidden">
              A quiet journey into Japan’s hidden stories.
            </p>

            {/* >= sm long */}
            <p className="hidden sm:block text-[#f3f3f2]/75 leading-relaxed max-w-md">
              A quiet journey into Japan’s culture, customs, myths, and traditions.
            </p>
          </div>

          {/* Links blocks */}
          <div className="grid gap-4 grid-cols-2">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 sm:p-6 backdrop-blur-md">
              <LinkSection title="Category" links={CATEGORY_LINKS} />
            </div>

            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 sm:p-6 backdrop-blur-md">
              <LinkSection title="Others" links={INFO_LINKS} />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-[#f3f3f2]/60">
            &copy; {new Date().getFullYear()} Your Secret Japan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
