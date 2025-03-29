import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div>
      {/* ヘッダーセクション */}
      <section className="relative bg-slate-900 text-white py-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/images/kimono.png"
              alt="日本の伝統"
              className="w-full h-full object-cover"
              width={1024}
              height={280}
              style={{ objectPosition: "center" }}
            />
          </div>
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            私たちについて
          </h1>
          <p className="text-xl max-w-3xl mx-auto drop-shadow-md">
            Your Secret Japan
            は、日本の豊かな文化遺産と伝統を世界中の人々に紹介することを目的としたプロジェクトです。
          </p>
        </div>
      </section>

      {/* ミッションセクション */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-center">
            私たちのミッション
          </h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="mb-4 text-lg">
              Your Secret Japan
              は、日本の奥深い魅力を発見し、共有することに情熱を注いでいます。私たちは、観光ガイドブックでは見つけられない、本物の日本の姿を紹介します。
            </p>
            <p className="mb-4 text-lg">
              古代から受け継がれる神話、四季折々の祭り、そして細部にまで行き届いた伝統工芸まで、日本の文化は多岐にわたります。私たちはこれらの豊かな文化遺産を、分かりやすく、そして魅力的な方法で紹介することを目指しています。
            </p>
            <p className="text-lg">
              あなたが日本について学びたい初心者であろうと、深い知識を持つ愛好家であろうと、Your
              Secret Japan では新しい発見と洞察を得ることができるでしょう。
            </p>
          </div>
        </div>
      </section>

      {/* コンテンツセクション */}
      <section className="pt-8 pb-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">コンテンツ</h2>
          <p className="text-lg mb-8">
            当サイトでは以下のカテゴリーに関する記事を提供しています：
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <h3 className="text-xl font-bold mb-2 text-red-600">神話</h3>
              <p>
                天照大神、スサノオ、八岐大蛇など日本神話の神々と物語。古代日本人の世界観と信仰を探ります。
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <h3 className="text-xl font-bold mb-2 text-red-600">文化</h3>
              <p>
                茶道、生け花、着物など、日本独特の文化とその背景。日本人の美意識と精神性を理解するための鍵となります。
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <h3 className="text-xl font-bold mb-2 text-red-600">伝統</h3>
              <p>
                武士道、歌舞伎、相撲など、日本の誇る伝統とその精神。何世紀にもわたって受け継がれてきた技術と知恵を紹介します。
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <h3 className="text-xl font-bold mb-2 text-red-600">祭り</h3>
              <p>
                祇園祭、ねぶた祭りなど、全国各地の伝統的な祭りとその由来。日本の季節感と地域性を彩る行事を探索します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* お問い合わせセクション */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">お問い合わせ</h2>
          <p className="text-lg mb-6">
            ご質問、ご提案、または日本文化に関するお問い合わせがございましたら、お気軽にご連絡ください。
          </p>
          <Link href="/contact">
            <Button size="lg">お問い合わせフォーム</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
