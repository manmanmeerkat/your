"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ContactCard } from "@/components/getInTouch/contactCard/ContactCard";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    visible: false,
    success: true,
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ visible: false, success: true, message: "" });

    try {
      // 実際の送信処理はここに実装（現在はデモ）
      setTimeout(() => {
        setFeedback({
          visible: true,
          success: true,
          message: "お問い合わせを受け付けました。ありがとうございます。",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
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
      {/* ヒーローヘッダー */}
      <section className="relative bg-slate-900 text-white py-32">
        <Image
          src="/images/category-top/contact.jpg"
          alt="get in touch"
          width={1024}
          height={400}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-black opacity-60 z-0" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Get in Touch</h1>
          <p className="text-xl max-w-2xl mx-auto drop-shadow-md">
            We welcome your questions, suggestions, or any other inquiries. 
            Please use the form below to reach out to us.
          </p>
        </div>
      </section>

      {/* フォームセクション */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
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

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <FormGroup
              id="name"
              label="お名前"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="山田 太郎"
            />
            <FormGroup
              id="email"
              label="メールアドレス"
              required
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your-email@example.com"
            />
            <FormGroup
              id="subject"
              label="件名"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="お問い合わせの件名"
            />
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                メッセージ <span className="text-red-600">*</span>
              </label>
              <Textarea
                id="message"
                name="message"
                rows={6}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="お問い合わせ内容をご記入ください"
                className="resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "送信中..." : "送信する"}
            </Button>
          </form>

          <div className="mt-8 text-sm text-slate-600">
            <h3 className="font-medium mb-2">注意事項:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>通常3営業日以内にご返信いたします。</li>
              <li>個人情報はお問い合わせ対応以外の目的では使用いたしません。</li>
              <li>営業目的と判断される場合、返信いたしかねることがあります。</li>
            </ul>
          </div>
        </div>
      </section>

      {/* その他の連絡方法 */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-6">その他の連絡方法</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactCard
              title="メールで直接連絡"
              content="以下のアドレスに直接メールを送信することもできます："
              detail="info@yoursecretjapan.com"
            />
            <ContactCard
              title="SNSでフォロー"
              content="最新情報やお知らせはSNSでも発信しています："
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// 再利用可能なフォーム入力
function FormGroup({
  id,
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
