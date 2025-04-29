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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ContactForm.tsx の handleSubmit 関数の修正部分
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // バリデーション部分は同じ

    setIsSubmitting(true);
    setFeedback({ visible: false, success: true, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
        setFormData({ name: "", email: "", subject: "", message: "" });
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
        className="bg-slate-800/40 rounded-lg shadow-lg p-8 space-y-6 text-white"
      >
        <FormGroup
          id="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Smith"
        />
        <FormGroup
          id="email"
          label="Email Address"
          type="text"
          value={formData.email}
          onChange={handleChange}
          placeholder="your-email@example.com"
        />
        <FormGroup
          id="subject"
          label="Subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Enter the subject"
        />
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message<span className="text-red-600">*</span>
          </label>
          <Textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            placeholder="Please enter your message"
            className="resize-none"
          />
        </div>

        {feedback.visible && (
          <div
            className={`mb-6 p-4 rounded-md ${
              feedback.success
                ? "bg-cyan-100 border-l-4 border-cyan-600 text-cyan-800"
                : "bg-rose-100 border-l-4 border-rose-600 text-rose-800"
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
          border border-rose-700 bg-rose-700 text-white
          hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
          shadow hover:shadow-lg
          whitespace-nowrap
          w-full
          px-6
          "
        >
          {isSubmitting ? "Sending..." : "Send　≫"}
        </Button>
      </form>
    </div>
  );
}
