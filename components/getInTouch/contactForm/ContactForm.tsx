"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { FormGroup } from "./formGroup/FormGroup";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormData, Feedback } from "@/types/types";

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({
    visible: false,
    success: true,
    message: "",
  });

  // 🚀 バリデーションエラー状態の追加
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 🎯 リアルタイムバリデーション（入力時にエラーをクリア）
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // 🎯 メールアドレスのリアルタイムバリデーション
    if (name === "email" && value.trim()) {
      const emailValid = validateEmail(value);
      if (!emailValid) {
        setValidationErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
      }
    }
  };

  // 🚀 メールアドレス検証関数
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // 🚀 フォーム全体のバリデーション関数
  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    // 名前の検証
    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // メールアドレスの検証
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address (example@domain.com)";
      isValid = false;
    }

    // 件名の検証
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
      isValid = false;
    } else if (formData.subject.trim().length < 3) {
      errors.subject = "Subject must be at least 3 characters";
      isValid = false;
    }

    // メッセージの検証
    if (!formData.message.trim()) {
      errors.message = "Message is required";
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // 🚀 改善されたhandleSubmit関数
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 🎯 フォームバリデーション実行
    if (!validateForm()) {
      setFeedback({
        visible: true,
        success: false,
        message: "Please correct the errors below and try again.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ visible: false, success: true, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          // 🎯 データをトリムして送信
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      // レスポンスの詳細をコンソールに記録（デバッグ用）
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Array.from(response.headers.entries()).reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as Record<string, string>)
      );

      let data;
      try {
        // レスポンスボディをJSONとして解析
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        // レスポンスボディをテキストとして取得
        const textData = await response.text();
        console.log("Response text:", textData);
        throw new Error(`Failed to parse response as JSON: ${textData}`);
      }

      console.log("Response data:", data);

      if (data.success) {
        setFeedback({
          visible: true,
          success: true,
          message: "Thank you! Your message has been successfully sent.",
        });
        // 🎯 成功時にフォームとエラーをリセット
        setFormData({ name: "", email: "", subject: "", message: "" });
        setValidationErrors({});
      } else {
        setFeedback({
          visible: true,
          success: false,
          message:
            data.message ||
            "Failed to send your message. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setFeedback({
        visible: true,
        success: false,
        message:
          error instanceof Error
            ? `Error: ${error.message}`
            : "An error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="max-w-2xl mx-auto">
    <form
      onSubmit={handleSubmit}
      noValidate
      className="
        rounded-2xl
        shadow-lg
        p-6 md:p-8
        space-y-6
        text-white
      "
    >
      <FormGroup
        id="name"
        label="Name"
        value={formData.name}
        onChange={handleChange}
        placeholder="John Smith"
        error={validationErrors.name}
        required
        showAsterisk={true}
        // ↓ FormGroup側が className を受け取れるなら入れたい（受け取れないなら無視OK）
        // labelClassName="text-white/90"
        // inputClassName="bg-black/20 ring-1 ring-white/10 text-white placeholder:text-white/40 focus:ring-white/20"
      />

      <FormGroup
        id="email"
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="your-email@example.com"
        error={validationErrors.email}
        required
        showAsterisk={true}
      />

      <FormGroup
        id="subject"
        label="Subject"
        value={formData.subject}
        onChange={handleChange}
        placeholder="Enter the subject"
        error={validationErrors.subject}
        required
        showAsterisk={true}
      />

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2 text-white/90">
          Message<span className="text-[#df7163]">*</span>
        </label>

        <Textarea
          id="message"
          name="message"
          rows={6}
          value={formData.message}
          onChange={handleChange}
          placeholder="Please enter your message (minimum 10 characters)"
          className={[
            "resize-none",
            "bg-black/20 text-white placeholder:text-white/40",
            "ring-1 ring-white/10",
            "focus-visible:ring-2 focus-visible:ring-white/20",
            "rounded-lg",
            validationErrors.message
              ? "ring-[#df7163]/60 focus-visible:ring-[#df7163]/70"
              : "",
          ].join(" ")}
          required
        />

        {validationErrors.message && (
          <p className="mt-1 text-sm text-[#df7163]">
            {validationErrors.message}
          </p>
        )}
      </div>

      {feedback.visible && (
        <div
          className={[
            "rounded-xl p-4 text-sm ring-1",
            feedback.success
              ? "bg-emerald-500/10 text-emerald-200 ring-emerald-400/20"
              : "bg-[#df7163]/10 text-[#ffd1cb] ring-[#df7163]/25",
          ].join(" ")}
        >
          {feedback.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full
          rounded-xl
          bg-[#df7163] text-white
          hover:bg-[#d85f52]
          active:bg-[#c95549]
          shadow
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {isSubmitting ? "Sending..." : "Send →"}
      </Button>

      <p className="text-xs md:text-sm text-white/60 text-center">
        All fields marked with <span className="text-[#df7163]">*</span> are required.
        Please ensure your email address is valid.
      </p>
    </form>
  </div>
);
}