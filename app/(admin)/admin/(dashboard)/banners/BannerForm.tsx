"use client";

import { useState } from "react";

export function BannerForm({ action }: any) {
  const [image, setImage] = useState("");
  const [type, setType] = useState("matchday");

  return (
    <form action={action} className="space-y-3 bg-[#140a26] p-4 rounded-xl">

      {/* 🔥 TYPE */}
      <select
        name="type"
        className="input"
        required
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="matchday">Matchday</option>
        <option value="leaderboard">Leaderboard</option>
        <option value="faq">FAQ</option>
        <option value="how_it_works">How It Works</option>
        <option value="registration">Registration</option>
      </select>

      {/* 🔥 TITLE */}
          <input
      name="title"
      placeholder="Title (optional)"
      className="input"
      required={type === "registration" }
    />

      {/* 🔥 SUBTITLE */}
      <input name="subtitle" placeholder="Subtitle (optional)" className="input" />

      {/* 🔥 IMAGE (NOT REQUIRED ANYMORE) */}
      <input
        name="image"
        placeholder="Image URL (optional)"
        className="input"
        onChange={(e) => setImage(e.target.value)}
      />

      {/* 🔥 PREVIEW */}
      {image && (
        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-white/5">
          <img
            src={image}
            alt="Banner preview"
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* 🔥 COUNTDOWN (ONLY FOR REGISTRATION) */}
      {type === "registration" && (
        <input
          name="expires_at"
          type="datetime-local"
          className="input"
        />
      )}

      {/* 🔥 BUTTON */}
      <input name="button_text" placeholder="Button Text" className="input" />

      {/* 🔥 LINK */}
      <input name="link" placeholder="Link" className="input" />

      {/* 🔥 SUBMIT */}
      <button className="btn w-full">
        Add Banner
      </button>

    </form>
  );
}