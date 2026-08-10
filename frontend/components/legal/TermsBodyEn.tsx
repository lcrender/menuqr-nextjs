import Link from 'next/link';

type TermsBodyProps = {
  preciosHref: string;
};

export default function TermsBodyEn({ preciosHref }: TermsBodyProps) {
  return (
    <>
      <p>
        Welcome to <strong>App Menu QR</strong>. These Terms and Conditions govern access to and use of the platform
        available at <strong>appmenuqr.com</strong> (hereinafter, “the Platform”).
      </p>
      <p>By registering or using the Platform, the user accepts these Terms and Conditions.</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>1. Information about the Operator</h2>
      <p>The Platform is operated by:</p>
      <p style={{ marginBottom: 0 }}>Alejandro Chazarreta</p>
      <p style={{ marginBottom: 0 }}>Tax ID (CUIT): 20-31832578-3</p>
      <p style={{ marginBottom: 0 }}>City: Buenos Aires, Argentina</p>
      <p>
        Contact form: <Link href="/contacto?from=terminos">Open form</Link>
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>2. Description of the Service</h2>
      <p>
        The Platform is a digital service that allows users to create and manage digital menus accessible via QR codes.
      </p>
      <p>Users may create menu pages that include information such as:</p>
      <ul>
        <li>restaurant or business name</li>
        <li>logo</li>
        <li>description</li>
        <li>menu sections</li>
        <li>products</li>
        <li>product variants</li>
      </ul>
      <p>
        The Platform may be used by food service businesses or other businesses that need to display products or
        services through a digital menu.
      </p>
      <p>
        The Platform is solely a technological tool for displaying information. The Platform owner does not participate in
        the sale, preparation, delivery or marketing of products or services offered by users.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>3. Registration and User Account</h2>
      <p>To use certain Platform features, you must create an account. The user agrees to:</p>
      <ul>
        <li>provide truthful and up-to-date information</li>
        <li>keep access credentials confidential</li>
        <li>be responsible for all activities performed from their account</li>
      </ul>
      <p>
        The Platform owner shall not be liable for unauthorized access resulting from user negligence.
      </p>
      <h3 style={{ fontSize: '1rem', marginTop: '12px' }}>Minimum age</h3>
      <p>
        To use the Platform and subscribe to paid plans, the user must be at least 18 years old or have sufficient legal
        capacity to contract under applicable law.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>4. Service Plans</h2>
      <p>
        The Platform offers a free plan and paid subscription plans (for example Starter and Pro), with different usage
        limits and features.
      </p>
      <p className="mb-2">
        Restaurant, menu and product quotas, as well as the use of photos on products and advanced templates, depend on
        the subscribed plan. See current limits and pricing on the Platform&apos;s{' '}
        <Link href={preciosHref}>pricing page</Link>.
      </p>
      <p>
        Additional commercial or marketing features (for example languages, support, specific templates) are described on
        the Platform&apos;s main page and may be updated without affecting the numeric quotas above.
      </p>
      <p>
        Plan features may change in the future; the configuration published on the Platform shall prevail.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>5. Payments and Subscriptions</h2>
      <p>
        Paid plans (for example Starter and Pro) are purchased through monthly or annual subscriptions, depending on the
        options available in the account.
      </p>
      <p>
        Payments may be processed through authorized providers (for example MercadoPago or PayPal, depending on region and
        configuration).
      </p>
      <p>By subscribing to a paid plan, the user accepts that:</p>
      <ul>
        <li>the subscription may renew automatically</li>
        <li>
          charges will be handled by the corresponding payment provider (for example MercadoPago or PayPal, depending
          on region)
        </li>
        <li>payment terms are also subject to that provider&apos;s terms and policies.</li>
      </ul>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>6. Cancellations and Refunds</h2>
      <p>Users may cancel their subscription at any time.</p>
      <p>
        If requested, they may request a refund within the same month as the payment made. Requests must be submitted
        via the contact email.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>7. User Content</h2>
      <p>Users may upload content to the Platform, including:</p>
      <ul>
        <li>restaurant names</li>
        <li>logos</li>
        <li>descriptions</li>
        <li>menus</li>
        <li>menu sections</li>
        <li>products</li>
        <li>product variants</li>
      </ul>
      <p>The user is solely responsible for the content they publish on the Platform.</p>
      <p>The Platform owner is not responsible for:</p>
      <ul>
        <li>errors in prices or information</li>
        <li>incorrect content</li>
        <li>content that infringes third-party rights</li>
      </ul>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>8. Indemnification</h2>
      <p>
        The user agrees to indemnify and hold harmless the Platform owner from any claim, damage, loss, liability or
        expense (including legal fees) arising from:
      </p>
      <ul>
        <li>content published by the user</li>
        <li>misuse of the Platform</li>
        <li>violation of these Terms and Conditions</li>
        <li>infringement of third-party rights</li>
      </ul>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>9. Permitted Use of the Platform</h2>
      <p>Users agree not to use the Platform to:</p>
      <ul>
        <li>publish illegal content</li>
        <li>infringe intellectual property rights</li>
        <li>distribute malware or malicious software</li>
        <li>carry out fraudulent activities</li>
      </ul>
      <p>The Platform reserves the right to suspend or delete accounts that breach these rules.</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>10. Account Suspension or Cancellation</h2>
      <p>The Platform owner may suspend or cancel accounts when:</p>
      <ul>
        <li>misuse is detected</li>
        <li>these terms are breached</li>
        <li>the service is used for illegal activities</li>
      </ul>
      <p>In serious cases, suspension may occur without prior notice.</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>11. Intellectual Property</h2>
      <p>
        The design, operation, software and content of the Platform are the property of its owner or respective
        licensors.
      </p>
      <p>
        Copying, modifying or distributing the Platform software without authorization is prohibited.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>12. Limitation of Liability</h2>
      <p>The Platform is provided “as is”, without warranties of continuous availability.</p>
      <p>The owner does not guarantee that:</p>
      <ul>
        <li>the service will operate without interruptions</li>
        <li>the system is free of errors</li>
        <li>the platform is available at all times</li>
      </ul>
      <p>In no event shall the owner be liable for indirect damages arising from use of the Platform.</p>
      <p>
        In any case, the total liability of the Platform owner to the user shall not exceed the amount paid by the user
        to the Platform during the last 12 months.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>13. Service Modifications</h2>
      <p>The Platform may:</p>
      <ul>
        <li>modify features</li>
        <li>update characteristics</li>
        <li>modify these terms</li>
      </ul>
      <p>Changes may be published on the website and shall take effect upon publication.</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>14. Applicable Law</h2>
      <p>
        These terms are governed by the laws of the Argentine Republic. In the event of any dispute, the parties submit
        to the jurisdiction of the competent courts.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>15. Contact</h2>
      <p>For inquiries related to these terms:</p>
      <p style={{ marginBottom: 0 }}>
        Form: <Link href="/contacto?from=terminos">Open contact form</Link>
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>16. Service Availability</h2>
      <p>
        The Platform makes reasonable efforts to keep the service available and functioning properly. However, the
        service may be temporarily interrupted due to:
      </p>
      <ul>
        <li>system maintenance</li>
        <li>software updates</li>
        <li>technical failures</li>
        <li>third-party service issues</li>
        <li>causes beyond the owner&apos;s control</li>
      </ul>
      <p>The Platform owner does not guarantee continuous or uninterrupted service availability.</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>17. Backups and Data</h2>
      <p>
        The Platform may perform periodic backups to protect stored information.
      </p>
      <p>However, the user acknowledges that:</p>
      <ul>
        <li>they are responsible for keeping a copy of their important information</li>
        <li>
          the Platform owner does not guarantee full data recovery in case of technical failures, system errors or
          unforeseen events
        </li>
      </ul>
      <p>
        In no event shall the owner be liable for data loss, service interruptions or damages arising from use of the
        Platform.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>18. Third-Party Services</h2>
      <p>
        The Platform may integrate with or depend on third-party services for its operation, including but not limited
        to:
      </p>
      <ul>
        <li>MercadoPago for payment processing</li>
        <li>hosting or infrastructure providers</li>
        <li>email services</li>
      </ul>
      <p>
        The Platform owner is not responsible for failures, interruptions or issues arising from such external services.
      </p>
    </>
  );
}
