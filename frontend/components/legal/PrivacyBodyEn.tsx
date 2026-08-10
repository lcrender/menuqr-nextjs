import Link from 'next/link';

type PrivacyBodyProps = {
  preciosHref: string;
};

export default function PrivacyBodyEn({ preciosHref }: PrivacyBodyProps) {
  return (
    <>
      <p>
        This Privacy Policy describes how <strong>App Menu QR</strong> collects, uses and protects the information of
        users who use the platform available at <strong>appmenuqr.com</strong> (hereinafter, “the Platform”).
      </p>
      <p>By using the Platform, the user accepts the practices described in this policy.</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>1. Data Controller</h2>
      <p>The controller of personal data processing is:</p>
      <p style={{ marginBottom: 0 }}>Alejandro Chazarreta</p>
      <p style={{ marginBottom: 0 }}>Tax ID (CUIT): 20-31832578-3</p>
      <p style={{ marginBottom: 0 }}>City: Buenos Aires, Argentina</p>
      <p>
        Contact form: <Link href="/contacto?from=privacidad">Open form</Link>
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>2. Information We Collect</h2>
      <p>
        The Platform may collect information provided by users when registering or using the service. This information
        may include:
      </p>
      <ul>
        <li>user name</li>
        <li>email address</li>
        <li>business or restaurant information</li>
        <li>content uploaded to the platform (menus, products, descriptions, images, etc.)</li>
      </ul>
      <p>We may also collect basic technical information such as:</p>
      <ul>
        <li>IP address</li>
        <li>browser type</li>
        <li>service usage information</li>
      </ul>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>3. Use of Information</h2>
      <p>Collected information may be used to:</p>
      <ul>
        <li>provide and maintain Platform operation</li>
        <li>allow users to create and manage their digital menus</li>
        <li>manage user accounts</li>
        <li>provide technical support</li>
        <li>improve the service</li>
        <li>send communications related to service operation</li>
      </ul>
      <p>
        If the user agrees, they may also receive informational or promotional communications by email.
      </p>
      <p style={{ marginTop: '16px' }}>
        The number of restaurants, menus and products each account can manage depends on the subscribed plan. Current
        limits and pricing are published on the Platform&apos;s <Link href={preciosHref}>pricing page</Link>.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>4. Third-Party Services</h2>
      <p>The Platform may use third-party services for its operation, including:</p>
      <ul>
        <li>MercadoPago for payment processing</li>
        <li>hosting or infrastructure providers</li>
        <li>email services</li>
      </ul>
      <p>
        These providers may process information necessary to provide their services in accordance with their own privacy
        policies.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>5. Data Retention</h2>
      <p>Personal data will be retained for as long as necessary to:</p>
      <ul>
        <li>provide the service</li>
        <li>comply with legal obligations</li>
        <li>resolve potential disputes</li>
      </ul>
      <p>Users may request deletion of their account and personal data at any time.</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>6. User Rights</h2>
      <p>
        Under Law 25.326 on Personal Data Protection of the Argentine Republic, users have the right to:
      </p>
      <ul>
        <li>access their personal data</li>
        <li>request updating or correction of data</li>
        <li>request deletion of their data</li>
      </ul>
      <p>
        Requests may be submitted via the{' '}
        <Link href="/contacto?from=privacidad">
          <strong>contact form</strong>
        </Link>
        .
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>7. Information Security</h2>
      <p>
        The Platform adopts reasonable technical and organizational measures to protect user information against
        unauthorized access, loss or alteration.
      </p>
      <p>
        However, no data transmission or storage system on the Internet can guarantee absolute security.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>8. Changes to this Policy</h2>
      <p>
        The Platform owner may modify this Privacy Policy at any time. Changes will be published on the website and
        shall take effect upon publication.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>9. Contact</h2>
      <p>For inquiries related to this Privacy Policy or personal data processing:</p>
      <p style={{ marginBottom: 0 }}>
        Form: <Link href="/contacto?from=privacidad">Open contact form</Link>
      </p>
    </>
  );
}
