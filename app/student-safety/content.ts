export type SafetyNotice = {
  id: string; title: string; intro: string; category: string;
  publishedAt: string; updatedAt: string; version: string;
  status: "draft" | "published" | "archived"; expiresAt: string | null;
  sections: { heading: string; paragraphs: string[] }[];
  closing: string; links: { label: string; href: string; external: boolean }[];
};

// Departmental procedures are owner-confirmed. No payment amounts or providers are asserted.
export const safetyNotice: SafetyNotice = {
  id: "student-safety", title: "IMPORTANT STUDENT SAFETY NOTICE", category: "Student safety",
  publishedAt: "2026-11-24T00:00:00+01:00", updatedAt: "2026-11-24T00:00:00+01:00",
  version: "2026-11-24.1", status: "published", expiresAt: null,
  intro: "NIPSA UNILESA advises all newly admitted and returning Pharmacology students to remain vigilant against fraudulent accommodation offers, fake registration charges, impersonation and unauthorised payment requests.",
  sections: [
    { heading: "Accommodation", paragraphs: [
      "Beware of accommodation scams. Do not pay booking fees, inspection charges, deposits or reservation fees to an unverified landlord, agent or individual claiming to secure accommodation.",
      "Independently verify accommodation details, the provider’s identity and the payment arrangement before making any financial commitment.",
      "NIPSA does not guarantee accommodation simply because an offer carries its name or circulates within a student community.",
    ] },
    { heading: "Departmental registration and payments", paragraphs: [
      "Pharmacology departmental registration and applicable departmental payments are handled physically at the department.",
      "Students should confirm the relevant procedures, amounts, authorised collection points and receipt arrangements directly with the Department of Pharmacology.",
      "Do not send departmental registration payments to individuals claiming to represent the department without independent confirmation.",
    ] },
    { heading: "University tuition and admission fees", paragraphs: [
      "University tuition, admission and other university-administered fees are separate from departmental procedures. Follow current payment instructions published by the University of Ilesa through its official website and authorised university channels, including official portals where applicable.",
      "NIPSA’s public website does not process departmental academic registration fees, university tuition or admission payments. Separate authorised NIPSA membership-dues and Student Ads transactions are distinct from these academic fees.",
    ] },
    { heading: "Protect your information", paragraphs: [
      "Never disclose passwords, OTPs, student portal credentials or sensitive personal information to unsolicited contacts.",
      "Be cautious of suspicious websites, unofficial payment links and individuals impersonating university staff or NIPSA executives.",
    ] },
    { heading: "Reporting suspicious activity", paragraphs: [
      "If you encounter suspected fraud or misleading departmental information, preserve the relevant messages, URLs and payment instructions, and report the concern through appropriate university or NIPSA contact channels.",
      "Do not publish private information or sensitive evidence in public groups.",
    ] },
  ],
  closing: "Verify before you pay. Protect your information. Stay informed.",
  links: [
    { label: "Official Contacts", href: "/contact", external: false },
    { label: "University of Ilesa Official Website", href: "https://unilesa.edu.ng/", external: true },
  ],
};

export const dismissalKey = "nipsa.student-safety.dismissed-version";
export function noticeIsActive(notice: SafetyNotice, now = Date.now()) {
  const published = Date.parse(notice.publishedAt);
  const expiry = notice.expiresAt === null ? Infinity : Date.parse(notice.expiresAt);
  return notice.status === "published" && Number.isFinite(published) && !Number.isNaN(expiry)
    && published <= now && now < expiry;
}
export function shouldAutoShow(notice: SafetyNotice, dismissed: string | null, now = Date.now()) {
  return noticeIsActive(notice, now) && dismissed !== `${notice.id}:${notice.version}`;
}
