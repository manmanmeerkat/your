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

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
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

    const validateName = (name: string) => {
      if (!name) return "Name is required.";
      if (name.length > 30) return "Name must be 30 characters or less.";
      return "";
    };

    const validateEmail = (email: string) => {
      if (!email) return "Email Address is required.";
      if (email.length > 40)
        return "Email Address must be 40 characters or less.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email)
        ? ""
        : "Please enter a valid email address.";
    };

    const validateSubject = (subject: string) => {
      if (!subject) return "Subject is required.";
      if (subject.length > 50) return "Subject must be 50 characters or less.";
      return "";
    };

    const validateMessage = (message: string) => {
      if (!message) return "Message is required.";
      if (message.length > 1000)
        return "Message must be 1000 characters or less.";
      return "";
    };

    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      subject: validateSubject(formData.subject),
      message: validateMessage(formData.message),
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((msg) => msg !== "");
    if (hasError) {
      return;
    }

    setIsSubmitting(true);
    setFeedback({ visible: false, success: true, message: "" });

    try {
      setTimeout(() => {
        setFeedback({
          visible: true,
          success: true,
          message: "Thank you! Your message has been successfully sent.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSubmitting(false);
      }, 1000);
    } catch {
      setFeedback({
        visible: true,
        success: false,
        message: "Failed to send your message. Please try again later.",
      });
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
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name}</p>
        )}
        <FormGroup
          id="email"
          label="Email Address"
          type="text"
          value={formData.email}
          onChange={handleChange}
          placeholder="your-email@example.com"
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
        )}
        <FormGroup
          id="subject"
          label="Subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Enter the subject"
        />
        {errors.subject && (
          <p className="text-red-600 text-sm mt-1">{errors.subject}</p>
        )}
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
          {errors.message && (
            <p className="text-red-600 text-sm mt-5">{errors.message}</p>
          )}
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
