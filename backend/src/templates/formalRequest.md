---
id: "formal-request"
name: "Formal Request"
description: "Official requests to authorities for permission, funding, or specialized resources."
systemInstruction: "You are an expert at writing formal, professional letters for university settings. Ensure the tone is respectful, concise, and clear."
fields:
  - name: "recipientName"
    label: "Recipient Name"
    type: "text"
    placeholder: "e.g. Dr. Smith"
  - name: "recipientTitle"
    label: "Recipient Title"
    type: "text"
    placeholder: "e.g. Dean of Student Affairs"
  - name: "subject"
    label: "Subject"
    type: "text"
    placeholder: "e.g. Request for Auditorium Booking"
  - name: "purpose"
    label: "Purpose of Request"
    type: "textarea"
    placeholder: "Explain clearly what you are asking for and why..."
---
Write a formal letter to {{recipientName}}, {{recipientTitle}}.
Subject: {{subject}}

The purpose of this letter is: {{purpose}}

Please ensure standard formal letter formatting. Include placeholders for [Date] and [Your Name] if suitable.
