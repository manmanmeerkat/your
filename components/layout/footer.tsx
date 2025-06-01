import Link from 'next/link';
import Image from 'next/image';
import { CATEGORY_LINKS, INFO_LINKS, SNS_LINKS } from '@/constants/constants';
import { linksType, SNSLinkType } from '@/types/types';

const LinkSection = ({
  title,
  links,
}: {
  title: string;
  links: linksType[] | SNSLinkType[];
}) => (
  <div>
    <h4 className="text-lg font-semibold mb-4">{title}</h4>
    <ul className="space-y-2 text-[#f3f3f2]">
      {links.map(({ href, label, img }) => (
        <li key={href}>
          <Link
            href={href}
            className="flex items-center space-x-2 group transition-colors"
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {img && (
              <Image
                src={img}
                alt={label}
                width={20}
                height={20}
                className="object-contain"
                unoptimized
              />
            )}
            <span className="relative block text-slate-250 group-hover:text-white transition-colors">
              {label}
              <span
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-400 transition-all duration-300 group-hover:w-full"
                />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {

  const filteredSNSLinks = SNS_LINKS.filter(link => link.img !== "/images/icon/x-black.png");

  return (
    <footer className="bg-[#180614] text-[#f3f3f2] py-12">
      <div className="container mx-auto px-6 md:px-16">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <h3 className="text-xl font-bold mb-4">Your Secret Japan</h3>
          <p className="text-slate-250">
            Welcome to a journey exploring Japanese culture, customs, myths and traditions.
          </p>
        </div>

        <LinkSection title="Category" links={CATEGORY_LINKS} />
        <LinkSection title="Others" links={INFO_LINKS} />
        <LinkSection title="Social Media" links={filteredSNSLinks} />
      </div>

        <div className="border-t border-slate-500 mt-8 pt-8 text-center text-slate-300">
          <p>&copy; {new Date().getFullYear()} Your Secret Japan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}