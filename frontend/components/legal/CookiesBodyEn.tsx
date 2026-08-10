import Link from 'next/link';

export default function CookiesBodyEn() {
  return (
    <>
      <p>
        This Cookie Policy explains how <strong>App Menu QR</strong> uses cookies and similar technologies on the website{' '}
        <strong>appmenuqr.com</strong> (hereinafter, “the Platform”).
      </p>
      <p>By using the Platform, the user accepts the use of cookies in accordance with this policy.</p>
      <p className="small text-muted" style={{ marginTop: '12px' }}>
        For service plans, pricing and usage limits (restaurants, menus, products), please refer to the{' '}
        <Link href="/legal/terminos-y-condiciones">Terms and Conditions</Link> and the information published on the
        Platform&apos;s main page; current values are reflected there.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>1. What Are Cookies</h2>
      <p>
        Cookies are small text files stored on the user&apos;s device when visiting a website.
      </p>
      <p>
        Cookies allow the website to function properly and may be used to remember information about the user&apos;s
        browsing.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>2. Cookies We Use</h2>
      <p>The Platform may use the following types of cookies:</p>
      <h3 style={{ fontSize: '1rem', marginTop: '12px' }}>Essential cookies</h3>
      <p>These are necessary for basic website operation and enable functions such as:</p>
      <ul>
        <li>signing in</li>
        <li>maintaining the user session</li>
        <li>ensuring the platform&apos;s technical operation</li>
      </ul>
      <h3 style={{ fontSize: '1rem', marginTop: '12px' }}>Analytics cookies</h3>
      <p>
        These may be used to collect information about how users use the Platform, in order to improve the service.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>3. Third-Party Cookies</h2>
      <p>Some external services used by the Platform may install their own cookies.</p>
      <p>These services may include:</p>
      <ul>
        <li>traffic analytics tools</li>
        <li>infrastructure or hosting services</li>
        <li>technology providers that enable service operation</li>
      </ul>
      <p>
        Each external provider manages its own privacy and cookie policies, which can be consulted on their respective
        websites.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>4. Cookie Management</h2>
      <p>Users may configure their browser to:</p>
      <ul>
        <li>reject cookies</li>
        <li>delete existing cookies</li>
        <li>receive notifications before a cookie is stored</li>
      </ul>
      <p>
        However, disabling some cookies may affect Platform operation or prevent the use of certain features.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>5. Changes to this Policy</h2>
      <p>
        The Platform owner may modify this Cookie Policy at any time. Changes will be published on the website and
        shall take effect upon publication.
      </p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>6. Contact</h2>
      <p>For inquiries related to this Cookie Policy:</p>
      <p style={{ marginBottom: 0 }}>
        Form: <Link href="/contacto?from=cookies">Open contact form</Link>
      </p>
    </>
  );
}
