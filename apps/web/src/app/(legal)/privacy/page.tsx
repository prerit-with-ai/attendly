import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Attndly",
  description:
    "How Attndly collects, uses, and protects your personal data including facial recognition data.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="lead">Last updated: February 2026</p>

      <p>
        Attndly (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your
        privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
        information when you use our AI-powered attendance tracking service.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>Account Information</h3>
      <p>
        When you create an account, we collect your name, email address, and password (stored in
        hashed form). If you sign in via Google OAuth, we receive your name and email from Google.
      </p>

      <h3>Employee Data</h3>
      <p>
        Organization administrators may upload employee information including names, email
        addresses, employee IDs, department assignments, and employment details.
      </p>

      <h3>Biometric Data (Facial Recognition)</h3>
      <p>
        Our service processes facial images from CCTV camera feeds to perform attendance tracking.
        We collect and store:
      </p>
      <ul>
        <li>Facial photographs uploaded during enrollment</li>
        <li>Facial encoding vectors (mathematical representations derived from photographs)</li>
        <li>Attendance event timestamps and associated camera/location data</li>
      </ul>
      <p>
        Facial encoding vectors are numerical representations and cannot be reverse-engineered into
        photographs. Raw CCTV frames are processed in real-time and are not permanently stored.
      </p>

      <h3>Usage Data</h3>
      <p>
        We automatically collect certain information when you use the service, including IP
        addresses, browser type, pages visited, and interaction timestamps. We use cookies to
        maintain your session.
      </p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide and maintain the attendance tracking service</li>
        <li>Authenticate users and manage sessions</li>
        <li>Process facial recognition for attendance verification</li>
        <li>Generate attendance reports and analytics</li>
        <li>Send service-related communications (verification emails, password resets)</li>
        <li>Improve and optimize our service</li>
        <li>Detect and prevent fraud or security threats</li>
      </ul>

      <h2>3. Data Storage and Security</h2>
      <p>
        All data is stored on secure, encrypted servers. Facial encodings are stored separately from
        personal identification information. We implement industry-standard security measures
        including:
      </p>
      <ul>
        <li>Encryption in transit (TLS/HTTPS) and at rest</li>
        <li>Role-based access controls</li>
        <li>Regular security audits</li>
        <li>Secure password hashing</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain your data for as long as your organization maintains an active account. Upon
        account deletion or at your request:
      </p>
      <ul>
        <li>Personal data is deleted within 30 days</li>
        <li>Facial encodings and photographs are deleted immediately</li>
        <li>Aggregated, anonymized analytics data may be retained</li>
      </ul>

      <h2>5. Data Sharing</h2>
      <p>We do not sell your personal information. We may share data with:</p>
      <ul>
        <li>Your organization&apos;s administrators (as part of the service)</li>
        <li>Service providers who assist in operating our platform (hosting, email delivery)</li>
        <li>Law enforcement when required by applicable law</li>
      </ul>

      <h2>6. Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Object to data processing</li>
        <li>Data portability</li>
        <li>Withdraw consent for biometric data processing</li>
      </ul>

      <h2>7. Biometric Data Compliance</h2>
      <p>
        We comply with applicable biometric privacy laws including GDPR, BIPA (Illinois), and other
        relevant regulations. Biometric data processing requires explicit consent from the
        individual or authorized organizational consent as applicable under local law.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        For privacy inquiries or to exercise your data rights, contact us at{" "}
        <a href="mailto:privacy@attndly.com">privacy@attndly.com</a>.
      </p>
    </article>
  );
}
