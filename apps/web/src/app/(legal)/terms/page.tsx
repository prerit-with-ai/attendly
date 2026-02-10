import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Attndly",
  description:
    "Terms and conditions governing the use of Attndly's AI-powered attendance tracking service.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p className="lead">Last updated: February 2026</p>

      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of Attndly&apos;s
        AI-powered attendance tracking platform (&quot;Service&quot;). By using the Service, you
        agree to these Terms.
      </p>

      <h2>1. Service Description</h2>
      <p>
        Attndly provides an AI-powered attendance tracking system that uses existing CCTV cameras
        and facial recognition technology to automate employee attendance recording. The Service
        includes a web dashboard, facial enrollment system, real-time attendance processing, leave
        management, and reporting tools.
      </p>

      <h2>2. Account Registration</h2>
      <p>
        To use the Service, you must create an account and provide accurate, complete information.
        You are responsible for maintaining the security of your account credentials. You must
        notify us immediately of any unauthorized access.
      </p>

      <h2>3. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose</li>
        <li>Attempt to gain unauthorized access to the Service or its systems</li>
        <li>Use the facial recognition system to track individuals without proper authorization</li>
        <li>Upload malicious content or interfere with the Service&apos;s operation</li>
        <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
        <li>Resell or redistribute the Service without authorization</li>
      </ul>

      <h2>4. Organization Responsibilities</h2>
      <p>Organizations using Attndly are responsible for:</p>
      <ul>
        <li>Obtaining proper consent from employees for facial recognition processing</li>
        <li>Complying with applicable privacy and biometric data laws in their jurisdiction</li>
        <li>Ensuring CCTV camera usage complies with local regulations</li>
        <li>Managing employee access and permissions appropriately</li>
        <li>Maintaining accurate employee records within the system</li>
      </ul>

      <h2>5. Data Processing</h2>
      <p>
        By using the Service, you authorize Attndly to process facial images and generate facial
        encodings for attendance verification purposes. Our data handling practices are described in
        our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>6. Service Availability</h2>
      <p>
        We strive to maintain high availability but do not guarantee uninterrupted access. We may
        perform scheduled maintenance with advance notice. We are not liable for downtime caused by
        factors outside our reasonable control.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The Service, including its software, design, and documentation, is owned by Attndly and
        protected by intellectual property laws. Your data remains your property; you grant us a
        limited license to process it as needed to provide the Service.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Attndly shall not be liable for any indirect,
        incidental, special, or consequential damages arising from your use of the Service. Our
        total liability shall not exceed the amount you paid for the Service in the 12 months
        preceding the claim.
      </p>

      <h2>9. Termination</h2>
      <p>
        Either party may terminate this agreement at any time. Upon termination, your access to the
        Service will cease, and we will delete your data in accordance with our Privacy Policy.
        Provisions that by their nature should survive termination will remain in effect.
      </p>

      <h2>10. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. We will notify you of material changes via
        email or through the Service. Continued use after changes constitutes acceptance of the
        updated Terms.
      </p>

      <h2>11. Contact</h2>
      <p>
        For questions about these Terms, contact us at{" "}
        <a href="mailto:legal@attndly.com">legal@attndly.com</a>.
      </p>
    </article>
  );
}
