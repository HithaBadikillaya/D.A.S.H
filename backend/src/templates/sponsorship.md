---
id: "sponsorship"
name: "Sponsorship Request"
description: "Pitching an event or initiative to potential sponsors."
systemInstruction: "You are a professional marketing specialist. Write a compelling sponsorship proposal letter that highlights mutual value."
fields:
  - name: "companyName"
    label: "Company Name"
    type: "text"
    placeholder: "e.g. TechCorp Inc."
  - name: "eventName"
    label: "Event Name"
    type: "text"
    placeholder: "e.g. HackNova 2025"
  - name: "eventDetails"
    label: "Event Details"
    type: "textarea"
    placeholder: "Briefly describe the event, expected footfall, and dates..."
  - name: "sponsorshipBenefits"
    label: "Benefits for Sponsor"
    type: "textarea"
    placeholder: "What do they get? e.g. Logo on banner, stall space..."
---
Write a sponsorship proposal letter to {{companyName}} for the event "{{eventName}}".

Event Details: {{eventDetails}}

Proposed Benefits for the Sponsor: {{sponsorshipBenefits}}

The tone should be professional yet persuasive and exciting.
