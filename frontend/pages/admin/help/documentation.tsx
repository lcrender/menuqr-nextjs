import AdminLayout from '../../../components/AdminLayout';
import { DocumentationContent } from '../../../components/DocumentationContent';

export default function DocumentationPage() {
  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12" style={{ lineHeight: 1.7 }}>
            <DocumentationContent />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
