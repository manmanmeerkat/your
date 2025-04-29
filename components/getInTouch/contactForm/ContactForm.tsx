"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { FormGroup } from "./formGroup/FormGroup";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormData, Feedback } from "@/types/types";
import Image from "next/image";
import { SNS_LINKS } from "@/constants/constants";
import Link from "next/link";

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

    const validateEmail = (email: string) => {
        if (!email) return "Email Address is required.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? "" : "Please enter a valid email address.";
      };

    const newErrors = {
        name: formData.name ? "" : "Name is required.",
        email: validateEmail(formData.email),
        subject: formData.subject ? "" : "Subject is required.",
        message: formData.message ? "" : "Message is required.",
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
    } catch (error) {
      setFeedback({
        visible: true,
        success: false,
        message: "Failed to send your message. Please try again later.",
      });
      setIsSubmitting(false);
    }
  };

  const filteredSNSLinks = SNS_LINKS.filter((sns) => sns.img !== "/images/icon/x-white.png");

  return (
    <div className="max-w-2xl mx-auto">
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

      <form onSubmit={handleSubmit} className="bg-slate-800/40 rounded-lg shadow-lg p-8 space-y-6 text-white">
        <FormGroup
          id="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Smith"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        <FormGroup
            id="email"
            label="Email Address"
            type="text"
            value={formData.email}
            onChange={handleChange}
            placeholder="your-email@example.com"
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        <FormGroup
          id="subject"
          label="Subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Enter the subject"
        />
        {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
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