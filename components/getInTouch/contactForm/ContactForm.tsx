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
        className="bg-[#1b1b1b] rounded-lg shadow-lg p-8 space-y-6"
        noValidate // 🎯 ブラウザのデフォルトバリデーションを無効化
      >
        <FormGroup
          id="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Smith"
          error={validationErrors.name} // 🚀 エラー表示
          required
          showAsterisk={true}
        />
        <FormGroup
          id="email"
          label="Email Address"
          type="email" // 🎯 typeをemailに変更
          value={formData.email}
          onChange={handleChange}
          placeholder="your-email@example.com"
          error={validationErrors.email} // 🚀 エラー表示
          required
          showAsterisk={true}
        />
        <FormGroup
          id="subject"
          label="Subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Enter the subject"
          error={validationErrors.subject} // 🚀 エラー表示
          required
          showAsterisk={true}
        />
        <div>
          <label htmlFor="message" className="block text-md font-medium mb-2">
            Message<span className="text-red-600">*</span>
          </label>
          <Textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            placeholder="Please enter your message (minimum 10 characters)"
            className={`resize-none ${
              validationErrors.message
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
            required
          />
          {/* 🚀 メッセージ用エラー表示 */}
          {validationErrors.message && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.message}
            </p>
          )}
        </div>

        {feedback.visible && (
          <div
            className={`mb-6 p-4 rounded-md ${
              feedback.success
                ? "bg-cyan-100 border-l-4 border-cyan-600 text-cyan-800"
                : "bg-[#f6bfbc] border-l-4 border-[#df7163] text-[#a22041]"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="
          font-normal
          border border-[#df7163] bg-[#df7163] text-white
          hover:bg-white hover:text-[#df7163] hover:border-[#df7163] hover:font-bold
          shadow hover:shadow-lg
          whitespace-nowrap
          w-full
          px-6
          disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSubmitting ? "Sending..." : "Send　≫"}
        </Button>

        {/* 🎯 フォーム説明 */}
        <p className="text-sm text-gray-400 text-center">
          All fields marked with <span className="text-red-600">*</span> are
          required. Please ensure your email address is valid.
        </p>
      </form>
    </div>
  );
}
