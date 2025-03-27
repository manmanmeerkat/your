"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // フィードバック状態
  const [feedback, setFeedback] = useState({
    visible: false,
    success: true,
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ visible: false, success: true, message: "" });

    try {
      // ここに実際のフォーム送信処理を実装
      // 例: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });

      // 送信成功時の処理（デモ用）
      setTimeout(() => {
        setFeedback({
          visible: true,
          success: true,
          message: "お問い合わせを受け付けました。ありがとうございます。",
        });

        // フォームをリセット
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });

        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      setFeedback({
        visible: true,
        success: false,
        message: "送信に失敗しました。後ほど再度お試しください。",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* ヘッダーセクション */}
      <section className="relative bg-slate-900 text-white py-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/images/ninja.png"
              alt="日本の伝統"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center" }}
            />
          </div>
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            お問い合わせ
          </h1>
          <p className="text-xl max-w-2xl mx-auto drop-shadow-md">
            ご質問、ご提案、または日本文化に関するお問い合わせがございましたら、以下のフォームよりご連絡ください。
          </p>
        </div>
      </section>

      {/* お問い合わせフォームセクション */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* フィードバックメッセージ */}
          {feedback.visible && (
            <div
              className={`mb-6 p-4 rounded-md ${
                feedback.success
                  ? "bg-green-100 border-l-4 border-green-600 text-green-800"
                  : "bg-red-100 border-l-4 border-red-600 text-red-800"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* 名前 */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    お名前 <span className="text-red-600">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="山田 太郎"
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    メールアドレス <span className="text-red-600">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your-email@example.com"
                  />
                </div>

                {/* 件名 */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                  >
                    件名 <span className="text-red-600">*</span>
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="お問い合わせの件名"
                  />
                </div>

                {/* メッセージ */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    メッセージ <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="お問い合わせ内容をご記入ください"
                    className="resize-none"
                  />
                </div>

                {/* 送信ボタン */}
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "送信中..." : "送信する"}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* 注意事項 */}
          <div className="mt-8 text-sm text-slate-600">
            <h3 className="font-medium mb-2">注意事項:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                お問い合わせいただいた内容には、通常3営業日以内にご返信いたします。
              </li>
              <li>
                ご提供いただいた個人情報は、お問い合わせへの対応以外の目的で使用することはありません。
              </li>
              <li>
                明らかに営業目的と判断されるお問い合わせには返信しない場合がございます。
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 別の連絡方法セクション */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-6">その他の連絡方法</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-2">メールで直接連絡</h3>
              <p className="mb-2">
                以下のアドレスに直接メールを送信することもできます：
              </p>
              <p className="text-red-600">info@yoursecretjapan.com</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-2">SNSでフォロー</h3>
              <p className="mb-2">
                最新情報やお知らせはSNSでも発信しています：
              </p>
              <div className="flex justify-center space-x-4 mt-3">
                <a href="#" className="text-slate-600 hover:text-red-600">
                  Twitter
                </a>
                <a href="#" className="text-slate-600 hover:text-red-600">
                  Instagram
                </a>
                <a href="#" className="text-slate-600 hover:text-red-600">
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
